// Piratenrang: Account-Level über alle Runs.
// xp = Erfahrung, die man für diesen Rang insgesamt braucht.
// reward = Belohnung beim Aufstieg: { berry } und/oder { gear: id aus gear.js }
// Je 5 Ränge bilden eine Stufe mit eigenem Emblem: Bronze, Silber, Gold, Legende, Mythisch.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.ranks = [
  // Bronze: Ankermünze
  { name: 'Schiffsjunge',             xp: 0,     reward: {} },
  { name: 'Deckschrubber',            xp: 40,    reward: { berry: 50 } },
  { name: 'Matrose',                  xp: 100,   reward: { berry: 80 } },
  { name: 'Bootsmann',                xp: 180,   reward: { berry: 100, gear: 'proviant' } },
  { name: 'Kanonier',                 xp: 290,   reward: { berry: 120 } },
  // Silber: Schild mit gekreuzten Klingen
  { name: 'Navigator',                xp: 430,   reward: { berry: 150 } },
  { name: 'Erster Maat',              xp: 600,   reward: { berry: 180, gear: 'muenze' } },
  { name: 'Kapitän',                  xp: 820,  reward: { berry: 220 } },
  { name: 'Rookie',                   xp: 1100,  reward: { berry: 260 } },
  { name: 'Kopfgeld-Neuling',         xp: 1500,  reward: { berry: 300 } },
  // Gold: Stern
  { name: 'Supernova',                xp: 2750,  reward: { berry: 340, gear: 'fruchtkorb' } },
  { name: 'Schrecken des Ostmeers',  xp: 3350,  reward: { berry: 380 } },
  { name: 'Held der Wilden See',        xp: 4000,  reward: { berry: 420 } },
  { name: 'Bezwinger der CP9',        xp: 4700,  reward: { berry: 460 } },
  { name: 'Samurai der Meere',        xp: 5450,  reward: { berry: 500, gear: 'bordkanone' } },
  // Legende: Totenkopf mit Krone
  { name: 'Vize-Kapitän der Flotte',  xp: 6250,  reward: { berry: 550 } },
  { name: 'Kommandant eines Kaisers', xp: 7100,  reward: { berry: 600 } },
  { name: 'Legende vom Spiegel-Archipel',      xp: 8000,  reward: { berry: 650, gear: 'proviant' } },
  { name: 'Pirat der Neuen Welt',     xp: 9000,  reward: { berry: 700 } },
  { name: 'Herausforderer der Kaiser', xp: 10100, reward: { berry: 800 } },
  // Mythisch: Strohhut
  { name: 'Kaiser der Meere',         xp: 11300, reward: { berry: 900, gear: 'bordkanone' } },
  { name: 'Piratenkönig',             xp: 12600, reward: { berry: 1200 } }
];
