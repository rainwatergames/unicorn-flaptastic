/*!
 * UNICORN FLAP-TASTIC! (working title) v1.2.2 BETA
 * A Rainwater Games production.
 * © 2026 Rainwater Games (Jeff Rainwater). All rights reserved.
 * Unauthorized copying, modification or distribution of this game, its code or art is prohibited.
 */
(function(){
'use strict';
const VERSION='1.2.2',STAGE='BETA';
const COPY='© 2026 Rainwater Games (Jeff Rainwater). All rights reserved.';
const FONT='"Lilita One","Arial Rounded MT Bold","Trebuchet MS",sans-serif';
const RB=['#ff2d55','#ff8a00','#ffe600','#2ee66b','#1fb6ff','#7a5cff','#ff4fd8'];
const TAU=Math.PI*2;
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[(Math.random()*a.length)|0], clamp=(v,a,b)=>v<a?a:v>b?b:v;
const cv=document.getElementById('c');let cx=cv.getContext('2d'),BG=null;
let W=360,H=640,DPR=1,GY=570;
function resize(){
  const iw=innerWidth, ih=innerHeight; H=640; W=clamp(Math.round(H*iw/ih),300,520);
  DPR=Math.min(2,(window.devicePixelRatio||1))*Math.max(1,ih/H);
  const sc=Math.min(iw/W,ih/H); cv.style.width=Math.round(W*sc)+'px'; cv.style.height=Math.round(H*sc)+'px';
  cv.width=Math.round(W*sc*Math.min(2,window.devicePixelRatio||1)); cv.height=Math.round(H*sc*Math.min(2,window.devicePixelRatio||1));
  DPR=cv.width/W; GY=H-70; BG=null;
}
addEventListener('resize',resize); resize();

/* ================= AUDIO (all synthesized) ================= */
const A={ctx:null,master:null,mus:null,sfx:null,muted:false,step:0,next:0,timer:null,frenzy:false};
try{A.muted=localStorage.getItem('uf_mute')==='1';}catch(e){}
function aInit(){
  if(A.ctx){if(A.ctx.state==='suspended')A.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
  A.ctx=new C(); A.master=A.ctx.createGain(); A.master.gain.value=A.muted?0:0.8; A.master.connect(A.ctx.destination);
  A.mus=A.ctx.createGain(); A.mus.gain.value=0.32; A.mus.connect(A.master);
  A.sfx=A.ctx.createGain(); A.sfx.gain.value=0.7; A.sfx.connect(A.master);
  const len=A.ctx.sampleRate*0.3, b=A.ctx.createBuffer(1,len,A.ctx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1; A.noise=b;
  A.next=A.ctx.currentTime+0.1; A.timer=setInterval(sched,25);
}
function setMute(m){A.muted=m;try{localStorage.setItem('uf_mute',m?'1':'0');}catch(e){}
  if(A.master)A.master.gain.setTargetAtTime(m?0:0.8,A.ctx.currentTime,0.03); muteBtn.textContent=m?'🔇':'🔊';}
function tone(type,f,t,dur,vol,dest,f2,slide){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+(slide||dur));g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.008);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(dest||A.sfx);o.start(t);o.stop(t+dur+0.02);return o;}
function noise(t,dur,vol,hp,dest){const c=A.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=A.noise;f.type='highpass';f.frequency.value=hp;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest||A.sfx);s.start(t);s.stop(t+dur+0.02);}
const mtof=m=>440*Math.pow(2,(m-69)/12);
// bubblegum loop: C - G - Am - F, 150 bpm, 16th steps
const CH=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]];
const MEL=[0,2,1,2, 0,2,4,2, 1,-1,3,-1, 2,1,0,-1];
const MEL2=[2,-1,2,1, 0,-1,0,1, 2,3,4,3, 2,-1,1,-1];
function sched(){
  if(!A.ctx)return; const spb=60/(A.frenzy?172:150)/4;
  while(A.next<A.ctx.currentTime+0.15){
    const t=A.next, s=A.step%64, bar=(s/16)|0, st=s%16, ch=CH[bar];
    if(st%4===0)tone('sine',150,t,0.18,0.9,A.mus,45,0.12);               // kick
    if(st%4===2)noise(t,0.05,0.25,7000,A.mus);                          // hat
    if(st===4||st===12){noise(t,0.12,0.35,1500,A.mus);}               // clap
    const bn=ch[0]-24+((st%4===2)?12:0); if(st%2===0)tone('triangle',mtof(bn),t,0.16,0.55,A.mus);
    const pat=((A.step/64)|0)%2?MEL2:MEL, k=pat[st];
    if(k>=0){const n=ch[k%3]+12*(1+((k/3)|0)); tone('square',mtof(n),t,0.11,0.14,A.mus); tone('square',mtof(n)*1.005,t,0.09,0.05,A.mus);}
    if(SM>=1.1&&st%2===1)noise(t,0.025,0.12+0.1*Math.min(1,SM-1),9000,A.mus);if(SM>=1.5&&(st===0||st===8))tone('square',bar%2?988:784,t,0.22,0.05,A.mus);if(SM>=2)tone('sawtooth',mtof(ch[st%3]+24+((st>>2)%2)*12),t,0.05,0.045,A.mus);
   if(A.frenzy&&st%2===1)tone('sine',mtof(ch[(st>>1)%3]+36),t,0.08,0.12,A.mus);
    A.next+=spb; A.step++;
  }
}
const S={
  flap(){if(!A.ctx)return;const t=A.ctx.currentTime,o=tone('sine',rnd(230,280),t,0.22,0.5,A.sfx,rnd(640,760),0.12);
    const l=A.ctx.createOscillator(),lg=A.ctx.createGain();l.frequency.value=28;lg.gain.value=30;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+0.25);},
  ding(m){if(!A.ctx)return;const t=A.ctx.currentTime;[1568,2093,2637].forEach((f,i)=>tone('triangle',f*(m||1),t+i*0.05,0.25,0.25));},
  gem(){if(!A.ctx)return;const t=A.ctx.currentTime;[1047,1319,1568,2093,2637,3136].forEach((f,i)=>tone('sine',f,t+i*0.035,0.2,0.22));},
  frenzy(){if(!A.ctx)return;const t=A.ctx.currentTime;for(let i=0;i<12;i++)tone('square',mtof(72+[0,4,7,12][i%4]+12*((i/4)|0)),t+i*0.045,0.1,0.12);},
  crash(){if(!A.ctx)return;const t=A.ctx.currentTime,c=A.ctx;
    noise(t,0.25,0.6,300); tone('sine',90,t,0.3,0.9,A.sfx,40);
    // slide whistle down with wobble
    const o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type='sine';
    o.frequency.setValueAtTime(1500,t+0.05);o.frequency.exponentialRampToValueAtTime(180,t+0.95);l.frequency.value=7;lg.gain.value=40;l.connect(lg);lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.35,t+0.08);g.gain.setValueAtTime(0.35,t+0.8);g.gain.exponentialRampToValueAtTime(0.0001,t+1.0);
    o.connect(g);g.connect(A.sfx);o.start(t);o.stop(t+1.05);l.start(t);l.stop(t+1.05);
    // kazoo "wah wah wahhh"
    [[392,0],[370,0.32],[349,0.64]].forEach(([f,d],i)=>{const k=c.createOscillator(),bp=c.createBiquadFilter(),kg=c.createGain(),v=c.createOscillator(),vg=c.createGain();
      k.type='sawtooth';k.frequency.value=f;bp.type='bandpass';bp.frequency.value=900;bp.Q.value=3;v.frequency.value=6;vg.gain.value=i===2?14:6;v.connect(vg);vg.connect(k.frequency);
      const s=t+1.0+d,e=s+(i===2?0.7:0.28);kg.gain.setValueAtTime(0.0001,s);kg.gain.exponentialRampToValueAtTime(0.28,s+0.03);kg.gain.setValueAtTime(0.28,e-0.08);kg.gain.exponentialRampToValueAtTime(0.0001,e);
      if(i===2)k.frequency.linearRampToValueAtTime(300,e);k.connect(bp);bp.connect(kg);kg.connect(A.sfx);k.start(s);k.stop(e+0.02);v.start(s);v.stop(e+0.02);});
  },
  uhoh(){if(!A.ctx)return;const t=A.ctx.currentTime;tone('square',523,t,0.25,0.2,A.sfx,440);tone('square',392,t+0.3,0.45,0.2,A.sfx,330);},
  nuke(){if(!A.ctx)return;const t=A.ctx.currentTime,c=A.ctx;tone('sine',70,t,2.2,1,A.sfx,22,1.8);noise(t,1.6,0.9,40);noise(t,0.4,0.6,600);
    [[60,64,67,72],[0]].length;[60,64,67,72,76].forEach((m,i)=>{const o=c.createOscillator(),bp=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=mtof(m);bp.type='bandpass';bp.frequency.value=800+i*80;bp.Q.value=4;
      g.gain.setValueAtTime(0.0001,t+0.4);g.gain.exponentialRampToValueAtTime(0.12,t+0.9);g.gain.setValueAtTime(0.12,t+2.2);g.gain.exponentialRampToValueAtTime(0.0001,t+3.2);o.connect(bp);bp.connect(g);g.connect(A.sfx);o.start(t+0.4);o.stop(t+3.3);});
    [[523,2.4],[659,2.6],[784,2.8],[1047,3.0]].forEach(([f,d])=>{const k=c.createOscillator(),bp=c.createBiquadFilter(),g=c.createGain();k.type='sawtooth';k.frequency.value=f/2;bp.type='bandpass';bp.frequency.value=1000;bp.Q.value=3;
      g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(0.25,t+d+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.18);k.connect(bp);bp.connect(g);g.connect(A.sfx);k.start(t+d);k.stop(t+d+0.2);});},
  fart(){if(!A.ctx)return;const t=A.ctx.currentTime,c=A.ctx,o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(55,t+0.7);l.frequency.value=22;lg.gain.value=35;l.connect(lg);lg.connect(o.frequency);f.type='lowpass';f.frequency.value=600;
    g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.8);o.connect(f);f.connect(g);g.connect(A.sfx);o.start(t);o.stop(t+0.85);l.start(t);l.stop(t+0.85);noise(t,0.5,0.25,200);
    [72,76,79].forEach(m=>tone('triangle',mtof(m),t+0.5,1.0,0.12));},
  pop(){if(!A.ctx)return;const t=A.ctx.currentTime;tone('sine',600,t,0.08,0.3,A.sfx,1400,0.05);}
};

/* ================= GAME STATE ================= */
const G={state:'load',t:0,score:0,best:0,uni:null,pipes:[],parts:[],words:[],trail:[],shake:0,flash:0,flashHue:0,speed:140,
  bgx:0,n:0,ev:null,inv:0,ts:1,lastEv:-99,rf:false,rm:false,tilt:null,tiltA:0,weird:[],nextWeird:4,forceNuke:false,forceFart:false,forceTilt:null,forceWeird:null,nukes:0,spawnX:0,combo:0,frenzy:0,overT:0,msg:'',newBest:false,gems:0,stars:[],deadT:0,banner:null,auto:false};
try{G.best=+localStorage.getItem('uf_best')||0;G.rf=localStorage.getItem('uf_rf')==='1';G.rm=localStorage.getItem('uf_rm')==='1';}catch(e){}
window.__UF=G;
const MSGS=['You got out-sparkled!','Hooves are not for steering.','That pillar was delicious though.','Unicorn.exe has stopped flapping.','Majestic! Mostly!',
 'Rainbow-based injury. Very rare.','The cupcake won this round.','Glitter everywhere. EVERYWHERE.','Your horn needs a license.','Boop! (That was your face.)',
 'Too much sparkle, not enough flap.','The lollipop says sorry. It is not sorry.'];
const YAY=['YIPPEE!','SPARKLY!','WHEEE!','BOING!','YAAAS!','NEIGH-SOME!','FABULOUS!','GLITTERIFIC!','OOOH!','SO SHINY!','HOOF-RAY!','MAGICAL!','TOOT TOOT!'];
const PW=66, SPACING=225;let R=13,PHYS=1;
function reset(){
  G.uni={x:W*0.3,y:H*0.42,vy:0,rot:0,sq:1,flapT:0,face:'idle',faceT:0,spin:0,wing:0,blink:2};
  G.pipes=[];G.parts=[];G.words=[];G.trail=[];G.score=0;G.n=0;G.combo=0;G.frenzy=0;G.gems=0;G.newBest=false;G.speed=140;G.spawnX=W+60;G.banner=null;A.frenzy=false;G.ev=null;G.inv=0;G.ts=1;G.lastEv=0;G.tilt=null;G.tiltA=0;
}
reset();
function difficulty(){const n=G.n;
  const gap=n<5?225:Math.max(148,205-(n-5)*1.6);
  const sp=n<5?140:Math.min(215,148+(n-5)*1.6);
  return {gap,sp:sp*spdMul()};}
// v0.3.3 endless speed ramp: none for the first 5:00 of survival time, then x1.01 every 10 s, compounding, continuous
function spdMul(){const t=(G.runT||0)-300;return G.state==='play'||G.state==='dying'?(t>0?Math.pow(1.01,t/10):1):1;}
let lastGapY=0;
function spawn(){
  const {gap}=difficulty(); const n=G.n; let gy;
  if(n===0)gy=H*0.45;
  else if(n<5)gy=clamp(lastGapY+rnd(-55,55),H*0.36,H*0.6);
  else{const mx=Math.min(190,80+n*4);gy=clamp(lastGapY+rnd(-mx,mx),110+gap/2-40,GY-110-gap/2+40);}
  lastGapY=gy;
  const types=['cane','rainbow','lolli','cupcake'];
  const p={x:G.spawnX,gy,gap,type:n<2?(n?'rainbow':'cane'):pick(types),passed:false,wob:rnd(0,TAU),gem:null,id:n};
  if(n>=1&&Math.random()<0.7){const off=(Math.random()<.5?-1:1)*rnd(0,gap/2-34)*(n<5?0.4:1);p.gem={x:p.x+PW/2,y:gy+off,got:false,kind:Math.random()<0.5?'star':'gem',ph:rnd(0,TAU)};}
  if((n>=4||G.forceNuke)&&(G.forceNuke||!p.gem&&((n-G.lastEv>=10&&Math.random()<0.12)))){G.forceNuke=false;G.lastEv=n;p.gem={x:p.x+PW/2,y:gy,got:false,kind:'nuke',ph:0};}
  G.pipes.push(p); G.n++; G.spawnX+=SPACING;
}
function flap(){
  const u=G.uni; u.vy=-410*PHYS; u.sq=0.55; u.flapT=0.25; u.face='flap'; u.faceT=0.25; u.wing=1;
  S.flap();
  for(let i=0;i<5;i++)G.parts.push({k:'spark',x:u.x-10,y:u.y+10,vx:rnd(-120,-40),vy:rnd(20,120),life:0.5,max:0.5,col:pick(RB),s:rnd(3,6),r:0,vr:rnd(-6,6)});
}
function tap(){
  aInit();
  if(G.state==='title'){G.state='play';reset();flap();bounceUI=1;return;}
  if(G.state==='play'){flap();return;}
  if(G.state==='over'&&G.t-G.overT>0.45){reset();G.state='play';flap();}
}
const muteBtn=document.getElementById('mute');
muteBtn.textContent=A.muted?'🔇':'🔊';
const rfBtn=document.getElementById('rf'),rmBtn=document.getElementById('rm');
function togLabels(){rfBtn.textContent='REDUCE FLASHING: '+(G.rf?'ON':'OFF');rmBtn.textContent='REDUCE MOTION: '+(G.rm?'ON':'OFF');}togLabels();
for(const [b,k] of [[rfBtn,'rf'],[rmBtn,'rm']])b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();G[k]=!G[k];try{localStorage.setItem('uf_'+k,G[k]?'1':'0');}catch(_){}togLabels();});
function showToggles(){const v=G.state==='title'?'block':'none';rfBtn.style.display=v;rmBtn.style.display=v;}
muteBtn.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();aInit();setMute(!A.muted);});
addEventListener('pointerdown',e=>{if(e.target===muteBtn||e.target===rfBtn||e.target===rmBtn)return;e.preventDefault();tap(e);},{passive:false});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();tap();}if(e.code==='KeyM'){aInit();setMute(!A.muted);}});
addEventListener('touchstart',e=>{if(e.target!==muteBtn)e.preventDefault();},{passive:false});

function burst(x,y,n,big){for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(80,big?420:300);
  G.parts.push({k:Math.random()<0.6?'conf':'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,life:rnd(0.6,1.2),max:1.2,col:pick(RB),s:rnd(4,8),r:rnd(0,TAU),vr:rnd(-10,10)});}}
function word(t,x,y,col,sz){G.words.push({t,x,y,col:col||pick(RB),life:1.1,max:1.1,sz:sz||30,rot:rnd(-0.25,0.25)});}
function addScore(v){const m=G.frenzy>0?2:1;G.score+=v*m;}
function startFrenzy(){G.frenzy=6;A.frenzy=true;G.flash=1;G.shake=Math.max(G.shake,10);S.frenzy();G.banner={t:0,text:'RAINBOW FRENZY!'};burst(W/2,H*0.3,60,true);}
function die(){
  if(G.state!=='play')return; G.state='dying'; G.deadT=0; const u=G.uni; u.face='dizzy'; u.vy=-280; u.spin=0;
  G.shake=18; G.flash=0.8; S.crash(); burst(u.x,u.y,40,true); word('BONK!',u.x+30,u.y-30,'#ff2d55',44);
  if(G.score>G.best){G.best=G.score;G.newBest=true;try{localStorage.setItem('uf_best',G.best);}catch(e){}}
  G.msg=pick(MSGS); A.frenzy=false;
}
function circRect(cx_,cy_,r,x,y,w,h){const nx=clamp(cx_,x,x+w),ny=clamp(cy_,y,y+h);return (cx_-nx)**2+(cy_-ny)**2<r*r;}
function hitPipe(p,u){
  const top=p.gy-p.gap/2, bot=p.gy+p.gap/2;
  if(p.type==='lolli'){const lr=36,cxp=p.x+PW/2;
    if((u.x-cxp)**2+(u.y-(top-lr+4))**2<(lr-4+R)**2)return true;
    if((u.x-cxp)**2+(u.y-(bot+lr-4))**2<(lr-4+R)**2)return true;
    if(circRect(u.x,u.y,R,cxp-8,-50,16,top-lr+4+50))return true;
    if(circRect(u.x,u.y,R,cxp-8,bot+lr-4,16,GY-bot))return true;return false;}
  const m=4; if(circRect(u.x,u.y,R,p.x+m,-100,PW-2*m,top+100-m))return true;
  if(circRect(u.x,u.y,R,p.x+m,bot+m,PW-2*m,GY-bot))return true; return false;
}
let bounceUI=0;
function update(dt){
  if(G.ev)evTick(dt); dt*=G.ts; G.inv=Math.max(0,G.inv-dt);
  G.t+=dt; const u=G.uni; weirdTick(dt);
  G.shake=Math.max(0,G.shake-dt*40); G.flash=Math.max(0,G.flash-dt*2.2); bounceUI=Math.max(0,bounceUI-dt*3);
  if(G.state==='title'||G.state==='load'){G.bgx+=60*dt;u.y=H*0.535+Math.sin(G.t*3)*12;u.rot=Math.sin(G.t*3)*0.12;u.wing=(Math.sin(G.t*10)+1)/2;
    u.sq+=(1-u.sq)*Math.min(1,dt*10);if(Math.random()<dt*0.5){u.face='derp';u.faceT=0.8;}}
  if(G.state==='play'){
    const d=difficulty(); G.speed+=(d.sp-G.speed)*Math.min(1,dt*2);
    if(G.auto){const p=G.pipes.find(p=>p.x+PW>u.x-R-4);const ty=p?(p.gem&&!p.gem.got&&p.x<u.x+140?p.gem.y:p.gy+12):H*0.45;if(u.y>ty+8&&u.vy>-60)flap();}
    u.vy+=1350*PHYS*dt; u.vy=Math.min(u.vy,620*PHYS); u.y+=u.vy*dt; if(u.y<12){u.y=12;u.vy=Math.max(u.vy,0);}
    u.rot+=(clamp(u.vy/700,-0.45,1.0)-u.rot)*Math.min(1,dt*8);
    G.bgx+=G.speed*dt;
    G.spawnX-=G.speed*dt; while(G.spawnX<W+80)spawn();
    for(const p of G.pipes){p.x-=G.speed*dt;if(p.gem)p.gem.x=p.x+PW/2;
      if(!p.passed&&p.x+PW<u.x-R){p.passed=true;addScore(1);S.ding(G.frenzy>0?1.25:1);burst(u.x+10,u.y,22);
        if(Math.random()<0.6||G.score%5===0)word(pick(YAY),u.x+rnd(20,70),u.y-rnd(30,60));
        if(p.gem&&!p.gem.got)G.combo=0;
        if(G.score>0&&G.score%10===0&&G.frenzy<=0){G.flash=0.6;G.banner={t:0,text:G.score+' RAINBOWS!'};}}
      if(p.gem&&!p.gem.got){const g=p.gem;if(g.kind==='nuke'){if(!G.ev&&(u.x-g.x)**2+(u.y-g.y)**2<(R+20)**2){g.got=true;startNuke();}}
        else if(g.kind==='taco'){if(!G.vom&&(u.x-g.x)**2+(u.y-g.y)**2<(R+22)**2){g.got=true;startVomit();}}
        else if((u.x-g.x)**2+(u.y-g.y)**2<(R+16)**2){g.got=true;G.gems++;G.combo++;addScore(3);S.gem();burst(g.x,g.y,30,true);
        G.shake=Math.max(G.shake,6);G.flash=Math.max(G.flash,0.35);word(G.combo>1?('x'+G.combo+' COMBO!'):'+3 SHINY!',g.x,g.y-24,'#ffe600',G.combo>1?34:28);
        if(G.combo>=3&&G.frenzy<=0){startFrenzy();G.combo=0;}}}
      if(G.inv<=0&&!G.ev&&hitPipe(p,u))die();}
    G.pipes=G.pipes.filter(p=>p.x>-120);
    if(u.y+R>GY){u.y=GY-R;if(G.inv>0||G.ev)u.vy=-380;else die();}
    if(!G.ev&&!G.tilt&&G.inv<=0&&(G.forceFart||(G.n-G.lastEv>=9&&G.score>=6&&Math.random()<dt*0.06))){G.forceFart=false;startFart();}
    if(G.frenzy>0){G.frenzy-=dt;if(Math.random()<dt*30)G.parts.push({k:'conf',x:rnd(0,W),y:-10,vx:rnd(-30,30),vy:rnd(100,220),life:2,max:2,col:pick(RB),s:rnd(4,8),r:0,vr:rnd(-8,8)});if(G.frenzy<=0)A.frenzy=false;}
  }
  if(G.state==='dying'){G.deadT+=dt;u.vy+=1500*dt;u.y+=u.vy*dt;u.spin+=dt*14;u.rot=u.spin;
    if(u.y>GY-R){u.y=GY-R;u.vy*=-0.35;if(Math.abs(u.vy)<60)u.vy=0;G.shake=Math.max(G.shake,6);}
    if(G.deadT>1.0){G.state='over';G.overT=G.t;bounceUI=1;}}
  if(G.state==='over'){u.spin+=dt*3;}
  // trail
  if(G.state==='play'||G.state==='title'){for(const q of G.trail)q.x-=(G.state==='play'?G.speed:60)*dt;G.trail.push({x:u.x-18,y:u.y+2});}
  else for(const q of G.trail)q.x-=0;
  while(G.trail.length&&(G.trail.length>40||G.trail[0].x<-20))G.trail.shift();
  if(G.state==='dying'&&G.trail.length)G.trail.shift();
  u.sq+=(1-u.sq)*Math.min(1,dt*9); if(u.sq<1)u.sq+=0; u.flapT-=dt; u.wing=Math.max(0,u.wing-dt*4);
  if(u.faceT>0){u.faceT-=dt;if(u.faceT<=0&&u.face!=='dizzy')u.face='idle';}
  u.blink-=dt; if(u.blink<-0.12)u.blink=rnd(1.5,4);
  for(const p of G.parts){p.life-=dt;p.vy+=(p.k==='conf'?260:p.k==='spark'?400:300)*dt;if(p.k==='conf'){p.vx*=0.98;p.vy=Math.min(p.vy,160);}p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;}
  G.parts=G.parts.filter(p=>p.life>0); if(G.parts.length>500)G.parts.splice(0,G.parts.length-500);
  for(const w of G.words){w.life-=dt;w.y-=50*dt;} G.words=G.words.filter(w=>w.life>0);
  if(G.banner){G.banner.t+=dt;if(G.banner.t>1.8)G.banner=null;}
}

/* ================= DRAWING ================= */
function rr(x,y,w,h,r){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):cx.rect(x,y,w,h);}
function starPath(x,y,R1,r1,n,rot){cx.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,q=i%2?r1:R1;cx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}cx.closePath();}
function face(x,y,s,mood){ // tiny cute face for clouds / sun / obstacles
  cx.fillStyle='#3a1640';const u=G.uni;const lx=clamp((u.x-x)/200,-1,1)*s*0.12,ly=clamp((u.y-y)/200,-1,1)*s*0.1;
  cx.beginPath();cx.arc(x-s*0.32+lx,y-s*0.1+ly,s*0.11,0,TAU);cx.arc(x+s*0.32+lx,y-s*0.1+ly,s*0.11,0,TAU);cx.fill();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(x-s*0.29+lx,y-s*0.14+ly,s*0.04,0,TAU);cx.arc(x+s*0.35+lx,y-s*0.14+ly,s*0.04,0,TAU);cx.fill();
  cx.fillStyle='rgba(255,80,150,.55)';cx.beginPath();cx.arc(x-s*0.55,y+s*0.08,s*0.12,0,TAU);cx.arc(x+s*0.55,y+s*0.08,s*0.12,0,TAU);cx.fill();
  cx.strokeStyle='#3a1640';cx.lineWidth=Math.max(2,s*0.07);cx.lineCap='round';cx.beginPath();
  if(mood==='o'){cx.fillStyle='#3a1640';cx.arc(x,y+s*0.15,s*0.12,0,TAU);cx.fill();}else{cx.arc(x,y+s*0.05,s*0.22,0.15*Math.PI,0.85*Math.PI);cx.stroke();}
}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w*DPR);c.height=Math.ceil(h*DPR);const g=c.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);return [c,g];}
const HP=1200;
function buildBG(){BG={};const o=cx;
  let [c,g]=mk(W,H);let gr=g.createLinearGradient(0,0,0,GY);gr.addColorStop(0,'#7fd8ff');gr.addColorStop(0.45,'#c9a8ff');gr.addColorStop(0.8,'#ffa8e0');gr.addColorStop(1,'#ffe0a8');g.fillStyle=gr;g.fillRect(0,0,W,H);BG.sky=c;
  [c,g]=mk(620,320);g.globalAlpha=0.55;for(let i=0;i<7;i++){g.strokeStyle=RB[i];g.lineWidth=16;g.beginPath();g.arc(310,320,300-i*16,Math.PI,TAU);g.stroke();}BG.rain=c;
  [c,g]=mk(140,90);g.fillStyle='#fff';g.beginPath();const x=30,y=48;g.arc(x,y,26,0,TAU);g.arc(x+30,y-12,30,0,TAU);g.arc(x+62,y,24,0,TAU);g.arc(x+30,y+8,26,0,TAU);g.fill();BG.cloud=c;
  BG.far=hillStrip(GY-90,60,'#b48cff','#d6b8ff',3,false);BG.near=hillStrip(GY-40,45,'#4fe08a','#8ff0b0',6,true);
  for(const t of ['cane','cupcake','rainbow']){[c,g]=mk(PW,760);cx=g;
    if(t==='rainbow')stripes(4,0,PW-8,760,RB,0,(PW-8)/7,0);else stripes(4,0,PW-8,760,t==='cane'?['#ff2d55','#fff']:['#ff8ad0','#fff2fa','#8fe3ff','#fff2fa'],0.6,14,0);
    shade(4,0,PW-8,760);cx.fillStyle='#6a1b7a';cx.fillRect(2.5,0,3,760);cx.fillRect(PW-5.5,0,3,760);BG[t]=c;cx=o;}
}
function hy(x,base,amp,k){const f=TAU*k/HP;return base-Math.sin(x*f)*amp*0.6-Math.sin(x*f*2+1)*amp*0.4;}
function hillStrip(base,amp,c1,c2,k,flowers){const top=base-amp-10;const [c,g]=mk(HP,GY+6-top);g.translate(0,-top);g.fillStyle=c1;g.beginPath();g.moveTo(0,GY+6);
  for(let x=0;x<=HP;x+=8)g.lineTo(x,hy(x,base,amp,k));g.lineTo(HP,GY+6);g.closePath();g.fill();g.strokeStyle=c2;g.lineWidth=5;g.beginPath();for(let x=0;x<=HP;x+=8)g.lineTo(x,hy(x,base,amp,k)+4);g.stroke();
  if(flowers)for(let i=0;i<24;i++){const x=i*50+20,y=hy(x,base,amp,k)+16;g.fillStyle=RB[i%7];for(let j=0;j<5;j++){g.beginPath();g.arc(x+Math.cos(j*TAU/5)*5,y+Math.sin(j*TAU/5)*5,4,0,TAU);g.fill();}g.fillStyle='#fff6a0';g.beginPath();g.arc(x,y,3.5,0,TAU);g.fill();}
  return {c,top};}
