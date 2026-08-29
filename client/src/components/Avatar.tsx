import { API_BASE_URL } from '../api/httpClient'
import './Avatar.css'

interface AvatarProps {
  nome: string
  avatarUrl: string | null
  tamanho?: 'pequeno' | 'grande'
}

export function Avatar({ nome, avatarUrl, tamanho = 'pequeno' }: AvatarProps) {
  const iniciais = nome
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const urlCompleta = avatarUrl?.startsWith('http') ? avatarUrl : avatarUrl ? `${API_BASE_URL}/${avatarUrl}` : null

  return (
    <div className={`avatar avatar--${tamanho}`}>
      {urlCompleta ? <img src={urlCompleta} alt={nome} /> : <span>{iniciais || '?'}</span>}
    </div>
  )
}
