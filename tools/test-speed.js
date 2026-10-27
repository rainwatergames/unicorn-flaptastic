const puppeteer=require('puppeteer-core');const BASE=process.argv[2]||'http://127.0.0.1:18437/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:60000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/AudioContext/.test(m.text()))errs.push(m.text())});
await p.emulate({viewport:{width:412,height:915,deviceScaleFactor:1,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile'});
await p.goto(BASE+'?test=speed');await p.waitForFunction(()=>window.__UF&&__UF.state==='title',{timeout:20000});await p.touchscreen.tap(206,400);
await p.evaluate(()=>{__UF.auto=true;__UF.inv=99999;});const r={start:await p.evaluate(()=>__UF.runT)};
await p.waitForFunction('__UF.runT>=300.3',{timeout:90000});await sleep(300);r.words=await p.evaluate(()=>__UF.words.map(w=>w.t||w.text||w.s).join('|'));await p.screenshot({path:'/workspace/unicorn/shots/v033-speedmode.png'});
const samp=[];for(let i=0;i<6;i++){samp.push(await p.evaluate(()=>[+__UF.runT.toFixed(1),+__UF.speed.toFixed(1)]));await sleep(1500);}r.samp=samp;
for(const T of [600,900,1200,1500]){await p.evaluate(T=>{__UF.runT=T;},T);await sleep(2500);r['t'+T]=await p.evaluate(()=>({runT:+__UF.runT.toFixed(0),speed:+__UF.speed.toFixed(0),ms:__UF.spdMs,state:__UF.state}));}
await p.screenshot({path:'/workspace/unicorn/shots/v033-ludicrous.png'});r.errs=errs;console.log(JSON.stringify(r));await b.close();})();
