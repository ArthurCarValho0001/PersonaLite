import { postComFallbackOffline } from './postComFallbackOffline'
import { httpClient } from './httpClient'
import type { PontoProgressaoCargaDto, RegistrarSerieDto } from '../types'

export async function registrarSerie(dto: RegistrarSerieDto) {
  return postComFallbackOffline<null>('/api/series', dto, 'Série de exercício')
}

export async function obterProgressaoCarga(
  exercicioPlanejadoId: string
): Promise<PontoProgressaoCargaDto[]> {
  const { data } = await httpClient.get<PontoProgressaoCargaDto[]>(
    `/api/exercicios/${exercicioPlanejadoId}/progressao`
  )
  return data
}
