const puppeteer=require('puppeteer-core');
const OUT='/workspace/unicorn/shots/';const URL=process.argv[2]||'http://127.0.0.1:8765/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();const errs=[];
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 p.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
 await p.emulate({viewport:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'});
 await p.goto(URL,{waitUntil:'load'});
 await sleep(300);const splash=await p.evaluate(()=>!!document.getElementById('splash')&&__UF.state);
 await p.screenshot({path:OUT+'loading.png'});
 await p.waitForFunction(()=>__UF.state==='title',{timeout:8000});await sleep(900);
 await p.screenshot({path:OUT+'title.png'});
 const r={splash};
 // tap-flap
 await p.touchscreen.tap(195,500);await sleep(60);
 r.afterTap=await p.evaluate(()=>({s:__UF.state,vy:__UF.uni.vy}));
 // manual autopilot via real touch taps
 let t0=Date.now();
 while(Date.now()-t0<25000&&!(await p.evaluate(()=>__UF.score>=3))){const st=await p.evaluate(()=>{const G=__UF,u=G.uni;const pp=G.pipes.find(q=>q.x+66>u.x-17);return {s:G.state,y:u.y,vy:u.vy,ty:pp?pp.gy+14:320,score:G.score};});
  if(st.s!=='play')break; if(st.y>st.ty&&st.vy>-50)await p.touchscreen.tap(200,600); await sleep(25);}
 r.manual=await p.evaluate(()=>({s:__UF.state,score:__UF.score}));
 await p.screenshot({path:OUT+'gameplay.png'});
 // ensure we're playing, then autopilot to frenzy
 await p.evaluate(()=>{__UF.auto=true;});
 if(r.manual.s!=='play'){await p.evaluate(()=>__UF.state==='dying'?0:0);await p.waitForFunction(()=>__UF.state==='over',{timeout:5000}).catch(()=>{});await sleep(500);await p.touchscreen.tap(195,600);}
 await p.waitForFunction(()=>__UF.frenzy>0&&__UF.banner,{timeout:120000}).then(()=>r.frenzyReached=true).catch(()=>r.frenzyReached=false);
 await sleep(450);await p.screenshot({path:OUT+'frenzy.png'});
 r.frenzy=await p.evaluate(()=>({s:__UF.state,score:__UF.score,gems:__UF.gems,frenzy:__UF.frenzy}));
 // crash on purpose
 await p.evaluate(()=>{__UF.auto=false;});
 console.log(JSON.stringify(r),await p.evaluate(()=>JSON.stringify({s:__UF.state,y:__UF.uni.y,sc:__UF.score})));await p.waitForFunction(()=>__UF.state==='over',{timeout:30000});await sleep(2500);
 await p.screenshot({path:OUT+'gameover.png'});
 r.over=await p.evaluate(()=>({s:__UF.state,score:__UF.score,best:__UF.best,ls:localStorage.getItem('uf_best'),msg:__UF.msg}));
 const tr=Date.now();await p.touchscreen.tap(195,620);await sleep(30);
 r.retry=await p.evaluate(()=>({s:__UF.state,score:__UF.score,pipes:__UF.pipes.length}));r.retryMs=Date.now()-tr;
 // mute toggle
 await p.touchscreen.tap(368,32);await sleep(50);r.mute=await p.evaluate(()=>document.getElementById('mute').textContent+' '+localStorage.getItem('uf_mute'));
 r.audio=await p.evaluate(()=>typeof AudioContext);
 r.errs=errs;console.log(JSON.stringify(r,null,1));await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
