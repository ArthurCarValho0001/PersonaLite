import { useCallback, useEffect, useState } from 'react'
import { obterTreinoDoDia } from '../api/treinoApi'
import type { TreinoDoDiaDto } from '../types'

export function useTreinoDoDia() {
  const [treino, setTreino] = useState<TreinoDoDiaDto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    obterTreinoDoDia()
      .then(setTreino)
      .catch(() => setErro('Não foi possível carregar o treino de hoje.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { treino, carregando, erro, recarregar: carregar }
}
