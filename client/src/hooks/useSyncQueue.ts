import { useCallback, useEffect, useState } from 'react'
import { httpClient } from '../api/httpClient'
import { contarPendentes, listarPendentes, removerPendente } from '../api/offlineQueue'

export function useSyncQueue() {
  const [pendentes, setPendentes] = useState(0)
  const [sincronizando, setSincronizando] = useState(false)

  const atualizarContagem = useCallback(() => {
    contarPendentes().then(setPendentes)
  }, [])

  const sincronizar = useCallback(async () => {
    if (!navigator.onLine) return

    setSincronizando(true)
    try {
      const itens = await listarPendentes()
      for (const item of itens) {
        try {
          await httpClient.post(item.url, item.corpo)
          await removerPendente(item.id)
        } catch {
          // Se ainda falhar (API continua fora), para por aqui e tenta de novo na próxima vez
          break
        }
      }
    } finally {
      setSincronizando(false)
      atualizarContagem()
    }
  }, [atualizarContagem])

  useEffect(() => {
    atualizarContagem()
    sincronizar()

    window.addEventListener('online', sincronizar)
    return () => window.removeEventListener('online', sincronizar)
  }, [atualizarContagem, sincronizar])

  return { pendentes, sincronizando, sincronizarAgora: sincronizar }
}
