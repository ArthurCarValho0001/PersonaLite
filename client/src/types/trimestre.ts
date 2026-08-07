export interface TrimestreAtualDto {
  numero: number
  dataInicio: string
  dataFimPrevista: string
  trocaPendente: boolean
}

export interface RetrospectivaMesDto {
  numeroMes: number
  inicioMes: string
  totalSeries: number
  mediaRepeticoes: number
  mediaCargaKg: number
}

export interface RetrospectivaTrimestreDto {
  numeroTrimestre: number
  dataInicio: string
  meses: RetrospectivaMesDto[]
}

export interface SugestaoExercicioDto {
  nomeExercicio: string
  cargaMesInicial: number
  cargaMesAtual: number
}

export interface SugestaoTrocaTreinoDto {
  trocaPendente: boolean
  exerciciosSemProgresso: SugestaoExercicioDto[]
}