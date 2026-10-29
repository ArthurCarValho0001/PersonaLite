// RNF05 local only: ten fictitious accounts, 100 reads per operation, warmed API.
import {randomUUID} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
const origin='http://localhost:5000';
async function call(path,token,body) {
  const r=await fetch(origin+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} : {}),...(path.endsWith('/tentativas')?{'Idempotency-Key':randomUUID()}: {})},body:body===undefined?undefined:JSON.stringify(body)});
  if(r.status===429) { await new Promise(resolve=>setTimeout(resolve,1000*Number(r.headers.get('retry-after')||60))); return call(path,token,body); }
  if(!r.ok)throw Error(`${path}: HTTP ${r.status}`);
  return r.status===204?null:r.json();
}
const tokens=[];
for(let i=0;i<10;i++) {
  const id=randomUUID().slice(0,8);
  const a=await call('/api/auth/registrar',null,{nome:'Carga fictícia local',nomeUsuario:`perf_${id}`,senha:randomUUID(),sexo:'Masculino',dataNascimento:'1995-01-01',alturaCm:175});
  tokens.push(a.token);
  const [m]=await call('/api/aprender/modulos',a.token);
  const detalhe=await call(`/api/aprender/modulos/${m.id}`,a.token);
  for(const aula of detalhe.aulas)await call(`/api/aprender/modulos/${m.id}/aulas/${aula.id}/estudar`,a.token,{});
  const q=await call(`/api/aprender/modulos/${m.id}/questionario`,a.token);
  await call(`/api/aprender/modulos/${m.id}/tentativas`,a.token,{respostas:Object.fromEntries(q.questoes.map(q=>[q.id,'a']))});
}
const results=[];
for(const path of ['/api/aprender/modulos','/api/aprender/historico']) {
  await Promise.all(tokens.map(t=>call(path,t)));
  const tempos=[];
  await Promise.all(tokens.map(async t=>{for(let i=0;i<10;i++){const inicio=performance.now();await call(path,t);tempos.push(performance.now()-inicio);}}));
  tempos.sort((a,b)=>a-b);
  results.push({path,requests:tempos.length,concurrency:10,p50Ms:Number(tempos[49].toFixed(2)),p95Ms:Number(tempos[94].toFixed(2)),maxMs:Number(tempos[99].toFixed(2)),targetMet:tempos[94]<=2000});
}
await mkdir('.local',{recursive:true});
await writeFile('.local/v2-performance.json',JSON.stringify({date:new Date().toISOString(),environment:'loopback, API aquecida, PostgreSQL local, sem latência móvel',dataset:'3 módulos; 2 aulas estudadas e 1 tentativa por conta; 10 contas fictícias',results},null,2));
console.log(JSON.stringify(results,null,2));