function strip(h,par){const o=((G.bgx*par)%HP+HP)%HP;cx.drawImage(h.c,-o,h.top,HP,h.c.height/DPR);if(HP-o<W)cx.drawImage(h.c,HP-o,h.top,HP,h.c.height/DPR);}
function drawSky(){
  if(!BG)buildBG();const fr=G.frenzy>0;
  cx.drawImage(BG.sky,0,0,W,H);
  if(fr&&!G.rf){cx.globalAlpha=0.15;cx.fillStyle=`hsl(${(G.t*240)%360},100%,60%)`;cx.fillRect(0,0,W,H);cx.globalAlpha=1;}
  const sx=W-70,sy=86;cx.save();cx.translate(sx,sy);cx.rotate(G.t*0.4);
  for(let i=0;i<12;i++){cx.rotate(TAU/12);cx.fillStyle=i%2?'#ffd21f':'#ff9f1c';cx.beginPath();cx.moveTo(-9,-44);cx.lineTo(0,-68-Math.sin(G.t*4+i)*6);cx.lineTo(9,-44);cx.fill();}
  cx.restore();cx.fillStyle='#ffe94d';cx.beginPath();cx.arc(sx,sy,40,0,TAU);cx.fill();cx.strokeStyle='#ffb000';cx.lineWidth=4;cx.stroke();
  face(sx,sy+2,40,G.state==='dying'||(G.ev&&G.ev.type==='nuke')?'o':'');{const k=Math.sin(G.t*0.5);if(k>0.6){const e=(k-0.6)/0.4;cx.fillStyle='#fff';cx.beginPath();cx.ellipse(sx,sy-20,9*e,7*e,0,0,TAU);cx.fill();cx.strokeStyle='#3a1640';cx.lineWidth=2;cx.stroke();cx.fillStyle='#3a1640';cx.beginPath();cx.arc(sx+clamp((G.uni.x-sx)/80,-4,4)*e,sy-17,3.5*e,0,TAU);cx.fill();}}
  const off=(G.bgx*0.08)%720;for(let k=-1;k<2;k++){const rx=k*720-off+260;if(rx+310>0&&rx-310<W)cx.drawImage(BG.rain,rx-310,GY+40-320,620,320);}
  const co=G.bgx*0.22;for(let i=0;i<5;i++){const span=W+260,x=((i*170-co)%span+span)%span-130,y=70+((i*97)%5)*44+Math.sin(G.t+i)*4,s=0.8+(i%3)*0.18;
    cx.drawImage(BG.cloud,x-30*s,y-48*s,140*s,90*s);if(i%2===0)face(x+30*s,y,24*s,'');}
  strip(BG.far,0.32);strip(BG.near,0.6);
}
function drawGround(){
  const o=(G.bgx)%56;cx.save();cx.beginPath();cx.rect(0,GY,W,H-GY);cx.clip();
  for(let i=0;i<7;i++){cx.fillStyle=RB[i];cx.fillRect(0,GY+8+i*10,W,10);}
  cx.fillStyle='rgba(255,255,255,.35)';for(let x=-o-56;x<W+56;x+=56){cx.beginPath();cx.moveTo(x,GY+8);cx.lineTo(x+24,GY+8);cx.lineTo(x-6,H);cx.lineTo(x-30,H);cx.fill();}
  cx.restore();cx.fillStyle='#2ee66b';cx.fillRect(0,GY,W,10);cx.fillStyle='#8ff0b0';for(let x=-(G.bgx%16);x<W;x+=16){cx.beginPath();cx.arc(x,GY+2,6,Math.PI,TAU);cx.fill();}
}
function stripes(x,y,w,h,cols,ang,size,shift){cx.save();cx.beginPath();cx.rect(x,y,w,h);cx.clip();cx.translate(x+w/2,y+h/2);cx.rotate(ang);const L=Math.hypot(w,h);
  for(let i=-L-size*2,k=0;i<L;i+=size,k++){cx.fillStyle=cols[(k+cols.length*100)%cols.length];cx.fillRect(i+(shift%(size*cols.length)),-L,size,2*L);}cx.restore();}
function shade(x,y,w,h){const g=cx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(0.35,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(60,0,80,.25)');cx.fillStyle=g;cx.fillRect(x,y,w,h);}
function drawPipe(p){
  const top=p.gy-p.gap/2, bot=p.gy+p.gap/2, x=p.x, w=PW, t=G.t;
  if(p.type==='lolli'){const c=x+w/2,lr=36;
    for(const [cy,sy,ey] of [[top-lr+4,-10,top-lr],[bot+lr-4,bot+lr,GY]]){
      cx.fillStyle='#fff';rr(c-7,sy,14,ey-sy,6);cx.fill();cx.strokeStyle='#ff9ad5';cx.lineWidth=2;cx.stroke();
      cx.save();cx.translate(c,cy);cx.rotate(t*2*(cy<p.gy?1:-1));
      for(let i=0;i<7;i++){cx.fillStyle=RB[i];cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,lr,i*TAU/7,(i+1)*TAU/7);cx.fill();}
      cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=4;cx.beginPath();for(let a=0;a<14;a+=0.2)cx.lineTo(Math.cos(a)*a*2.4,Math.sin(a)*a*2.4);cx.stroke();cx.restore();
      cx.strokeStyle='#fff';cx.lineWidth=4;cx.beginPath();cx.arc(c,cy,lr,0,TAU);cx.stroke();
      cx.fillStyle='rgba(255,255,255,.85)';rr(c-18,cy-8,36,22,11);cx.fill();face(c,cy+3,22,'');}
    return;}
  const bodies=[[-10,top-22],[bot+22,GY]];
  for(const [y0,y1] of bodies){
    const hh=y1-y0;if(hh<=0)continue;const img=BG[p.type];cx.drawImage(img,0,0,img.width,Math.min(img.height,hh*DPR),x,y0,w,Math.min(760,hh));}
  // caps
  capTop(p,x,top);capBot(p,x,bot);
}
function capTop(p,x,top){const w=PW;
  if(p.type==='cane'){ // cotton-candy cloud cap
    puff(x+w/2,top-14,w,'#ffb3e6','#ff7fd0');face(x+w/2,top-14,22,'');}
  else if(p.type==='rainbow'){puff(x+w/2,top-14,w,'#c7f0ff','#7fd8ff');face(x+w/2,top-14,22,'o');}
  else {/*cupcake upside-down: frosting*/ cx.fillStyle='#fff';rr(x-4,top-26,w+8,26,13);cx.fill();cx.strokeStyle='#ff7fd0';cx.lineWidth=3;cx.stroke();
    for(let i=0;i<6;i++){cx.fillStyle=RB[i];cx.fillRect(x+6+i*9,top-20+(i%2)*6,5,2.5);}cx.fillStyle='#ff2d55';cx.beginPath();cx.arc(x+w/2,top+4,8,0,TAU);cx.fill();}
}
function capBot(p,x,bot){const w=PW;
  if(p.type==='cupcake'){ // giant cupcake
    cx.fillStyle='#ff9ad5';cx.beginPath();cx.moveTo(x-4,bot+8);cx.lineTo(x+w+4,bot+8);cx.lineTo(x+w-2,bot+36);cx.lineTo(x+2,bot+36);cx.closePath();cx.fill();
    cx.strokeStyle='#c2338f';cx.lineWidth=2;for(let i=1;i<6;i++){cx.beginPath();cx.moveTo(x+i*w/6,bot+8);cx.lineTo(x+i*w/6,bot+36);cx.stroke();}
    puff(x+w/2,bot+6,w+4,'#fff4fb','#ff9ad5');for(let i=0;i<7;i++){cx.fillStyle=RB[i];cx.fillRect(x+4+i*8.5,bot+((i*5)%9)-2,5,2.5);}
    cx.fillStyle='#ff2d55';cx.beginPath();cx.arc(x+w/2,bot-12,8,0,TAU);cx.fill();cx.strokeStyle='#2ee66b';cx.lineWidth=2;cx.beginPath();cx.moveTo(x+w/2,bot-19);cx.quadraticCurveTo(x+w/2+6,bot-28,x+w/2+10,bot-26);cx.stroke();
    face(x+w/2,bot+22,20,'');}
  else if(p.type==='cane'){ // candy cane hook
    cx.lineCap='round';cx.strokeStyle='#6a1b7a';cx.lineWidth=17;cx.beginPath();cx.arc(x+w/2+12,bot+22,20,Math.PI,TAU*0.98);cx.stroke();
    cx.strokeStyle='#ff2d55';cx.lineWidth=12;cx.stroke();cx.setLineDash([6,6]);cx.strokeStyle='#fff';cx.stroke();cx.setLineDash([]);
    cx.fillStyle='#fff';rr(x-2,bot,w+4,24,10);cx.fill();cx.strokeStyle='#6a1b7a';cx.lineWidth=3;cx.stroke();face(x+w/2,bot+12,18,'');}
  else {puff(x+w/2,bot+14,w,'#fff7a8','#ffd21f');face(x+w/2,bot+14,22,'');}
}
function puff(x,y,w,c1,c2){cx.fillStyle=c2;for(let i=0;i<5;i++){cx.beginPath();cx.arc(x-w/2+6+i*(w-12)/4,y+Math.sin(G.t*3+i)*2+2,15,0,TAU);cx.fill();}
  cx.fillStyle=c1;for(let i=0;i<5;i++){cx.beginPath();cx.arc(x-w/2+6+i*(w-12)/4,y+Math.sin(G.t*3+i)*2-1,13,0,TAU);cx.fill();}cx.beginPath();cx.arc(x,y-4,16,0,TAU);cx.fill();}
function drawGem(g){if(g.got)return;if(g.kind==='nuke'){drawBomb(g.x,g.y+Math.sin(G.t*5)*5,1+Math.sin(G.t*10)*0.06);return;}const y=g.y+Math.sin(G.t*4+g.ph)*4,s=1+Math.sin(G.t*8+g.ph)*0.08;
  cx.save();cx.translate(g.x,y);cx.scale(s,s);cx.globalAlpha=0.35;cx.fillStyle=`hsl(${(G.t*200)%360},100%,70%)`;cx.beginPath();cx.arc(0,0,22,0,TAU);cx.fill();cx.globalAlpha=1;
  if(g.kind==='star'){cx.rotate(Math.sin(G.t*3)*0.3);starPath(0,0,17,8,5,-Math.PI/2);cx.fillStyle='#ffe600';cx.fill();cx.strokeStyle='#ff8a00';cx.lineWidth=3;cx.stroke();
    cx.fillStyle='#3a1640';cx.beginPath();cx.arc(-4,-1,2,0,TAU);cx.arc(4,-1,2,0,TAU);cx.fill();}
  else{cx.beginPath();cx.moveTo(0,-17);cx.lineTo(14,-4);cx.lineTo(0,17);cx.lineTo(-14,-4);cx.closePath();const gg=cx.createLinearGradient(-14,-17,14,17);gg.addColorStop(0,'#7ffcff');gg.addColorStop(0.5,'#ff4fd8');gg.addColorStop(1,'#7a5cff');cx.fillStyle=gg;cx.fill();
    cx.strokeStyle='#fff';cx.lineWidth=2.5;cx.stroke();cx.beginPath();cx.moveTo(-14,-4);cx.lineTo(14,-4);cx.stroke();}
  if(Math.sin(G.t*6+g.ph)>0.7){cx.fillStyle='#fff';starPath(12,-12,6,1.5,4,0);cx.fill();}
  cx.restore();}
function drawTrail(){const tr=G.trail;if(tr.length<3)return;cx.lineCap='round';cx.lineJoin='round';
  for(let b=0;b<7;b++){cx.strokeStyle=RB[b];cx.lineWidth=5;cx.beginPath();for(let i=0;i<tr.length;i++){const q=tr[i];const wv=Math.sin(G.t*10-i*0.5)*(i/tr.length)*2;cx.lineTo(q.x,q.y-15+b*5+wv);}cx.stroke();}
  cx.globalAlpha=0.6;for(let i=0;i<tr.length;i+=6){cx.fillStyle='#fff';starPath(tr[i].x,tr[i].y-18+((i*7)%36),3,1,4,G.t*3);cx.fill();}cx.globalAlpha=1;}
function drawUnicorn(u){
  const t=G.t,K=skinCol();cx.save();if(K.ghost)cx.globalAlpha=0.62;cx.translate(u.x,u.y);cx.rotate(u.rot);
  const sx=1/Math.sqrt(u.sq)*(u.sq<1?1:1), sy=u.sq; cx.scale(1+(1-sy)*0.6,sy+(1-sy)*0.2);
  cx.scale(1.35,1.35);
  // tail (rainbow strands)
  for(let i=0;i<6;i++){cx.strokeStyle=K.m[i%K.m.length];cx.lineWidth=4.5;cx.lineCap='round';cx.beginPath();cx.moveTo(-18,-3+i*1.5);
    cx.quadraticCurveTo(-30,-12+i*3+Math.sin(t*12+i)*4,-40,-6+i*4+Math.sin(t*10+i*0.7)*6);cx.stroke();}
  // legs
  const kick=u.flapT>0?Math.sin(u.flapT*30)*5:Math.sin(t*14)*1.5;
  for(const [lx,ph] of [[-12,0],[-5,1],[6,0],[13,1]]){cx.fillStyle=K.b;cx.strokeStyle=K.l;cx.lineWidth=2;rr(lx-3,6,7,13+(ph?kick:-kick)*0.5,3);cx.fill();cx.stroke();cx.fillStyle=K.hf;rr(lx-3,15+(ph?kick:-kick)*0.5,7,5,2);cx.fill();}
  // body
  cx.fillStyle=K.b;cx.strokeStyle=K.l;cx.lineWidth=3;cx.beginPath();cx.ellipse(0,0,21,15,0,0,TAU);cx.fill();cx.stroke();
  cx.fillStyle=K.sp;cx.beginPath();cx.ellipse(-6,5,6,4,0,0,TAU);cx.ellipse(6,-4,4,3,0,0,TAU);cx.fill();
  // wing
  cx.save();cx.translate(-3,-8);cx.rotate(-0.6-u.wing*1.4+Math.sin(t*(G.state==='title'?10:4))*0.2);
  for(let i=0;i<3;i++){cx.fillStyle=['#fff','#d6f3ff','#ffd6f2'][i];cx.beginPath();cx.ellipse(-4-i*5,-4+i*2,12-i*2,5,-0.3,0,TAU);cx.fill();}cx.strokeStyle='#ff9ad5';cx.lineWidth=1.5;cx.beginPath();cx.ellipse(-4,-4,12,5,-0.3,0,TAU);cx.stroke();cx.restore();
  // neck + head
  cx.fillStyle=K.b;cx.strokeStyle=K.l;cx.lineWidth=3;cx.beginPath();cx.ellipse(14,-10,9,12,0.5,0,TAU);cx.fill();
  cx.beginPath();cx.arc(19,-17,12,0,TAU);cx.fill();cx.stroke();
  cx.beginPath();cx.ellipse(28,-11,9,7.5,0.2,0,TAU);cx.fillStyle=K.sn;cx.fill();cx.stroke();
  cx.fillStyle='#d14d97';cx.beginPath();cx.ellipse(31,-13,1.6,2.2,0,0,TAU);cx.ellipse(26.5,-14,1.4,2,0,0,TAU);cx.fill();
  // ear
  cx.fillStyle=K.b;cx.beginPath();cx.moveTo(12,-25);cx.lineTo(10,-36);cx.lineTo(18,-28);cx.closePath();cx.fill();cx.stroke();
  // horn
  cx.save();cx.translate(21,-28);cx.rotate(0.35);const hg=cx.createLinearGradient(-5,0,5,-24);hg.addColorStop(0,K.h[0]);hg.addColorStop(1,K.h[1]);
  cx.fillStyle=hg;cx.beginPath();cx.moveTo(-5,0);cx.lineTo(0,-24);cx.lineTo(5,0);cx.closePath();cx.fill();cx.strokeStyle='#ff9f1c';cx.lineWidth=2;cx.stroke();
  for(let i=1;i<4;i++){cx.beginPath();cx.moveTo(-5+i*1.2,-i*6+2);cx.lineTo(5-i*1.2,-i*6-1);cx.stroke();}
  if(Math.sin(t*5)>0.6){cx.fillStyle='#fff';starPath(0,-26,5,1.2,4,t);cx.fill();}cx.restore();
  // mane (flowing rainbow curls)
  for(let i=0;i<7;i++){const a=i/6, mx=14-a*18, my=-27+a*20, wv=Math.sin(t*9-i*0.8)*3;cx.fillStyle=K.m[i%K.m.length];cx.beginPath();cx.arc(mx-4+wv,my,6.5-a*1.5,0,TAU);cx.fill();
    cx.beginPath();cx.arc(mx-10+wv*1.6,my+3,4.5-a,0,TAU);cx.fill();}
  // eye / face
  const f=u.face; cx.lineCap='round';
  if(f==='shock'){cx.fillStyle='#fff';cx.strokeStyle='#3a1640';cx.lineWidth=1.6;cx.beginPath();cx.ellipse(20,-19,8,10,0,0,TAU);cx.fill();cx.stroke();cx.fillStyle='#3a1640';cx.beginPath();cx.arc(21,-19,2,0,TAU);cx.fill();
    cx.beginPath();cx.ellipse(29,-4,4,6,0,0,TAU);cx.fill();cx.lineWidth=2;cx.beginPath();cx.moveTo(14,-31);cx.lineTo(24,-33);cx.stroke();}
  else if(f==='dizzy'){cx.strokeStyle='#3a1640';cx.lineWidth=2.2;cx.beginPath();for(let a=0;a<12;a+=0.4)cx.lineTo(20+Math.cos(a+t*12)*a*0.55,-18+Math.sin(a+t*12)*a*0.55);cx.stroke();
    cx.fillStyle='#ff5c8a';cx.beginPath();cx.ellipse(30,-3,3,5,0.3,0,TAU);cx.fill();cx.strokeStyle='#3a1640';cx.beginPath();cx.arc(28,-7,4,0.1,Math.PI*0.9);cx.stroke();}
  else{
    if(f==='flap'){cx.strokeStyle='#3a1640';cx.lineWidth=2.5;cx.beginPath();cx.arc(20,-16,4.5,Math.PI*1.1,Math.PI*1.9);cx.stroke();
      cx.fillStyle='#3a1640';cx.beginPath();cx.ellipse(29,-5,4,4.5,0,0,TAU);cx.fill();cx.fillStyle='#ff5c8a';cx.beginPath();cx.arc(29,-3.5,2.5,0,TAU);cx.fill();}
    else{const bl=u.blink<0;cx.fillStyle='#fff';cx.strokeStyle='#3a1640';cx.lineWidth=1.6;cx.beginPath();cx.ellipse(20,-18,6,bl?1:7,0,0,TAU);cx.fill();cx.stroke();
      if(!bl){const derp=f==='derp';cx.fillStyle='#3a1640';cx.beginPath();cx.arc(derp?18+Math.sin(t*20):22,derp?-20+Math.cos(t*17)*2:-17+clamp(u.vy/200,-2,2),4,0,TAU);cx.fill();
        cx.fillStyle='#fff';cx.beginPath();cx.arc(23,-19,1.5,0,TAU);cx.fill();}
      cx.strokeStyle='#3a1640';cx.lineWidth=2;cx.beginPath();cx.arc(28,-7,4,0.1,Math.PI*0.9);cx.stroke();
      if(f==='derp'){cx.fillStyle='#ff5c8a';cx.beginPath();cx.ellipse(29,-3,2.5,4,0.2,0,TAU);cx.fill();}}
    // lashes
    cx.strokeStyle='#3a1640';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(16,-24);cx.lineTo(14,-27);cx.moveTo(19,-25.5);cx.lineTo(18.5,-29);cx.stroke();
  }
  cx.fillStyle='rgba(255,80,160,.45)';cx.beginPath();cx.arc(16,-8,3.5,0,TAU);cx.fill();
  skinAcc(K,u,t);cx.globalAlpha=1;cx.restore();
  if(G.state==='dying'||G.state==='over'){for(let i=0;i<5;i++){const a=t*5+i*TAU/5;cx.fillStyle=RB[i*1%7];starPath(u.x+Math.cos(a)*30,u.y-34+Math.sin(a)*9,7,3,5,t*4);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=1.5;cx.stroke();}}
}
function drawParts(){for(const p of G.parts){const a=clamp(p.life/p.max*1.5,0,1);cx.globalAlpha=a;cx.fillStyle=p.col;
  if(p.k==='heart'||p.k==='duck'||p.k==='cake'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.scale(p.s/10,p.s/10);if(p.k==='heart')heart(0,0,10,p.col);else if(p.k==='duck')duck(0,0);else cake(0,0);cx.restore();}
  else if(p.k==='conf'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2*Math.abs(Math.cos(p.r*2))+1);cx.restore();}
  else{starPath(p.x,p.y,p.s,p.s*0.35,4,p.r);cx.fill();}}cx.globalAlpha=1;}
function heart(x,y,s,c){cx.fillStyle=c;cx.beginPath();cx.moveTo(x,y+s*0.9);cx.bezierCurveTo(x-s*1.6,y-s*0.2,x-s*0.6,y-s*1.3,x,y-s*0.4);cx.bezierCurveTo(x+s*0.6,y-s*1.3,x+s*1.6,y-s*0.2,x,y+s*0.9);cx.fill();}
function duck(x,y){cx.fillStyle='#ffe600';cx.beginPath();cx.ellipse(x,y+3,11,8,0,0,TAU);cx.arc(x+6,y-6,6,0,TAU);cx.fill();cx.fillStyle='#ff8a00';cx.beginPath();cx.ellipse(x+13,y-5,4,2.2,0,0,TAU);cx.fill();cx.fillStyle='#3a1640';cx.beginPath();cx.arc(x+7,y-7,1.6,0,TAU);cx.fill();}
function cake(x,y){cx.fillStyle='#ff9ad5';cx.beginPath();cx.moveTo(x-9,y);cx.lineTo(x+9,y);cx.lineTo(x+6,y+10);cx.lineTo(x-6,y+10);cx.fill();cx.fillStyle='#fff4fb';cx.beginPath();cx.arc(x-4,y-1,6,0,TAU);cx.arc(x+4,y-1,6,0,TAU);cx.arc(x,y-6,6,0,TAU);cx.fill();cx.fillStyle='#ff2d55';cx.beginPath();cx.arc(x,y-12,3,0,TAU);cx.fill();}
function verTag(){const s='v'+VERSION;txt(s,12,22,14,'#fff','#4a1458',4,'left');cx.save();cx.font=`14px ${FONT}`;const x=12+cx.measureText(s).width+8;cx.font=`12px ${FONT}`;const w=cx.measureText(STAGE).width+14;cx.fillStyle='#ff4fd8';cx.strokeStyle='#4a1458';cx.lineWidth=2.5;rr(x,13,w,19,9.5);cx.fill();cx.stroke();cx.fillStyle='#fff';cx.textAlign='left';cx.textBaseline='middle';cx.fillText(STAGE,x+7,23);cx.restore();}
function txt(s,x,y,sz,fill,stroke,lw,align){cx.font=`${sz}px ${FONT}`;cx.textAlign=align||'center';cx.textBaseline='middle';cx.lineJoin='round';
  if(stroke){cx.strokeStyle=stroke;cx.lineWidth=lw||sz*0.18;cx.strokeText(s,x,y);}cx.fillStyle=fill;cx.fillText(s,x,y);}
function rainbowText(s,x,y,sz,wob){cx.font=`${sz}px ${FONT}`;const w=cx.measureText(s).width;let px=x-w/2;
  for(let i=0;i<s.length;i++){const ch=s[i],cw=cx.measureText(ch).width,yy=y+Math.sin(G.t*6+i*0.7)*(wob||0);
    txt(ch,px+cw/2,yy,sz,RB[(i+((G.t*4)|0))%7],'#4a1458',sz*0.2);px+=cw;}}
function drawWords(){for(const w of G.words){const k=1-w.life/w.max,s=k<0.15?k/0.15*1.3:1.3-Math.min(0.3,(k-0.15)*2);cx.save();cx.globalAlpha=clamp(w.life*3,0,1);
  cx.translate(w.x,w.y);cx.rotate(w.rot+Math.sin(G.t*12)*0.05);cx.scale(s,s);txt(w.t,0,0,w.sz,w.col,'#4a1458');cx.restore();}cx.globalAlpha=1;}
function bounce(k){return 1+Math.sin(k*Math.PI*3)*k*0.35;}
function drawHUD(){
  if(G.state==='play'||G.state==='dying'){const s=1+Math.max(0,0.3-(G.t%1))*0;txt(String(G.score),W/2,64,58,'#fff','#4a1458',10);
    if(G.frenzy>0){txt('x2 FRENZY '+Math.ceil(G.frenzy),W/2,108,20,`hsl(${(G.t*360)%360},100%,65%)`,'#4a1458',5);
      cx.lineWidth=10;cx.strokeStyle=G.rf?'#ff4fd8':`hsl(${(G.t*360)%360},100%,60%)`;cx.strokeRect(5,5,W-10,H-10);}
    else if(G.combo>0){for(let i=0;i<3;i++){cx.globalAlpha=i<G.combo?1:0.3;cx.fillStyle='#ffe600';starPath(W/2-24+i*24,106,9,4,5,-Math.PI/2);cx.fill();cx.strokeStyle='#4a1458';cx.lineWidth=2;cx.stroke();}cx.globalAlpha=1;}}
  if(G.banner){const b=G.banner,k=Math.min(1,b.t/0.35),s=(k<1?k*1.25:1.25-Math.min(0.25,(b.t-0.35)))*(1+Math.sin(G.t*14)*0.05);
    cx.save();cx.translate(W/2,bannerY13(b));cx.rotate(Math.sin(G.t*8)*0.06);cx.scale(s,s);cx.globalAlpha=clamp((1.8-b.t)*3,0,1)*0.9;rainbowText(b.text,0,0,Math.min(40,W/10),6);cx.restore();cx.globalAlpha=1;}
  if(G.state==='title'){
    const by=Math.sin(G.t*2.5)*6;cx.save();cx.translate(W/2,128+by);cx.rotate(Math.sin(G.t*1.7)*0.04);
    rainbowText('UNICORN',0,-26,Math.min(64,W/6),5);rainbowText('FLAP-TASTIC!',0,30,Math.min(52,W/7.4),5);cx.restore();
    txt('A Rainwater Games production',W/2,196,18,'#fff','#7a2a8a',5);
    const ps=1+Math.sin(G.t*7)*0.08;cx.save();cx.translate(W/2,H*0.68);cx.scale(ps,ps);cx.fillStyle='#ff4fd8';rr(-120,-34,240,68,34);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=5;cx.stroke();
    txt('TAP TO FLAP!',0,2,34,'#fff','#7a1460',6);cx.restore();
    txt('BEST: '+G.best,W/2,H*0.68+60,22,'#ffe600','#4a1458',6);
    verTag();
    txt('Grab ★ & gems in a row for RAINBOW FRENZY!',W/2,GY-14,14,'#fff','#4a1458',4);
    copyLine();}
  if(G.state==='over'){
    const k=clamp((G.t-G.overT)*2.2,0,1),s=k<1?(1-Math.pow(1-k,3))*bounce(1-k):1;
    cx.fillStyle='rgba(74,20,88,'+(0.35*k)+')';cx.fillRect(0,0,W,H);
    cx.save();cx.translate(W/2,H*0.4);cx.scale(s,s);
    cx.fillStyle='#fff6fd';rr(-W*0.42,-170,W*0.84,300,30);cx.fill();cx.lineWidth=7;cx.strokeStyle='#ff4fd8';cx.stroke();
    for(let i=0;i<7;i++){cx.fillStyle=RB[i];cx.fillRect(-W*0.42+24+i*((W*0.84-48)/7),-170+8,(W*0.84-48)/7,8);}
    rainbowText('OOPSIE-DAISY!',0,-124,Math.min(40,W/9.5),3);
    wrap(G.msg,0,-80,W*0.74,18,'#7a2a8a');
    txt('SCORE',-W*0.2,-22,18,'#b04ac0');txt('BEST',W*0.2,-22,18,'#b04ac0');
    txt(String(G.score),-W*0.2,18,52,'#ff4fd8','#4a1458',8);txt(String(G.best),W*0.2,18,52,'#1fb6ff','#4a1458',8);
    txt('Gems: '+G.gems,0,70,18,'#7a2a8a');
    if(G.newBest){cx.save();cx.translate(W*0.3,-48);cx.rotate(0.3+Math.sin(G.t*8)*0.1);cx.fillStyle='#ffe600';starPath(0,0,34,22,10,G.t);cx.fill();txt('NEW!',0,0,18,'#ff2d55');cx.restore();}
    cx.restore();
    if(k>=1){const ps=1+Math.sin(G.t*8)*0.09;cx.save();cx.translate(W/2,H*0.74);cx.scale(ps,ps);cx.rotate(Math.sin(G.t*4)*0.04);
      cx.fillStyle=`hsl(${(G.t*120)%360},100%,60%)`;rr(-W*0.4,-40,W*0.8,80,40);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=6;cx.stroke();txt('TAP TO RETRY',0,3,Math.min(40,W/9),'#fff','#4a1458',7);cx.restore();}
    copyLine();}
}
function copyLine(){txt(COPY,W/2,H-16,Math.min(11.5,W/32),'#fff','#4a1458',3);}
function wrap(s,x,y,maxw,sz,col){cx.font=`${sz}px ${FONT}`;const ws=s.split(' ');let line='',lines=[];for(const w of ws){const t=line?line+' '+w:w;if(cx.measureText(t).width>maxw&&line){lines.push(line);line=w;}else line=t;}lines.push(line);
  lines.forEach((l,i)=>txt(l,x,y+i*(sz+4)-(lines.length-1)*(sz+4)/2,sz,col));}
