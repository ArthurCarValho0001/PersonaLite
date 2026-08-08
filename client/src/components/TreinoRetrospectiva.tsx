import { useState } from 'react'
import { ExercicioRetrospectiva } from './ExercicioRetrospectiva'
import type { TreinoRetrospectivaDto } from '../types'
import './TreinoRetrospectiva.css'

interface TreinoRetrospectivaProps {
  treino: TreinoRetrospectivaDto
  abertoPorPadrao?: boolean
}

export function TreinoRetrospectiva({ treino, abertoPorPadrao = false }: TreinoRetrospectivaProps) {
  const [aberto, setAberto] = useState(abertoPorPadrao)

  return (
    <div className="treino-retro">
      <button type="button" className="treino-retro__cabecalho" onClick={() => setAberto((v) => !v)}>
        <span className="treino-retro__seta">{aberto ? '▼' : '▶'}</span>
        <span className="treino-retro__nome">{treino.nomeDia}</span>
        <span className="treino-retro__contagem">{treino.exercicios.length} exercício(s)</span>
      </button>

      {aberto && (
        <div className="treino-retro__corpo">
          {treino.exercicios.map((exercicio) => (
            <ExercicioRetrospectiva key={exercicio.nome} exercicio={exercicio} />
          ))}
        </div>
      )}
    </div>
  )
}