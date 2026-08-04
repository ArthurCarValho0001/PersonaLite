import axios from 'axios'
import { limparToken, obterToken } from './authToken'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

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
    if (erro?.response?.status === 401) {
      limparToken()
      // Força reload pra voltar pra tela de login (forma mais simples e confiável
      // de resetar todo o estado da aplicação sem precisar de um gerenciador global)
      window.location.href = '/'
    }
    return Promise.reject(erro)
  }
)