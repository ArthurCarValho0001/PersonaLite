import { useEffect, useState } from 'react'
import { obterPlanosHistoricos, type PlanoHistorico } from '../api/treinoApi'
import { obterProgressaoCarga } from '../api/sessaoApi'
import type { PontoProgressaoCargaDto } from '../types'
export function HistoricoTreinos({ selecionarDia }: {selecionarDia: (id: string) => void}) {
  const [planos,setPlanos]=useState<PlanoHistorico[]>([])
  const [erro,setErro]=useState('')
  const [exercicio,setExercicio]=useState('')
  const [pontos,setPontos]=useState<PontoProgressaoCargaDto[] | null>(null)
  useEffect(() => { let ativo=true; obterPlanosHistoricos().then(p => {if(ativo)setPlanos(p)}).catch(()=>{if(ativo)setErro('Não foi possível consultar os planos.')}); return ()=>{ativo=false} },[])
  useEffect(() => { let ativo=true; setPontos(null); setErro(''); if(exercicio) obterProgressaoCarga(exercicio).then(p=>{if(ativo)setPontos(p)}).catch(()=>{if(ativo)setErro('Não foi possível consultar o histórico.')}); return ()=>{ativo=false} },[exercicio])
  return <details className="v2-panel"><summary>Planos anteriores e exercícios arquivados</summary>
    <p>Selecione a data acima e o dia do plano abaixo para consultar ou registrar um treino antigo. Exercícios mantêm sua identidade mesmo quando renomeados.</p>
    {erro && <p role="alert">{erro}</p>}
    <label htmlFor="diaHistorico">Dia de um plano salvo</label><select id="diaHistorico" defaultValue="" onChange={e=>{if(e.target.value)selecionarDia(e.target.value)}}><option value="">Selecionar</option>{planos.map(p=><optgroup key={p.id} label={`Plano ${p.inicioVigencia} — ${p.fimVigencia ?? 'atual'}`}>{p.dias.map(d=><option key={d.id} value={d.id}>{d.nome}</option>)}</optgroup>)}</select>
    <label htmlFor="exercicioHistorico">Histórico de carga por exercício</label><select id="exercicioHistorico" value={exercicio} onChange={e=>setExercicio(e.target.value)}><option value="">Selecionar</option>{planos.map(p=><optgroup key={p.id} label={`Plano ${p.inicioVigencia}`}>{p.dias.flatMap(d=>d.exercicios.map(e=><option key={e.id} value={e.id}>{d.nome} · {e.nome}{e.arquivado ? ' (arquivado)' : ''}</option>))}</optgroup>)}</select>
    {exercicio && !pontos && !erro && <p role="status">Carregando histórico...</p>}
    {pontos && (pontos.length ? <ul>{pontos.map((p,i)=><li key={i}>{p.data}: {p.cargaMaximaKg} kg</li>)}</ul> : <p>Nenhuma sessão concluída para este exercício.</p>)}
  </details>
}