// v0.3.3: moderate tilt zoom. Mild zoom (half the old amount) eased with the rotation, held steady,
// capped so the action band (unicorn -> right edge, middle 44% of height) always fits after rotation.
function tiltFrame(a){const T=G.tilt,to=T?T.to:(G.tiltLastTo||a);G.tiltLastTo=to;const prog=to?clamp(a/to,0,1):0;
 const x0=W*0.3-30,x1=W,y0=H*0.28,y1=H*0.72,bw=x1-x0,bh=y1-y0,c=Math.abs(Math.cos(a)),sn=Math.abs(Math.sin(a));
 const fit=Math.min(W/(bw*c+bh*sn),H/(bw*sn+bh*c))*0.97;const old=Math.hypot(W,H)/Math.min(W,H)*1.02;
 const isTilt=Math.abs(Math.abs(to)-Math.PI)>0.1;const want=isTilt?1+(1+(old-1)*0.5-1)*prog:1;const z=Math.min(want,fit,Math.max(1,fit));
 const fx=W/2+(isTilt?((x0+x1)/2-W/2)*prog:0),fy=H/2;return {z:Math.min(want,fit),cx:fx,cy:fy};}
function tiltBack(){const g=cx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#3a1460');g.addColorStop(0.5,'#7a2a9a');g.addColorStop(1,'#2a1a6a');cx.fillStyle=g;cx.fillRect(-20,-20,W+40,H+40);
 for(let i=0;i<70;i++){const x=(i*97.3)%W,y=(i*181.7)%H,tw=G.rf?0.5:0.5+0.5*Math.sin(G.t*3+i*1.7);cx.globalAlpha=0.25+0.6*tw;cx.fillStyle=RB[i%7];const r=1+(i%3)+tw*1.5;
  if(i%5===0&&!G.rf){cx.beginPath();cx.moveTo(x,y-r*2);cx.lineTo(x+r*0.5,y);cx.lineTo(x,y+r*2);cx.lineTo(x-r*0.5,y);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(x-r*2,y);cx.lineTo(x,y+r*0.5);cx.lineTo(x+r*2,y);cx.lineTo(x,y-r*0.5);cx.closePath();cx.fill();}
  else{cx.beginPath();cx.arc(x,y,r*0.6,0,TAU);cx.fill();}}cx.globalAlpha=1;}
function render(){
  cx.setTransform(DPR,0,0,DPR,0,0);
  const sh=G.rf?Math.min(4,G.shake*0.3):G.shake;cx.save();if(sh>0)cx.translate(rnd(-sh,sh),rnd(-sh,sh));
  const z=camZoom();if(z.s!==1){cx.translate(z.x,z.y);cx.scale(z.s,z.s);cx.translate(-G.uni.x,-G.uni.y);}
  if(G.tiltA){const f=tiltFrame(G.tiltA);tiltBack();cx.translate(W/2,H/2);cx.rotate(G.tiltA);cx.scale(f.z,f.z);cx.translate(-f.cx,-f.cy);}
  drawSky();drawWeird();
  for(const p of G.pipes)drawPipe(p);
  for(const p of G.pipes)if(p.gem)drawGem(p.gem);
  drawGround();drawTrail();drawUnicorn(G.uni);drawParts();drawWords();
  cx.restore();
  zoneTint();
  if(G.flash>0){cx.globalAlpha=G.rf?Math.min(0.12,G.flash*0.15):Math.min(1,G.flash*0.45);cx.fillStyle=G.rf?'#ffd6f2':`hsl(${(G.t*500)%360},100%,70%)`;cx.fillRect(0,0,W,H);cx.globalAlpha=1;}
  drawEvent();
  drawHUD();
}
let last=performance.now();
function frame(now){const dt=Math.min(1/30,(now-last)/1000);last=now;update(dt);render();showToggles();requestAnimationFrame(frame);}
/* ================= v0.2 EVENTS: RAINBOW NUKE, FOURTH-WALL FART, WORLD TILT, WEIRDOS ================= */
function addP(k,x,y,vx,vy,life,col,s){G.parts.push({k,x,y,vx,vy,life,max:life,col:col||pick(RB),s:s||rnd(8,14),r:rnd(0,TAU),vr:rnd(-6,6)});}
function startNuke(){G.ev={type:'nuke',t:0,boom:false};G.ts=0;G.nukes++;S.uhoh();}
function startFart(){G.ev={type:'fart',t:0,farted:false};G.ts=0;G.lastEv=G.n;}
function startTilt(kind){if(G.rm)return;G.tilt={kind,t:0,dur:rnd(8,12),from:G.tiltA||0,to:kind==='up'?Math.PI:-Math.PI/4};G.lastEv=G.n;
  word(kind==='up'?'WHICH WAY IS UP??':'THE WORLD IS TILTING...',W/2,H*0.22,'#fff',kind==='up'?30:26);clearNear();S.pop();}
function clearNear(){for(const p of G.pipes)if(p.x>G.uni.x-PW&&p.x<G.uni.x+260){burst(p.x+PW/2,p.gy,14);p.x=-999;}G.spawnX=Math.max(G.spawnX,W+180);}
function nukeBoom(){const e=G.ev;e.boom=true;S.nuke();G.flash=1.6;G.shake=34;let n=0,b=0;
  for(const p of G.pipes){if(p.x>W+20||p.x<-PW)continue;n++;const c=p.x+PW/2;
    for(const yy of [p.gy-p.gap/2-60,p.gy-p.gap/2-200,p.gy+p.gap/2+60,p.gy+p.gap/2+200]){burst(c,yy,18,true);for(let i=0;i<4;i++)addP(pick(['cake','cake','heart','duck']),c,yy,rnd(-380,380),rnd(-520,-120),rnd(1.2,2),null,rnd(10,16));}
    if(p.gem&&!p.gem.got)b++;p.x=-999;}
  const pts=n*5+b*3;addScore(pts);e.pts=pts;G.spawnX=W+260;G.inv=2;G.uni.vy=-250;
  for(let i=0;i<60;i++)addP(pick(['heart','duck','star','conf']),W/2+rnd(-30,30),GY-20,rnd(-80,80),rnd(-900,-400),rnd(1.5,2.6),null,rnd(9,15));
  word('TACTICAL RAINBOW DEPLOYED',W/2,H*0.2,'#fff',26);word('+'+pts+' DESTRUCTION BONUS!',W/2,H*0.62,'#ffe600',26);}
function evTick(dt){const e=G.ev;e.t+=dt;
  if(e.type==='nuke'){G.ts=e.t<0.35?0:e.t<1.2?0.12:1;
    if(e.t>0.35&&!e.said){e.said=1;G.uni.face='shock';G.uni.faceT=1;}
    if(e.t>=1.2&&!e.boom)nukeBoom();
    if(e.boom){if(!e.w2&&e.t>2.0){e.w2=1;word('OOPSIE KABOOMSIE',W/2,H*0.3,'#ff4fd8',32);}if(!e.w3&&e.t>2.8){e.w3=1;word('THAT ESCALATED QUICKLY',W/2,H*0.4,'#1fb6ff',24);}}
    if(e.t>4.2)G.ev=null;}
  else if(e.type==='fart'){G.ts=0;if(!e.w1&&e.t>0.2){e.w1=1;word('WHAT THE...',W/2,H*0.18,'#fff',32);}
    if(e.t>1.25&&!e.farted){e.farted=1;S.fart();G.shake=10;G.flash=0.5;word('EXCUSE ME',W/2,H*0.5,'#ffe600',40);
      for(let i=0;i<50;i++)addP(pick(['spark','heart','star']),W/2,H/2,rnd(-500,500),rnd(-500,300),rnd(0.8,1.6),null,rnd(6,12));}
    if(!e.w3&&e.t>2.0){e.w3=1;word('sorry',G.uni.x+40,G.uni.y-30,'#7a2a8a',20);}
    if(e.t>2.5){G.ev=null;G.ts=1;G.inv=1;}}
  if(!G.ev)G.ts=1;}
function camZoom(){const e=G.ev,u=G.uni;if(!e)return {s:1};const ez=k=>k*k*(3-2*k);
  if(e.type==='nuke'){const k=e.t<0.35?0:e.t<1.2?ez(clamp((e.t-0.35)/0.4,0,1)):Math.max(0,1-(e.t-1.2)*4);return {s:1+1.6*k,x:u.x+(W/2-u.x)*k,y:u.y+(H*0.45-u.y)*k};}
  return {s:1};}
function drawBomb(x,y,s){cx.save();cx.translate(x,y);cx.scale(s,s);cx.globalAlpha=0.35;cx.fillStyle=`hsl(${(G.t*300)%360},100%,70%)`;cx.beginPath();cx.arc(0,0,30,0,TAU);cx.fill();cx.globalAlpha=1;
  cx.fillStyle='#ff2d8a';cx.beginPath();cx.arc(0,3,19,0,TAU);cx.fill();cx.strokeStyle='#4a1458';cx.lineWidth=3;cx.stroke();cx.fillStyle='#4a1458';cx.fillRect(-6,-19,12,7);
  cx.strokeStyle='#ffe600';cx.lineWidth=3;cx.beginPath();cx.moveTo(0,-19);cx.quadraticCurveTo(8,-30,14,-26);cx.stroke();
  cx.fillStyle=pick(RB);starPath(15,-27,7,2.5,5,G.t*9);cx.fill();
  for(let i=0;i<6;i++){cx.fillStyle=RB[(i+((G.t*6)|0))%7];cx.fillRect(Math.cos(i*1.7)*12-1.5,3+Math.sin(i*2.3)*12-1.5,3,3);}
  face(0,6,16,'');txt('NUKE',0,-36,11,'#fff','#4a1458',3);cx.restore();}
// shocked-face override + fourth-wall overlay
function drawEvent(){const e=G.ev;if(!e)return;
  if(e.type==='nuke'){if(e.t>0.35&&e.t<1.25){const k=Math.min(1,(e.t-0.35)*3);cx.save();cx.translate(W/2,H*0.2);cx.scale(k*(1+Math.sin(G.t*40)*0.02),k);rainbowText('UH OH',0,0,64,4);cx.restore();}
    if(e.boom){const k=e.t-1.2;if(k<0.25&&!G.rf){cx.fillStyle='#fff';cx.globalAlpha=1-k*2;cx.fillRect(0,0,W,H);cx.globalAlpha=1;}
      mushroom(W/2,GY,clamp(k/1.2,0,1),clamp(3-k,0,1));}}
  if(e.type==='fart'){const t=e.t,u=G.uni;let k,bx,by;
    if(t<0.4){k=0;}else if(t<1.1)k=(t-0.4)/0.7;else if(t<2.0)k=1;else k=Math.max(0,1-(t-2.0)/0.5);
    const ez=k*k*(3-2*k),sc=1+ez*(G.rm?2:6);bx=u.x+(W/2-u.x)*ez;by=u.y+(H*0.45-u.y)*ez;
    cx.fillStyle='rgba(74,20,88,'+0.35*ez+')';cx.fillRect(0,0,W,H);
    cx.save();cx.translate(bx,by);cx.scale(sc,sc);if(t>1.1&&t<2.0)uniBack();else uniFront(t>0.7);cx.restore();
    if(e.farted){const f=clamp((t-1.25)/0.3,0,1)*clamp((2.5-t)/0.5,0,1);for(let i=0;i<14;i++){const a=i*0.45+t,rr2=(40+i*22)*f;cx.globalAlpha=0.75*f;cx.fillStyle=RB[i%7];
      cx.beginPath();cx.arc(W/2+Math.cos(a)*rr2*0.7,H*0.5+Math.sin(a*1.3)*rr2*0.6,60*f+i*4,0,TAU);cx.fill();}cx.globalAlpha=1;}}}
function uniFront(wink){cx.fillStyle='#fff';cx.strokeStyle='#c2338f';cx.lineWidth=2;
  for(let i=0;i<7;i++){cx.fillStyle=RB[i];cx.beginPath();cx.arc(-15+Math.sin(G.t*8+i)*2,-12+i*4,6,0,TAU);cx.arc(15-Math.sin(G.t*8+i)*2,-12+i*4,6,0,TAU);cx.fill();}
  cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,17,0,TAU);cx.fill();cx.stroke();cx.fillStyle='#ffd0ea';cx.beginPath();cx.ellipse(0,9,10,7,0,0,TAU);cx.fill();cx.stroke();
  cx.fillStyle='#ffd21f';cx.beginPath();cx.moveTo(-4,-16);cx.lineTo(0,-36);cx.lineTo(4,-16);cx.fill();
  cx.fillStyle='#fff';cx.strokeStyle='#3a1640';cx.lineWidth=1.3;cx.beginPath();cx.ellipse(-7,-4,5,6,0,0,TAU);cx.fill();cx.stroke();cx.fillStyle='#3a1640';cx.beginPath();cx.arc(-7,-3,2.8,0,TAU);cx.fill();
  if(wink){cx.lineWidth=1.8;cx.beginPath();cx.arc(7,-4,4,Math.PI*1.1,Math.PI*1.9);cx.stroke();}else{cx.fillStyle='#fff';cx.beginPath();cx.ellipse(7,-4,5,6,0,0,TAU);cx.fill();cx.stroke();cx.fillStyle='#3a1640';cx.beginPath();cx.arc(7,-3,2.8,0,TAU);cx.fill();}
  cx.strokeStyle='#3a1640';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,10,5,0.1,Math.PI-0.1);cx.stroke();cx.fillStyle='#ff5c8a';cx.beginPath();cx.ellipse(1,15,2.5,3.5,0,0,TAU);cx.fill();
  cx.fillStyle='rgba(255,80,160,.5)';cx.beginPath();cx.arc(-12,5,3,0,TAU);cx.arc(12,5,3,0,TAU);cx.fill();}
function uniBack(){for(let i=0;i<7;i++){cx.strokeStyle=RB[i];cx.lineWidth=3;cx.beginPath();cx.moveTo(-6+i*2,-8);cx.quadraticCurveTo(-6+i*2+Math.sin(G.t*12+i)*6,-24,-4+i*2,-30);cx.stroke();}
  cx.fillStyle='#fff';cx.strokeStyle='#c2338f';cx.lineWidth=2;cx.beginPath();cx.arc(-8,4,13,0,TAU);cx.arc(8,4,13,0,TAU);cx.fill();cx.stroke();heart(-8,4,4,'#ff9ad5');heart(8,4,4,'#ff9ad5');}
function mushroom(x,gy,k,a){if(k<=0||a<=0)return;cx.save();cx.globalAlpha=a*0.92;const top=gy-80-360*k;
  for(let i=0;i<7;i++){cx.fillStyle=RB[i];const w=(30+i*0)*k+10;cx.fillRect(x-w/2+(i-3)*w/7,top+40,w/7+1,gy-top-40);}
  for(let i=0;i<16;i++){const a2=i/16*TAU+G.t*0.6,r=(70+((i*37)%30))*k;cx.fillStyle=RB[i%7];cx.beginPath();cx.arc(x+Math.cos(a2)*r*1.4,top+Math.sin(a2)*r*0.55,46*k,0,TAU);cx.fill();}
  cx.fillStyle='#fff';cx.beginPath();cx.arc(x,top,60*k,0,TAU);cx.fill();face(x,top+6,46*k,'o');
  for(let i=0;i<10;i++){const a2=i/10*TAU-G.t;heart(x+Math.cos(a2)*150*k,top+60+Math.sin(a2)*30*k,9,RB[i%7]);}
  cx.globalAlpha=1;cx.restore();}
// world tilt (visual rotation of the play layer; tap always pushes the unicorn toward ITS up)
function tiltTick(dt){if(G.state!=='play'||G.ev)return;const T=G.tilt;
  if(!T){if(G.forceTilt||!G.rm&&G.score>=8&&G.n-G.lastEv>=8&&Math.random()<dt*0.05){const k=G.forceTilt||(Math.random()<0.4?'up':'diag');G.forceTilt=null;startTilt(k);}return;}
  T.t+=dt;const tr=0.7;let a;
  if(T.t<tr)a=T.from+(T.to-T.from)*sm(T.t/tr);else if(T.t<T.dur)a=T.to;else if(T.t<T.dur+tr){if(!T.back){T.back=1;clearNear();word('PHEW!',W/2,H*0.3,'#fff',30);}a=T.to*(1-sm((T.t-T.dur)/tr));}else{a=0;G.tilt=null;}
  G.tiltA=a;}
function sm(k){k=clamp(k,0,1);return k*k*(3-2*k);}
// palette zones every 25 points + gentle hue drift
const ZONES=[null,'#00ffd0','#ff00aa','#ffcc00','#5d00ff'];
function zoneTint(){const z=Math.floor(G.score/25)%ZONES.length;cx.globalAlpha=G.rf?0.05:0.07;cx.fillStyle=`hsl(${(G.t*20)%360},100%,60%)`;cx.fillRect(0,0,W,H);
  if(ZONES[z]){cx.globalCompositeOperation='overlay';cx.globalAlpha=0.35;cx.fillStyle=ZONES[z];cx.fillRect(0,0,W,H);cx.globalCompositeOperation='source-over';}cx.globalAlpha=1;}
// weird background characters (far layer, dimmed, decor only)
const WEIRD=['handcloud','mushroom','eyeflower','gummoon','phonecat','clock'];
function weirdTick(dt){tiltTick(dt);const sp=G.state==='play'?G.speed*0.3:20;for(const w of G.weird){w.x-=sp*dt;w.t+=dt;}G.weird=G.weird.filter(w=>w.x>-120);
  G.nextWeird-=dt;if(G.nextWeird<=0||G.forceWeird){const k=G.forceWeird||pick(WEIRD);G.forceWeird=null;G.nextWeird=rnd(5,10);
    G.weird.push({k,x:W+80,y:k==='gummoon'||k==='handcloud'?rnd(150,240):GY-rnd(70,110),t:0});}}
function drawWeird(){for(const w of G.weird){cx.save();cx.globalAlpha=0.62;cx.translate(w.x,w.y);const t=w.t;
  if(w.k==='handcloud'){const st=Math.sin(t*6);cx.save();cx.rotate(Math.PI);cloudShape(0,0,0.7);cx.restore();cx.strokeStyle='#fff';cx.lineWidth=5;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-14,18);cx.lineTo(-18+st*6,40);cx.moveTo(14,18);cx.lineTo(18-st*6,40);cx.stroke();face(0,-4,16,'');}
  else if(w.k==='mushroom'){cx.rotate(Math.sin(t*7)*0.3);cx.fillStyle='#fff4d6';cx.fillRect(-8,-6,16,30);cx.fillStyle='#ff2d55';cx.beginPath();cx.arc(0,-6,24,Math.PI,TAU);cx.fill();
    cx.fillStyle='#fff';[[-10,-16],[6,-22],[12,-10]].forEach(([a,b])=>{cx.beginPath();cx.arc(a,b,4,0,TAU);cx.fill();});face(0,8,10,'');
    cx.strokeStyle='#fff4d6';cx.lineWidth=4;cx.beginPath();cx.moveTo(-8,4);cx.lineTo(-20,-6+Math.sin(t*14)*8);cx.moveTo(8,4);cx.lineTo(20,-6-Math.sin(t*14)*8);cx.stroke();}
  else if(w.k==='eyeflower'){cx.strokeStyle='#2ee66b';cx.lineWidth=4;cx.beginPath();cx.moveTo(0,40);cx.quadraticCurveTo(Math.sin(t)*10,10,0,-6);cx.stroke();
    for(let i=0;i<8;i++){cx.fillStyle=RB[i%7];cx.beginPath();cx.arc(Math.cos(i*TAU/8+t)*18,-6+Math.sin(i*TAU/8+t)*18,9,0,TAU);cx.fill();}
    cx.fillStyle='#fff';cx.beginPath();cx.arc(0,-6,13,0,TAU);cx.fill();const a=Math.atan2(G.uni.y-w.y,G.uni.x-w.x);cx.fillStyle='#1fb6ff';cx.beginPath();cx.arc(Math.cos(a)*5,-6+Math.sin(a)*5,6,0,TAU);cx.fill();
    cx.fillStyle='#000';cx.beginPath();cx.arc(Math.cos(a)*6,-6+Math.sin(a)*6,3,0,TAU);cx.fill();}
  else if(w.k==='gummoon'){cx.fillStyle='#fff6c0';cx.beginPath();cx.arc(0,0,26,0,TAU);cx.fill();cx.fillStyle='#d9c97a';cx.beginPath();cx.arc(-8,-8,5,0,TAU);cx.fill();
    face(-2,0,18,'o');const b=(Math.sin(t*1.5)+1)/2;cx.fillStyle='rgba(255,120,200,.85)';cx.beginPath();cx.arc(-2+b*18,8,4+b*20,0,TAU);cx.fill();cx.fillStyle='rgba(255,255,255,.6)';cx.beginPath();cx.arc(-2+b*14,2,2+b*5,0,TAU);cx.fill();}
  else if(w.k==='phonecat'){cx.fillStyle='#ffb36b';cx.beginPath();cx.ellipse(0,18,16,20,0,0,TAU);cx.fill();cx.save();cx.translate(0,-10);cx.rotate(Math.sin(t*40)*0.12);
    cx.fillStyle='#ff2d55';rr(-18,-10,36,20,6);cx.fill();cx.fillStyle='#222';cx.beginPath();cx.arc(0,0,6,0,TAU);cx.fill();cx.strokeStyle='#ff2d55';cx.lineWidth=5;cx.beginPath();cx.arc(0,-12,14,Math.PI,TAU);cx.stroke();cx.restore();
    if(Math.sin(t*6)>0)txt('RING!',24,-26,12,'#fff','#4a1458',3);cx.strokeStyle='#ffb36b';cx.lineWidth=4;cx.beginPath();cx.moveTo(14,30);cx.quadraticCurveTo(30,30+Math.sin(t*4)*10,28,10);cx.stroke();}
  else if(w.k==='clock'){const m=(Math.sin(t*1.2)+1)/2;cx.fillStyle='#ffe94d';cx.beginPath();cx.moveTo(-22,-20);cx.lineTo(22,-20);cx.quadraticCurveTo(26,10,14,18+m*30);cx.quadraticCurveTo(0,6,-6,24+m*14);cx.quadraticCurveTo(-26,10,-22,-20);cx.fill();
    cx.strokeStyle='#4a1458';cx.lineWidth=3;cx.beginPath();cx.moveTo(0,-4);cx.lineTo(Math.cos(t*3)*12,-4+Math.sin(t*3)*12+m*6);cx.moveTo(0,-4);cx.lineTo(Math.cos(t*0.5)*8,-4+Math.sin(t*0.5)*8);cx.stroke();}
  cx.restore();}cx.globalAlpha=1;}
function cloudShape(x,y,s){cx.drawImage(BG.cloud,x-30*s-30*s,y-48*s,140*s,90*s);}

/* ================= v0.3: SHOP, LEADERBOARD, SETTINGS, VOMIT, MOVING HAZARDS, LIGHTS-OUT, GIANT FAN, MUSIC, SHIMMER ================= */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const RBW=RB;
const SKINS=[
 {id:'classic',n:'Classic Unicorn',p:0,d:'The original. Simply neigh-gnificent.',b:'#fff',l:'#c2338f',m:RBW,h:['#ffd21f','#fff6a0'],tr:RBW,fs:['sine',250,2.8]},
 {id:'cat',n:'Cat-icorn',p:60,d:'Purr-fectly majestic. Knocks pillars off tables.',b:'#ffb36b',l:'#a0522d',m:['#ff8a00','#ffcf99','#fff'],tr:['#ffb36b','#fff','#ff8a00'],fs:['triangle',700,0.6],acc:'cat'},
 {id:'llama',n:'Llama-corn',p:90,d:'No prob-llama. Spits glitter.',b:'#f3e3c3',l:'#8a6b3a',m:['#ff4fd8','#2ee66b','#ffe600'],tr:['#ff4fd8','#2ee66b','#ffe600','#1fb6ff'],fs:['sawtooth',200,1.6],acc:'llama'},
 {id:'narwhal',n:'Narwhal',p:120,d:'Unicorn of the sea. Whale, whale, whale...',b:'#8fb8d8',l:'#2b5a80',m:['#1fb6ff','#7ffcff','#fff'],h:['#fff','#e8f6ff'],tr:['#1fb6ff','#7ffcff','#ffffff'],fs:['sine',180,3.5],acc:'narwhal'},
 {id:'pizza',n:'Pizza-corn',p:160,d:'A slice of heaven. Extra cheesy.',b:'#ffd25e',l:'#c26a00',m:['#ff2d55','#ffe600','#2ee66b'],tr:['#ff2d55','#ffd25e','#c26a00'],fs:['square',300,1.8],acc:'pizza'},
 {id:'disco',n:'Disco-corn',p:200,d:'Staying alive. Staying shiny.',b:'#d8dde8',l:'#6a6f85',m:['#ff4fd8','#1fb6ff','#ffe600','#7a5cff'],tr:['#fff','#ff4fd8','#1fb6ff','#ffe600'],fs:['square',520,1.5],acc:'disco'},
 {id:'zombie',n:'Zombie-corn',p:250,d:'Brainsss... and rainbowsss. Dead-icated.',b:'#9fd08a',l:'#3f6b2f',m:['#6b8f3a','#a05cb0','#3f6b2f'],h:['#c9c08a','#e8e4c0'],tr:['#9fd08a','#a05cb0','#3f6b2f'],fs:['sawtooth',120,0.7],acc:'zombie'},
 {id:'ninja',n:'Ninja-corn',p:300,d:'You never saw it. Hoof-jitsu master.',b:'#2a2a3a',l:'#000',m:['#ff2d55','#2a2a3a'],h:['#c0c0c8','#fff'],tr:['#2a2a3a','#ff2d55','#555'],fs:['triangle',900,0.4],acc:'ninja'},
 {id:'corgi',n:'Corgi-corn',p:375,d:'Short legs, tall dreams. A total loaf.',b:'#ff9f43',l:'#a0522d',m:['#ff9f43','#fff','#ffcf99'],tr:['#ff9f43','#fff'],fs:['square',160,0.8],acc:'corgi'},
 {id:'taco',n:'Taco-corn',p:450,d:'Every day is Taco Tuesday. Nacho average unicorn.',b:'#ffcc4d',l:'#b37a00',m:['#2ee66b','#ff2d55','#fff6a0'],tr:['#2ee66b','#ff2d55','#ffcc4d'],fs:['sawtooth',260,1.3],acc:'taco'},
 {id:'robo',n:'Robo-corn',p:550,d:'Beep boop. Error 404: chill not found.',b:'#b8c2cc',l:'#4a5560',m:['#1fb6ff','#7ffcff','#4a5560'],h:['#7ffcff','#fff'],tr:['#1fb6ff','#7ffcff'],fs:['square',440,2],acc:'robo'},
 {id:'potato',n:'Potato-corn',p:650,d:'Spud-tacular. Not a couch potato (it flies).',b:'#c8a06a',l:'#6b4a22',m:['#8a6b3a','#c8a06a','#2ee66b'],tr:['#c8a06a','#8a6b3a'],fs:['triangle',150,1.2],acc:'potato'},
 {id:'ghost',n:'Ghost-corn',p:800,d:'Boo-tiful. Simply too spooky to stay dead.',b:'#f4f7ff',l:'#8a9ad8',m:['#d6e0ff','#fff','#b0c0ff'],tr:['#ffffff','#d6e0ff'],fs:['sine',400,1.5],ghost:1,acc:'ghost'},
 {id:'grandma',n:'Grandma-corn',p:1000,d:'Back in my day we flapped UPHILL. Both ways.',b:'#e8d8f0',l:'#7a5c8a',m:['#c0c0c8','#e0e0e8'],tr:['#ffb3e6','#c9a8ff','#fff'],fs:['triangle',330,1.25],acc:'grandma'},
 {id:'golden',n:'Golden-corn',p:2500,d:'Secret! Worth its weight in gold. 24-carrot horn.',b:'#ffd700',l:'#a87b00',m:['#fff6a0','#ffd700','#ffb000'],h:['#fff','#fffbe0'],tr:['#ffd700','#fff6a0','#ffb000'],fs:['sine',600,2.4],acc:'golden',secret:1}];
