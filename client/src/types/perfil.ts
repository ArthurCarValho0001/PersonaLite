import type { Sexo } from './usuario'

export interface AtualizarInformacoesPessoaisDto {
  nome: string
  dataNascimento: string
  sexo: Sexo
  metas: string | null
}

export interface AlterarNomeUsuarioDto {
  novoNomeUsuario: string
  senhaAtual: string
}

export interface AlterarEmailDto {
  novoEmail: string
  senhaAtual: string
}

export interface ConfirmarVerificacaoEmailDto {
  codigo: string
}
