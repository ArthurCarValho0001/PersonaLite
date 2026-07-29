import { useEffect, useState } from 'react'
import { obterEvolucao } from '../api/medidasApi'
import type { RegistroMedidasDto } from '../types'

export function useEvolucao() {
  const [evolucao, setEvolucao] = useState<RegistroMedidasDto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    obterEvolucao()
      .then((dados) => {
        if (!cancelado) setEvolucao(dados)
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar o histórico de medidas.')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { evolucao, carregando, erro }
}
