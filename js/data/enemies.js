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

// Besondere Gegner: tauchen je Meer häufiger auf (Chance in config.foeKinds).
//   hpX/atkX = Faktor auf die normalen Werte, from = ab welchem Meer (0 = erstes)
//   ability/power wie in abilities.js; power/value als Funktion vom Gegner-Level
GL.data.foeKinds = [
  { key: 'sani',     name: 'Sanitäter',     tag: 'Heilt',          from: 0, w: 3, hpX: 0.85, atkX: 0.7,
    ability: 'medic', power: l => 2 + Math.round(l * 0.6),
    text: 'Heilt am Rundenende den am meisten verletzten Gegner. Zuerst ausschalten!',
    look: { shirt: '#f4f4f4', hat: 'band', hatColor: '#d94b4b' } },
  { key: 'schuetze', name: 'Scharfschütze', tag: 'Zielt auf Schwache', from: 0, w: 3, hpX: 0.8, atkX: 1.15,
    ability: 'sniper', text: 'Greift immer dein Crewmitglied mit den wenigsten Leben an.',
    look: { shirt: '#3c5a3c', pants: '#2d402d', hat: 'hood', hatColor: '#2d402d' } },
  { key: 'schild',   name: 'Schildträger',  tag: 'Tank',           from: 0, w: 3, hpX: 1.45, atkX: 0.6,
    mods: { guard: 0.3 }, text: 'Viel Leben und nimmt 30 % weniger Schaden. Stellt sich gern nach vorn.',
    look: { shirt: '#6b7c8f', pants: '#454f5a', hat: 'cap', hatColor: '#9aa7b4' } },
  { key: 'trommler', name: 'Trommler',      tag: 'Stärkt alle',    from: 1, w: 2, hpX: 0.85, atkX: 0.75,
    ability: 'rally', power: l => 1 + Math.floor(l / 4), text: 'Zu Kampfbeginn bekommen alle Gegner mehr Angriff.',
    look: { shirt: '#c08a2a', hat: 'band', hatColor: '#8a5a1a' } },
  { key: 'kanonier', name: 'Kanonier',      tag: 'Trifft alle',    from: 1, w: 2, hpX: 0.9, atkX: 0.9,
    ability: 'burn', power: () => 0.3, text: 'Seine Kugeln treffen auch alle anderen Crewmitglieder (30 % Schaden).',
    look: { shirt: '#2a2a2a', pants: '#2a2a2a', hat: 'cap', hatColor: '#111111' } },
  { key: 'gift',     name: 'Giftmischer',   tag: 'Vergiftet',      from: 2, w: 2, hpX: 0.85, atkX: 0.85,
    status: { key: 'poison', rounds: 3, when: 'hit', target: 'target' }, statusValue: l => 1 + Math.floor(l / 3),
    text: 'Treffer vergiften (Schaden am Rundenende, 3 Runden).',
    look: { shirt: '#5a3a7a', skin: '#c8d8a0', hat: 'hood', hatColor: '#3a2a5a' } }
];
GL.data.foeKind = key => GL.data.foeKinds.find(k => k.key === key) || null;
// Darstellung eines Gegners (Name, Aussehen) inkl. besonderer Gegner
GL.data.foeDef = e => {
  const base = GL.data.grunts.find(x => x.id === e.id) || GL.data.bosses.find(x => x.id === e.id) || (GL.data.raids || []).find(x => x.id === e.id) || (GL.data.hunted || []).find(x => x.id === e.id);
  const k = e.kind && GL.data.foeKind(e.kind);
  if (!base || !k) return base;
  return Object.assign({}, base, { name: k.name, kind: k.key, look: Object.assign({}, base.look, k.look) });
};

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
