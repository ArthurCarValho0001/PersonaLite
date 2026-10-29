import { removerPendente } from '../api/offlineQueue'
import { useSyncQueue } from '../hooks/useSyncQueue'
import './IndicadorSincronizacao.css'

export function IndicadorSincronizacao() {
  const { pendentes, itensAtencao, sincronizando, sincronizarAgora } = useSyncQueue()

  if (pendentes === 0) return null

  return (
    <div className="indicador-sync">
      <span>
        {pendentes} {pendentes === 1 ? 'item pendente' : 'itens pendentes'} de sincronização
      </span>
      {itensAtencao.length > 0 && <details><summary>{itensAtencao.length} pendência(s) exige(m) revisão</summary><p role="alert">A API rejeitou estes registros. Confira os dados já salvos antes de cadastrar novamente. Os outros itens continuam sincronizando.</p><ul>{itensAtencao.map(item=><li key={item.id}>{item.descricao} · {new Date(item.criadoEm).toLocaleString('pt-BR')} <button onClick={async()=>{if(confirm('Descartar somente esta pendência local? Dados ainda não enviados serão perdidos. Confira antes se o registro já existe no servidor.'))await removerPendente(item.id)}}>Descartar pendência</button></li>)}</ul></details>}
      <button type="button" onClick={() => sincronizarAgora()} disabled={sincronizando}>
        {sincronizando ? 'Sincronizando...' : 'Sincronizar agora'}
      </button>
    </div>
  )
}
