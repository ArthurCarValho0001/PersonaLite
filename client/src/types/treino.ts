export const DIAS_SEMANA = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export type DiaSemana = (typeof DIAS_SEMANA)[number]

export const LABEL_DIA_SEMANA: Record<DiaSemana, string> = {
  Sunday: 'Domingo',
  Monday: 'Segunda',
  Tuesday: 'Terça',
  Wednesday: 'Quarta',
  Thursday: 'Quinta',
  Friday: 'Sexta',
  Saturday: 'Sábado',
}

export interface CriarPlanoTreinoDto {
  inicioVigencia: string
}

export interface AdicionarDiaDeTreinoDto {
  nome: string
  diaSemana: DiaSemana
}

export interface AtualizarDiaDeTreinoDto {
  nome: string
  diaSemana: DiaSemana
}

export interface AdicionarExercicioDto {
  nome: string
  grupoMuscular: string
  seriesAlvo: number
  repeticoesAlvo: number
}

export interface AtualizarExercicioDto {
  nome: string
  grupoMuscular: string
  seriesAlvo: number
  repeticoesAlvo: number
}

export interface ReordenarExerciciosDto {
  ordemExercicios: string[]
}

export interface ExercicioPlanejadoDto {
  id: string
  nome: string
  grupoMuscular: string
  seriesAlvo: number
  repeticoesAlvo: number
  ordem: number
}

export interface DiaDeTreinoDto {
  id: string
  nome: string
  diaSemana: DiaSemana
  exercicios: ExercicioPlanejadoDto[]
}

export interface PlanoTreinoDto {
  id: string
  inicioVigencia: string
  fimVigencia: string | null
  dias: DiaDeTreinoDto[]
}

export interface EstagioSerieDto {
  cargaKg: number
  repeticoes: number
}

export interface RegistrarSerieDto {
  exercicioPlanejadoId: string
  data: string
  estagios: EstagioSerieDto[]
}

export interface AtualizarSerieDto {
  estagios: EstagioSerieDto[]
}

export interface SerieRegistradaDto {
  grupoSerie: number
  estagios: EstagioSerieDto[]
}

export interface ExercicioComRegistrosDto {
  exercicioPlanejadoId: string
  nome: string
  grupoMuscular: string
  seriesAlvo: number
  repeticoesAlvo: number
  sessaoExercicioId: string | null
  concluida: boolean
  seriesRegistradas: SerieRegistradaDto[]
  ultimoTreino: UltimoTreinoExercicioDto | null
}

export interface TreinoDoDiaDto {
  diaDeTreinoId: string | null
  nomeDia: string | null
  diaSemana: DiaSemana
  temTreinoHoje: boolean
  exercicios: ExercicioComRegistrosDto[]
}

export interface PontoProgressaoCargaDto {
  data: string
  cargaMaximaKg: number
}

export interface ResumoSerieDto {
  cargaKg: number
  repeticoes: number
}

export interface SugestaoProgressaoDto {
  aumentar: string
  manter: string
}

export interface UltimoTreinoExercicioDto {
  data: string
  melhorSerie: ResumoSerieDto
  ultimaSerie: ResumoSerieDto
  sugestao: SugestaoProgressaoDto
}

export interface ExercicioComRegistrosDto {
  exercicioPlanejadoId: string
  nome: string
  grupoMuscular: string
  seriesAlvo: number
  repeticoesAlvo: number
  sessaoExercicioId: string | null
  concluida: boolean
  seriesRegistradas: SerieRegistradaDto[]
  ultimoTreino: UltimoTreinoExercicioDto | null
}