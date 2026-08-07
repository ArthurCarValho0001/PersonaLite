import { useEffect, useRef, useState } from 'react'
import './CronometroDescanso.css'

const CHAVE_DURACAO = 'personalite_descanso_segundos'

interface CronometroDescansoProps {
  trigger: number
}

export function CronometroDescanso({ trigger }: CronometroDescansoProps) {
  const [duracaoPadrao, setDuracaoPadrao] = useState(() => {
    const salvo = localStorage.getItem(CHAVE_DURACAO)
    return salvo ? Number(salvo) : 90
  })
  const [restante, setRestante] = useState(0)
  const [rodando, setRodando] = useState(false)
  const [editandoDuracao, setEditandoDuracao] = useState(false)
  const primeiraRenderizacao = useRef(true)

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false
      return
    }
    setRestante(duracaoPadrao)
    setRodando(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  useEffect(() => {
    if (!rodando) return
    if (restante <= 0) {
      setRodando(false)
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      return
    }
    const id = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [rodando, restante])

  function salvarDuracao(valor: number) {
    setDuracaoPadrao(valor)
    localStorage.setItem(CHAVE_DURACAO, String(valor))
  }

  const minutos = Math.floor(restante / 60)
  const segundos = restante % 60
  const tempoFormatado = `${minutos}:${String(segundos).padStart(2, '0')}`

  if (editandoDuracao) {
    return (
      <div className="cronometro cronometro--edicao">
        <input
          type="number"
          inputMode="numeric"
          value={duracaoPadrao}
          onChange={(e) => salvarDuracao(Number(e.target.value) || 0)}
          className="cronometro__input"
        />
        <span>segundos de descanso</span>
        <button type="button" className="cronometro__fechar" onClick={() => setEditandoDuracao(false)}>
          ✓
        </button>
      </div>
    )
  }

  if (!rodando && restante === 0) {
    return (
      <button type="button" className="cronometro cronometro--config" onClick={() => setEditandoDuracao(true)}>
        ⏱ Descanso: {duracaoPadrao}s
      </button>
    )
  }

  return (
    <div className={`cronometro ${restante === 0 ? 'cronometro--fim' : ''}`}>
      <span className="cronometro__tempo">{tempoFormatado}</span>
      <span className="cronometro__label">{restante === 0 ? 'Próxima série!' : 'descansando...'}</span>
      <button type="button" className="cronometro__pular" onClick={() => setRestante(0)}>
        pular
      </button>
    </div>
  )
}