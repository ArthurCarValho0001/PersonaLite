import { httpClient } from './httpClient'
import type { RetrospectivaDetalhadaDto } from '../types'

export async function obterRetrospectiva(): Promise<RetrospectivaDetalhadaDto | null> {
  try {
    const { data } = await httpClient.get<RetrospectivaDetalhadaDto>('/api/retrospectiva')
    return data
  } catch (erro: any) {
    if (erro?.response?.status === 404) return null
    throw erro
  }
}