import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RegistroMedidasDto } from '../types'

interface GraficoEvolucaoProps {
  dados: RegistroMedidasDto[]
}

function formatarDataCurta(data: string) {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function GraficoEvolucao({ dados }: GraficoEvolucaoProps) {
  const dadosFormatados = dados.map((d) => ({
    ...d,
    dataFormatada: formatarDataCurta(d.data),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dadosFormatados} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="dataFormatada" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend />
        <Line type="monotone" dataKey="pesoKg" name="Peso (kg)" stroke="#22c55e" strokeWidth={2} />
        <Line
          type="monotone"
          dataKey="percentualGorduraJP7"
          name="% Gordura"
          stroke="#f59e0b"
          strokeWidth={2}
        />
        <Line type="monotone" dataKey="imc" name="IMC" stroke="#38bdf8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
