// Gegner. Normale Gegner bekommen ihre Werte aus GL.config.grunt
// (sie werden pro Etappe stärker), Bosse haben feste Werte.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.grunts = [
  { id: 'marine',    name: 'Marinesoldat', type: 'technik',
    look: { hair: '#6b4a2a', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#2f4a7a', hat: 'cap', hatColor: '#f0f0f0' } },
  { id: 'pirate',    name: 'Pirat',        type: 'klinge',
    look: { hair: '#222222', skin: '#d9a87a', shirt: '#8a2a2a', pants: '#3a3a3a', hat: 'band', hatColor: '#c0392b' } },
  { id: 'mercenary', name: 'Söldner',      type: 'technik',
    look: { hair: '#555555', skin: '#f2c9a0', shirt: '#4a5a3a', pants: '#3a3a2a' } },
  { id: 'thug',      name: 'Schläger',     type: 'kraft',
    look: { hair: '#8a5a2a', skin: '#d9a87a', shirt: '#555555', pants: '#2a2a2a', hat: 'cap', hatColor: '#333333' } }
];

// escort = Anzahl normaler Gegner, die den Boss begleiten
// Welche Insel welche Bosse hat, steht in islands.js. Fähigkeiten in abilities.js.
GL.data.bosses = [
  { id: 'smoker',    name: 'Smoker',    type: 'klinge',  hp: 48,  atk: 6,  spd: 6, escort: 1,
    look: { hair: '#dddddd', skin: '#f2c9a0', shirt: '#3a4a3a', pants: '#3a4a3a' } },
  { id: 'arlong',    name: 'Arlong',    type: 'kraft',   hp: 52,  atk: 7,  spd: 5, escort: 1,
    look: { hair: '#1a1a1a', skin: '#6aa0c8', shirt: '#e8d070', pants: '#3a5a3a' } },
  { id: 'crocodile', name: 'Crocodile', type: 'technik', hp: 115, atk: 14, spd: 6, escort: 2,
    look: { hair: '#111111', skin: '#f2c9a0', shirt: '#8a6d2f', pants: '#222222' } },
  { id: 'enel',      name: 'Enel',      type: 'kraft',   hp: 110, atk: 14, spd: 7, escort: 2,
    look: { hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#e8b030', pants: '#e8b030', hat: 'band', hatColor: '#e8e8e8' } },
  { id: 'rob-lucci', name: 'Rob Lucci', type: 'kraft',   hp: 165, atk: 18, spd: 6, escort: 2,
    look: { hair: '#222222', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#222222', hat: 'cap', hatColor: '#222222' } },
  { id: 'kaku',      name: 'Kaku',      type: 'klinge',  hp: 160, atk: 17, spd: 7, escort: 2,
    look: { hair: '#8a5a2a', skin: '#f2c9a0', shirt: '#222222', pants: '#222222', hat: 'cap', hatColor: '#f0f0f0' } }
];

// Raid-Bosse: seltene Spezialkämpfe. reward = id der epischen Frucht (fruits.js),
// die man beim Sieg bekommt und die danach dauerhaft freigeschaltet bleibt.
GL.data.raids = [
  { id: 'kizaru',     name: 'Admiral Kizaru', type: 'technik', hp: 150, atk: 12, spd: 10, escort: 1, raid: true, reward: 'gum-gum-epic',
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#e8d030', pants: '#e8d030', hat: 'cap', hatColor: '#f0f0f0' } },
  { id: 'doflamingo', name: 'Doflamingo',     type: 'klinge',  hp: 170, atk: 13, spd: 7,  escort: 1, raid: true, reward: 'mera-mera-epic',
    look: { hair: '#e8d070', skin: '#f2c9a0', shirt: '#e870a0', pants: '#f0f0f0' } },
  // Selten (siehe config.rareRaidChance): wer Shanks besiegt, schaltet ihn als Kapitän frei
  { id: 'shanks',     name: 'Rothaar Shanks', type: 'klinge',  hp: 190, atk: 14, spd: 8,  escort: 2, raid: true, rare: true, reward: 'haki-epic',
    look: { hair: '#c0302a', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#3a3a3a' } }
];
