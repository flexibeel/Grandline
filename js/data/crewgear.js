// Crew-Ausrüstung für die Stammcrew (wie bei Diablo): Bosse und Raids lassen Teile mit zufälligen Werten fallen.
// Jede Figur der Stammcrew hat drei Plätze: Waffe, Kleidung, Schmuck.
//   bases:   Grundteile je Platz. g = Geschlecht für den Namen (m/f/n), main = Hauptwert, art = Pixelbild
//   affixes: mögliche Zusatzwerte. min/max gelten für ein gewöhnliches Teil aus dem ersten Meer
//   Seltenheit (r): 0 gewöhnlich, 1 selten (+1 Zusatzwert), 2 episch (+2), 3 legendär (+3, Name mit Boss)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.crewGear = {
  slots: [
    { id: 'waffe', name: 'Waffe' },
    { id: 'kleid', name: 'Kleidung' },
    { id: 'schmuck', name: 'Schmuck' },
    { id: 'trophae', name: 'Trophäe' }
  ],
  // Raid-Beute aus der Vitrine als Trophäe: feste Spezialfähigkeit + zufällige Zusatzwerte (episch 2, legendär 3)
  //   gb-Werte: critMult (Krit-Schaden), regen (Heilung pro Runde), ultStart (Ulti-Energie zu Kampfbeginn), dodge, armor, crit, dmgPct, spd
  trophyPerks: {
    'licht-splitter':    { name: 'Lichtschnell',      text: '+1 Tempo, startet mit 30 Ulti-Energie',          a: { spd: 1 }, gb: { ultStart: 30 } },
    'yasakani':          { name: 'Lichtgeschwindigkeit', text: '+2 Tempo, +6 % Ausweichen, startet mit 50 Ulti-Energie', a: { spd: 2 }, gb: { dodge: 0.06, ultStart: 50 } },
    'faden-spule':       { name: 'Fadenschnitt',      text: '+8 % Schaden',                                    gb: { dmgPct: 0.08 } },
    'federmantel':       { name: 'Himmelsfäden',      text: '+12 % Schaden, heilt sich 2 pro Runde',           gb: { dmgPct: 0.12, regen: 2 } },
    'schatten-splitter': { name: 'Finsternis',        text: '+2 Rüstung',                                      gb: { armor: 2 } },
    'blackbeard-flagge': { name: 'Drei Schädel',      text: '+3 Rüstung, +8 % Krit-Chance',                     gb: { armor: 3, crit: 0.08 } },
    'strohhut-band':     { name: 'Versprechen',       text: 'heilt sich 3 pro Runde',                          gb: { regen: 3 } },
    'gryphon':           { name: 'Aura des Herrschers',  text: '+30 % Krit-Schaden, +8 % Schaden',                 gb: { critMult: 0.3, dmgPct: 0.08 } }
  },
  bases: [
    { id: 'saebel',   slot: 'waffe',   name: 'Säbel',          g: 'm', main: 'atk',   art: 'sword' },
    { id: 'entermesser', slot: 'waffe', name: 'Entermesser',   g: 'n', main: 'atk',   art: 'sword' },
    { id: 'muskete',  slot: 'waffe',   name: 'Muskete',        g: 'f', main: 'atk',   art: 'gun' },
    { id: 'dreizack', slot: 'waffe',   name: 'Dreizack',       g: 'm', main: 'atk',   art: 'trident' },
    { id: 'mantel',   slot: 'kleid',   name: 'Kapitänsmantel', g: 'm', main: 'hp',    art: 'coat' },
    { id: 'weste',    slot: 'kleid',   name: 'Lederweste',     g: 'f', main: 'hp',    art: 'coat' },
    { id: 'kopftuch', slot: 'kleid',   name: 'Kopftuch',       g: 'n', main: 'hp',    art: 'bandana' },
    { id: 'ring',     slot: 'schmuck', name: 'Goldring',       g: 'm', main: 'crit',  art: 'ring' },
    { id: 'kompass',  slot: 'schmuck', name: 'Kompass',        g: 'm', main: 'spd',   art: 'compass' },
    { id: 'amulett',  slot: 'schmuck', name: 'Amulett',        g: 'n', main: 'dodge', art: 'ring' },
    { id: 'kochmesser', slot: 'waffe', name: 'Kochmesser',     g: 'n', main: 'atk',   art: 'sword' },
    { id: 'perlen',   slot: 'schmuck', name: 'Perlenkette',    g: 'f', main: 'crit',  art: 'ring' }
  ],
  affixes: {
    atk:    { name: 'Angriff',       min: 1,    max: 3,    adj: 'Wuchtig',   fmt: v => `+${v} Angriff` },
    hp:     { name: 'Leben',         min: 4,    max: 10,   adj: 'Zäh',       fmt: v => `+${v} Leben` },
    spd:    { name: 'Tempo',         min: 1,    max: 1,    adj: 'Flink',     fmt: v => `+${v} Tempo` },
    crit:   { name: 'Krit',          min: 0.03, max: 0.06, adj: 'Scharf',    fmt: v => `+${Math.round(v * 100)} % Krit-Chance` },
    dodge:  { name: 'Ausweichen',    min: 0.02, max: 0.05, adj: 'Schattig',  fmt: v => `+${Math.round(v * 100)} % Ausweichen` },
    armor:  { name: 'Rüstung',       min: 1,    max: 2,    adj: 'Gehärtet',  fmt: v => `+${v} Rüstung` },
    dmgPct: { name: 'Schaden',       min: 0.03, max: 0.07, adj: 'Wild',      fmt: v => `+${Math.round(v * 100)} % Schaden` }
  },
  // Hauptwert ist etwas stärker als ein Zusatzwert
  mainMult: 1.4,
  rarityMult: [1, 1.2, 1.45, 1.8],
  perSea: 0.2,                        // jedes Meer weiter: Werte um 20 % höher
  dropChance: { boss: 0.55, raid: 0.9, perLoop: 0.1 },
  weights: [50, 32, 14, 4],           // gewöhnlich, selten, episch, legendär
  bagMax: 40,
  caps: { crit: 0.3, dodge: 0.2 },    // Obergrenzen pro Figur
  scrap: [6, 14, 35, 90],             // Berry beim Zerlegen
  // Meersplitter: aus der Endlos-Fahrt (pro geschaffte Runde Meer+1 Stück) und vom Zerlegen seltener Teile.
  // Damit lassen sich Zusatzwerte neu würfeln (Seltenheit, Teil und Hauptwert bleiben)
  shardScrap: [0, 0, 1, 3],
  snackScrap: [0, 0, 1, 2],          // Proviant 🍙 beim Zerlegen (Episch/Legendär)
  rerollCost: [1, 2, 4, 7]
};

