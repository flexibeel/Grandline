// Aufträge (Quests): immer 3 offen. Abgeholt -> sofort ein neuer. Jeden Tag frische Aufträge.
//   kind = Zähler (siehe GL.meta.lifeStats), n = Ziel je Stufe (Stufe wächst mit dem Piratenrang)
//   max: true = bester Einzelwert zählt (nicht aufaddiert)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.quests = [
  { kind: 'dmg',       icon: '💥', text: 'Verursache {n} Schaden',                 n: [800, 1600, 3200] },
  { kind: 'kos',       icon: '✖',  text: 'Schicke {n} Gegner k.o.',                n: [15, 30, 60] },
  { kind: 'crits',     icon: '✷',  text: 'Lande {n} kritische Treffer',            n: [8, 16, 30] },
  { kind: 'ults',      icon: '⚡', text: 'Entfessle {n} Ultis',                     n: [5, 10, 20] },
  { kind: 'won',       icon: '⚔',  text: 'Gewinne {n} Kämpfe',                      n: [8, 15, 25] },
  { kind: 'hunted',    icon: '📜', text: 'Besiege {n} Bösewichte oder Kopfgeld-Ziele', n: [2, 4, 8] },
  { kind: 'bosses',    icon: '👑', text: 'Besiege {n}× einen Inselboss',                  n: [1, 2, 4] },
  { kind: 'steps',     icon: '⛵', text: 'Segle {n} Etappen weit',                  n: [15, 30, 60] },
  { kind: 'ko_kraft',  icon: '👊', text: 'Besiege {n} Gegner mit Kampfstil Kraft',  n: [8, 15, 25] },
  { kind: 'ko_klinge', icon: '🗡', text: 'Besiege {n} Gegner mit Kampfstil Klinge', n: [8, 15, 25] },
  { kind: 'ko_technik', icon: '🎯', text: 'Besiege {n} Gegner mit Kampfstil Technik', n: [8, 15, 25] },
  { kind: 'duels',     icon: '🏴', text: 'Gewinne {n}× ein Stammcrew-Duell',            n: [1, 3, 5] },
  { kind: 'maxHit',    icon: '🔨', text: 'Lande einen Treffer mit {n}+ Schaden',    n: [40, 70, 110], max: true }
];
// Belohnung je Stufe: Berry und Rang-EP
GL.data.questReward = [{ berry: 60, xp: 30 }, { berry: 110, xp: 60 }, { berry: 180, xp: 100 }];
