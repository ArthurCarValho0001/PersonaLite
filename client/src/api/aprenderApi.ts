import { httpClient } from './httpClient'
import { aprenderUsaApi } from '../config/recursos'
import * as proto from './aprenderPrototipo'
export interface Modulo {
  id: string; moduloId: string; versao: number; titulo: string; objetivo: string; demonstracao: boolean
  aulasEstudadas: number; melhorNota: number | null; versaoConcluida: number | null; totalAulas?: number
}
export interface Aula { id: string; titulo: string; texto: string; fonte: string; estudada: boolean; duracao?: string }
export interface DetalheModulo extends Omit<Modulo, 'aulasEstudadas'> {
  autoria: string; revisao: string; publicadoEm: string; aulas: Aula[]; avaliacaoLiberada: boolean; totalAulas?: number
}
export interface Questionario { id: string; titulo: string; versao: number; questoes: { id: string; enunciado: string; alternativas: { id: string; texto: string }[] }[] }
export interface Resultado { id: string; nota: number; aprovada: boolean; enviadaEm: string; explicacoes?: { id: string; explicacao: string; correta: string }[] }
export interface Historico { id: string; titulo: string; versao: number; retirada: boolean; concluido: boolean; totalAulas?: number; aulasEstudadas: { aulaId: string; estudadaEm: string }[]; tentativas: Resultado[] }
// Enquanto a API v2 não estiver publicada, a área Aprender roda como protótipo local
// (aprenderPrototipo.ts). Veja config/recursos.ts para voltar a usar a API.
export const aprenderEmPrototipo = () => !aprenderUsaApi()
export const catalogo = () => aprenderEmPrototipo() ? proto.catalogo() : httpClient.get<Modulo[]>('/api/aprender/modulos').then(r => r.data)
export const detalheModulo = (id: string) => aprenderEmPrototipo() ? proto.detalheModulo(id) : httpClient.get<DetalheModulo>(`/api/aprender/modulos/${id}`).then(r => r.data)
export const estudar = (id: string, aula: string) => aprenderEmPrototipo() ? proto.estudar(id, aula) : httpClient.post(`/api/aprender/modulos/${id}/aulas/${aula}/estudar`)
export const questionario = (id: string) => aprenderEmPrototipo() ? proto.questionario(id) : httpClient.get<Questionario>(`/api/aprender/modulos/${id}/questionario`).then(r => r.data)
export const avaliar = (id: string, respostas: Record<string, string>, chave: string) => aprenderEmPrototipo() ? proto.avaliar(id, respostas, chave) : httpClient.post<Resultado>(`/api/aprender/modulos/${id}/tentativas`, { respostas }, { headers: { 'Idempotency-Key': chave } }).then(r => r.data)
export const resultado = (id: string) => aprenderEmPrototipo() ? proto.resultado(id) : httpClient.get<Resultado>(`/api/aprender/tentativas/${id}`).then(r => r.data)
export const historicoAprender = () => aprenderEmPrototipo() ? proto.historicoAprender() : httpClient.get<Historico[]>('/api/aprender/historico').then(r => r.data)
