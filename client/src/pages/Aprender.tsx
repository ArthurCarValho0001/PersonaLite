import { useEffect, useState } from 'react'
import { Link, useParams, useBlocker } from 'react-router-dom'
import { BookOpen, CheckCircle2, ArrowRight, GraduationCap, Leaf, Heart, Activity } from 'lucide-react'
import * as api from '../api/aprenderApi'

function mensagem(e: unknown) { return (e as { response?: { data?: { mensagem?: string } } })?.response?.data?.mensagem ?? 'Não foi possível concluir. Tente novamente.' }
function AvisoDemo() { return <p className="v2-notice">Demonstração local · Conteúdo fictício, sem revisão editorial. Não oferece orientação de saúde.</p> }
function useConsulta<T>(buscar: () => Promise<T>, chave: string) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState('')
  const [revisao, setRevisao] = useState(0)
  useEffect(() => { let ativo = true; setErro(''); setDados(null)
    buscar().then(d => { if (ativo) setDados(d) }).catch(e => { if (ativo) setErro(mensagem(e)) })
    return () => { ativo = false }
  }, [chave, revisao]) // query identity is explicit; late results never replace another page.
  return { dados, erro, tentar: () => setRevisao(v => v + 1) }
}
function Estado({ erro, tentar }: { erro: string; tentar: () => void }) {
  return erro ? <div className="v2-panel" role="alert"><p>{erro}</p><button onClick={tentar}>Tentar novamente</button></div> : <p role="status">Carregando...</p>
}

export function Aprender() {
  const { dados, erro, tentar } = useConsulta(api.catalogo, 'catalogo')
  const icons = [Activity, Heart, Leaf]
  return <section className="v2-page">
    <header className="v2-page-header"><div><span className="v2-eyebrow">CONHECIMENTO PARA O DIA A DIA</span><h1>Aprender</h1><p>Um espaço para estudar, refletir e acompanhar seu aprendizado.</p></div><Link className="v2-link-button" to="/aprender/progresso"><GraduationCap size={18}/> Meu aprendizado</Link></header>
    <AvisoDemo />
    <div className="v2-learning-intro"><BookOpen size={34}/><div><h2>Pequenos passos, novas perspectivas.</h2><p>Escolha qualquer módulo. Estude as duas aulas e faça a avaliação quando estiver pronto.</p></div><span>3 módulos<br/><strong>Gratuitos</strong></span></div>
    {!dados ? <Estado erro={erro} tentar={tentar}/> : <div className="v2-module-grid">{dados.map((m, i) => {
      const Icon = icons[i % icons.length]
      return <article className="v2-module" key={m.id}><div className={`v2-module-art art-${i % 3}`}><Icon size={60} strokeWidth={1.25}/><span>0{i + 1}</span></div><div className="v2-module-body"><span className="v2-eyebrow">2 AULAS · VERSÃO {m.versao}</span><h2>{m.titulo}</h2><p>{m.objetivo}</p><progress value={m.aulasEstudadas} max={2} aria-label={`Aulas estudadas de ${m.titulo}`}/><small>{m.aulasEstudadas} de 2 aulas estudadas {m.versaoConcluida && '· Módulo concluído'}</small>{m.versaoConcluida && m.versaoConcluida !== m.versao && <p className="v2-notice">Você concluiu a versão {m.versaoConcluida}. O novo conteúdo é opcional.</p>}<Link className="v2-link-button" to={`/aprender/${m.id}`}>{m.aulasEstudadas ? 'Continuar módulo' : 'Conhecer módulo'}<ArrowRight size={18}/></Link></div></article>
    })}</div>}
    <p className="v2-muted">Aulas e acertos indicam atividade no aplicativo. Não comprovam impacto clínico ou resultados de aprendizagem fora dele.</p>
  </section>
}

export function ModuloAprender() {
  const { id = '' } = useParams()
  const { dados: m, erro, tentar } = useConsulta(() => api.detalheModulo(id), id)
  const [aberta, setAberta] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [falha, setFalha] = useState('')
  async function marcar(aula: string) { setEnviando(true); setFalha(''); try { await api.estudar(id, aula); tentar() } catch(e) { setFalha(mensagem(e)) } finally { setEnviando(false) } }
  if (!m) return <Estado erro={erro} tentar={tentar}/>
  return <section className="v2-page"><Link className="v2-back" to="/aprender">← Todos os módulos</Link><header className="v2-page-header"><div><span className="v2-eyebrow">VERSÃO {m.versao}</span><h1>{m.titulo}</h1><p>{m.objetivo}</p></div></header>{m.demonstracao && <AvisoDemo/>}
    <p className="v2-muted">{m.autoria} · {m.revisao} · {new Date(m.publicadoEm).toLocaleDateString('pt-BR')}</p>
    {m.aulas.map((a, i) => <article className="v2-panel" key={a.id}><button className="v2-lesson-heading" aria-expanded={aberta === a.id} onClick={() => setAberta(aberta === a.id ? null : a.id)}><span>Aula {i + 1} · {a.titulo}</span>{a.estudada ? <CheckCircle2 aria-label="Estudada"/> : <BookOpen/>}</button>{aberta === a.id && <div className="v2-prose"><p>{a.texto}</p><p><strong>Fonte:</strong> {a.fonte}</p><button disabled={enviando || a.estudada} onClick={() => marcar(a.id)}>{a.estudada ? 'Aula estudada' : enviando ? 'Salvando...' : 'Marcar como estudada'}</button></div>}</article>)}
    {falha && <p role="alert">{falha}</p>}
    <div className="v2-panel"><h2>Pronto para revisar?</h2><p>Cinco questões, quatro alternativas. Quatro acertos concluem o módulo. Você pode tentar novamente quantas vezes quiser.</p>{m.avaliacaoLiberada ? <Link className="v2-link-button" to={`/aprender/${id}/avaliacao`}>Iniciar avaliação <ArrowRight size={18}/></Link> : <p>Marque as duas aulas desta versão como estudadas para liberar a avaliação.</p>}</div>
  </section>
}

