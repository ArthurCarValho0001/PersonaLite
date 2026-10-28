import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import App from '../src/App'
import { UsuarioProvider } from '../src/components/UsuarioProvider'
import { useUsuario } from '../src/hooks/useUsuario'
import { httpClient } from '../src/api/httpClient'
import { obterToken, salvarToken } from '../src/api/authToken'
import type { UsuarioDto } from '../src/types'

const usuario: UsuarioDto = {
  id: 'local-id', nome: 'Pessoa Teste', nomeUsuario: 'pessoa_teste', sexo: 'Masculino',
  dataNascimento: '1995-01-01', alturaCm: 175, tempoDescansoSegundos: 90,
  email: 'pessoa@example.invalid', emailVerificado: false, avatarUrl: null, metas: null,
}
let calls: { method?: string; url?: string }[]
let loadUser: (config: InternalAxiosRequestConfig) => Promise<UsuarioDto | null>
let authError: boolean
function resposta(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
  return { data, status, statusText: String(status), headers: {}, config }
}
function unauthorized(config: InternalAxiosRequestConfig) {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, resposta(config, null, 401))
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((a, b) => { resolve = a; reject = b })
  return { promise, resolve, reject }
}
function mount(path = '/login', strict = false) {
  const tree = <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree)
}
function userGets() { return calls.filter(c => c.method === 'get' && c.url === '/api/usuario').length }
async function login() {
  fireEvent.change(screen.getByLabelText('Nome de usuário'), { target: { value: 'pessoa_teste' } })
  fireEvent.change(screen.getByLabelText('Senha', { exact: true }), { target: { value: 'senha-ficticia' } })
  fireEvent.click(screen.getByRole('button', { name: 'Entrar', exact: true }))
}
async function dashboard() {
  await screen.findByRole('heading', { name: 'Olá, Pessoa Teste' })
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  calls = []
  authError = false
  loadUser = async () => usuario
  httpClient.defaults.adapter = async config => {
    calls.push({ method: config.method, url: config.url })
    if (config.url === '/api/usuario') return resposta(config, await loadUser(config))
    if (config.url?.startsWith('/api/auth/')) {
      if (authError) throw unauthorized(config)
      return resposta(config, { token: 'token-local', usuarioId: usuario.id, nome: usuario.nome })
    }
    if (config.url === '/api/medidas') return resposta(config, [])
    if (config.url === '/api/treino-do-dia')
      return resposta(config, { temTreinoHoje: false, diaSemana: 'Monday', exercicios: [] })
    return resposta(config, null)
  }
})
afterEach(async () => {
  cleanup()
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
})

test('login navega sem documento novo e carrega usuário uma vez, inclusive em StrictMode', async () => {
  const originalDocument = document
  mount('/login', true)
  await login()
  await dashboard()
  assert.equal(document, originalDocument)
  assert.equal(obterToken(), 'token-local')
  assert.deepEqual(Object.keys(localStorage), ['personalite_token'])
  assert.equal(sessionStorage.length, 0)
  assert.equal(userGets(), 1)
  fireEvent.click(screen.getByRole('link', { name: 'Treinos', exact: true }))
  await screen.findByRole('heading', { name: 'Treino', exact: true })
  assert.equal(userGets(), 1)
})

test('cadastro mantém sessão e navega para o Dashboard com um GET de usuário', async () => {
  mount('/registrar')
  for (const [label, value] of [
    ['Nome', 'Pessoa Teste'], ['Nome de usuário', 'pessoa_teste'], ['E-mail', 'pessoa@example.invalid'],
    ['Senha', 'senha-ficticia'], ['Confirmar senha', 'senha-ficticia'],
    ['Data de nascimento', '1995-01-01'], ['Altura (cm)', '175'],
  ]) fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: 'Masculino', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: 'Criar conta', exact: true }))
  await dashboard()
  assert.equal(calls.filter(c => c.url === '/api/auth/registrar').length, 1)
  assert.equal(userGets(), 1)
})

test('login inválido mantém formulário e não busca usuário', async () => {
  authError = true
  mount()
  await login()
  await screen.findByText('Usuário ou senha inválidos.')
  assert.equal(obterToken(), null)
  assert.equal(userGets(), 0)
})

test('rota protegida sem sessão vai ao login sem consultar usuário', async () => {
  mount('/treinos')
  await screen.findByRole('heading', { name: 'Entrar no PersonaLite' })
  assert.equal(userGets(), 0)
})

test('sessão restaurada carrega uma vez e logout remove dados privados', async () => {
  salvarToken('restaurado')
  mount('/', true)
  await dashboard()
  fireEvent.click(screen.getByRole('link', { name: /Olá, Pessoa Teste/ }))
  await screen.findByRole('heading', { name: 'Pessoa Teste' })
  assert.equal(userGets(), 1)
  fireEvent.click(screen.getByRole('button', { name: 'Sair da conta', exact: true }))
  await screen.findByRole('heading', { name: 'Entrar no PersonaLite' })
  assert.equal(obterToken(), null)
  assert.equal(screen.queryByText('Pessoa Teste'), null)
  assert.deepEqual(Object.keys(localStorage), [])
})

