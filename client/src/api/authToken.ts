const CHAVE_TOKEN = 'personalite_token'

export function salvarToken(token: string) {
  localStorage.setItem(CHAVE_TOKEN, token)
}

export function obterToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN)
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN)
}