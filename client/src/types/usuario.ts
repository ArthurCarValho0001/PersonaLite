export type Sexo = 'Masculino' | 'Feminino'

export interface CriarUsuarioDto {
  nome: string
  sexo: Sexo
  dataNascimento: string // formato yyyy-MM-dd (DateOnly do .NET)
  alturaCm: number
}

export interface UsuarioDto {
  id: string
  nome: string
  sexo: Sexo
  dataNascimento: string
  alturaCm: number
  tempoDescansoSegundos: number
}
