const p=require('puppeteer-core');const B=process.env.URL||'http://127.0.0.1:18437/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'],protocolTimeout:60000});
const out={};const errs=[];
async function page(q){const pg=await b.newPage();pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});await pg.setViewport({width:412,height:915,deviceScaleFactor:1});
 await pg.goto(B+q,{waitUntil:'networkidle2'});await pg.waitForFunction(()=>window.__UF&&__UF.state==='title',{timeout:30000});return pg;}
// 1) title with missions (normal)
let pg=await page('?x=1');await sleep(1500);await pg.screenshot({path:'/workspace/unicorn/shots/v11-title-missions.png'});
out.title=await pg.evaluate(()=>({v:document.querySelector('script[src^=game]').src,ms:__UF.dbg.ms.act,coins:__UF.coins}));
// 2) gameplay autoplay
await pg.evaluate(()=>{__UF.auto=true;});await pg.mouse.click(206,600);
await pg.waitForFunction(()=>__UF.state==='play'&&__UF.score>=4,{timeout:60000,polling:500}).catch(e=>out.playErr=e.message);
for(let i=0;i<20;i++){const ok=await pg.evaluate(()=>{const u=__UF.uni;return __UF.pipes.some(p=>p.x>u.x+20&&p.x<u.x+170);});if(ok)break;await sleep(200);}
await pg.screenshot({path:'/workspace/unicorn/shots/v11-gameplay-shine.png'});
out.play=await pg.evaluate(()=>({score:__UF.score,glit:__UF.dbg.glit(),ft:__UF.ft,parts:__UF.parts.length,state:__UF.state}));
await pg.close();
// 3) test=missions: should complete + pay
pg=await page('?test=missions');await sleep(800);
const c0=await pg.evaluate(()=>{localStorage.removeItem('uf_ms_test');return __UF.coins;});
await pg.evaluate(()=>{__UF.auto=true;});await pg.mouse.click(206,600);
await pg.waitForFunction(()=>__UF.dbg.ms.done>=3||__UF.state!=='play',{timeout:90000,polling:500}).catch(e=>out.msErr=e.message);
await pg.waitForFunction(()=>__UF.toasts.length>0,{timeout:5000}).catch(()=>{});
await pg.screenshot({path:'/workspace/unicorn/shots/v11-mission-toast.png'});
out.ms=await pg.evaluate(c0=>({done:__UF.dbg.ms.done,coinsGained:__UF.coins-c0,act:__UF.dbg.ms.act,state:__UF.state,toasts:__UF.toasts.map(t=>t.t),ft:__UF.ft,lb:__UF.lb.length,realMs:localStorage.getItem('uf_ms')!=null}),c0);
// game over screen with missions
await pg.evaluate(()=>{__UF.auto=false;});await pg.waitForFunction(()=>__UF.state==='over',{timeout:60000,polling:500}).catch(e=>out.overErr=e.message);await sleep(2500);
await pg.screenshot({path:'/workspace/unicorn/shots/v11-over-missions.png'});
// shop with mission skins
out.shop=await pg.evaluate(()=>{__UF.state='shop';__UF.shopSel='chrome';return __UF.owned;});await sleep(1500);await pg.screenshot({path:'/workspace/unicorn/shots/v11-shop.png'});
// reduce flashing render check
await pg.evaluate(()=>{__UF.rf=true;__UF.state='title';});await sleep(1500);
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close();})();
