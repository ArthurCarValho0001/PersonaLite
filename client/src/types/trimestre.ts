export interface TrimestreAtualDto {
  numero: number
  dataInicio: string
  dataFimPrevista: string
  trocaPendente: boolean
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