import { httpClient } from './httpClient'
import type {
  AdicionarDiaDeTreinoDto,
  AdicionarExercicioDto,
  CriarPlanoTreinoDto,
  PlanoTreinoDto,
  TreinoDoDiaDto,
} from '../types'

export async function criarPlanoTreino(dto: CriarPlanoTreinoDto): Promise<{ id: string }> {
  const { data } = await httpClient.post('/api/planos-treino', dto)
  return data
}

export async function obterPlanoAtual(): Promise<PlanoTreinoDto | null> {
  try {
    const { data } = await httpClient.get<PlanoTreinoDto>('/api/planos-treino/atual')
    return data
  } catch (erro: any) {
    if (erro?.response?.status === 404) return null
    throw erro
  }
}

export async function adicionarDiaDeTreino(
  planoTreinoId: string,
  dto: AdicionarDiaDeTreinoDto
): Promise<{ id: string }> {
  const { data } = await httpClient.post(`/api/planos-treino/${planoTreinoId}/dias`, dto)
  return data
}

export async function adicionarExercicio(
  diaDeTreinoId: string,
  dto: AdicionarExercicioDto
): Promise<{ id: string }> {
  const { data } = await httpClient.post(`/api/dias-treino/${diaDeTreinoId}/exercicios`, dto)
  return data
}

export async function obterTreinoDoDia(data?: string): Promise<TreinoDoDiaDto> {
  const { data: resultado } = await httpClient.get<TreinoDoDiaDto>('/api/treino-do-dia', {
    params: data ? { data } : undefined,
  })
  return resultado
}
