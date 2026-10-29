import { useCallback, useEffect, useState } from 'react'
import { httpClient } from '../api/httpClient'
import { type RequisicaoPendente, listarPendentes, removerPendente, marcarAtencao } from '../api/offlineQueue'
import { obterToken, observarToken } from '../api/authToken'
let enviando = false
export function useSyncQueue() {
  const [pendentes, setPendentes] = useState(0)
  const [itensAtencao, setItensAtencao] = useState<RequisicaoPendente[]>([])
  const [sincronizando, setSincronizando] = useState(false)
  const atualizarContagem = useCallback(() => { void listarPendentes().then(itens => { setPendentes(itens.length); setItensAtencao(itens.filter(i => i.estado === 'atencao')) }).catch(() => { setPendentes(0); setItensAtencao([]) }) }, [])
  const sincronizar = useCallback(async () => {
    if (!navigator.onLine || enviando) return
    const token = obterToken(); if (!token) return
    enviando = true; setSincronizando(true)
    try {
      for (const item of await listarPendentes()) {
        if (obterToken() !== token) break
        if (item.estado === 'atencao') continue
        try {
          await httpClient.post(item.url, item.corpo, { headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': item.id, 'X-Time-Zone': item.fuso ?? 'UTC' } })
          if (obterToken() !== token) break
          await removerPendente(item.id)
        } catch (e: any) {
          if (obterToken() !== token || !e.response || e.response.status >= 500 || [401,408,429].includes(e.response.status)) break
          await marcarAtencao(item.id)
        }
      }
    } finally { enviando = false; setSincronizando(false); atualizarContagem() }
  }, [atualizarContagem])
  useEffect(() => {
    atualizarContagem(); void sincronizar()
    const parar = observarToken(() => { atualizarContagem(); void sincronizar() })
    window.addEventListener('online', sincronizar); window.addEventListener('personalite:fila', atualizarContagem)
    const timer = window.setInterval(sincronizar, 30000)
    return () => { parar(); window.clearInterval(timer); window.removeEventListener('online', sincronizar); window.removeEventListener('personalite:fila', atualizarContagem) }
  }, [atualizarContagem, sincronizar])
  return { pendentes, itensAtencao, sincronizando, sincronizarAgora: sincronizar }
}
