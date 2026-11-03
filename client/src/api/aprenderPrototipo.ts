// Protótipo da área Aprender: tudo roda no navegador, sem chamar a API.
// Conteúdo fictício, sem revisão editorial e sem orientação de saúde.
// O progresso fica salvo só neste aparelho (localStorage), separado por conta.
import { titularAtual } from './identidade'
import type { Modulo, DetalheModulo, Questionario, Resultado, Historico } from './aprenderApi'

type Questao = [enunciado: string, correta: string, erradas: [string, string, string], explicacao: string]
interface ModuloDef { id: string; moduloId: string; titulo: string; objetivo: string; aulas: { id: string; titulo: string; texto: string }[]; questoes: Questao[] }

const AUTORIA = 'Equipe PersonaLite — protótipo com conteúdo fictício'
const REVISAO = 'Sem revisão editorial'
const FONTE = 'Texto fictício de protótipo; não é fonte de saúde.'
const PUBLICADO = '2026-10-29T12:00:00.000Z'

const MODULOS: ModuloDef[] = [
  {
    id: 'proto-1', moduloId: 'demo-1', titulo: 'Movimento e bem-estar',
    objetivo: 'Entender o que seus registros de treino mostram e o que eles não mostram.',
    aulas: [
      { id: 'aula-1', titulo: 'Conhecer antes de escolher', texto: 'Registrar séries, cargas e repetições cria um retrato da sua rotina. Esse retrato ajuda a perceber padrões, como os dias em que você treina mais ou menos. Um registro, porém, é apenas um dado sobre o que você fez: ele não prova um resultado de saúde por si só.' },
      { id: 'aula-2', titulo: 'Regularidade e descanso', texto: 'Em uma rotina de atividade, voltar com frequência costuma contar mais do que um único dia muito intenso. O descanso faz parte dessa rotina, e o intervalo entre as séries também. O aplicativo ajuda a observar, mas não substitui a orientação de um profissional.' },
    ],
    questoes: [
      ['O que um registro de treino representa?', 'Um dado sobre o que você fez', ['Um diagnóstico de saúde', 'Uma certificação profissional', 'Uma garantia de resultado'], 'O registro descreve a sua rotina; ele não comprova resultado de saúde.'],
      ['Qual dessas informações aparece em um registro de série?', 'Carga e repetições', ['Resultado de exame', 'Prescrição médica', 'Nota escolar'], 'Cada série guarda carga e repetições.'],
      ['Segundo a aula, o que costuma contar mais na rotina?', 'Voltar com regularidade', ['Treinar só em um dia muito intenso', 'Nunca descansar', 'Evitar qualquer registro'], 'A regularidade pesa mais do que um único dia intenso.'],
      ['Qual o papel do descanso na rotina?', 'Faz parte da rotina', ['Deve ser sempre eliminado', 'Só vale para iniciantes', 'Não tem relação com treino'], 'O descanso faz parte da rotina de atividade.'],
      ['O aplicativo substitui a orientação de um profissional?', 'Não substitui', ['Sim, em qualquer caso', 'Sim, se a nota for alta', 'Sim, se houver muitos registros'], 'O aplicativo ajuda a observar, mas não substitui um profissional.'],
    ],
  },
  {
    id: 'proto-2', moduloId: 'demo-2', titulo: 'Autocuidado e informação',
    objetivo: 'Ler medidas e indicadores com cuidado e escolher boas fontes de informação.',
    aulas: [
      { id: 'aula-1', titulo: 'Do registro à reflexão', texto: 'Peso, circunferências e dobras cutâneas geram indicadores, como o IMC e o percentual de gordura. Esses números são estimativas com limites. Para comparar sua evolução, use sempre o mesmo método e olhe a tendência ao longo do tempo, não um único valor isolado.' },
      { id: 'aula-2', titulo: 'Fontes confiáveis', texto: 'Antes de tomar uma decisão com base em uma informação, observe quem escreveu, quando foi publicada e quais referências apresenta. Informação geral ajuda a entender um assunto, mas não é orientação individual: dúvidas sobre a sua saúde devem ir a um profissional.' },
    ],
    questoes: [
      ['Como tratar o IMC e o percentual de gordura?', 'Como estimativas com limites', ['Como verdades absolutas', 'Como diagnóstico', 'Como metas obrigatórias'], 'São estimativas e têm limites.'],
      ['Para comparar a evolução, o que ajuda?', 'Usar sempre o mesmo método', ['Trocar de método a cada medição', 'Olhar um único valor', 'Ignorar a data'], 'Mesmo método e tendência ao longo do tempo.'],
      ['O que observar em uma fonte de informação?', 'Autoria, data e referências', ['Apenas o título', 'Apenas o número de curtidas', 'Apenas as imagens'], 'Autoria, data e referências ajudam a avaliar a fonte.'],
      ['Informação geral é o mesmo que orientação individual?', 'Não, são coisas diferentes', ['Sim, são idênticas', 'Sim, se vier de uma rede social', 'Sim, se for longa'], 'Informação geral não é orientação individual.'],
      ['Para dúvidas sobre a sua saúde, a quem recorrer?', 'A um profissional', ['Só a um aplicativo', 'Só a um vídeo', 'A ninguém'], 'Dúvidas de saúde devem ir a um profissional.'],
    ],
  },
  {
    id: 'proto-3', moduloId: 'demo-3', titulo: 'Hábitos e sustentabilidade',
    objetivo: 'Pensar em vida ativa, espaços coletivos e consumo consciente no dia a dia.',
    aulas: [
      { id: 'aula-1', titulo: 'Vida ativa no dia a dia', texto: 'Movimento também acontece fora da academia: caminhar até o trabalho, usar escadas e frequentar praças e parques são formas de manter uma vida ativa. Espaços coletivos seguros e acessíveis tornam esses hábitos mais fáceis para todas as pessoas.' },
      { id: 'aula-2', titulo: 'Consumo consciente', texto: 'Escolhas simples reduzem desperdício: reutilizar uma garrafa, cuidar dos equipamentos e comprar apenas o que de fato será usado. Pequenos hábitos repetidos ao longo do tempo importam, e cada pessoa pode começar do ponto em que está.' },
    ],
    questoes: [
      ['Onde o movimento pode acontecer, segundo a aula?', 'Também fora da academia', ['Só na academia', 'Só em competições', 'Só em casa'], 'Caminhar e usar escadas também contam como movimento.'],
      ['Que exemplo de vida ativa aparece na aula?', 'Caminhar até o trabalho', ['Evitar qualquer deslocamento', 'Usar sempre o elevador', 'Ficar parado o dia todo'], 'Caminhar até o trabalho é um exemplo citado.'],
      ['Por que espaços coletivos seguros e acessíveis importam?', 'Facilitam hábitos ativos para todos', ['Servem apenas para decoração', 'Aumentam o consumo', 'Substituem o descanso'], 'Eles tornam os hábitos mais fáceis para todas as pessoas.'],
      ['Qual escolha reduz desperdício?', 'Reutilizar uma garrafa', ['Descartar após um uso', 'Comprar sem necessidade', 'Ignorar o cuidado com equipamentos'], 'Reutilizar e cuidar do que se tem reduz desperdício.'],
      ['O que importa ao longo do tempo?', 'Pequenos hábitos repetidos', ['Um único grande gesto', 'Nunca começar', 'Esperar condições perfeitas'], 'Pequenos hábitos repetidos fazem diferença.'],
    ],
  },
]

