import { httpClient } from './httpClient'
import { enfileirar, removerPendente, marcarAtencao } from './offlineQueue'
import { obterToken } from './authToken'
import { titularAtual } from './identidade'
import { fusoLocal } from './calendario'
export async function postComFallbackOffline<T>(url: string, corpo: unknown, descricao: string): Promise<{ sincronizado: true; dados: T } | { sincronizado: false }> {
  const token = obterToken(), titular = titularAtual(), chave = crypto.randomUUID(), fuso = fusoLocal()
  if (!token || !titular) throw new Error('Sessão necessária.')
  await enfileirar(url, corpo, descricao, chave, titular, fuso)
  try {
    if (obterToken() !== token) throw new Error('Sessão alterada. Pendência preservada para a conta original.')
    const { data } = await httpClient.post<T>(url, corpo, { headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': chave, 'X-Time-Zone': fuso } })
    if (obterToken() !== token) return { sincronizado: false }
    await removerPendente(chave)
    return { sincronizado: true, dados: data }
  } catch (erro: any) {
    if (erro?.response?.status >= 400 && erro.response.status < 500 && ![401, 408, 429].includes(erro.response.status)) { await marcarAtencao(chave); throw erro }
    return { sincronizado: false }
  }
}
