import { httpClient } from './httpClient'
import type { UsuarioDto } from '../types'

export async function obterUsuario(signal?: AbortSignal): Promise<UsuarioDto | null> {
  try {
    const { data } = await httpClient.get<UsuarioDto>('/api/usuario', { signal, timeout: 15000 })
    return data
  } catch (erro: any) {
    if (erro?.response?.status === 404) return null
    throw erro
  }
}
export async function atualizarTempoDescanso(segundos: number): Promise<void> {
  await httpClient.put('/api/usuario/tempo-descanso', { segundos })
}
