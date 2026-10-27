/*!
 * UNICORN FLAP-TASTIC! (working title) v0.2
 * A Rainwater Games production.
 * © 2026 Rainwater Games (Jeff Rainwater). All rights reserved.
 * Unauthorized copying, modification or distribution of this game, its code or art is prohibited.
 */
(function(){
'use strict';
const VERSION='0.2';
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
const PW=66, SPACING=225, R=13;
function reset(){
  G.uni={x:W*0.3,y:H*0.42,vy:0,rot:0,sq:1,flapT:0,face:'idle',faceT:0,spin:0,wing:0,blink:2};
  G.pipes=[];G.parts=[];G.words=[];G.trail=[];G.score=0;G.n=0;G.combo=0;G.frenzy=0;G.gems=0;G.newBest=false;G.speed=140;G.spawnX=W+60;G.banner=null;A.frenzy=false;G.ev=null;G.inv=0;G.ts=1;G.lastEv=0;G.tilt=null;G.tiltA=0;
}
reset();
function difficulty(){const n=G.n;
  const gap=n<5?225:Math.max(148,205-(n-5)*1.6);
  const sp=n<5?140:Math.min(215,148+(n-5)*1.6);
  return {gap,sp};}
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
  if(n>=4&&(G.forceNuke||!p.gem&&((n-G.lastEv>=10&&Math.random()<0.12)))){G.forceNuke=false;G.lastEv=n;p.gem={x:p.x+PW/2,y:gy,got:false,kind:'nuke',ph:0};}
  G.pipes.push(p); G.n++; G.spawnX+=SPACING;
}
function flap(){
  const u=G.uni; u.vy=-410; u.sq=0.55; u.flapT=0.25; u.face='flap'; u.faceT=0.25; u.wing=1;
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
addEventListener('pointerdown',e=>{if(e.target===muteBtn||e.target===rfBtn||e.target===rmBtn)return;e.preventDefault();tap();},{passive:false});
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
  if(G.state==='title'||G.state==='load'){G.bgx+=60*dt;u.y=H*0.47+Math.sin(G.t*3)*14;u.rot=Math.sin(G.t*3)*0.12;u.wing=(Math.sin(G.t*10)+1)/2;
    u.sq+=(1-u.sq)*Math.min(1,dt*10);if(Math.random()<dt*0.5){u.face='derp';u.faceT=0.8;}}
  if(G.state==='play'){
    const d=difficulty(); G.speed+=(d.sp-G.speed)*Math.min(1,dt*2);
    if(G.auto){const p=G.pipes.find(p=>p.x+PW>u.x-R-4);const ty=p?(p.gem&&!p.gem.got&&p.x<u.x+140?p.gem.y:p.gy+12):H*0.45;if(u.y>ty+8&&u.vy>-60)flap();}
    u.vy+=1350*dt; u.vy=Math.min(u.vy,620); u.y+=u.vy*dt; if(u.y<12){u.y=12;u.vy=Math.max(u.vy,0);}
    u.rot+=(clamp(u.vy/700,-0.45,1.0)-u.rot)*Math.min(1,dt*8);
    G.bgx+=G.speed*dt;
    G.spawnX-=G.speed*dt; while(G.spawnX<W+80)spawn();
    for(const p of G.pipes){p.x-=G.speed*dt;if(p.gem)p.gem.x=p.x+PW/2;
      if(!p.passed&&p.x+PW<u.x-R){p.passed=true;addScore(1);S.ding(G.frenzy>0?1.25:1);burst(u.x+10,u.y,22);
        if(Math.random()<0.6||G.score%5===0)word(pick(YAY),u.x+rnd(20,70),u.y-rnd(30,60));
        if(p.gem&&!p.gem.got)G.combo=0;
        if(G.score>0&&G.score%10===0&&G.frenzy<=0){G.flash=0.6;G.banner={t:0,text:G.score+' RAINBOWS!'};}}
      if(p.gem&&!p.gem.got){const g=p.gem;if(g.kind==='nuke'){if(!G.ev&&(u.x-g.x)**2+(u.y-g.y)**2<(R+20)**2){g.got=true;startNuke();}}
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
  const t=G.t;cx.save();cx.translate(u.x,u.y);cx.rotate(u.rot);
  const sx=1/Math.sqrt(u.sq)*(u.sq<1?1:1), sy=u.sq; cx.scale(1+(1-sy)*0.6,sy+(1-sy)*0.2);
  cx.scale(1.35,1.35);
  // tail (rainbow strands)
  for(let i=0;i<6;i++){cx.strokeStyle=RB[i];cx.lineWidth=4.5;cx.lineCap='round';cx.beginPath();cx.moveTo(-18,-3+i*1.5);
    cx.quadraticCurveTo(-30,-12+i*3+Math.sin(t*12+i)*4,-40,-6+i*4+Math.sin(t*10+i*0.7)*6);cx.stroke();}
  // legs
  const kick=u.flapT>0?Math.sin(u.flapT*30)*5:Math.sin(t*14)*1.5;
  for(const [lx,ph] of [[-12,0],[-5,1],[6,0],[13,1]]){cx.fillStyle='#fff';cx.strokeStyle='#c2338f';cx.lineWidth=2;rr(lx-3,6,7,13+(ph?kick:-kick)*0.5,3);cx.fill();cx.stroke();cx.fillStyle='#ff4fd8';rr(lx-3,15+(ph?kick:-kick)*0.5,7,5,2);cx.fill();}
  // body
  cx.fillStyle='#fff';cx.strokeStyle='#c2338f';cx.lineWidth=3;cx.beginPath();cx.ellipse(0,0,21,15,0,0,TAU);cx.fill();cx.stroke();
  cx.fillStyle='#ffe0f4';cx.beginPath();cx.ellipse(-6,5,6,4,0,0,TAU);cx.ellipse(6,-4,4,3,0,0,TAU);cx.fill();
  // wing
  cx.save();cx.translate(-3,-8);cx.rotate(-0.6-u.wing*1.4+Math.sin(t*(G.state==='title'?10:4))*0.2);
  for(let i=0;i<3;i++){cx.fillStyle=['#fff','#d6f3ff','#ffd6f2'][i];cx.beginPath();cx.ellipse(-4-i*5,-4+i*2,12-i*2,5,-0.3,0,TAU);cx.fill();}cx.strokeStyle='#ff9ad5';cx.lineWidth=1.5;cx.beginPath();cx.ellipse(-4,-4,12,5,-0.3,0,TAU);cx.stroke();cx.restore();
  // neck + head
  cx.fillStyle='#fff';cx.strokeStyle='#c2338f';cx.lineWidth=3;cx.beginPath();cx.ellipse(14,-10,9,12,0.5,0,TAU);cx.fill();
  cx.beginPath();cx.arc(19,-17,12,0,TAU);cx.fill();cx.stroke();
  cx.beginPath();cx.ellipse(28,-11,9,7.5,0.2,0,TAU);cx.fillStyle='#ffd0ea';cx.fill();cx.stroke();
  cx.fillStyle='#d14d97';cx.beginPath();cx.ellipse(31,-13,1.6,2.2,0,0,TAU);cx.ellipse(26.5,-14,1.4,2,0,0,TAU);cx.fill();
  // ear
  cx.fillStyle='#fff';cx.beginPath();cx.moveTo(12,-25);cx.lineTo(10,-36);cx.lineTo(18,-28);cx.closePath();cx.fill();cx.stroke();
  // horn
  cx.save();cx.translate(21,-28);cx.rotate(0.35);const hg=cx.createLinearGradient(-5,0,5,-24);hg.addColorStop(0,'#ffd21f');hg.addColorStop(1,'#fff6a0');
  cx.fillStyle=hg;cx.beginPath();cx.moveTo(-5,0);cx.lineTo(0,-24);cx.lineTo(5,0);cx.closePath();cx.fill();cx.strokeStyle='#ff9f1c';cx.lineWidth=2;cx.stroke();
  for(let i=1;i<4;i++){cx.beginPath();cx.moveTo(-5+i*1.2,-i*6+2);cx.lineTo(5-i*1.2,-i*6-1);cx.stroke();}
  if(Math.sin(t*5)>0.6){cx.fillStyle='#fff';starPath(0,-26,5,1.2,4,t);cx.fill();}cx.restore();
  // mane (flowing rainbow curls)
  for(let i=0;i<7;i++){const a=i/6, mx=14-a*18, my=-27+a*20, wv=Math.sin(t*9-i*0.8)*3;cx.fillStyle=RB[i];cx.beginPath();cx.arc(mx-4+wv,my,6.5-a*1.5,0,TAU);cx.fill();
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
  cx.restore();
  if(G.state==='dying'||G.state==='over'){for(let i=0;i<5;i++){const a=t*5+i*TAU/5;cx.fillStyle=RB[i*1%7];starPath(u.x+Math.cos(a)*30,u.y-34+Math.sin(a)*9,7,3,5,t*4);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=1.5;cx.stroke();}}
}
function drawParts(){for(const p of G.parts){const a=clamp(p.life/p.max*1.5,0,1);cx.globalAlpha=a;cx.fillStyle=p.col;
  if(p.k==='heart'||p.k==='duck'||p.k==='cake'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.scale(p.s/10,p.s/10);if(p.k==='heart')heart(0,0,10,p.col);else if(p.k==='duck')duck(0,0);else cake(0,0);cx.restore();}
  else if(p.k==='conf'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2*Math.abs(Math.cos(p.r*2))+1);cx.restore();}
  else{starPath(p.x,p.y,p.s,p.s*0.35,4,p.r);cx.fill();}}cx.globalAlpha=1;}
function heart(x,y,s,c){cx.fillStyle=c;cx.beginPath();cx.moveTo(x,y+s*0.9);cx.bezierCurveTo(x-s*1.6,y-s*0.2,x-s*0.6,y-s*1.3,x,y-s*0.4);cx.bezierCurveTo(x+s*0.6,y-s*1.3,x+s*1.6,y-s*0.2,x,y+s*0.9);cx.fill();}
function duck(x,y){cx.fillStyle='#ffe600';cx.beginPath();cx.ellipse(x,y+3,11,8,0,0,TAU);cx.arc(x+6,y-6,6,0,TAU);cx.fill();cx.fillStyle='#ff8a00';cx.beginPath();cx.ellipse(x+13,y-5,4,2.2,0,0,TAU);cx.fill();cx.fillStyle='#3a1640';cx.beginPath();cx.arc(x+7,y-7,1.6,0,TAU);cx.fill();}
function cake(x,y){cx.fillStyle='#ff9ad5';cx.beginPath();cx.moveTo(x-9,y);cx.lineTo(x+9,y);cx.lineTo(x+6,y+10);cx.lineTo(x-6,y+10);cx.fill();cx.fillStyle='#fff4fb';cx.beginPath();cx.arc(x-4,y-1,6,0,TAU);cx.arc(x+4,y-1,6,0,TAU);cx.arc(x,y-6,6,0,TAU);cx.fill();cx.fillStyle='#ff2d55';cx.beginPath();cx.arc(x,y-12,3,0,TAU);cx.fill();}
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
    cx.save();cx.translate(W/2,H*0.3);cx.rotate(Math.sin(G.t*8)*0.08);cx.scale(s,s);cx.globalAlpha=clamp((1.8-b.t)*3,0,1);rainbowText(b.text,0,0,Math.min(44,W/9),6);cx.restore();cx.globalAlpha=1;}
  if(G.state==='title'){
    const by=Math.sin(G.t*2.5)*6;cx.save();cx.translate(W/2,128+by);cx.rotate(Math.sin(G.t*1.7)*0.04);
    rainbowText('UNICORN',0,-26,Math.min(64,W/6),5);rainbowText('FLAP-TASTIC!',0,30,Math.min(52,W/7.4),5);cx.restore();
    txt('A Rainwater Games production',W/2,196,18,'#fff','#7a2a8a',5);
    const ps=1+Math.sin(G.t*7)*0.08;cx.save();cx.translate(W/2,H*0.68);cx.scale(ps,ps);cx.fillStyle='#ff4fd8';rr(-120,-34,240,68,34);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=5;cx.stroke();
    txt('TAP TO FLAP!',0,2,34,'#fff','#7a1460',6);cx.restore();
    txt('BEST: '+G.best,W/2,H*0.68+60,22,'#ffe600','#4a1458',6);
    txt('v'+VERSION,12,22,14,'#fff','#4a1458',4,'left');
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
function render(){
  cx.setTransform(DPR,0,0,DPR,0,0);
  const sh=G.rf?Math.min(4,G.shake*0.3):G.shake;cx.save();if(sh>0)cx.translate(rnd(-sh,sh),rnd(-sh,sh));
  const z=camZoom();if(z.s!==1){cx.translate(z.x,z.y);cx.scale(z.s,z.s);cx.translate(-G.uni.x,-G.uni.y);}
  if(G.tiltA){const d=Math.hypot(W,H)/Math.min(W,H)*1.02,sc=Math.abs(Math.sin(G.tiltA*2))>0.01||Math.abs(G.tiltA)%Math.PI>0.05?d:1;cx.translate(W/2,H/2);cx.rotate(G.tiltA);cx.scale(sc,sc);cx.translate(-W/2,-H/2);}
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
  if(!T){if(!G.rm&&G.score>=8&&G.n-G.lastEv>=8&&(G.forceTilt||Math.random()<dt*0.05)){const k=G.forceTilt||(Math.random()<0.4?'up':'diag');G.forceTilt=null;startTilt(k);}return;}
  T.t+=dt;const tr=1.0;let a;
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
