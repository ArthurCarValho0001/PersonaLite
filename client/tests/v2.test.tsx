import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { openDB } from 'idb'
import { salvarToken, limparToken } from '../src/api/authToken'
import { enfileirar, listarPendentes, removerPendente, marcarAtencao } from '../src/api/offlineQueue'
import { httpClient } from '../src/api/httpClient'
import { useTreinoSelecionavel } from '../src/hooks/useTreinoSelecionavel'
import type { ExercicioComRegistrosDto, TreinoDoDiaDto } from '../src/types'
const token = (sub: string) => `test.${btoa(JSON.stringify({sub}))}.test`
afterEach(() => { cleanup(); limparToken() })

test('fila conserva titular, chave e fuso; outra conta não lê nem remove a pendência', async () => {
  salvarToken(token('conta-a'))
  const item = await enfileirar('/api/series', {data:'2026-10-27'}, 'Série fictícia', crypto.randomUUID(), 'conta-a', 'America/Sao_Paulo')
  salvarToken(token('conta-b'))
  assert.equal((await listarPendentes()).length, 0)
  await removerPendente(item.id)
  salvarToken(token('conta-a'))
  const [persistido] = await listarPendentes()
  assert.equal(persistido.id, item.id)
  assert.equal(persistido.fuso, 'America/Sao_Paulo')
  await marcarAtencao(item.id)
  assert.equal((await listarPendentes())[0].estado, 'atencao')
  await removerPendente(item.id)
})

test('fila legada sem dono e itens de outro ambiente permanecem isolados', async () => {
  const db = await openDB('personalite-offline', 1)
  await db.put('fila-pendente', {id:'legado',url:'/api/series',corpo:{},criadoEm:'2026-10-27'})
  await db.put('fila-pendente', {id:'outro-ambiente',titular:'conta-a',ambiente:'https://example.invalid',criadoEm:'2026-10-27'})
  salvarToken(token('conta-a'))
  assert.equal((await listarPendentes()).length, 0)
  await removerPendente('legado')
  assert.ok(await db.get('fila-pendente', 'legado'))
  await db.delete('fila-pendente', 'legado'); await db.delete('fila-pendente', 'outro-ambiente'); db.close()
})

test('resposta da série atualiza somente o exercício sem GET adicional', async () => {
  let chamadas = 0
  const exercicio = {exercicioPlanejadoId:'ex-a',nome:'Exercício fictício',seriesRegistradas:[]} as unknown as ExercicioComRegistrosDto
  httpClient.defaults.adapter = async config => {
    chamadas++
    assert.equal(config.params.data,'2026-10-27')
    return {data:{exercicios:[exercicio]} as TreinoDoDiaDto,config,status:200,statusText:'OK',headers:{}}
  }
  const {result} = renderHook(() => useTreinoSelecionavel('2026-10-27'))
  await waitFor(() => assert.equal(result.current.carregando,false))
  act(() => result.current.atualizarExercicio({...exercicio,concluida:true}))
  assert.equal(result.current.treino?.exercicios[0].concluida,true)
  assert.equal(chamadas,1)
})

test('resposta atrasada de outra data não substitui a data selecionada', async () => {
  let liberar!: () => void
  httpClient.defaults.adapter = async config => {
    const antiga = config.params.data === '2026-10-26'
    if (antiga) await new Promise<void>(resolve => {liberar=resolve})
    return {data:{nomeDia:config.params.data,exercicios:[]},config,status:200,statusText:'OK',headers:{}}
  }
  const {result,rerender} = renderHook(({data}) => useTreinoSelecionavel(data),{initialProps:{data:'2026-10-26'}})
  await waitFor(() => assert.ok(liberar))
  rerender({data:'2026-10-27'})
  await waitFor(() => assert.equal(result.current.treino?.nomeDia,'2026-10-27'))
  await act(async () => liberar())
  assert.equal(result.current.treino?.nomeDia,'2026-10-27')
})

