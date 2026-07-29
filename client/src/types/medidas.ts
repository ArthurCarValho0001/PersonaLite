export interface CriarRegistroMedidasDto {
  data: string
  pesoKg: number

  // Circunferências (fita métrica)
  pescoco: number
  toraxMesoesternal: number
  toraxMamilo: number
  ultimaCostela: number
  cintura: number
  quadril: number
  bracoEsquerdo: number
  bracoDireito: number
  antebracoEsquerdo: number
  antebracoDireito: number
  pernaEsquerda: number
  pernaDireita: number
  panturrilhaEsquerda: number
  panturrilhaDireita: number

  // Dobras cutâneas (adipômetro) — Jackson & Pollock 7 dobras
  peitoral: number
  axilarMedia: number
  triceps: number
  subescapular: number
  abdominal: number
  suprailiaca: number
  coxaDobra: number
}

export interface RegistroMedidasDto {
  id: string
  data: string
  pesoKg: number
  imc: number
  percentualGorduraJP7: number
  pescoco: number
  toraxMesoesternal: number
  toraxMamilo: number
  ultimaCostela: number
  cintura: number
  quadril: number
  bracoEsquerdo: number
  bracoDireito: number
  antebracoEsquerdo: number
  antebracoDireito: number
  pernaEsquerda: number
  pernaDireita: number
  panturrilhaEsquerda: number
  panturrilhaDireita: number
}

export interface ReavaliacaoStatusDto {
  pendente: boolean
  proximaData: string | null
  ultimaMedicao: string | null
}

export type AnguloFoto = 'Frente' | 'Lado' | 'Costas'

export interface RegistroMedidasDetalhadoDto {
  id: string
  data: string
  pesoKg: number
  pescoco: number
  toraxMesoesternal: number
  toraxMamilo: number
  ultimaCostela: number
  cintura: number
  quadril: number
  bracoEsquerdo: number
  bracoDireito: number
  antebracoEsquerdo: number
  antebracoDireito: number
  pernaEsquerda: number
  pernaDireita: number
  panturrilhaEsquerda: number
  panturrilhaDireita: number
  peitoral: number
  axilarMedia: number
  triceps: number
  subescapular: number
  abdominal: number
  suprailiaca: number
  coxaDobra: number
}
