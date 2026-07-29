import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario'
}

export function Button({ variante = 'primario', className = '', ...props }: ButtonProps) {
  return <button className={`botao botao--${variante} ${className}`} {...props} />
}
