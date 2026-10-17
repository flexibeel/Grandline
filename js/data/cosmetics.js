// Profil-Kosmetik zum Freispielen: Hintergründe, Rahmen, Avatar-Animationen und Titel.
// Sie zeigen sich im Profil und in der Rangliste. Keine Spielvorteile, nur zum Angeben.
//   req = Bedingung (alle müssen erfüllt sein), leer = von Anfang an frei:
//     rank (Piratenrang 1-14), runs, wins, kos, maxHit, bosses (Inselbosse gesamt),
//     hunted (Kopfgeld-Ziele gesamt), raids, artifacts (verschiedene gefunden), reached (0-2: Meer erreicht),
//     islands (verschiedene Inseln besucht), heat (höchste Kopfgeld-Stufe)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.cosmetics = {
  backgrounds: [
    { id: 'meer',       name: 'Ruhige See',        req: {} },
    { id: 'morgen',     name: 'Morgenrot',         req: { rank: 2 } },
    { id: 'wueste',     name: 'Wüstenwind',        req: { reached: 1 } },
    { id: 'nacht',      name: 'Sternennacht',      req: { reached: 2 } },
    { id: 'sturm',      name: 'Gewittersturm',     req: { raids: 1 } },
    { id: 'kirsch',     name: 'Kirschblüten',      req: { rank: 6 } },
    { id: 'gold',       name: 'Schatzkammer',      req: { artifacts: 6 } },
    { id: 'legende',    name: 'Legende',           req: { wins: 5 } },
    { id: 'kokos',      name: 'Mandarinenhain',    req: { islands: 4 } },
    { id: 'schnee',     name: 'Winterinsel',       req: { islands: 8 } },
    { id: 'himmel',     name: 'Wolkenmeer',        req: { reached: 1, islands: 10 } },
    { id: 'tiefsee',    name: 'Tiefsee',           req: { runs: 25 } },
    { id: 'marine',     name: 'Marine-Basis',      req: { hunted: 15 } },
    { id: 'lava',       name: 'Vulkan',            req: { maxHit: 120 } },
    { id: 'galaxie',    name: 'Sternenmeer',       req: { rank: 12 } },
    { id: 'regenbogen', name: 'Regenbogen',        req: { islands: 18 } }
  ],
  frames: [
    { id: 'holz',       name: 'Holz',              req: {} },
    { id: 'tau',        name: 'Schiffstau',        req: { runs: 5 } },
    { id: 'silber',     name: 'Silber',            req: { rank: 5 } },
    { id: 'steckbrief', name: 'Steckbrief',        req: { hunted: 5 } },
    { id: 'gold',       name: 'Gold',              req: { rank: 9 } },
    { id: 'krone',      name: 'Krone',             req: { wins: 3 } },
    { id: 'rottau',     name: 'Rotes Tau',         req: { runs: 10 } },
    { id: 'eisen',      name: 'Eisen',             req: { bosses: 5 } },
    { id: 'rubin',      name: 'Rubin',             req: { hunted: 10 } },
    { id: 'saphir',     name: 'Saphir',            req: { artifacts: 9 } },
    { id: 'smaragd',    name: 'Smaragd',           req: { heat: 2 } },
    { id: 'feuer',      name: 'Feuer',             req: { kos: 500 } },
    { id: 'regenbogen', name: 'Regenbogen',        req: { wins: 10 } }
  ],
  animations: [
    { id: 'ruhig',      name: 'Ruhig',             req: {} },
    { id: 'wippen',     name: 'Wippen',            req: { runs: 2 } },
    { id: 'huepfen',    name: 'Hüpfen',            req: { kos: 50 } },
    { id: 'drehen',     name: 'Pirouette',         req: { bosses: 3 } },
    { id: 'funkeln',    name: 'Funkeln',           req: { artifacts: 3 } },
    { id: 'flammen',    name: 'Flammen-Aura',      req: { maxHit: 60 } },
    { id: 'schweben',   name: 'Schweben',          req: { islands: 6 } },
    { id: 'puls',       name: 'Herzschlag',        req: { runs: 15 } },
    { id: 'zittern',    name: 'Kampfeslust',       req: { kos: 250 } },
    { id: 'blitz',      name: 'Blitz-Aura',        req: { raids: 3 } },
    { id: 'konfetti',   name: 'Konfetti',          req: { wins: 2 } }
  ],
  titles: [
    { id: 'neuling',    name: 'Neuling auf See',   req: {} },
    { id: 'kaempfer',   name: 'Raufbold',          req: { kos: 100 } },
    { id: 'jaeger',     name: 'Kopfgeldjäger',     req: { hunted: 3 } },
    { id: 'bezwinger',  name: 'Bossbezwinger',     req: { bosses: 6 } },
    { id: 'sammler',    name: 'Sammler',           req: { artifacts: 6 } },
    { id: 'wuchtig',    name: 'Der Wuchtige',      req: { maxHit: 80 } },
    { id: 'legende',    name: 'Legende der Meere', req: { wins: 5 } },
    { id: 'matrose',    name: 'Matrose',           req: { runs: 3 } },
    { id: 'rookie',     name: 'Super-Rookie',      req: { rank: 4 } },
    { id: 'entdecker',  name: 'Entdecker',         req: { islands: 6 } },
    { id: 'schatz',     name: 'Schatzjäger',       req: { artifacts: 3 } },
    { id: 'kartograph', name: 'Kartograph',        req: { islands: 12 } },
    { id: 'hitzkopf',   name: 'Hitzkopf',          req: { heat: 3 } },
    { id: 'sturm',      name: 'Sturmbezwinger',    req: { raids: 2 } },
    { id: 'samurai',    name: 'Ein-Schlag-Samurai', req: { maxHit: 120 } },
    { id: 'marinefeind', name: 'Albtraum der Marine', req: { kos: 500 } },
    { id: 'reisender',  name: 'Weltreisender',     req: { islands: 18 } },
    { id: 'unermuedlich', name: 'Unermüdlich',     req: { runs: 50 } },
    { id: 'kaiser',     name: 'Kaiser der Meere',  req: { rank: 14 } }
  ],
  // Piratenflagge: kleines Abzeichen am Porträt (Profil, Rangliste)
  flags: [
    { id: 'keine',      name: 'Keine Flagge',      req: {} },
    { id: 'totenkopf',  name: 'Totenkopf',         req: { runs: 1 } },
    { id: 'anker',      name: 'Anker',             req: { rank: 3 } },
    { id: 'stern',      name: 'Stern',             req: { wins: 1 } },
    { id: 'schwerter',  name: 'Gekreuzte Klingen', req: { hunted: 5 } },
    { id: 'sonne',      name: 'Sonne',             req: { islands: 8 } },
    { id: 'blume',      name: 'Blüte',             req: { rank: 7 } },
    { id: 'blitz',      name: 'Blitz',             req: { raids: 1 } },
    { id: 'krone',      name: 'Krone',             req: { bosses: 6 } },
    { id: 'drache',     name: 'Drache',            req: { wins: 8 } }
  ]
};

// Teile für den eigenen Piraten (Charakter-Editor)
GL.data.charParts = {
  hair:   ['#1a1a1a', '#6b4a2a', '#c8a040', '#e8d070', '#c0392b', '#3f8f4f', '#2f5aa8', '#e870a0', '#f0f0f0', '#7a4a9a'],
  skin:   ['#f8dcc0', '#f2c9a0', '#d9a87a', '#b07a50', '#7a4a2a', '#6aa0c8'],
  shirt:  ['#d9423a', '#2f6fb0', '#3d6b46', '#e8c25a', '#f0f0f0', '#222222', '#7a4fc4', '#e8862a', '#e870a0'],
  pants:  ['#3b5a8c', '#2a2a2a', '#5a3a2a', '#3a4a3a', '#e8e8e8', '#7a2a2a'],
  hat:    ['', 'straw', 'band', 'cap', 'hood', 'afro'],
  hatColor: ['#e8c25a', '#222222', '#c0392b', '#f0f0f0', '#2f6fb0', '#3d6b46']
};
