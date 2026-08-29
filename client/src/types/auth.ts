import type { Sexo } from './usuario'

export interface RegistrarUsuarioDto {
  nome: string
  nomeUsuario: string
  senha: string
  sexo: Sexo
  dataNascimento: string
  alturaCm: number
  email: string | null
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

export interface SolicitarRedefinicaoSenhaDto {
  email: string
}

export interface RedefinirSenhaDto {
  email: string
  codigo: string
  novaSenha: string
}