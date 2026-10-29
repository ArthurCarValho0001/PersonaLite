import { useState } from 'react'
import { Download } from 'lucide-react'
import { httpClient } from '../api/httpClient'
import { contarPendentes } from '../api/offlineQueue'
export function ExportarDados() {
  const [ocupado, setOcupado] = useState(false), [aviso, setAviso] = useState('')
  async function exportar() {
    setOcupado(true); setAviso('')
    try {
      const n = await contarPendentes()
      setAviso(n ? `${n} pendência(s) deste dispositivo ficam fora do arquivo. Outros aparelhos podem ter pendências.` : 'O arquivo contém somente dados do servidor. Pendências de outros aparelhos não são incluídas.')
      const r = await httpClient.get('/api/usuario/exportar', { responseType: 'blob' })
      const url = URL.createObjectURL(r.data); const a = document.createElement('a'); a.href = url; a.download = 'personalite-dados.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch { setAviso('Não foi possível exportar. Tente novamente.') } finally { setOcupado(false) }
  }
  return <section className="v2-panel"><h2>Seus dados, com você</h2><p>Baixe seus registros em arquivos CSV separados por tipo. Inclui somente informações confirmadas no servidor, sem avatar ou credenciais.</p><button onClick={exportar} disabled={ocupado}><Download size={16}/> {ocupado ? 'Preparando arquivo...' : 'Exportar meus dados'}</button>{aviso && <p role="status">{aviso}</p>}</section>
}
