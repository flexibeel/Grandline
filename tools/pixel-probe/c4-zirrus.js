// C4 Einzelgänger Zirrus: Varianten A/B/C fürs Board (Node: node tools/pixel-probe/c4-zirrus.js <ziel.html>)
// Ohne Fraktion, also ohne Abzeichen. Alle drei bewusst weg vom Vorbild: kein Trommelring im Rücken, kein Stirnband, keine langen Ohrläppchen.
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const V = {
  a: { t: 'Goldener Himmelsherr', m: 'nah an der Liste: weiße Stacheln, goldenes Gewand, Blitzstab, steht auf einer Wolke',
    l: { hairStyle: 'stachel', hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#e8b030', pants: '#f4ecd8', x: ['blitzstab', 'wolke'] } },
  b: { t: 'Schönwetterwolke', m: 'eigenständig: himmelblauer Dutt, weißes Hemd, blauer Mantel, Wolkenkragen, kleine Blitze',
    l: { hairStyle: 'dutt', hair: '#b8d8f0', skin: '#e8c0a0', shirt: '#f4f4f0', pants: '#3a5a8a', coat: '#5a8ac8', x: ['mantel', 'wolkenkragen', 'blitze'] } },
  c: { t: 'Gewitternacht', m: 'eigenständig: silberne Tolle, Nachtblau, Mantel, goldene Blitze und Blitzstab',
    l: { hairStyle: 'tolle', hair: '#e8ecf4', skin: '#d8a878', shirt: '#2a3050', pants: '#1e2238', coat: '#3a4a7a', x: ['mantel', 'blitze', 'blitzstab'] } }
};
module.exports = V;
if (require.main === module) {
  const fig = (svg, cap) => `<figure>${svg}<figcaption>${cap}</figcaption></figure>`;
  let body = '';
  Object.keys(V).forEach(k => {
    const v = V[k];
    body += `<section><h2>${k.toUpperCase()} · ${v.t} <small>${v.m}</small></h2><div class="row"><div class="var">` +
      ['normal', 'froh', 'sauer', 'muede', 'schreck'].map(md => fig(P.shaded(v.l, md), md)).join('') + '</div></div></section>';
  });
  body += '<section><h2>Kampfgröße <small>A · B · C nebeneinander</small></h2><div class="row small">' + Object.keys(V).map(k => fig(P.shaded(V[k].l, 'normal'), k.toUpperCase())).join('') + '</div></section>';
  const css = require('fs').readFileSync(__dirname + '/c4-head.css', 'utf8');
  const html = `<title>Zirrus 24 × 30</title><meta name="claude:viewport-fit-sides" content="cover"><style>${css}html:root:root{--acc:#5a8ac8}</style><header><h1>Zirrus 24 × 30</h1><p>Himmelsherr Zirrus, Einzelgänger ohne Bande (kein Abzeichen). Drei Varianten mit allen fünf Gefühlen, unten in Kampfgröße. Keine davon trägt Trommelring, Stirnband oder lange Ohrläppchen.</p></header>${body}`;
  require('fs').writeFileSync(process.argv[2] || 'zirrus.html', html);
}
