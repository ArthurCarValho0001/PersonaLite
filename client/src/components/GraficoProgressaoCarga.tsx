import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PontoProgressaoCargaDto } from '../types'

interface GraficoProgressaoCargaProps {
  dados: PontoProgressaoCargaDto[]
  nomeExercicio: string
}

function formatarDataCurta(data: string) {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function GraficoProgressaoCarga({ dados, nomeExercicio }: GraficoProgressaoCargaProps) {
  if (dados.length === 0) {
    return <p className="grafico-progressao__vazio">Ainda sem sessões registradas para {nomeExercicio}.</p>
  }

  const dadosFormatados = dados.map((d) => ({ ...d, dataFormatada: formatarDataCurta(d.data) }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={dadosFormatados} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="dataFormatada" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#e2e8f0' }}
          formatter={(valor: number) => [`${valor} kg`, 'Carga máxima']}
        />
        <Line type="monotone" dataKey="cargaMaximaKg" name="Carga máxima (kg)" stroke="#a78bfa" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
