// C4 Barock-Bund + Gegenwind: Varianten A/B fürs Board (Node: node tools/pixel-probe/c4-barock.js <ziel.html>)
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const sk = '#f2c9a0';
const V = {
  bonclay: { n: 'Mimo', f: 'baroque', m: 'Federboa, Spitzenschuhe',
    a: { hairStyle: 'buerste', hair: '#1a1a1a', skin: sk, shirt: '#f4f0e8', pants: '#e8789a', scarf: '#f080b0', x: ['boa', 'spitzenschuhe'] },
    b: { hairStyle: 'dutt', hair: '#3a2a5a', skin: sk, shirt: '#f0e8f0', pants: '#e8789a', scarf: '#e85a8a', x: ['boa', 'spitzenschuhe'] } },
  mr5: { n: 'Herr Freitag', f: 'baroque', m: 'Kappe, gelbe Weste, Ruß',
    a: { hair: '#1a1a1a', skin: sk, shirt: '#e8e8e8', pants: '#3a3a3a', hat: 'cap', hatColor: '#2a2a2a', coat: '#e8c040', x: ['mantel', 'russ'] },
    b: { hairStyle: 'buerste', hair: '#3a3a3a', skin: sk, shirt: '#e8e0d0', pants: '#3a3a3a', acc: 'brille', coat: '#d8a030', x: ['mantel', 'russ', 'dampf'] } },
  vivi: { n: 'Vina', f: 'baroque', m: 'himmelblaue Zöpfe, Wüstenschleier',
    a: { hairStyle: 'zoepfe', hair: '#6fc6e0', skin: sk, shirt: '#e8e0f0', pants: '#7a5aa0', x: ['schleier'] },
    b: { hair: '#5ab0d8', skin: sk, shirt: '#f0e0c0', pants: '#c8a060', longHair: true, acc: 'ohrring', x: ['schleier'] } },
  mr1: { n: 'Herr Sonntag', f: 'baroque', m: 'grauer Anzug, Fingerklingen',
    a: { hairStyle: 'buerste', hair: '#1a1a1a', skin: '#a8785a', shirt: '#6a6a72', pants: '#5a5a62', x: ['klingen'] },
    b: { hairStyle: 'buerste', hair: '#e8e8e8', skin: '#e8c0a0', shirt: '#4a4a52', pants: '#4a4a52', coat: '#6a6a72', x: ['mantel', 'klingen'] } },
  crocodile: { n: 'Sirokk', f: 'baroque', m: 'Pelzkragen, Sanduhr, Narbe',
    a: { hair: '#111111', skin: sk, shirt: '#8a6d2f', pants: '#222222', coat: '#3a2a2a', scarf: '#5a4a3a', x: ['mantel', 'pelz', 'sanduhr', 'narbequer'] },
    b: { hairStyle: 'buerste', hair: '#c8a060', skin: '#d9a87a', shirt: '#2a2a2a', pants: '#222222', coat: '#7a1f35', scarf: '#e8d8b0', acc: 'narbe', x: ['mantel', 'pelz', 'sanduhr'] } },
  sabo: { n: 'Jorin', f: 'revolution', m: 'Zylinder mit Schutzbrille, Gehrock',
    a: { hair: '#f0d070', skin: sk, shirt: '#e8e8e8', pants: '#e8e8e8', hat: 'tophat', hatColor: '#2a2a3a', coat: '#2a4a8a', acc: 'narbe', x: ['mantel', 'schutzbrille'] },
    b: { hair: '#3a2a20', skin: sk, shirt: '#e8e0d0', pants: '#3a3a3a', hat: 'tophat', hatColor: '#7a1f35', coat: '#2f5a4a', x: ['mantel', 'schutzbrille'] } },
  ivankov: { n: 'Lila', f: 'revolution', m: 'Haarwolke, Federkragen, Lippenstift',
    a: { hair: '#9a5ac8', skin: '#f6d8c0', shirt: '#e85a8a', pants: '#2a2a2a', hat: 'afro', scarf: '#f4a0c0', x: ['federkragen', 'lippen'] },
    b: { hair: '#ece4f4', skin: '#f6d8c0', shirt: '#7a1f35', pants: '#2a2a2a', hat: 'afro', scarf: '#d9a640', x: ['federkragen', 'lippen'] } },
  koala: { n: 'Tilda', f: 'revolution', m: 'orange Haare, Kappe, Notizbuch',
    a: { hair: '#e8a060', skin: '#f6d8c0', shirt: '#e8e8e8', pants: '#3a5a8a', hat: 'cap', hatColor: '#e8a040', longHair: true, x: ['notizbuch'] },
    b: { hairStyle: 'zoepfe', hair: '#d87a3a', skin: '#f6d8c0', shirt: '#e8e8e8', pants: '#3a5a8a', hat: 'cap', hatColor: '#8fb08a', x: ['notizbuch'] } },
  dragon: { n: 'Rian', f: 'revolution', m: 'Kapuze, Gesichtstattoo',
    a: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#2f5a3a', pants: '#2a2a2a', hat: 'hood', hatColor: '#2f5a3a', x: ['tattoo'] },
    b: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#3a4a3a', pants: '#2a2a2a', hat: 'hood', hatColor: '#5a6a50', scarf: '#7a1f35', x: ['schal', 'windwirbel'] } }
};
module.exports = V;
if (require.main === module) {
  const out = process.argv[2] || 'barock.html', B = v => v.f + '_schleife';
  const fig = (svg, cap) => `<figure>${svg}<figcaption>${cap}</figcaption></figure>`;
  let h = '';
  Object.keys(V).forEach(id => {
    const v = V[id];
    h += `<section><h2>${v.n} <small>${v.f === 'revolution' ? 'Gegenwind · ' : ''}${v.m}</small></h2><div class="row">`;
    ['a', 'b'].forEach(k => { h += `<div class="var"><b>${k.toUpperCase()}</b>` + ['normal', 'froh', 'sauer', 'muede'].map(md => fig(P.shaded(v[k], md, B(v)), md)).join('') + '</div>'; });
    h += '</div></section>';
  });
  h += '<section><h2>Abzeichen <small>Bordeaux mit Gold, Gegenwind mit Salbei</small></h2><div class="row">';
  [['schleife', 'Halsschleife'], ['guertel', 'Gürtel']].forEach(([b, n]) => { h += `<div class="var"><b>${n}</b>` + fig(P.shaded(V.mr1.a, 'normal', 'baroque_' + b), 'Barock') + fig(P.shaded(V.sabo.b, 'normal', 'revolution_' + b), 'Gegenwind') + '</div>'; });
  h += '</div></section><section><h2>Kampfgröße <small>B</small></h2><div class="row small">' + Object.keys(V).map(id => fig(P.shaded(V[id].b, 'normal', B(V[id])), V[id].n)).join('') + '</div></section>';
  require('fs').writeFileSync(out, h);
}
