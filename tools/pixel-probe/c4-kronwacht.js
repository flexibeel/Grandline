// C4 Kronwacht: Varianten A/B fürs Board (Node: node tools/pixel-probe/c4-kronwacht.js schreibt kron.html)
global.window=global; global.GL=global.GL||{data:{}};
require('../../js/ui/sprites.js');
const P=GL.sprites.p24;
const V={
 garp:{n:'Grimm',a:{hairStyle:'glatze',hair:'#e8e8e8',skin:'#e8b890',shirt:'#f0f0f0',pants:'#1f3a6a',coat:'#24406e',x:['mantel','keksdose','schnauzer']},
        b:{hair:'#e8e8e8',skin:'#e8b890',shirt:'#24406e',pants:'#1f3a6a',hat:'zweispitz',hatColor:'#24406e',x:['keksdose','schnauzer']}},
 hina:{n:'Hilde',a:{hairStyle:'dutt',hair:'#e870a0',skin:'#f2c9a0',shirt:'#f0f0f0',pants:'#1f3a6a',x:['handschellen']},
        b:{hair:'#8a2f4a',skin:'#f2c9a0',shirt:'#f0f0f0',pants:'#1f3a6a',hairStyle:'zopf',x:['kette','handschellen']}},
 tashigi:{n:'Tessa',a:{hairStyle:'zopf',hair:'#7a4a2a',skin:'#f2c9a0',shirt:'#e8d8b0',pants:'#2a3a5a',acc:'brille',x:['schwertruecken']},
        b:{hairStyle:'bob',hair:'#2f6a6a',skin:'#f2c9a0',shirt:'#e8d8b0',pants:'#2a3a5a',acc:'brille',x:['dreigriffe']}},
 koby:{n:'Kian',a:{hair:'#e0c070',skin:'#f2c9a0',shirt:'#f0f0f0',pants:'#5a7aa0',hat:'grosskappe',hatColor:'#f4f4f4',x:['pflaster']},
        b:{hairStyle:'stachel',hair:'#5fbfa0',skin:'#f2c9a0',shirt:'#f0f0f0',pants:'#5a7aa0',hat:'grosskappe',hatColor:'#f4f4f4'}},
 smoker:{n:'Russ',a:{hairStyle:'buerste',hair:'#e8e8e8',skin:'#f2c9a0',shirt:'#e8e0d0',pants:'#3a4a3a',coat:'#5a6a58',acc:'pfeife',x:['mantel','dampf']},
        b:{hairStyle:'buerste',hair:'#3a3a3a',skin:'#f2c9a0',shirt:'#5a6a58',pants:'#3a4a3a',x:['kessel','dampf']}},
 aokiji:{n:'Reif',a:{hair:'#2a2a3a',skin:'#c89a70',shirt:'#e8f0f8',pants:'#a8c8e0',hat:'zipfel',hatColor:'#8ac0e8',scarf:'#5a90c8',x:['schal']},
        b:{hair:'#f0f4f8',skin:'#c89a70',shirt:'#a8c8e0',pants:'#e8f0f8',hat:'ohrenschuetzer',hatColor:'#8ac0e8',x:['eiszapfen']}}
};
module.exports=V;
if(require.main===module){
let h='<meta charset=utf8><style>body{background:#2c3e4a;color:#eee;font:13px sans-serif}figure{display:inline-block;margin:6px;text-align:center}svg{width:112px;height:128px;background:#3c5262}</style>';
Object.keys(V).forEach(id=>{['a','b'].forEach(k=>{h+=`<figure>${P.flat(V[id][k],'marine_schaerpe')}<figcaption>${V[id].n} ${k.toUpperCase()}</figcaption></figure>`;});});
h+='<br>';['marine_schaerpe','marine_abzeichen'].forEach(b=>h+=`<figure>${P.flat(V.garp.b,b)}<figcaption>${b}</figcaption></figure>`);
require('fs').writeFileSync('kron.html',h);}
