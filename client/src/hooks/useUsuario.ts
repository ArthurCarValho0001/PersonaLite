import { useEffect, useState } from 'react'
import { obterUsuario } from '../api/usuarioApi'
import { obterToken } from '../api/authToken'
import type { UsuarioDto } from '../types'

interface UseUsuarioResultado {
  usuario: UsuarioDto | null
  carregando: boolean
  erro: string | null
  autenticado: boolean
  recarregar: () => void
}

export function useUsuario(): UseUsuarioResultado {
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      if (!obterToken()) {
        if (!cancelado) {
          setUsuario(null)
          setCarregando(false)
        }
        return
      }

      setCarregando(true)
      setErro(null)
      try {
        const dados = await obterUsuario()
        if (!cancelado) setUsuario(dados)
      } catch {
        if (!cancelado) setErro('Não foi possível conectar à API. Ela está rodando?')
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [versao])

  return {
    usuario,
    carregando,
    erro,
    autenticado: obterToken() !== null,
    recarregar: () => setVersao((v) => v + 1),
  }
}