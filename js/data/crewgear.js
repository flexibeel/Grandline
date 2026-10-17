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
    { id: 'schmuck', name: 'Schmuck' }
  ],
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
    { id: 'amulett',  slot: 'schmuck', name: 'Amulett',        g: 'n', main: 'dodge', art: 'ring' }
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
  scrap: [6, 14, 35, 90]              // Berry beim Zerlegen
};
