const puppeteer=require('puppeteer-core');const BASE=process.argv[2]||'http://127.0.0.1:18437/';const OUT='/workspace/unicorn/shots/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',protocolTimeout:60000,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const res=[];
for(const [vw,vh,tag] of (process.env.LAND?[[915,412,'landscape']]:[[412,915,'portrait'],[915,412,'landscape']]))for(const f of (process.env.LAND?['tilt']:['flip','tilt','rm'])){
 const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.emulate({viewport:{width:vw,height:vh,deviceScaleFactor:1,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile'});
 await p.goto(BASE+'?test='+(f==='rm'?'tilt':f));await p.evaluate(m=>{localStorage.setItem('uf_rm',m?'1':'0');},f==='rm');await p.reload();
 await p.waitForFunction(()=>window.__UF&&__UF.state==='title',{timeout:20000});await p.touchscreen.tap(vw/2,vh*0.45);
 await p.evaluate(()=>{__UF.auto=true;__UF.inv=9999;});
 if(f==='rm'){await p.waitForFunction('__UF.testT>6',{timeout:60000});const r=await p.evaluate(()=>({tilt:!!__UF.tilt,a:__UF.tiltA,rm:__UF.rm}));res.push({tag,f,...r,errs});await p.close();continue;}
 const samples=[];
 await p.waitForFunction('__UF.tilt&&__UF.tilt.t>0.05',{timeout:60000});
 // sample during transition and hold
 for(let i=0;i<14;i++){samples.push(await p.evaluate(()=>{const G=__UF,W=G.dbg.W(),H=640;const a=G.tiltA,F=G.dbg.tf(a),sc=F.z;const tf=(x,y)=>{const dx=(x-F.cx)*sc,dy=(y-F.cy)*sc;return [W/2+dx*Math.cos(a)-dy*Math.sin(a),H/2+dx*Math.sin(a)+dy*Math.cos(a)];};
   const inb=([x,y])=>x>=-1&&x<=W+1&&y>=-1&&y<=H+1;const u=G.uni;const ahead=G.pipes.filter(q=>q.x+66>u.x).slice(0,2);
   const pts=[tf(u.x,u.y)];for(const q of ahead){if(q.x<W){pts.push(tf(q.x+33,q.gy));}}
   return {t:+G.tilt?.t.toFixed(2),a:+a.toFixed(3),sc:+sc.toFixed(3),allIn:pts.every(inb),bad:pts.filter(q=>!inb(q)).map(q=>q.map(Math.round).join(','))+' u'+Math.round(u.x)+':'+Math.round(u.y)+' g'+ahead.map(q=>Math.round(q.x)+':'+Math.round(q.gy)).join(' ')};}));await sleep(150);}
 await p.waitForFunction('__UF.tilt&&__UF.tilt.t>1.6',{timeout:60000});await p.screenshot({path:OUT+`v033-${f}-${tag}.png`});
 res.push({tag,f,W:await p.evaluate(()=>__UF.dbg.W()),minSc:Math.min(...samples.map(s=>s.sc)),holdSc:samples[samples.length-1].sc,allIn:samples.every(s=>s.allIn),samples:samples.map(s=>s.a+'/'+s.sc+(s.allIn?'':' BAD['+s.bad+']')).join(' | '),errs});await p.close();}
console.log(JSON.stringify(res,null,1));await b.close();})();
