const CHAVE_TOKEN = 'personalite_token'
const listeners = new Set<() => void>()

function notificar() {
  listeners.forEach((listener) => listener())
}

export function observarToken(listener: () => void) {
  listeners.add(listener)
  const storage = (evento: StorageEvent) => {
    if (evento.storageArea === localStorage && (evento.key === CHAVE_TOKEN || evento.key === null))
      listener()
  }
  window.addEventListener('storage', storage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', storage)
  }
}

export function salvarToken(token: string) {
  localStorage.setItem(CHAVE_TOKEN, token)
  notificar()
}

export function obterToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN)
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN)
  notificar()
}