// Beute-Atlas (20t): Jeder Meeres-Boss hat ein eigenes Fundstück. Es fällt NUR bei ihm, und nur als Episch oder Legendär.
// Steht es auf deiner Wunschliste, legt sich der Boss mehr ins Zeug (mehr Episches, öfter das Fundstück).
//   base: Grundteil (Platz + Hauptwert), extra: fester Zusatzwert, text: ein trockener Satz
GL.data.crewGear.sigs = [
  { id: 'sig-jitte',     boss: 'smoker',    base: 'saebel',      extra: 'armor',  name: 'Russ’ Jitte',          text: 'Riecht nach Zigarre. Hält trotzdem.' },
  { id: 'sig-kiribachi', boss: 'arlong',    base: 'dreizack',    extra: 'dmgPct', name: 'Bracks Kiribachi',      text: 'Eine Säge mit Ambitionen.' },
  { id: 'sig-sandring',  boss: 'crocodile', base: 'ring',        extra: 'dodge',  name: 'Sirokks Sandring',    text: 'Rinnt dir nie durch die Finger. Alles andere schon.' },
  { id: 'sig-trommel',   boss: 'enel',      base: 'amulett',     extra: 'spd',    name: 'Zirrus’ Trommelamulett',   text: 'Brummt leise, wenn es gewittert. Also ständig.' },
  { id: 'sig-haiweste',  boss: 'hody',      base: 'weste',       extra: 'atk',    name: 'Grimmflosses Haifischweste',    text: 'Zäh, nass und schlecht gelaunt.' },
  { id: 'sig-zielkompass', boss: 'vander',  base: 'kompass',     extra: 'crit',   name: 'Ankerlos’ Zielkompass',    text: 'Zeigt immer auf das, was du gerade angefasst hast.' },
  { id: 'sig-taubentuch', boss: 'rob-lucci', base: 'kopftuch',   extra: 'dodge',  name: 'Kralls Taubenhalstuch',  text: 'Die Taube ist nicht im Lieferumfang.' },
  { id: 'sig-stierhorn', boss: 'kaku',      base: 'entermesser', extra: 'spd',    name: 'Stelz’ Stierhorn-Klinge', text: 'Mit eckigem Griff. Wie die Nase.' },
  { id: 'sig-schatten',  boss: 'moria',     base: 'perlen',      extra: 'dodge',  name: 'Dämmerlings Schattenkette',   text: 'Wirft einen Schatten. Manchmal sogar den eigenen.' },
  { id: 'sig-bibel',     boss: 'kuma',      base: 'mantel',      extra: 'armor',  name: 'Tatz’ Bibelmantel',      text: 'Schwer, ruhig und völlig unbeeindruckt.' }
];
GL.data.crewGear.sigChance = { base: 0.4, wish: 0.75 };   // Anteil der epischen/legendären Drops dieses Bosses, die sein Fundstück sind
GL.data.crewGear.wishMax = 3;
