import { useEffect, useState } from 'react'
import { httpClient } from '../api/httpClient'
import './Avatar.css'

interface AvatarProps {
  nome: string
  avatarUrl: string | null
  tamanho?: 'pequeno' | 'grande'
}

export function Avatar({ nome, avatarUrl, tamanho = 'pequeno' }: AvatarProps) {
  const [urlCompleta, setUrlCompleta] = useState<string | null>(null)
  useEffect(() => {
    let ativo = true, blob: string | null = null
    setUrlCompleta(null)
    if (avatarUrl) httpClient.get('/api/usuario/avatar/arquivo', { responseType: 'blob' }).then(r => {
      if (ativo) { blob = URL.createObjectURL(r.data); setUrlCompleta(blob) }
    }).catch(() => {})
    return () => { ativo = false; if (blob) URL.revokeObjectURL(blob) }
  }, [avatarUrl])
  const iniciais = nome
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')


  return (
    <div className={`avatar avatar--${tamanho}`}>
      {urlCompleta ? <img src={urlCompleta} alt={nome} /> : <span>{iniciais || '?'}</span>}
    </div>
  )
}
