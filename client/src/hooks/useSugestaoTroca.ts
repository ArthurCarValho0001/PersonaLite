import { useEffect, useState } from 'react'
import { obterSugestaoTroca } from '../api/trimestreApi'
import type { SugestaoTrocaTreinoDto } from '../types'

export function useSugestaoTroca() {
  const [sugestao, setSugestao] = useState<SugestaoTrocaTreinoDto | null>(null)

  useEffect(() => {
    obterSugestaoTroca().then(setSugestao)
  }, [])

  return sugestao
}