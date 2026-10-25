// C4 Schattenkorps: Varianten A/B fürs Board (Node: node tools/pixel-probe/c4-schattenkorps.js <ziel.html>)
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const sk = '#f2c9a0';
const V = {
  kalifa: { n: 'Kalina', m: 'Brille, Locken, Aktenmappe',
    a: { hairStyle: 'locken', hair: '#e8c050', skin: sk, shirt: '#2a2a2a', pants: '#2a2a2a', acc: 'brille', x: ['mappe'] },
    b: { hairStyle: 'bob', hair: '#c86a3a', skin: sk, shirt: '#3a3048', pants: '#2a2a2a', acc: 'brille', x: ['mappe', 'schaum'] } },
  kumadori: { n: 'Kordo', m: 'Bühnen-Schminke, hohe Tolle',
    a: { hairStyle: 'tolle', hair: '#d84a2a', skin: '#f0f0f0', shirt: '#e8b030', pants: '#7a3a2a', x: ['schminke'] },
    b: { hairStyle: 'tolle', hair: '#5a3a8a', skin: '#f0e6d8', shirt: '#3a3048', pants: '#2a2a2a', x: ['schminke', 'faecher'] } },
  blueno: { n: 'Riegel', m: 'Hut mit Band, Schlüsselbund',
    a: { hair: '#1a1a1a', skin: '#e8c0a0', shirt: '#1a1a1a', pants: '#1a1a1a', hat: 'melone', hatColor: '#5a4632', x: ['schluessel'] },
    b: { hairStyle: 'buerste', hair: '#7a7a7a', skin: '#e8c0a0', shirt: '#2e2a3a', pants: '#1a1a1a', x: ['schluessel', 'kette'] } },
  jabra: { n: 'Wolfram', m: 'Mähne, Klauenhandschuhe',
    a: { hair: '#1a1a1a', skin: '#d9a87a', shirt: '#2a2a2a', pants: '#2a2a2a', longHair: true, x: ['klauen'] },
    b: { hairStyle: 'stachel', hair: '#6a6a72', skin: '#d9a87a', shirt: '#3a3048', pants: '#2a2a2a', longHair: true, x: ['klauen'] } },
  'rob-lucci': { n: 'Krall', m: 'Kappe mit Öhrchen, weißes Hemd',
    a: { hair: '#222222', skin: sk, shirt: '#e8e8e8', pants: '#222222', hat: 'ohrenkappe', hatColor: '#222222' },
    b: { hairStyle: 'bob', hair: '#222222', skin: sk, shirt: '#e8e8e8', pants: '#2e2a3a', hat: 'ohrenkappe', hatColor: '#3a3048', coat: '#2a2a2a', x: ['mantel'] } },
  kaku: { n: 'Stelz', m: 'weiße Kappe, hohe Stiefel',
    a: { hair: '#8a5a2a', skin: sk, shirt: '#222222', pants: '#222222', hat: 'cap', hatColor: '#f0f0f0', x: ['stiefel'] },
    b: { hairStyle: 'zopf', hair: '#c8703a', skin: sk, shirt: '#2e2a3a', pants: '#222222', hat: 'cap', hatColor: '#e8e0d0', x: ['stiefel', 'schwertruecken'] } },
  fukuro: { n: 'Plapper', m: 'Mund zu, Bart',
    a: { hair: '#2a2a2a', skin: sk, shirt: '#2a2a2a', pants: '#2a2a2a', beard: '#3a3a3a', x: ['reissverschluss'] },
    b: { hairStyle: 'glatze', hair: '#2a2a2a', skin: sk, shirt: '#3a3048', pants: '#2a2a2a', beard: '#5a4a3a', x: ['mundpflaster'] } }
};
module.exports = V;
if (require.main === module) {
  const B = 'cp9_krawatte', out = process.argv[2] || 'schatten.html';
  const fig = (svg, cap, cls) => `<figure class="${cls || ''}">${svg}<figcaption>${cap}</figcaption></figure>`;
  let h = '';
  Object.keys(V).forEach(id => {
    const v = V[id];
    h += `<section><h2>${v.n} <small>${v.m}</small></h2><div class="row">`;
    ['a', 'b'].forEach(k => {
      h += `<div class="var"><b>${k.toUpperCase()}</b>` + ['normal', 'froh', 'sauer', 'muede'].map(md => fig(P.shaded(v[k], md, B), md)).join('') + '</div>';
    });
    h += '</div></section>';
  });
  h += '<section><h2>Abzeichen <small>Nachtviolett</small></h2><div class="row">';
  ['cp9_krawatte', 'cp9_nadel'].forEach(b => { h += fig(P.shaded(V['rob-lucci'].a, 'normal', b), b === 'cp9_krawatte' ? 'Krawatte' : 'Anstecknadel') + fig(P.shaded(V.blueno.a, 'normal', b), ''); });
  h += '</div></section><section><h2>Kampfgröße <small>A</small></h2><div class="row small">' + Object.keys(V).map(id => fig(P.shaded(V[id].a, 'normal', B), V[id].n)).join('') + '</div></section>';
  require('fs').writeFileSync(out, h);
}
