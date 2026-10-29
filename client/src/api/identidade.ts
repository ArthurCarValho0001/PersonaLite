import { obterToken } from './authToken'
export function titularAtual(): string | null {
  try {
    const token = obterToken()
    if (!token) return null
    const body = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const p = JSON.parse(atob(body))
    const id = p.sub ?? p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    return typeof id === 'string' ? id : null
  } catch { return null }
}
export function ambienteAtual() { return new URL(import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000').origin }