SKINS.forEach(k=>{k.hf=k.hf||'#ff4fd8';k.sp=k.sp||'rgba(255,255,255,.35)';k.sn=k.sn||'#ffd0ea';k.h=k.h||['#ffd21f','#fff6a0'];});
G.coins=LS.get('uf_coins',0);G.owned=LS.get('uf_owned',['classic']);G.skin=LS.get('uf_skin','classic');G.lb=LS.get('uf_lb',[]);G.mv=LS.get('uf_mv',8);G.sv=LS.get('uf_sv',8);
G.shopSel=G.skin;G.skinDraw=null;
function saveEco(){LS.set('uf_coins',G.coins);LS.set('uf_owned',G.owned);LS.set('uf_skin',G.skin);}
function skinCol(){const id=G.skinDraw||G.skin;return SKINS.find(k=>k.id===id)||SKINS[0];}
function goldenOK(){return SKINS.every(k=>k.secret||G.owned.includes(k.id));}
function skinAcc(K,u,t){const a=K.acc;if(!a)return;cx.lineCap='round';
 if(a==='cat'){cx.fillStyle=K.b;cx.strokeStyle=K.l;cx.lineWidth=2;for(const ex of [10,24]){cx.beginPath();cx.moveTo(ex-5,-26);cx.lineTo(ex,-37);cx.lineTo(ex+5,-26);cx.closePath();cx.fill();cx.stroke();}
   cx.strokeStyle='#3a1640';cx.lineWidth=1;for(const d of [-2,1,4]){cx.beginPath();cx.moveTo(30,-11+d);cx.lineTo(40,-13+d*1.6);cx.stroke();}cx.fillStyle='#a0522d';for(let i=0;i<3;i++)cx.fillRect(-10+i*7,-14,3,10);}
 else if(a==='llama'){cx.fillStyle='#fff';for(let i=0;i<6;i++){cx.beginPath();cx.arc(8+i*2,-6-i*3,5,0,TAU);cx.fill();}cx.fillStyle='#ff4fd8';cx.fillRect(-14,-6,28,5);cx.fillStyle='#2ee66b';cx.fillRect(-14,-1,28,3);}
 else if(a==='narwhal'){cx.fillStyle='#2b5a80';for(let i=0;i<5;i++){cx.beginPath();cx.arc(-12+i*6,2+(i%2)*4,1.6,0,TAU);cx.fill();}cx.strokeStyle='#7ffcff';cx.lineWidth=2;const k=(t*2)%1;cx.globalAlpha*=1-k;cx.beginPath();cx.arc(19,-48-k*10,4+k*6,Math.PI,TAU);cx.stroke();cx.globalAlpha=K.ghost?0.62:1;}
 else if(a==='pizza'){cx.fillStyle='#d63031';[[-10,-4],[2,4],[8,-6],[-4,6],[19,-21]].forEach(([x,y])=>{cx.beginPath();cx.arc(x,y,3.5,0,TAU);cx.fill();});cx.fillStyle='#2ee66b';cx.fillRect(-2,-8,4,2);cx.fillRect(12,2,4,2);}
 else if(a==='disco'){cx.strokeStyle='rgba(80,80,110,.5)';cx.lineWidth=1;for(let x=-20;x<=20;x+=6){cx.beginPath();cx.moveTo(x,-14);cx.lineTo(x,14);cx.stroke();}for(let y=-12;y<=12;y+=6){cx.beginPath();cx.moveTo(-20,y);cx.lineTo(20,y);cx.stroke();}
   for(let i=0;i<4;i++){const k=Math.sin(t*6+i*1.7);if(k>0.5){cx.fillStyle=RB[i*2%7];cx.fillRect(-18+i*10,-10+(i%2)*10,5,5);}}}
 else if(a==='zombie'){cx.strokeStyle='#3f6b2f';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(-12,-6);cx.lineTo(4,-2);for(let i=0;i<4;i++){cx.moveTo(-10+i*4,-8);cx.lineTo(-9+i*4,-1);}cx.stroke();cx.fillStyle='#6b8f3a';cx.beginPath();cx.arc(14,-22,3,0,TAU);cx.fill();}
 else if(a==='ninja'){cx.fillStyle='#ff2d55';cx.fillRect(8,-26,22,5);cx.beginPath();cx.moveTo(8,-24);cx.lineTo(-6,-30+Math.sin(t*14)*4);cx.lineTo(-4,-22+Math.sin(t*12)*4);cx.fill();cx.fillStyle='#2a2a3a';cx.fillRect(23,-14,12,8);}
 else if(a==='corgi'){cx.fillStyle='#ff9f43';cx.strokeStyle=K.l;cx.lineWidth=2;for(const ex of [9,22]){cx.beginPath();cx.ellipse(ex,-30,4,9,ex<15?-0.3:0.3,0,TAU);cx.fill();cx.stroke();}cx.fillStyle='#fff';cx.beginPath();cx.ellipse(0,7,13,6,0,0,TAU);cx.fill();cx.beginPath();cx.ellipse(28,-9,6,5,0,0,TAU);cx.fill();}
 else if(a==='taco'){cx.fillStyle='#2ee66b';for(let i=0;i<7;i++){cx.beginPath();cx.arc(-16+i*5.5,-13+Math.sin(i)*1.5,4,0,TAU);cx.fill();}cx.fillStyle='#ff2d55';for(let i=0;i<4;i++){cx.fillRect(-14+i*8,-17,4,4);}cx.strokeStyle='#b37a00';cx.lineWidth=1;cx.beginPath();cx.arc(0,0,18,0.2,Math.PI-0.2);cx.stroke();}
 else if(a==='robo'){cx.strokeStyle='#4a5560';cx.lineWidth=2;cx.beginPath();cx.moveTo(14,-28);cx.lineTo(10,-40);cx.stroke();cx.fillStyle=Math.sin(t*8)>0?'#ff2d55':'#ffe600';cx.beginPath();cx.arc(10,-42,3,0,TAU);cx.fill();
   cx.fillStyle='#4a5560';[[-14,-6],[-14,6],[0,-10],[10,8]].forEach(([x,y])=>{cx.beginPath();cx.arc(x,y,1.5,0,TAU);cx.fill();});cx.strokeStyle='#4a5560';cx.lineWidth=1;cx.strokeRect(-8,-4,12,8);}
 else if(a==='potato'){cx.fillStyle='#8a6b3a';[[-12,-4],[-2,6],[6,-8],[12,4],[16,-20]].forEach(([x,y])=>{cx.beginPath();cx.ellipse(x,y,2.4,1.6,0.4,0,TAU);cx.fill();});cx.strokeStyle='#2ee66b';cx.lineWidth=2;cx.beginPath();cx.moveTo(4,-14);cx.quadraticCurveTo(0,-24,-6,-22);cx.stroke();}
 else if(a==='ghost'){cx.fillStyle=K.b;cx.beginPath();for(let i=0;i<5;i++)cx.arc(-16+i*8,14+Math.sin(t*8+i)*2,5,0,Math.PI);cx.fill();}
 else if(a==='grandma'){cx.strokeStyle='#3a1640';cx.lineWidth=1.6;cx.beginPath();cx.arc(20,-18,7.5,0,TAU);cx.moveTo(27.5,-18);cx.lineTo(31,-17);cx.stroke();cx.fillStyle='rgba(200,230,255,.35)';cx.fill();
   cx.fillStyle='#c0c0c8';cx.beginPath();cx.arc(12,-30,7,0,TAU);cx.fill();cx.fillStyle='#fff';for(let i=0;i<6;i++){cx.beginPath();cx.arc(8+i*2.5,-4+i*1.2,1.8,0,TAU);cx.fill();}}
 else if(a==='golden'){if(Math.sin(t*5)>0){cx.fillStyle='#fff';starPath(-8,-6,6,1.5,4,t*2);cx.fill();}if(Math.sin(t*4+2)>0){cx.fillStyle='#fff';starPath(10,4,5,1.2,4,-t*2);cx.fill();}}
}
// skin flap sound + trail
S.flap=function(){if(!A.ctx)return;const K=skinCol(),[w,f,m]=K.fs,t=A.ctx.currentTime;const o=tone(w,f*rnd(0.93,1.07),t,0.22,w==='sine'?0.5:0.22,A.sfx,f*m,0.12);
 const l=A.ctx.createOscillator(),lg=A.ctx.createGain();l.frequency.value=28;lg.gain.value=f*0.1;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+0.25);};
drawTrail=function(){const tr=G.trail;if(tr.length<3)return;const K=skinCol(),C=K.tr;cx.lineCap='round';cx.lineJoin='round';const nb=7;
 for(let b=0;b<nb;b++){cx.strokeStyle=C[b%C.length];cx.lineWidth=5;cx.beginPath();for(let i=0;i<tr.length;i++){const q=tr[i];const wv=Math.sin(G.t*10-i*0.5)*(i/tr.length)*2;cx.lineTo(q.x,q.y-15+b*5+wv);}cx.stroke();}
 // glossy highlight + star-dust twinkles
 cx.globalAlpha=0.45;cx.strokeStyle='#fff';cx.lineWidth=2;cx.beginPath();for(const q of tr)cx.lineTo(q.x,q.y-14);cx.stroke();
 const sa=G.rf?0.35:0.9;for(let i=0;i<tr.length;i+=3){const tw=(Math.sin(G.t*9+i*1.3)+1)/2;cx.globalAlpha=sa*tw;cx.fillStyle='#fff';starPath(tr[i].x+((i*13)%9),tr[i].y-20+((i*7)%40),2+tw*3,0.8,4,G.t*3+i);cx.fill();}cx.globalAlpha=1;};

/* ---------- audio: volumes, music modes, stingers ---------- */
function applyVol(){if(!A.ctx)return;A.mus.gain.setTargetAtTime(0.32*G.mv/8,A.ctx.currentTime,0.05);A.sfx.gain.setTargetAtTime(0.7*G.sv/8,A.ctx.currentTime,0.05);}
const _aInit=aInit;aInit=function(){const had=!!A.ctx;_aInit();if(!had&&A.ctx)applyVol();};
A.mode='main';
const PROGS=[CH,[[53,57,60],[55,59,62],[52,55,59],[57,60,64]],[[57,60,64],[53,57,60],[60,64,67],[55,59,62]]];
const LEADW=['square','sawtooth','triangle'];
const TIP=[67,null,64,null,67,null,64,null,69,67,65,64,62,null,59,null];
function kazoo(t,f,d,dest){const c=A.ctx,k=c.createOscillator(),bp=c.createBiquadFilter(),g=c.createGain(),v=c.createOscillator(),vg=c.createGain();k.type='sawtooth';k.frequency.value=f;bp.type='bandpass';bp.frequency.value=1000;bp.Q.value=3;v.frequency.value=6;vg.gain.value=8;v.connect(vg);vg.connect(k.frequency);
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.18,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+d);k.connect(bp);bp.connect(g);g.connect(dest||A.mus);k.start(t);k.stop(t+d+0.02);v.start(t);v.stop(t+d+0.02);}
function cricket(t){for(let i=0;i<3;i++)tone('sine',4200,t+i*0.04,0.03,0.06,A.mus);}
const STING={honk(t,d){kazoo(t,233,0.15,d);kazoo(t+0.17,220,0.22,d);},
 boing(t,d){const o=tone('sine',150,t,0.45,0.35,d,600,0.4);const l=A.ctx.createOscillator(),lg=A.ctx.createGain();l.frequency.value=18;lg.gain.value=60;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+0.5);},
 quack(t,d){for(let i=0;i<2;i++){tone('sawtooth',700,t+i*0.18,0.12,0.12,d,350,0.1);}},
 scratch(t,d){const c=A.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=A.noise;s.playbackRate.setValueAtTime(0.4,t);s.playbackRate.linearRampToValueAtTime(2.2,t+0.12);s.playbackRate.linearRampToValueAtTime(0.3,t+0.25);
  f.type='bandpass';f.frequency.value=1800;f.Q.value=2;g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.3);s.connect(f);f.connect(g);g.connect(d);s.start(t);s.stop(t+0.3);}};
function sting(k,dest){if(!A.ctx)return;k=k||pick(Object.keys(STING));STING[k](A.ctx.currentTime+0.02,dest||A.sfx);A.lastSting=k;}
sched=function(){if(!A.ctx)return;const mode=A.mode||'main';const SM=Math.min(2.5,spdMul()),bpm=(mode==='tiptoe'?108:mode==='fan'?176:(A.frenzy?172:150))*SM,spb=60/bpm/4;
 while(A.next<A.ctx.currentTime+0.15){const t=A.next,s=A.step%64,bar=(s/16)|0,st=s%16,sec=((A.step/128)|0)%3,ch=PROGS[sec][bar];
  if(mode==='tiptoe'){const n=TIP[st];if(n&&st%2===0)tone('triangle',mtof(n+(bar%2?-2:0)),t,0.06,0.3,A.mus);if(st%4===0)tone('sine',mtof(ch[0]-12),t,0.07,0.35,A.mus);
   if(st===12&&bar%2===1)kazoo(t,mtof(ch[2]),0.35);if(st%8===5)cricket(t);}
  else if(mode==='fan'){if(st%4===0)tone('sine',160,t,0.16,0.9,A.mus,45,0.1);if(st%2===1)noise(t,0.04,0.3,8000,A.mus);if(st%4===2)tone('sawtooth',mtof(ch[0]-12),t,0.12,0.25,A.mus);
   tone('square',mtof(ch[st%3]+24+(st>=8?12:0)),t,0.05,0.07,A.mus);if(st===0&&bar===2)STING.honk(t,A.mus);}
  else{if(st%4===0)tone('sine',150,t,0.18,0.9,A.mus,45,0.12);if(st%4===2)noise(t,0.05,0.25,7000,A.mus);if(st===4||st===12)noise(t,0.12,0.35,1500,A.mus);
   const bn=ch[0]-24+((st%4===2)?12:0);if(st%2===0)tone('triangle',mtof(bn),t,0.16,0.55,A.mus);
   const pat=((A.step/64)|0)%2?MEL2:MEL,k=pat[st];if(k>=0){const n=ch[k%3]+12*(1+((k/3)|0));tone(LEADW[sec],mtof(n),t,0.11,sec===1?0.08:0.14,A.mus);tone(LEADW[sec],mtof(n)*1.005,t,0.09,0.05,A.mus);}
   if(A.frenzy&&st%2===1)tone('sine',mtof(ch[(st>>1)%3]+36),t,0.08,0.12,A.mus);
   if(st===14&&bar===3&&Math.random()<0.7){const k2=pick(Object.keys(STING));STING[k2](t,A.mus);A.lastSting=k2;}}
  A.next+=spb;A.step++;}};
S.vomit=function(){if(!A.ctx)return;const t=A.ctx.currentTime,c=A.ctx;const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(140,t);o.frequency.linearRampToValueAtTime(90,t+0.6);
 l.frequency.value=14;lg.gain.value=30;l.connect(lg);lg.connect(o.frequency);f.type='lowpass';f.frequency.value=900;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.4,t+0.05);g.gain.exponentialRampToValueAtTime(0.0001,t+0.7);
 o.connect(f);f.connect(g);g.connect(A.sfx);o.start(t);o.stop(t+0.75);l.start(t);l.stop(t+0.75);noise(t+0.1,0.6,0.25,500);[1568,2093,2637,3136,2637,3136].forEach((fr,i)=>tone('sine',fr,t+0.4+i*0.06,0.2,0.15));};
S.wind=function(d){if(!A.ctx)return;const t=A.ctx.currentTime,c=A.ctx;for(let i=0;i<Math.ceil(d/0.28);i++){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=A.noise;f.type='lowpass';f.frequency.value=500+Math.sin(i)*200;
 g.gain.setValueAtTime(0.0001,t+i*0.25);g.gain.linearRampToValueAtTime(0.35,t+i*0.25+0.1);g.gain.linearRampToValueAtTime(0.0001,t+i*0.25+0.3);s.connect(f);f.connect(g);g.connect(A.sfx);s.start(t+i*0.25);s.stop(t+i*0.25+0.31);}};
S.click=function(){if(!A.ctx)return;const t=A.ctx.currentTime;noise(t,0.04,0.8,2000);tone('square',90,t,0.06,0.3);};
S.buy=function(){if(!A.ctx)return;const t=A.ctx.currentTime;[60,64,67,72,76,79,84].forEach((m,i)=>tone('square',mtof(m),t+i*0.06,0.14,0.12));STING.boing(t+0.45,A.sfx);};

/* ---------- run bookkeeping, coins, leaderboard ---------- */
const _reset=reset;reset=function(){_reset();G.vom=null;G.lo=null;G.fan=null;G.shots=[];G.junk=[];G.splat=[];G.clouds=[];G.frenzies=0;G.kills=0;G.dodged=0;G.nuke0=G.nukes;G.entry=null;G.runCoins=0;A.mode='main';G.testT=0;G.testNext=3;G.runT=(TEST==='speed'?290:0);G.spdMs=0;G.uni.x=W*0.3;};
const _sf=startFrenzy;startFrenzy=function(){_sf();G.frenzies++;};
const RANKS=['Supreme Sparkle Overlord','Grand Glitter Duke','Baroness of Bling','Rainbow Royalty','Horn-orable Knight','Sparkle Squire','Glitter Goblin'];
function rankTitle(i){return i===0?RANKS[0]:i===1?RANKS[1]:i===2?RANKS[2]:i<5?RANKS[3]:i<10?RANKS[4]:i<15?RANKS[5]:RANKS[6];}
function qualifies(sc){return sc>0&&(G.lb.length<20||sc>G.lb[G.lb.length-1].s);}
const _die=die;die=function(){if(G.state!=='play')return;_die();
 let c=G.score+G.gems*2+G.frenzies*10+(G.nukes-(G.nuke0||0))*5+G.kills*3+Math.floor(G.dodged/2);if(TEST)c=Math.floor(c/2);G.runCoins=c;G.coins+=c;saveEco();
 if(!TEST&&qualifies(G.score)){const ini=String(LS.get('uf_ini','UNI')).padEnd(3,'A').slice(0,3);G.entry={l:ini.split(''),saved:false};}
 G.vom=null;G.lo=null;if(G.fan){G.fan=null;}A.mode='main';};
function saveEntry(){const e=G.entry;if(!e||e.saved)return;e.saved=true;const ini=e.l.join('');LS.set('uf_ini',ini);
 const d=new Date();const ds=(d.getMonth()+1)+'/'+d.getDate()+'/'+String(d.getFullYear()).slice(2);
 G.lb.push({i:ini,s:G.score,d:ds,k:G.skin});G.lb.sort((a,b)=>b.s-a.s);G.lb=G.lb.slice(0,20);LS.set('uf_lb',G.lb);G.lastLB=G.lb.findIndex(r=>r.i===ini&&r.s===G.score);}
function restart(){if(G.entry)saveEntry();reset();G.state='play';flap();}

/* ---------- UI buttons + input ---------- */
const UI={btns:[]};G.ui=UI;
function btn(id,x,y,w,h,label,col,fn,sz){UI.btns.push({id,x:x-w/2,y:y-h/2,w,h,fn});cx.save();cx.fillStyle=col||'#ff4fd8';rr(x-w/2,y-h/2,w,h,Math.min(h/2,18));cx.fill();
 const g=cx.createLinearGradient(0,y-h/2,0,y+h/2);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(0.5,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.12)');cx.fillStyle=g;cx.fill();
 cx.strokeStyle='#fff';cx.lineWidth=3;cx.stroke();cx.restore();txt(label,x,y+1,sz||Math.min(20,h*0.45),'#fff','#4a1458',4);}
function toGame(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
const _tap=tap;tap=function(e){aInit();const pt=e&&e.clientX!=null?toGame(e):null;G.lastTap=pt;
 if(pt&&G.state!=='play'){for(let i=UI.btns.length-1;i>=0;i--){const b=UI.btns[i];if(pt.x>=b.x&&pt.x<=b.x+b.w&&pt.y>=b.y&&pt.y<=b.y+b.h){S.pop();b.fn();return;}}}
 if(G.state==='shop'||G.state==='lb'||G.state==='settings')return;
 if(G.state==='over'){if(G.entry&&!G.entry.saved)return;if(G.t-G.overT>0.45)restart();return;}
 _tap();};
showToggles=function(){rfBtn.style.display='none';rmBtn.style.display='none';};
function coinIcon(x,y,r){cx.save();for(let i=0;i<6;i++){cx.fillStyle=RB[i];cx.beginPath();cx.arc(x,y,r-i*r/7,0,TAU);cx.fill();}cx.strokeStyle='#4a1458';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,r,0,TAU);cx.stroke();
 if(Math.sin(G.t*4+x)>0.5&&!G.rf){cx.fillStyle='#fff';starPath(x+r*0.5,y-r*0.5,r*0.5,1.2,4,G.t);cx.fill();}cx.restore();}
function coinLine(y,extra){const s=(extra||'')+G.coins+' RAINBOW COINS';cx.font=`18px ${FONT}`;const w=cx.measureText(s).width;coinIcon(W/2-w/2-14,y,10);txt(s,W/2+6,y,18,'#ffe600','#4a1458',5);}
function panel(y0,h){cx.fillStyle='rgba(74,20,88,.55)';cx.fillRect(0,0,W,H);cx.fillStyle='rgba(255,246,253,.94)';rr(10,y0,W-20,h,24);cx.fill();cx.strokeStyle='#ff4fd8';cx.lineWidth=5;cx.stroke();
 const g=cx.createLinearGradient(10,0,W-10,0);const o=(G.t*0.3)%1;for(let i=0;i<=6;i++)g.addColorStop(i/6,`hsla(${(i*60+o*360)%360},100%,75%,.25)`);cx.fillStyle=g;rr(10,y0,W-20,h,24);cx.fill();}
function drawTitle(){const by=Math.sin(G.t*2.5)*6;cx.save();cx.translate(W/2,118+by);cx.rotate(Math.sin(G.t*1.7)*0.04);
 rainbowText('UNICORN',0,-26,Math.min(64,W/6),5);rainbowText('FLAP-TASTIC!',0,30,Math.min(52,W/7.4),5);cx.restore();shineSweep(20,70,W-40,100);
 txt('A Rainwater Games production',W/2,186,18,'#fff','#7a2a8a',5);coinLine(214);
 txt(skinCol().n.toUpperCase(),W/2,H*0.535+36,14,'#fff','#4a1458',4);
 const ps=1+Math.sin(G.t*7)*0.06;cx.save();cx.translate(W/2,H*0.67);cx.scale(ps,ps);cx.fillStyle='#ff4fd8';rr(-115,-28,230,56,28);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=5;cx.stroke();
 txt('TAP TO FLAP!',0,2,32,'#fff','#7a1460',6);cx.restore();
 const bw=(W-40)/3;btn('shop',20+bw/2,520,bw-6,44,'SHOP','#ff4fd8',()=>{G.state='shop';G.shopSel=G.skin;});
 btn('lb',20+bw*1.5,520,bw-6,44,'TROPHIES','#7a5cff',()=>{G.state='lb';G.lbFrom='title';},15);
 btn('settings',20+bw*2.5,520,bw-6,44,'SETTINGS','#1fb6ff',()=>{G.state='settings';},15);
 verTag();copyLine();}
function drawOver(){const k=clamp((G.t-G.overT)*2.2,0,1),s=k<1?(1-Math.pow(1-k,3))*bounce(1-k):1;cx.fillStyle='rgba(74,20,88,'+(0.35*k)+')';cx.fillRect(0,0,W,H);
 cx.save();cx.translate(W/2,H*0.3);cx.scale(s,s);cx.translate(-W/2,-H*0.3);const E=G.entry&&!G.entry.saved;const ph=E?370:250;
 cx.fillStyle='#fff6fd';rr(W*0.06,40,W*0.88,ph,28);cx.fill();cx.lineWidth=6;cx.strokeStyle='#ff4fd8';cx.stroke();
 for(let i=0;i<7;i++){cx.fillStyle=RB[i];cx.fillRect(W*0.06+22+i*((W*0.88-44)/7),48,(W*0.88-44)/7,7);}
 rainbowText('OOPSIE-DAISY!',W/2,80,Math.min(38,W/9.5),3);wrap(G.msg,W/2,114,W*0.74,16,'#7a2a8a');
 txt('SCORE',W*0.3,140,16,'#b04ac0');txt('BEST',W*0.7,140,16,'#b04ac0');txt(String(G.score),W*0.3,172,46,'#ff4fd8','#4a1458',8);txt(String(G.best),W*0.7,172,46,'#1fb6ff','#4a1458',8);
 if(G.newBest){cx.save();cx.translate(W*0.82,120);cx.rotate(0.3+Math.sin(G.t*8)*0.1);cx.fillStyle='#ffe600';starPath(0,0,30,20,10,G.t);cx.fill();txt('NEW!',0,0,16,'#ff2d55');cx.restore();}
 coinIcon(W*0.2,210,9);txt('+'+G.runCoins+' coins  (total '+G.coins+')',W/2+8,210,15,'#a07000');txt('Gems '+G.gems+'  Puked '+G.kills+'  Dodged '+G.dodged,W/2,232,13,'#7a2a8a');
 cx.restore();
 if(k<1)return;
 if(E){const e=G.entry;rainbowText('TOP-20! ENTER INITIALS',W/2,262,19,2);
  for(let i=0;i<3;i++){const x=W/2+(i-1)*76;btn('up'+i,x,300,62,44,'▲','#ff4fd8',()=>{e.l[i]=String.fromCharCode((e.l[i].charCodeAt(0)-65+1)%26+65);},22);
   cx.fillStyle='#fff';rr(x-28,326,56,50,12);cx.fill();cx.strokeStyle='#7a5cff';cx.lineWidth=3;cx.stroke();txt(e.l[i],x,352,40,'#ff4fd8','#4a1458',6);
   btn('dn'+i,x,402,62,44,'▼','#7a5cff',()=>{e.l[i]=String.fromCharCode((e.l[i].charCodeAt(0)-65+25)%26+65);},22);}
 }
 const ps=1+Math.sin(G.t*8)*0.05;const ry=H*0.74;cx.save();cx.translate(W/2,ry);cx.scale(ps,ps);cx.translate(-W/2,-ry);
 btn('retry',W/2,ry,W*0.8,70,E?'SAVE & RETRY':'TAP TO RETRY',`hsl(${(G.t*120)%360},100%,58%)`,restart,Math.min(34,W/10));cx.restore();
 const bw=(W-40)/3;btn('ov-lb',20+bw/2,560,bw-6,40,E?'SAVE':'TROPHIES','#7a5cff',()=>{saveEntry();G.state='lb';G.lbFrom='over';},14);
 btn('ov-shop',20+bw*1.5,560,bw-6,40,'SHOP','#ff4fd8',()=>{saveEntry();G.state='shop';G.shopSel=G.skin;G.from='over';},14);
 btn('ov-menu',20+bw*2.5,560,bw-6,40,'MENU','#1fb6ff',()=>{saveEntry();reset();G.state='title';},14);copyLine();}
