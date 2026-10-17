// Banden: dritte Synergie-Ebene neben Kampfstil und Rolle.
// Aufbau wie in types.js (tiers mit mods).
// Die Strohhutbande hat mehr Mitglieder, deshalb liegen ihre Stufen höher.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.factions = {
  strohhut: {
    name: 'Strohhutbande',
    tiers: [
      { n: 3, text: 'Ganze Crew +10 % Schaden', mods: [{ scope: 'all', dmgPct: 0.1 }] },
      { n: 6, text: 'Ganze Crew +25 % Schaden und heilt 1 Leben pro Runde', mods: [{ scope: 'all', dmgPct: 0.25, regen: 1 }] }
    ]
  },
  marine: {
    name: 'Marine',
    tiers: [
      { n: 2, text: 'Ganze Crew erleidet 1 weniger Schaden', mods: [{ scope: 'all', armor: 1 }] },
      { n: 4, text: 'Ganze Crew erleidet 3 weniger Schaden', mods: [{ scope: 'all', armor: 3 }] }
    ]
  },
  cp9: {
    name: 'CP9',
    tiers: [
      { n: 2, text: 'CP9 weicht 15 % der Angriffe aus', mods: [{ scope: 'faction:cp9', dodge: 0.15 }] },
      { n: 4, text: 'CP9 weicht 30 % aus und +20 % Krit-Chance', mods: [{ scope: 'faction:cp9', dodge: 0.3, crit: 0.2 }] }
    ]
  },
  weissbart: {
    name: 'Weißbart-Bande',
    tiers: [
      { n: 2, text: 'Familie: ganze Crew heilt 2 Leben pro Runde', mods: [{ scope: 'all', regen: 2 }] },
      { n: 3, text: 'Familie: ganze Crew heilt 4 Leben pro Runde und erleidet 1 weniger Schaden', mods: [{ scope: 'all', regen: 4, armor: 1 }] }
    ]
  },
  samurai: {
    name: 'Samurai der Meere',
    tiers: [
      { n: 2, text: 'Samurai +20 % Schaden und +10 % Krit-Chance', mods: [{ scope: 'faction:samurai', dmgPct: 0.2, crit: 0.1 }] },
      { n: 3, text: 'Samurai +40 % Schaden und +20 % Krit-Chance', mods: [{ scope: 'faction:samurai', dmgPct: 0.4, crit: 0.2 }] }
    ]
  },
  baroque: {
    name: 'Baroque Works',
    tiers: [
      { n: 2, text: 'Ganze Crew +2 Tempo', mods: [{ scope: 'all', spd: 2 }] },
      { n: 4, text: 'Ganze Crew +3 Tempo und +2 Angriff', mods: [{ scope: 'all', spd: 3, atk: 2 }] }
    ]
  },
  buggy: {
    name: 'Buggy-Piraten',
    tiers: [
      { n: 2, text: 'Großes Kino: ganze Crew +20 % Schaden gegen Bosse', mods: [{ scope: 'all', bossPct: 0.2 }] },
      { n: 4, text: 'Großes Kino: ganze Crew +45 % Schaden gegen Bosse und +1 Tempo', mods: [{ scope: 'all', bossPct: 0.45, spd: 1 }] }
    ]
  },
  fischmensch: {
    name: 'Arlong-Bande',
    tiers: [
      { n: 2, text: 'Fischmenschen +3 Angriff und erleiden 1 weniger Schaden', mods: [{ scope: 'faction:fischmensch', atk: 3, armor: 1 }] },
      { n: 3, text: 'Fischmenschen +6 Angriff, erleiden 3 weniger Schaden. Ganze Crew heilt 1 pro Runde', mods: [{ scope: 'faction:fischmensch', atk: 6, armor: 3 }, { scope: 'all', regen: 1 }] }
    ]
  },
  revolution: {
    name: 'Revolutionsarmee',
    tiers: [
      { n: 2, text: 'Ganze Crew +1 Tempo und +30 % Krit-Schaden', mods: [{ scope: 'all', spd: 1, critMult: 0.3 }] },
      { n: 4, text: 'Ganze Crew +2 Tempo, +70 % Krit-Schaden und +10 % Krit-Chance', mods: [{ scope: 'all', spd: 2, critMult: 0.7, crit: 0.1 }] }
    ]
  },
  rothaar: {
    name: 'Rothaar-Piraten',
    tiers: [
      { n: 2, text: 'Haki: ganze Crew +10 % Schaden und erleidet 1 weniger Schaden', mods: [{ scope: 'all', dmgPct: 0.1, armor: 1 }] },
      { n: 4, text: 'Königs-Haki: ganze Crew +22 % Schaden, erleidet 2 weniger Schaden', mods: [{ scope: 'all', dmgPct: 0.22, armor: 2 }] }
    ]
  }
  ,
  supernova: {
    name: 'Schlimmste Generation',
    tiers: [
      { n: 2, text: 'Supernovas +2 Angriff und +10 % Krit-Chance', mods: [{ scope: 'faction:supernova', atk: 2, crit: 0.1 }] },
      { n: 4, text: 'Supernovas +5 Angriff, +20 % Krit-Chance und härtere Krits', mods: [{ scope: 'faction:supernova', atk: 5, crit: 0.2, critMult: 0.3 }] }
    ]
  },
  thriller: {
    name: 'Thriller-Bark-Piraten',
    tiers: [
      { n: 2, text: 'Untote Zähigkeit: ganze Crew heilt 2 pro Runde und weicht 8 % aus', mods: [{ scope: 'all', regen: 2, dodge: 0.08 }] },
      { n: 4, text: 'Schattenarmee: ganze Crew heilt 4 pro Runde und weicht 15 % aus', mods: [{ scope: 'all', regen: 4, dodge: 0.15 }] }
    ]
  }
};

