import { useState } from 'react'
import { atualizarSerie, registrarSerie, removerSerie } from '../api/sessaoApi'
import type { EstagioSerieDto, SerieRegistradaDto, UltimoTreinoExercicioDto } from '../types'
import { Button } from './Button'
import './SerieRegistro.css'

interface EstagioForm {
  cargaKg: string
  repeticoes: string
}

interface SerieRegistroProps {
  exercicioPlanejadoId: string
  sessaoExercicioId: string | null
  data: string
  seriesRegistradas: SerieRegistradaDto[]
  seriesAlvo: number
  repeticoesAlvo: number
  ultimoTreino: UltimoTreinoExercicioDto | null
  onSerieRegistrada: () => void
  onNovaSerie: () => void
}

const estagioVazio: EstagioForm = { cargaKg: '', repeticoes: '' }

function paraFormulario(estagios: EstagioSerieDto[]): EstagioForm[] {
  return estagios.map((e) => ({ cargaKg: String(e.cargaKg), repeticoes: String(e.repeticoes) }))
}

export function SerieRegistro({
  exercicioPlanejadoId,
  sessaoExercicioId,
  data,
  seriesRegistradas,
  seriesAlvo,
  repeticoesAlvo,
  ultimoTreino,
  onSerieRegistrada,
  onNovaSerie,
}: SerieRegistroProps) {
  const [estagios, setEstagios] = useState<EstagioForm[]>([{ ...estagioVazio }])
  const [salvando, setSalvando] = useState(false)
  const [painelAberto, setPainelAberto] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [grupoEditando, setGrupoEditando] = useState<number | null>(null)
  const [estagiosEdicao, setEstagiosEdicao] = useState<EstagioForm[]>([])
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

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

  function calcularFeedback(cargaKg: number, repeticoes: number): string {
    if (!ultimoTreino) return '✅ Série registrada. Continue firme nas próximas séries!'

    const { melhorSerie } = ultimoTreino
    if (cargaKg > melhorSerie.cargaKg) return '🔥 Nova melhor carga!'
    if (cargaKg === melhorSerie.cargaKg && repeticoes > melhorSerie.repeticoes)
      return '🏆 Novo recorde de repetições!'
    if (cargaKg >= melhorSerie.cargaKg && repeticoes >= melhorSerie.repeticoes)
      return '💪 Você superou sua melhor série do último treino!'

    return '✅ Série registrada. Continue firme nas próximas séries!'
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
      } else {
        setFeedback(calcularFeedback(estagiosValidos[0].cargaKg, estagiosValidos.reduce((s, e) => s + e.repeticoes, 0)))
        setTimeout(() => setFeedback(null), 4000)
      }
      setEstagios([{ ...estagioVazio }])
      onSerieRegistrada()
      onNovaSerie()
    } finally {
      setSalvando(false)
    }
  }

  function iniciarEdicao(serie: SerieRegistradaDto) {
    setGrupoEditando(serie.grupoSerie)
    setEstagiosEdicao(paraFormulario(serie.estagios))
  }

  function cancelarEdicao() {
    setGrupoEditando(null)
    setEstagiosEdicao([])
  }

  function atualizarEstagioEdicao(indice: number, campo: keyof EstagioForm, valor: string) {
    setEstagiosEdicao((atual) => atual.map((e, i) => (i === indice ? { ...e, [campo]: valor } : e)))
  }

  function adicionarDropEdicao() {
    setEstagiosEdicao((atual) => [...atual, { ...estagioVazio }])
  }

  function removerUltimoDropEdicao() {
    setEstagiosEdicao((atual) => (atual.length > 1 ? atual.slice(0, -1) : atual))
  }

  async function salvarEdicao() {
    if (grupoEditando === null || !sessaoExercicioId) return

    const estagiosValidos: EstagioSerieDto[] = estagiosEdicao
      .filter((e) => Number(e.cargaKg) > 0 && Number(e.repeticoes) > 0)
      .map((e) => ({ cargaKg: Number(e.cargaKg), repeticoes: Number(e.repeticoes) }))

    if (estagiosValidos.length === 0) return

    setSalvandoEdicao(true)
    try {
      await atualizarSerie(sessaoExercicioId, grupoEditando, { estagios: estagiosValidos })
      cancelarEdicao()
      onSerieRegistrada()
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function excluirSerie(grupoSerie: number) {
    if (!sessaoExercicioId) return
    if (!confirm('Remover essa série?')) return

    await removerSerie(sessaoExercicioId, grupoSerie)
    onSerieRegistrada()
  }

  return (
    <div className="serie-registro">
      {feedback && <div className="serie-registro__feedback">{feedback}</div>}

      <div className="serie-registro__ultimo-treino">
        <button
          type="button"
          className="serie-registro__ultimo-treino-cabecalho"
          onClick={() => setPainelAberto((v) => !v)}
        >
          <span>📈 Último treino</span>
          <span className="serie-registro__ultimo-treino-seta">{painelAberto ? '▲' : '▼'}</span>
        </button>

        {painelAberto && (
          <div className="serie-registro__ultimo-treino-corpo">
            {!ultimoTreino ? (
              <p className="serie-registro__primeira-vez">
                Este é o seu primeiro registro neste exercício. Realize sua melhor série hoje
                para criar uma base de comparação para os próximos treinos.
              </p>
            ) : (
              <>
                <div className="serie-registro__destaque">
                  <span className="serie-registro__destaque-label">🏆 Melhor série</span>
                  <span className="serie-registro__destaque-valor">
                    {ultimoTreino.melhorSerie.cargaKg}kg × {ultimoTreino.melhorSerie.repeticoes} reps
                  </span>
                </div>
                <div className="serie-registro__destaque">
                  <span className="serie-registro__destaque-label">↺ Última série</span>
                  <span className="serie-registro__destaque-valor">
                    {ultimoTreino.ultimaSerie.cargaKg}kg × {ultimoTreino.ultimaSerie.repeticoes} reps
                  </span>
                </div>
                <div className="serie-registro__sugestao">
                  <span className="serie-registro__sugestao-label">🎯 Sugestão</span>
                  <p>• {ultimoTreino.sugestao.aumentar}</p>
                  <p>• {ultimoTreino.sugestao.manter}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {seriesRegistradas.length > 0 && (
        <div className="serie-registro__historico">
          <span className="serie-registro__historico-label">
            Feitas hoje: {seriesRegistradas.length}/{seriesAlvo}
          </span>

          <div className="serie-registro__lista-editavel">
            {seriesRegistradas.map((serie) =>
              grupoEditando === serie.grupoSerie ? (
                <div key={serie.grupoSerie} className="serie-registro__edicao">
                  {estagiosEdicao.map((estagio, indice) => (
                    <div key={indice} className="serie-registro__linha">
                      {indice > 0 && <span className="serie-registro__seta">drop →</span>}
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="kg"
                        value={estagio.cargaKg}
                        onChange={(e) => atualizarEstagioEdicao(indice, 'cargaKg', e.target.value)}
                        className="serie-registro__input"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="reps"
                        value={estagio.repeticoes}
                        onChange={(e) => atualizarEstagioEdicao(indice, 'repeticoes', e.target.value)}
                        className="serie-registro__input"
                      />
                    </div>
                  ))}
                  <div className="serie-registro__acoes">
                    {estagiosEdicao.length > 1 ? (
                      <button type="button" className="serie-registro__link" onClick={removerUltimoDropEdicao}>
                        − remover drop
                      </button>
                    ) : (
                      <button type="button" className="serie-registro__link" onClick={adicionarDropEdicao}>
                        + foi drop set?
                      </button>
                    )}
                  </div>
                  <div className="serie-registro__edicao-botoes">
                    <Button type="button" variante="secundario" onClick={cancelarEdicao}>
                      Cancelar
                    </Button>
                    <Button type="button" onClick={salvarEdicao} disabled={salvandoEdicao}>
                      {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={serie.grupoSerie} className="serie-registro__chip-linha">
                  <span className="serie-registro__chip">
                    {serie.estagios.map((e, i) => (
                      <span key={i}>
                        {i > 0 && ' → '}
                        {e.cargaKg}kg×{e.repeticoes}
                      </span>
                    ))}
                  </span>
                  {sessaoExercicioId && (
                    <div className="serie-registro__chip-acoes">
                      <button
                        type="button"
                        className="serie-registro__icone-botao"
                        onClick={() => iniciarEdicao(serie)}
                        aria-label="Editar série"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="serie-registro__icone-botao serie-registro__icone-botao--excluir"
                        onClick={() => excluirSerie(serie.grupoSerie)}
                        aria-label="Excluir série"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
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