test('avaliação mantém respostas só em memória, bloqueia saída e repete a mesma chave após falha', async () => {
  const { render, screen, fireEvent } = await import('@testing-library/react')
  const { createMemoryRouter, RouterProvider } = await import('react-router-dom')
  const { AvaliacaoAprender } = await import('../src/pages/Aprender')
  const { AxiosError } = await import('axios')
  const chaves: unknown[] = []
  const questoes = Array.from({length:5},(_,i)=>({id:`q${i}`,enunciado:`Questão ${i}`,alternativas:['a','b','c','d'].map(id=>({id,texto:`${i}-${id}`}))}))
  httpClient.defaults.adapter = async config => {
    if (config.method === 'post') {
      chaves.push(config.headers['Idempotency-Key'])
      if(chaves.length === 1) throw new AxiosError('Falha simulada','ERR_NETWORK',config)
      return {data:{id:'tentativa',nota:100,aprovada:true},config,status:200,statusText:'OK',headers:{}}
    }
    return {data:config.url?.includes('questionario') ? {titulo:'Módulo fictício',versao:1,questoes} : {id:'tentativa',nota:100,aprovada:true},config,status:200,statusText:'OK',headers:{}}
  }
  const router=createMemoryRouter([{path:'/aprender/:id/avaliacao',element:<AvaliacaoAprender/>},{path:'/aprender/:id',element:<p>Outra página</p>}],{initialEntries:['/aprender/modulo/avaliacao']})
  render(<RouterProvider router={router}/>)
  await screen.findByRole('button',{name:'Enviar avaliação'})
  for(let i=0;i<5;i++)fireEvent.click(screen.getByRole('radio',{name:`${i}-a`}))
  fireEvent.click(screen.getByRole('link',{name:'← Voltar ao módulo'}))
  await screen.findByRole('alertdialog')
  fireEvent.click(screen.getByRole('button',{name:'Continuar respondendo'}))
  fireEvent.click(screen.getByRole('button',{name:'Enviar avaliação'}))
  await screen.findByRole('button',{name:'Repetir envio com segurança'})
  assert.equal((screen.getByRole('radio',{name:'0-a'}).closest('fieldset') as HTMLFieldSetElement).disabled,true)
  fireEvent.click(screen.getByRole('button',{name:'Repetir envio com segurança'}))
  await screen.findByRole('heading',{name:'Módulo concluído!'})
  assert.equal(chaves.length,2); assert.equal(chaves[0],chaves[1])
  assert.equal(sessionStorage.length,0); assert.equal(localStorage.length,0)
})

test('prévia fictícia de Aprender continua visível quando o catálogo falha', async () => {
  const { render, screen } = await import('@testing-library/react')
  const { MemoryRouter } = await import('react-router-dom')
  const { Aprender } = await import('../src/pages/Aprender')
  const { AxiosError } = await import('axios')
  httpClient.defaults.adapter = async config => { throw new AxiosError('Catálogo indisponível', 'ERR_BAD_RESPONSE', config) }
  render(<MemoryRouter><Aprender /></MemoryRouter>)
  await screen.findByRole('alert')
  assert.ok(screen.getByRole('heading', { name: 'Um pouco do que você vai encontrar' }))
  assert.equal(screen.getAllByText('Conteúdo fictício de demonstração').length, 3)
})

test('bloco Último treino alterna conteúdo pelo botão', async () => {
  const { render, screen, fireEvent } = await import('@testing-library/react')
  const { SerieRegistro } = await import('../src/components/SerieRegistro')
  render(<SerieRegistro exercicioPlanejadoId="ficticio" sessaoExercicioId={null} data="2026-10-29" seriesRegistradas={[]} seriesAlvo={3} repeticoesAlvo={10} ultimoTreino={null} onSerieRegistrada={() => {}} onNovaSerie={() => {}} />)
  const cabecalho = screen.getByRole('button', { name: 'Último treino' })
  assert.equal(cabecalho.getAttribute('aria-expanded'), 'true')
  assert.ok(screen.getByText(/primeiro registro neste exercício/))
  fireEvent.click(cabecalho)
  assert.equal(cabecalho.getAttribute('aria-expanded'), 'false')
  assert.equal(screen.queryByText(/primeiro registro neste exercício/), null)
})

