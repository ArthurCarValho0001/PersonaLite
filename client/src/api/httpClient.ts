import axios from 'axios'
import { limparToken, obterToken } from './authToken'
import { fusoLocal } from './calendario'

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = obterToken()
  const autorizado = config.headers.Authorization
  if (autorizado && autorizado !== `Bearer ${token}`) return Promise.reject(new Error('Sessão alterada antes do envio.'))
  if (!config.headers['X-Time-Zone']) config.headers['X-Time-Zone'] = fusoLocal()
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
