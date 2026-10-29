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
