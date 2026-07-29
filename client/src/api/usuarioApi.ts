import { httpClient } from './httpClient'
import type { CriarUsuarioDto, UsuarioDto } from '../types'

export async function criarUsuario(dto: CriarUsuarioDto): Promise<{ id: string }> {
  const { data } = await httpClient.post('/api/usuario', dto)
  return data
}

export async function obterUsuario(): Promise<UsuarioDto | null> {
  try {
    const { data } = await httpClient.get<UsuarioDto>('/api/usuario')
    return data
  } catch (erro: any) {
    if (erro?.response?.status === 404) return null
    throw erro
  }
}
