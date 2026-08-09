import { httpClient } from './httpClient'
import type { ResumoProgressoDto } from '../types'

export async function obterResumoProgresso(): Promise<ResumoProgressoDto> {
  const { data } = await httpClient.get<ResumoProgressoDto>('/api/progresso/resumo')
  return data
}