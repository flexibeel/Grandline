// Pixel-Sprites, die aus dem "look" einer Figur erzeugt werden.
// Später kannst du hier echte Bilder (PNG) einbauen: Wenn eine Figur
// ein Feld "image" hat, wird stattdessen das Bild angezeigt.
window.GL = window.GL || {};

(function () {
  // Grundform 12 x 14 Pixel.
  // H = Haare, S = Haut, E = Augen, C = Oberteil, P = Hose, O = Schuhe, B = Hut
  const BASE = [
    '...HHHHHH...',
    '..HHHHHHHH..',
    '..HSSSSSSH..',
    '..SSESSESS..',
    '..SSSSSSSS..',
    '...SSSSSS...',
    '..CCCCCCCC..',
    '.SCCCCCCCCS.',
    '.SCCCCCCCCS.',
    '..CCCCCCCC..',
    '..PPPPPPPP..',
    '..PP....PP..',
    '..PP....PP..',
    '..OO....OO..'
  ];

  const HATS = {
    straw: { 0: '...BBBBBB...', 1: 'BBBBBBBBBBBB' },
    band:  { 1: '..BBBBBBBB..' },
    cap:   { 0: '...BBBBBB...', 1: '..BBBBBBBB..' },
    afro:  { 0: '.HHHHHHHHHH.', 1: 'HHHHHHHHHHHH' },
    hood:  { 0: '..BBBBBBBB..', 1: '.BBBBBBBBBB.', 2: '.B........B.', 3: '.B........B.' }
  };

  const cache = {};

  function svg(look) {
    const grid = BASE.map(r => r.split(''));
    const hat = HATS[look.hat];
    if (hat) {
      Object.keys(hat).forEach(y => {
        hat[y].split('').forEach((ch, x) => { if (ch !== '.') grid[y][x] = ch; });
      });
    }
    if (look.longHair) [2, 3, 4, 5].forEach(y => { grid[y][1] = 'H'; grid[y][10] = 'H'; });

    const colors = {
      H: look.hair, S: look.skin, E: '#1a1a1a', C: look.shirt,
      P: look.pants, O: '#2a1f14', B: look.hatColor || look.hair
    };
    let rects = '';
    grid.forEach((row, y) => row.forEach((ch, x) => {
      if (ch !== '.') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[ch]}"/>`;
    }));
    return `<svg viewBox="0 0 12 14" aria-hidden="true">${rects}</svg>`;
  }

  // Kleine Pixel-Symbole für Früchte und Schätze. Farbe kommt aus der id.
  const ICONS = {
    // Teufelsfrucht mit Wirbel-Muster: F = Frucht, W = Wirbel, G = Stiel
    fruit: [
      '.....GG...',
      '....G.....',
      '..FFFFFF..',
      '.FWWFFWWF.',
      'FFFWFFFWFF',
      'FWWFFWWFFF',
      'FFFFWFFFWF',
      '.FWWFFWWF.',
      '..FFFFFF..',
      '...FFFF...'
    ],
    // Schatztruhe: F = Holz, W = Beschlag, G = Schloss
    relic: [
      '..........',
      '.FFFFFFFF.',
      'FWWWWWWWWF',
      'FFFFFFFFFF',
      'WWWWGGWWWW',
      'FFFFGGFFFF',
      'FFFFFFFFFF',
      'FWFFFFFFWF',
      'FFFFFFFFFF',
      '..........'
    ]
  };

  // Symbole für die Routen-Knoten: A/B/C = Farben je Symbol
  const NODE_ICONS = {
    battle:   { c: { A: '#c8c8d0', B: '#7a5a3a', C: '#e8c25a' }, rows: ['A........A', '.A......A.', '..A....A..', '...A..A...', '....AA....', '....AA....', '...C..C...', '..B....B..', '.B......B.', 'B........B'] },
    elite:    { c: { A: '#f0ece0', B: '#1a1a1a', C: '#b3362d' }, rows: ['..AAAAAA..', '.AAAAAAAA.', 'AABBAABBAA', 'AABBAABBAA', 'AAAAAAAAAA', '.AAABBAAA.', '..AAAAAA..', '..ABABAB..', '...AAAA...', '..........'] },
    recruit:  { c: { A: '#3b5a8c', B: '#f2c9a0', C: '#3d6b46' }, rows: ['...BBB....', '...BBB....', '...BBB..C.', '..AAAAA.C.', '.AAAAAACCC', '.AAAAAA.C.', '..AAAA..C.', '..A..A....', '..A..A....', '..........'] },
    rest:     { c: { A: '#e07a2c', B: '#e8c25a', C: '#6b4a2a' }, rows: ['....A.....', '...AA.....', '...ABA.A..', '..ABBAAA..', '..ABBBBA..', '..AABBAA..', '...AAAA...', '.CC....CC.', '...CCCC...', '.CC....CC.'] },
    raid:     { c: { A: '#e8d030', B: '#7b3fbf', C: '#f0f0f0' }, rows: ['.....AAA..', '....AAA...', '...AAA....', '..AAAAAA..', '....AAA...', '...AAA....', '..AAA.....', '.AA.......', '.A........', '..........'] }
  };

  function hue(id) {
    let h = 0;
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }

  // Schiff fürs Hauptquartier: S = Segel, M = Mast, H = Rumpf, R = Reling, F = Flagge
  const SHIP = [
    '.......F........',
    '.......MFF......',
    '....SSSMSSSS....',
    '...SSSSMSSSSS...',
    '...SSSSMSSSSS...',
    '....SSSMSSSS....',
    '.......M........',
    '.R.R.R.M.R.R.R..',
    'HHHHHHHHHHHHHHHH',
    '.HHHHHHHHHHHHHH.',
    '..HHHHHHHHHHHH..',
    '...HHHHHHHHHH...'
  ];

  GL.sprites = {
    ship() {
      if (cache.ship) return cache.ship;
      const c = { S: '#f1eee8', M: '#5a4433', H: '#6b4a32', R: '#3a2a1e', F: '#1a1a1a' };
      let r = '';
      SHIP.forEach((row, y) => row.split('').forEach((ch, x) => {
        if (ch !== '.') r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c[ch]}"/>`;
      }));
      cache.ship = `<svg viewBox="0 0 16 12" aria-hidden="true">${r}</svg>`;
      return cache.ship;
    },

    coin() {
      return '<svg class="coin" viewBox="0 0 8 8" aria-hidden="true"><rect x="2" y="0" width="4" height="8" fill="#c9a95a"/><rect x="0" y="2" width="8" height="4" fill="#c9a95a"/><rect x="1" y="1" width="6" height="6" fill="#c9a95a"/><rect x="3" y="2" width="2" height="4" fill="#8a6d2f"/></svg>';
    },

    icon(kind, id, epic) {
      const key = kind + ':' + id + (epic ? ':e' : '');
      if (cache[key]) return cache[key];
      if (kind === 'node') {
        if (id === 'fruit') return GL.sprites.icon('fruit', 'gum-gum');
        if (id === 'treasure') return GL.sprites.icon('relic', 'kanone');
        const ic = NODE_ICONS[id];
        if (!ic) return '';
        let r = '';
        ic.rows.forEach((row, y) => row.split('').forEach((ch, x) => {
          if (ch !== '.') r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${ic.c[ch]}"/>`;
        }));
        cache[key] = `<svg viewBox="0 0 10 10" class="icon" aria-hidden="true">${r}</svg>`;
        return cache[key];
      }
      const h = epic ? 285 : hue(id);
      const colors = kind === 'fruit'
        ? { F: `hsl(${h} 65% 52%)`, W: `hsl(${h} 70% 32%)`, G: '#3d6b46' }
        : { F: `hsl(${(h % 40) + 20} 55% 38%)`, W: `hsl(${h} 70% 55%)`, G: '#e8c25a' };
      let rects = '';
      ICONS[kind].forEach((row, y) => row.split('').forEach((ch, x) => {
        if (ch !== '.') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[ch]}"/>`;
      }));
      cache[key] = `<svg viewBox="0 0 10 10" class="icon${epic ? ' epic-icon' : ''}" aria-hidden="true">${rects}</svg>`;
      return cache[key];
    },

    // entry: Eintrag aus GL.data (crew, grunts oder bosses)
    render(entry) {
      if (!entry) return '';
      if (entry.image) return `<img src="${entry.image}" alt="" class="sprite-img">`;
      // Der eigene Pirat kann sein Aussehen ändern: Aussehen gehört mit zum Schlüssel
      const key = entry.id === 'self' ? 'self:' + JSON.stringify(entry.look) : entry.id;
      if (!cache[key]) cache[key] = svg(entry.look);
      if (entry.id === 'self') return cache[key];
      return cache[entry.id];
    }
  };
})();
