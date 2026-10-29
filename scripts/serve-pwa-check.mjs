// Isolated PWA lifecycle fixture. Serves only loopback and a built client.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('client/dist');let version=1;
const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Validação PWA local</title><body><h1>Validação PWA local</h1><p>Dados fictícios; origem isolada 5174.</p><label>Rascunho de teste <input id="draft"></label><button id="control">Reabrir sob controle do worker</button><button id="update">Simular nova versão</button><button id="probe">Consultar API fictícia</button><pre id="status"></pre><script>
const documentId=crypto.randomUUID();let probes=0;let registration;
document.querySelector('#control').onclick=()=>location.reload();
document.querySelector('#update').onclick=async()=>{await fetch('/__next',{method:'POST'});await registration.update();};
document.querySelector('#probe').onclick=async()=>{await fetch('/api/private-probe');probes++;await show();};
async function show(){const cachesNames=await caches.keys();let privateEntries=0;for(const name of cachesNames){for(const request of await (await caches.open(name)).keys()){if(new URL(request.url).pathname.startsWith('/api/'))privateEntries++;}}document.querySelector('#status').textContent=JSON.stringify({documentId,controlled:!!navigator.serviceWorker.controller,waiting:!!registration?.waiting,active:registration?.active?.state,privateEntries,probes,draft:document.querySelector('#draft').value},null,2);}
(async()=>{registration=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;await show();setInterval(show,1000);})();
</script></body></html>`;
http.createServer(async(req,res)=>{res.setHeader('Cache-Control','no-store');if(req.url==='/api/pwa-check'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}if(req.url==='/__next'&&req.method==='POST'){version++;res.end('ok');return;}if(req.url==='/api/private-probe'){res.setHeader('Content-Type','application/json');res.end('{"ficticio":true}');return;}try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();let content=await readFile(file);if(file.endsWith('sw.js'))content=Buffer.concat([content,Buffer.from('\n// local validation version '+version)]);res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(content);}catch{res.statusCode=404;res.end();}}).listen(5174,'127.0.0.1',()=>console.log('PWA fixture: http://localhost:5174/api/pwa-check'));
