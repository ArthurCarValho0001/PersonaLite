import type { ResumoSerieDto } from './treino'

export interface ComparativoMesDto {
  volumeTotalPercentual: number | null
  maiorCargaDiferencaKg: number | null
  mediaCargaDiferencaKg: number | null
}

export interface ExercicioRetrospectivaDto {
  nome: string
  seriesRealizadas: number
  volumeTotal: number
  maiorCarga: number
  melhorSerie: ResumoSerieDto | null
  mediaCarga: number
  mediaRepeticoes: number
  comparativo: ComparativoMesDto | null
}

export interface TreinoRetrospectivaDto {
  nomeDia: string
  exercicios: ExercicioRetrospectivaDto[]
}

export interface RetrospectivaDetalhadaDto {
  mesReferencia: string
  treinos: TreinoRetrospectivaDto[]
}