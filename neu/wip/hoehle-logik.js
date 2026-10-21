/*HLOGIC*/
// Hoehle (Dungeon): gleiche Regeln wie LK (30 Schritte/s, Mulberry32 in s.r, keine Zeit/Grafik), dazu:
// Karte aus dem Seed (Kammern + Gaenge), Gitter, Kisten mit Beute, drei Bosse (marlo|toni|perla), tier.
// Eingaben wie LK, dazu {step,type:'tap',k} (Perle zurueckwerfen).
var HK=(function(){
'use strict';
const L=LK.K,{rnd,around,accel,moveTo,cl,dist,brake}=LK.X,sdn=LK.sdn,mult=LK.mult,r2=LK.r2,HZ=30,DT=1/HZ,MAXSTEP=HZ*240;
const U0={bat:{hp:34,atk:4,cd:24,rng:0.8,v:3.2,rad:0.3,st:2,g:2},crab:{hp:62,atk:6,cd:32,rng:0.85,v:1.9,rad:0.38,st:0,g:3},
  slime:{hp:44,atk:5,cd:40,rng:0.8,v:1.1,rad:0.42,st:1,g:3},
  marlo:{hp:1300,atk:11,cd:48,rng:1.05,v:1.8,rad:0.65,st:1},toni:{hp:1400,atk:13,cd:54,rng:1.15,v:1.45,rad:0.75,st:0},
  perla:{hp:1050,atk:10,cd:44,rng:1.05,v:1.3,rad:0.7,st:2}};
Object.assign(L.u,U0);
const K={U:U0,cw:1,MAX:MAXSTEP,pot:0.35,rest:0.25,
  spit:{cd:100,cdr:50,aim:16,v:5,dmg:8,min:1.6,max:6.5},
  drop:{dur:45,r:0.9,dmg:15},
  toni:{st:150,str:50,pre:24,n:4,n2:6,wd:190,wdr:60,dur:44,wr:3,wdmg:24,stun:100,cdmg:45,rk:{first:60,cd:140,cdr:50,aim:30,v:5.2,r:0.55,dmg:18}},
  perla:{fan:{first:90,cd:160,cdr:40,aim:26,n:5,sp:0.26,v:6,dmg:11},open:110,shell:0.12,snap:{cd:150,cdr:60,dur:40,r:2.4,dmg:20,near:2.6},stun:150,cdmg:40,
    call:[0.7,0.4],rain:{at:0.5,n:5,v:1.5,dmg:20,bv:9,bdmg:55,need:3}},
  bossLoot:{marlo:{g:40,se:2},toni:{g:40,ei:2},perla:{g:70,pl:2}}};
const reach=(a,t)=>L.u[a.kind].rng+L.u[t.kind].rad;
function mk(s,side,kind,style,x,z,room){const c=L.u[kind],hp=side==='e'?Math.round(c.hp*s.hm):c.hp;
  const u={id:s.u.length,side,kind,style,x:r2(x),z:r2(z),vx:0,vz:0,h:-Math.PI/2,hp,max:hp,cd:15+s.u.length*4,sw:0,tg:-1,ult:0,bound:0,as:0,dead:false,room,act:side==='p',sp:40+s.u.length*7,aim:0,ah:0,rt:0};
  s.u.push(u);return u;}
// Begehbar = Vereinigung aus Kammer-Kreisen und Gang-Kapseln; Abstand (negativ = drin) + Normale nach aussen
function sdU(s,x,z){let b=1e9,nx=0,nz=0;
  for(const q of s.R){const dx=x-q.x,dz=z-q.z,l=Math.hypot(dx,dz)||1e-6,d=l-q.r;if(d<b){b=d;nx=dx/l;nz=dz/l;}}
  for(const c of s.C){const t=cl((x-c.ax)*c.dx+(z-c.az)*c.dz,0,c.l),dx=x-c.ax-c.dx*t,dz=z-c.az-c.dz*t,l=Math.hypot(dx,dz)||1e-6,d=l-K.cw;if(d<b){b=d;nx=dx/l;nz=dz/l;}}
  return [b,nx,nz];}
// Zone: Kammer i = 2i, Gang i = 2i+1 (fuer Wegfindung entlang der Kette)
function zone(s,x,z){for(let i=0;i<s.R.length;i++){const q=s.R[i];if(Math.hypot(x-q.x,z-q.z)<q.r)return 2*i;}
  let b=1,bd=1e9;s.C.forEach((c,i)=>{const t=cl((x-c.ax)*c.dx+(z-c.az)*c.dz,0,c.l),d=Math.hypot(x-c.ax-c.dx*t,z-c.az-c.dz*t);if(d<bd){bd=d;b=2*i+1;}});return b;}
function nav(s,x,z,tx,tz){const a=zone(s,x,z),b=zone(s,tx,tz);if(Math.abs(a-b)<2)return null;
  if(b>a){if(a%2===0){const i=a/2,q=s.R[i],c=s.C[i];return [q.x+c.dx*(q.r+0.6),q.z+c.dz*(q.r+0.6)];}
    const i=(a-1)/2,q=s.R[i+1],c=s.C[i];return [q.x-c.dx*(q.r-0.9),q.z-c.dz*(q.r-0.9)];}
  if(a%2===0){const i=a/2,q=s.R[i],c=s.C[i-1];return [q.x-c.dx*(q.r+0.6),q.z-c.dz*(q.r+0.6)];}
  const i=(a-1)/2,q=s.R[i],c=s.C[i];return [q.x+c.dx*(q.r-0.9),q.z+c.dz*(q.r-0.9)];}
function go(s,u,tx,tz,v,stop){const w=nav(s,u.x,u.z,tx,tz);if(w)moveTo(s,u,w[0],w[1],v,0);else moveTo(s,u,tx,tz,v,stop);}
function spot(s,i,rad,minC){const q=s.R[i];
  for(let t=0;t<16;t++){const a=rnd(s)*Math.PI*2,m=Math.sqrt(rnd(s))*(q.r-rad-0.7),x=r2(q.x+Math.cos(a)*m),z=r2(q.z+Math.sin(a)*m);
    if(Math.hypot(x-q.x,z-q.z)<(minC===undefined?1.3:minC))continue;
    if(s.ob.some(o=>Math.hypot(o.x-x,o.z-z)<rad+(o.r||o.hw||0.5)+0.7))continue;
    if(s.C.some((c,j)=>Math.hypot(c.ax+c.dx*s.R[j].r-x,c.az+c.dz*s.R[j].r-z)<rad+1.5||Math.hypot(c.bx-c.dx*s.R[j+1].r-x,c.bz-c.dz*s.R[j+1].r-z)<rad+1.5))continue;
    return [x,z];}
  return null;}
function roll(s){const r=rnd(s),gm=s.gm;
  if(r<0.42)return {g:Math.round((6+Math.floor(rnd(s)*9))*gm)};
  if(r<0.67)return {pot:1};
  const m=['pl','ei','se'][Math.floor(rnd(s)*3)],l={g:Math.round(3*gm)};l[m]=1;return l;}
function crate(s,i){const p=spot(s,i,0.45);if(p)s.ob.push({k:'b',x:p[0],z:p[1],hw:0.4,hd:0.4,a:r2(rnd(s)-0.5),hp:3,loot:roll(s)});}
function chest(s,i){const p=spot(s,i,0.6,1.6);if(!p)return;const m=['pl','ei','se'],a=Math.floor(rnd(s)*3),l={g:Math.round((45+Math.floor(rnd(s)*25))*s.gm),pot:1};
  l[m[a]]=1;l[m[(a+1+Math.floor(rnd(s)*2))%3]]=1;s.ob.push({k:'b',x:p[0],z:p[1],hw:0.55,hd:0.38,a:0,hp:4,chest:1,loot:l});}
function gen(s){
  const n=4+Math.floor(rnd(s)*3),R=s.R,C=s.C;let x=0,z=0,a=0;
  for(let i=0;i<n;i++){const last=i===n-1,r=r2(i===0?3.4:last?6.2:3.8+rnd(s)*1.3);
    if(i>0){const p=R[i-1];a=cl(a*0.3+(rnd(s)-0.5)*1.4,-0.75,0.75);const d=p.r+r+2.2+rnd(s)*1.6;x=r2(p.x+Math.sin(a)*d);z=r2(p.z-Math.cos(a)*d);}
    R.push({x,z,r,act:i===0,cl:i===0});}
  for(let i=0;i<n-1;i++){const p=R[i],q=R[i+1],dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz);C.push({ax:p.x,az:p.z,bx:q.x,bz:q.z,dx:dx/l,dz:dz/l,l});}
  // Gitter am Ausgang jeder Kammer mit Gegnern
  for(let i=1;i<n-1;i++){const p=R[i],c=C[i],d=p.r+0.5;s.ob.push({k:'b',x:r2(p.x+c.dx*d),z:r2(p.z+c.dz*d),hw:K.cw+0.3,hd:0.2,a:Math.atan2(c.dx,-c.dz),gate:i});}
  const r0=R[0];mk(s,'p','cap',0,r0.x,r0.z+1.2,0);mk(s,'p','mate',1,r0.x-1.3,r0.z+2,0);mk(s,'p','mate',2,r0.x+1.3,r0.z+2,0);
  s.tx=s.u[0].x;s.tz=s.u[0].z;
  crate(s,0);
  const chestRoom=Math.max(1,n-2),pool=[['bat','crab'],['crab','slime'],['bat','slime'],['bat','crab','slime']];
  for(let i=1;i<n-1;i++){
    for(let k=2+Math.floor(rnd(s)*2);k>0;k--){const p=spot(s,i,0.5);if(p)s.ob.push({k:'c',x:p[0],z:p[1],r:r2(0.35+rnd(s)*0.2),sp:1});}
    for(let k=1+Math.floor(rnd(s)*2);k>0;k--)crate(s,i);
    if(i===chestRoom)chest(s,i);
    const pl=pool[Math.floor(rnd(s)*pool.length)],cnt=2+(i>1?1:0)+(rnd(s)<0.45?1:0),q=R[i];
    for(let k=0;k<cnt;k++){const kind=pl[Math.floor(rnd(s)*pl.length)],p=spot(s,i,0.4,0)||[q.x,q.z];mk(s,'e',kind,U0[kind].st,p[0],p[1],i);}
  }
  const b=R[n-1],c=C[n-2],B=s.boss;
  if(B==='toni')for(const[ox,oz]of[[-2.4,-1.2],[2.4,-1.2],[-2,2.2],[2,2.2]])s.ob.push({k:'c',x:r2(b.x+ox),z:r2(b.z+oz),r:0.6,pil:1});
  else for(let k=0;k<(B==='perla'?3:4);k++){const p=spot(s,n-1,0.6,2);if(p)s.ob.push({k:'c',x:p[0],z:p[1],r:0.5,sp:1});}
  for(let k=0;k<2;k++)crate(s,n-1);
  s.bi=s.u.length;mk(s,'e',B,U0[B].st,b.x+c.dx*b.r*0.35,b.z+c.dz*b.r*0.35,n-1);s.u[s.bi].h=Math.atan2(-c.dz,-c.dx);
  const bs=s.bs;
  if(B==='toni'){bs.t1=90;bs.t2=K.toni.wd;}else if(B==='perla'){bs.st='shut';bs.t1=K.perla.fan.first;bs.t2=K.perla.snap.cd;}
}
function create(seed,o){
  seed=seed>>>0;o=o||{};const boss=['marlo','toni','perla'].indexOf(o.boss)>=0?o.boss:'marlo',tier=cl(Math.floor(+o.tier||0),0,9);
  const s={seed,boss,tier,hm:1+0.4*tier,dm:1+0.2*tier,gm:1+0.25*tier,r:seed,step:0,over:false,winner:null,u:[],rings:[],shots:[],pearls:[],ob:[],R:[],C:[],nid:1,ev:[],hash:2166136261,
    focus:-1,ph:1,net:null,tx:0,tz:0,mv:0,mx:0,mz:0,kcd:0,bi:-1,
    bs:{st:'move',pt:0,pd:1,ring:100,wind:0,shot:L.shot.first,aa:[],ao:null,t1:0,t2:0,t3:0,back:0,called:0,rained:0},
    loot:{gold:0,pl:0,ei:0,se:0,chests:0,pots:0},stats:{ults:0,cuts:0,net:'-',counters:0,slams:0,shots:0,blocked:0,shotHits:0,crates:0,kills:0,back:0}};
  gen(s);return s;}
function near(s,u,side,maxd,act){let best=null,bd=maxd;for(const t of s.u){if(t.dead||t.side!==side||(act&&!t.act))continue;const d=dist(u,t);if(d<bd){bd=d;best=t;}}return best;}
function wake(s,i){const q=s.R[i];if(!q||q.act)return;q.act=true;for(const u of s.u)if(u.side==='e'&&u.room===i)u.act=true;s.ev.push({k:'room',i,boss:i===s.R.length-1});}
function addLoot(s,l,x,z){const g=s.loot;if(l.g)g.gold+=l.g;for(const m of['pl','ei','se'])if(l[m])g[m]+=l[m];
  s.ev.push({k:'loot',x,z,l});
  if(l.pot){g.pots++;for(const u of s.u)if(u.side==='p'&&!u.dead){const n=Math.min(Math.round(u.max*K.pot),u.max-u.hp);if(n>0){u.hp+=n;s.ev.push({k:'heal',id:u.id,n,x:u.x,z:u.z});}}}}
function dmg(s,src,t,base,kind){
  const b=s.u[s.bi],bs=s.bs;
  if(t.dead||(t===b&&bs.st==='net'))return;
  const m=src?mult(src.style,t.style):1;let n=base*m;
  if(t.side==='p')n*=s.dm;
  if(t===b){if(bs.st==='stun')n*=L.wind.stunMul;
    if(s.boss==='perla'&&bs.st!=='open'&&bs.st!=='stun'&&kind!=='phit'&&kind!=='chit'){n*=K.perla.shell;s.ev.push({k:'klonk',x:t.x,z:t.z});}}
  n=Math.max(1,Math.round(n));t.hp=Math.max(0,t.hp-n);
  if(kind==='hit'&&src)src.ult=Math.min(100,src.ult+L.ult.hit);
  if(t.side==='p')t.ult=Math.min(100,t.ult+L.ult.hurt);
  if(t.side==='e'&&!t.act)wake(s,t.room);
  s.ev.push({k:kind,id:t.id,src:src?src.id:-1,n,m,x:t.x,z:t.z});
  if(t.hp<=0){t.dead=true;t.sw=0;t.vx=t.vz=0;s.ev.push({k:'down',id:t.id});if(s.focus===t.id)s.focus=-1;
    if(t.side==='e'){s.stats.kills++;addLoot(s,t===b?K.bossLoot[s.boss]:{g:Math.round(U0[t.kind].g*s.gm)},t.x,t.z);}}
}
function hitCrate(s,i,n){
  const o=s.ob[i];if(!o||o.gone||!o.hp)return;o.hp=Math.max(0,o.hp-n);s.ev.push({k:'crhit',i});
  if(o.hp>0)return;o.gone=true;s.loot.chests++;s.stats.crates++;s.ev.push({k:o.chest?'chest':'crate',i,x:o.x,z:o.z});addLoot(s,o.loot,o.x,o.z);}
function tryAtk(s,u,t,mul){
  if(u.sw>0||u.cd>0||!t||t.dead||dist(u,t)>reach(u,t))return;
  u.sw=12;u.tg=t.id;u.cd=Math.round(L.u[u.kind].cd*(mul||1));u.h=Math.atan2(t.z-u.z,t.x-u.x);s.ev.push({k:'swing',id:u.id});}
function tryCrate(s,u){
  if(u.sw>0||u.cd>0)return;
  for(let i=0;i<s.ob.length;i++){const o=s.ob[i];if(!o.hp||o.gone)continue;const q=sdn(o,u.x,u.z);
    if(q[0]<=L.u.cap.rng){u.sw=12;u.tg=100+i;u.cd=L.u.cap.cd;u.h=Math.atan2(-q[2],-q[1]);s.ev.push({k:'swing',id:u.id});return;}}}
function resetWind(s){const bs=s.bs;
  if(s.boss==='toni')bs.t2=K.toni.wd+Math.floor(rnd(s)*K.toni.wdr);
  else if(s.boss==='perla')bs.t2=K.perla.snap.cd+Math.floor(rnd(s)*K.perla.snap.cdr);
  else bs.wind=L.wind.cd+Math.floor(rnd(s)*L.wind.cdr);}
function inp(s,i){
  const U=s.u,cap=U[0],bs=s.bs;
  if(i.type==='move'){let x=cl(r2(+i.x||0),-1,1),z=cl(r2(+i.z||0),-1,1);const l=Math.hypot(x,z);if(l>1){x/=l;z/=l;}s.mx=x;s.mz=z;s.mv=1;}
  else if(i.type==='steer'){s.tx=cl(r2(+i.x||0),-300,300);s.tz=cl(r2(+i.y||0),-300,300);s.mv=0;}
  else if(i.type==='focus'){const t=U[i.id|0];if(t&&t.side==='e'&&!t.dead){s.focus=s.focus===t.id?-1:t.id;s.ev.push({k:'focus',id:s.focus});}}
  else if(i.type==='cut'){if(s.net){const th=s.net.th[i.k|0];if(th&&!th.cut){th.cut=true;s.stats.cuts++;s.ev.push({k:'cut',n:i.k|0});}}}
  else if(i.type==='tap'){const p=s.pearls.find(p=>p.id===(i.k|0));if(p&&!p.back){p.back=1;s.stats.back++;s.ev.push({k:'tap',x:p.x,z:p.z});}}
  else if(i.type==='ult'){
    const u=U[i.i|0];if(!u||u.side!=='p'||u.dead||u.bound||u.ult<100||s.net)return;
    u.ult=0;s.stats.ults++;s.ev.push({k:'ult',id:u.id});
    for(const t of U){if(t.side!=='e'||t.dead)continue;const d=dist(u,t);
      if(d<=L.ult.r+L.u[t.kind].rad){dmg(s,u,t,L.ult.dmg,'uhit');const k=t.id===s.bi?0.3:0.9,dd=d||1;t.x+=(t.x-u.x)/dd*k;t.z+=(t.z-u.z)/dd*k;}}}
  else if(i.type==='counter'){
    if(s.kcd>0||s.net||cap.dead)return;const b=U[s.bi];
    if(bs.st==='wind'&&!b.dead){const P=s.boss==='toni'?K.toni:s.boss==='perla'?K.perla:null;s.stats.counters++;s.ev.push({k:'counter'});
      dmg(s,null,b,P?P.cdmg:L.wind.cdmg,'chit');bs.st='stun';bs.pt=P?P.stun:L.wind.stun;resetWind(s);}
    else{s.kcd=L.wind.miss;s.ev.push({k:'kmiss'});}}
}
function mateAI(s,u){
  if(u.dead||u.bound)return;
  const c=L.u.mate,cap=s.u[0];
  for(const r of s.rings){const d=Math.hypot(u.x-r.x,u.z-r.z);if(d<r.r+0.45&&r.t>10){const k=d>0.01?2/d:2;moveTo(s,u,u.x+(u.x-r.x)*k,u.z+(u.z-r.z)*k+(d>0.01?0:2),c.v,0);return;}}
  let t=null;const f=s.focus>=0?s.u[s.focus]:null;
  if(f&&!f.dead&&f.act&&dist(f,cap)<L.leash)t=f;else{t=near(s,u,'e',L.aggro,1);if(t&&dist(t,cap)>L.leash)t=null;}
  if(t){const rc=reach(u,t);if(dist(u,t)>rc-0.12)go(s,u,t.x,t.z,c.v,rc-0.25);else brake(s,u);tryAtk(s,u,t);}
  else{const sd=u.id===1?-1:1,fx=Math.cos(cap.h),fz=Math.sin(cap.h);go(s,u,cap.x-fx*1.1-fz*sd*1.05,cap.z-fz*1.1+fx*sd*1.05,c.v,0.25);}
}
function monAI(s,u){
  const c=L.u[u.kind],t=near(s,u,'p',99);if(!t){brake(s,u);return;}
  if(u.aim>0){brake(s,u);u.h=u.ah;if(--u.aim===0){const dx=Math.cos(u.ah),dz=Math.sin(u.ah);
      s.shots.push({id:s.nid++,x:u.x+dx*0.5,z:u.z+dz*0.5,dx,dz,d:0,v:K.spit.v,r:0.2,dmg:K.spit.dmg,t:'spore'});s.ev.push({k:'spit',id:u.id});}return;}
  if(u.kind==='slime'&&--u.sp<=0){u.sp=K.spit.cd+Math.floor(rnd(s)*K.spit.cdr);const d=dist(u,t);
    if(d>K.spit.min&&d<K.spit.max&&u.sw===0){u.ah=Math.atan2(t.z-u.z,t.x-u.x);u.aim=K.spit.aim;s.ev.push({k:'spitAim',id:u.id});return;}}
  if(u.rt>0){u.rt--;const dx=u.x-t.x,dz=u.z-t.z,l=Math.hypot(dx,dz)||1;moveTo(s,u,u.x+dx/l,u.z+dz/l,c.v*0.8,0);return;}
  const rc=reach(u,t);if(dist(u,t)>rc-0.1)go(s,u,t.x,t.z,c.v,rc-0.2);else brake(s,u);tryAtk(s,u,t);
}
// --- Boss-Bausteine ---
function chase(s,b,spd,cdm){const cap=s.u[0],t=(!cap.dead&&dist(b,cap)<3.2?cap:near(s,b,'p',1.7))||cap,rc=reach(b,t);
  if(dist(b,t)>rc-0.1)go(s,b,t.x,t.z,L.u[b.kind].v*spd,rc-0.2);else brake(s,b);tryAtk(s,b,t,cdm);}
function aimAt(s,b,aa,pt,ao){const bs=s.bs;bs.aa=aa;bs.ao=ao||null;bs.st='aim';bs.pt=pt;bs.pd=pt;s.ev.push({k:'aim',n:aa.length});}
function fire(s,b,v,r,dm,t){const bs=s.bs;
  bs.aa.forEach((a,k)=>{const dx=Math.cos(a),dz=Math.sin(a),o=bs.ao?bs.ao[k]:[b.x+dx*0.7,b.z+dz*0.7];s.shots.push({id:s.nid++,x:o[0],z:o[1],dx,dz,d:0,v,r,dmg:dm,t});s.stats.shots++;});
  s.ev.push({k:'shot',t});}
function windup(s,r,dur){const bs=s.bs;bs.st='wind';bs.pt=dur;bs.pd=dur;bs.wr=r;s.ev.push({k:'wind',r});}
function slam(s,b,r,dm){s.stats.slams++;s.ev.push({k:'slam',x:b.x,z:b.z,r});for(const t of s.u)if(t.side==='p'&&!t.dead&&dist(b,t)<=r+0.2)dmg(s,null,t,dm,'slamhit');}
function drops(s,n,r,dur,kind,gap,spread){const cap=s.u[0],q=s.R[s.R.length-1];
  for(let i=0;i<n;i++){let x,z;
    if(i===0){x=cap.x+cap.vx*0.9;z=cap.z+cap.vz*0.9;}
    else if(i===n-1&&(kind==='drop'||s.ph===3)){const m=[1,2].filter(j=>!s.u[j].dead);const t=m.length?s.u[m[Math.floor(rnd(s)*m.length)]]:cap;x=t.x;z=t.z;}
    else{const a=rnd(s)*Math.PI*2,m=0.9+rnd(s)*spread;x=cap.x+Math.cos(a)*m;z=cap.z+Math.sin(a)*m;}
    const dx=x-q.x,dz=z-q.z,l=Math.hypot(dx,dz),mx=q.r-0.5;if(l>mx){x=q.x+dx*mx/l;z=q.z+dz*mx/l;}
    s.rings.push({id:s.nid++,x:r2(x),z:r2(z),t:-i*gap,dur,r,kind});s.ev.push({k:'ring',kind});}}
function marloAI(s,b){
  const U=s.u,bs=s.bs,cap=U[0],rg=s.ph===3,W=L.wind,SH=L.shot;
  if(bs.st==='stun'){brake(s,b);if(--bs.pt<=0){bs.st='move';s.ev.push({k:'stunEnd'});}return;}
  if(bs.st==='wind'){brake(s,b);if(--bs.pt<=0){slam(s,b,W.r,W.dmg);bs.st='move';bs.wind=W.cd+Math.floor(rnd(s)*W.cdr);}return;}
  if(bs.st==='aim'){brake(s,b);b.h=bs.aa[(bs.aa.length-1)>>1];if(--bs.pt<=0){fire(s,b,SH.v,0.2,SH.dmg,'fade');bs.st='move';bs.shot=(rg?SH.rcd:SH.cd)+Math.floor(rnd(s)*SH.cdr);}return;}
  chase(s,b,rg?L.rage.spd:1,rg?L.rage.cd:1);
  if(--bs.ring<=0){drops(s,rg?L.rage.n:L.ring.n,L.ring.r,L.ring.dur,'ring',7,L.ring.spread);bs.ring=(rg?L.rage.ringCd:L.ring.cd)+Math.floor(rnd(s)*L.ring.cdr);}
  if(rg&&--bs.wind<=0&&b.sw===0){windup(s,W.r,W.dur);return;}
  if(s.ph!==2&&--bs.shot<=0&&b.sw===0){
    if(dist(b,cap)<SH.min){bs.shot=15;return;}
    let tg=cap;if(rnd(s)<0.3){const m=[1,2].filter(j=>!U[j].dead&&dist(b,U[j])>=SH.min);if(m.length)tg=U[m[Math.floor(rnd(s)*m.length)]];}
    const a=Math.atan2(tg.z-b.z,tg.x-b.x);aimAt(s,b,rg?[a-SH.fan,a,a+SH.fan]:[a],SH.aim);}
}
function toniAI(s,b){
  const U=s.u,bs=s.bs,cap=U[0],T=K.toni,p2=s.ph>=2;
  if(bs.st==='stun'){brake(s,b);if(--bs.pt<=0){bs.st='move';s.ev.push({k:'stunEnd'});}return;}
  if(bs.st==='wind'){brake(s,b);if(--bs.pt<=0){slam(s,b,T.wr,T.wdmg);bs.st='move';resetWind(s);}return;}
  if(bs.st==='stomp'){brake(s,b);if(--bs.pt<=0){s.ev.push({k:'stomp',x:b.x,z:b.z});drops(s,p2?T.n2:T.n,K.drop.r,K.drop.dur,'drop',5,2.6);bs.st='move';bs.t1=T.st+Math.floor(rnd(s)*T.str);}return;}
  if(bs.st==='aim'){brake(s,b);if(--bs.pt<=0){fire(s,b,T.rk.v,T.rk.r,T.rk.dmg,'rock');bs.st='move';bs.t3=T.rk.cd+Math.floor(rnd(s)*T.rk.cdr);}return;}
  chase(s,b,p2?1.15:1,1);if(b.sw)return;
  if(--bs.t2<=0&&dist(b,cap)<5){windup(s,T.wr,T.dur);return;}
  if(--bs.t1<=0){bs.st='stomp';bs.pt=T.pre;bs.pd=T.pre;s.ev.push({k:'stomp0'});return;}
  if(p2&&--bs.t3<=0){// Felsbrocken rollen von der Wand quer durch die Kammer, Saeulen geben Deckung
    const q=s.R[s.R.length-1],aa=[],ao=[],m=[1,2].filter(j=>!U[j].dead);
    for(let k=0;k<2;k++){const t=k===0||!m.length?cap:U[m[Math.floor(rnd(s)*m.length)]],a=Math.atan2(t.z-q.z,t.x-q.x)+(rnd(s)-0.5)*1.2+(k?0.7:0);
      const ox=r2(q.x-Math.cos(a)*(q.r-0.7)),oz=r2(q.z-Math.sin(a)*(q.r-0.7));aa.push(Math.atan2(t.z-oz,t.x-ox));ao.push([ox,oz]);}
    aimAt(s,b,aa,T.rk.aim,ao);}
}
function startRain(s,b){const P=K.perla.rain,bs=s.bs,tg=[0,1,2].filter(j=>!s.u[j].dead),cap=s.u[0],a0=Math.atan2(cap.z-b.z,cap.x-b.x);
  bs.rained=1;bs.st='rain';bs.back=0;s.shots=s.shots.filter(p=>p.t!=='pearl');
  for(let k=0;k<P.n;k++){const t=s.u[tg[k%tg.length]],a=a0+(k-(P.n-1)/2)*0.5,x=r2(b.x+Math.cos(a)*1.3),z=r2(b.z+Math.sin(a)*1.3),dx=t.x-x,dz=t.z-z,l=Math.hypot(dx,dz)||1;
    s.pearls.push({id:s.nid++,x,z,dx:dx/l,dz:dz/l,d:0,w:k*12,back:0});}
  s.ev.push({k:'rain'});}
function perlaAI(s,b){
  const U=s.u,bs=s.bs,cap=U[0],P=K.perla;
  if(bs.st==='stun'||bs.st==='open'){brake(s,b);if(--bs.pt<=0){bs.st='shut';s.ev.push({k:'shut'});}return;}
  if(bs.st==='rain'){brake(s,b);if(!s.pearls.length){const ok=bs.back>=P.rain.need;s.ev.push({k:'rainEnd',ok,n:bs.back});if(ok){bs.st='stun';bs.pt=P.stun;}else bs.st='shut';}return;}
  if(bs.st==='wind'){brake(s,b);if(--bs.pt<=0){slam(s,b,P.snap.r,P.snap.dmg);bs.st='shut';resetWind(s);}return;}
  if(bs.st==='aim'){brake(s,b);b.h=bs.aa[(bs.aa.length-1)>>1];if(--bs.pt<=0){fire(s,b,P.fan.v,0.22,P.fan.dmg,'pearl');bs.st='open';bs.pt=P.open;bs.t1=P.fan.cd+Math.floor(rnd(s)*P.fan.cdr);s.ev.push({k:'open'});}return;}
  chase(s,b,1,1);if(b.sw)return;
  if(--bs.t2<=0&&dist(b,cap)<P.snap.near){windup(s,P.snap.r,P.snap.dur);return;}
  if(--bs.t1<=0){const a=Math.atan2(cap.z-b.z,cap.x-b.x),aa=[];for(let k=0;k<P.fan.n;k++)aa.push(a+(k-(P.fan.n-1)/2)*P.fan.sp);aimAt(s,b,aa,P.fan.aim);}
}
function shotsT(s){
  for(let i=s.shots.length-1;i>=0;i--){const p=s.shots[i];let gone=false;
    for(let k=0;k<3&&!gone;k++){const v=p.v*DT/3;p.x+=p.dx*v;p.z+=p.dz*v;p.d+=v;
      for(let j=0;j<s.ob.length&&!gone;j++){const o=s.ob[j];if(!o.gone&&sdn(o,p.x,p.z)[0]<p.r-0.1){gone=true;s.stats.blocked++;s.ev.push({k:'block',x:p.x,z:p.z,t:p.t});if(!o.chest)hitCrate(s,j,p.t==='rock'?3:1);}}
      for(const t of s.u)if(!gone&&t.side==='p'&&!t.dead&&Math.hypot(t.x-p.x,t.z-p.z)<L.u[t.kind].rad+p.r){gone=true;s.stats.shotHits++;dmg(s,null,t,p.dmg,'shit');
        if(p.t==='rock'){t.x+=p.dx*0.6;t.z+=p.dz*0.6;}}
      if(!gone&&(p.d>24||sdU(s,p.x,p.z)[0]>0.3)){gone=true;s.ev.push({k:'fizz',x:p.x,z:p.z,t:p.t});}}
    if(gone)s.shots.splice(i,1);}
}
function pearlsT(s){const b=s.u[s.bi],P=K.perla.rain;
  for(let i=s.pearls.length-1;i>=0;i--){const p=s.pearls[i];let gone=0;
    if(p.back){const dx=b.x-p.x,dz=b.z-p.z,l=Math.hypot(dx,dz);
      if(l<L.u.perla.rad+0.3||b.dead){gone=1;if(!b.dead){s.bs.back++;s.ev.push({k:'pback',x:p.x,z:p.z});dmg(s,null,b,P.bdmg,'phit');}}
      else{const v=P.bv*DT;p.x+=dx/l*v;p.z+=dz/l*v;}}
    else if(p.w>0)p.w--;
    else{p.x+=p.dx*P.v*DT;p.z+=p.dz*P.v*DT;p.d+=P.v*DT;
      for(const t of s.u)if(!gone&&t.side==='p'&&!t.dead&&Math.hypot(t.x-p.x,t.z-p.z)<L.u[t.kind].rad+0.3){gone=1;dmg(s,null,t,P.dmg,'shit');}
      if(!gone&&(p.d>10||sdU(s,p.x,p.z)[0]>0)){gone=1;s.ev.push({k:'fizz',x:p.x,z:p.z,t:'pearl'});}}
    if(gone)s.pearls.splice(i,1);}}
function swings(s){
  for(const u of s.u){if(u.dead||u.sw<=0)continue;u.sw--;
    if(u.sw===6){if(u.tg>=100){const o=s.ob[u.tg-100];if(o&&!o.gone&&sdn(o,u.x,u.z)[0]<=L.u.cap.rng+0.4)hitCrate(s,u.tg-100,1);continue;}
      const t=s.u[u.tg];if(t&&!t.dead&&dist(u,t)<=reach(u,t)+0.5)dmg(s,u,t,L.u[u.kind].atk,'hit');if(u.kind==='bat')u.rt=20;}}
}
function ringsT(s){
  for(let i=s.rings.length-1;i>=0;i--){const r=s.rings[i];if(++r.t<r.dur)continue;
    s.rings.splice(i,1);s.ev.push({k:'boom',x:r.x,z:r.z,kind:r.kind});const dm=r.kind==='drop'?K.drop.dmg:L.ring.dmg;
    for(const t of s.u)if(t.side==='p'&&!t.dead&&Math.hypot(t.x-r.x,t.z-r.z)<=r.r+0.2)dmg(s,null,t,dm,'rhit');
    for(let j=0;j<s.ob.length;j++){const o=s.ob[j];if(o.hp&&!o.chest&&!o.gone&&sdn(o,r.x,r.z)[0]<=r.r)hitCrate(s,j,2);}}
}
function separate(s){
  const U=s.u;
  for(let i=0;i<U.length;i++){const a=U[i];if(a.dead)continue;
    for(let j=i+1;j<U.length;j++){const b=U[j];if(b.dead)continue;
      const ra=L.u[a.kind].rad,rb=L.u[b.kind].rad;let dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
      if(d>=ra+rb)continue;if(d<1e-4){dx=1;dz=(i-j)*0.1;d=Math.hypot(dx,dz);}
      const o=(ra+rb-d)/d,wa=rb/(ra+rb),wb=ra/(ra+rb);a.x-=dx*o*wa;a.z-=dz*o*wa;b.x+=dx*o*wb;b.z+=dz*o*wb;}}
  for(const u of U){if(u.dead)continue;const ra=L.u[u.kind].rad;
    for(const o of s.ob){if(o.gone)continue;const q=sdn(o,u.x,u.z);if(q[0]<ra){u.x+=q[1]*(ra-q[0]);u.z+=q[2]*(ra-q[0]);const vn=u.vx*q[1]+u.vz*q[2];if(vn<0){u.vx-=vn*q[1];u.vz-=vn*q[2];}}}
    const q=sdU(s,u.x,u.z);if(q[0]>-ra){const k=q[0]+ra;u.x-=q[1]*k;u.z-=q[2]*k;const vn=u.vx*q[1]+u.vz*q[2];if(vn>0){u.vx-=vn*q[1];u.vz-=vn*q[2];}}}
}
function startNet(s){
  const tg=[1,2].filter(i=>!s.u[i].dead);if(!tg.length)tg.push(0);
  s.net={t:L.net.dur,tg,th:[]};for(const id of tg)for(let a=0;a<L.net.per;a++)s.net.th.push({u:id,a,cut:false});
  s.rings=[];s.shots=[];s.bs.st='net';for(const u of s.u){u.sw=0;u.vx=u.vz=0;}s.ev.push({k:'net'});}
function netTick(s){
  const n=s.net;n.t--;if(!n.th.every(x=>x.cut)&&n.t>0)return;
  let free=0;for(const id of n.tg){if(n.th.every(x=>x.u!==id||x.cut))free++;else s.u[id].bound=L.net.bind;}
  const res=free===n.tg.length?'gut':free>0?'mittel':'schlecht';s.stats.net=res;
  if(res==='gut'){s.bs.st='stun';s.bs.pt=L.net.stun;}else s.bs.st='move';
  s.bs.ring=Math.max(s.bs.ring,60);s.ev.push({k:'netEnd',res,free,n:n.tg.length,th:n.th});s.net=null;}
function rooms(s){const cap=s.u[0],n=s.R.length;
  s.R.forEach((q,i)=>{if(!q.act&&Math.hypot(cap.x-q.x,cap.z-q.z)<q.r-0.3)wake(s,i);
    if(q.act&&!q.cl&&i<n-1&&!s.u.some(u=>u.side==='e'&&!u.dead&&u.room===i)){q.cl=true;s.ev.push({k:'clear',i});
      s.ob.forEach((o,j)=>{if(o.gate===i&&!o.gone){o.gone=true;s.ev.push({k:'gate',i:j});}});
      for(const j of[1,2]){const m=s.u[j];if(m.dead){m.dead=false;m.hp=Math.round(m.max*0.3);m.bound=0;s.ev.push({k:'revive',id:j});}}
      // Verschnaufpause: Crew heilt etwas
      for(const u of s.u)if(u.side==='p'&&!u.dead){const n=Math.min(Math.round(u.max*K.rest),u.max-u.hp);if(n>0){u.hp+=n;s.ev.push({k:'heal',id:u.id,n,x:u.x,z:u.z});}}}});}
function phase(s){const b=s.u[s.bi],bs=s.bs;if(b.dead||!b.act)return;const f=b.hp/b.max;
  if(s.boss==='marlo'){if(s.ph===1&&f<=L.net.at){s.ph=2;startNet(s);}else if(s.ph===2&&f<=L.rage.at){s.ph=3;bs.wind=L.wind.first;bs.shot=Math.max(bs.shot,40);s.ev.push({k:'rage'});}}
  else if(s.boss==='toni'){if(s.ph===1&&f<=0.5){s.ph=2;bs.t3=K.toni.rk.first;s.ev.push({k:'rage'});}}
  else{const P=K.perla;P.call.forEach((c,k)=>{if(f<=c&&!(bs.called>>k&1)){bs.called|=1<<k;
      for(const sd of[-1,1]){const a=b.h+sd*1.4;mk(s,'e','crab',0,b.x+Math.cos(a)*1.3,b.z+Math.sin(a)*1.3,s.R.length-1).act=true;}s.ev.push({k:'call'});}});
    if(!bs.rained&&f<=P.rain.at&&bs.st==='shut'){s.ph=2;startRain(s,b);}}}
function step(s,inputs){
  if(s.over)return s;
  s.ev=[];const U=s.u,cap=U[0],b=U[s.bi];
  for(const i of inputs||[])inp(s,i);
  if(s.net)netTick(s);
  else{
    if(s.kcd>0)s.kcd--;
    for(const u of U){if(u.dead)continue;if(u.cd>0)u.cd--;if(u.bound>0&&--u.bound===0)s.ev.push({k:'free',id:u.id});}
    if(!cap.bound){const v=L.u.cap.v;if(s.mv)accel(cap,s.mx*v,s.mz*v,v);else go(s,cap,s.tx,s.tz,v,0.08);
      const f=s.focus>=0?U[s.focus]:null,t=f&&!f.dead&&dist(cap,f)<=reach(cap,f)?f:near(s,cap,'e',1.7);if(t)tryAtk(s,cap,t);else tryCrate(s,cap);}
    mateAI(s,U[1]);mateAI(s,U[2]);
    for(let i=3;i<U.length;i++){const u=U[i];if(u.dead||!u.act)continue;if(i===s.bi)(s.boss==='toni'?toniAI:s.boss==='perla'?perlaAI:marloAI)(s,u);else monAI(s,u);}
    swings(s);shotsT(s);ringsT(s);pearlsT(s);separate(s);rooms(s);phase(s);
  }
  s.step++;
  if(cap.dead||b.dead||s.step>=MAXSTEP){s.over=true;s.winner=b.dead&&!cap.dead?'p':'e';s.ev.push({k:'end',winner:s.winner});}
  let h=s.hash;const mix=v=>{h^=Math.round(v*1e4)|0;h=Math.imul(h,16777619)>>>0;};
  for(const u of U){mix(u.x);mix(u.z);mix(u.hp);mix(u.bound);mix(u.ult);}
  for(const p of s.shots){mix(p.x);mix(p.z);}for(const p of s.pearls){mix(p.x);mix(p.z);}for(const o of s.ob)if(o.hp)mix(o.hp);
  mix(s.r);mix(s.rings.length);mix(s.bs.pt);mix(s.focus);mix(s.loot.gold);s.hash=h;
  return s;
}
function summary(s){const l=s.loot;return {winner:s.winner,steps:s.step,hp:s.u.map(u=>u.hp).join('/'),loot:[l.gold,l.pl,l.ei,l.se,l.chests].join('/'),hash:s.hash.toString(16)};}
function simulate(seed,inputs,o){
  const s=create(seed,o);let ip=0;const list=inputs.slice().sort((a,b)=>a.step-b.step);
  while(!s.over){const now=[];while(ip<list.length&&list[ip].step===s.step)now.push(list[ip++]);while(ip<list.length&&list[ip].step<s.step)ip++;step(s,now);}
  return summary(s);}
return {HZ,DT,K,create,step,simulate,summary,sdU,zone,nav};
})();
if(typeof module!=='undefined')module.exports=HK;
/*HEND*/
