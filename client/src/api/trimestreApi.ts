import { httpClient } from './httpClient'
import type { RetrospectivaTrimestreDto, SugestaoTrocaTreinoDto, TrimestreAtualDto } from '../types'

export async function criarTrimestre(): Promise<{ id: string }> {
  const { data } = await httpClient.post('/api/trimestre', {})
  return data
}

export async function obterTrimestreAtual(): Promise<TrimestreAtualDto | null> {
  try {
    const { data } = await httpClient.get<TrimestreAtualDto>('/api/trimestre/atual')
    return data
  } catch (erro: any) {
    if (erro?.response?.status === 404) return null
    throw erro
  }
}

export async function obterRetrospectiva(): Promise<RetrospectivaTrimestreDto | null> {
  try {
    const { data } = await httpClient.get<RetrospectivaTrimestreDto>('/api/trimestre/retrospectiva')
    return data
  } catch (erro: any) {
    if (erro?.response?.status === 404) return null
    throw erro
  }
}

export async function obterSugestaoTroca(): Promise<SugestaoTrocaTreinoDto> {
  const { data } = await httpClient.get<SugestaoTrocaTreinoDto>('/api/trimestre/sugestao-troca')
  return data
}