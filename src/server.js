import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {Manager} from './manager.js';
const manager=new Manager();
const html=await readFile(new URL('./index.html',import.meta.url));
const port=Number(process.env.PORT||8787);
const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const origin=`http://127.0.0.1:${port}`;
  if(req.headers.host!==`127.0.0.1:${port}`) {res.writeHead(403).end();return;}
  if(req.method==='GET'&&req.url==='/') {res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
  if(req.method==='GET'&&req.url==='/api/sessions') {res.setHeader('Content-Type','application/json');res.end(JSON.stringify({busy:manager.busy,sessions:manager.snapshot()}));return;}
  if(req.method!=='POST'||req.headers.origin!==origin||req.headers['content-type']!=='application/json') {res.writeHead(403).end();return;}
  try {
    let body='';for await(const chunk of req) {body+=chunk;if(body.length>4096) throw new Error('Request too large.');}
    const data=JSON.parse(body);
    if(req.url==='/api/start') await manager.start(data);
    else if(req.url==='/api/focus') await manager.focus(data.id);
    else if(req.url==='/api/admit') await manager.admit(data.id);
    else if(req.url==='/api/close') await manager.close();
    else {res.writeHead(404).end();return;}
    res.setHeader('Content-Type','application/json');res.end('{}');
  } catch(error) {res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}
});
server.listen(port,'127.0.0.1',()=>console.log(`Session manager: http://127.0.0.1:${port}`));
async function shutdown(){if(manager.busy) {setTimeout(shutdown,500);return;}await manager.close();server.close();}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
