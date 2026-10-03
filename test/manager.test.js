import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {Manager} from '../src/manager.js';
test('isolated sessions, manual challenge, admission detection and cleanup',async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<button onclick="document.cookie=\'participant=one\';document.body.innerHTML=\'<h1 id=admitted>Admitted</h1>\'">Manual challenge</button>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const manager=new Manager({headless:true});
 try {
  await manager.start({url:`http://127.0.0.1:${server.address().port}`,count:2,selector:'#admitted'});
  assert.deepEqual(manager.snapshot().map(s=>s.status),['waiting','waiting']);
  await manager.sessions[0].page.getByRole('button').click();
  assert.equal(await manager.sessions[1].page.evaluate(()=>document.cookie),'');
  const deadline=Date.now()+10000;
  while(manager.snapshot()[0].status!=='admitted'&&Date.now()<deadline) await new Promise(r=>setTimeout(r,100));
  assert.equal(manager.snapshot()[0].status,'admitted');assert.equal(manager.snapshot()[1].status,'waiting');
  await manager.focus(2);await manager.admit(2);assert.equal(manager.snapshot()[1].status,'admitted');
  await assert.rejects(manager.start({url:'http://localhost',count:21}),/1–20/);
 } finally {await manager.close();await new Promise(r=>server.close(r));}
 assert.deepEqual(manager.snapshot(),[]);
});
