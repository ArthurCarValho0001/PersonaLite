import { useCallback, useEffect, useState } from 'react'
import { obterPlanoAtual } from '../api/treinoApi'
import type { PlanoTreinoDto } from '../types'

export function usePlanoAtual() {
  const [plano, setPlano] = useState<PlanoTreinoDto | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(() => {
    setCarregando(true)
    obterPlanoAtual()
      .then(setPlano)
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { plano, carregando, recarregar: carregar }
}
