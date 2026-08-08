import { useCallback, useEffect, useState } from 'react'
import { obterRetrospectiva } from '../api/retrospectivaApi'
import type { RetrospectivaDetalhadaDto } from '../types'

export function useRetrospectiva() {
  const [retrospectiva, setRetrospectiva] = useState<RetrospectivaDetalhadaDto | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(() => {
    setCarregando(true)
    obterRetrospectiva()
      .then(setRetrospectiva)
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { retrospectiva, carregando, recarregar: carregar }
}