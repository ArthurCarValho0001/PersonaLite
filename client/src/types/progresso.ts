export interface DestaqueProgressoDto {
  tipo: string
  titulo: string
  descricao: string
}

export interface ResumoProgressoDto {
  periodo: string
  treinos: number
  volumeTotal: number
  destaque: DestaqueProgressoDto | null
}