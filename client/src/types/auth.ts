import type { Sexo } from './usuario'

export interface RegistrarUsuarioDto {
  nome: string
  nomeUsuario: string
  senha: string
  sexo: Sexo
  dataNascimento: string
  alturaCm: number
}

export interface LoginDto {
  nomeUsuario: string
  senha: string
}

export interface TokenDto {
  token: string
  usuarioId: string
  nome: string
}