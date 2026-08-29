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
  nomeUsuario: string
  sexo: Sexo
  dataNascimento: string
  alturaCm: number
  tempoDescansoSegundos: number
  email: string | null
  emailVerificado: boolean
  avatarUrl: string | null
  metas: string | null
}