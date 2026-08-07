import { useState } from 'react'
import { concluirSessao } from '../api/sessaoApi'
import type { ExercicioComRegistrosDto } from '../types'
import { Card } from './Card'
import { SerieRegistro } from './SerieRegistro'
import './CardExercicio.css'

interface CardExercicioProps {
  exercicio: ExercicioComRegistrosDto
  data: string
  onAtualizar: () => void
  onNovaSerie: () => void
}

export function CardExercicio({ exercicio, data, onAtualizar, onNovaSerie }: CardExercicioProps) {
  const [expandido, setExpandido] = useState(false)
  const [concluindo, setConcluindo] = useState(false)
  const seriesFeitas = exercicio.seriesRegistradas.length
  const completo = seriesFeitas >= exercicio.seriesAlvo

  async function concluirTreino() {
    if (!exercicio.sessaoExercicioId) return
    setConcluindo(true)
    try {
      await concluirSessao(exercicio.sessaoExercicioId)
      onAtualizar()
    } finally {
      setConcluindo(false)
    }
  }

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
          {exercicio.concluida ? (
            <span className="card-exercicio__badge card-exercicio__badge--concluido">✓ Concluído</span>
          ) : (
            <span className={`card-exercicio__badge ${completo ? 'card-exercicio__badge--completo' : ''}`}>
              {seriesFeitas}/{exercicio.seriesAlvo}
            </span>
          )}
          <span className="card-exercicio__seta">{expandido ? '▲' : '▼'}</span>
        </div>
      </button>

      {expandido && (
        <div className="card-exercicio__corpo">
          <SerieRegistro
            exercicioPlanejadoId={exercicio.exercicioPlanejadoId}
            sessaoExercicioId={exercicio.sessaoExercicioId}
            data={data}
            seriesRegistradas={exercicio.seriesRegistradas}
            seriesAlvo={exercicio.seriesAlvo}
            repeticoesAlvo={exercicio.repeticoesAlvo}
            ultimoDesempenho={exercicio.ultimoDesempenho}
            onSerieRegistrada={onAtualizar}
            onNovaSerie={onNovaSerie}
          />

          {!exercicio.concluida && exercicio.sessaoExercicioId && seriesFeitas > 0 && (
            <button type="button" className="card-exercicio__concluir" onClick={concluirTreino} disabled={concluindo}>
              {concluindo ? 'Concluindo...' : '✓ Concluir esse exercício'}
            </button>
          )}
        </div>
      )}
    </Card>
  )
}