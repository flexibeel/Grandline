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
    look: { hair: '#8a5a2a', skin: '#d9a87a', shirt: '#555555', pants: '#2a2a2a', hat: 'cap', hatColor: '#333333' } },
  // Tiere der Grand Line: eigene Pixelbilder (art), tauchen nur in bestimmten Meeren auf (seas)
  { id: 'boar', name: 'Wildschwein', type: 'kraft', seas: [0, 1],
    art: { c: { B: '#8a5a3a', b: '#5a3a24', S: '#e8a090', n: '#6a2a20', E: '#1a1a1a', T: '#f4f0e0', k: '#2a1a10' },
      rows: ['................', '.....b......b...', '....bBb....bBb..', '...bBBBBBBBBBBb.', '..bBBBBBBBBBBBBb', '.bEBBBBBBBBBBBBb', 'SSBBBBBBBBBBBBBb', 'nSBBBBBBBBBBBBBb', 'SSTBBBBBBBBBBBb.', '.bBBBBBBBBBBBBb.', '..bBBbbbbbbBBb..', '..bBb.....bBb...', '..kk......kk....', '................'] } },
  { id: 'crab', name: 'Riesenkrabbe', type: 'technik', seas: [0, 1],
    art: { c: { C: '#d0473a', w: '#f08a6a', R: '#c03a2e', r: '#8a2420', K: '#1a1a1a' },
      rows: ['................', '..CC........CC..', '.CwwC......CwwC.', '.CCCC......CCCC.', '..CC..C..C..CC..', '...C..K..K..C...', '...CRRRRRRRRC...', '..RRRRRRRRRRRR..', '.RRrRRRRRRRRrRR.', '.RRRRRRRRRRRRRR.', '..rRRRRRRRRRRr..', '.r.r.r....r.r.r.', 'r.r.r......r.r.r', '................'] } },
  { id: 'gull', name: 'Möwe', type: 'technik', seas: [0],
    art: { c: { W: '#f4f4f0', G: '#9aa7b4', K: '#1a1a1a', O: '#f29a2e' },
      rows: ['................', '.......WWW......', '......WWWWW.....', '.....KWWWWW.....', '...OOWWWWWW.....', '.....WWWWWWG....', '....WWWWWWWGGG..', '....WWWWWWGGGGG.', '.....WWWWWWGGGGG', '......WWWWWWGG..', '.......WWWW.....', '........O.O.....', '........O.O.....', '.......OO.OO....'] } },
  // Remix: Seekuh Momoo (East Blue) und Kampfaffe (Paradies)
  { id: 'momoo', name: 'Seekuh Momoo', type: 'kraft', seas: [0],
    art: { c: { B: '#7f9fc4', b: '#4f6f94', W: '#f4f0e0', E: '#1a1a1a', P: '#e8a0a8', Y: '#f2d24a', w: '#9fd2ee' },
      rows: ['................', '..W..........W..', '..WW........WW..', '...BBBBBBBBBB...', '..BBBBBBBBBBBB..', '.BBEBBBBBBBBEBB.', '.BBBBBBBBBBBBBB.', '.bBBPPPPPPPPBBb.', '..bPPEPPPPEPPb..', '..bPPPPYYPPPPb..', '...bPPPYYPPPb...', '....bbbbbbbb....', 'wwwwwwwwwwwwwwww', '.ww.wwww.www.ww.', '................', '................'] } },
  { id: 'kampfaffe', name: 'Kampfaffe', type: 'kraft', seas: [1, 2],
    art: { c: { F: '#8a5a34', f: '#5a3a1e', S: '#e8c09a', E: '#1a1a1a', R: '#c0392b', k: '#2a1a10' },
      rows: ['................', '.....FFFFFF.....', '....FFFFFFFF....', '...FFSSSSSSFF...', '..FFSESSSSESFF..', '..FFSSSSSSSSFF..', '...FSSSkkSSSF...', '....FSSSSSSF....', '..RRRFFFFFFRRR..', '.RRFFFFFFFFFFRR.', '.SS.FFFFFFFF.SS.', '.SS.FFFFFFFF.SS.', '....FF....FF....', '....ff....ff....', '...kkk....kkk...', '................'] } },
  { id: 'bananacroc', name: 'Bananen-Krokodil', type: 'kraft', seas: [1, 2],
    art: { c: { G: '#5c9a42', g: '#2f5a24', E: '#f2d24a', T: '#f4f0e0', Y: '#f2d24a', y: '#c9a22a' },
      rows: ['................', '..........YY....', '.........YYYy...', '........YYyy....', '..GGGGG..GGG....', '.GGEGGGGGGGGG...', 'GGGGGGGGGGGGGGG.', 'TGTGTGGGGGGGGGGG', 'GGGGGGGGGGGGGGGg', '.gGGGGGGGGGGGGgg', '..GG..GGGG..GGg.', '..gg..gg....gg..', '................', '................'] } },
  { id: 'wolf', name: 'Steppenwolf', type: 'technik', seas: [1, 2],
    art: { c: { G: '#8a939e', g: '#5a636e', E: '#f2d24a', N: '#1a1a1a', W: '#d8dde2', k: '#2a2a2a' },
      rows: ['................', '...g............', '..gG............', '.GGGG...........', 'GEGGGG..........', 'NGGGGGGGGGGGG.g.', '.GGGGGGGGGGGGGg.', '..GGGGGGGGGGGGg.', '..GGWWWWWGGGGG..', '..GG.....GG.GG..', '..GG.....GG.GG..', '..kk.....kk.kk..', '................', '................'] } },
  { id: 'seaking', name: 'Seekönig', type: 'klinge', seas: [2],
    art: { c: { P: '#6a8ac0', p: '#3a5a8a', E: '#f2d24a', T: '#f4f0e0', b: '#e8d0a0', W: '#4f9ccf', w: '#2f6f9f' },
      rows: ['................', '.....PPPP.......', '...PPPPPPPP.....', '..PPEPPPPPPP....', '.PPPPPPPPPPPp...', 'TPTPTPPPPPPPp...', '.......PPPPPp...', 'TPTPTPPPPPPPp...', '.PPPPPPPPPPpp...', '....bPPPPPpp....', '....bPPPPpp.....', '....bPPPpp......', 'WWWWWbPPPpWWWWWW', 'wWWWWWWWWWWWWWWw'] } },
  { id: 'bat', name: 'Riesenfledermaus', type: 'technik', seas: [2],
    art: { c: { K: '#3a2a4a', k: '#5a4a6a', R: '#e0483b' },
      rows: ['................', '................', 'K..............K', 'KK....K..K....KK', 'KKK...KKKK...KKK', 'KKKKkKRKKRKkKKKK', '.KKKKKKKKKKKKKK.', '..KKKKKKKKKKKK..', '...KK.KKKK.KK...', '.......KK.......', '................', '................', '................', '................'] } },
  // ART3: Inselbewohner mit eigenem Pixelbild aus GL.art.monster. isles = nur auf diesen Inseln
  { id: 'mo-skorpion', name: 'Wüstenskorpion', type: 'technik', seas: [1], isles: ['alabasta'], monster: 'skorpion' },
  { id: 'mo-schneewolf', name: 'Schneewolf', type: 'klinge', seas: [1], isles: ['drumm'], monster: 'schneewolf' },
  { id: 'mo-sumpfaffe', name: 'Sumpfaffe', type: 'kraft', seas: [1], isles: ['jaya'], monster: 'sumpfaffe' },
  { id: 'mo-wolke', name: 'Wolkenwächter', type: 'technik', seas: [1], isles: ['skypiea'], monster: 'wolkenwaechter' },
  { id: 'mo-qualle', name: 'Giftqualle', type: 'technik', seas: [1], isles: ['tiefsee', 'korallenhuegel', 'meerwald'], monster: 'giftqualle' },
  { id: 'mo-fischmensch', name: 'Fischmensch', type: 'kraft', seas: [0, 1], isles: ['arlong-park', 'fischmenschen-viertel'], monster: 'fischmensch' },
  { id: 'mo-zombie', name: 'Zombie-Matrose', type: 'klinge', seas: [2], isles: ['florian', 'grusel-garten', 'mangroven'], monster: 'zombiematrose' },
  { id: 'mo-roboter', name: 'Labor-Roboter', type: 'kraft', seas: [2], isles: ['hogback-labor', 'water-7'], monster: 'roboter' }
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
,
  // Remix: neue Verhaltensweisen (battle.js: taunt, bully, pack)
  { key: 'leibwache', name: 'Leibwache',  tag: 'Fängt Treffer ab', from: 0, w: 1, hpX: 1.25, atkX: 0.6,
    ability: 'taunt', mods: { guard: 0.15 }, text: 'Solange er steht, muss deine Crew ihn zuerst schlagen. Scharfschützen zielen trotzdem frei.',
    look: { shirt: '#8a6a3a', pants: '#4a3a2a', hat: 'cap', hatColor: '#c9a46a' } },
  { key: 'raufbold', name: 'Raufbold',    tag: 'Jagt Starke',      from: 1, w: 2, hpX: 0.95, atkX: 0.95,
    ability: 'bully', text: 'Greift immer dein Crewmitglied mit dem meisten Angriff an.',
    look: { shirt: '#a83a2a', pants: '#3a2a2a', hat: 'band', hatColor: '#1a1a1a' } },
  { key: 'rudel', name: 'Rudelführer',    tag: 'Wird wütend',      from: 1, w: 2, hpX: 1.1, atkX: 0.9,
    ability: 'pack', power: l => 2 + Math.floor(l / 4), text: 'Für jeden gefallenen Verbündeten bekommt er mehr Angriff. Zuerst oder zuletzt besiegen?',
    look: { shirt: '#5a5a6a', pants: '#2a2a3a', hat: 'hood', hatColor: '#3a3a4a' } }
];
GL.data.foeKind = key => GL.data.foeKinds.find(k => k.key === key) || null;
// Darstellung eines Gegners (Name, Aussehen) inkl. besonderer Gegner
GL.data.foeDef = e => {
  if (e.def) return e.def;
  const base = GL.data.grunts.find(x => x.id === e.id) || GL.data.bosses.find(x => x.id === e.id) || (GL.data.raids || []).find(x => x.id === e.id) || (GL.data.hunted || []).find(x => x.id === e.id);
  const k = e.kind && GL.data.foeKind(e.kind);
  if (!base) return (GL.data.crew || []).find(x => x.id === e.id);   // z. B. Crew eines anderen Spielers (Begegnung auf See)
  if (!k) return base;
  if (base.art) return Object.assign({}, base, { kind: k.key });   // Tiere behalten Bild und Namen, die Fähigkeit steht am Schild
  return Object.assign({}, base, { name: k.name, kind: k.key, look: Object.assign({}, base.look, k.look) });
};

