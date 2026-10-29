import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { titularAtual, ambienteAtual } from './identidade'
import { fusoLocal } from './calendario'
export interface RequisicaoPendente {
  id: string; metodo: 'post'; url: string; corpo: unknown; criadoEm: string; descricao: string
  titular?: string; ambiente?: string; fuso?: string; estado?: 'pendente' | 'atencao'
}
interface FitnessOfflineDB extends DBSchema { 'fila-pendente': { key: string; value: RequisicaoPendente } }
let dbPromise: Promise<IDBPDatabase<FitnessOfflineDB>> | null = null
function obterDb() {
  if (!dbPromise) dbPromise = openDB<FitnessOfflineDB>('personalite-offline', 1, { upgrade(db) { db.createObjectStore('fila-pendente', { keyPath: 'id' }) } })
  return dbPromise
}
export function notificarFila() { window.dispatchEvent(new Event('personalite:fila')) }
export async function enfileirar(url: string, corpo: unknown, descricao: string, id = crypto.randomUUID(), titular = titularAtual(), fuso = fusoLocal()) {
  if (!titular) throw new Error('Entre na sua conta antes de registrar uma pendência.')
  const item: RequisicaoPendente = { id, metodo: 'post', url, corpo, criadoEm: new Date().toISOString(), descricao, titular, ambiente: ambienteAtual(), fuso, estado: 'pendente' }
  await (await obterDb()).put('fila-pendente', item); notificarFila(); return item
}
export async function listarPendentes(): Promise<RequisicaoPendente[]> {
  const titular = titularAtual()
  if (!titular) return []
  const itens = await (await obterDb()).getAll('fila-pendente')
  // Legacy items without reliable ownership stay untouched and invisible.
  return itens.filter(i => i.titular === titular && i.ambiente === ambienteAtual()).sort((a,b) => a.criadoEm.localeCompare(b.criadoEm))
}
export async function removerPendente(id: string) {
  const db = await obterDb(); const item = await db.get('fila-pendente', id)
  if (item?.titular !== titularAtual() || item?.ambiente !== ambienteAtual()) return
  await db.delete('fila-pendente', id); notificarFila()
}
export async function marcarAtencao(id: string) {
  const db = await obterDb(); const item = await db.get('fila-pendente', id)
  if (item?.titular !== titularAtual() || item?.ambiente !== ambienteAtual()) return
  await db.put('fila-pendente', { ...item, estado: 'atencao' }); notificarFila()
}
export async function contarPendentes() { return (await listarPendentes()).length }
export async function existeQualquerPendencia() { return (await (await obterDb()).count('fila-pendente')) > 0 }
