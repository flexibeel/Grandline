// C4 Flossenvolk: Varianten A/B fürs Board (Node: node tools/pixel-probe/c4-flossen.js <ziel.html>)
global.window = global; global.GL = global.GL || { data: {} };
require('../../js/ui/sprites.js');
const P = GL.sprites.p24;
const f = 'fischmensch';
const V = {
  arlong: { n: 'Brack', f, m: 'Sägenase, gelbes Hemd, Zahnkette',
    a: { hairStyle: 'stachel', hair: '#1a1a1a', skin: '#6aa0c8', shirt: '#e8d070', pants: '#3a5a3a', x: ['saegenase', 'zahnkette'] },
    b: { hairStyle: 'buerste', hair: '#3a6a7a', skin: '#5a8ab8', shirt: '#e8a040', pants: '#2a3a4a', x: ['zahnkette', 'haizaehne', 'flosse'] } },
  hatchan: { n: 'Okko', f, m: 'Tintenfisch-Maske, gelbes Hemd, viele Arme',
    a: { hair: '#c0392b', skin: '#e89a8a', shirt: '#e8c040', pants: '#3a5a8a', mask: 'octo', x: ['aermel'] },
    b: { hairStyle: 'dutt', hair: '#7a3a8a', skin: '#c87aa0', shirt: '#e8c040', pants: '#3a5a8a', x: ['aermel', 'tinte'] } },
  kuroobi: { n: 'Torn', f, m: 'Schwarzgurt, Kampfhandschuhe, Rückenflosse',
    a: { hairStyle: 'buerste', hair: '#1a1a1a', skin: '#7aa0c0', shirt: '#2a2a2a', pants: '#2a2a2a', x: ['schwarzgurt', 'handschuhe', 'flosse'] },
    b: { hairStyle: 'glatze', hair: '#1a1a1a', skin: '#6ab0a8', shirt: '#f0f0f0', pants: '#f0f0f0', x: ['schwarzgurt', 'handschuhe', 'flosse'] } },
  chu: { n: 'Prill', f, m: 'Kussmund, oranges Hemd, Schnorchel',
    a: { hair: '#2a2a2a', skin: '#8ab0c8', shirt: '#e86a3a', pants: '#3a3a5a', x: ['lippen', 'schnorchel'] },
    b: { hairStyle: 'glatze', hair: '#2a2a2a', skin: '#7ac0b0', shirt: '#e8a040', pants: '#3a3a5a', acc: 'brille', x: ['lippen', 'schnorchel'] } },
  hody: { n: 'Grimmflosse', f, m: 'Haimaske, dunkler Mantel, rote Flasche',
    a: { hair: '#1a1a2a', skin: '#7aa0c8', shirt: '#2a2a3a', pants: '#5a4a7a', mask: 'shark', coat: '#2a2a3a', x: ['mantel', 'flasche'] },
    b: { hairStyle: 'stachel', hair: '#2a3a5a', skin: '#5a8ab8', shirt: '#2a2a3a', pants: '#3a2a4a', coat: '#3a2a4a', x: ['mantel', 'flasche', 'flosse', 'haizaehne'] } }
};
module.exports = V;
if (require.main === module) {
  const h = require('./c4-board.js')(P, V, [['muschel', 'Muschel-Anhänger'], ['armband', 'Armbänder']], 'b', [['arlong', 'a'], ['kuroobi', 'b']]);
  require('fs').writeFileSync(process.argv[2] || 'flossen.html', h);
}