// escort = Anzahl normaler Gegner, die den Boss begleiten
// Welche Insel welche Bosse hat, steht in islands.js. Fähigkeiten in abilities.js.
GL.data.bosses = [
  { id: 'smoker',    name: 'Smoker',    type: 'klinge',  hp: 48,  atk: 6,  spd: 6, escort: 1,
    look: { hair: '#dddddd', skin: '#f2c9a0', shirt: '#3a4a3a', pants: '#3a4a3a', mask: 'cloud' } },
  { id: 'arlong',    name: 'Arlong',    type: 'kraft',   hp: 52,  atk: 7,  spd: 5, escort: 1,
    look: { hair: '#1a1a1a', skin: '#6aa0c8', shirt: '#e8d070', pants: '#3a5a3a', mask: 'shark' } },
  { id: 'crocodile', name: 'Crocodile', type: 'technik', hp: 115, atk: 14, spd: 6, escort: 2,
    look: { hair: '#111111', skin: '#f2c9a0', shirt: '#8a6d2f', pants: '#222222', mask: 'croc' } },
  { id: 'enel',      name: 'Enel',      type: 'kraft',   hp: 110, atk: 14, spd: 7, escort: 2,
    look: { hair: '#f0f0f0', skin: '#f2c9a0', shirt: '#e8b030', pants: '#e8b030', hat: 'band', hatColor: '#e8e8e8', mask: 'bolt' } },
  { id: 'rob-lucci', name: 'Rob Lucci', type: 'kraft',   hp: 165, atk: 18, spd: 6, escort: 2,
    look: { hair: '#222222', skin: '#f2c9a0', shirt: '#e8e8e8', pants: '#222222', hat: 'cap', hatColor: '#222222', mask: 'leopard' } },
  { id: 'kaku',      name: 'Kaku',      type: 'klinge',  hp: 160, atk: 17, spd: 7, escort: 2,
    look: { hair: '#8a5a2a', skin: '#f2c9a0', shirt: '#222222', pants: '#222222', hat: 'cap', hatColor: '#f0f0f0', mask: 'giraffe' } },
  // Fischmenscheninsel (zweite Route des zweiten Meeres)
  { id: 'hody',      name: 'Hody Jones', type: 'kraft',   hp: 112, atk: 14, spd: 6, escort: 2,
    look: { hair: '#1a1a2a', skin: '#7aa0c8', shirt: '#2a2a3a', pants: '#5a4a7a', mask: 'shark' } },
  { id: 'vander',    name: 'Vander Decken IX', type: 'technik', hp: 114, atk: 14, spd: 7, escort: 2,
    look: { hair: '#d0d0d0', skin: '#8a9ac0', shirt: '#4a3a2a', pants: '#2a2a3a', hat: 'tricorn', hatColor: '#2a2a2a' } },
  // Thriller Bark (zweite Route des dritten Meeres)
  { id: 'moria',     name: 'Gecko Moria', type: 'technik', hp: 175, atk: 16, spd: 5, escort: 2,
    look: { hair: '#1a1a2a', skin: '#c8b8d8', shirt: '#2a1a3a', pants: '#2a1a3a', mask: 'bat' } },
  { id: 'kuma',      name: 'Bartholomew Kuma', type: 'kraft', hp: 190, atk: 15, spd: 5, escort: 2,
    look: { hair: '#2a2a2a', skin: '#c89a70', shirt: '#3a3a4a', pants: '#2a2a3a', hat: 'cap', hatColor: '#3a3a4a', mask: 'bear' } }
];

