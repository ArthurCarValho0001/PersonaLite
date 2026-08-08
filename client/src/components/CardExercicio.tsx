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

export function CardExercicio({
  exercicio,
  data,
  onAtualizar,
  onNovaSerie,
}: CardExercicioProps) {
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
        <div>
          <strong>{exercicio.nome}</strong>
          <div>
            {exercicio.grupoMuscular} · alvo {exercicio.seriesAlvo}×
            {exercicio.repeticoesAlvo}
          </div>
        </div>

        {exercicio.concluida ? (
          <span>✓ Concluído</span>
        ) : (
          <span
            className={`card-exercicio__badge ${
              completo ? 'card-exercicio__badge--completo' : ''
            }`}
          >
            {seriesFeitas}/{exercicio.seriesAlvo}
          </span>
        )}

        <span>{expandido ? '▲' : '▼'}</span>
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
            ultimoTreino={exercicio.ultimoTreino}
            onSerieRegistrada={onAtualizar}
            onNovaSerie={onNovaSerie}
          />

          {!exercicio.concluida &&
            exercicio.sessaoExercicioId &&
            seriesFeitas > 0 && (
              <button
                type="button"
                className="card-exercicio__concluir"
                onClick={concluirTreino}
                disabled={concluindo}
              >
                {concluindo ? 'Concluindo...' : '✓ Concluir esse exercício'}
              </button>
            )}
        </div>
      )}
    </Card>
  )
}