import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './CronometroDescanso.css'

interface CronometroDescansoProps {
  trigger: number
  duracaoPadrao: number
}

export function CronometroDescanso({ trigger, duracaoPadrao }: CronometroDescansoProps) {
  const [restante, setRestante] = useState(0)
  const [rodando, setRodando] = useState(false)
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

  const minutos = Math.floor(restante / 60)
  const segundos = restante % 60
  const tempoFormatado = `${minutos}:${String(segundos).padStart(2, '0')}`

  if (!rodando && restante === 0) {
    return (
      <Link to="/treinos/configurar" className="cronometro cronometro--config">
        ⏱ Descanso: {duracaoPadrao}s
      </Link>
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