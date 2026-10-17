// Profil-Kosmetik zum Freispielen: Hintergründe, Rahmen, Avatar-Animationen und Titel.
// Sie zeigen sich im Profil und in der Rangliste. Keine Spielvorteile, nur zum Angeben.
//   req = Bedingung (alle müssen erfüllt sein), leer = von Anfang an frei:
//     rank (Piratenrang 1-14), runs, wins, kos, maxHit, bosses (Inselbosse gesamt),
//     hunted (Kopfgeld-Ziele gesamt), raids, artifacts (verschiedene gefunden), reached (0-2: Meer erreicht)
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
    { id: 'legende',    name: 'Legende',           req: { wins: 5 } }
  ],
  frames: [
    { id: 'holz',       name: 'Holz',              req: {} },
    { id: 'tau',        name: 'Schiffstau',        req: { runs: 5 } },
    { id: 'silber',     name: 'Silber',            req: { rank: 5 } },
    { id: 'steckbrief', name: 'Steckbrief',        req: { hunted: 5 } },
    { id: 'gold',       name: 'Gold',              req: { rank: 9 } },
    { id: 'krone',      name: 'Krone',             req: { wins: 3 } }
  ],
  animations: [
    { id: 'ruhig',      name: 'Ruhig',             req: {} },
    { id: 'wippen',     name: 'Wippen',            req: { runs: 2 } },
    { id: 'huepfen',    name: 'Hüpfen',            req: { kos: 50 } },
    { id: 'drehen',     name: 'Pirouette',         req: { bosses: 3 } },
    { id: 'funkeln',    name: 'Funkeln',           req: { artifacts: 3 } },
    { id: 'flammen',    name: 'Flammen-Aura',      req: { maxHit: 60 } }
  ],
  titles: [
    { id: 'neuling',    name: 'Neuling auf See',   req: {} },
    { id: 'kaempfer',   name: 'Raufbold',          req: { kos: 100 } },
    { id: 'jaeger',     name: 'Kopfgeldjäger',     req: { hunted: 3 } },
    { id: 'bezwinger',  name: 'Bossbezwinger',     req: { bosses: 6 } },
    { id: 'sammler',    name: 'Sammler',           req: { artifacts: 6 } },
    { id: 'wuchtig',    name: 'Der Wuchtige',      req: { maxHit: 80 } },
    { id: 'legende',    name: 'Legende der Meere', req: { wins: 5 } }
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
