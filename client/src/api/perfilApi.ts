import { httpClient } from './httpClient'
import type {
  AlterarEmailDto,
  AlterarNomeUsuarioDto,
  AlterarSenhaDto,
  AtualizarInformacoesPessoaisDto,
  ConfirmarVerificacaoEmailDto,
} from '../types'

export async function atualizarInformacoesPessoais(dto: AtualizarInformacoesPessoaisDto): Promise<void> {
  await httpClient.put('/api/usuario/informacoes-pessoais', dto)
}

export async function atualizarAvatar(arquivo: File): Promise<{ avatarUrl: string }> {
  const form = new FormData()
  form.append('arquivo', arquivo)
  const { data } = await httpClient.post('/api/usuario/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function alterarNomeUsuario(dto: AlterarNomeUsuarioDto): Promise<void> {
  await httpClient.put('/api/usuario/nome-usuario', dto)
}

export async function alterarSenha(dto: AlterarSenhaDto): Promise<void> {
  await httpClient.put('/api/usuario/senha', dto)
}

export async function alterarEmail(dto: AlterarEmailDto): Promise<void> {
  await httpClient.put('/api/usuario/email', dto)
}

export async function solicitarVerificacaoEmail(): Promise<void> {
  await httpClient.post('/api/usuario/email/solicitar-verificacao', {})
}

export async function confirmarVerificacaoEmail(dto: ConfirmarVerificacaoEmailDto): Promise<void> {
  await httpClient.post('/api/usuario/email/confirmar-verificacao', dto)
}
