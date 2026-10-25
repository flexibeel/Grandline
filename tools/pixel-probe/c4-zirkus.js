// C4 Zirkus der Narren: Varianten A/B fürs Board (Node: node tools/pixel-probe/c4-zirkus.js <ziel.html>)
// Pomp-Truppe (buggy) und Wildfänge (supernova), Leitfarbe Magenta
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const V = {
  buggy: { n: 'Pomp', f: 'buggy', m: 'Gaukler: rote Nase, Dreispitz mit Gold',
    a: { hair: '#2f8a8a', skin: '#f6e6da', shirt: '#e8c040', pants: '#3a2a5a', hat: 'tricorn', hatColor: '#3a2a5a', nose: '#e0302a', x: ['schminke', 'konfetti'] },
    b: { hairStyle: 'buerste', hair: '#e07a2c', skin: '#f6e6da', shirt: '#f4f0e0', pants: '#3a2a5a', hat: 'narrenkappe', hatColor: '#c2318a', nose: '#e0302a', x: ['baelle', 'konfetti'] } },
  alvida: { n: 'Hanne', f: 'buggy', m: 'die Glitschige: Sonnenhut, rosa Hose, Keule',
    a: { hair: '#1a1a1a', skin: '#f6d8c0', shirt: '#f4f0e0', pants: '#e87aa0', hat: 'sonnenhut', hatColor: '#e8d8a0', longHair: true, x: ['keule'] },
    b: { hairStyle: 'locken', hair: '#c0603a', skin: '#f0c8a8', shirt: '#4a9a8a', pants: '#e87aa0', hat: 'sonnenhut', hatColor: '#f4f0e0', x: ['keule', 'schaum'] } },
  cabaji: { n: 'Jockel', f: 'buggy', m: 'Akrobat: Kopftuch, Jonglier-Messer, Feuer',
    a: { hair: '#4a7a3a', skin: '#f2c9a0', shirt: '#e8e8d8', pants: '#3a3a5a', hat: 'band', hatColor: '#c0392b', scarf: '#c0392b', x: ['schal', 'messer'] },
    b: { hairStyle: 'tolle', hair: '#2a2a3a', skin: '#e8b890', shirt: '#f2d24a', pants: '#3a2a5a', x: ['messer', 'fackel'] } },
  mohji: { n: 'Poldi', f: 'buggy', m: 'Dompteur: weißer Haarkranz, Mähnenkragen, Peitsche',
    a: { hairStyle: 'kranz', hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#8a6a3a', pants: '#5a4a3a', scarf: '#d08a30', x: ['pelz', 'peitsche'] },
    b: { hairStyle: 'kranz', hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#f4f0e0', pants: '#2a2a2a', hat: 'tophat', hatColor: '#2a2a2a', coat: '#b8343a', x: ['mantel', 'schnauzer', 'peitsche'] } },
  kid: { n: 'Magnus', f: 'supernova', m: 'Magnet: Fliegerbrille, wilde Mähne, Metallarm',
    a: { hairStyle: 'stachel', hair: '#e0603a', skin: '#f2c9a0', shirt: '#2a2a2a', pants: '#5a3a2a', coat: '#5a3a2a', x: ['schutzbrille', 'metallarm', 'mantel'] },
    b: { hairStyle: 'buerste', hair: '#3a4a6a', skin: '#e8c0a0', shirt: '#6a6a7a', pants: '#2a2a2a', x: ['schutzbrille', 'metallarm', 'magnet'] } },
  killer: { n: 'Simon', f: 'supernova', m: 'Sichelträger: Maske, Mähne, zwei Sicheln',
    a: { hair: '#e8d890', skin: '#f2c9a0', shirt: '#2a3a5a', pants: '#2a2a2a', longHair: true, x: ['domino', 'sicheln'] },
    b: { hair: '#3a2a3a', skin: '#e8c0a0', shirt: '#3a3a3a', pants: '#2a2a3a', hat: 'hood', hatColor: '#4a2a4a', x: ['domino', 'sicheln'] } },
  bonney: { n: 'Lotta', f: 'supernova', m: 'die Gefräßige: Mütze, riesige Fleischkeule',
    a: { hairStyle: 'bob', hair: '#e870a0', skin: '#f6d8c0', shirt: '#3a3a3a', pants: '#3a6a3a', hat: 'grosskappe', hatColor: '#e8b040', x: ['fleischkeule'] },
    b: { hairStyle: 'zoepfe', hair: '#e8904a', skin: '#f6d8c0', shirt: '#f4f0e0', pants: '#3a6a8a', hat: 'ohrenkappe', hatColor: '#4a8a4a', x: ['fleischkeule', 'pflaster'] } },
  drake: { n: 'Gregor', f: 'supernova', m: 'Dino-Käpt\'n: Schuppenmantel, Narbe',
    a: { hair: '#c08040', skin: '#e0b088', shirt: '#4a3a2a', pants: '#2a2a2a', hat: 'zweispitz', hatColor: '#3a2a1a', coat: '#4a6a3a', acc: 'narbe', x: ['mantel'] },
    b: { hairStyle: 'buerste', hair: '#5a3a2a', skin: '#d8a878', shirt: '#e8dcb0', pants: '#3a4a3a', beard: '#5a3a2a', coat: '#4a7a4a', x: ['mantel', 'schwanz', 'zahnkette'] } },
  hawkins: { n: 'Olin', f: 'supernova', m: 'Kartenleger: Kartenfächer, Mantel, Strohpuppe',
    a: { hair: '#f4e8b0', skin: '#f6e0c8', shirt: '#6a3a8a', pants: '#3a2a4a', coat: '#6a3a8a', longHair: true, x: ['mantel', 'karten', 'puppe'] },
    b: { hairStyle: 'bob', hair: '#2a2a3a', skin: '#f0d8c0', shirt: '#e8e0d0', pants: '#3a2a4a', coat: '#2a6a6a', x: ['mantel', 'karten', 'puppe'] } },
  apoo: { n: 'Rondo', f: 'supernova', m: 'Taktgeber: Stirnband, Ohrring, Musik',
    a: { hair: '#1a1a1a', skin: '#c89a70', shirt: '#e8c040', pants: '#3a3a5a', hat: 'band', hatColor: '#d0302a', acc: 'ohrring', x: ['mundharmonika'] },
    b: { hairStyle: 'zoepfe', hair: '#2a2a2a', skin: '#a87a58', shirt: '#4a8ac0', pants: '#3a3a5a', hat: 'ohrenschuetzer', hatColor: '#c2318a', x: ['trommel'] } }
};
module.exports = V;
if (require.main === module) {
  const body = require('./c4-board.js')(P, V, [['kragen', 'Rüschenkragen'], ['raute', 'Raute']], 'b', [['buggy', 'b'], ['mohji', 'b'], ['kid', 'b'], ['apoo', 'b']]);
  const css = require('fs').readFileSync(__dirname + '/c4-head.css', 'utf8');
  const html = `<title>Zirkus der Narren 24 × 30</title><meta name="claude:viewport-fit-sides" content="cover"><style>${css}</style><header><h1>Zirkus der Narren 24 × 30</h1><p>Pomp-Truppe (4) und Wildfänge (6). Je Figur zwei Varianten (A eher nah an der Liste, B eigenständiger), Gesichter normal, froh, sauer, müde. Unten das Abzeichen in Magenta (Pomp-Truppe mit Creme, Wildfänge mit Gelb) und die Kampfgröße.</p></header>${body}`;
  require('fs').writeFileSync(process.argv[2] || 'zirkus.html', html);
}
