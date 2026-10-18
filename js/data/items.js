// Ausrüstung: Gegenstände, die man einzelnen Crewmitgliedern anlegt (ein Platz pro Figur).
// Man findet sie im Run (Kopfgeld-Ziele, Bosse, Schatztruhen), behält sie danach in der Truhe,
// verbessert sie in der Schmiede (Stufe +1 bis +5) und nimmt einige in den nächsten Run mit.
//   stats = Werte pro Seltenheit [Gewöhnlich, Selten, Episch, Legendär]
//   up    = was jede Schmiede-Stufe zusätzlich gibt
//   Werte: atk, hp (mehr Max-Leben), spd, crit (Anteil), armor, dmgPct (Anteil), regen
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.items = [
  { id: 'saebel',     name: 'Säbel',            icon: 'kanone',     stats: { atk: [2, 3, 5, 7] },                                  up: { atk: 1 } },
  { id: 'schlagring', name: 'Schlagring',       icon: 'sake',       stats: { atk: [1, 2, 3, 5], crit: [0.03, 0.05, 0.08, 0.12] },  up: { atk: 1 } },
  { id: 'muskete',    name: 'Muskete',          icon: 'kanone',     stats: { atk: [2, 3, 4, 6], spd: [0, 0, 1, 1] },               up: { atk: 1 } },
  { id: 'weste',      name: 'Lederweste',       icon: 'fleisch',    stats: { hp: [6, 10, 15, 22] },                                up: { hp: 3 } },
  { id: 'panzer',     name: 'Eisenpanzer',      icon: 'dial',       stats: { hp: [4, 6, 10, 14], armor: [1, 1, 2, 3] },            up: { hp: 2 } },
  { id: 'mantel',     name: 'Kapitänsmantel',   icon: 'steckbrief', stats: { hp: [4, 7, 10, 14], regen: [0, 1, 1, 2] },            up: { hp: 2 } },
  { id: 'stiefel',    name: 'Seestiefel',       icon: 'logport',    stats: { spd: [1, 1, 2, 3] },                                  up: { spd: 1 } },
  { id: 'anhaenger',  name: 'Glücksanhänger',   icon: 'vivre',      stats: { crit: [0.05, 0.08, 0.12, 0.18] },                     up: { crit: 0.02 } },
  { id: 'amulett',    name: 'Kompass-Amulett',  icon: 'logport',    stats: { spd: [1, 1, 1, 2], dmgPct: [0.03, 0.05, 0.08, 0.12] }, up: { dmgPct: 0.02 } },
  { id: 'fernrohr',   name: 'Fernrohr',         icon: 'haki',       stats: { dmgPct: [0.05, 0.08, 0.12, 0.18] },                   up: { dmgPct: 0.02 } },
  // Neu zur großen Neuauflage (px = eigenes 8x8-Pixelbild: X = Seltenheitsfarbe, H = Holz/Braun)
  { id: 'knochen',    name: 'Fleischkeule am Knochen', icon: 'fleisch', stats: { hp: [4, 6, 9, 13], atk: [1, 1, 2, 3] },             up: { hp: 2 },
    px: ['........', '..XXX...', '.XXXXX..', 'XXXXXXX.', 'XXXXXXX.', '.XXXXXH.', '..XXX.HH', '......HH'] },
  { id: 'rumbleball', name: 'Rumble-Ball-Dose',  icon: 'vivre',      stats: { dmgPct: [0.04, 0.06, 0.09, 0.13], spd: [0, 0, 1, 1] }, up: { dmgPct: 0.02 },
    px: ['..HHHH..', '.XXXXXX.', '.X.XX.X.', '.XXXXXX.', '.X.XX.X.', '.XXXXXX.', '.XXXXXX.', '..HHHH..'] },
  { id: 'sandalen',   name: 'Strohsandalen',     icon: 'logport',    stats: { spd: [1, 1, 1, 2], crit: [0.02, 0.03, 0.05, 0.07] },  up: { crit: 0.02 },
    px: ['........', '.XXX....', 'XHXXX...', 'XXHXXX..', '.XXXXXX.', '..XXXXXX', 'HHHHHHHH', '........'] },
  { id: 'schuerze',   name: 'Kochschürze',       icon: 'fleisch',    stats: { hp: [3, 5, 7, 10], regen: [1, 1, 2, 2] },             up: { hp: 2 },
    px: ['..H..H..', '..H..H..', '.XXXXXX.', '.XXXXXX.', '.XHHHHX.', '.XXXXXX.', '.XXXXXX.', '..XXXX..'] }
];
