import { Card } from './Card'
import type { RetrospectivaTrimestreDto } from '../types'
import './RetrospectivaCard.css'

const NOME_MES = ['1º mês', '2º mês', '3º mês']

interface RetrospectivaCardProps {
  retrospectiva: RetrospectivaTrimestreDto
}

export function RetrospectivaCard({ retrospectiva }: RetrospectivaCardProps) {
  if (retrospectiva.meses.length === 0) return null

  return (
    <Card titulo={`Retrospectiva — Trimestre ${retrospectiva.numeroTrimestre}`}>
      <div className="retrospectiva">
        {retrospectiva.meses.map((mes) => (
          <div key={mes.numeroMes} className="retrospectiva__mes">
            <span className="retrospectiva__mes-titulo">{NOME_MES[mes.numeroMes - 1]}</span>
            {mes.totalSeries === 0 ? (
              <span className="retrospectiva__vazio">Sem treinos concluídos ainda</span>
            ) : (
              <div className="retrospectiva__numeros">
                <span>{mes.totalSeries} séries</span>
                <span>{mes.mediaRepeticoes} reps (média)</span>
                <span className="retrospectiva__destaque">{mes.mediaCargaKg}kg (média)</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}