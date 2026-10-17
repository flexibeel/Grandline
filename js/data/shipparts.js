// Schiff anpassen (Hauptquartier, Startbild, Seekarte): Segel, Rumpf, Flagge, Galionsfigur.
// Freischalten wie Kosmetik (req, siehe cosmetics.js). Nur Optik, keine Spielvorteile.
//   sail: c = Segelfarbe, c2 = Muster-Farbe, pat = Muster ('', 'streifen', 'flicken', 'stern')
//   hull: c = Rumpf, r = Reling
//   flag: c = Flaggenfarbe, big = große Flagge
//   deco: Galionsfigur am Bug (Pixel rechts vorne)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.shipParts = {
  sail: [
    { id: 'weiss',    name: 'Leinen',        c: '#f1eee8', req: {} },
    { id: 'streifen', name: 'Rot gestreift', c: '#f1eee8', c2: '#d0574a', pat: 'streifen', req: { rank: 3 } },
    { id: 'himmel',   name: 'Himmelblau',    c: '#cfe3f2', c2: '#8ab6d6', pat: 'streifen', req: { runs: 10 } },
    { id: 'flicken',  name: 'Geflickt',      c: '#efe2c6', c2: '#b9894f', pat: 'flicken', req: { kos: 150 } },
    { id: 'sonne',    name: 'Sonnensegel',   c: '#f6dc8a', c2: '#e0a030', pat: 'stern', req: { wins: 1 } },
    { id: 'nacht',    name: 'Nachtsegel',    c: '#3a3550', c2: '#f2d24a', pat: 'stern', req: { raids: 2 } },
    { id: 'kirsch',   name: 'Kirschblüte',   c: '#f8d4e0', c2: '#e870a0', pat: 'flicken', req: { rank: 8 } }
  ],
  hull: [
    { id: 'eiche',  name: 'Eiche',        c: '#6b4a32', r: '#3a2a1e', req: {} },
    { id: 'hell',   name: 'Birke',        c: '#b88a5a', r: '#6b4a32', req: { rank: 2 } },
    { id: 'rot',    name: 'Kirschholz',   c: '#8a3a2e', r: '#4a1e18', req: { bosses: 3 } },
    { id: 'gruen',  name: 'Meeresgrün',   c: '#3f6b5a', r: '#203a30', req: { islands: 6 } },
    { id: 'gold',   name: 'Goldbeschlag', c: '#6b4a32', r: '#e0b040', req: { heat: 2 } },
    { id: 'schwarz',name: 'Schwarzholz',  c: '#2a2420', r: '#c9a95a', req: { duels: 5 } }
  ],
  flag: [
    { id: 'schwarz', name: 'Klassisch',   c: '#1a1a1a', req: {} },
    { id: 'rot',     name: 'Rote Flagge', c: '#b83a2e', req: { hunted: 5 } },
    { id: 'gross',   name: 'Große Flagge', c: '#1a1a1a', big: true, req: { rank: 5 } },
    { id: 'gold',    name: 'Goldflagge',  c: '#e0a030', big: true, req: { wins: 3 } }
  ],
  deco: [
    { id: 'keine',  name: 'Ohne',          req: {} },
    { id: 'loewe',  name: 'Löwenkopf',     px: { '#f2c94a': [[15, 7], [15, 6], [14, 6]], '#c08a2a': [[15, 8]] }, req: { rank: 4 } },
    { id: 'schaf',  name: 'Schäfchen',     px: { '#f4f0e0': [[15, 7], [15, 6], [14, 6], [14, 7]], '#1a1a1a': [[15, 6]] }, req: { bosses: 1 } },
    { id: 'drache', name: 'Seedrache',     px: { '#5c9a42': [[15, 7], [15, 6], [15, 5], [14, 5]], '#f2d24a': [[15, 5]] }, req: { raids: 1 } },
    { id: 'laterne',name: 'Laterne',       px: { '#f6dc8a': [[14, 6]], '#3a2a1e': [[14, 5]] }, req: { runs: 5 } }
  ]
};
