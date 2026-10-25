// C4 Sturmmöwen, Board 1: Grund-Looks A/B (Node: node tools/pixel-probe/c4-moewen.js <ziel.html>)
// Die Spielerbande, Leitfarbe Blau-Weiß. A nah am heutigen Look, B bewusst weg von den Erkennungszeichen der Vorbilder
// (kein Strohhut, keine drei Schwerter mit grünem Haar, kein Afro, keine Skelett-Haut, keine blauen Stachelhaare mit Sonnenbrille).
// Die Story-Formen (Form-Teile) kommen auf Board 2, wenn die Grund-Looks stehen.
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const f = 'strohhut';
const V = {
  ruffy: { n: 'Rafe', f, m: 'der Kapitän: dehnbar wie Gummi, immer hungrig',
    a: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#d9423a', pants: '#3b5a8c', hat: 'straw', hatColor: '#e8c25a' },
    b: { hairStyle: 'stachel', hair: '#1a1a1a', skin: '#e8b890', shirt: '#f4f0e8', pants: '#c8302c', hat: 'cap', hatColor: '#2f6ab0', scarf: '#e8a040', x: ['schal'] } },
  zorro: { n: 'Soren', f, m: 'der Schwertkämpfer: verläuft sich ständig',
    a: { hair: '#3f8f4f', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#2f3a2f', hat: 'band', hatColor: '#222222', x: ['dreigriffe'] },
    b: { hairStyle: 'zopf', hair: '#2a3a4a', skin: '#d8a878', shirt: '#4a6a8a', pants: '#2a2a33', acc: 'narbe', x: ['handschuhe', 'schwertruecken'] } },
  nami: { n: 'Nela', f, m: 'die Navigatorin: liest Wind und Wolken',
    a: { hair: '#e07a2c', skin: '#f2c9a0', shirt: '#2f9bc2', pants: '#e8dcb0', longHair: true },
    b: { hairStyle: 'dutt', hair: '#7a3a2a', skin: '#e8c0a0', shirt: '#f2e0a0', pants: '#3a5a8a', scarf: '#2fb8b0', x: ['schal', 'feder'] } },
  lysop: { n: 'Lasse', f, m: 'der Schütze: erzählt gern Geschichten',
    a: { hair: '#222222', skin: '#d9a87a', shirt: '#c9a23a', pants: '#6b4a2a', hat: 'afro', nose: '#c08a5a' },
    b: { hairStyle: 'locken', hair: '#2a1a10', skin: '#c89068', shirt: '#5a7a3a', pants: '#6b4a2a', x: ['schutzbrille', 'mappe'] } },
  sanji: { n: 'Santo', f, m: 'der Koch: kämpft nur mit den Beinen',
    a: { hairStyle: 'bob', hair: '#e8c95a', skin: '#f2c9a0', shirt: '#222222', pants: '#222222', x: ['stiefel'] },
    b: { hairStyle: 'tolle', hair: '#8a4a2a', skin: '#f0c8a8', shirt: '#f4f0e8', pants: '#3a3a44', scarf: '#2f6ab0', x: ['schal', 'stiefel'] } },
  chopper: { n: 'Pipo', f, m: 'der Arzt: klein, flauschig, verlegen',
    a: { hair: '#6b4a2a', skin: '#c08a5a', shirt: '#d9709a', pants: '#d9709a', hat: 'ohrenkappe', hatColor: '#d9709a' },
    b: { hair: '#8a5a3a', skin: '#d8a070', shirt: '#3a8a7a', pants: '#3a8a7a', coat: '#f4f4f0', hat: 'ohrenschuetzer', hatColor: '#e8a040', x: ['mantel', 'mappe'] } },
  robin: { n: 'Rubina', f, m: 'die Archäologin: liest alte Steine',
    a: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#6b4fa0', pants: '#3a2a5a', longHair: true },
    b: { hairStyle: 'bob', hair: '#3a2a1a', skin: '#e0b088', shirt: '#c87a4a', pants: '#4a3a2a', hat: 'sonnenhut', hatColor: '#d8c090', acc: 'brille', x: ['notizbuch'] } },
  franky: { n: 'Bolzen', f, m: 'der Schiffsbauer: halb Mensch, halb Werkbank',
    a: { hairStyle: 'tolle', hair: '#3fa0e0', skin: '#d9a87a', shirt: '#e8c93a', pants: '#2f86c9', x: ['sonnenbrille'] },
    b: { hairStyle: 'buerste', hair: '#c8703a', skin: '#e0a880', beard: '#c8703a', shirt: '#e8e0d0', pants: '#4a6a8a', x: ['latz', 'handschuhe', 'schutzbrille'] } },
  brook: { n: 'Bruno', f, m: 'der Musikant: Klingenstock und Geige',
    a: { hair: '#2a2a2a', skin: '#f0f0f0', shirt: '#1a1a1a', pants: '#1a1a1a', hat: 'afro' },
    b: { hairStyle: 'locken', hair: '#e8e8e8', skin: '#e8c8a8', shirt: '#3a2a44', pants: '#2a2a3a', coat: '#1e1e2a', hat: 'melone', hatColor: '#1a1a1a', x: ['mantel', 'mundharmonika'] } }
};
module.exports = V;
if (require.main === module) {
  const body = require('./c4-board.js')(P, V, [['moewe', 'Möwen-Anstecker'], ['kragen', 'Ringelkragen']], 'b', [['ruffy', 'b'], ['zorro', 'b'], ['nami', 'b'], ['franky', 'b']]);
  const css = require('fs').readFileSync(__dirname + '/c4-head.css', 'utf8');
  const html = `<title>Sturmmöwen 24 × 30</title><meta name="claude:viewport-fit-sides" content="cover"><style>${css}html:root:root{--acc:#2f6ab0}</style><header><h1>Sturmmöwen 24 × 30</h1><p>Die Spielerbande, Board 1 von 2: die neun Grund-Looks. Je Figur zwei Varianten (A nah am heutigen Look, B eigenständig), Gesichter normal, froh, sauer, müde. Unten das Abzeichen in Blau-Weiß und die Kampfgröße. Die Story-Formen kommen auf Board 2.</p></header>${body}`;
  require('fs').writeFileSync(process.argv[2] || 'moewen.html', html);
}
