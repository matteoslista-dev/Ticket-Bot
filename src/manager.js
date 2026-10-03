import { chromium } from 'playwright';

export class Manager {
  constructor({headless=false}={}) { this.headless=headless; this.sessions=[]; this.busy=false; }
  snapshot() { return this.sessions.map(({id,status,error})=>({id,status,error})); }
  async start({url,count=5,selector='',admissionText=''}) {
    const target=new URL(url);
    if (!['http:','https:'].includes(target.protocol)) throw new Error('Use an HTTP or HTTPS URL.');
    if (!Number.isInteger(count)||count<1||count>50) throw new Error('Session count must be 1–50.');
    if (this.busy||this.sessions.length) throw new Error('Close existing sessions before starting again.');
    this.busy=true;
    try {
      for(let id=1;id<=count;id++) {
        const session={id,status:'opening',browser:null,page:null}; this.sessions.push(session);
        try {
          session.browser=await chromium.launch({headless:this.headless,executablePath:process.env.TICKET_BROWSER_PATH||undefined});
          const context=await session.browser.newContext();
          session.page=await context.newPage();
          session.browser.on('disconnected',()=>{session.status='closed';});
          await session.page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
          session.status='waiting';
          if(selector||admissionText) {
            // Observe the existing page only; never refresh, solve CAPTCHAs or submit forms.
            session.timer=setInterval(async()=>{
              if(session.checking||session.status!=='waiting') return;
              session.checking=true;
              try {
                let admitted=false;
                for(const frame of session.page.frames()) {
                  const marker=selector?frame.locator(selector):frame.getByText(admissionText,{exact:true});
                  if(await marker.first().isVisible()) {admitted=true;break;}
                }
                if(admitted) {
                  await this.admit(id); clearInterval(session.timer);
                }
              } catch(error) {session.error=error.message;}
              finally {session.checking=false;}
            },2000);
            session.timer.unref();
          }
        } catch(error) { session.status='error'; session.error=error.message; }
      }
    } finally {this.busy=false;}
  }
  get(id) {const session=this.sessions.find(s=>s.id===id); if(!session?.page||session.page.isClosed()) throw new Error('Session is not open.'); return session;}
  async focus(id) {await this.get(id).page.bringToFront();}
  async admit(id) {const s=this.get(id); await s.page.bringToFront(); s.status='admitted';}
  async close() {
    if(this.busy) throw new Error('Wait until opening finishes before closing.');
    for(const s of this.sessions) {clearInterval(s.timer); await s.browser?.close();}
    this.sessions=[];
  }
}