function back(){if(G.state==='lb'&&G.lbFrom==='over'||G.state==='shop'&&G.from==='over'){G.from=null;G.lbFrom=null;reset();G.state='title';return;}G.state='title';}
const THC={};function thumb(id,sil){const key=id+(sil?'_s':'')+'_'+DPR;if(THC[key])return THC[key];const [c,g]=mk(80,80);const o=cx,T=G.t;cx=g;G.t=0.3;previewUni(40,44,0.5,id,false);G.t=T;cx=o;
 if(sil){g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgba(40,10,60,0.45)';g.fillRect(0,0,c.width,c.height);g.restore();}THC[key]=c;return c;}
function previewUni(x,y,sc,id,sil){const u=G.uni,keep=G.skinDraw;G.skinDraw=id;cx.save();cx.translate(x,y);cx.scale(sc,sc);
 if(sil){cx.drawImage(thumb(id,true),-80,-88,160,160);cx.restore();G.skinDraw=keep;return;}
 drawUnicorn({x:0,y:Math.sin(G.t*4+x)*3,vy:0,rot:Math.sin(G.t*3+x)*0.08,sq:1,flapT:Math.sin(G.t*6)>0.6?0.1:0,face:'idle',spin:0,wing:(Math.sin(G.t*10+x)+1)/2,blink:1});
 cx.restore();G.skinDraw=keep;}
function drawShop(){panel(14,H-28);rainbowText('SKIN SHOP',W/2,44,34,3);coinLine(76,'');
 const k=SKINS.find(s=>s.id===G.shopSel)||SKINS[0],own=G.owned.includes(k.id),hid=k.secret&&!own&&!goldenOK();
 cx.save();cx.fillStyle='rgba(122,92,255,.15)';rr(24,92,W-48,170,18);cx.fill();cx.restore();
 // animated preview + its trail
 const px=W/2-6,py=150;if(!hid){const C=k.tr;for(let b=0;b<C.length;b++){cx.strokeStyle=C[b];cx.lineWidth=4;cx.beginPath();for(let i=0;i<16;i++)cx.lineTo(px-30-i*7,py+b*4-6+Math.sin(G.t*8-i*0.6)*4);cx.stroke();}}
 previewUni(px+10,py,1.0,k.id,!own);
 txt(hid?'??? SECRET ???':k.n,W/2,205,20,'#ff4fd8','#4a1458',4);wrap(hid?'Own every other skin to reveal...':k.d,W/2,230,W-70,12,'#7a2a8a');
 if(own){const eq=G.skin===k.id;btn('equip',W/2,264,150,34,eq?'EQUIPPED ✓':'EQUIP','#2ee66b',()=>{G.skin=k.id;saveEco();word('HORN-TASTIC!',W/2,150,'#2ee66b',28);},16);}
 else if(k.ms){btn('buy',W/2,264,190,34,'UNICORN LV '+k.ms+' REWARD','#9a8aa8',()=>{word('UNLOCK WITH MISSIONS!',W/2,150,'#7ffcff',22);},14);}
 else if(!hid){const can=G.coins>=k.p;btn('buy',W/2,264,170,34,'BUY '+k.p,can?'#ff8a00':'#9a8aa8',()=>{if(G.coins<k.p){word('NEED MORE COINS!',W/2,150,'#ff2d55',22);S.uhoh();return;}
   G.coins-=k.p;G.owned.push(k.id);G.skin=k.id;saveEco();S.buy();word('YAAAS!',W/2,140,'#ffe600',44);word(pick(['SLAY!','UNI-BELIEVABLE!','HORN-TASTIC!']),W/2,190,'#ff4fd8',30);burst(W/2,150,70,true);G.flash=Math.max(G.flash,0.5);G.shake=8;},16);}
 const cols=5,cw=(W-40)/cols,ch=62;SKINS.forEach((s,i)=>{const cxp=20+(i%cols)*cw+cw/2,cyp=310+((i/cols)|0)*(ch+4);const o=G.owned.includes(s.id),sel=s.id===G.shopSel,h2=s.secret&&!o&&!goldenOK();
  UI.btns.push({id:'sk_'+s.id,x:cxp-cw/2+2,y:cyp-ch/2,w:cw-4,h:ch,fn:()=>{G.shopSel=s.id;}});
  cx.fillStyle=sel?'#ffe6fa':'#fff';rr(cxp-cw/2+2,cyp-ch/2,cw-4,ch,10);cx.fill();cx.strokeStyle=sel?'#ff4fd8':(s.id===G.skin?'#2ee66b':'#c9a8ff');cx.lineWidth=sel?4:2;cx.stroke();
  if(h2){txt('?',cxp,cyp-6,26,'#ffd700','#4a1458',4);}else{const th=thumb(s.id,!o);cx.drawImage(th,cxp+2-40,cyp-4-44+Math.sin(G.t*4+i)*2,80,80);}
  txt(o?(s.id===G.skin?'ON':'OWN'):h2?'???':s.ms?'LV'+s.ms:String(s.p),cxp,cyp+22,11,o?'#2ee66b':'#ff8a00','#4a1458',3);});
 btn('back',W/2,H-46,140,40,'BACK','#7a5cff',back);}
function drawLB(){panel(14,H-28);rainbowText('HALL OF SPARKLE',W/2,44,28,3);txt('LOCAL TOP 20',W/2,72,13,'#7a2a8a');
 if(!G.lb.length)wrap('No legends yet. Go flap something!',W/2,200,W-80,18,'#7a2a8a');
 G.lb.forEach((r,i)=>{const y=96+i*23.5,me=i===G.lastLB;if(me){cx.fillStyle=`hsla(${(G.t*120)%360},100%,70%,.45)`;rr(18,y-11,W-36,22,8);cx.fill();}
  txt('#'+(i+1),36,y,i<3?16:13,i===0?'#ffb000':'#7a5cff',i<3?'#4a1458':null,3);txt(r.i,74,y,16,'#ff4fd8','#4a1458',3);txt(String(r.s),118,y,16,'#1fb6ff','#4a1458',3);
  txt(rankTitle(i),W-24,y-4,i<3?10:9,'#7a2a8a',null,0,'right');txt(r.d,W-24,y+6,8,'#b04ac0',null,0,'right');});
 btn('back',W/2,H-38,140,40,'BACK','#7a5cff',back);}
function drawSettings(){panel(40,H-80);rainbowText('SETTINGS',W/2,80,34,3);
 const row=(y,lab,v,set)=>{txt(lab,W/2,y-24,16,'#7a2a8a');btn(lab+'-',50,y+8,44,40,'−','#7a5cff',()=>{set(Math.max(0,v-1));},24);btn(lab+'+',W-50,y+8,44,40,'+','#ff4fd8',()=>{set(Math.min(10,v+1));},24);
  for(let i=0;i<10;i++){cx.fillStyle=i<v?RB[i%7]:'#e6d8f0';rr(80+i*((W-160)/10),y,(W-160)/10-3,18,4);cx.fill();}};
 row(150,'MUSIC VOLUME',G.mv,v=>{G.mv=v;LS.set('uf_mv',v);aInit();applyVol();});
 row(240,'SFX VOLUME',G.sv,v=>{G.sv=v;LS.set('uf_sv',v);aInit();applyVol();S.flap();});
 btn('rf',W/2,320,W-60,46,'REDUCE FLASHING: '+(G.rf?'ON':'OFF'),G.rf?'#2ee66b':'#9a8aa8',()=>{G.rf=!G.rf;try{localStorage.setItem('uf_rf',G.rf?'1':'0');}catch(_){}},16);
 btn('rm',W/2,380,W-60,46,'REDUCE MOTION: '+(G.rm?'ON':'OFF'),G.rm?'#2ee66b':'#9a8aa8',()=>{G.rm=!G.rm;try{localStorage.setItem('uf_rm',G.rm?'1':'0');}catch(_){}},16);
 btn('mute2',W/2,440,W-60,46,'ALL SOUND: '+(A.muted?'MUTED':'ON'),'#ff8a00',()=>{setMute(!A.muted);},16);
 txt('Reduce flashing tones down flashes & sparkle.',W/2,490,11,'#7a2a8a');txt('Reduce motion skips tilts & big zooms.',W/2,506,11,'#7a2a8a');
 btn('back',W/2,H-80,140,40,'BACK','#7a5cff',back);}
const _hud=drawHUD;drawHUD=function(){UI.btns=[];const s=G.state;
 if(s==='play'||s==='dying')_hud();
 if(s==='play'||s==='dying'){if(G.vom){txt('RAINBOW VOMIT '+Math.max(0,3-G.vom.t).toFixed(1),W/2,hudY13(140),16,`hsl(${(G.t*400)%360},100%,65%)`,'#4a1458',4);}
  if(G.fan&&G.fan.t>2.6&&G.fan.t<G.fan.end){txt('DODGE THE JUNK! '+Math.ceil(G.fan.end-G.fan.t),W/2,hudY13(140),18,'#fff','#4a1458',5);}}
 if(s==='title')drawTitle();else if(s==='over')drawOver();else if(s==='shop')drawShop();else if(s==='lb')drawLB();else if(s==='settings')drawSettings();
 if(s!=='play'&&s!=='dying')drawWords();};

/* ---------- spicy glitter taco / rainbow vomit ---------- */
function drawTaco(x,y){cx.save();cx.translate(x,y+Math.sin(G.t*5)*4);cx.rotate(Math.sin(G.t*3)*0.2);cx.globalAlpha=0.4;cx.fillStyle=`hsl(${(G.t*300)%360},100%,70%)`;cx.beginPath();cx.arc(0,0,28,0,TAU);cx.fill();cx.globalAlpha=1;
 cx.fillStyle='#2ee66b';for(let i=0;i<6;i++){cx.beginPath();cx.arc(-15+i*6,-4,5,0,TAU);cx.fill();}cx.fillStyle='#ff2d55';for(let i=0;i<4;i++)cx.fillRect(-12+i*7,-10,4,4);
 cx.fillStyle='#ffcc4d';cx.strokeStyle='#b37a00';cx.lineWidth=2.5;cx.beginPath();cx.arc(0,-2,19,0.05,Math.PI-0.05);cx.closePath();cx.fill();cx.stroke();
 for(let i=0;i<5;i++){cx.fillStyle=RB[(i+((G.t*8)|0))%7];starPath(-12+i*6,-14-(i%2)*4,3,1,4,G.t*4);cx.fill();}face(0,6,13,'');
 cx.fillStyle='#ff2d55';cx.beginPath();cx.moveTo(14,-20);cx.quadraticCurveTo(22,-30,18,-38);cx.quadraticCurveTo(26,-28,20,-18);cx.fill();txt('SPICY!',0,-40,10,'#fff','#4a1458',3);cx.restore();}
const _dg=drawGem;drawGem=function(g){if(g.kind==='taco'){if(!g.got)drawTaco(g.x,g.y);return;}_dg(g);};
function startVomit(){G.vom={t:0,kills:0,max:Math.random()<0.5?2:3};S.vomit();G.shake=Math.max(G.shake,G.rm?4:12);word('BLAAARGH!',G.uni.x+60,G.uni.y-40,'#2ee66b',38);G.uni.face='shock';G.uni.faceT=0.5;}
function melt(p){const c=p.x+PW/2;for(const yy of [p.gy-p.gap/2-80,p.gy-p.gap/2-220,p.gy+p.gap/2+80,p.gy+p.gap/2+200])burst(c,yy,16,true);
 for(let i=0;i<10;i++)addP('heart',c,p.gy,rnd(-300,300),rnd(-400,100),rnd(0.8,1.4),null,rnd(8,13));
 for(let i=0;i<4;i++)G.splat.push({x:rnd(20,W-20),y:rnd(60,GY-60),r:rnd(18,40),col:pick(RB),life:2.2});
 p.dead=true;p.x=-999;if(!p.passed){p.passed=true;addScore(1);}G.kills++;G.vom.kills++;G.shake=Math.max(G.shake,G.rm?4:14);S.ding(1.5);if(!G.rf)G.flash=Math.max(G.flash,0.25);
 word(['OOPS!','SORRY NOT SORRY','TASTE THE RAINBOW'][(G.vom.kills-1)%3],clamp(c,70,W-70),H*0.25+G.vom.kills*36,pick(['#ffe600','#ff4fd8','#2ee66b']),G.vom.kills===2?24:30);}
function vomTick(dt){const v=G.vom;if(!v)return;v.t+=dt;const u=G.uni;
 for(let i=0;i<4;i++){const a=rnd(-0.18,0.18);addP('vom',u.x+38,u.y-12,G.speed*0.2+rnd(380,520)*Math.cos(a),rnd(-60,60)+Math.sin(a)*300,rnd(0.35,0.6),pick(RB),rnd(5,9));}
 if(v.kills<v.max)for(const p of G.pipes){if(p.dead||p.blown||p.x<u.x-PW+10||p.x>u.x+210)continue;melt(p);if(v.kills>=v.max)break;}
 G.shots=G.shots.filter(s=>!(s.x>u.x&&s.x<u.x+220&&Math.abs(s.y-u.y)<60&&(burst(s.x,s.y,6),true)));
 if(v.t>3){G.vom=null;word('...much better.',u.x+40,u.y-30,'#7a2a8a',16);}}

/* ---------- moving + shooting obstacles ---------- */
const _spawn=spawn;spawn=function(){_spawn();const p=G.pipes[G.pipes.length-1],n=p.id;p.gy0=p.gy;p.gap0=p.gap;p.ph=rnd(0,TAU);
 if(G.lo||G.fan){p.gap=Math.max(p.gap,220);if(p.gem&&p.gem.kind!=='star'&&p.gem.kind!=='gem')p.gem=null;return;}
 if(TEST==='moving'&&!G.forceMv)G.forceMv=['slide','cannon','jaw','pin','cloud','arm'][n%6];
 const fm=G.forceMv;let kind=null;
 if(fm){kind=fm;G.forceMv=null;}else if(n>=8){const pool=n<14?['slide','jaw']:n<18?['slide','jaw','pin','arm']:['slide','jaw','pin','arm','cannon','cloud'];if(Math.random()<(n<14?0.35:0.55))kind=pick(pool);}
 if(kind){p.mv=kind;p.gy0=p.gy=clamp(p.gy,140+p.gap/2,GY-130-p.gap/2);
  if(kind==='slide'){p.amp=Math.min(45,(p.gy-110-p.gap/2)*0.8,(GY-110-p.gap/2-p.gy)*0.8);p.amp=Math.max(18,p.amp);}
  if(kind==='jaw'){p.gap0=p.gap=Math.max(p.gap,190);}
  if(kind==='pin'||kind==='arm'){p.gap=p.gap0=p.gap+36;p.side=Math.random()<0.5?-1:1;}
  if(kind==='cannon'){p.type='cupcake';p.cd=rnd(0.4,1);p.gap=p.gap0=p.gap+10;}
  if(kind==='cloud'){p.cd=0.3;p.gap=p.gap0=p.gap+14;}
  if(p.gem&&p.gem.kind!=='taco'&&p.gem.kind!=='nuke')p.gem.off=p.gem.y-p.gy;}
 if(p.gem&&p.gem.kind!=='nuke'&&n>=6&&!G.vom&&(G.forceTaco||Math.random()<0.07)){G.forceTaco=false;p.gem={x:p.x+PW/2,y:p.gy,got:false,kind:'taco',ph:0};}
 else if(G.forceTaco&&n>=1){G.forceTaco=false;p.gem={x:p.x+PW/2,y:p.gy,got:false,kind:'taco',ph:0};}};
function mvTick(p,dt){if(!p.mv||p.dead)return;const u=G.uni;p.ph+=dt;
 if(p.mv==='slide'){p.gy=p.gy0+Math.sin(p.ph*1.6)*p.amp;}
 else if(p.mv==='jaw'){p.gap=p.gap0-28+Math.sin(p.ph*2.2)*28;}
 else if(p.mv==='cannon'){if(p.x<W-PW&&p.x>u.x+70){p.cd-=dt;if(p.cd<=0){p.cd=1.7;const bx=p.x+PW/2,by=p.gy+p.gap/2-6;G.shots.push({k:'spr',x:bx,y:by,vx:-150,vy:-210,g:240,r:6,col:pick(RB)});S.pop();burst(bx,by,6);}}}
 else if(p.mv==='cloud'){if(p.x<W-20&&p.x>u.x-20){p.cd-=dt;if(p.cd<=0){p.cd=0.95;G.shots.push({k:'gum',x:p.x+PW/2+rnd(-8,8),y:p.gy-p.gap/2+8,vx:0,vy:120,g:120,r:7,col:pick(RB)});}}}
 if(p.gem&&p.gem.off!=null&&!p.gem.got)p.gem.y=p.gy+p.gem.off;}
function hz(p){if(p.mv==='pin'){const y=p.side<0?p.gy-p.gap/2:p.gy+p.gap/2;return {x:p.x+PW/2,y,r:30};}
 if(p.mv==='arm'){const y=p.side<0?p.gy-p.gap/2-6:p.gy+p.gap/2+6,a=p.ph*1.5;return {x:p.x+PW/2,y,a,L:52};}return null;}
function segD(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,k=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(px-ax-dx*k,py-ay-dy*k);}
const _hit=hitPipe;hitPipe=function(p,u){if(p.dead||p.blown)return false;if(_hit(p,u))return true;const h=hz(p);if(!h)return false;
 if(p.mv==='pin')return Math.hypot(u.x-h.x,u.y-h.y)<h.r*0.62+R-2;
 if(p.mv==='arm'){for(const s of [0,Math.PI]){const a=h.a+s;if(segD(u.x,u.y,h.x,h.y,h.x+Math.cos(a)*h.L,h.y+Math.sin(a)*h.L)<R+3)return true;}}return false;};
const _dp=drawPipe;drawPipe=function(p){if(p.dead)return;
 if(p.blown){cx.save();cx.translate(p.x+PW/2,p.gy);cx.rotate(p.br);cx.translate(-p.x-PW/2,-p.gy);_dp(p);cx.restore();return;}
 if(p.mv==='cloud'){_dp(p);const x=p.x+PW/2,y=p.gy-p.gap/2-34;cx.save();cx.fillStyle='#8a8fb0';cx.beginPath();cx.arc(x-20,y,16,0,TAU);cx.arc(x,y-8,20,0,TAU);cx.arc(x+20,y,16,0,TAU);cx.fill();
   cx.strokeStyle='#3a1640';cx.lineWidth=2;cx.beginPath();cx.moveTo(x-12,y-10);cx.lineTo(x-4,y-6);cx.moveTo(x+12,y-10);cx.lineTo(x+4,y-6);cx.stroke();cx.fillStyle='#3a1640';cx.beginPath();cx.arc(x-7,y-3,2.5,0,TAU);cx.arc(x+7,y-3,2.5,0,TAU);cx.fill();
   cx.beginPath();cx.arc(x,y+8,5,Math.PI*1.15,Math.PI*1.85);cx.stroke();if(p.cd<0.3){txt('hmph',x+26,y-20,10,'#fff','#4a1458',3);}cx.restore();}
 else _dp(p);
 shimmerPipe(p);
 if(p.mv==='pin'){const h=hz(p);cx.save();cx.translate(h.x,h.y);cx.rotate(G.t*5);for(let i=0;i<4;i++){cx.rotate(TAU/4);cx.fillStyle=RB[i*2%7];cx.beginPath();cx.moveTo(0,0);cx.lineTo(h.r,-6);cx.quadraticCurveTo(h.r*0.7,8,0,0);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke();}
  cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,6,0,TAU);cx.fill();cx.restore();}
 if(p.mv==='arm'){const h=hz(p);cx.save();cx.lineCap='round';for(const s of [0,Math.PI]){const a=h.a+s,ex=h.x+Math.cos(a)*h.L,ey=h.y+Math.sin(a)*h.L;cx.strokeStyle='#fff';cx.lineWidth=7;cx.beginPath();cx.moveTo(h.x,h.y);cx.lineTo(ex,ey);cx.stroke();
   cx.fillStyle=RB[(s?3:0)];cx.beginPath();cx.arc(ex,ey,9,0,TAU);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke();}cx.fillStyle='#ff4fd8';cx.beginPath();cx.arc(h.x,h.y,7,0,TAU);cx.fill();cx.restore();}
 if(p.mv==='cannon'){const x=p.x+PW/2,y=p.gy+p.gap/2;const tel=p.cd<0.6&&p.x<W-PW&&p.x>G.uni.x+70;cx.save();cx.translate(x,y-4);cx.rotate(-0.6+(tel?Math.sin(G.t*50)*0.08:0));cx.fillStyle=tel?'#ff2d55':'#7a5cff';rr(-8,-26,16,26,5);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke();cx.restore();
  if(tel)txt('!',x+16,y-30,18,'#ffe600','#4a1458',4);}
 if(p.mv==='slide'||p.mv==='jaw'){const x=p.x+PW+6;cx.fillStyle='rgba(255,255,255,.7)';const y=p.gy;cx.beginPath();cx.moveTo(x,y-8);cx.lineTo(x+5,y-14);cx.lineTo(x+10,y-8);cx.moveTo(x,y+8);cx.lineTo(x+5,y+14);cx.lineTo(x+10,y+8);cx.fill();}};
function shotsTick(dt){const u=G.uni;for(const s of G.shots){s.x+=(s.vx-G.speed)*dt;s.vy+=s.g*dt;s.y+=s.vy*dt;
  if(G.state==='play'&&G.inv<=0&&!G.ev&&Math.hypot(s.x-u.x,s.y-u.y)<s.r+R-3){s.hit=1;die();}}
 G.shots=G.shots.filter(s=>!s.hit&&s.x>-30&&s.y<GY+10&&s.y>-60);}
function drawShots(){for(const s of G.shots){cx.save();cx.translate(s.x,s.y);if(s.k==='spr'){cx.rotate(Math.atan2(s.vy,s.vx-G.speed));cx.fillStyle=s.col;rr(-9,-3.5,18,7,3.5);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=1.5;cx.stroke();}
 else{cx.fillStyle=s.col;cx.beginPath();cx.moveTo(-7,6);cx.quadraticCurveTo(-7,-8,0,-9);cx.quadraticCurveTo(7,-8,7,6);cx.closePath();cx.fill();cx.fillStyle='rgba(255,255,255,.6)';cx.fillRect(-3,-5,2,4);}cx.restore();}}

/* ---------- lights-out raccoon gag ---------- */
function canBig(){return !G.ev&&!G.tilt&&!G.lo&&!G.fan&&!G.vom&&Math.abs(G.tiltA||0)<0.01;}
function startLO(){const u=G.uni;const nxt=G.pipes.find(p=>!p.passed&&p.x>u.x+40);if(!nxt||nxt.x>W-PW-10)return false;
 for(const p of G.pipes)if(!p.passed){p.gap=p.gap0=Math.max(p.gap,220);p.mv=null;}G.shots=[];G.lo={t:0};G.lastEv=G.n;S.click&&0;word('psst...',W-70,H*0.3,'#fff',20);return true;}
function loTick(dt){const L=G.lo;if(!L)return;L.t+=dt;
 if(L.t>=1.5&&!L.off){L.off=1;S.click();sting('scratch');A.mode='tiptoe';word('*click*',W-60,H*0.35,'#fff',22);}
 if(L.t>=3.5&&!L.on){L.on=1;S.click();A.mode='main';sting('boing');word('OOPSIES!',W-90,H*0.3,'#ffe600',30);if(!G.rf)G.flash=Math.max(G.flash,0.9);else G.flash=Math.max(G.flash,0.2);}
 if(L.t>4.4){G.lo=null;}}
function loDark(){const L=G.lo;if(!L)return 0;if(L.t<1.5)return 0;if(L.t<1.6)return (L.t-1.5)/0.1;if(L.t<3.5)return 1;return 0;}
function drawRaccoon(x,y,arm,flip){cx.save();cx.translate(x,y);if(flip)cx.scale(-1,1);const b=Math.sin(G.t*12)*2;
 cx.fillStyle='#8a8f99';cx.beginPath();cx.ellipse(0,b,18,22,0,0,TAU);cx.fill();cx.fillStyle='#d0d4da';cx.beginPath();cx.ellipse(0,6+b,10,13,0,0,TAU);cx.fill();
 for(let i=0;i<4;i++){cx.fillStyle=i%2?'#333':'#8a8f99';cx.beginPath();cx.ellipse(20+i*7,12-i*5,6,5,-0.6,0,TAU);cx.fill();}
 cx.fillStyle='#8a8f99';cx.beginPath();cx.arc(0,-26+b,15,0,TAU);cx.fill();cx.beginPath();cx.moveTo(-14,-34+b);cx.lineTo(-10,-46+b);cx.lineTo(-4,-38+b);cx.moveTo(14,-34+b);cx.lineTo(10,-46+b);cx.lineTo(4,-38+b);cx.fill();
 cx.fillStyle='#222';cx.beginPath();cx.ellipse(0,-27+b,15,6,0,0,TAU);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(-6,-27+b,3.5,0,TAU);cx.arc(6,-27+b,3.5,0,TAU);cx.fill();cx.fillStyle='#000';cx.beginPath();cx.arc(-7,-27+b,1.8,0,TAU);cx.arc(5,-27+b,1.8,0,TAU);cx.fill();
 cx.fillStyle='#222';cx.beginPath();cx.arc(-12,-20+b,2.5,0,TAU);cx.fill();cx.strokeStyle='#8a8f99';cx.lineWidth=6;cx.lineCap='round';cx.beginPath();cx.moveTo(-10,-6);cx.lineTo(-10-arm*24,-14-arm*20);cx.stroke();
 cx.strokeStyle='#555';cx.lineWidth=5;for(const s of [-8,8]){cx.beginPath();cx.moveTo(s,18);cx.lineTo(s+Math.sin(G.t*10+s)*4,30);cx.stroke();}cx.restore();}
function drawSwitch(x,y,on){cx.save();cx.fillStyle='#fff';rr(x-22,y-36,44,72,8);cx.fill();cx.strokeStyle='#4a1458';cx.lineWidth=3;cx.stroke();cx.fillStyle='#ccc';rr(x-9,y-22,18,44,5);cx.fill();
 cx.fillStyle='#ff4fd8';rr(x-8,on?y-21:y+1,16,20,4);cx.fill();txt(on?'ON':'OFF',x,y+46,11,'#fff','#4a1458',3);cx.restore();}
function drawLO(){const L=G.lo;if(!L)return;const d=loDark(),u=G.uni,sx=W-34,sy=H*0.42;
 if(d>0){cx.fillStyle=`rgba(4,0,20,${0.94*d})`;cx.fillRect(0,0,W,H);
  cx.save();cx.globalAlpha=0.28*d;cx.strokeStyle='#b8a0ff';cx.lineWidth=2;for(const p of G.pipes){if(p.dead)continue;const top=p.gy-p.gap/2,bot=p.gy+p.gap/2;cx.strokeRect(p.x+4,-4,PW-8,top+4);cx.strokeRect(p.x+4,bot,PW-8,GY-bot);}cx.restore();
  const c=Math.cos(u.rot),s=Math.sin(u.rot),P=(lx,ly)=>[u.x+(lx*c-ly*s)*1.35,u.y+(lx*s+ly*c)*1.35];const [hx,hy]=P(25,-40),[ex,ey]=P(21,-18);
  cx.save();const g=cx.createRadialGradient(hx,hy,0,hx,hy,46);g.addColorStop(0,'rgba(255,240,150,.9)');g.addColorStop(1,'rgba(255,240,150,0)');cx.fillStyle=g;cx.beginPath();cx.arc(hx,hy,46,0,TAU);cx.fill();
  cx.fillStyle='#fff6a0';starPath(hx,hy,8,2.5,4,G.t*2);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(ex,ey,4,0,TAU);cx.arc(ex+9,ey-1,2.5,0,TAU);cx.fill();cx.restore();
  // raccoon eyes in the dark
  cx.fillStyle='#fff';cx.beginPath();cx.arc(sx-34,sy-6,3,0,TAU);cx.arc(sx-24,sy-6,3,0,TAU);cx.fill();}
 else{const k=L.t<1.5?clamp(L.t/1.2,0,1):L.t>3.5?clamp(1-(L.t-3.7)/0.7,0,1):1;const rx=W+40-(70)*k;
  drawSwitch(sx,sy,L.t<1.5||L.t>3.5);drawRaccoon(rx-20,sy+30,L.t>1.1&&L.t<1.5||L.t>3.4&&L.t<3.7?1:0.3,false);
  if(L.t<1.5&&L.t>0.3)txt('shhh...',rx-40,sy-40,14,'#fff','#4a1458',4);}}

/* ---------- giant fan event ---------- */
const JUNK=['duck','toaster','taco','piano','cow','sock','donut','chair'];
function startFan(){G.fan={t:0,end:rnd(12,14)+2.6,next:0};G.lastEv=G.n;A.mode='fan';sting('honk');S.wind(2);word("I'M YOUR BIGGEST FAN!",W/2,H*0.2,'#fff',24);}
function fanTick(dt){const F=G.fan;if(!F)return;F.t+=dt;const u=G.uni;
 if(F.t>1.4&&!F.blown){F.blown=1;S.wind(1.6);G.shake=Math.max(G.shake,G.rm?4:14);word('WHOOOOSH!',W/2,H*0.3,'#1fb6ff',40);G.shots=[];
  for(const p of G.pipes){p.blown={vx:-rnd(700,1000),vy:rnd(-250,250)};p.br=0;p.vr=rnd(-6,6);if(p.gem)p.gem.got=true;}}
 if(F.blown)for(const p of G.pipes)if(p.blown){p.x+=p.blown.vx*dt;p.gy+=p.blown.vy*dt;p.br+=p.vr*dt;}
 if(F.t>1.4&&F.t<2.6){G.inv=Math.max(G.inv,0.3);u.x+=(W*0.14-u.x)*Math.min(1,dt*4);}else u.x+=(W*0.3-u.x)*Math.min(1,dt*1.5);
 G.spawnX=Math.max(G.spawnX,W+400);
 if(F.t>2.6&&F.t<F.end-0.6){F.next-=dt;if(F.next<=0){F.next=rnd(0.55,0.95);const k=pick(JUNK),big=k==='piano'||k==='cow';
   const j={k,x:W+40,y:rnd(80,GY-60),vx:-rnd(150,300)*(big?0.75:1),vy:0,g:0,r:big?24:15,rot:0,vr:rnd(-3,3),ph:rnd(0,TAU),arc:pick(['line','sine','toss'])};
   if(j.arc==='toss'){j.y=rnd(GY-120,GY-40);j.vy=-rnd(300,420);j.g=260;}if(j.arc==='line')j.vy=(u.y-j.y)*0.12;G.junk.push(j);}}
 if(F.t>F.end&&!F.broke){F.broke=1;sting('scratch');word('FAN BROKE LOL',W/2,H*0.3,'#ffe600',34);word('(warranty void)',W/2,H*0.38,'#fff',18);}
 if(F.t>F.end+1.4){G.fan=null;A.mode='main';G.spawnX=W+120;}}
function junkTick(dt){const u=G.uni;for(const j of G.junk){j.x+=j.vx*dt;j.vy+=j.g*dt;j.y+=j.vy*dt;if(j.arc==='sine')j.y+=Math.sin(G.t*3+j.ph)*60*dt;j.rot+=j.vr*dt;
  if(!j.passed&&j.x<u.x-20){j.passed=1;G.dodged++;addScore(1);if(Math.random()<0.3)word(pick(['DODGED!','NOPE!','YEET!','NEIGH-BOMB!']),u.x+40,u.y-30);}
  if(G.state==='play'&&G.inv<=0&&!G.ev&&Math.hypot(j.x-u.x,j.y-u.y)<j.r*0.8+R-2){j.hit=1;die();}}
 G.junk=G.junk.filter(j=>!j.hit&&j.x>-80&&j.y<H+60);}
function drawJunk(j){cx.save();cx.translate(j.x,j.y);cx.rotate(j.rot);const k=j.k;
 if(k==='duck'){cx.scale(1.6,1.6);duck(0,0);}
 else if(k==='toaster'){cx.fillStyle='#c0c8d0';rr(-18,-12,36,26,6);cx.fill();cx.strokeStyle='#4a5560';cx.lineWidth=2;cx.stroke();cx.fillStyle='#d9a066';cx.fillRect(-12,-20,9,10);cx.fillRect(3,-20,9,10);face(0,4,12,'o');}
 else if(k==='taco'){cx.fillStyle='#2ee66b';cx.beginPath();cx.arc(0,-4,14,Math.PI,TAU);cx.fill();cx.fillStyle='#ffcc4d';cx.beginPath();cx.arc(0,-2,16,0,Math.PI);cx.closePath();cx.fill();face(0,6,10,'');}
 else if(k==='piano'){cx.fillStyle='#111';rr(-28,-16,56,30,6);cx.fill();cx.fillStyle='#fff';cx.fillRect(-26,8,52,8);cx.fillStyle='#111';for(let i=0;i<7;i++)cx.fillRect(-24+i*7.5,8,3,5);cx.fillRect(-24,14,4,14);cx.fillRect(20,14,4,14);face(0,-4,14,'o');}
 else if(k==='cow'){cx.fillStyle='#fff';cx.beginPath();cx.ellipse(0,0,26,16,0,0,TAU);cx.fill();cx.fillStyle='#222';cx.beginPath();cx.arc(-8,-4,6,0,TAU);cx.arc(10,5,5,0,TAU);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(-26,-8,11,0,TAU);cx.fill();
  cx.fillStyle='#ffb3c6';cx.beginPath();cx.ellipse(-31,-4,7,5,0,0,TAU);cx.fill();cx.fillStyle='#222';cx.fillRect(-20,12,4,10);cx.fillRect(14,12,4,10);cx.beginPath();cx.arc(-26,-11,2,0,TAU);cx.fill();txt('moo?',0,-24,11,'#fff','#4a1458',3);}
 else if(k==='sock'){cx.fillStyle='#ff4fd8';cx.beginPath();cx.moveTo(-6,-18);cx.lineTo(8,-18);cx.lineTo(8,6);cx.quadraticCurveTo(20,8,16,16);cx.lineTo(-4,16);cx.closePath();cx.fill();cx.fillStyle='#fff';cx.fillRect(-6,-18,14,5);cx.fillRect(-6,-6,14,3);}
 else if(k==='donut'){cx.fillStyle='#d9a066';cx.beginPath();cx.arc(0,0,16,0,TAU);cx.fill();cx.fillStyle='#ff9ad5';cx.beginPath();cx.arc(0,-1,13,0,TAU);cx.fill();cx.globalCompositeOperation='destination-out';cx.beginPath();cx.arc(0,0,5,0,TAU);cx.fill();cx.globalCompositeOperation='source-over';
  for(let i=0;i<6;i++){cx.fillStyle=RB[i];cx.fillRect(Math.cos(i)*9,Math.sin(i*2)*8,4,2);}}
 else{cx.fillStyle='#ff8a00';cx.fillRect(-14,-4,28,6);cx.fillRect(-14,-24,6,22);cx.fillRect(-14,2,4,14);cx.fillRect(10,2,4,14);}
 cx.restore();}
function drawFan(){const F=G.fan;if(!F)return;const k=F.t<1.2?sm(F.t/1.2):F.t>F.end+0.4?1-sm((F.t-F.end-0.4)/1):1;const x=W+70-110*k,y=GY-120,sp=F.broke?Math.max(0,8-(F.t-F.end)*8):14;
 cx.save();cx.globalAlpha=0.95;cx.fillStyle='#7a5cff';rr(x-10,y,20,120,6);cx.fill();cx.fillStyle='#4a1458';rr(x-40,GY-12,80,14,6);cx.fill();
 cx.translate(x,y);cx.strokeStyle='#fff';cx.lineWidth=4;cx.beginPath();cx.arc(0,0,74,0,TAU);cx.stroke();cx.rotate(G.t*sp*(F.broke?0.3:1));
 for(let i=0;i<4;i++){cx.rotate(TAU/4);cx.fillStyle=RB[i*2%7];cx.beginPath();cx.ellipse(36,0,34,16,0.2,0,TAU);cx.fill();}cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,12,0,TAU);cx.fill();cx.rotate(-G.t*sp*(F.broke?0.3:1));face(0,0,12,F.broke?'o':'');
 cx.restore();if(F.broke&&Math.sin(G.t*20)>0){cx.fillStyle='rgba(120,120,120,.6)';cx.beginPath();cx.arc(x+rnd(-10,10),y-80-((G.t*60)%40),12,0,TAU);cx.fill();}
 if(F.t>1.2&&F.t<F.end&&!G.rm){cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=2;for(let i=0;i<8;i++){const yy=60+((i*71)%(GY-80)),xx=W-((G.t*900+i*137)%(W+100));cx.beginPath();cx.moveTo(xx,yy);cx.lineTo(xx+40,yy);cx.stroke();}}}

