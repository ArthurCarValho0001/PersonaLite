import { httpClient } from './httpClient'
import type { UsuarioDto } from '../types'

export async function obterUsuario(): Promise<UsuarioDto | null> {
  try {
    const { data } = await httpClient.get<UsuarioDto>('/api/usuario')
    return data
  } catch (erro: any) {
    if (erro?.response?.status === 404) return null
    throw erro
  }
}