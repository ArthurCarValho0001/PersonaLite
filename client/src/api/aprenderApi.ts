import { httpClient } from './httpClient'
export interface Modulo {
  id: string; moduloId: string; versao: number; titulo: string; objetivo: string; demonstracao: boolean
  aulasEstudadas: number; melhorNota: number | null; versaoConcluida: number | null
}
export interface Aula { id: string; titulo: string; texto: string; fonte: string; estudada: boolean }
export interface DetalheModulo extends Omit<Modulo, 'aulasEstudadas'> {
  autoria: string; revisao: string; publicadoEm: string; aulas: Aula[]; avaliacaoLiberada: boolean
}
export interface Questionario { id: string; titulo: string; versao: number; questoes: { id: string; enunciado: string; alternativas: { id: string; texto: string }[] }[] }
export interface Resultado { id: string; nota: number; aprovada: boolean; enviadaEm: string; explicacoes?: { id: string; explicacao: string; correta: string }[] }
export interface Historico { id: string; titulo: string; versao: number; retirada: boolean; concluido: boolean; aulasEstudadas: { aulaId: string; estudadaEm: string }[]; tentativas: Resultado[] }
export const catalogo = () => httpClient.get<Modulo[]>('/api/aprender/modulos').then(r => r.data)
export const detalheModulo = (id: string) => httpClient.get<DetalheModulo>(`/api/aprender/modulos/${id}`).then(r => r.data)
export const estudar = (id: string, aula: string) => httpClient.post(`/api/aprender/modulos/${id}/aulas/${aula}/estudar`)
export const questionario = (id: string) => httpClient.get<Questionario>(`/api/aprender/modulos/${id}/questionario`).then(r => r.data)
export const avaliar = (id: string, respostas: Record<string, string>, chave: string) => httpClient.post<Resultado>(`/api/aprender/modulos/${id}/tentativas`, { respostas }, { headers: { 'Idempotency-Key': chave } }).then(r => r.data)
export const resultado = (id: string) => httpClient.get<Resultado>(`/api/aprender/tentativas/${id}`).then(r => r.data)
export const historicoAprender = () => httpClient.get<Historico[]>('/api/aprender/historico').then(r => r.data)