/* ---------- shimmer restyle ---------- */
const TW=[];for(let i=0;i<40;i++)TW.push({x:Math.random(),y:Math.random()*0.75,s:rnd(1.5,3.5),ph:rnd(0,TAU),sp:rnd(1,3)});
function shineSweep(x,y,w,h){if(G.rf)return;const k=((G.t*0.35)%1.6)-0.3;cx.save();cx.beginPath();cx.rect(x,y,w,h);cx.clip();const gx=x+k*w;const g=cx.createLinearGradient(gx-30,0,gx+30,0);
 g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.globalCompositeOperation='lighter';cx.fillRect(x,y,w,h);cx.restore();}
function shimmerPipe(p){if(p.dead||p.blown)return;const top=p.gy-p.gap/2,bot=p.gy+p.gap/2,x=p.x;cx.save();cx.beginPath();cx.rect(x,-10,PW,top+10);cx.rect(x,bot,PW,GY-bot);cx.clip();
 // glossy edge + iridescent sheen + sweeping glint
 let g=cx.createLinearGradient(x,0,x+PW,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.18,'rgba(255,255,255,.5)');g.addColorStop(0.3,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.fillRect(x,-10,PW,GY+10);
 const hu=(G.t*60+p.id*40)%360;cx.globalAlpha=G.rf?0.08:0.16;g=cx.createLinearGradient(x,0,x+PW,GY);g.addColorStop(0,`hsl(${hu},100%,70%)`);g.addColorStop(0.5,`hsl(${(hu+120)%360},100%,70%)`);g.addColorStop(1,`hsl(${(hu+240)%360},100%,70%)`);cx.fillStyle=g;cx.fillRect(x,-10,PW,GY+10);cx.globalAlpha=1;
 if(!G.rf){const gy=((G.t*260+p.id*170)%(GY+200))-100;g=cx.createLinearGradient(0,gy-40,0,gy+40);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.fillRect(x,gy-40,PW,80);}
 const n=G.rf?2:5;for(let i=0;i<n;i++){const tw=Math.sin(G.t*5+i*2.1+p.id)*0.5+0.5;if(tw<0.6)continue;const yy=((i*137+p.id*53)%(GY-40))+20;if(yy>top&&yy<bot)continue;cx.globalAlpha=(tw-0.6)*2.5*(G.rf?0.5:1);cx.fillStyle='#fff';starPath(x+12+((i*29)%(PW-24)),yy,5,1.2,4,0);cx.fill();}
 cx.restore();cx.globalAlpha=1;}
const _sky=drawSky;drawSky=function(){_sky();const a=G.rf?0.35:0.85;for(const s of TW){const tw=(Math.sin(G.t*s.sp+s.ph)+1)/2;cx.globalAlpha=a*tw;cx.fillStyle='#fff';starPath(s.x*W,s.y*GY,s.s*(0.6+tw),s.s*0.25,4,0);cx.fill();}cx.globalAlpha=1;};
const _du=drawUnicorn;drawUnicorn=function(u){if(G.skinDraw){_du(u);return;}cx.save();if(!G.lo){cx.shadowColor=G.rf?'rgba(255,200,255,.5)':`hsla(${(G.t*90)%360},100%,75%,.9)`;cx.shadowBlur=G.rf?6:14;}_du(u);cx.restore();
 if(!G.rf&&Math.sin(G.t*3)>0.8){cx.fillStyle='#fff';starPath(u.x+rnd(-14,20),u.y+rnd(-30,6),5,1.2,4,G.t);cx.fill();}};
const _dpa=drawParts;drawParts=function(){drawShots();for(const j of G.junk)drawJunk(j);drawFan();
 if(G.vom){const u=G.uni,a=G.rf?0.5:0.9;cx.save();cx.globalAlpha=a;for(let b=0;b<7;b++){cx.strokeStyle=G.rf?RB[b]:`hsl(${(b*50+G.t*900)%360},100%,60%)`;cx.lineWidth=7;cx.lineCap='round';cx.beginPath();
   for(let i=0;i<14;i++){const xx=u.x+36+i*15,yy=u.y-14+(b-3)*(3+i*0.7)+Math.sin(G.t*30-i*0.8+b)*(2+i*0.3);cx.lineTo(xx,yy);}cx.stroke();}cx.restore();}
 for(const p of G.parts)if(p.k==='vom'){p.k='spark';}
 _dpa();};
const _de=drawEvent;drawEvent=function(){for(const s of G.splat){cx.globalAlpha=clamp(s.life,0,1)*(G.rf?0.3:0.6);cx.fillStyle=s.col;cx.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,r=s.r*(i%2?0.65:1.05);cx.lineTo(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r);}cx.fill();
  cx.beginPath();cx.arc(s.x+s.r*0.3,s.y+s.r*1.2,s.r*0.2,0,TAU);cx.fill();}cx.globalAlpha=1;drawLO();_de();};

/* ---------- main update hook ---------- */
const _up=update;update=function(dt){_up(dt);const d=dt*G.ts;
 if(G.state==='play'){testTick(dt);speedTick(d);const dm=d*spdMul();for(const p of G.pipes)mvTick(p,dm);shotsTick(d);junkTick(d);vomTick(d);loTick(d);fanTick(d);
  if(canBig()){if(G.forceLO||(G.score>=12&&G.n-G.lastEv>=8&&Math.random()<d*0.04)){if(startLO())G.forceLO=false;}
   else if(G.forceFan||(G.score>=18&&G.n-G.lastEv>=10&&Math.random()<d*0.03)){G.forceFan=false;startFan();}}}
 else{shotsTick(d);for(const j of G.junk){j.x+=j.vx*d*0.2;}}
 for(const s of G.splat)s.life-=dt;G.splat=G.splat.filter(s=>s.life>0);};
// v0.3 more puns
YAY.push('SLAY!','NEIGH-BOMB!','HORN-TASTIC!','UNI-BELIEVABLE!','YAAAS!','HAY GIRL HAY!','MANE CHARACTER!');
// don't let fart/tilt start during lights-out or fan
const _sF=startFart;startFart=function(){if(G.lo||G.fan||G.vom){G.forceFart=false;return;}_sF();};
const _sT=startTilt;startTilt=function(k){if(G.lo||G.fan)return;_sT(k);};

/* ---------- URL test flags: ?test=fan|lights|taco|nuke|tilt|flip|fart|moving ---------- */
const TEST=(()=>{try{const t=(new URLSearchParams(location.search).get('test')||'').toLowerCase();return ['fan','lights','taco','nuke','tilt','flip','fart','moving','speed','missions','disco','tiny','gravity','gold','chaos','worlds'].includes(t)?t:'';}catch(e){return '';}})();G.test=TEST;
function speedTick(d){G.runT=(G.runT||0)+d;const M=spdMul(),ms=[[1,'SPEED MODE: ACTIVATED \u{1F984}\u{1F4A8}','#ff2d55'],[1.25,'+25%! HOLD YOUR HORN!','#ff8a00'],[1.5,'+50%! MANE-IAC MODE!','#ffe600'],[2,'LUDICROUS SPEED! \u{1F680}','#ff4fd8']];
 const i=G.spdMs||0;if(i<ms.length&&G.runT>=300&&M>=ms[i][0]){word(ms[i][1],W/2,H*0.26,ms[i][2],i===3?32:24);if(i===0||i===3)G.flash=Math.max(G.flash,G.rf?0.1:0.4);G.spdMs=i+1;}}
function testTick(dt){if(!TEST||['moving','speed','missions','disco','tiny','gravity','gold','chaos','worlds'].includes(TEST))return;G.testT=(G.testT||0)+dt;if(G.testT<(G.testNext||3))return;
 G.testNext=G.testT+({fan:40,lights:30,taco:15,nuke:15}[TEST]||20);
 if(TEST==='fan')G.forceFan=true;else if(TEST==='lights')G.forceLO=true;else if(TEST==='taco')G.forceTaco=true;else if(TEST==='nuke')G.forceNuke=true;
 else if(TEST==='tilt')G.forceTilt='diag';else if(TEST==='flip')G.forceTilt='up';else if(TEST==='fart')G.forceFart=true;}
const _hudT=drawHUD;drawHUD=function(){_hudT();if(G.state==='play'&&(G.runT||0)>=300&&!(G.toasts&&G.toasts.length)){const pc=Math.round((spdMul()-1)*100);cx.save();cx.font='bold 13px sans-serif';const lab='\u{1F4A8} SPEED +'+pc+'%';const w=cx.measureText(lab).width+16;cx.fillStyle='rgba(74,20,88,0.7)';rr(W-w-8,H-48,w,22,11);cx.fill();cx.fillStyle=pc>=100?'#ff4fd8':'#fff';cx.textAlign='left';cx.textBaseline='middle';cx.fillText(lab,W-w,H-37);cx.restore();}if(!TEST||((G.state==='play'||G.state==='dying')&&G.toasts&&G.toasts.length))return;cx.save();// v1.1: tag sits above the © line; on game over the note shares the pill (no overlap)
 const lab='TEST MODE: '+TEST.toUpperCase()+(G.state==='over'?'  (no leaderboard, half coins)':'');cx.font='bold '+(G.state==='over'?10:11)+'px sans-serif';const w=Math.min(W-12,cx.measureText(lab).width+14);const x0=G.state==='over'?(W-w)/2:6,yc=G.state==='play'||G.state==='dying'?H-15:H-42;
 cx.fillStyle='rgba(255,45,85,0.85)';rr(x0,yc-9,w,18,9);cx.fill();cx.fillStyle='#fff';cx.textAlign='left';cx.textBaseline='middle';cx.fillText(lab,x0+7,yc,w-14);cx.restore();};
G.dbg={W:()=>W,tf:a=>tiltFrame(a),hit:(p,u)=>hitPipe(p,u),mv:(p,dt)=>mvTick(p,dt),hz:p=>hz(p)};
reset();

/* ================= v1.1: METALLIC GLITTER + MISSIONS ================= */
// --- glow sprites (pre-rendered, cheap drawImage instead of shadowBlur) ---
const GCOL=['#ffffff','#ffd700','#ff9ae6','#9ff3ff','#c9a8ff','#fff3a0'];const GSPR=GCOL.map(c=>{const [cv2,g]=mk(32,32);const rg=g.createRadialGradient(16,16,0,16,16,16);rg.addColorStop(0,c);rg.addColorStop(0.25,c+'aa');rg.addColorStop(1,c+'00');g.fillStyle=rg;g.fillRect(0,0,32,32);
 g.fillStyle='#fff';g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,q=i%2?2:15;g.lineTo(16+Math.cos(a)*q,16+Math.sin(a)*q);}g.closePath();g.fill();return cv2;});
const UGLOW=(()=>{const [c,g]=mk(120,120);const rg=g.createRadialGradient(60,60,0,60,60,60);rg.addColorStop(0,'rgba(255,240,255,.55)');rg.addColorStop(0.4,'rgba(255,150,240,.22)');rg.addColorStop(1,'rgba(160,120,255,0)');g.fillStyle=rg;g.fillRect(0,0,120,120);return c;})();
// --- pooled glitter particles (ring buffer = hard cap) ---
const GN=180,GP=[];for(let i=0;i<GN;i++)GP.push({on:0,x:0,y:0,vx:0,vy:0,life:0,max:1,s:6,c:0,ph:0});let gpI=0;
function glit(x,y,vx,vy,life,s,c){const o=GP[gpI];gpI=(gpI+1)%GN;o.on=1;o.x=x;o.y=y;o.vx=vx;o.vy=vy;o.life=o.max=life;o.s=s;o.c=c==null?(Math.random()*GCOL.length)|0:c;o.ph=Math.random()*TAU;}
function glitBurst(x,y,n,sp){if(G.rf)n=Math.ceil(n*0.4);for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(40,sp||260);glit(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(0.5,1.1),rnd(5,10));}}
function glitTick(dt){const scr=G.state==='play'?G.speed*0.5:0;for(const o of GP){if(!o.on)continue;o.life-=dt;if(o.life<=0){o.on=0;continue;}o.vx*=0.96;o.vy=o.vy*0.96+40*dt;o.x+=(o.vx-scr)*dt;o.y+=o.vy*dt;}}
function drawGlit(){cx.save();cx.globalCompositeOperation='lighter';for(const o of GP){if(!o.on)continue;const k=o.life/o.max,tw=G.rf?1:0.55+0.45*Math.sin(G.t*22+o.ph);cx.globalAlpha=Math.min(1,k*1.6)*tw;const s=o.s*(G.rf?1:0.8+0.4*tw);cx.drawImage(GSPR[o.c],o.x-s,o.y-s,s*2,s*2);}cx.restore();cx.globalAlpha=1;}
// --- chrome / holographic gates with moving specular sweep ---
let CHR=null,HOLO=null;function chromeGrads(){CHR=cx.createLinearGradient(0,0,PW,0);[[0,'rgba(30,10,60,.35)'],[0.07,'rgba(255,255,255,.1)'],[0.2,'rgba(255,255,255,.7)'],[0.3,'rgba(255,255,255,.05)'],[0.62,'rgba(60,20,110,.22)'],[0.82,'rgba(255,255,255,.45)'],[0.9,'rgba(255,255,255,.05)'],[1,'rgba(30,10,60,.4)']].forEach(s=>CHR.addColorStop(s[0],s[1]));
 HOLO=cx.createLinearGradient(0,0,PW*0.6,GY*2);for(let i=0;i<=12;i++)HOLO.addColorStop(i/12,`hsl(${(i*60)%360},100%,72%)`);}
function chromePipe(p){if(p.dead||p.blown)return;if(!CHR)chromeGrads();const top=p.gy-p.gap/2,bot=p.gy+p.gap/2,x=p.x;cx.save();cx.beginPath();cx.rect(x,-10,PW,top+10);cx.rect(x,bot,PW,GY-bot);cx.clip();cx.translate(x,0);
 cx.fillStyle=CHR;cx.fillRect(0,-10,PW,GY+10);
 cx.save();cx.globalAlpha=G.rf?0.14:0.24;cx.globalCompositeOperation='overlay';const off=G.rf?0:-((G.t*90+p.id*60)%GY);cx.translate(0,off);cx.fillStyle=HOLO;cx.fillRect(0,-off-10,PW,GY+20);cx.restore();
 if(!G.rf){const k=((G.t*0.8+p.id*0.17)%1.4)-0.2,sy=k*GY;cx.globalCompositeOperation='lighter';cx.globalAlpha=0.55;cx.fillStyle='#fff';cx.beginPath();cx.moveTo(0,sy);cx.lineTo(PW,sy-40);cx.lineTo(PW,sy-22);cx.lineTo(0,sy+18);cx.closePath();cx.fill();cx.globalAlpha=0.25;cx.beginPath();cx.moveTo(0,sy+26);cx.lineTo(PW,sy-14);cx.lineTo(PW,sy-6);cx.lineTo(0,sy+34);cx.closePath();cx.fill();}
 cx.restore();cx.globalAlpha=1;
 if(p.type!=='lolli'){cx.save();cx.lineCap='round';cx.globalAlpha=0.9;cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.moveTo(x+4,top);cx.lineTo(x+PW-4,top);cx.moveTo(x+4,bot);cx.lineTo(x+PW-4,bot);cx.stroke();
  const gl=G.rf?0.6:0.7+0.3*Math.sin(G.t*4+p.id);cx.globalAlpha=gl;cx.drawImage(GSPR[1],x+PW*((G.t*0.5+p.id*0.3)%1)-8,top-8,16,16);cx.drawImage(GSPR[3],x+PW*(1-(G.t*0.5+p.id*0.3)%1)-8,bot-8,16,16);cx.restore();}}
const _shp11=shimmerPipe;shimmerPipe=function(p){_shp11(p);chromePipe(p);};
// --- glinting gems + coins ---
function glint(x,y,ph,sz){const k=((G.t*0.9+ph)%1.4);if(G.rf){cx.globalAlpha=0.7;cx.drawImage(GSPR[0],x-sz*0.4,y-sz*0.4,sz*0.8,sz*0.8);cx.globalAlpha=1;return;}if(k>0.35)return;const s=sz*Math.sin(k/0.35*Math.PI);cx.save();cx.globalCompositeOperation='lighter';cx.drawImage(GSPR[0],x-s,y-s,s*2,s*2);cx.restore();}
const _dg11=drawGem;drawGem=function(g){_dg11(g);if(g.got||g.kind==='nuke'||g.kind==='taco')return;glint(g.x+9,g.y+Math.sin(G.t*4+g.ph)*4-11,g.ph,14);};
const _ci11=coinIcon;coinIcon=function(x,y,r){_ci11(x,y,r);glint(x+r*0.45,y-r*0.45,x*0.01,r*1.1);};
// --- unicorn: bloom sprite instead of shadowBlur, sparkle trail ---
drawUnicorn=(function(){return function(u){if(G.skinDraw){_du(u);return;}if(!G.lo){cx.save();cx.globalCompositeOperation='lighter';const s=G.rf?1:1+Math.sin(G.t*3)*0.06;cx.globalAlpha=G.rf?0.5:0.8;cx.drawImage(UGLOW,u.x-60*s,u.y-60*s,120*s,120*s);cx.restore();}
 _du(u);if(!G.rf&&Math.sin(G.t*3)>0.8){cx.save();cx.globalCompositeOperation='lighter';cx.drawImage(GSPR[0],u.x+rnd(-14,20)-7,u.y+rnd(-30,6)-7,14,14);cx.restore();}};})();
const _dpa2=drawParts;drawParts=function(){_dpa2();drawGlit();};
// --- missions ---
const MS=[
 {id:'streak',t:'10 gates in a row, no edge bumps',g:10,run:1,c:30},
 {id:'fan',t:'Survive a Giant Fan',g:1,c:40},
 {id:'flip',t:'Pass 25 gates upside-down',g:25,c:50},
 {id:'fart',t:'Fart-boost through 5 gates',g:5,c:40},
 {id:'nopu',t:'Reach 3:00 with no power-up',g:180,run:1,c:60,time:1},
 {id:'gems',t:'Grab 8 shinies in one run',g:8,run:1,c:30},
 {id:'lights',t:'Survive a lights-out raccoon',g:1,c:40},
 {id:'s25',t:'Score 25 in one run',g:25,run:1,c:25},
 {id:'s50',t:'Score 50 in one run',g:50,run:1,c:50},
 {id:'frenzy',t:'2 Rainbow Frenzies in one run',g:2,run:1,c:40},
 {id:'nuke',t:'Survive a Rainbow Nuke',g:1,c:30},
 {id:'tilt',t:'Survive a 45° tilt',g:1,c:25},
 {id:'upside',t:'Survive an upside-down flip',g:1,c:30},
 {id:'puke',t:'Puke-melt 3 obstacles',g:3,c:35},
 {id:'runs',t:'Play 5 runs',g:5,c:20},
 {id:'speed',t:'Reach SPEED MODE (5:00)',g:300,run:1,c:80,time:1},
 {id:'coins',t:'Earn 60 coins in one run',g:60,run:1,c:40},
 {id:'gates',t:'Pass 100 gates (total)',g:100,c:40},
 {id:'dodge',t:'Dodge 10 flying things in a run',g:10,run:1,c:30}];
