import { createContext, useContext } from 'react'
import type { UsuarioDto } from '../types'

export interface UseUsuarioResultado {
  usuario: UsuarioDto | null
  carregando: boolean
  erro: string | null
  autenticado: boolean
  recarregar: () => void
}

export const UsuarioContext = createContext<UseUsuarioResultado | null>(null)

export function useUsuario(): UseUsuarioResultado {
  const contexto = useContext(UsuarioContext)
  if (!contexto) throw new Error('useUsuario exige UsuarioProvider')
  return contexto
}
