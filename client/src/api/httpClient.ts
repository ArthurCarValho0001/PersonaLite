import axios from 'axios'
import { limparToken, obterToken } from './authToken'

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = obterToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const tokenEnviado = erro?.config?.headers?.Authorization
    // A delayed 401 from a previous account must not end the current session.
    if (erro?.response?.status === 401 && tokenEnviado
        && tokenEnviado === `Bearer ${obterToken()}`
        && !erro.config.url?.startsWith('/api/auth/')) {
      limparToken()
    }
    return Promise.reject(erro)
  }
)
