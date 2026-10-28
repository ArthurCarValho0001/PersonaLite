import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
// Local-only benchmark harness: never included in the application bundle.
const [root, mode, output = '.local/auth-measurements.jsonl'] = process.argv.slice(2);
if (!root || !mode) throw new Error('Uso: node auth-measure-server.mjs <dist> <before|after> [output.jsonl]');
fs.mkdirSync(path.dirname(output), { recursive: true });
const instrumentation = `
const mode = ${JSON.stringify(mode)};
const key = '__local_auth_measure';
let run = JSON.parse(sessionStorage.getItem(key) || 'null');
if (run && run.mode !== mode) run = null;
const now = () => performance.timeOrigin + performance.now();
function save() { if (!run) return; sessionStorage.setItem(key, JSON.stringify(run)); fetch('/__measure', {method:'POST',body:JSON.stringify(run)}); }
if (run) { run.documents++; save(); }
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  const route = new URL(url, location.href).pathname;
  this.addEventListener('readystatechange', () => {
    if (this.readyState !== 4) return;
    if (this.status === 200 && (route === '/api/auth/login' || route === '/api/auth/registrar')) {
      run = {mode, auth:route, started:now(), userGets:0, documents:0, usableMs:null, calls:[]};
      save();
    } else if (run && route.startsWith('/api/')) {
      if (route === '/api/usuario' && method.toUpperCase() === 'GET') run.userGets++;
      run.calls.push({method,route,status:this.status,ms:Math.round((now()-run.started)*10)/10}); save();
    }
  });
  return originalOpen.call(this,method,url,...args);
};
function check() {
  if (!run || run.usableMs !== null || !document.querySelector('.dashboard__cabecalho a[href="/treinos"]')) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!run || run.usableMs !== null) return;
    run.usableMs = Math.round((now()-run.started)*10)/10; save();
    const out = document.createElement('output'); out.id='local-auth-metrics'; out.textContent='Medição local: '+JSON.stringify({mode,auth:run.auth,usableMs:run.usableMs,userGets:run.userGets,documents:run.documents}); document.body.append(out);
  }));
}
new MutationObserver(check).observe(document.documentElement,{childList:true,subtree:true});
check();
`;
http.createServer((req,res) => {
  if(req.url === '/__measure' && req.method === 'POST') {
    let data=''; req.on('data', c=>data+=c); req.on('end',()=>{fs.appendFileSync(output,data+'\n');res.writeHead(204).end();});return;
  }
  if(req.url === '/__instrument.js') {res.setHeader('Content-Type','text/javascript');res.end(instrumentation);return;}
  const relative = decodeURIComponent(req.url.split('?')[0]);
  let file = path.resolve(root,'.'+relative);
  if (!file.startsWith(path.resolve(root)+path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file=path.join(root,'index.html');
  const type = {'.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.html':'text/html'}[path.extname(file)] || 'application/octet-stream';
  res.setHeader('Content-Type',type);res.setHeader('Cache-Control','no-store');
  if(file.endsWith('index.html')) {
    let html=fs.readFileSync(file,'utf8').replace(/<script id="vite-plugin-pwa:register-sw"[^>]*><\/script>/,'');
    res.end(html.replace('<head>','<head><script src="/__instrument.js"></script>'));
  } else fs.createReadStream(file).pipe(res);
}).listen(5173,'localhost',()=>console.log(mode+' measurement on http://localhost:5173'));