test('protótipo de Aprender funciona sem chamar a API: aulas, avaliação, idempotência e histórico', async () => {
  const proto = await import('../src/api/aprenderApi')
  let chamadas = 0
  httpClient.defaults.adapter = async config => { chamadas++; throw new Error(`Rede não deveria ser usada: ${config.url}`) }
  const anterior = (globalThis as { __APRENDER_API__?: boolean }).__APRENDER_API__
  ;(globalThis as { __APRENDER_API__?: boolean }).__APRENDER_API__ = false
  salvarToken(token('conta-prototipo'))
  try {
    const modulos = await proto.catalogo()
    assert.equal(modulos.length, 3)
    assert.ok(modulos.every(m => m.demonstracao && m.aulasEstudadas === 0 && m.melhorNota === null))
    const id = modulos[0].id
    await assert.rejects(proto.questionario(id), (e: any) => /Estude as duas aulas/.test(e.response.data.mensagem))
    assert.equal((await proto.detalheModulo(id)).avaliacaoLiberada, false)
    for (const aula of (await proto.detalheModulo(id)).aulas) await proto.estudar(id, aula.id)
    assert.equal((await proto.detalheModulo(id)).avaliacaoLiberada, true)
    const q = await proto.questionario(id)
    assert.equal(q.questoes.length, 5)
    assert.ok(q.questoes.every(x => x.alternativas.length === 4))
    const erradas = Object.fromEntries(q.questoes.map(x => [x.id, x.alternativas[0].id]))
    const primeira = await proto.avaliar(id, erradas, crypto.randomUUID())
    const corretas = Object.fromEntries((primeira.explicacoes ?? []).map(x => [x.id, x.correta]))
    const chave = crypto.randomUUID()
    const segunda = await proto.avaliar(id, corretas, chave)
    assert.equal(segunda.nota, 100); assert.equal(segunda.aprovada, true)
    assert.equal((await proto.avaliar(id, corretas, chave)).id, segunda.id)
    assert.equal((await proto.historicoAprender())[0].tentativas.length, 2)
    assert.equal((await proto.catalogo())[0].versaoConcluida, 1)
    assert.equal((await proto.resultado(segunda.id)).nota, 100)
    salvarToken(token('outra-conta'))
    assert.equal((await proto.historicoAprender()).length, 0)
    assert.equal(chamadas, 0)
  } finally {
    ;(globalThis as { __APRENDER_API__?: boolean }).__APRENDER_API__ = anterior
    localStorage.clear()
  }
})

test('Avatar não chama /api/usuario/avatar/arquivo por padrão e mostra as iniciais', async () => {
  const { render, screen } = await import('@testing-library/react')
  const { Avatar } = await import('../src/components/Avatar')
  let chamadas = 0
  httpClient.defaults.adapter = async config => { chamadas++; return {data:new Blob(),config,status:404,statusText:'Not Found',headers:{}} }
  render(<Avatar nome="Arthur Carvalho" avatarUrl="fotos-progresso/x.png" />)
  await new Promise(r => setTimeout(r, 20))
  assert.equal(chamadas, 0)
  assert.ok(screen.getByText('AC'))
})

test('layout não exibe o rótulo "V2 · LOCAL" nem o cartão da folha', async () => {
  const { render, screen } = await import('@testing-library/react')
  const { MemoryRouter } = await import('react-router-dom')
  const { AppLayout } = await import('../src/components/AppLayout')
  const { UsuarioContext } = await import('../src/hooks/useUsuario')
  const valor = { usuario: { nome: 'Arthur' } as never, carregando: false, erro: null, autenticado: true, recarregar: () => {} }
  const { container } = render(<UsuarioContext.Provider value={valor}><MemoryRouter><AppLayout><p>Conteúdo</p></AppLayout></MemoryRouter></UsuarioContext.Provider>)
  assert.equal(screen.queryByText(/V2 · LOCAL/i), null)
  assert.equal(screen.queryByText(/aprender todos os dias/i), null)
  assert.equal(container.querySelector('.v2-sidebar-note'), null)
  assert.ok(screen.getByText('Bem-estar em movimento'))
})