const ALTERNATIVAS = ['a', 'b', 'c', 'd']
// A posição da alternativa correta varia por questão, de forma estável.
function montar(m: ModuloDef) {
  return m.questoes.map(([enunciado, correta, erradas, explicacao], n) => {
    const posicao = (n + m.moduloId.length + Number(m.id.slice(-1))) % 4
    const textos = [...erradas]; textos.splice(posicao, 0, correta)
    return { id: `q-${n + 1}`, enunciado, explicacao, correta: ALTERNATIVAS[posicao], alternativas: textos.map((texto, i) => ({ id: ALTERNATIVAS[i], texto })) }
  })
}

interface Tentativa { id: string; moduloId: string; nota: number; enviadaEm: string; respostas: Record<string, string> }
interface Estado { aulas: { moduloId: string; aulaId: string; estudadaEm: string }[]; tentativas: Tentativa[]; chaves: Record<string, string> }

const memoria = new Map<string, Estado>()
const chaveEstado = () => `personalite_proto_aprender:${titularAtual() ?? 'visitante'}`
function carregar(): Estado {
  const chave = chaveEstado()
  try { const bruto = localStorage.getItem(chave); if (bruto) return JSON.parse(bruto) as Estado } catch { /* usa a memória */ }
  return memoria.get(chave) ?? { aulas: [], tentativas: [], chaves: {} }
}
function salvar(estado: Estado) {
  const chave = chaveEstado(); memoria.set(chave, estado)
  try { localStorage.setItem(chave, JSON.stringify(estado)) } catch { /* só memória */ }
}
function erro(mensagem: string, status = 400): never { throw { response: { status, data: { mensagem } } } }
function modulo(id: string) { return MODULOS.find(m => m.id === id) ?? erro('Esta versão não está disponível. Consulte seu histórico.', 404) }
const APROVACAO = 80

