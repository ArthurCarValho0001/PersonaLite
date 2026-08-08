import type { ExercicioRetrospectivaDto } from '../types'
import './ExercicioRetrospectiva.css'

interface ExercicioRetrospectivaProps {
  exercicio: ExercicioRetrospectivaDto
}

function formatarComparativo(valor: number | null, sufixo: string, casasDecimais = 1): string | null {
  if (valor === null) return null
  const sinal = valor > 0 ? '+' : ''
  return `${sinal}${valor.toFixed(casasDecimais)}${sufixo}`
}

export function ExercicioRetrospectiva({ exercicio }: ExercicioRetrospectivaProps) {
  const comp = exercicio.comparativo

  return (
    <div className="exercicio-retro">
      <h4 className="exercicio-retro__nome">{exercicio.nome}</h4>

      <div className="exercicio-retro__linha">
        <span className="exercicio-retro__label">Séries realizadas</span>
        <span className="exercicio-retro__valor">{exercicio.seriesRealizadas}</span>
      </div>

      <div className="exercicio-retro__linha">
        <span className="exercicio-retro__label">Volume total</span>
        <span className="exercicio-retro__valor">
          {exercicio.volumeTotal.toLocaleString('pt-BR')} kg
          {comp && formatarComparativo(comp.volumeTotalPercentual, '%', 0) && (
            <span
              className={`exercicio-retro__comparativo ${
                (comp.volumeTotalPercentual ?? 0) >= 0 ? 'exercicio-retro__comparativo--positivo' : 'exercicio-retro__comparativo--negativo'
              }`}
            >
              {' '}
              ({formatarComparativo(comp.volumeTotalPercentual, '%', 0)})
            </span>
          )}
        </span>
      </div>

      <div className="exercicio-retro__linha">
        <span className="exercicio-retro__label">Maior carga</span>
        <span className="exercicio-retro__valor">
          {exercicio.maiorCarga}kg
          {comp && formatarComparativo(comp.maiorCargaDiferencaKg, 'kg') && (
            <span
              className={`exercicio-retro__comparativo ${
                (comp.maiorCargaDiferencaKg ?? 0) >= 0 ? 'exercicio-retro__comparativo--positivo' : 'exercicio-retro__comparativo--negativo'
              }`}
            >
              {' '}
              ({formatarComparativo(comp.maiorCargaDiferencaKg, 'kg')})
            </span>
          )}
        </span>
      </div>

      {exercicio.melhorSerie && (
        <div className="exercicio-retro__linha">
          <span className="exercicio-retro__label">Melhor série</span>
          <span className="exercicio-retro__valor">
            {exercicio.melhorSerie.cargaKg}kg × {exercicio.melhorSerie.repeticoes} reps
          </span>
        </div>
      )}

      <div className="exercicio-retro__linha">
        <span className="exercicio-retro__label">Média da carga</span>
        <span className="exercicio-retro__valor">
          {exercicio.mediaCarga}kg
          {comp && formatarComparativo(comp.mediaCargaDiferencaKg, 'kg') && (
            <span
              className={`exercicio-retro__comparativo ${
                (comp.mediaCargaDiferencaKg ?? 0) >= 0 ? 'exercicio-retro__comparativo--positivo' : 'exercicio-retro__comparativo--negativo'
              }`}
            >
              {' '}
              ({formatarComparativo(comp.mediaCargaDiferencaKg, 'kg')})
            </span>
          )}
        </span>
      </div>

      <div className="exercicio-retro__linha">
        <span className="exercicio-retro__label">Média de repetições</span>
        <span className="exercicio-retro__valor">{exercicio.mediaRepeticoes} reps</span>
      </div>
    </div>
  )
}