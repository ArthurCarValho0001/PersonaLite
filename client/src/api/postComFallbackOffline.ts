import { httpClient } from './httpClient'
import { enfileirar } from './offlineQueue'

/**
 * Faz um POST normalmente. Se falhar por rede (API fora do ar / sem conexão),
 * salva a requisição na fila offline (IndexedDB) em vez de propagar o erro,
 * para ser reenviada depois por useSyncQueue quando a conexão voltar.
 *
 * Retorna { sincronizado: true, dados } se enviou na hora,
 * ou { sincronizado: false } se caiu na fila.
 */
export async function postComFallbackOffline<T>(
  url: string,
  corpo: unknown,
  descricao: string
): Promise<{ sincronizado: true; dados: T } | { sincronizado: false }> {
  try {
    const { data } = await httpClient.post<T>(url, corpo)
    return { sincronizado: true, dados: data }
  } catch (erro: any) {
    // Erro de rede (sem resposta do servidor) — não confundir com erro de validação (4xx/5xx com resposta)
    const semResposta = !erro?.response
    if (!semResposta) throw erro

    await enfileirar(url, corpo, descricao)
    return { sincronizado: false }
  }
}
