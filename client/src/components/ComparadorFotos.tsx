import { useState } from 'react'
import './ComparadorFotos.css'

interface ComparadorFotosProps {
  fotoAntes: string
  fotoDepois: string
  labelAntes?: string
  labelDepois?: string
}

export function ComparadorFotos({
  fotoAntes,
  fotoDepois,
  labelAntes = 'Antes',
  labelDepois = 'Depois',
}: ComparadorFotosProps) {
  const [posicao, setPosicao] = useState(50)

  return (
    <div className="comparador-fotos">
      <div className="comparador-fotos__imagens">
        <img src={fotoDepois} alt={labelDepois} className="comparador-fotos__imagem" />
        <div
          className="comparador-fotos__imagem comparador-fotos__imagem--sobreposta"
          style={{ clipPath: `inset(0 ${100 - posicao}% 0 0)` }}
        >
          <img src={fotoAntes} alt={labelAntes} />
        </div>
        <div className="comparador-fotos__linha" style={{ left: `${posicao}%` }} />
        <span className="comparador-fotos__rotulo comparador-fotos__rotulo--esquerda">{labelAntes}</span>
        <span className="comparador-fotos__rotulo comparador-fotos__rotulo--direita">{labelDepois}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={posicao}
        onChange={(e) => setPosicao(Number(e.target.value))}
        className="comparador-fotos__controle"
      />
    </div>
  )
}
