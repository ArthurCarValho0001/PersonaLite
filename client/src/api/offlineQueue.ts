import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface RequisicaoPendente {
  id: string
  metodo: 'post'
  url: string
  corpo: unknown
  criadoEm: string
  descricao: string
}

interface FitnessOfflineDB extends DBSchema {
  'fila-pendente': {
    key: string
    value: RequisicaoPendente
  }
}

let dbPromise: Promise<IDBPDatabase<FitnessOfflineDB>> | null = null

function obterDb() {
  if (!dbPromise) {
    dbPromise = openDB<FitnessOfflineDB>('personalite-offline', 1, {
      upgrade(db) {
        db.createObjectStore('fila-pendente', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function enfileirar(url: string, corpo: unknown, descricao: string) {
  const db = await obterDb()
  const item: RequisicaoPendente = {
    id: crypto.randomUUID(),
    metodo: 'post',
    url,
    corpo,
    criadoEm: new Date().toISOString(),
    descricao,
  }
  await db.add('fila-pendente', item)
  return item
}

export async function listarPendentes(): Promise<RequisicaoPendente[]> {
  const db = await obterDb()
  return db.getAll('fila-pendente')
}

export async function removerPendente(id: string) {
  const db = await obterDb()
  await db.delete('fila-pendente', id)
}

export async function contarPendentes(): Promise<number> {
  const db = await obterDb()
  return db.count('fila-pendente')
}
