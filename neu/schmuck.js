// Schiffsschmuck fuer die Neue Welt (welt.html + seekampf.html). Nur Optik, kein Einfluss auf Kaempfe oder Replays.
// Vorlage: js/data/shipparts.js aus der alten Version (Segel, Rumpf, Flagge, Galionsfigur), Preise in Hafen-Gold.
// Look als String "segel.rumpf.flagge.figur", z. B. "streifen.eiche.rot.schaf".
(function(){
'use strict';
const D={
  sail:[
    {id:'weiss',n:'Leinen',c:'#fbf6ea',p:0},
    {id:'flicken',n:'Geflickt',c:'#efe2c6',c2:'#b9894f',pat:'flicken',p:60},
    {id:'streifen',n:'Rot gestreift',c:'#f1eee8',c2:'#d0574a',pat:'streifen',p:90},
    {id:'himmel',n:'Himmelblau',c:'#cfe3f2',c2:'#8ab6d6',pat:'streifen',p:120},
    {id:'sonne',n:'Sonnensegel',c:'#f6dc8a',c2:'#e0a030',pat:'stern',p:200},
    {id:'kirsch',n:'Kirschblüte',c:'#f8d4e0',c2:'#e870a0',pat:'flicken',p:250},
    {id:'nacht',n:'Nachtsegel',c:'#3a3550',c2:'#f2d24a',pat:'stern',p:320}],
  hull:[
    {id:'eiche',n:'Eiche',side:'#b07a44',bot:'#8a5a30',bulw:'#8a5a30',band2:'#5e3b1d',p:0},
    {id:'hell',n:'Birke',side:'#d6aa72',bot:'#b88a5a',bulw:'#b88a5a',band2:'#6b4a32',p:100},
    {id:'rot',n:'Kirschholz',side:'#a8483a',bot:'#8a3a2e',bulw:'#8a3a2e',band2:'#4a1e18',p:180},
    {id:'gruen',n:'Meeresgrün',side:'#4f8a72',bot:'#3f6b5a',bulw:'#3f6b5a',band2:'#203a30',p:180},
    {id:'gold',n:'Goldbeschlag',side:'#b07a44',bot:'#8a5a30',bulw:'#8a5a30',band2:'#e0b040',p:350},
    {id:'schwarz',n:'Schwarzholz',side:'#3a322c',bot:'#2a2420',bulw:'#2a2420',band2:'#c9a95a',p:420}],
  flag:[
    {id:'rot',n:'Rote Flagge',c:'#d8433a',p:0},
    {id:'schwarz',n:'Klassisch',c:'#26201c',p:50},
    {id:'marke',n:'Meerflagge',c:'#2f7a8a',big:1,p:140},
    {id:'gross',n:'Große Flagge',c:'#26201c',big:1,p:160},
    {id:'gruft',n:'Gruftflagge',c:'#5a2a7a',big:1,p:200},
    {id:'gold',n:'Goldflagge',c:'#e0a030',big:1,p:260}],
  deco:[
    {id:'keine',n:'Ohne',p:0},
    {id:'laterne',n:'Laterne',p:80},
    {id:'schaf',n:'Schäfchen',p:150},
    {id:'loewe',n:'Löwenkopf',p:260},
    {id:'drache',n:'Seedrache',p:420}]};
const CATS=['sail','hull','flag','deco'];
const get=(cat,id)=>D[cat].find(x=>x.id===id)||D[cat][0];
function parse(s){const a=String(s||'').split('.'),L={};CATS.forEach((c,i)=>{L[c]=get(c,a[i]).id;});return L;}
const str=L=>CATS.map(c=>get(c,L&&L[c]).id).join('.');
const dark=(c,k)=>{const n=parseInt(c.slice(1),16),f=v=>Math.round(v*(1-k)).toString(16).padStart(2,'0');return '#'+f(n>>16)+f((n>>8)&255)+f(n&255);};
// Segel-Muster als 16x16-Pixelbild (auch fuer die Werft-Kacheln)
const STAR=['...x...','..xxx..','xxxxxxx','.xxxxx.','..xxx..','.xx.xx.','.x...x.'];
function sailCanvas(d,cv){const c=cv||document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');
  x.fillStyle=d.c;x.fillRect(0,0,16,16);x.fillStyle=d.c2||d.c;
  if(d.pat==='streifen')for(const y of[2,3,7,8,12,13])x.fillRect(0,y,16,1);
  else if(d.pat==='flicken'){x.fillRect(2,2,5,5);x.fillRect(9,9,5,4);x.fillStyle=dark(d.c2,0.35);
    for(const[a,b]of[[2,2],[4,2],[6,2],[2,6],[4,6],[6,6],[9,9],[11,9],[13,9],[9,12],[11,12],[13,12]])x.fillRect(a,b,1,1);}
  else if(d.pat==='stern')STAR.forEach((r,y)=>{for(let i=0;i<7;i++)if(r[i]==='x')x.fillRect(4+i,5+y,1,1);});
  return c;}
const texC={};
function sailTex(T,d){if(!texC[d.id]){const t=new T.CanvasTexture(sailCanvas(d));t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;texC[d.id]=t;}return texC[d.id];}
// Galionsfigur am Bug (Koerper-Koordinaten des Schiffs, Bug bei x ~ 1.65)
function decoGroup(H,id){
  const T=H.THREE,g=new T.Group(),{M,mesh,box,cyl,ico}=H,ad=(m,x,y,z)=>{m.position.set(x,y,z||0);g.add(m);return m;};
  if(id==='laterne'){ad(mesh(box(0.04,0.28,0.04),M('#3f2628')),1.6,0.66);ad(mesh(box(0.2,0.04,0.04),M('#3f2628')),1.68,0.8);
    ad(mesh(box(0.11,0.13,0.11),H.lanternMat?H.lanternMat():new T.MeshBasicMaterial({color:new T.Color('#ffe28a')}),false),1.76,0.72);ad(mesh(box(0.14,0.03,0.14),M('#3f2628')),1.76,0.8);}
  else if(id==='schaf'){ad(mesh(ico(0.15),M('#f4f0e0')),1.56,0.66);ad(mesh(ico(0.09),M('#f4f0e0')),1.48,0.74,0.08);
    ad(mesh(box(0.11,0.13,0.1),M('#2b1d14')),1.71,0.7);for(const s of[-1,1])ad(mesh(box(0.03,0.04,0.07),M('#2b1d14')),1.69,0.75,s*0.08);
    for(const s of[-1,1])ad(mesh(box(0.02,0.02,0.02),M('#fbf6ea'),false),1.77,0.72,s*0.03);}
  else if(id==='loewe'){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ad(mesh(ico(0.07),M('#c08a2a')),1.64,0.64+Math.sin(a)*0.11,Math.cos(a)*0.11);}
    ad(mesh(box(0.15,0.15,0.14),M('#f2c94a')),1.7,0.64);ad(mesh(box(0.05,0.04,0.05),M('#2b1d14')),1.79,0.61);
    for(const s of[-1,1])ad(mesh(box(0.02,0.03,0.03),M('#2b1d14'),false),1.78,0.68,s*0.04);}
  else if(id==='drache'){const gr=M('#5c9a42');const n=ad(mesh(cyl(0.04,0.065,0.44),gr),1.7,0.7);n.rotation.z=-0.65;
    ad(mesh(box(0.2,0.1,0.11),gr),1.9,0.88);ad(mesh(box(0.08,0.04,0.09),M('#3f7a2e')),2.02,0.85);
    for(const s of[-1,1]){ad(mesh(box(0.03,0.03,0.02),M('#f2d24a'),false),1.93,0.92,s*0.055);const h=ad(mesh(cyl(0.005,0.02,0.1,4),M('#f2d24a')),1.84,0.97,s*0.035);h.rotation.z=0.5;}}
  return g;}
// Look ans Schiff haengen. o = {body, hull, flag, sails:[...]}, H = Helfer der Seite {THREE,M,mesh,box,cyl,ico,hullGeo,lanternMat?}
function apply(H,o,L){
  const T=H.THREE,sd=get('sail',L.sail),hd=get('hull',L.hull),fd=get('flag',L.flag);
  for(const m of o.sails){const mt=m.material;if(sd.pat){mt.map=sailTex(T,sd);mt.color.set('#ffffff');}else{mt.map=null;mt.color.set(sd.c);}mt.needsUpdate=true;}
  if(o.hull&&H.hullGeo&&o.hullKey!==hd.id){const old=o.hull.geometry;
    o.hull.geometry=H.hullGeo(Object.assign({L:3.3,B:0.58,yk:-0.42,yt:0.32,sheer:0.18,band:0.13,deck:'#c38c52',transom:'#5e3b1d'},{side:hd.side,bot:hd.bot,bulw:hd.bulw,band2:hd.band2}));old.dispose();o.hullKey=hd.id;}
  if(o.flag){o.flag.material.color.set(fd.c);o.flag.scale.set(fd.big?1.45:1,fd.big?1.35:1,1);}
  if(o.deco){o.body.remove(o.deco);o.deco.traverse(m=>{if(m.geometry)m.geometry.dispose();});o.deco=null;}
  if(L.deco!=='keine'){o.deco=decoGroup(H,L.deco);o.body.add(o.deco);}
}
window.GLS={D,CATS,get,parse,str,apply,sailCanvas,dark};
})();
