import { useCallback, useEffect, useState } from 'react'
import { obterTreinoDoDia, obterTreinoPorDia } from '../api/treinoApi'
import type { TreinoDoDiaDto } from '../types'

export function useTreinoSelecionavel() {
  const [diaSelecionadoId, setDiaSelecionadoId] = useState<string | null>(null)
  const [treino, setTreino] = useState<TreinoDoDiaDto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(null)

    const chamada = diaSelecionadoId ? obterTreinoPorDia(diaSelecionadoId) : obterTreinoDoDia()

    chamada
      .then(setTreino)
      .catch(() => setErro('Não foi possível carregar o treino.'))
      .finally(() => setCarregando(false))
  }, [diaSelecionadoId])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { treino, carregando, erro, diaSelecionadoId, selecionarDia: setDiaSelecionadoId, recarregar: carregar }
}