import { useCallback, useEffect, useState } from 'react'
import { obterRetrospectiva } from '../api/trimestreApi'
import type { RetrospectivaTrimestreDto } from '../types'

export function useRetrospectiva() {
  const [retrospectiva, setRetrospectiva] = useState<RetrospectivaTrimestreDto | null>(null)
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