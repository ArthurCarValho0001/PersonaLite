import type { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  titulo?: string
  children: ReactNode
}

export function Card({ titulo, children }: CardProps) {
  return (
    <div className="card">
      {titulo && <h2 className="card__titulo">{titulo}</h2>}
      <div className="card__conteudo">{children}</div>
    </div>
  )
}
