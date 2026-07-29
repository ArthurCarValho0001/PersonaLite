import { useState } from 'react'
import type { ExercicioComRegistrosDto } from '../types'
import { Card } from './Card'
import { SerieRegistro } from './SerieRegistro'
import './CardExercicio.css'

interface CardExercicioProps {
  exercicio: ExercicioComRegistrosDto
  data: string
  onAtualizar: () => void
}

export function CardExercicio({ exercicio, data, onAtualizar }: CardExercicioProps) {
  const [expandido, setExpandido] = useState(false)
  const seriesFeitas = exercicio.seriesRegistradas.length
  const completo = seriesFeitas >= exercicio.seriesAlvo

  return (
    <Card>
      <button
        type="button"
        className="card-exercicio__cabecalho"
        onClick={() => setExpandido((v) => !v)}
      >
        <div className="card-exercicio__info">
          <h3 className="card-exercicio__nome">{exercicio.nome}</h3>
          <span className="card-exercicio__meta">
            {exercicio.grupoMuscular} · alvo {exercicio.seriesAlvo}×{exercicio.repeticoesAlvo}
          </span>
        </div>
        <div className="card-exercicio__status">
          <span className={`card-exercicio__badge ${completo ? 'card-exercicio__badge--completo' : ''}`}>
            {seriesFeitas}/{exercicio.seriesAlvo}
          </span>
          <span className="card-exercicio__seta">{expandido ? '▲' : '▼'}</span>
        </div>
      </button>

      {expandido && (
        <div className="card-exercicio__corpo">
          <SerieRegistro
            exercicioPlanejadoId={exercicio.exercicioPlanejadoId}
            data={data}
            seriesRegistradas={exercicio.seriesRegistradas}
            seriesAlvo={exercicio.seriesAlvo}
            repeticoesAlvo={exercicio.repeticoesAlvo}
            onSerieRegistrada={onAtualizar}
          />
        </div>
      )}
    </Card>
  )
}
