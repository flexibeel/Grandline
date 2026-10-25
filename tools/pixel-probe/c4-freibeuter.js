// C4 Freibeuter der Krone: Varianten A/B fürs Board (Node: node tools/pixel-probe/c4-freibeuter.js <ziel.html>)
// Freibeuter (samurai, Tannengrün mit Gold) und Schauerbarken-Bande (thriller, Tannengrün mit Nebelgrau)
// A nah an der Liste, B bewusst weg von den Erkennungszeichen der Vorbilder (Fleckenmütze, Federhut, Federmantel, Fledermausmaske usw.)
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const V = {
  jinbei: { n: 'Jonah', f: 'samurai', m: 'der Steuermann: Wellen-Karate, kleines Steuerrad',
    a: { hairStyle: 'buerste', hair: '#1a1a1a', skin: '#5a8fc2', shirt: '#e0e0d0', pants: '#2a3a5a', scarf: '#3a5a9a', x: ['schal', 'steuerrad'] },
    b: { hairStyle: 'zopf', hair: '#2a2a2a', skin: '#6aa0a0', beard: '#2a2a2a', shirt: '#2a5a7a', pants: '#e8e0c8', x: ['schwarzgurt', 'flosse', 'steuerrad'] } },
  law: { n: 'Lorn', f: 'samurai', m: 'der Chirurg: Raumkuppel, langes Schwert',
    a: { hair: '#1a1a1a', skin: '#e8c0a0', shirt: '#2a2a3a', pants: '#6a5a3a', coat: '#2a2a3a', hat: 'fellmuetze', hatColor: '#f0ece4', x: ['mantel', 'schwertruecken'] },
    b: { hairStyle: 'tolle', hair: '#2a3a4a', skin: '#d8a878', shirt: '#e8e8e0', pants: '#3a3a44', coat: '#3a5a6a', acc: 'ohrring', x: ['mantel', 'handschuhe', 'schwertruecken'] } },
  mihawk: { n: 'Silas', f: 'samurai', m: 'die Nachtklinge: riesiges schwarzes Schwert',
    a: { hair: '#1a1a1a', skin: '#f2c9a0', shirt: '#3a2a2a', pants: '#2a2a2a', coat: '#1a1a1a', hat: 'federhut', hatColor: '#2a2a2a', x: ['mantel', 'schnauzer', 'grossschwert'] },
    b: { hairStyle: 'zopf', hair: '#c8ccd8', skin: '#e8c8a8', shirt: '#2a2a44', pants: '#2a2a2a', hat: 'hood', hatColor: '#1e2238', scarf: '#3a3a5a', acc: 'narbe', x: ['schal', 'grossschwert'] } },
  hancock: { n: 'Mira', f: 'samurai', m: 'die Unwiderstehliche: Herzklopfen, Amorpfeile',
    a: { hair: '#1a1a1a', skin: '#f6d2b0', shirt: '#c0304a', pants: '#c0304a', longHair: true, scarf: '#4a8a4a', acc: 'ohrring', x: ['schlange', 'lippen'] },
    b: { hairStyle: 'dutt', hair: '#5a2a4a', skin: '#e8b890', shirt: '#e86a8a', pants: '#f4e8e0', acc: 'blume', x: ['herzen', 'bogen'] } },
  doflamingo: { n: 'Rosé', f: 'samurai', m: 'Fadenkönig ★: Fäden an den Fingern',
    a: { hairStyle: 'buerste', hair: '#e8d070', skin: '#f2c9a0', shirt: '#f4f0e8', pants: '#e870a0', scarf: '#e870a0', x: ['federkragen', 'sonnenbrille', 'faden'] },
    b: { hair: '#c8b8d8', skin: '#f0d0b8', shirt: '#f4f0e8', pants: '#3a2a3a', coat: '#d86a9a', hat: 'tophat', hatColor: '#3a2a3a', acc: 'blume', x: ['mantel', 'faden'] } },
  kuma: { n: 'Tatz', f: 'samurai', m: 'der stille Bär ★: Pfotenhandschuhe, kleines Buch',
    a: { hair: '#2a2a2a', skin: '#c8a080', shirt: '#4a3a2a', pants: '#3a3a3a', mask: 'bear', x: ['pfoten', 'notizbuch'] },
    b: { hair: '#3a2a1a', skin: '#c8a080', shirt: '#e8dcc8', pants: '#5a4a3a', hat: 'ohrenkappe', hatColor: '#7a5a3a', scarf: '#8a6a4a', acc: 'brille', x: ['schal', 'pfoten'] } },
  perona: { n: 'Huschel', f: 'thriller', m: 'Fräulein ★: Trübsinn-Geister, Schirm',
    a: { hairStyle: 'zoepfe', hair: '#e870a0', skin: '#f2d0b8', shirt: '#2a1a2a', pants: '#2a1a2a', scarf: '#e870a0', x: ['schirm', 'teddy'] },
    b: { hairStyle: 'bob', hair: '#c8b8e8', skin: '#f4e0d8', shirt: '#3a2a4a', pants: '#5a4a6a', scarf: '#2a2030', x: ['geister', 'schirm'] } },
  moria: { n: 'Dämmerling', f: 'thriller', m: 'Graf ★: Schattenraub, Fledermäuse',
    a: { hair: '#3a2a4a', skin: '#b8b0c8', shirt: '#2a2030', pants: '#4a2a3a', coat: '#1a1424', mask: 'bat', x: ['mantel', 'fledermaus'] },
    b: { hairStyle: 'tolle', hair: '#4a2a5a', skin: '#c8c0d8', shirt: '#5a2030', pants: '#2a2030', coat: '#2a1a2a', x: ['stehkragen', 'mantel', 'fledermaus'] } },
  absalom: { n: 'Ulf', f: 'thriller', m: 'Unsichtbar ★: Durchsichtig, Hieb aus dem Nichts',
    a: { hair: '#e8c060', skin: '#f2c9a0', shirt: '#e8e0d0', pants: '#4a3a2a', coat: '#e0d0b0', mask: 'leopard', x: ['mantel', 'klauen'] },
    b: { hairStyle: 'locken', hair: '#e8c060', skin: '#e8c0a0', shirt: '#8a9098', pants: '#3a3a44', scarf: '#c8ccd0', acc: 'narbe', x: ['schal', 'handschuhe'] } },
  hogback: { n: 'Flick', f: 'thriller', m: 'Doktor ★: Zombie-Chirurg, Nadel und Faden',
    a: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#2a2a2a', coat: '#f0f0f0', acc: 'brille', x: ['mantel', 'nadel'] },
    b: { hairStyle: 'glatze', hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#7aa89a', pants: '#7aa89a', hat: 'cap', hatColor: '#6a9a8a', x: ['schutzbrille', 'nadel'] } }
};
module.exports = V;
if (require.main === module) {
  const body = require('./c4-board.js')(P, V, [['siegel', 'Kaperbrief-Siegel'], ['klappe', 'Schulterklappen']], 'b', [['law', 'b'], ['doflamingo', 'b'], ['perona', 'b'], ['moria', 'b']]);
  const css = require('fs').readFileSync(__dirname + '/c4-head.css', 'utf8');
  const html = `<title>Freibeuter der Krone 24 × 30</title><meta name="claude:viewport-fit-sides" content="cover"><style>${css}html:root:root{--acc:#2f6a4a}</style><header><h1>Freibeuter der Krone 24 × 30</h1><p>Freibeuter (6) und Schauerbarken-Bande (4). Je Figur zwei Varianten (A eher nah an der Liste, B eigenständiger), Gesichter normal, froh, sauer, müde. Unten das Abzeichen (Freibeuter Tannengrün mit Gold, Schauerbarke Tannengrün mit Nebelgrau) und die Kampfgröße.</p></header>${body}`;
  require('fs').writeFileSync(process.argv[2] || 'freibeuter.html', html);
}
