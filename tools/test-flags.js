const puppeteer=require('puppeteer-core');const BASE=process.argv[2]||'http://127.0.0.1:18437/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const CHK={fan:'!!__UF.fan',lights:'!!__UF.lo',taco:'!!__UF.vom||__UF.pipes.some(p=>p.gem&&p.gem.kind==="taco")',nuke:'!!__UF.ev||__UF.pipes.some(p=>p.gem&&p.gem.kind==="nuke")',tilt:'!!__UF.tilt',flip:'!!__UF.tilt',fart:'!!__UF.ev',moving:'__UF.pipes.some(p=>p.mv)'};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:60000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const out={};for(const f of (process.env.ONLY||Object.keys(CHK).join(',')).split(',')){const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/AudioContext/.test(m.text()))errs.push(m.text())});
 await p.emulate({viewport:{width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile'});
 await p.goto(BASE+'?test='+f);await p.waitForFunction(()=>window.__UF&&__UF.state==='title',{timeout:20000});await p.touchscreen.tap(195,380);const t0=Date.now();
 await p.evaluate(()=>{__UF.auto=true;__UF.inv=9999;});if(f==='fart')await p.evaluate(()=>{__UF.inv=0;});
 let ok=true;await p.waitForFunction(CHK[f],{timeout:60000,polling:50}).catch(()=>ok=false);
 const r={ok,wallS:(Date.now()-t0)/1000,gameT:await p.evaluate(()=>+(__UF.testT||0).toFixed(2)),state:await p.evaluate(()=>__UF.state),test:await p.evaluate(()=>__UF.test)};
 console.log(f,'pre',JSON.stringify(r));if(f==='fan'){await p.waitForFunction('__UF.fan&&__UF.fan.t>5',{timeout:60000}).catch(()=>{});await p.screenshot({path:'/workspace/unicorn/shots/v032-testfan.png'});
  await p.evaluate(()=>{__UF.inv=0;__UF.auto=false;__UF.fan=null;});await p.waitForFunction('__UF.state==="over"',{timeout:30000}).catch(async()=>console.log('nodie',await p.evaluate(()=>JSON.stringify({s:__UF.state,inv:__UF.inv,y:__UF.uni.y,a:__UF.auto}))));await sleep(4000);
  await p.screenshot({path:'/workspace/unicorn/shots/v032-testover.png'});r.over=await p.evaluate(()=>({entry:__UF.entry,run:__UF.runCoins,lb:localStorage.getItem('uf_lb')}));}
 r.errs=errs;out[f]=r;console.log(f,JSON.stringify(r));await p.close();}
await b.close();})();