// Bündnisse: Sind die Set-Boni zweier Banden GLEICHZEITIG aktiv, gibt es einen Extra-Bonus.
// So lohnt es sich, zwei Banden gezielt zu mischen statt nur eine voll zu machen.
GL.data.alliances = [
  { a: 'strohhut', b: 'revolution', name: 'Wille des D.',       text: 'Ganze Crew +12 % Krit-Chance.',                         mods: [{ scope: 'all', crit: 0.12 }] },
  { a: 'marine',   b: 'cp9',        name: 'Weltregierung',      text: 'Ganze Crew erleidet 10 % weniger Schaden.',              mods: [{ scope: 'all', guard: 0.1 }] },
  { a: 'weissbart', b: 'rothaar',   name: 'Treffen der Kaiser', text: 'Ganze Crew +10 % Schaden und +20 % gegen Bosse.',        mods: [{ scope: 'all', dmgPct: 0.1, bossPct: 0.2 }] },
  { a: 'buggy',    b: 'baroque',    name: 'Impel-Down-Ausbruch', text: 'Ganze Crew +2 Tempo und +8 % Ausweichen.',              mods: [{ scope: 'all', spd: 2, dodge: 0.08 }] },
  { a: 'fischmensch', b: 'samurai', name: 'Fischmenscheninsel', text: 'Ganze Crew heilt 2 pro Runde und erleidet 1 weniger Schaden.', mods: [{ scope: 'all', regen: 2, armor: 1 }] },
  { a: 'strohhut', b: 'samurai',    name: 'Piratenbündnis',     text: 'Ganze Crew +10 % Schaden.',                              mods: [{ scope: 'all', dmgPct: 0.1 }] },
  { a: 'revolution', b: 'marine',   name: 'Familie Monkey',     text: 'Ganze Crew +3 Angriff.',                                 mods: [{ scope: 'all', atk: 3 }] },
  { a: 'supernova', b: 'strohhut',  name: 'Chaos auf Sabaody',  text: 'Ganze Crew +2 Tempo und +8 % Schaden.',                   mods: [{ scope: 'all', spd: 2, dmgPct: 0.08 }] },
  { a: 'thriller', b: 'baroque',    name: 'Schattenspiel',      text: 'Ganze Crew weicht 10 % aus und erleidet 1 weniger Schaden.', mods: [{ scope: 'all', dodge: 0.1, armor: 1 }] }
];