const MQ=['s25','gates','gems','nopu','runs','streak','speed','s50'];// quick set for ?test=missions
const MKEY=TEST==='missions'?'uf_ms_test':'uf_ms';
const MST=LS.get(MKEY,null)||{act:[],done:0};
function mDef(id){return MS.find(m=>m.id===id);}
function mGoal(m){return TEST==='missions'?(m.time?8:Math.min(m.g,2)):m.g;}
function mPick(){const have=MST.act.map(a=>a.id).concat(MST.last||[]);const pool=MS.filter(m=>!have.includes(m.id)&&(TEST!=='missions'||MQ.includes(m.id)));const m=pick(pool.length?pool:MS);return {id:m.id,p:0};}
function mFill(){MST.act=MST.act.filter(a=>mDef(a.id));while(MST.act.length<3)MST.act.push(mPick());LS.set(MKEY,MST);}
mFill();
function uLevel(){return 1+Math.floor(MST.done/3);}
const TL13=2.2,TV13=2;// v1.2.1: compact bottom toasts, max 2 visible, short life
G.toasts=[];function toast(t,sub,col){G.toasts.push({t,sub,col:col||'#ffd700',life:TL13,max:TL13});}
function mDone(a){const m=mDef(a.id);const pay=TEST?Math.floor(m.c/2):m.c;G.coins+=pay;saveEco();const lv0=uLevel();MST.done++;MST.last=[a.id];
 toast('MISSION COMPLETE! +'+pay,m.t);S.gem&&S.gem();if(G.state==='play'||G.state==='dying')glitBurst(G.uni.x,G.uni.y,40,320);
 MST.act[MST.act.indexOf(a)]=mPick();const lv=uLevel();
 if(lv>lv0){toast('UNICORN LEVEL '+lv+'!','Mission set complete \u2728','#7ffcff');for(const k of SKINS)if(k.ms&&k.ms<=lv&&!G.owned.includes(k.id)){if(TEST){toast('(test) would unlock '+k.n,'',' #ff9ae6'.trim());}else{G.owned.push(k.id);saveEco();toast('NEW SKIN: '+k.n.toUpperCase()+'!','Find it in the shop','#ff9ae6');}}}
 LS.set(MKEY,MST);}
function mSet(id,v){for(const a of MST.act.slice())if(a.id===id){if(v>a.p){a.p=v;if(a.p>=mGoal(mDef(id)))mDone(a);}}}
function mAdd(id,n){for(const a of MST.act.slice())if(a.id===id){a.p+=n;if(a.p>=mGoal(mDef(id)))mDone(a);}}
function mSave(){LS.set(MKEY,MST);}
// mission-only skins (unlocked by Unicorn Level, never buyable)
SKINS.push(
 {id:'chrome',n:'Chrome-corn',p:0,ms:2,d:'Mission reward (Level 2). Polished to a mirror shine.',b:'#e9eef5',l:'#5a6478',m:['#ffffff','#b8c4d6','#7a869a'],h:['#ffffff','#dfe7f2'],tr:['#ffffff','#c9d3e3','#9aa6ba'],fs:['sine',520,2]},
 {id:'holo',n:'Holo-corn',p:0,ms:4,d:'Mission reward (Level 4). Shifts every color at once.',b:'#f0e8ff',l:'#7a5cff',m:['#7ffcff','#ff9ae6','#c9a8ff','#fff6a0'],h:['#7ffcff','#fff'],tr:['#7ffcff','#ff9ae6','#c9a8ff','#fff6a0'],fs:['triangle',640,1.6]},
 {id:'glitter',n:'Glitterbomb-corn',p:0,ms:6,d:'Mission reward (Level 6). Leaves glitter EVERYWHERE.',b:'#ffe9f7',l:'#c2338f',m:['#ffd700','#ff4fd8','#ffffff'],h:['#ffd700','#fff'],tr:['#ffd700','#ff4fd8','#ffffff'],fs:['square',700,1.4]});
SKINS.forEach(k=>{k.hf=k.hf||'#ff4fd8';k.sp=k.sp||'rgba(255,255,255,.35)';k.sn=k.sn||'#ffd0ea';k.h=k.h||['#ffd21f','#fff6a0'];});
goldenOK=function(){return SKINS.every(k=>k.secret||k.ms||G.owned.includes(k.id));};
// run tracking
const _rs11=reset;reset=function(){_rs11();if(typeof MST==='undefined')return;for(const a of MST.act)if(mDef(a.id).run)a.p=0;G.streak=0;G.gotPU=0;G.pv={gems:0,kills:0,ev:null,fan:null,lo:null,tilt:null,inv:0};G.fartT=0;G.toasts=G.toasts||[];};
const _die11=die;die=function(){const was=G.state==='play';_die11();if(!was)return;mAdd('runs',1);mSet('coins',G.runCoins);mSave();};
const _up11=update;update=function(dt){_up11(dt);const d=dt*G.ts,u=G.uni;glitTick(dt);
 for(let i=0;i<Math.min(TV13,G.toasts.length);i++)G.toasts[i].life-=dt;G.toasts=G.toasts.filter(t=>t.life>0);
 if(G.state==='play'||G.state==='title'){const K=skinCol(),rate=(G.rf?12:34)*(K.ms?2:1);G.gAcc=(G.gAcc||0)+rate*dt;while(G.gAcc>=1){G.gAcc--;glit(u.x-16+rnd(-4,4),u.y+rnd(-6,10),rnd(-70,-15),rnd(-30,30),rnd(0.45,0.9),rnd(4,8));}}
 if(G.state!=='play')return;const pv=G.pv||(G.pv={});
 if(u.y<=12.5||u.y+R>=GY-0.5)G.streak=0;
 if(pv.ev&&pv.ev.type==='fart'&&!G.ev)G.fartT=1.2;G.fartT=Math.max(0,(G.fartT||0)-d);
 for(const p of G.pipes){if(p.passed&&!p.gl){p.gl=1;glitBurst(p.x+PW,p.gy,26,280);G.streak=(G.streak||0)+1;mSet('streak',G.streak);
   if(Math.abs(Math.abs(G.tiltA||0)-Math.PI)<0.35)mAdd('flip',1);if(G.fartT>0)mAdd('fart',1);mAdd('gates',1);mSet('s25',G.score);mSet('s50',G.score);}}
 if(G.gems>(pv.gems||0)){glitBurst(u.x+10,u.y,30,320);G.gotPU=1;mSet('gems',G.gems);}pv.gems=G.gems;
 if(G.ev&&G.ev.type==='nuke'||G.vom||G.frenzy>0)G.gotPU=1;
 if(!G.gotPU)mSet('nopu',G.runT||0);mSet('speed',G.runT||0);mSet('frenzy',G.frenzies||0);mSet('dodge',G.dodged||0);
 if((G.kills||0)>(pv.kills||0))mAdd('puke',G.kills-(pv.kills||0));pv.kills=G.kills||0;
 if(pv.ev&&pv.ev.type==='nuke'&&!G.ev)mAdd('nuke',1);if(pv.fan&&!G.fan)mAdd('fan',1);if(pv.lo&&!G.lo)mAdd('lights',1);
 if(pv.tilt&&!G.tilt)mAdd(pv.tilt.kind==='up'?'upside':'tilt',1);
 pv.ev=G.ev;pv.fan=G.fan;pv.lo=G.lo;pv.tilt=G.tilt;};
// mission UI
function missionRows(x0,y0,w,compact){const lv=uLevel(),inL=MST.done%3;cx.save();cx.fillStyle='rgba(74,20,88,.62)';rr(x0,y0,w,compact?74:78,14);cx.fill();cx.strokeStyle='rgba(255,215,0,.85)';cx.lineWidth=2;cx.stroke();
 txt('MISSIONS',x0+10,y0+12,13,'#ffd700','#4a1458',3,'left');txt('UNICORN LV '+lv,x0+w-46,y0+12,12,'#7ffcff','#4a1458',3,'right');
 for(let i=0;i<3;i++){cx.fillStyle=i<inL?'#ffd700':'rgba(255,255,255,.3)';starPath(x0+w-34+i*12,y0+12,5,2.2,5,-Math.PI/2);cx.fill();}
 MST.act.forEach((a,i)=>{const m=mDef(a.id),g=mGoal(m),y=y0+30+i*17,p=Math.min(a.p,g);const pr=m.time?(Math.floor(p/60)+':'+String(Math.floor(p%60)).padStart(2,'0')):(p|0)+'/'+g;
  cx.fillStyle='rgba(255,255,255,.18)';rr(x0+8,y-7,w-16,14,7);cx.fill();cx.fillStyle='rgba(255,79,216,.55)';rr(x0+8,y-7,Math.max(14,(w-16)*p/g),14,7);cx.fill();
  txt(m.t,x0+14,y,11,'#fff','#4a1458',3,'left');txt(pr+'  +'+(TEST?Math.floor(m.c/2):m.c),x0+w-12,y,11,'#ffe600','#4a1458',3,'right');});cx.restore();}
const _dt11=drawTitle;drawTitle=function(){_dt11();missionRows(12,226,W-24);};
const _do11=drawOver;drawOver=function(){_do11();const k=clamp((G.t-G.overT)*2.2,0,1);if(k<1||(G.entry&&!G.entry.saved))return;missionRows(W*0.06,300,W*0.88);};
const _hud11=drawHUD;drawHUD=function(){_hud11();drawToasts13();};
// v1.2.1: mission/achievement toasts stack up from the bottom (over the ground strip during play), compact + semi-transparent,
// so they never cover the unicorn, the gates or the score.
function toastBase13(){const pl=G.state==='play'||G.state==='dying';if(pl)return H-4;return Math.min(H-120,532);}
function drawToasts13(){const n=Math.min(TV13,G.toasts.length);if(!n)return;const base=toastBase13(),th=30,gap=4;
 for(let i=0;i<n;i++){const T=G.toasts[i],a=T.life,k=clamp(Math.min(1,(T.max-a)/0.2,a/0.3),0,1);const yb=base-i*(th+gap)+(1-k)*14,y=yb-th;
  cx.save();cx.globalAlpha=k;cx.fillStyle='rgba(74,20,88,.72)';rr(10,y,W-20,th,11);cx.fill();cx.strokeStyle=T.col;cx.globalAlpha=k*0.85;cx.lineWidth=2;cx.stroke();cx.globalAlpha=k;
  let t=T.t,s=T.sub||'';cx.font=`13px ${FONT}`;while(t.length>4&&cx.measureText(t).width>W-36)t=t.slice(0,-2)+'…';cx.font=`10px ${FONT}`;while(s.length>4&&cx.measureText(s).width>W-36)s=s.slice(0,-2)+'…';
  if(s){txt(t,W/2,y+10,13,T.col,'#4a1458',3);txt(s,W/2,y+22.5,10,'#fff','#4a1458',2.5);}else txt(t,W/2,y+th/2,13,T.col,'#4a1458',3);
  glint(20,y+7,i,9);cx.restore();}}
if(TEST){G.dbg.toast=toast;G.dbg.mDone=i=>mDone(MST.act[i]);}
// frame-time probe for tests
const _fr11=frame;frame=function(now){const t0=performance.now();_fr11(now);const ft=performance.now()-t0;G.ft=G.ft==null?ft:G.ft*0.95+ft*0.05;};
G.dbg.ms=MST;G.dbg.glit=()=>GP.filter(o=>o.on).length;
reset();

/* ================= v1.1 PHASE 2: run modes, daily mode, changing worlds + bosses ================= */
const MODES12={normal:{n:'NORMAL',d:'Worlds change every 2:00',c:'#ff4fd8'},disco:{n:'DISCO NIGHT',d:'Lights down, groove up',c:'#c86bff'},tiny:{n:'TINY UNICORN',d:'Half size, half gaps',c:'#2ee66b'},
 gravity:{n:'GRAVITY FLIP',d:'World flips every 20s',c:'#1fb6ff'},gold:{n:'GOLD RUSH',d:'Gems everywhere, faster',c:'#ffb000'},chaos:{n:'CHAOS',d:'Any event, any time',c:'#ff2d55'}};
const SPEC12=['disco','tiny','gravity','gold','chaos'],SEL12=['normal','daily'].concat(SPEC12);
const WN12=['CANDY LAND','STARRY SKY','RAINBOW CRYSTAL CAVE','CHROME CITY'];
const BN12=['COTTON CANDY KING','COSMIC PUFF','CRYSTAL GUST GOLEM','CHROME BLOWER 3000'];
const BC12=[['#ffd1ec','#ff8fd0','#ffe600'],['#3a3a8a','#6a6ad8','#fff6a0'],['#9a5cff','#5ad8ff','#ffffff'],['#c4ccd8','#7a8496','#ff4fd8']];
function dayKey12(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function dailyMode12(){const d=new Date();let h=(d.getFullYear()*372+d.getMonth()*31+d.getDate())*2654435761>>>0;h^=h>>>13;return SPEC12[h%5];}
const TMODE12=SPEC12.includes(TEST)?TEST:'';
G.sel=TMODE12||(TEST==='worlds'?'normal':LS.get('uf_sel','normal'));if(!SEL12.includes(G.sel))G.sel='normal';
G.mbest=LS.get('uf_mbest',{});if(!G.mbest||typeof G.mbest!=='object')G.mbest={};
function resolveMode12(){return G.sel==='daily'?dailyMode12():G.sel;}
function modeBest12(){if(G.sel==='normal')return +LS.get('uf_best',0)||0;if(G.sel==='daily'){const r=G.mbest.daily;return r&&r.d===dayKey12()?r.s:0;}return G.mbest[G.sel]||0;}
function applyMode12(){G.mode=resolveMode12();G.isDaily=G.sel==='daily';R=G.mode==='tiny'?6.5:13;PHYS=G.mode==='tiny'?0.55:1;G.best=modeBest12();}
function cycleMode12(d){const i=SEL12.indexOf(G.sel);G.sel=SEL12[(i+d+SEL12.length)%SEL12.length];if(!TEST)LS.set('uf_sel',G.sel);applyMode12();S.ding&&S.ding(1);}
function wK12(){return G.mode!=='normal'?0:(G.wf<0.5?(G.wPrev||0):(G.world||0));}
// new missions tied to modes + worlds
MS.push({id:'w2',t:'Reach the Starry Sky (Normal)',g:1,c:40},{id:'w4',t:'Reach Chrome City (Normal)',g:1,c:80},{id:'boss',t:'Survive 2 world bosses',g:2,c:50},
 {id:'disco',t:'Score 15 in Disco Night',g:15,run:1,c:35},{id:'tiny',t:'Score 10 as a Tiny Unicorn',g:10,run:1,c:40},{id:'gold',t:'Grab 12 gems in one Gold Rush',g:12,run:1,c:40},
 {id:'chaos',t:'Survive 1:00 of Chaos',g:60,run:1,c:50,time:1},{id:'gflip',t:'Survive 3 Gravity Flips in a run',g:3,run:1,c:40},{id:'daily',t:"Play today's Daily Mode",g:1,c:25},{id:'modes',t:'Try 3 different run modes',g:3,c:30});
// --- mode physics / spawning ---
const _dif12=difficulty;difficulty=function(){const d=_dif12();if(G.mode==='gold')d.sp*=1.18;if(G.mode==='tiny')d.gap*=0.5;return d;};
const _cb12=canBig;canBig=function(){return !G.boss&&!G.bossPend&&_cb12();};
const _sf12=startFart;startFart=function(){if(G.boss||G.bossPend)return;_sf12();};
const _st12=startTilt;startTilt=function(k){if(G.boss||G.bossPend)return;_st12(k);};
const _sp12=spawn;spawn=function(){const prev=lastGapY;_sp12();const p=G.pipes[G.pipes.length-1];if(!p)return;const lim=g=>[110+g/2,GY-110-g/2];
 if(G.mode==='tiny'){if(p.mv==='jaw'||p.mv==='pin'||p.mv==='arm'){p.mv=null;p.gap=p.gap0=Math.max(difficulty().gap,G.lo||G.fan?110:0);}if(p.amp)p.amp*=0.5;
  if(p.id>0){const old=p.gy,[a,b]=lim(p.gap);const ng=clamp(prev+(p.gy-prev)*0.5,a,b);p.gy=ng;if(p.gy0!=null)p.gy0=ng;lastGapY=ng;if(p.gem)p.gem.y+=ng-old;}}
 if(G.mode==='gold'&&!p.gem&&p.id>=1&&!G.lo&&!G.fan){p.gem={x:p.x+PW/2,y:p.gy+rnd(-1,1)*Math.max(0,p.gap/2-34)*0.6,got:false,kind:Math.random()<0.4?'star':'gem',ph:rnd(0,TAU)};if(p.mv)p.gem.off=p.gem.y-p.gy;}
 if(G.boss||G.bossPend){p.mv=null;p.gap=p.gap0=Math.max(p.gap,205);const [a,b]=lim(p.gap);p.gy=clamp(p.gy,a,b);if(p.gy0!=null)p.gy0=p.gy;if(p.gem){if(p.gem.kind==='nuke'||p.gem.kind==='taco')p.gem=null;else p.gem.y=clamp(p.gem.y,p.gy-p.gap/2+30,p.gy+p.gap/2-30);}}};
// --- reset / die ---
const _rs12=reset;reset=function(){_rs12();applyMode12();G.world=0;G.wPrev=0;G.wf=1;G.wIdx=0;G.boss=null;G.bossPend=0;G.bossN=0;G.maxW12=0;G.gT=TEST==='gravity'?3:6;G.chT=3;G.flips12=0;G.pt12=null;
 if(TEST==='worlds')G.runT=14;};
const _die12=die;die=function(){const was=G.state==='play';const nb=localStorage.getItem('uf_best');_die12();if(!was)return;
 let bonus=G.bossN*10;if(G.isDaily)bonus+=Math.floor(G.runCoins*0.25);if(TEST)bonus=Math.floor(bonus/2);if(bonus>0){G.coins+=bonus;G.runCoins+=bonus;saveEco();}
 if(G.mode!=='normal'){G.entry=null;try{if(nb==null)localStorage.removeItem('uf_best');else localStorage.setItem('uf_best',nb);}catch(e){}
  if(!TEST){if(G.isDaily){const r=G.mbest.daily;G.mbest.daily={d:dayKey12(),s:Math.max(r&&r.d===dayKey12()?r.s:0,G.score)};}else G.mbest[G.mode]=Math.max(G.mbest[G.mode]||0,G.score);LS.set('uf_mbest',G.mbest);}}
 if(G.isDaily)mAdd('daily',1);MST.tried=MST.tried||[];if(!MST.tried.includes(G.mode))MST.tried.push(G.mode);mSet('modes',MST.tried.length);mSave();};
// --- worlds: prebuilt sky / strips per world ---
function prng12(s){return ()=>(s=(s*16807)%2147483647)/2147483647;}
function spikeStrip12(base,mh,c1,c2,seed){const top=base-mh-10;const [c,g]=mk(HP,GY+6-top);g.translate(0,-top);for(let pass=0;pass<2;pass++){const r=prng12(seed);let x=-20;g.fillStyle=pass?c2:c1;g.globalAlpha=pass?0.5:1;
  while(x<HP){const w=30+r()*50,h=mh*(0.35+r()*0.65);g.beginPath();if(pass){g.moveTo(x,base+2);g.lineTo(x+w/2,base-h);g.lineTo(x+w/2,base+2);}else{g.moveTo(x-4,GY+6);g.lineTo(x,base);g.lineTo(x+w/2,base-h);g.lineTo(x+w+4,base);g.lineTo(x+w+4,GY+6);}g.closePath();g.fill();x+=w;}}
 g.globalAlpha=1;return {c,top};}
function cityStrip12(base,mn,mx,cA,cB,win,seed){const top=base-mx-20;const [c,g]=mk(HP,GY+6-top);g.translate(0,-top);const r=prng12(seed);let x=0;
 while(x<HP){const w=Math.min(26+r()*44,HP-x),h=mn+r()*(mx-mn),y=base-h;const gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,cA);gr.addColorStop(0.35,cB);gr.addColorStop(1,cA);g.fillStyle=gr;g.fillRect(x,y,w-3,GY+6-y);
  if(r()<0.3){g.fillRect(x+w/2-2,y-16,3,16);}if(win)for(let yy=y+8;yy<GY-6;yy+=12)for(let xx=x+5;xx<x+w-10;xx+=9)if(r()<0.35){g.fillStyle=r()<0.5?'#ffe6a0':'#7ffcff';g.fillRect(xx,yy,4,6);}x+=w;}
 return {c,top};}
function buildW12(k){const [c,g]=mk(W,H);const r=prng12(k*977+13);let gr=g.createLinearGradient(0,0,0,H);const B={sky:c,dec:[]};
 if(k===1){[[0,'#0a0830'],[0.5,'#24185e'],[0.82,'#5a2a86'],[1,'#8a4a9a']].forEach(a=>gr.addColorStop(a[0],a[1]));g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.save();g.translate(W/2,GY*0.4);g.rotate(-0.5);for(let i=0;i<5;i++){g.globalAlpha=0.08;g.fillStyle=['#ff9ae6','#9ff3ff','#c9a8ff'][i%3];g.beginPath();g.ellipse((i-2)*40,0,260,40-i*4,0,0,TAU);g.fill();}g.restore();g.globalAlpha=1;
  for(let i=0;i<140;i++){g.globalAlpha=0.3+r()*0.7;g.fillStyle='#fff';g.beginPath();g.arc(r()*W,r()*GY*0.85,0.5+r()*1.2,0,TAU);g.fill();}g.globalAlpha=1;
  g.fillStyle='#fff6c0';g.beginPath();g.arc(W-72,96,34,0,TAU);g.fill();g.fillStyle='#ebdc96';[[-14,-14,6],[12,16,5],[16,-8,4]].forEach(a=>{g.beginPath();g.arc(W-72+a[0],96+a[1],a[2],0,TAU);g.fill();});
  B.far=hillStrip(GY-90,60,'#2b2a7a','#4b4ab0',3,false);B.near=hillStrip(GY-40,45,'#1d3b6a','#3a6ab0',6,false);}
 else if(k===2){[[0,'#12052a'],[0.5,'#3a0f5e'],[1,'#0d4a6a']].forEach(a=>gr.addColorStop(a[0],a[1]));g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<9;i++){const x=r()*W,y=r()*GY*0.8,s=30+r()*60;const rg=g.createRadialGradient(x,y,0,x,y,s);rg.addColorStop(0,`hsla(${r()<0.5?190:300},100%,70%,.25)`);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-s,y-s,s*2,s*2);}
  for(let i=0;i<13;i++){const x=(i+r()*0.6)*W/12,len=40+r()*120,w=14+r()*22,h=r()<0.5?190+r()*30:290+r()*40;const lg=g.createLinearGradient(x-w/2,0,x+w/2,0);lg.addColorStop(0,`hsla(${h},90%,55%,.9)`);lg.addColorStop(0.5,`hsla(${h},100%,85%,.95)`);lg.addColorStop(1,`hsla(${h},90%,45%,.9)`);
   g.fillStyle=lg;g.beginPath();g.moveTo(x-w/2,0);g.lineTo(x,len);g.lineTo(x+w/2,0);g.closePath();g.fill();B.dec.push([x,len]);}
  B.far=spikeStrip12(GY-20,150,'#4a1a8a','#c9a8ff',7);B.near=spikeStrip12(GY,90,'#1a6a8a','#7ffcff',11);}
 else{[[0,'#1b0b3a'],[0.45,'#6a1b7a'],[0.75,'#ff4fa0'],[1,'#ffb36b']].forEach(a=>gr.addColorStop(a[0],a[1]));g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<50;i++){g.globalAlpha=0.3+r()*0.6;g.fillStyle='#fff';g.fillRect(r()*W,r()*GY*0.35,1.5,1.5);}g.globalAlpha=1;
  const [sc,sg]=mk(180,180);const sgr=sg.createLinearGradient(0,10,0,170);sgr.addColorStop(0,'#fff3a0');sgr.addColorStop(1,'#ff4fd8');sg.fillStyle=sgr;sg.beginPath();sg.arc(90,90,80,0,TAU);sg.fill();
  sg.globalCompositeOperation='destination-out';for(let j=0;j<6;j++){sg.fillRect(0,100+j*12,180,2+j*1.2);}g.drawImage(sc,W/2-90,GY-260,180,180);
  B.far=cityStrip12(GY,110,250,'#2a1a5a','#5a4a8a',true,5);B.near=cityStrip12(GY,50,140,'#7a8496','#eef3fa',true,9);}
 BG['w'+k]=B;}
function drawWorld12(k){if(!k){_sky12();return;}if(!BG)buildBG();if(!BG['w'+k])buildW12(k);const B=BG['w'+k];cx.drawImage(B.sky,0,0,W,H);
 if(G.frenzy>0&&!G.rf){cx.globalAlpha=0.15;cx.fillStyle=`hsl(${(G.t*240)%360},100%,60%)`;cx.fillRect(0,0,W,H);cx.globalAlpha=1;}
 if(k===1){face(W-72,98,34,'');const a=G.rf?0.35:0.9;for(const s of TW){const tw=(Math.sin(G.t*s.sp+s.ph)+1)/2;cx.globalAlpha=a*tw;cx.fillStyle='#fff';starPath(s.x*W,s.y*GY,s.s*(0.6+tw),s.s*0.25,4,0);cx.fill();}cx.globalAlpha=1;
  if(!G.rf){const q=(G.t*0.5)%3;if(q<0.6){const x=W*1.1-q*W*1.4,y=40+q*120;cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=2;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+50,y-18);cx.stroke();}}}
 else if(k===2){cx.save();cx.globalCompositeOperation='lighter';B.dec.forEach((d,i)=>{const tw=(Math.sin(G.t*2+i*1.3)+1)/2;cx.globalAlpha=(G.rf?0.4:0.9)*tw;cx.drawImage(GSPR[3+(i%3)],d[0]-10,d[1]-10,20,20);});cx.restore();}
 else{cx.fillStyle='rgba(255,79,216,.12)';cx.fillRect(0,GY-60,W,60);}
 strip(B.far,0.32);strip(B.near,0.6);}
function disco12(){cx.fillStyle='rgba(18,0,40,.6)';cx.fillRect(0,0,W,H);cx.save();cx.globalCompositeOperation='lighter';
 for(let i=0;i<4;i++){const ox=W*(0.15+i*0.23),a=Math.PI/2+Math.sin(G.t*(G.rf?0.25:0.9)+i*1.7)*0.55,hue=G.rf?i*90:(i*90+G.t*80)%360;cx.globalAlpha=G.rf?0.1:0.2;cx.fillStyle=`hsl(${hue},100%,60%)`;
  cx.beginPath();cx.moveTo(ox,-5);cx.lineTo(ox+Math.cos(a-0.13)*900,Math.sin(a-0.13)*900);cx.lineTo(ox+Math.cos(a+0.13)*900,Math.sin(a+0.13)*900);cx.closePath();cx.fill();}
 cx.restore();cx.strokeStyle='#aab';cx.lineWidth=2;cx.beginPath();cx.moveTo(W/2,0);cx.lineTo(W/2,22);cx.stroke();cx.save();cx.beginPath();cx.arc(W/2,42,20,0,TAU);cx.clip();
 const b=Math.floor(G.t*(G.rf?0.5:6));for(let ix=0;ix<6;ix++)for(let iy=0;iy<6;iy++){cx.fillStyle=`hsl(${(ix*40+iy*70+b*30)%360},${G.rf?20:80}%,${70+((ix+iy+b)%3)*8}%)`;cx.fillRect(W/2-24+ix*8,18+iy*8,7,7);}cx.restore();
 if(!G.rf){cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=0.5+0.5*Math.sin(G.t*7);cx.drawImage(GSPR[0],W/2-2,26,22,22);cx.restore();}}
