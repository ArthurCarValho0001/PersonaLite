import { useEffect, useState } from 'react'
import { obterReavaliacaoPendente } from '../api/medidasApi'
import type { ReavaliacaoStatusDto } from '../types'

export function useReavaliacao() {
  const [status, setStatus] = useState<ReavaliacaoStatusDto | null>(null)

  useEffect(() => {
    let cancelado = false
    obterReavaliacaoPendente()
      .then((dados) => {
        if (!cancelado) setStatus(dados)
      })
      .catch(() => {
        // Silencioso: o card de reavaliação simplesmente não aparece se a chamada falhar
      })
    return () => {
      cancelado = true
    }
  }, [])

  return status
}
