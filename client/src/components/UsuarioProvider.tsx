import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { obterToken, observarToken } from '../api/authToken'
import { obterUsuario } from '../api/usuarioApi'
import { UsuarioContext } from '../hooks/useUsuario'
import type { UsuarioDto } from '../types'

interface Estado {
  token: string | null
  usuario: UsuarioDto | null
  carregando: boolean
  erro: string | null
}

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(observarToken, obterToken, () => null)
  const [estado, setEstado] = useState<Estado>({
    token: null, usuario: null, carregando: false, erro: null,
  })
  const sequencia = useRef(0)
  const pendente = useRef<{ token: string; promessa: Promise<UsuarioDto | null>; controller: AbortController } | null>(null)

  const recarregar = useCallback(() => {
    if (!token) return
    const numero = ++sequencia.current
    setEstado((anterior) => ({
      token, usuario: anterior.token === token ? anterior.usuario : null,
      carregando: true, erro: null,
    }))
    // Reuse bootstrap in flight, including React StrictMode's effect replay.
    if (pendente.current?.token !== token) {
      pendente.current?.controller.abort()
      const controller = new AbortController()
      const pedido = { token, promessa: obterUsuario(controller.signal), controller }
      pendente.current = pedido
      void pedido.promessa.finally(() => {
        if (pendente.current === pedido) pendente.current = null
      }).catch(() => { /* The request error is handled below. */ })
    }
    const promessa = pendente.current.promessa
    void promessa.then((usuario) => {
      if (numero !== sequencia.current || obterToken() !== token) return
      setEstado({
        token, usuario, carregando: false,
        erro: usuario ? null : 'Não foi possível carregar seu usuário. Tente novamente ou saia da conta.',
      })
    }).catch(() => {
      if (numero !== sequencia.current || obterToken() !== token) return
      setEstado((anterior) => ({
        ...anterior, carregando: false,
        erro: 'Não foi possível carregar seu usuário. Tente novamente ou saia da conta.',
      }))
    })
  }, [token])

  useEffect(() => {
    if (!token) {
      pendente.current?.controller.abort()
      pendente.current = null
      setEstado({ token: null, usuario: null, carregando: false, erro: null })
    } else recarregar()
    return () => { sequencia.current++ }
  }, [token, recarregar])

  // Never expose a previous account while the new token is bootstrapping.
  const atual = token && estado.token === token ? estado : null
  return (
    <UsuarioContext.Provider value={{
      usuario: atual?.usuario ?? null,
      carregando: Boolean(token) && (atual?.carregando ?? true),
      erro: atual?.erro ?? null,
      autenticado: Boolean(token),
      recarregar,
    }}>
      {children}
    </UsuarioContext.Provider>
  )
}
