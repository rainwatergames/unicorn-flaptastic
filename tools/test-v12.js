const p=require('puppeteer-core');const B=process.env.URL||'http://127.0.0.1:18437/';const SH=process.env.SH||'/workspace/unicorn/shots/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'],protocolTimeout:120000});
const out={};const errs=[];
async function page(q){const pg=await b.newPage();pg.on('pageerror',e=>errs.push(q+': '+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(q+': '+m.text());});
 await pg.setViewport({width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:1});await pg.goto(B+q,{waitUntil:'networkidle2'});await pg.waitForFunction(()=>window.__UF&&__UF.state==='title',{timeout:30000});return pg;}
const only=process.env.ONLY;
// title selector
let pg;
if(!only||only==='title'){pg=await page('?x=2');await sleep(1200);await pg.screenshot({path:SH+'v12-title-modes.png'});
 // tap the right arrow on the selector -> mode changes
 const r=await pg.evaluate(()=>{const c=document.getElementById('c').getBoundingClientRect();const bt=__UF.dbg&&0;return {cw:c.width,ch:c.height,cl:c.left,ct:c.top,sel:__UF.sel};});
 const W=await pg.evaluate(()=>{const c=document.getElementById('c');return Math.round(640*c.getBoundingClientRect().width/c.getBoundingClientRect().height);});
 const sc=r.ch/640;await pg.touchscreen.tap(r.cl+(W-30)*sc,r.ct+478*sc);await sleep(500);
 out.title={before:r.sel,after:await pg.evaluate(()=>__UF.sel),state:await pg.evaluate(()=>__UF.state),daily:await pg.evaluate(()=>__UF.dbg.p2.daily())};
 await pg.screenshot({path:SH+'v12-title-daily.png'});await pg.close();}
for(const m of ['disco','tiny','gravity','gold','chaos']){if(only&&only!==m)continue;pg=await page('?test='+m);await pg.evaluate(()=>{__UF.auto=true;});await pg.touchscreen.tap(206,600);
 await sleep(2500);const st0=await pg.evaluate(()=>({state:__UF.state,mode:__UF.mode}));
 await pg.evaluate(()=>{__UF.inv=0;});let shot=false;const evs=new Set();
 for(let i=0;i<40;i++){await sleep(500);const s=await pg.evaluate(()=>{if(__UF.state==='play'&&__UF.inv<1)__UF.inv=3;return {t:__UF.tilt&&__UF.tilt.kind,ev:__UF.ev&&__UF.ev.type,lo:!!__UF.lo,fan:!!__UF.fan,fr:__UF.frenzy>0,mv:__UF.pipes.filter(p=>p.mv).length,sc:__UF.score};});
  if(s.t)evs.add('tilt:'+s.t);if(s.ev)evs.add(s.ev);if(s.lo)evs.add('lights');if(s.fan)evs.add('fan');if(s.fr)evs.add('frenzy');if(s.mv)evs.add('moving');
  if(!shot&&i===8){await pg.screenshot({path:SH+'v12-mode-'+m+'.png'});shot=true;}}
 out[m]={start:st0,after:await pg.evaluate(()=>({state:__UF.state,mode:__UF.mode,score:__UF.score,gems:__UF.gems,ft:__UF.ft,R:__UF.uni&&0,gaps:__UF.pipes.map(p=>Math.round(p.gap)).join(','),gT:__UF.gT,flips:__UF.flips12})),events:[...evs]};
 // let it die -> over screen should say no leaderboard
 await pg.evaluate(()=>{__UF.auto=false;__UF.inv=0;});await pg.waitForFunction(()=>__UF.state==='over',{timeout:30000,polling:300}).catch(e=>out[m].overErr=e.message);await sleep(2200);
 out[m].over=await pg.evaluate(()=>({entry:!!__UF.entry,best:__UF.best,mbest:localStorage.getItem('uf_mbest'),ufbest:localStorage.getItem('uf_best')}));
 if(m==='disco'||m==='tiny')await pg.screenshot({path:SH+'v12-over-'+m+'.png'});await pg.close();}
if(!only||only==='worlds'){pg=await page('?test=worlds');await pg.evaluate(()=>{__UF.auto=true;});await pg.touchscreen.tap(206,600);const W={},log=[];let tel=0,gust=0;const t0=Date.now();const seen={};
 while(Date.now()-t0<240000){await sleep(300);const s=await pg.evaluate(()=>{const G=__UF;if(G.state==='play')G.inv=3;const b=G.boss;
   // test acceleration: skip the quiet stretch before each world boundary
   if(!b&&!G.bossPend&&G.wf>=1&&G.state==='play'){const nb=(Math.floor(G.runT/20)+1)*20;if(nb-G.runT>2.5&&G.__shot)G.runT=nb-1.5;}
   return {st:G.state,w:G.world,wf:G.wf,b:b?{k:b.k,t:+b.t.toFixed(1),tel:b.tel,gust:b.gust>0,arrows:G.pipes.filter(p=>p.gyN!=null).length}:null,pend:G.bossPend,runT:+G.runT.toFixed(1),ft:G.ft,bossN:G.bossN,wfl:G.dbg?0:0};});
  if(s.st!=='play'){log.push('state '+s.st);break;}
  if(s.b&&!seen['b'+s.b.k]){seen['b'+s.b.k]=1;log.push('boss'+s.b.k+' start@runT '+s.runT);}
  if(s.b&&s.b.tel&&s.b.arrows&&!tel){tel=1;await pg.screenshot({path:SH+'v12-boss-telegraph.png'});log.push('telegraph arrows '+s.b.arrows);}
  if(s.b&&s.b.gust&&!seen['g'+s.b.k]){seen['g'+s.b.k]=1;log.push('gust'+s.b.k);if(!gust){gust=1;await pg.screenshot({path:SH+'v12-boss-gust.png'});}}
  if(s.b&&seen['g'+s.b.k]&&s.b.t<12)await pg.evaluate(()=>{__UF.boss.t=12.2;});
  if(!s.b&&s.wf>=1&&!W[s.w]){const ok=await pg.evaluate(()=>{const u=__UF.uni;return __UF.pipes.some(p=>p.x>u.x+20&&p.x<u.x+200);});if(ok){W[s.w]=s.runT;await pg.screenshot({path:SH+'v12-world-'+['candy','stars','cave','chrome'][s.w]+'.png'});await pg.evaluate(()=>{__UF.__shot=1;});log.push('world'+s.w+' shot');}}
  else if(!s.b)await pg.evaluate(()=>{__UF.__shot=1;});
  if(W[3]!=null&&s.bossN>=4&&s.w===0)break;}
 out.worlds={reached:W,log,final:await pg.evaluate(()=>({w:__UF.world,bossN:__UF.bossN,score:__UF.score,ft:__UF.ft,state:__UF.state}))};await pg.close();}
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close();})();
