// Bot fuer die Hoehle (Logik steckt in neu/landgang.html zwischen /*HLOGIC*/ und /*HEND*/): laeuft durch, haut, kontert, schneidet, wirft Perlen zurueck
const fs=require('fs');
function load(f){const src=fs.readFileSync(f,'utf8');const a=src.slice(src.indexOf('/*LOGIC*/'),src.indexOf('/*END*/'));
  const hk=f.endsWith('.js')?src:src.slice(src.indexOf('/*HLOGIC*/'),src.indexOf('/*HEND*/'));return a;}
const file=process.env.LG||"/home/claude/grandline/neu/landgang.html", hkf=process.env.HKF||file;
const lkSrc=load(file);const src2=fs.readFileSync(hkf,'utf8');const hkSrc=hkf.endsWith('.js')?src2:src2.slice(src2.indexOf('/*HLOGIC*/'),src2.indexOf('/*HEND*/'));
const m={};new Function('m',lkSrc+';'+hkSrc+';m.LK=LK;m.HK=HK;')(m);const {LK,HK}=m;
function bot(seed,o,verbose){
  const s=HK.create(seed,o),rec=[];let lastT='';
  while(!s.over){const now=[],st=s.step,cap=s.u[0],U=s.u;
    if(s.net){s.net.th.forEach((t,k)=>{if(!t.cut&&st%5===k%5)now.push({step:st,type:'cut',k});});}
    else{
      for(const p of s.pearls)if(!p.back&&p.w===0&&p.d>0.6&&st%4===p.id%4)now.push({step:st,type:'tap',k:p.id});
      if(st%8===0){let tx,tz;
        const en=U.filter(u=>u.side==='e'&&!u.dead&&u.act).sort((a,b)=>Math.hypot(a.x-cap.x,a.z-cap.z)-Math.hypot(b.x-cap.x,b.z-cap.z));
        const danger=s.rings.find(r=>Math.hypot(r.x-cap.x,r.z-cap.z)<r.r+0.5&&r.t>-3);
        const cr=s.ob.map((o,i)=>[o,i]).filter(([o])=>o.hp&&!o.gone&&HK.zone(s,o.x,o.z)<=2*s.R.findIndex(q=>!q.cl)&&Math.hypot(o.x-cap.x,o.z-cap.z)<9).sort((a,b)=>Math.hypot(a[0].x-cap.x,a[0].z-cap.z)-Math.hypot(b[0].x-cap.x,b[0].z-cap.z));
        if(danger){const dx=cap.x-danger.x,dz=cap.z-danger.z,l=Math.hypot(dx,dz)||1;tx=cap.x+dx/l*2;tz=cap.z+dz/l*2;}
        else if(en.length){const e=en[0];tx=e.x+(cap.x-e.x)*0.2;tz=e.z+(cap.z-e.z)*0.2;}
        else if(cr.length&&s.R.findIndex(q=>!q.cl)>=0){const o=cr[0][0];tx=o.x;tz=o.z+0.9;}
        else{const i=s.R.findIndex(q=>!q.act);const q=s.R[i<0?s.R.length-1:i];tx=q.x;tz=q.z;}
        now.push({step:st,type:'steer',x:LK.r2(tx),y:LK.r2(tz)});}
      for(let i=0;i<3;i++)if(U[i].ult>=100&&!U[i].dead&&!U[i].bound)now.push({step:st,type:'ult',i});
      if(s.bs.st==='wind'&&s.bs.pt<18&&st%3===0)now.push({step:st,type:'counter'});}
    rec.push(...now);HK.step(s,now);
    if(verbose&&st%300===0)console.log(st,'cap',cap.hp,'room',HK.zone(s,cap.x,cap.z),'boss',U[s.bi].hp,s.bs.st);}
  const a=HK.summary(s),b=HK.simulate(seed,rec,o),c=HK.simulate(seed,rec,o);
  return {a,ok:JSON.stringify(a)===JSON.stringify(b)&&JSON.stringify(b)===JSON.stringify(c),n:s.R.length,st:s.stats,rec};
}
if(require.main===module){
  for(const boss of ['marlo','toni','perla'])for(const seed of [1,7,12345])for(const tier of [0,2]){
    const r=bot(seed,{boss,tier},process.env.V);console.log(boss,seed,'t'+tier,'rooms',r.n,JSON.stringify(r.a),'replay',r.ok,'sec',(r.a.steps/30).toFixed(0),'ctr',r.st.counters,'back',r.st.back,'net',r.st.net);}
}
module.exports={bot,HK,LK};
