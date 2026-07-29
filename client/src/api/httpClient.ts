import axios from 'axios'

// A API .NET roda localmente na porta fixada em launchSettings.json (http profile: 5000).
// Pode ser sobrescrita criando um arquivo client/.env com VITE_API_BASE_URL=http://localhost:XXXX
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
