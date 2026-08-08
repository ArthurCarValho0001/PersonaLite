import { httpClient } from './httpClient'
import type {
  AdicionarDiaDeTreinoDto,
  AdicionarExercicioDto,
  AtualizarDiaDeTreinoDto,
  AtualizarExercicioDto,
  CriarPlanoTreinoDto,
  PlanoTreinoDto,
  ReordenarExerciciosDto,
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

export async function atualizarDiaDeTreino(diaId: string, dto: AtualizarDiaDeTreinoDto): Promise<void> {
  await httpClient.put(`/api/dias-treino/${diaId}`, dto)
}

export async function adicionarExercicio(
  diaDeTreinoId: string,
  dto: AdicionarExercicioDto
): Promise<{ id: string }> {
  const { data } = await httpClient.post(`/api/dias-treino/${diaDeTreinoId}/exercicios`, dto)
  return data
}

export async function atualizarExercicio(exercicioId: string, dto: AtualizarExercicioDto): Promise<void> {
  await httpClient.put(`/api/exercicios/${exercicioId}`, dto)
}

export async function removerExercicio(exercicioId: string): Promise<void> {
  await httpClient.delete(`/api/exercicios/${exercicioId}`)
}

export async function reordenarExercicios(diaId: string, dto: ReordenarExerciciosDto): Promise<void> {
  await httpClient.put(`/api/dias-treino/${diaId}/exercicios/ordem`, dto)
}

export async function obterTreinoDoDia(data?: string): Promise<TreinoDoDiaDto> {
  const { data: resultado } = await httpClient.get<TreinoDoDiaDto>('/api/treino-do-dia', {
    params: data ? { data } : undefined,
  })
  return resultado
}

export async function obterTreinoPorDia(diaId: string, data?: string): Promise<TreinoDoDiaDto> {
  const { data: resultado } = await httpClient.get<TreinoDoDiaDto>(`/api/dias-treino/${diaId}/treino-do-dia`, {
    params: data ? { data } : undefined,
  })
  return resultado
}
export async function concluirTreinoDoDia(diaId: string, data?: string): Promise<void> {
  await httpClient.post(`/api/dias-treino/${diaId}/concluir`, null, {
    params: data ? { data } : undefined,
  })
}