const _sky12=drawSky;drawSky=function(){if(G.mode==='normal'){const k=wK12();drawWorld12(k);if(G.wf<1){const e=1-Math.abs(G.wf*2-1);cx.fillStyle=`rgba(255,250,255,${(G.rf?0.45:0.85)*e})`;cx.fillRect(0,0,W,H);}}else _sky12();
 if(G.mode==='disco')disco12();else if(G.mode==='gold'){cx.fillStyle='rgba(255,190,0,.13)';cx.fillRect(0,0,W,H);}};
const GPAL12={1:[['#1a1450','#241a6a','#2e2084','#3a2a9a','#2e2084','#241a6a','#1a1450'],'#7a5cff','#b8a0ff'],2:[['#3a0f5e','#5a1a8a','#7a2ab0','#2a8ab0','#1fb6ff','#7a2ab0','#3a0f5e'],'#7ffcff','#c9a8ff'],3:[['#2a2a3a','#4a4a5e','#6a6a80','#9aa6ba','#6a6a80','#4a4a5e','#2a2a3a'],'#ff4fd8','#ffb3e6']};
const _gr12=drawGround;drawGround=function(){const k=wK12();if(!k)_gr12();else{const P=GPAL12[k],o=(G.bgx%56+56)%56;for(let x=-56-o;x<W+56;x+=56)for(let i=0;i<7;i++){cx.fillStyle=P[0][i];cx.beginPath();cx.moveTo(x+i*8,GY);cx.lineTo(x+i*8+8,GY);cx.lineTo(x+i*8+8-40,H);cx.lineTo(x+i*8-40,H);cx.fill();}
  cx.fillStyle=P[1];cx.fillRect(0,GY-6,W,12);cx.fillStyle=P[2];cx.fillRect(0,GY-6,W,4);}
 if(G.mode==='disco'){const bt=Math.floor(G.t*(G.rf?0.5:2.5)),o=(G.bgx%30+30)%30;cx.save();cx.globalAlpha=G.rf?0.3:0.55;for(let x=-30-o,c=0;x<W+30;x+=30,c++)for(let r=0;r<3;r++){cx.fillStyle=['#ff4fd8','#1fb6ff','#ffe600','#2ee66b'][(c+r+bt+Math.floor(G.bgx/30))%4];cx.fillRect(x+1,GY+8+r*21,28,19);}cx.restore();}};
const TINT12={1:['multiply','#8f96ff',0.55,'#5d6bff',0.08],2:['multiply','#d59cff',0.45,'#40e0ff',0.12],3:['color','#c4ccd8',0.8,null,0]};
const _shp12=shimmerPipe;shimmerPipe=function(p){const k=wK12();if(k&&!p.dead&&!p.blown){const T=TINT12[k],top=p.gy-p.gap/2,bot=p.gy+p.gap/2,x=p.x;cx.save();cx.beginPath();cx.rect(x-6,-10,PW+12,top+10);cx.rect(x-6,bot,PW+12,GY-bot);cx.clip();
  cx.globalCompositeOperation=T[0];cx.globalAlpha=T[2];cx.fillStyle=T[1];cx.fillRect(x-6,-10,PW+12,GY+10);if(T[3]){cx.globalCompositeOperation='lighter';cx.globalAlpha=T[4];cx.fillStyle=T[3];cx.fillRect(x-6,-10,PW+12,GY+10);}cx.restore();}_shp12(p);};
const _zt12=zoneTint;zoneTint=function(){if(wK12()||G.mode==='disco')return;_zt12();};
// tiny unicorn draws at half scale
const _du12=drawUnicorn;drawUnicorn=function(u){if(G.mode==='tiny'&&!G.skinDraw){cx.save();cx.translate(u.x,u.y);cx.scale(0.5,0.5);cx.translate(-u.x,-u.y);_du12(u);cx.restore();}else _du12(u);};
const _dtr12=drawTrail;drawTrail=function(){if(G.mode==='tiny'){const u=G.uni;cx.save();cx.translate(u.x,u.y);cx.scale(0.5,0.5);cx.translate(-u.x,-u.y);_dtr12();cx.restore();}else _dtr12();};
// --- bosses ---
function startBoss12(k){G.boss={k,t:0,next:1.0,tel:0,dir:1,gust:0,sw:0,done:0};G.banner={t:0,text:'BOSS INCOMING!'};word(BN12[k]+'!',W/2,H*0.36,BC12[k][2],20);S.uhoh();G.lastEv=G.n;
 for(const p of G.pipes)if(!p.passed&&p.x>G.uni.x+150&&!p.blown){p.mv=null;p.gap=Math.max(p.gap,205);p.gy=clamp(p.gy,110+p.gap/2,GY-110-p.gap/2);}}
function bossTick12(d){const b=G.boss,u=G.uni;b.t+=d;G.lastEv=G.n;b.gust=Math.max(0,b.gust-d);
 if(b.t>=2.6&&!b.sw){b.sw=1;G.wPrev=G.world;G.world=b.k;G.wf=0;G.maxW12++;G.banner={t:0,text:'WORLD: '+WN12[b.k]+'!'};glitBurst(W/2,H*0.35,50,320);if(b.k===1)mSet('w2',1);if(b.k===3)mSet('w4',1);}
 if(b.t>3&&b.t<12.2){b.next-=d;if(!b.tel&&b.next<=0.9){b.tel=1;b.dir=Math.random()<0.5?-1:1;for(const p of G.pipes){p.gyN=null;if(!p.passed&&!p.blown&&p.x>u.x+200){const lo=110+p.gap/2,hi=GY-110-p.gap/2;let t=p.gy+b.dir*rnd(45,70);if(t<lo||t>hi)t=p.gy-b.dir*rnd(45,70);p.gyN=clamp(t,lo,hi);}}}
  if(b.next<=0){b.tel=0;b.next=2.6;b.gust=0.6;S.wind&&S.wind(1);if(!G.rm)G.shake=Math.max(G.shake,5);for(const p of G.pipes){if(p.gyN!=null&&p.x>u.x+100)p.gyT=p.gyN;p.gyN=null;}}}
 for(const p of G.pipes)if(p.gyT!=null){const dy=clamp(p.gyT-p.gy,-360*d,360*d);p.gy+=dy;if(p.gy0!=null)p.gy0+=dy;if(p.gem&&!p.gem.got)p.gem.y+=dy;if(Math.abs(p.gyT-p.gy)<0.5)p.gyT=null;}
 if(b.t>=12.4&&!b.done){b.done=1;for(const p of G.pipes)p.gyN=null;addScore(5);G.bossN++;mAdd('boss',1);word('BOSS BLOWN AWAY! +5',W/2,H*0.3,'#ffe600',24);glitBurst(W-70,120,40,320);S.frenzy();}
 if(b.t>=14)G.boss=null;}
function drawBoss12(){const b=G.boss;if(!b)return;const C=BC12[b.k],sm2=v=>v<0?0:v>1?1:v*v*(3-2*v);let bx=W+90-150*sm2(b.t/2.6);if(b.t>12.4)bx+=220*sm2((b.t-12.4)/1.4);const by=120+Math.sin(b.t*1.5)*10,pf=b.tel?1.12:1,s=46*pf;
 // arrows on gates that are about to be blown
 if(b.tel)for(const p of G.pipes)if(p.gyN!=null){const up=p.gyN<p.gy,a=0.55+0.45*Math.sin(G.t*14);cx.save();cx.globalAlpha=G.rf?0.85:a;cx.fillStyle='#fff';cx.strokeStyle='#ff2d55';cx.lineWidth=3;const x=p.x+PW/2,y=p.gy;cx.beginPath();
  if(up){cx.moveTo(x,y-26);cx.lineTo(x-16,y);cx.lineTo(x+16,y);}else{cx.moveTo(x,y+26);cx.lineTo(x-16,y);cx.lineTo(x+16,y);}cx.closePath();cx.fill();cx.stroke();cx.restore();}
 if(b.gust>0){cx.save();cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=3;cx.lineCap='round';const n=G.rm?4:10;for(let i=0;i<n;i++){const yy=by-40+i*(260/n)*(b.dir>0?1:0.6)+(b.dir>0?0:-20),xx=bx-60-((b.t*700+i*90)%(W));cx.beginPath();cx.moveTo(xx,yy);cx.lineTo(xx+50,yy-b.dir*-8);cx.stroke();}cx.restore();}
 cx.save();cx.fillStyle=C[1];[[-0.8,0.2,0.6],[0.8,0.2,0.6],[0,0.45,0.65]].forEach(a=>{cx.beginPath();cx.arc(bx+a[0]*s,by+a[1]*s,a[2]*s,0,TAU);cx.fill();});cx.fillStyle=C[0];[[-0.55,-0.1,0.6],[0.55,-0.1,0.6],[0,-0.35,0.75],[0,0.15,0.7]].forEach(a=>{cx.beginPath();cx.arc(bx+a[0]*s,by+a[1]*s,a[2]*s,0,TAU);cx.fill();});
 if(b.k===0){cx.fillStyle=C[2];cx.beginPath();cx.moveTo(bx-24,by-s*0.95);for(let i=0;i<5;i++){cx.lineTo(bx-24+i*12,by-s*0.95-(i%2?8:22));cx.lineTo(bx-18+i*12,by-s*0.95);}cx.lineTo(bx+24,by-s*0.95);cx.closePath();cx.fill();}
 else if(b.k===1){cx.fillStyle=C[2];for(let i=0;i<3;i++){const a=b.t*2+i*TAU/3;starPath(bx+Math.cos(a)*s*1.3,by+Math.sin(a)*s*0.8,7,3,5,a);cx.fill();}}
 else if(b.k===2){for(let i=0;i<4;i++){cx.fillStyle=i%2?'#7ffcff':'#ff9ae6';cx.beginPath();const x=bx-30+i*20;cx.moveTo(x-7,by-s*0.8);cx.lineTo(x,by-s*0.8-22-(i%2)*10);cx.lineTo(x+7,by-s*0.8);cx.fill();}}
 else{cx.strokeStyle='#555';cx.lineWidth=3;cx.beginPath();cx.moveTo(bx,by-s*1.05);cx.lineTo(bx,by-s*1.5);cx.stroke();cx.fillStyle=C[2];cx.beginPath();cx.arc(bx,by-s*1.5,5,0,TAU);cx.fill();cx.fillStyle='rgba(30,30,60,.75)';rr(bx-s*0.65,by-s*0.42,s*1.3,s*0.42,8);cx.fill();}
 // angry face
 cx.strokeStyle='#3a1640';cx.lineWidth=4;cx.lineCap='round';cx.beginPath();cx.moveTo(bx-s*0.5,by-s*0.42);cx.lineTo(bx-s*0.15,by-s*0.28);cx.moveTo(bx+s*0.5,by-s*0.42);cx.lineTo(bx+s*0.15,by-s*0.28);cx.stroke();
 cx.fillStyle=b.k===3?'#7ffcff':'#3a1640';cx.beginPath();cx.arc(bx-s*0.3,by-s*0.15,s*0.1,0,TAU);cx.arc(bx+s*0.3,by-s*0.15,s*0.1,0,TAU);cx.fill();
 cx.fillStyle='#3a1640';cx.beginPath();if(b.gust>0)cx.ellipse(bx-s*0.2,by+s*0.2,s*0.2,s*0.16,0,0,TAU);else if(b.tel){cx.arc(bx,by+s*0.2,s*0.07,0,TAU);}else cx.ellipse(bx,by+s*0.22,s*0.25,s*0.06,0,0,TAU);cx.fill();
 if(b.tel){cx.fillStyle='rgba(255,80,150,.6)';cx.beginPath();cx.arc(bx-s*0.55,by+s*0.1,s*0.2,0,TAU);cx.arc(bx+s*0.55,by+s*0.1,s*0.2,0,TAU);cx.fill();}
 cx.restore();}
const _dp12=drawParts;drawParts=function(){_dp12();drawBoss12();};
// --- per-frame mode / world logic ---
const _up12=update;update=function(dt){_up12(dt);if(G.state!=='play'){A.wfl=0;A.disco=false;A.boss=false;return;}const d=Math.min(dt,0.05)*(G.ts==null?1:G.ts);
 G.wf=Math.min(1,(G.wf==null?1:G.wf)+d/1.5);
 if(G.mode==='normal'){const wl=TEST==='worlds'?20:120,idx=Math.floor(G.runT/wl);if(idx>G.wIdx&&!G.boss&&!G.bossPend){G.wIdx=idx;G.bossPend=1;G.banner={t:0,text:'SOMETHING BIG IS COMING...'};}
  if(G.bossPend&&!G.ev&&!G.tilt&&!G.lo&&!G.fan&&!G.vom&&Math.abs(G.tiltA||0)<0.02){G.bossPend=0;startBoss12(G.wIdx%4);}if(G.boss)bossTick12(d);}
 else if(G.mode==='gravity'&&!G.rm){if(!G.tilt&&!G.forceTilt){G.gT-=d;if(G.gT<=0){G.forceTilt='up';G.gT=20;word('GRAVITY FLIP!',W/2,H*0.24,'#1fb6ff',30);}}}
 else if(G.mode==='chaos'){G.chT-=d;if(G.chT<=0){G.chT=rnd(5,8);const e=pick(['nuke','fart','tilt','flip','fan','lights','taco','moving','frenzy']);
  if(e==='nuke')G.forceNuke=true;else if(e==='fart')G.forceFart=true;else if(e==='tilt')G.forceTilt='diag';else if(e==='flip')G.forceTilt='up';else if(e==='fan')G.forceFan=true;else if(e==='lights')G.forceLO=true;
  else if(e==='taco')G.forceTaco=true;else if(e==='moving')G.forceMv=pick(['slide','cannon','jaw','pin','cloud','arm']);else if(G.frenzy<=0)startFrenzy();word('CHAOS!',W/2,H*0.2,'#ff2d55',20);}mSet('chaos',G.runT);}
 else if(G.mode==='gold'){if(!G.rf&&Math.random()<d*8)glit(rnd(0,W),-5,rnd(-20,20),rnd(60,120),rnd(1.5,2.5),rnd(4,7),1);mSet('gold',G.gems);}
 if(G.mode==='disco')mSet('disco',G.score);if(G.mode==='tiny')mSet('tiny',G.score);
 if(G.pt12&&!G.tilt&&G.pt12.kind==='up'&&G.mode==='gravity'){G.flips12++;mSet('gflip',G.flips12);}G.pt12=G.tilt;
 A.wfl=G.mode==='normal'?(G.world||0):0;A.disco=G.mode==='disco';A.boss=!!(G.boss&&G.boss.t>2.6&&G.boss.t<12.4);};
// --- music flavors per world / disco / boss (tempo still follows the speed ramp) ---
const WPROG12=[CH,[[57,60,64],[53,57,60],[60,64,67],[55,59,62]],[[57,60,64],[52,55,59],[53,57,60],[50,53,57]],[[53,57,60],[55,59,62],[57,60,64],[57,60,64]]],DISCO12=[[57,60,64],[55,59,62],[53,57,60],[52,55,59]];
const _sch12=sched;sched=function(){if(!A.ctx)return;const wf=A.wfl||0;if(A.mode!=='main'||(!wf&&!A.disco&&!A.boss)){_sch12();return;}
 const SM=Math.min(2.5,spdMul()),bpm=(A.frenzy?172:150)*SM*(A.disco?0.9:1),spb=60/bpm/4;
 while(A.next<A.ctx.currentTime+0.15){const t=A.next,s=A.step%64,bar=(s/16)|0,st=s%16;const P=A.disco?DISCO12:WPROG12[wf];const ch=P[bar%P.length];
  if(A.disco){if(st%4===0)tone('sine',140,t,0.2,1,A.mus,42,0.14);if(st%4===2)noise(t,0.14,0.28,6000,A.mus);if(st===4||st===12)noise(t,0.14,0.4,1400,A.mus);if(st%2===1)noise(t,0.03,0.1,9000,A.mus);
   if(st%2===0)tone('sawtooth',mtof(ch[0]-24+(st%4>=2?12:0)),t,0.12,0.2,A.mus);if(st===2||st===6||st===10||st===14)for(const n of ch)tone('square',mtof(n+12),t,0.07,0.045,A.mus);
   const k=MEL[st];if(k>=0&&st%2===0)tone('triangle',mtof(ch[k%3]+24),t,0.14,0.12,A.mus);}
  else if(wf===1){if(st%8===0)tone('sine',120,t,0.25,0.8,A.mus,40,0.18);if(st===8)noise(t,0.2,0.18,2500,A.mus);if(st%4===2)noise(t,0.03,0.08,9000,A.mus);if(st%4===0)tone('sine',mtof(ch[0]-24),t,0.4,0.5,A.mus);
   const arp=ch[st%3]+24+(st>=8?12:0);if(st%2===0){tone('triangle',mtof(arp),t,0.25,0.09,A.mus);tone('sine',mtof(arp),t+spb*3,0.2,0.035,A.mus);}const k=MEL2[st];if(k>=0&&st%4===0)tone('sine',mtof(ch[k%3]+36),t,0.35,0.07,A.mus);}
  else if(wf===2){if(st%4===0)tone('sine',150,t,0.18,0.85,A.mus,45,0.12);if(st===4||st===12)noise(t,0.1,0.25,3000,A.mus);if(st%2===1)tone('sine',mtof(96+((st>>1)%3)*3),t,0.03,0.025,A.mus);
   if(st%4===0||st===10)tone('triangle',mtof(ch[0]-24),t,0.22,0.55,A.mus);const k=MEL[st];if(k>=0){const n=ch[k%3]+24;tone('sine',mtof(n),t,0.3,0.12,A.mus);tone('sine',mtof(n)*2.01,t,0.18,0.03,A.mus);}}
  else{if(st%4===0)tone('sine',160,t,0.16,0.95,A.mus,45,0.1);if(st%2===1)noise(t,0.03,0.18,8000,A.mus);if(st===4||st===12){noise(t,0.14,0.45,1200,A.mus);tone('triangle',190,t,0.08,0.3,A.mus,120);}
   tone('sawtooth',mtof(ch[0]-24+(st%2?12:0)),t,0.08,0.16,A.mus);const k=(((A.step/64)|0)%2?MEL2:MEL)[st];if(k>=0){const n=ch[k%3]+12*(1+((k/3)|0));tone('square',mtof(n),t,0.1,0.09,A.mus);tone('sawtooth',mtof(n)*1.01,t,0.08,0.04,A.mus);}}
  if(A.boss&&!A.disco){if(st%2===0)tone('sawtooth',mtof(ch[0]-36),t,0.1,0.16,A.mus);if(st===0&&bar%2===0)tone('square',880,t,0.4,0.05,A.mus,660,0.4);}
  if(A.frenzy&&st%2===1)tone('sine',mtof(ch[(st>>1)%3]+36),t,0.08,0.12,A.mus);A.next+=spb;A.step++;}};
// --- UI: title mode selector, HUD badges, over label, LB mode bests ---
const _dt12=drawTitle;drawTitle=function(){_dt12();const M=MODES12[G.mode]||MODES12.normal,y=478;btn('m-',30,y,44,34,'<','#7a5cff',()=>cycleMode12(-1),20);btn('m+',W-30,y,44,34,'>','#7a5cff',()=>cycleMode12(1),20);
 txt((G.sel==='daily'?'DAILY: ':'')+M.n,W/2,y-8,G.sel==='daily'?14:17,M.c,'#4a1458',4);
 const sub=G.mode==='gravity'&&G.rm?'Reduce Motion is on: no flips':(G.sel==='daily'?'+25% coins · ':'')+'BEST '+G.best+' · '+M.d;txt(sub,W/2,y+11,10,'#fff','#4a1458',3);};
const _hud12=drawHUD;drawHUD=function(){_hud12();if(G.state!=='play'&&G.state!=='dying')return;const M=MODES12[G.mode];let lab=G.mode==='normal'?(G.world?WN12[G.world]:''):(G.isDaily?'DAILY: ':'')+M.n;
 if(G.mode==='gravity'&&!G.tilt&&!G.rm)lab+=' · FLIP IN '+Math.max(0,Math.ceil(G.gT));
 if(lab){cx.save();cx.font='bold 10px sans-serif';const w=cx.measureText(lab).width+14;cx.fillStyle='rgba(74,20,88,.6)';rr(6,8,w,18,9);cx.fill();cx.fillStyle=G.mode==='normal'?'#fff':M.c;cx.textAlign='left';cx.textBaseline='middle';cx.fillText(lab,13,17);cx.restore();}
 const b=G.boss;if(b&&b.t>2.6&&b.t<12.4)txt('SURVIVE '+BN12[b.k]+'! '+Math.ceil(12.4-b.t),W/2,hudY13(128),13,BC12[b.k][2],'#4a1458',4);};
const _do12=drawOver;drawOver=function(){_do12();if(G.entry)return;let lab='';if(G.mode!=='normal')lab=(G.isDaily?'DAILY · ':'')+MODES12[G.mode].n+' · no leaderboard';else if(G.maxW12>0)lab='Reached '+WN12[G.world]+(G.bossN?' · bosses '+G.bossN+' (+'+(G.bossN*10)+'c)':'');
 if(lab)txt(lab,W/2,254,11,'#7a5cff','#fff',3);};
const _dlb12=drawLB;drawLB=function(){_dlb12();const mb=G.mbest;txt('MODE BESTS  Disco '+(mb.disco||0)+' · Tiny '+(mb.tiny||0)+' · Flip '+(mb.gravity||0)+' · Gold '+(mb.gold||0)+' · Chaos '+(mb.chaos||0),W/2,H-68,9,'#fff','#4a1458',3);};
G.dbg.p2={sel:s=>{G.sel=s;applyMode12();},daily:dailyMode12};
reset();

/* ================= v1.2.2: keep popup text off the unicorn ================= */
// Floating words spawn ahead/above-right of the unicorn (or in a band above/below it), drift away if it flies into them,
// and fade a little while overlapping. Big banners and HUD countdowns pick a band away from the unicorn's height.
function uBox13(){const u=G.uni,k=G.mode==='tiny'?0.55:1;return {l:u.x-38*k,r:u.x+38*k,t:u.y-38*k,b:u.y+32*k};}
function hit13(a,x,y,hw,hh,m){return x+hw>a.l-m&&x-hw<a.r+m&&y+hh>a.t-m&&y-hh<a.b+m;}
function wSize13(t,sz){cx.save();cx.font=`${sz}px ${FONT}`;const w=cx.measureText(t).width;cx.restore();return {hw:w*0.6+4,hh:sz*0.62+4};}
function inPlay13(){return G.state==='play'||G.state==='dying';}
const _word13=word;word=function(t,x,y,col,sz){sz=sz||30;if(!inPlay13()||!G.uni)return _word13(t,x,y,col,sz);
 sz=Math.round(sz*0.9);const b=uBox13(),u=G.uni,{hw,hh}=wSize13(t,sz),yT=104,yB=GY-12;
 const ok=(X,Y)=>Y-hh>=yT&&Y+hh<=yB&&!hit13(b,X,Y,hw,hh,10);const cX=X=>clamp(X,hw+6,W-hw-6);
 if(!ok(x,y)){const near=Math.abs(x-u.x)<140&&Math.abs(y-u.y)<120;const C=[];
  if(near){C.push([cX(b.r+16+hw),u.y-hh*0.6],[cX(b.r+16+hw),b.t-14-hh],[cX(x),b.t-14-hh],[cX(b.r+16+hw),b.b+14+hh]);}
  else C.push([x,clamp(y,yT+hh,yB-hh)]);C.push([x,b.t-16-hh],[x,b.b+16+hh]);
  let p=C.find(c=>ok(c[0],c[1]));if(!p)p=[cX(x),u.y>H*0.45?Math.max(yT+hh,b.t-16-hh):Math.min(yB-hh,b.b+16+hh)];x=p[0];y=p[1];}
 _word13(t,x,y,col,sz);const w=G.words[G.words.length-1];if(w){w.a=0.9;w.av=1;}};
drawWords=function(){const b=inPlay13()&&G.uni?uBox13():null;for(const w of G.words){const k=1-w.life/w.max,s=k<0.15?k/0.15*1.25:1.25-Math.min(0.25,(k-0.15)*2);
  let a=clamp(w.life*3,0,1)*(w.a||1)*(w.av==null?1:w.av);cx.save();cx.globalAlpha=a;
  cx.translate(w.x,w.y);cx.rotate(w.rot+Math.sin(G.t*12)*0.05);cx.scale(s,s);txt(w.t,0,0,w.sz,w.col,'#4a1458');cx.restore();}cx.globalAlpha=1;};
const _up13=update;update=function(dt){_up13(dt);if(!inPlay13()||!G.uni)return;const b=uBox13(),u=G.uni;
 for(const w of G.words){const {hw,hh}=w.bb||(w.bb=wSize13(w.t,w.sz));const over=hit13(b,w.x,w.y,hw*0.9,hh*0.9,4);
  if(over){const dir=w.y<u.y?-1:1;w.y+=dir*170*dt;if(w.x>=u.x)w.x=Math.min(W-hw-4,w.x+70*dt);}
  let ob=false;const bn=G.banner;if(bn&&bn.y13!=null&&!G.tiltA&&bn.t<1.8&&Math.abs(w.y-bn.y13)<hh+22){ob=true;if(!over)w.y+=(w.y<bn.y13?-1:1)*60*dt;}
  w.av=(w.av==null?1:w.av)+((over?0.55:ob?0.45:1)-(w.av==null?1:w.av))*Math.min(1,dt*10);}};
// unicorn position in screen space (follows world tilt / upside-down)
function uScreen13(){const u=G.uni;if(!u)return {x:W*0.3,y:H*0.42};if(!G.tiltA)return {x:u.x,y:u.y};const f=tiltFrame(G.tiltA),a=G.tiltA,dx=(u.x-f.cx)*f.z,dy=(u.y-f.cy)*f.z;
 return {x:W/2+dx*Math.cos(a)-dy*Math.sin(a),y:H/2+dx*Math.sin(a)+dy*Math.cos(a)};}
function bandY13(y0,hh){if(!inPlay13())return y0;const us=uScreen13().y,cu=hh+60,cd=hh+48;if(y0<=us-cu||y0>=us+cd)return y0;
 const up=us-cu,dn=us+cd;const upOK=up>=96+hh*0.5,dnOK=dn<=GY-20-hh*0.5;
 if(upOK&&(!dnOK||us>=y0))return Math.max(96+hh*0.5,Math.min(y0,up));if(dnOK)return dn;return y0;}
function bannerY13(b){const tgt=bandY13(H*0.3,30);if(b.y13==null)b.y13=tgt;b.y13+=(tgt-b.y13)*Math.min(1,(G.dtLast||0.016)*8);return b.y13;}
function hudY13(y0){return bandY13(y0,10);}
const _up13b=update;update=function(dt){G.dtLast=dt;_up13b(dt);};
/* ================= BOOT ================= */
function boot(){
  const t0=performance.now();const ff=('FontFace' in window)?new FontFace('Lilita One','url(fonts/LilitaOne-Regular.ttf)').load().then(f=>document.fonts.add(f)).catch(()=>{}):Promise.resolve();
  Promise.race([ff,new Promise(r=>setTimeout(r,2500))]).then(()=>{const wait=Math.max(0,900-(performance.now()-t0));setTimeout(()=>{
    G.state='title';const sp=document.getElementById('splash');sp.classList.add('gone');setTimeout(()=>sp.remove(),600);muteBtn.style.display='block';verCheck();},wait);});
  requestAnimationFrame(frame);
  if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')navigator.serviceWorker.register('sw.js').catch(()=>{});
}
// newest-version check: version.json (no-store); a newer build reloads once
function verNum(v){const p=String(v).replace(/^v/,'').split('.').map(Number);return (p[0]||0)*1e6+(p[1]||0)*1e3+(p[2]||0);}
function verCheck(){if(!/^https?:/.test(location.protocol))return;fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
  if(!j||verNum(j.v)<=verNum(VERSION))return;const k='uf_rl_'+j.v;let done=false;try{done=sessionStorage.getItem(k);sessionStorage.setItem(k,1);}catch(e){}
  if(!done){const u=new URL(location.href);u.searchParams.set('u',j.v);location.replace(u.href);}}).catch(()=>{});}
document.addEventListener('visibilitychange',()=>{if(!A.ctx)return;if(document.hidden)A.ctx.suspend();else A.ctx.resume();if(!document.hidden)verCheck();});
boot();
})();