export async function catalogo(): Promise<Modulo[]> {
  const e = carregar()
  return MODULOS.map(m => {
    const notas = e.tentativas.filter(t => t.moduloId === m.id).map(t => t.nota)
    return { id: m.id, moduloId: m.moduloId, versao: 1, titulo: m.titulo, objetivo: m.objetivo, demonstracao: true,
      aulasEstudadas: e.aulas.filter(a => a.moduloId === m.id).length,
      melhorNota: notas.length ? Math.max(...notas) : null,
      versaoConcluida: notas.some(n => n >= APROVACAO) ? 1 : null }
  })
}

export async function detalheModulo(id: string): Promise<DetalheModulo> {
  const m = modulo(id), e = carregar()
  const estudada = (aulaId: string) => e.aulas.some(a => a.moduloId === id && a.aulaId === aulaId)
  const notas = e.tentativas.filter(t => t.moduloId === id).map(t => t.nota)
  return { id: m.id, moduloId: m.moduloId, versao: 1, titulo: m.titulo, objetivo: m.objetivo, demonstracao: true,
    melhorNota: notas.length ? Math.max(...notas) : null, versaoConcluida: notas.some(n => n >= APROVACAO) ? 1 : null,
    autoria: AUTORIA, revisao: REVISAO, publicadoEm: PUBLICADO,
    aulas: m.aulas.map(a => ({ id: a.id, titulo: a.titulo, texto: a.texto, fonte: FONTE, estudada: estudada(a.id) })),
    avaliacaoLiberada: m.aulas.every(a => estudada(a.id)) }
}

export async function estudar(id: string, aulaId: string): Promise<void> {
  const m = modulo(id)
  if (!m.aulas.some(a => a.id === aulaId)) erro('Aula não encontrada.', 404)
  const e = carregar()
  if (e.aulas.some(a => a.moduloId === id && a.aulaId === aulaId)) return
  e.aulas.push({ moduloId: id, aulaId, estudadaEm: new Date().toISOString() }); salvar(e)
}

function exigirAulas(id: string) {
  const m = modulo(id), e = carregar()
  if (!m.aulas.every(a => e.aulas.some(x => x.moduloId === id && x.aulaId === a.id))) erro('Estude as duas aulas desta versão antes da avaliação.')
  return m
}

export async function questionario(id: string): Promise<Questionario> {
  const m = exigirAulas(id)
  return { id: m.id, titulo: m.titulo, versao: 1, questoes: montar(m).map(q => ({ id: q.id, enunciado: q.enunciado, alternativas: q.alternativas })) }
}

function resultadoDe(t: Tentativa): Resultado {
  const questoes = montar(modulo(t.moduloId))
  return { id: t.id, nota: t.nota, aprovada: t.nota >= APROVACAO, enviadaEm: t.enviadaEm,
    explicacoes: questoes.map(q => ({ id: q.id, explicacao: q.explicacao, correta: q.correta })) }
}

export async function avaliar(id: string, respostas: Record<string, string>, chave: string): Promise<Resultado> {
  const m = exigirAulas(id), e = carregar()
  const existente = e.chaves[chave]
  if (existente) { const t = e.tentativas.find(x => x.id === existente); if (t) return resultadoDe(t) }
  const questoes = montar(m)
  if (questoes.some(q => !respostas[q.id])) erro('Responda todas as questões antes de enviar.')
  const acertos = questoes.filter(q => respostas[q.id] === q.correta).length
  const tentativa: Tentativa = { id: crypto.randomUUID(), moduloId: id, nota: Math.round((acertos / questoes.length) * 100), enviadaEm: new Date().toISOString(), respostas }
  e.tentativas.push(tentativa); e.chaves[chave] = tentativa.id; salvar(e)
  return resultadoDe(tentativa)
}

export async function resultado(tentativaId: string): Promise<Resultado> {
  const t = carregar().tentativas.find(x => x.id === tentativaId) ?? erro('Tentativa não encontrada.', 404)
  return resultadoDe(t)
}

export async function historicoAprender(): Promise<Historico[]> {
  const e = carregar()
  return MODULOS.filter(m => e.aulas.some(a => a.moduloId === m.id) || e.tentativas.some(t => t.moduloId === m.id)).map(m => {
    const tentativas = e.tentativas.filter(t => t.moduloId === m.id).sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))
    return { id: m.id, titulo: m.titulo, versao: 1, retirada: false, concluido: tentativas.some(t => t.nota >= APROVACAO),
      aulasEstudadas: e.aulas.filter(a => a.moduloId === m.id).map(a => ({ aulaId: a.aulaId, estudadaEm: a.estudadaEm })),
      tentativas: tentativas.map(t => ({ id: t.id, nota: t.nota, aprovada: t.nota >= APROVACAO, enviadaEm: t.enviadaEm })) }
  })
}
