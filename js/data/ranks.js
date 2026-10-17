// Piratenrang: Account-Level über alle Runs.
// xp = Erfahrung, die man für diesen Rang insgesamt braucht.
// reward = Belohnung beim Aufstieg: { berry } und/oder { gear: id aus gear.js }
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.ranks = [
  { name: 'Schiffsjunge',          xp: 0,     reward: {} },
  { name: 'Deckschrubber',         xp: 60,    reward: { berry: 50 } },
  { name: 'Matrose',               xp: 150,   reward: { berry: 80 } },
  { name: 'Bootsmann',             xp: 280,   reward: { berry: 100, gear: 'proviant' } },
  { name: 'Kanonier',              xp: 450,   reward: { berry: 120 } },
  { name: 'Navigator',             xp: 680,   reward: { berry: 150 } },
  { name: 'Erster Maat',           xp: 960,   reward: { berry: 180, gear: 'muenze' } },
  { name: 'Kapitän',               xp: 1300,  reward: { berry: 220 } },
  { name: 'Rookie',                xp: 1720,  reward: { berry: 260 } },
  { name: 'Supernova',             xp: 2220,  reward: { berry: 300, gear: 'fruchtkorb' } },
  { name: 'Samurai der Meere',     xp: 2820,  reward: { berry: 350 } },
  { name: 'Kommandant eines Kaisers', xp: 3520, reward: { berry: 400 } },
  { name: 'Kaiser der Meere',      xp: 4320,  reward: { berry: 500, gear: 'bordkanone' } },
  { name: 'Piratenkönig',          xp: 5300,  reward: { berry: 800 } }
];
