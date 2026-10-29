// Extra release checks against the fixed local API and fictitious accounts only.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';

const base = 'http://localhost:5000';
const results = [];
const tag = randomUUID().slice(0, 8);
const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Sao_Paulo'}).format(new Date());
const yesterday = new Date(`${today}T12:00:00Z`);
yesterday.setUTCDate(yesterday.getUTCDate()-1);
const prior = yesterday.toISOString().slice(0, 10);
const password = randomUUID();
const registration = (label, overrides={}) => ({
  nome:`Conta QA ${label}`, nomeUsuario:`qa_${label}_${tag}`, email:`qa_${label}_${tag}@example.invalid`,
  senha:password, sexo:'Masculino', dataNascimento:'1995-01-01', alturaCm:175, ...overrides
});
const measure = data => ({data,pesoKg:70,
  ...Object.fromEntries(['pescoco','toraxMesoesternal','toraxMamilo','ultimaCostela','cintura','quadril','bracoEsquerdo','bracoDireito','antebracoEsquerdo','antebracoDireito','pernaEsquerda','pernaDireita','panturrilhaEsquerda','panturrilhaDireita'].map(k=>[k,50])),
  ...Object.fromEntries(['peitoral','axilarMedia','triceps','subescapular','abdominal','suprailiaca','coxaDobra'].map(k=>[k,12]))
});
async function call(path,{method='GET',body,token,status=200,key}={}) {
  const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json','X-Time-Zone':'America/Sao_Paulo',...(token?{Authorization:`Bearer ${token}`} : {}),...(key?{'Idempotency-Key':key}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  assert.equal(response.status,status,`${method} ${path}: ${response.status} esperado ${status}`);
  if(response.status===204)return null;
  return response.headers.get('content-type')?.includes('json')?response.json():response.text();
}
async function check(name,fn){await fn();results.push({name,passed:true});console.log(`OK ${name}`);}
try {
  await check('rota privada sem token retorna 401',()=>call('/api/medidas',{status:401}));
  const same=registration('duplicate');
  const registrations=await Promise.all([same,{...same,nomeUsuario:`  ${same.nomeUsuario.toUpperCase()}  `}].map(body=>fetch(base+'/api/auth/registrar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})));
  await check('cadastro concorrente com usuário normalizado cria somente uma conta',async()=>assert.deepEqual(registrations.map(r=>r.status).sort(),[200,409]));
  const accountA=await call('/api/auth/registrar',{method:'POST',body:registration('a')});
  const accountB=await call('/api/auth/registrar',{method:'POST',body:registration('b')});
  await check('credencial incorreta não autentica',()=>call('/api/auth/login',{method:'POST',body:{nomeUsuario:`qa_a_${tag}`,senha:'senha-incorreta'},status:401}));
  await check('cadastro de menor de idade é permitido sem calcular medida',()=>call('/api/auth/registrar',{method:'POST',body:registration('young',{dataNascimento:'2016-01-01'})}));
  const a=accountA.token,b=accountB.token;
  const first=await call('/api/medidas',{method:'POST',body:measure(today),token:a,key:randomUUID(),status:201});
  const second=await call('/api/medidas',{method:'POST',body:measure(prior),token:a,key:randomUUID(),status:201});
  await check('outra conta não lê medição alheia',()=>call(`/api/medidas/${first.id}`,{token:b,status:404}));
  await check('outra conta não edita medição alheia',()=>call(`/api/medidas/${first.id}`,{method:'PUT',body:measure(today),token:b,status:400}));
  await check('editar para data já ocupada retorna conflito',()=>call(`/api/medidas/${second.id}`,{method:'PUT',body:measure(today),token:a,status:409}));
  await check('conflito de edição preserva as duas datas originais',async()=>{
    const items=await call('/api/medidas',{token:a});
    assert.equal(items.length,2);
    assert.deepEqual(items.map(m=>m.data).sort(),[prior,today].sort());
    assert.equal((await call('/api/medidas',{token:b})).length,0);
  });
  await mkdir('.local',{recursive:true});
  await writeFile('.local/v2-qa-publicacao.json',JSON.stringify({date:new Date().toISOString(),environment:'local fictitious',results},null,2));
  console.log(`${results.length} verificações adicionais locais aprovadas.`);
} catch(error) { console.error(error.message); process.exitCode=1; }
