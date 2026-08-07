import { useCallback, useEffect, useState } from 'react'
import { criarTrimestre, obterTrimestreAtual } from '../api/trimestreApi'
import type { TrimestreAtualDto } from '../types'

export function useTrimestre() {
  const [trimestre, setTrimestre] = useState<TrimestreAtualDto | null>(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      let atual = await obterTrimestreAtual()
      if (!atual) {
        await criarTrimestre()
        atual = await obterTrimestreAtual()
      }
      setTrimestre(atual)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { trimestre, carregando, recarregar: carregar }
}