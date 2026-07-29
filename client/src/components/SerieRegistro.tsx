import { useState } from 'react'
import { registrarSerie } from '../api/sessaoApi'
import type { EstagioSerieDto, SerieRegistradaDto } from '../types'
import { Button } from './Button'
import './SerieRegistro.css'

interface EstagioForm {
  cargaKg: string
  repeticoes: string
}

interface SerieRegistroProps {
  exercicioPlanejadoId: string
  data: string
  seriesRegistradas: SerieRegistradaDto[]
  seriesAlvo: number
  repeticoesAlvo: number
  onSerieRegistrada: () => void
}

const estagioVazio: EstagioForm = { cargaKg: '', repeticoes: '' }

export function SerieRegistro({
  exercicioPlanejadoId,
  data,
  seriesRegistradas,
  seriesAlvo,
  repeticoesAlvo,
  onSerieRegistrada,
}: SerieRegistroProps) {
  const [estagios, setEstagios] = useState<EstagioForm[]>([{ ...estagioVazio }])
  const [salvando, setSalvando] = useState(false)

  const ehDropSet = estagios.length > 1
  const algumEstagioValido = estagios.some((e) => Number(e.cargaKg) > 0 && Number(e.repeticoes) > 0)

  function atualizarEstagio(indice: number, campo: keyof EstagioForm, valor: string) {
    setEstagios((atual) => atual.map((e, i) => (i === indice ? { ...e, [campo]: valor } : e)))
  }

  function adicionarDrop() {
    setEstagios((atual) => [...atual, { ...estagioVazio }])
  }

  function removerUltimoDrop() {
    setEstagios((atual) => (atual.length > 1 ? atual.slice(0, -1) : atual))
  }

  async function salvarSerie() {
    const estagiosValidos: EstagioSerieDto[] = estagios
      .filter((e) => Number(e.cargaKg) > 0 && Number(e.repeticoes) > 0)
      .map((e) => ({ cargaKg: Number(e.cargaKg), repeticoes: Number(e.repeticoes) }))

    if (estagiosValidos.length === 0) return

    setSalvando(true)
    try {
      const resultado = await registrarSerie({ exercicioPlanejadoId, data, estagios: estagiosValidos })
      if (!resultado.sincronizado) {
        alert('Sem conexão — série salva localmente, será sincronizada depois.')
      }
      setEstagios([{ ...estagioVazio }])
      onSerieRegistrada()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="serie-registro">
      {seriesRegistradas.length > 0 && (
        <div className="serie-registro__historico">
          <span className="serie-registro__historico-label">
            Feitas hoje: {seriesRegistradas.length}/{seriesAlvo}
          </span>
          <div className="serie-registro__chips">
            {seriesRegistradas.map((serie) => (
              <span key={serie.grupoSerie} className="serie-registro__chip">
                {serie.estagios.map((e, i) => (
                  <span key={i}>
                    {i > 0 && ' → '}
                    {e.cargaKg}kg×{e.repeticoes}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="serie-registro__form">
        <span className="serie-registro__meta">alvo: {seriesAlvo}×{repeticoesAlvo}</span>

        {estagios.map((estagio, indice) => (
          <div key={indice} className="serie-registro__linha">
            {indice > 0 && <span className="serie-registro__seta">drop →</span>}
            <input
              type="number"
              inputMode="decimal"
              placeholder="kg"
              value={estagio.cargaKg}
              onChange={(e) => atualizarEstagio(indice, 'cargaKg', e.target.value)}
              className="serie-registro__input"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="reps"
              value={estagio.repeticoes}
              onChange={(e) => atualizarEstagio(indice, 'repeticoes', e.target.value)}
              className="serie-registro__input"
            />
          </div>
        ))}

        <div className="serie-registro__acoes">
          {ehDropSet ? (
            <button type="button" className="serie-registro__link" onClick={removerUltimoDrop}>
              − remover drop
            </button>
          ) : (
            <button type="button" className="serie-registro__link" onClick={adicionarDrop}>
              + foi drop set?
            </button>
          )}
          {ehDropSet && (
            <button type="button" className="serie-registro__link" onClick={adicionarDrop}>
              + outra queda
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={salvarSerie}
          disabled={!algumEstagioValido || salvando}
          className="serie-registro__botao-salvar"
        >
          {salvando ? 'Salvando...' : ehDropSet ? 'Registrar drop set' : 'Registrar série'}
        </Button>
      </div>
    </div>
  )
}