// Raid-Bosse: seltene Spezialkämpfe. reward = id der epischen Frucht (fruits.js),
// die man beim Sieg bekommt und die danach dauerhaft freigeschaltet bleibt.
GL.data.raids = [
  { id: 'kizaru',     name: 'Admiral Kizaru', type: 'technik', hp: 150, atk: 12, spd: 10, escort: 1, raid: true, reward: 'gum-gum-epic',
    look: { hair: '#2a2a2a', skin: '#f2c9a0', shirt: '#e8d030', pants: '#e8d030', hat: 'cap', hatColor: '#f0f0f0' } },
  { id: 'doflamingo', name: 'Doflamingo',     type: 'klinge',  hp: 170, atk: 13, spd: 7,  escort: 1, raid: true, reward: 'mera-mera-epic',
    look: { hair: '#e8d070', skin: '#f2c9a0', shirt: '#e870a0', pants: '#f0f0f0' } },
  // Selten (siehe config.rareRaidChance): wer Shanks besiegt, schaltet ihn als Kapitän frei
  { id: 'teach',      name: 'Blackbeard',     type: 'kraft',   hp: 200, atk: 14, spd: 6,  escort: 1, raid: true, reward: 'yami-yami-epic',
    look: { hair: '#1a1a1a', skin: '#e0b088', shirt: '#e8e8e8', pants: '#3a2a1a', hat: 'band', hatColor: '#c0392b' } },
  { id: 'shanks',     name: 'Rothaar Shanks', type: 'klinge',  hp: 190, atk: 14, spd: 8,  escort: 2, raid: true, rare: true, reward: 'haki-epic',
    look: { hair: '#c0302a', skin: '#f2c9a0', shirt: '#f0f0f0', pants: '#3a3a3a' } }
];
