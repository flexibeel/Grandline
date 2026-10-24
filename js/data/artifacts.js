// Artefakte: epische Fundstücke für den dauerhaften Fortschritt (Schatzkammer im Hauptquartier).
// Sie droppen von Inselbossen, Raids und Kopfgeld-Zielen (Chancen in config.trophyChance),
// bleiben für immer und werden mit jedem weiteren Fund stärker (Stufe 1 bis 5).
// Ausgerüstete Artefakte wirken in jedem Run, Plätze gibt es über den Piratenrang.
//
//   from  = ids der Gegner, die es fallen lassen
//   per   = Wert pro Stufe (Stufe 1 bis 5), im Text {v}
//   pct   = Wert als Prozent anzeigen
//   mod   = Kampfwert für Figuren: { scope, stat }   (scope wie in types.js)
//   flag  = Sonderregel (siehe effects.js flags), z. B. bossStartCut
//   start = Wirkung zu Beginn des Runs: 'hp' (ganze Crew mehr Leben), 'charge' (Spezialangriff geladen)
//   berry = Anteil mehr Berry am Ende des Runs
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.artifacts = [
  // Inselbosse
  { id: 'jitte',      name: 'Russ’ Jitte',          from: ['smoker'],    per: [0.04, 0.06, 0.08, 0.10, 0.13], pct: true, flag: 'bossStartCut',
    text: 'Inselbosse beginnen den Kampf mit {v} weniger Leben.' },
  { id: 'kiribachi',  name: 'Bracks Kiribachi',      from: ['arlong'],    per: [1, 2, 2, 3, 4], mod: { scope: 'type:kraft', stat: 'atk' },
    text: 'Kraft-Figuren +{v} Angriff.' },
  { id: 'goldhaken',  name: 'Sirokks Goldhaken',   from: ['crocodile'], per: [0.06, 0.09, 0.12, 0.16, 0.20], pct: true, berry: true,
    text: '{v} mehr Berry am Ende jedes Runs.' },
  { id: 'trommeln',   name: 'Zirrus’ Donnertrommeln',   from: ['enel'],      per: [1, 1, 2, 2, 2], start: 'charge',
    text: 'Der Spezialangriff startet mit {v} Ladung.' },
  { id: 'zylinder',   name: 'Kralls Zylinder',        from: ['rob-lucci'], per: [0.05, 0.08, 0.11, 0.14, 0.18], pct: true, mod: { scope: 'role:kaempfer', stat: 'dmgPct' },
    text: 'Kämpfer machen {v} mehr Schaden.' },
  { id: 'kakuklinge', name: 'Stelz’ Arashi-Klinge',    from: ['kaku'],      per: [0.04, 0.06, 0.08, 0.10, 0.13], pct: true, mod: { scope: 'type:klinge', stat: 'crit' },
    text: 'Klinge-Figuren +{v} Krit-Chance.' },
  // Raids (droppen immer)
  { id: 'brille',     name: 'Glanz’ Sonnenbrille',   from: ['kizaru'],    per: [1, 1, 2, 2, 3], mod: { scope: 'all', stat: 'spd' },
    text: 'Ganze Crew +{v} Tempo.' },
  { id: 'federmantel', name: 'Rosés Federmantel', from: ['doflamingo'], per: [0.03, 0.05, 0.07, 0.09, 0.12], pct: true, mod: { scope: 'all', stat: 'crit' },
    text: 'Ganze Crew +{v} Krit-Chance.' },
  // Kopfgeld-Ziele
  { id: 'kriegschild', name: 'Don Bollwerks Schild',     from: ['buggy', 'kuro', 'krieg', 'morgan', 'hatchan'], per: [3, 5, 7, 9, 12], start: 'hp',
    text: 'Ganze Crew startet mit +{v} Leben.' },
  { id: 'wapolkrone', name: 'Mampfs Blechkrone',      from: ['mr3', 'wapol', 'bellamy', 'mr9', 'ohm'], per: [1, 1, 2, 2, 3], mod: { scope: 'role:brecher', stat: 'armor' },
    text: 'Brecher erleiden {v} weniger Schaden.' },
  { id: 'denden',     name: 'Goldene Teleschnecke',   from: ['fukuro', 'spandam', 'foxy', 'nero', 'blueno', 'jabra', 'mr1'], per: [1, 1, 2, 2, 3], mod: { scope: 'all', stat: 'regen' },
    text: 'Ganze Crew heilt {v} Leben pro Runde.' }
];
