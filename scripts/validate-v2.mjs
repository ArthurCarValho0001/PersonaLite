import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Local integration checks. Credentials are random, fictitious and never logged.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const origin = 'http://localhost:5000';
const results = [];
async function request(path, {token, method = 'GET', body, key, status = 200} = {}) {
  const r = await fetch(origin + path, {method, headers: {'Content-Type':'application/json','X-Time-Zone':'America/Sao_Paulo', ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(key ? {'Idempotency-Key':key} : {})}, body: body === undefined ? undefined : JSON.stringify(body)});
  assert.equal(r.status, status, `${method} ${path}: status ${r.status}, esperado ${status}`);
  if (r.status === 204) return null;
  return r.headers.get('content-type')?.includes('json') ? r.json() : Buffer.from(await r.arrayBuffer());
}
async function check(name, fn) { await fn(); results.push({name, passed:true}); console.log(`OK ${name}`); }
const suffix = randomUUID().slice(0,8);
async function account(label) { return request('/api/auth/registrar',{method:'POST',body:{nome:`Pessoa teste ${label}`,nomeUsuario:`v2_${label}_${suffix}`,senha:randomUUID(),sexo:'Masculino',dataNascimento:'1995-01-01',alturaCm:175,email:`${label}_${suffix}@example.invalid`}}); }
try {
  const a = await account('a'), b = await account('b');
  const token = a.token;
  const modules = await request('/api/aprender/modulos',{token});
  await check('catálogo com três módulos de demonstração', async()=> {assert.equal(modules.length,3); assert.ok(modules.every(m=>m.demonstracao));});
  const id = modules[0].id;
  await check('avaliação bloqueada sem duas aulas', ()=>request(`/api/aprender/modulos/${id}/questionario`,{token,status:400}));
  const detail = await request(`/api/aprender/modulos/${id}`,{token});
  for(const aula of detail.aulas) await request(`/api/aprender/modulos/${id}/aulas/${aula.id}/estudar`,{token,method:'POST',body:{},status:204});
  await request(`/api/aprender/modulos/${id}/aulas/${detail.aulas[0].id}/estudar`,{token,method:'POST',body:{},status:204});
  await check('marcação repetida não aumenta contagem', async()=>assert.equal((await request('/api/aprender/modulos',{token}))[0].aulasEstudadas,2));
  const quiz = await request(`/api/aprender/modulos/${id}/questionario`,{token});
  await check('questionário sem gabarito ou explicações', async()=> {assert.equal(quiz.questoes.length,5);assert.ok(quiz.questoes.every(q=>q.alternativas.length===4 && !('correta' in q) && !('explicacao' in q)));});
  const respostas = Object.fromEntries(quiz.questoes.map((q,i)=>[q.id,i===4?'b':'a']));
  const key = randomUUID();
  const [first,repeated] = await Promise.all([1,2].map(()=>request(`/api/aprender/modulos/${id}/tentativas`,{token,method:'POST',body:{respostas},key})));
  await check('avaliação concorrente idempotente e aprovação com 80%',async()=>{assert.equal(first.id,repeated.id); assert.equal(first.nota,80);assert.equal(first.aprovada,true);});
  await check('mesma chave com conteúdo diferente retorna conflito',()=>request(`/api/aprender/modulos/${id}/tentativas`,{token,method:'POST',body:{respostas:{...respostas,[quiz.questoes[0].id]:'b'}},key,status:409}));
  await check('outra conta não lê tentativa',()=>request(`/api/aprender/tentativas/${first.id}`,{token:b.token,status:404}));
  await request(`/api/aprender/modulos/${id}/tentativas`,{token,method:'POST',body:{respostas:Object.fromEntries(quiz.questoes.map(q=>[q.id,'b']))},key:randomUUID()});
  await check('nota inferior preserva conclusão e histórico',async()=>{const h=await request('/api/aprender/historico',{token});assert.equal(h[0].concluido,true);assert.equal(h[0].tentativas.length,2);});
  const day = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
  const plan = await request('/api/planos-treino',{token,method:'POST',body:{inicioVigencia:day},status:201});
  const trainingDay = await request(`/api/planos-treino/${plan.id}/dias`,{token,method:'POST',body:{nome:'Treino de teste',diaSemana:'Monday'},status:201});
  const exercise = await request(`/api/dias-treino/${trainingDay.id}/exercicios`,{token,method:'POST',body:{nome:'Exercício fictício',grupoMuscular:'Teste',seriesAlvo:1,repeticoesAlvo:10},status:201});
  const serie = {exercicioPlanejadoId:exercise.id,data:day,estagios:[{cargaKg:10,repeticoes:10}]};
  const skey=randomUUID();
  const [s1,s2]=await Promise.all([1,2].map(()=>request('/api/series',{token,method:'POST',body:serie,key:skey})));
  await check('série idempotente concorrente e conclusão automática',async()=>{assert.equal(s1.sessaoExercicioId,s2.sessaoExercicioId);assert.equal(s1.seriesRegistradas.length,1);assert.equal(s1.concluida,true);});
  await check('cinco reenvios simultâneos não duplicam a série',async()=>{const repetidas=await Promise.all(Array.from({length:5},()=>request('/api/series',{token,method:'POST',body:serie,key:skey})));assert.ok(repetidas.every(r=>r.sessaoExercicioId===s1.sessaoExercicioId&&r.seriesRegistradas.length===1));});
  await check('treino com histórico em lote responde',()=>request(`/api/dias-treino/${trainingDay.id}/treino-do-dia?data=${day}`,{token}));
  await request(`/api/exercicios/${exercise.id}`,{token,method:'DELETE',status:204});
  await check('arquivamento preserva histórico próprio',async()=> {const h=await request(`/api/exercicios/${exercise.id}/progressao`,{token});assert.equal(h.length,1);});
  await check('histórico lista plano e exercício arquivado',async()=>{const h=await request('/api/planos-treino/historico',{token});assert.equal(h[0].dias[0].exercicios[0].arquivado,true);});
  await check('resumo agregado contabiliza treino concluído',async()=>{const r=await request('/api/progresso/resumo',{token});assert.equal(r.treinosConcluidos ?? r.treinos,1);});
  await check('retrospectiva mantém exercício arquivado',async()=>{const r=await request('/api/retrospectiva',{token});assert.equal(r.treinos[0].exercicios.length,1);});
  await check('upload corporal bloqueado',()=>request(`/api/medidas/${randomUUID()}/fotos`,{token,method:'POST',body:{},status:410}));
  const medida = {data:day,pesoKg:70,...Object.fromEntries(['pescoco','toraxMesoesternal','toraxMamilo','ultimaCostela','cintura','quadril','bracoEsquerdo','bracoDireito','antebracoEsquerdo','antebracoDireito','pernaEsquerda','pernaDireita','panturrilhaEsquerda','panturrilhaDireita'].map(k=>[k,50])),...Object.fromEntries(['peitoral','axilarMedia','triceps','subescapular','abdominal','suprailiaca','coxaDobra'].map(k=>[k,12]))};
  const mk=randomUUID();
  const [m1,m2]=await Promise.all([1,2].map(()=>request('/api/medidas',{token,method:'POST',body:medida,key:mk,status:201})));
  await check('medição concorrente idempotente cria um registro',async()=>assert.equal(m1.id,m2.id));
  await check('nova chave na mesma data retorna conflito',()=>request('/api/medidas',{token,method:'POST',body:medida,key:randomUUID(),status:409}));
  await request('/api/usuario/informacoes-pessoais',{token,method:'PUT',body:{nome:'=1+1',sexo:'Masculino',dataNascimento:'1990-01-01',alturaCm:180},status:204});
  await check('alterar perfil recalcula IMC histórico',async()=>{const medidas=await request('/api/medidas',{token});assert.ok(Math.abs(medidas[0].imc-21.60)<0.02);});
  await check('medidas de outra conta não aparecem',async()=>assert.equal((await request('/api/medidas',{token:b.token})).length,0));
  await check('exportação privada ZIP',async()=>{const zip=await request('/api/usuario/exportar',{token});assert.equal(zip.subarray(0,2).toString(),'PK'); await mkdir('.local',{recursive:true});await writeFile('.local/v2-export.zip',zip);});
  await check('exportação exige autenticação',()=>request('/api/usuario/exportar',{status:401}));
  await check('avatar privado válido e troca inválida preserva arquivo',async()=>{
    const png=await readFile('client/public/icon-192.png');
    const enviar=async(bytes,nome)=>{const form=new FormData();form.append('arquivo',new Blob([bytes]),nome);return fetch(origin+'/api/usuario/avatar',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form});};
    assert.equal((await enviar(png,'ficticio.png')).status,200);
    const antes=await request('/api/usuario/avatar/arquivo',{token});
    assert.equal((await enviar(Buffer.from('arquivo de texto fictício, imagem inválida'),'falso.jpg')).status,400);
    const chunks=[png.subarray(0,8)];
    for(let offset=8;offset+12<=png.length;){const length=png.readUInt32BE(offset);const type=png.toString('ascii',offset+4,offset+8);if(type==='IHDR'||type==='IEND')chunks.push(png.subarray(offset,offset+12+length));offset+=12+length;}
    assert.equal((await enviar(Buffer.concat(chunks),'sem-pixels.png')).status,400);
    assert.deepEqual(await request('/api/usuario/avatar/arquivo',{token}),antes);
    await request('/api/usuario/avatar/arquivo',{token:b.token,status:404});
  });
  await check('sessão absoluta de trinta dias',async()=>{const p=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));const restante=p.exp-Math.floor(Date.now()/1000);assert.ok(restante<=30*86400 && restante>29*86400);});
  const psql=fileURLToPath(new URL('../../postgresql/pgsql/bin/psql.exe',import.meta.url));
  const lerCodigo=()=>execFileSync(psql,['-h','127.0.0.1','-p','55432','-U','personalite_local','-d','personalite_v2_local','-At','-c',`SELECT c."Codigo" FROM "CodigosVerificacao" c JOIN "Usuarios" u ON c."UsuarioId"=u."Id" WHERE u."Email"='a_${suffix}@example.invalid' AND NOT c."Usado" ORDER BY c."CriadoEmUtc" DESC LIMIT 1`],{encoding:'utf8'}).trim();
  await request('/api/usuario/email/solicitar-verificacao',{token,method:'POST',body:{},status:204});
  await request('/api/usuario/email/confirmar-verificacao',{token,method:'POST',body:{codigo:lerCodigo()},status:204});
  await request('/api/auth/esqueci-senha',{method:'POST',body:{email:`a_${suffix}@example.invalid`},status:204});
  const codigo=lerCodigo();
  assert.match(codigo,/^\d{6}$/);  const reset={email:`a_${suffix}@example.invalid`,codigo,novaSenha:randomUUID()};
  await check('redefinição consome código e revoga sessão antiga',async()=>{
    await request('/api/auth/redefinir-senha',{method:'POST',body:reset,status:204});
    await request('/api/usuario',{token,status:401});
    await request('/api/auth/redefinir-senha',{method:'POST',body:reset,status:400});
    const nova=await request('/api/auth/login',{method:'POST',body:{nomeUsuario:`v2_a_${suffix}`,senha:reset.novaSenha}});
    await request('/api/usuario',{token:nova.token});
  });
  await writeFile('.local/v2-integration-results.json',JSON.stringify({date:new Date().toISOString(),results},null,2));
  console.log(`${results.length} verificações locais aprovadas.`);
} catch(e) { console.error(e.message); process.exitCode=1; }
