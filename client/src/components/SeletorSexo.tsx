import type { Sexo } from '../types'
import './SeletorSexo.css'

interface SeletorSexoProps {
  valor: Sexo | null
  onChange: (sexo: Sexo) => void
}

export function SeletorSexo({ valor, onChange }: SeletorSexoProps) {
  return (
    <div className="seletor-sexo">
      <span className="seletor-sexo__label">Sexo biológico</span>
      <p className="seletor-sexo__ajuda">
        Usado no cálculo do percentual de gordura (Jackson &amp; Pollock 7 dobras).
      </p>
      <div className="seletor-sexo__opcoes">
        <button
          type="button"
          className={`seletor-sexo__botao ${valor === 'Masculino' ? 'ativo' : ''}`}
          onClick={() => onChange('Masculino')}
        >
          Masculino
        </button>
        <button
          type="button"
          className={`seletor-sexo__botao ${valor === 'Feminino' ? 'ativo' : ''}`}
          onClick={() => onChange('Feminino')}
        >
          Feminino
        </button>
      </div>
    </div>
  )
}
