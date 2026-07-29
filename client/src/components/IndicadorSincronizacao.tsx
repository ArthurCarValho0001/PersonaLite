import { useSyncQueue } from '../hooks/useSyncQueue'
import './IndicadorSincronizacao.css'

export function IndicadorSincronizacao() {
  const { pendentes, sincronizando, sincronizarAgora } = useSyncQueue()

  if (pendentes === 0) return null

  return (
    <div className="indicador-sync">
      <span>
        {pendentes} {pendentes === 1 ? 'item pendente' : 'itens pendentes'} de sincronização
      </span>
      <button type="button" onClick={() => sincronizarAgora()} disabled={sincronizando}>
        {sincronizando ? 'Sincronizando...' : 'Sincronizar agora'}
      </button>
    </div>
  )
}
