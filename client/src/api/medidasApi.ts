import { httpClient } from './httpClient'
import { postComFallbackOffline } from './postComFallbackOffline'
import type {
  AnguloFoto,
  CriarRegistroMedidasDto,
  ReavaliacaoStatusDto,
  RegistroMedidasDetalhadoDto,
  RegistroMedidasDto,
} from '../types'

export async function registrarMedidas(dto: CriarRegistroMedidasDto) {
  return postComFallbackOffline<{ id: string }>('/api/medidas', dto, 'Registro de medidas')
}

export async function obterMedida(id: string): Promise<RegistroMedidasDetalhadoDto> {
  const { data } = await httpClient.get<RegistroMedidasDetalhadoDto>(`/api/medidas/${id}`)
  return data
}

export async function atualizarMedidas(id: string, dto: CriarRegistroMedidasDto): Promise<void> {
  await httpClient.put(`/api/medidas/${id}`, dto)
}

export async function obterEvolucao(): Promise<RegistroMedidasDto[]> {
  const { data } = await httpClient.get<RegistroMedidasDto[]>('/api/medidas')
  return data
}

export async function obterReavaliacaoPendente(): Promise<ReavaliacaoStatusDto> {
  const { data } = await httpClient.get<ReavaliacaoStatusDto>('/api/medidas/reavaliacao-pendente')
  return data
}

export async function adicionarFotoProgresso(
  registroMedidasId: string,
  angulo: AnguloFoto,
  arquivo: File
): Promise<{ id: string }> {
  const form = new FormData()
  form.append('arquivo', arquivo)
  form.append('angulo', angulo)

  const { data } = await httpClient.post(`/api/medidas/${registroMedidasId}/fotos`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
