import { useCallback, useEffect, useRef, useState } from 'react'
import { obterTreinoDoDia, obterTreinoPorDia } from '../api/treinoApi'
import type { ExercicioComRegistrosDto, TreinoDoDiaDto } from '../types'

export function useTreinoSelecionavel(data: string) {
  const [diaSelecionadoId, setDiaSelecionadoId] = useState<string | null>(null)
  const [treino, setTreino] = useState<TreinoDoDiaDto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const sequencia = useRef(0)
  const carregar = useCallback(() => {
    const pedido = ++sequencia.current
    setCarregando(true)
    setErro(null)
    const chamada = diaSelecionadoId ? obterTreinoPorDia(diaSelecionadoId, data) : obterTreinoDoDia(data)
    chamada.then(valor => { if (pedido === sequencia.current) setTreino(valor) })
      .catch(() => { if (pedido === sequencia.current) setErro('Não foi possível carregar o treino.') })
      .finally(() => { if (pedido === sequencia.current) setCarregando(false) })
  }, [diaSelecionadoId, data])
  useEffect(() => {
    setTreino(null)
    carregar()
    return () => { sequencia.current++ }
  }, [carregar])
  const atualizarExercicio = useCallback((exercicio?: ExercicioComRegistrosDto) => {
    if (!exercicio) { carregar(); return }
    setTreino(atual => atual && ({ ...atual, exercicios: atual.exercicios.map(e =>
      e.exercicioPlanejadoId === exercicio.exercicioPlanejadoId ? exercicio : e) }))
  }, [carregar])
  return { treino, carregando, erro, diaSelecionadoId, selecionarDia: setDiaSelecionadoId, recarregar: carregar, atualizarExercicio }
}
