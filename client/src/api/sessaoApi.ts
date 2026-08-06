import { postComFallbackOffline } from './postComFallbackOffline'
import { httpClient } from './httpClient'
import type { AtualizarSerieDto, PontoProgressaoCargaDto, RegistrarSerieDto } from '../types'

export async function registrarSerie(dto: RegistrarSerieDto) {
  return postComFallbackOffline<null>('/api/series', dto, 'Série de exercício')
}

export async function atualizarSerie(sessaoId: string, grupoSerie: number, dto: AtualizarSerieDto): Promise<void> {
  await httpClient.put(`/api/sessoes/${sessaoId}/series/${grupoSerie}`, dto)
}

export async function removerSerie(sessaoId: string, grupoSerie: number): Promise<void> {
  await httpClient.delete(`/api/sessoes/${sessaoId}/series/${grupoSerie}`)
}

export async function obterProgressaoCarga(
  exercicioPlanejadoId: string
): Promise<PontoProgressaoCargaDto[]> {
  const { data } = await httpClient.get<PontoProgressaoCargaDto[]>(
    `/api/exercicios/${exercicioPlanejadoId}/progressao`
  )
  return data
}