export function AvaliacaoAprender() {
  const { id = '' } = useParams()
  const { dados: q, erro, tentar } = useConsulta(() => api.questionario(id), id)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [chave, setChave] = useState(() => crypto.randomUUID())
  const [enviando, setEnviando] = useState(false)
  const [incerto, setIncerto] = useState(false)
  const [falha, setFalha] = useState('')
  const [feito, setFeito] = useState<api.Resultado | null>(null)
  const sujo = !feito && (enviando || Object.keys(respostas).length > 0)
  const blocker = useBlocker(sujo)
  useEffect(() => { const sair = (e: BeforeUnloadEvent) => { if (sujo) { e.preventDefault(); e.returnValue = '' } }; window.addEventListener('beforeunload', sair); return () => window.removeEventListener('beforeunload', sair) }, [sujo])
  useEffect(() => { document.documentElement.dataset.quizDirty = String(sujo); return () => { delete document.documentElement.dataset.quizDirty } }, [sujo])
  async function enviar() {
    setEnviando(true); setFalha(''); setIncerto(true)
    try { const r = await api.avaliar(id, respostas, chave); setFeito(r); setIncerto(false); api.resultado(r.id).then(detalhe => setFeito(atual => atual?.id === r.id ? detalhe : atual)).catch(() => {}) }
    catch(e) { setFalha(mensagem(e)) } finally { setEnviando(false) }
  }
  if (!q) return <Estado erro={erro} tentar={tentar}/>
  return <section className="v2-page v2-reading"><Link className="v2-back" to={`/aprender/${id}`}>← Voltar ao módulo</Link><span className="v2-eyebrow">AVALIAÇÃO · VERSÃO {q.versao}</span><h1>{q.titulo}</h1><AvisoDemo/>
    {blocker.state === 'blocked' && <div className="v2-panel" role="alertdialog" aria-modal="true" aria-label="Sair da avaliação?"><h2>Sair da avaliação?</h2><p>Respostas não enviadas serão descartadas. Se você já enviou, consulte o histórico para conferir o resultado.</p><button onClick={() => blocker.reset()}>Continuar respondendo</button> <button onClick={() => blocker.proceed()}>Sair</button></div>}
    {feito ? <div className="v2-panel"><GraduationCap size={40}/><h2>{feito.aprovada ? 'Módulo concluído!' : 'Continue aprendendo'}</h2><p className="v2-score">{feito.nota}%</p><p>{feito.aprovada ? 'Sua conclusão foi registrada.' : 'Você pode revisar as aulas e tentar novamente.'}</p>{feito.explicacoes?.map(e => <p key={e.id}>{e.explicacao}</p>)}<Link className="v2-link-button" to="/aprender/progresso">Ver meu aprendizado</Link><button className="v2-secondary" onClick={() => { setFeito(null); setRespostas({}); setChave(crypto.randomUUID()) }}>Nova tentativa</button></div>
    : <form onSubmit={e => { e.preventDefault(); void enviar() }}>{q.questoes.map((questao, i) => <fieldset className="v2-panel" key={questao.id} disabled={enviando || incerto}><legend>{i + 1}. {questao.enunciado}</legend>{questao.alternativas.map(a => <label className="v2-answer" key={a.id}><input type="radio" name={questao.id} value={a.id} checked={respostas[questao.id] === a.id} onChange={() => setRespostas(r => ({ ...r, [questao.id]: a.id }))}/><span>{a.texto}</span></label>)}</fieldset>)}{falha && <p role="alert">{falha} Use o mesmo envio para recuperar uma confirmação perdida; as respostas ficam em memória enquanto esta tela estiver aberta.</p>}<button disabled={enviando || Object.keys(respostas).length !== 5}>{enviando ? 'Conferindo respostas...' : incerto ? 'Repetir envio com segurança' : 'Enviar avaliação'}</button></form>}
  </section>
}

export function ProgressoAprender() {
  const { dados, erro, tentar } = useConsulta(api.historicoAprender, 'historico')
  return <section className="v2-page"><Link className="v2-back" to="/aprender">← Aprender</Link><h1>Meu aprendizado</h1><p className="v2-muted">Seu histórico de estudo e avaliações, preservado por versão.</p>{!dados ? <Estado erro={erro} tentar={tentar}/> : dados.length === 0 ? <div className="v2-panel"><BookOpen size={36}/><h2>Seu próximo passo começa com uma aula</h2><p>Escolha um módulo para começar.</p><Link to="/aprender">Explorar módulos →</Link></div> : dados.map(m => <article className="v2-panel" key={m.id}><h2>{m.titulo}</h2><p>Versão {m.versao} · {m.aulasEstudadas.length}/2 aulas · {m.concluido ? 'Concluído' : 'Em estudo'}{m.retirada && ' · Conteúdo retirado — somente histórico'}</p>{m.tentativas.length ? <ul className="v2-history">{m.tentativas.map(t => <li key={t.id}><time>{new Date(t.enviadaEm).toLocaleString('pt-BR')}</time><strong>{t.nota}%</strong><span>{t.nota >= 80 ? 'Aprovada' : 'Em aprendizado'}</span></li>)}</ul> : <p>Nenhuma avaliação enviada.</p>}</article>)}</section>
}