test('401 no bootstrap encerra sessão sem loop ou conteúdo protegido', async () => {
  salvarToken('expirado')
  loadUser = async config => { throw unauthorized(config) }
  mount('/treinos')
  await screen.findByRole('heading', { name: 'Entrar no PersonaLite' })
  assert.equal(obterToken(), null)
  assert.equal(userGets(), 1)
})

test('erro no bootstrap permite tentar novamente sem repetir autenticação', async () => {
  salvarToken('token-local')
  loadUser = async () => { throw new Error('offline') }
  mount('/')
  await screen.findByRole('alert')
  assert.equal(screen.queryByRole('link', { name: 'Treinos' }), null)
  loadUser = async () => usuario
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await dashboard()
  assert.equal(userGets(), 2)
  assert.equal(calls.filter(c => c.url?.startsWith('/api/auth/')).length, 0)
})

test('pode sair durante bootstrap e a resposta atrasada não restaura a sessão', async () => {
  const pedido = deferred<UsuarioDto>()
  salvarToken('token-local')
  loadUser = () => pedido.promise
  mount('/')
  await screen.findByRole('status')
  fireEvent.click(screen.getByRole('button', { name: 'Sair da conta', exact: true }))
  await screen.findByRole('heading', { name: 'Criar conta no PersonaLite' })
  await act(async () => pedido.resolve(usuario))
  assert.equal(obterToken(), null)
  assert.equal(screen.queryByText('Olá, Pessoa Teste'), null)
})

test('revalidação compartilha usuário novo sem desmontar tela já utilizável', async () => {
  function Consumidor() {
    const { usuario: atual, recarregar, carregando, erro } = useUsuario()
    return <><p>{atual?.nome}</p><button onClick={recarregar}>Atualizar</button>
      {carregando && <span>Atualizando</span>}{erro && <span role="alert">{erro}</span>}</>
  }
  salvarToken('token-local')
  render(<UsuarioProvider><Consumidor /><Consumidor /></UsuarioProvider>)
  await screen.findAllByText('Pessoa Teste')
  assert.equal(userGets(), 1)
  const pedido = deferred<UsuarioDto>()
  loadUser = () => pedido.promise
  fireEvent.click(screen.getAllByText('Atualizar')[0])
  assert.equal(screen.getAllByText('Pessoa Teste').length, 2)
  await act(async () => pedido.resolve({ ...usuario, nome: 'Nome atualizado' }))
  await screen.findAllByText('Nome atualizado')
  assert.equal(userGets(), 2)
})

test('401 atrasado de token antigo não derruba a sessão nova', async () => {
  const pedido = deferred<UsuarioDto>()
  salvarToken('antigo')
  loadUser = () => pedido.promise
  mount('/')
  await waitFor(() => assert.equal(userGets(), 1))
  const oldConfig = { headers: { Authorization: 'Bearer antigo' } } as InternalAxiosRequestConfig
  await act(async () => {
    loadUser = async () => ({ ...usuario, nome: 'Pessoa Nova' })
    salvarToken('novo')
  })
  await screen.findByRole('heading', { name: 'Olá, Pessoa Nova' })
  await act(async () => pedido.reject(unauthorized(oldConfig)))
  assert.equal(obterToken(), 'novo')
  assert.equal(screen.queryByText('Olá, Pessoa Teste'), null)
})

test('401 durante uso remove a tela protegida sem recarregar o documento', async () => {
  salvarToken('token-local')
  mount('/treinos')
  await screen.findByRole('heading', { name: 'Treino', exact: true })
  loadUser = async config => { throw unauthorized(config) }
  await act(async () => {
    await assert.rejects(httpClient.get('/api/usuario'))
  })
  await screen.findByRole('heading', { name: 'Entrar no PersonaLite' })
  assert.equal(obterToken(), null)
  assert.equal(screen.queryByRole('heading', { name: 'Treino', exact: true }), null)
})

test('usuário ausente mostra erro recuperável, sem novo login nem loop', async () => {
  salvarToken('token-local')
  loadUser = async () => null
  mount('/')
  await screen.findByRole('alert')
  assert.equal(userGets(), 1)
  assert.equal(screen.queryByRole('heading', { name: 'Entrar no PersonaLite' }), null)
  assert.ok(screen.getByRole('button', { name: 'Tentar novamente' }))
  assert.ok(screen.getByRole('button', { name: 'Sair da conta' }))
})

test('storage de outra aba encerra sessão e invalida o usuário em memória', async () => {
  salvarToken('token-local')
  mount('/treinos')
  await screen.findByRole('heading', { name: 'Treino', exact: true })
  await act(async () => {
    localStorage.removeItem('personalite_token')
    window.dispatchEvent(new StorageEvent('storage', { key: 'personalite_token', storageArea: localStorage }))
  })
  await screen.findByRole('heading', { name: 'Entrar no PersonaLite' })
  assert.equal(screen.queryByRole('heading', { name: 'Treino', exact: true }), null)
})
