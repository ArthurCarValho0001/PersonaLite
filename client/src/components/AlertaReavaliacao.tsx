import { useReavaliacao } from '../hooks/useReavaliacao'
import './AlertaReavaliacao.css'

function formatarData(data: string) {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function AlertaReavaliacao() {
  const status = useReavaliacao()

  if (!status || !status.ultimaMedicao) return null

  if (status.pendente) {
    return (
      <div className="alerta-reavaliacao alerta-reavaliacao--pendente">
        <strong>Reavaliação pendente.</strong> Sua última medição foi em{' '}
        {formatarData(status.ultimaMedicao)}. Já passou dos 3 meses recomendados — hora de
        atualizar suas medidas e seu treino.
      </div>
    )
  }

  return (
    <div className="alerta-reavaliacao">
      Próxima reavaliação prevista para{' '}
      <strong>{status.proximaData && formatarData(status.proximaData)}</strong>.
    </div>
  )
}
