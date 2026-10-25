// C4 Die zwei Flotten: Varianten A/B fürs Board (Node: node tools/pixel-probe/c4-flotten.js <ziel.html>)
// Gischt-Flotte (weissbart, Elfenbein) und Rotmantel-Flotte (rothaar, Mohnrot)
// Beide Varianten bewusst weg von den Erkennungszeichen der Vorbilder (Hut mit Gesicht, Mondschnauzer, roter Schopf usw.)
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const V = {
  ace: { n: 'Asch', f: 'weissbart', m: 'der Glühende: Glutfaust, Funken',
    a: { hairStyle: 'tolle', hair: '#6a2a1a', skin: '#f2c9a0', shirt: '#3a3a44', pants: '#5a4a3a', hat: 'band', hatColor: '#e07a2c', x: ['glut'] },
    b: { hairStyle: 'buerste', hair: '#b8b4ac', skin: '#e8b890', shirt: '#7a4a2a', pants: '#3a3a3a', x: ['russ', 'handschuhe', 'glut'] } },
  marco: { n: 'Falk', f: 'weissbart', m: 'die Blauflamme: Heiler, blaue Flammen an den Händen',
    a: { hairStyle: 'locken', hair: '#7a5a3a', skin: '#f2c9a0', shirt: '#3a7a8a', pants: '#2a3a5a', x: ['blauflamme'] },
    b: { hairStyle: 'zopf', hair: '#2a2a3a', skin: '#d8a878', shirt: '#5a6a8a', pants: '#3a3a3a', coat: '#2a3a5a', x: ['mantel', 'feder', 'blauflamme'] } },
  whitebeard: { n: 'Gischt', f: 'weissbart', m: 'der Alte: Käpt\'n, Vollbart statt Schnauzer, Anker',
    a: { hairStyle: 'glatze', hair: '#e8e8e0', skin: '#e0b088', beard: '#e8e8e0', shirt: '#3a4a6a', pants: '#4a3a2a', coat: '#2a5a5a', x: ['mantel', 'anker'] },
    b: { hairStyle: 'kranz', hair: '#c8c8c0', skin: '#e0b088', beard: '#c8c8c0', shirt: '#4a7a8a', pants: '#2a2a3a', hat: 'cap', hatColor: '#2a3a5a', acc: 'pfeife', x: ['anker'] } },
  vista: { n: 'Veit', f: 'weissbart', m: 'der Gärtner: Blüten, zwei Klingen',
    a: { hair: '#5a3a2a', skin: '#f2c9a0', shirt: '#4a7a3a', pants: '#5a4a3a', hat: 'sonnenhut', hatColor: '#d8c080', x: ['schwertruecken', 'blueten'] },
    b: { hairStyle: 'bob', hair: '#a05a3a', skin: '#f0d0b0', shirt: '#6a8a4a', pants: '#3a3a3a', acc: 'blume', x: ['klingen', 'blueten'] } },
  shanks: { n: 'Fenn', f: 'rothaar', m: 'Rotmantel ★: langer Mantel in Mohnrot, Schwert',
    a: { hairStyle: 'stachel', hair: '#5a3a24', skin: '#f2c9a0', shirt: '#f0ead8', pants: '#3a3a3a', coat: '#c8302c', x: ['mantel', 'schwertruecken'] },
    b: { hairStyle: 'tolle', hair: '#c8ccd0', skin: '#e8c0a0', shirt: '#3a3a44', pants: '#2a2a2a', coat: '#c8302c', acc: 'ohrring', x: ['mantel', 'schwertruecken'] } },
  beckman: { n: 'Lenz', f: 'rothaar', m: 'der Vize: ruhiger Kopf, Gewehr auf dem Rücken',
    a: { hairStyle: 'buerste', hair: '#7a7a7a', skin: '#f2c9a0', beard: '#7a7a7a', shirt: '#3a3a44', pants: '#2a2a2a', coat: '#2a2a3a', x: ['mantel', 'gewehr'] },
    b: { hairStyle: 'locken', hair: '#1a1a1a', skin: '#c89a70', shirt: '#6a5a4a', pants: '#3a3a3a', acc: 'brille', x: ['notizbuch', 'gewehr'] } },
  roo: { n: 'Brotz', f: 'rothaar', m: 'der Bratmeister: Latzhose, Grillgut',
    a: { hair: '#5a3a2a', skin: '#f2c9a0', shirt: '#e8dcc8', pants: '#5a6a8a', hat: 'cap', hatColor: '#e8c040', x: ['latz', 'fleischkeule'] },
    b: { hair: '#a0502a', skin: '#e8b890', beard: '#a0502a', shirt: '#8a4a3a', pants: '#3a3a3a', hat: 'kochmuetze', hatColor: '#f4f0e8', x: ['latz', 'pfanne'] } },
  yasopp: { n: 'Piet', f: 'rothaar', m: 'der Treffsichere: Zielrohr oder Armbrust mit Zielglas',
    a: { hairStyle: 'zopf', hair: '#d8b060', skin: '#f2c9a0', shirt: '#6a7a4a', pants: '#3a2a1a', hat: 'band', hatColor: '#3a5a3a', x: ['zielrohr'] },
    b: { hairStyle: 'bob', hair: '#3a2a2a', skin: '#d8a878', shirt: '#4a5a6a', pants: '#3a3a2a', x: ['zielglas', 'armbrust'] } }
};
module.exports = V;
if (require.main === module) {
  const body = require('./c4-board.js')(P, V, [['tuch', 'Halstuch'], ['wimpel', 'Wimpel-Anstecker']], 'b', [['ace', 'b'], ['whitebeard', 'b'], ['shanks', 'b'], ['roo', 'b']]);
  const css = require('fs').readFileSync(__dirname + '/c4-head.css', 'utf8');
  const html = `<title>Die zwei Flotten 24 × 30</title><meta name="claude:viewport-fit-sides" content="cover"><style>${css}html:root:root{--acc:#c8302c}</style><header><h1>Die zwei Flotten 24 × 30</h1><p>Gischt-Flotte (4) und Rotmantel-Flotte (4). Je Figur zwei Varianten (A eher nah an der Liste, B eigenständiger), Gesichter normal, froh, sauer, müde. Unten das Abzeichen (Gischt Elfenbein mit Marineblau, Rotmantel Mohnrot mit Creme) und die Kampfgröße.</p></header>${body}`;
  require('fs').writeFileSync(process.argv[2] || 'flotten.html', html);
}
