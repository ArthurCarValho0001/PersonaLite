import { useState } from 'react'
import { criarTrimestre } from '../api/trimestreApi'
import { Button } from './Button'
import { Card } from './Card'
import type { SugestaoTrocaTreinoDto } from '../types'
import './SugestaoTrocaBanner.css'

interface SugestaoTrocaBannerProps {
  sugestao: SugestaoTrocaTreinoDto
  onNovoTrimestreIniciado: () => void
}

export function SugestaoTrocaBanner({ sugestao, onNovoTrimestreIniciado }: SugestaoTrocaBannerProps) {
  const [iniciando, setIniciando] = useState(false)

  if (!sugestao.trocaPendente) return null

  async function iniciarNovoTrimestre() {
    if (!confirm('Iniciar um novo trimestre? A retrospectiva atual será guardada no histórico.')) return
    setIniciando(true)
    try {
      await criarTrimestre()
      onNovoTrimestreIniciado()
    } finally {
      setIniciando(false)
    }
  }

  return (
    <Card>
      <div className="sugestao-troca">
        <p className="sugestao-troca__titulo">🔄 Fim do trimestre — hora de reavaliar seu treino</p>

        {sugestao.exerciciosSemProgresso.length > 0 ? (
          <>
            <p className="sugestao-troca__texto">
              Esses exercícios não evoluíram de carga desde o início do trimestre — considere trocar,
              mudar o número de séries/reps, ou ajustar a técnica:
            </p>
            <ul className="sugestao-troca__lista">
              {sugestao.exerciciosSemProgresso.map((ex) => (
                <li key={ex.nomeExercicio}>
                  <strong>{ex.nomeExercicio}</strong> — {ex.cargaMesInicial}kg → {ex.cargaMesAtual}kg
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="sugestao-troca__texto">
            Todos os exercícios evoluíram de carga esse trimestre. 🎉 Mesmo assim, pode ser hora de
            variar o treino ou aumentar o desafio.
          </p>
        )}

        <div className="sugestao-troca__acoes">
          <Button type="button" onClick={iniciarNovoTrimestre} disabled={iniciando}>
            {iniciando ? 'Iniciando...' : 'Iniciar novo trimestre'}
          </Button>
        </div>
      </div>
    </Card>
  )
}