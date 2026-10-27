const puppeteer=require('puppeteer-core');const OUT='/workspace/unicorn/shots/';const URL=process.argv[2]||'http://127.0.0.1:18437/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:60000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.emulate({viewport:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile'});
 const tapG=async(x,y)=>{const c=await p.evaluate((x,y)=>{const r=document.getElementById('c').getBoundingClientRect();const W=__UF.W||r.width/r.height*640;return [r.left+x*r.width/(r.width/r.height*640),r.top+y*r.height/640];},x,y);await p.touchscreen.tap(c[0],c[1]);await sleep(120);};
 const btnTap=async id=>{await p.waitForFunction(id=>__UF.ui.btns.some(b=>b.id===id),{timeout:20000},id).catch(()=>{});const bb=await p.evaluate(id=>{const b=__UF.ui.btns.find(b=>b.id===id);return b&&[b.x+b.w/2,b.y+b.h/2];},id);if(!bb)throw new Error('no button '+id);await tapG(bb[0],bb[1]);};
 const r={};globalThis.R=r;const L=s=>console.log('STEP',s,Date.now()%100000);
 await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForFunction(()=>__UF.state==='title',{timeout:10000});await sleep(600);
 await p.screenshot({path:OUT+'v03-title.png'});
 L('shop');if(process.env.ONLYFAN){await tapG(150,380);await p.evaluate(()=>{__UF.auto=true;});await p.waitForFunction(()=>__UF.score>=1,{timeout:20000});r.lo={s:'play'};L('fan');} else {
 await p.evaluate(()=>{__UF.coins=200;});await btnTap('shop');r.shopState=await p.evaluate(()=>__UF.state);
 await btnTap('sk_cat');await btnTap('buy');await sleep(250);await p.screenshot({path:OUT+'v03-shop.png'});
 r.afterBuy=await p.evaluate(()=>({coins:__UF.coins,skin:__UF.skin,owned:__UF.owned}));
 await btnTap('sk_llama');await btnTap('buy');await btnTap('sk_cat');await btnTap('equip');
 await p.reload();await p.waitForFunction(()=>__UF.state==='title',{timeout:10000});
 r.persist=await p.evaluate(()=>({coins:__UF.coins,skin:__UF.skin,owned:__UF.owned,ls:localStorage.getItem('uf_owned')}));
 L('settings');
 await sleep(300);await btnTap('settings');await btnTap('MUSIC VOLUME-');await btnTap('rf');r.settings=await p.evaluate(()=>({s:__UF.state,mv:__UF.mv,rf:__UF.rf,ls:localStorage.getItem('uf_mv')}));await btnTap('rf');await btnTap('back');
 L('run');// + leaderboard entry
 await tapG(150,380);await p.evaluate(()=>{__UF.auto=true;});await p.waitForFunction(()=>__UF.score>=4,{timeout:60000});await p.evaluate(()=>{__UF.auto=false;});
 await p.waitForFunction(()=>__UF.state==='over',{timeout:20000});await sleep(900);
 r.over=await p.evaluate(()=>({score:__UF.score,run:__UF.runCoins,coins:__UF.coins,entry:!!__UF.entry}));
 await p.screenshot({path:'/tmp/over.png'});r.btns=await p.evaluate(()=>__UF.ui.btns.map(b=>b.id).join());await btnTap('up0');await btnTap('up0');await btnTap('dn2');await p.screenshot({path:OUT+'v03-entry.png'});
 await btnTap('ov-lb');await sleep(300);await p.screenshot({path:OUT+'v03-leaderboard.png'});
 await p.reload();await p.waitForFunction(()=>__UF.state==='title',{timeout:10000});r.lb=await p.evaluate(()=>localStorage.getItem('uf_lb'));
 // fairness of moving hazards (geometry sweep)
 r.fair=await p.evaluate(()=>{const G=__UF,out={};for(const mv of ['slide','jaw','pin','arm','cannon','cloud']){let minFree=1e9,blockedCenter=0;
   for(let rep=0;rep<5;rep++){G.forceMv=mv;G.n=20;const before=G.pipes.length;G.dbg?0:0;G.spawnX=400;}
   out[mv]=1;}return out;});
 L('vomit');
 await tapG(150,380);await p.evaluate(()=>{__UF.auto=true;__UF.forceTaco=true;});
 await p.waitForFunction(()=>__UF.vom&&__UF.vom.kills>=1,{timeout:60000});await sleep(250);await p.screenshot({path:OUT+'v03-vomit.png'});
 await p.waitForFunction(()=>!__UF.vom,{timeout:10000});r.vomit=await p.evaluate(()=>({kills:__UF.kills,s:__UF.state}));
 L('moving');//: jump difficulty, check collisions programmatically
 r.mvCheck=await p.evaluate(()=>{const G=__UF,res={};const u0={x:0,y:0};
  for(const mv of ['slide','jaw','pin','arm','cannon','cloud']){const p={x:100,gy:320,gap:180,gy0:320,gap0:180,mv,ph:0,type:'cane',id:30,side:-1,amp:40,cd:1};
   if(mv==='pin'||mv==='arm')p.gap=p.gap0=216;if(mv==='jaw')p.gap=p.gap0=190;
   let minCorr=1e9,hitsCenterTop=0,hitsMid=0;
   for(let t=0;t<6;t+=0.05){G.dbg.mv(p,0.05);const cx_=p.x+33;let best=0,run=0;for(let y=p.gy-p.gap/2-20;y<p.gy+p.gap/2+20;y+=2){if(!G.dbg.hit(p,{x:cx_,y})){run+=2;best=Math.max(best,run);}else run=0;}minCorr=Math.min(minCorr,best);
    if(G.dbg.hit(p,{x:cx_,y:p.gy-p.gap/2-40}))hitsCenterTop++;}
   res[mv]={minFreeCorridor:minCorr,solidHits:hitsCenterTop};}
  return res;});
 await p.evaluate(()=>{__UF.n=Math.max(__UF.n,22);__UF.forceMv='arm';});await sleep(200);await p.evaluate(()=>{__UF.forceMv='cannon';});
 await p.waitForFunction(()=>__UF.pipes.some(q=>q.mv&&q.x<300&&q.x>80)&&__UF.shots.length>0||__UF.state!=='play',{timeout:30000}).catch(()=>{});await p.screenshot({path:OUT+'v03-moving.png'});
 r.moving=await p.evaluate(()=>({s:__UF.state,mv:__UF.pipes.map(q=>q.mv||'-').join(','),shots:__UF.shots.length}));
 if(r.moving.s!=='play'){await p.waitForFunction(()=>__UF.state==='over',{timeout:8000});await sleep(700);await btnTap('retry');await p.evaluate(()=>{__UF.auto=true;});}
 L('lo');
 await p.waitForFunction(()=>__UF.score>=1,{timeout:20000});await p.evaluate(()=>{__UF.forceLO=true;});
 await p.waitForFunction(()=>__UF.lo&&__UF.lo.t>0.9,{timeout:30000});await p.screenshot({path:OUT+'v03-raccoon.png'});
 await p.waitForFunction(()=>__UF.lo&&__UF.lo.t>2.4,{timeout:10000});await p.screenshot({path:OUT+'v03-dark.png'});r.loMode=await p.evaluate(()=>window.__UFA||null);
 await p.waitForFunction(()=>!__UF.lo,{timeout:10000});r.lo=await p.evaluate(()=>({s:__UF.state}));
 }L('fan2');
 if(r.lo.s!=='play'){await p.waitForFunction(()=>__UF.state==='over',{timeout:8000});await sleep(700);await btnTap('retry');await p.evaluate(()=>{__UF.auto=true;});}
 await p.evaluate(()=>{__UF.forceFan=true;});await p.waitForFunction(()=>__UF.fan&&__UF.fan.t>1.6,{timeout:30000});await sleep(150);await p.screenshot({path:OUT+'v03-fan-blow.png'});
 await p.evaluate(()=>{__UF.inv=99;});await p.waitForFunction(()=>__UF.fan&&__UF.fan.t>6,{timeout:30000});await p.screenshot({path:OUT+'v03-fan.png'});
 r.fanMid=await p.evaluate(()=>({pipes:__UF.pipes.filter(q=>!q.blown).length,junk:__UF.junk.length}));
 await p.waitForFunction(()=>!__UF.fan,{timeout:150000});await p.evaluate(()=>{__UF.inv=0;});await sleep(2500);r.fanAfter=await p.evaluate(()=>({s:__UF.state,pipes:__UF.pipes.length,dodged:__UF.dodged}));
 await p.screenshot({path:OUT+'v03-shimmer.png'});
 r.errs=errs;console.log(JSON.stringify(r,null,1));await b.close();})().catch(e=>{console.error('FAIL',e.message,JSON.stringify(globalThis.R));process.exit(1);});
