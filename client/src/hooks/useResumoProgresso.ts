import { useCallback, useEffect, useState } from 'react'
import { obterResumoProgresso } from '../api/progressoApi'
import type { ResumoProgressoDto } from '../types'

export function useResumoProgresso() {
  const [resumo, setResumo] = useState<ResumoProgressoDto | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(() => {
    setCarregando(true)
    obterResumoProgresso()
      .then(setResumo)
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { resumo, carregando, recarregar: carregar }
}