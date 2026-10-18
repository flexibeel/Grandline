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
    hood:  { 0: '..BBBBBBBB..', 1: '.BBBBBBBBBB.', 2: '.B........B.', 3: '.B........B.' },
    tophat: { 0: '...BBBBBB...', 1: '.BBBBBBBBBB.' },
    ears:  { 0: '.BB......BB.', 1: '.BBBBBBBBBB.' },
    tricorn: { 0: '.B..BBBB..B.', 1: 'BBBBBBBBBBBB' }
  };

  // Masken/Kostüme für Bosse: ersetzen die oberen Zeilen (G/g = Kostüm hell/dunkel, Y = Augen, T = Zähne)
  const MASKS = {
    croc:    { 0: '.gYg....gYg.', 1: 'GGGGGGGGGGGG', 2: 'GTGTGTGTGTGG', 3: 'GTSSESSESSTG', 4: 'GGSSSSSSSSGG', 5: 'gGTSSSSSSTGg' },
    shark:   { 0: '.....GG.....', 1: '...GGGGGG...', 2: '..GTTTTTTG..' },
    leopard: { 0: '.GG......GG.', 1: '.GYGgGGgGYG.', 2: '..GGGGgGGG..' },
    giraffe: { 0: '..g......g..', 1: '..G......G..', 2: '..GGgGGgGG..' },
    bat:     { 0: 'G..........G', 1: 'GG.GGGGGG.GG', 2: '.GGGGGGGGGG.' },
    cloud:   { 0: '..WW..WWW...', 1: '.WWWWWWWWWW.', 2: '..WWWWWWWW..' },
    bolt:    { 0: '..Y..Y..Y...', 1: '..YY.YY.YY..', 2: '..YYYYYYYY..' },
    bear:    { 0: '.GG......GG.', 1: '.GgGGGGGGgG.', 2: '..GGGGGGGG..' },
    octo:    { 0: '..GG...GG...', 1: '.GGGGGGGGGG.', 2: '.gGGGGGGGGg.' }
  };
  const MASK_COL = {
    croc: { G: '#5c9a42', g: '#2f5a24', Y: '#f2d24a', T: '#f4f0e0' },
    shark: { G: '#6f8fb0', T: '#f4f0e0' },
    leopard: { G: '#e0b040', g: '#6a4a1a', Y: '#f4d98a' },
    giraffe: { G: '#e8c060', g: '#8a5a2a' },
    bat: { G: '#4a3260' },
    cloud: { W: '#eef0f2' },
    bolt: { Y: '#f2d24a' },
    bear: { G: '#6a4a30', g: '#c89a70' },
    octo: { G: '#e88a9a', g: '#b85a6a' }
  };
  function applyLook(grid, look) {
    const hat = HATS[look.hat];
    if (hat) Object.keys(hat).forEach(y => { hat[y].split('').forEach((ch, x) => { if (ch !== '.') grid[y][x] = ch; }); });
    if (look.longHair) [2, 3, 4, 5].forEach(y => { grid[y][1] = 'H'; grid[y][10] = 'H'; });
    if (look.beard) { grid[5] = '...DDDDDD...'.split(''); grid[4][3] = 'D'; grid[4][8] = 'D'; }
    if (look.nose) { grid[4][5] = 'N'; grid[4][6] = 'N'; }
    const m = MASKS[look.mask];
    if (m) Object.keys(m).forEach(y => { grid[y] = m[y].split(''); });
    // Accessoires (eigener Pirat): kleine Details, die man trotzdem erkennt
    const A = { augenklappe: [[2, 3, 'K'], [2, 4, 'K'], [2, 5, 'K'], [2, 6, 'K'], [2, 7, 'K'], [2, 8, 'K'], [3, 7, 'K'], [3, 8, 'K'], [4, 7, 'K']], narbe: [[2, 4, 'R'], [3, 3, 'R'], [4, 4, 'R']],
      brille: [[3, 3, 'G'], [3, 5, 'G'], [3, 6, 'G'], [3, 8, 'G'], [2, 4, 'G'], [2, 7, 'G']], ohrring: [[4, 2, 'Y'], [5, 2, 'Y']], pfeife: [[5, 8, 'W'], [5, 9, 'W'], [5, 10, 'W'], [4, 10, 'W'], [4, 11, 'W'], [3, 11, 'Q']],
      blume: [[1, 9, 'F'], [0, 9, 'F'], [1, 10, 'F'], [1, 8, 'Y']] }[look.acc];
    if (A) A.forEach(([y, x, ch]) => { if (grid[y]) grid[y][x] = ch; });
  }
  const ACC_COL = { K: '#1a1a1a', R: '#c0392b', G: '#3a2a20', Y: '#f2d24a', W: '#6a4424', F: '#e0483b', Q: '#d8d8d8' };
  // Dunkler Pixel-Umriss um alles Gezeichnete: kräftiger, klarer Look (wie in Stardew oder Dwarves)
  function outline(grid, w, h) {
    const filled = (x, y) => y >= 0 && y < h && x >= 0 && x < w && grid[y][x] !== '.';
    let r = '';
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      if (filled(x, y)) continue;
      if (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1)) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="#2a1a12" fill-opacity=".82"/>`;
    }
    return r;
  }

  const cache = {};

  // Sicherheit: Farben kommen auch aus Online-Daten anderer Spieler. Nur echte Farbcodes zulassen
  const safeCol = c => (typeof c === 'string' && /^#[0-9a-f]{3,8}$/i.test(c)) ? c : '#888888';
  function safeLook(look) {
    const l = Object.assign({}, look || {});
    ['hair', 'skin', 'shirt', 'pants', 'hatColor', 'beard', 'nose'].forEach(k => { if (l[k] != null) l[k] = safeCol(l[k]); });
    ['hat', 'acc', 'mask', 'hairStyle', 'style', 'eyes'].forEach(k => { if (l[k] != null && !/^[a-z0-9_-]{0,24}$/i.test(String(l[k]))) delete l[k]; });
    return l;
  }
  function svg(look) {
    look = safeLook(look);
    const grid = BASE.map(r => r.split(''));
    applyLook(grid, look);
    const colors = Object.assign({
      H: look.hair, S: look.skin, E: '#1a1a1a', C: look.shirt,
      P: look.pants, O: '#2a1f14', B: look.hatColor || look.hair, D: look.beard, N: look.nose
    }, ACC_COL, MASK_COL[look.mask] || {});
    let rects = outline(grid, 12, 14);
    grid.forEach((row, y) => row.forEach((ch, x) => {
      if (ch !== '.') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[ch]}"/>`;
    }));
    return `<svg viewBox="-1 -1 14 16" aria-hidden="true">${rects}</svg>`;
  }
  // Mit Licht und Schatten: Kanten oben/links heller, rechts/unten dunkler. Bleibt Pixel, wirkt plastisch.
  const mix = (hex, to, k) => {
    const h = String(hex || '#888').replace('#', ''); if (h.length < 6) return hex;
    const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    const t = to === 'w' ? [255, 255, 255] : [20, 12, 8];
    return '#' + c.map((v, i) => Math.round(v + (t[i] - v) * k).toString(16).padStart(2, '0')).join('');
  };
  function svgShaded(look) {
    look = safeLook(look);
    const grid = BASE.map(r => r.split(''));
    applyLook(grid, look);
    const colors = Object.assign({ H: look.hair, S: look.skin, E: '#1a1a1a', C: look.shirt, P: look.pants, O: '#2a1f14', B: look.hatColor || look.hair, D: look.beard, N: look.nose }, ACC_COL, MASK_COL[look.mask] || {});
    const at = (x, y) => (grid[y] && grid[y][x]) || '.';
    let rects = outline(grid, 12, 14);
    grid.forEach((row, y) => row.forEach((ch, x) => {
      if (ch === '.') return;
      let col = colors[ch];
      if (!'EYTKRGWFQ'.includes(ch)) {
        const edgeR = at(x + 1, y) !== ch, edgeB = at(x, y + 1) !== ch, edgeL = at(x - 1, y) !== ch, edgeT = at(x, y - 1) !== ch;
        if (edgeR || edgeB) col = mix(col, 'k', edgeR && edgeB ? 0.3 : 0.18);
        else if (edgeT || edgeL) col = mix(col, 'w', 0.16);
      }
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
    }));
    return `<svg viewBox="-1 -1 14 16" aria-hidden="true">${rects}</svg>`;
  }

  // Eigene Pixelbilder (z. B. Tiere): rows + Farben, optional mit Licht und Schatten an den Kanten
  const artCache = new Map();
  function artSvg(art, shaded) {
    const key = art.rows.join('|') + (shaded ? 's' : '');
    if (artCache.has(key)) return artCache.get(key);
    // Gezeichnet mit Blick nach links; gespiegelt gespeichert, damit Gegner (im Kampf gespiegelt) zur Crew schauen
    const rows = art.rows.map(x => x.split('').reverse().join(''));
    const h = rows.length, w = Math.max(...rows.map(r => r.length));
    const at = (x, y) => (rows[y] && rows[y][x]) || '.';
    const g2 = rows.map(row => row.padEnd(w, '.').split('').map(ch => art.c[ch] ? ch : '.'));
    let r = outline(g2, w, h);
    rows.forEach((row, y) => row.split('').forEach((ch, x) => {
      const c0 = art.c[ch]; if (!c0) return;
      let col = c0;
      if (shaded) {
        const edgeR = at(x + 1, y) !== ch, edgeB = at(x, y + 1) !== ch, edgeL = at(x - 1, y) !== ch, edgeT = at(x, y - 1) !== ch;
        if (edgeR || edgeB) col = mix(c0, 'k', edgeR && edgeB ? 0.28 : 0.16);
        else if (edgeT || edgeL) col = mix(c0, 'w', 0.18);
      }
      r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
    }));
    // Pixel-Umriss: macht Tiere im Kampfbild klar lesbar
    const svgOut = `<svg viewBox="-1 -1 ${w + 2} ${h + 2}" aria-hidden="true">${r}</svg>`;
    artCache.set(key, svgOut);
    return svgOut;
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

  // Eigene Bilder für einzelne Schätze (sonst bunte Schatztruhe)
  const RELIC_ART = {
    mandarinen: { c: { A: '#f08a24', B: '#ffc061', C: '#3d8b46', D: '#8a5a32', E: '#5f3c20' }, rows: ['...C..C...', '..ACA.CA..', '.ABAAABAA.', '.AAAAAAAA.', 'DDDDDDDDDD', 'DEEEEEEEED', 'DDDDDDDDDD', 'DEEEEEEEED', 'DDDDDDDDDD', '..........'] },
    loewenkopf: { c: { A: '#f2c14e', B: '#e08a2a', C: '#fff3c4', D: '#3a2a1e' }, rows: ['.BBBBBBBB.', 'BBAAAAAABB', 'BAAAAAAAAB', 'BADAAAADAB', 'BAAAAAAAAB', 'BAACCCCAAB', 'BAACDDCAAB', 'BBAACCAABB', '.BBAAAABB.', '..BBBBBB..'] }
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
    // Schiff mit eigenen Teilen (look = { sail, hull, flag, deco } aus GL.data.shipParts); ohne Angabe: das eigene Schiff
    ship(look) {
      const L = look || GL.sprites.myShip || {};
      const P = GL.data.shipParts || {};
      const pick = (k, id) => ((P[k] || []).find(x => x.id === id) || (P[k] || [])[0] || {});
      const sail = pick('sail', L.sail), hull = pick('hull', L.hull), flag = pick('flag', L.flag), deco = pick('deco', L.deco);
      const key = 'ship:' + [sail.id, hull.id, flag.id, deco.id].join('/');
      if (cache[key]) return cache[key];
      const c = { S: sail.c || '#f1eee8', M: '#5a4433', H: hull.c || '#6b4a32', R: hull.r || '#3a2a1e', F: flag.c || '#1a1a1a' };
      const rows = SHIP.map(r => r.split(''));
      if (flag.big) { rows[0][8] = 'F'; rows[1][10] = 'F'; rows[0][9] = 'F'; }
      let r = '';
      rows.forEach((row, y) => row.forEach((ch, x) => {
        if (ch === '.') return;
        let col = c[ch];
        if (ch === 'S' && sail.pat === 'streifen' && y % 2 === 1) col = sail.c2;
        if (ch === 'S' && sail.pat === 'flicken' && (x * 7 + y * 3) % 9 === 0) col = sail.c2;
        if (ch === 'S' && sail.pat === 'stern' && ((x === 5 && y === 3) || (x === 9 && y === 4) || (x === 10 && y === 2))) col = sail.c2;
        r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
      }));
      Object.keys(deco.px || {}).forEach(col => deco.px[col].forEach(([x, y]) => { r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`; }));
      cache[key] = `<svg viewBox="0 0 16 12" aria-hidden="true">${r}</svg>`;
      return cache[key];
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
      if (kind === 'relic' && RELIC_ART[id] && !epic) {
        const ic = RELIC_ART[id];
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
    // Plastische Variante fürs Kampffeld
    renderShaded(entry) {
      if (!entry) return '';
      if (entry.art) return artSvg(entry.art, true);
      if (entry.image) return `<img src="${entry.image}" alt="" class="sprite-img">`;
      const key = 'sh:' + entry.id + ':' + JSON.stringify(entry.look || {});
      if (!cache[key]) cache[key] = svgShaded(entry.look || {});
      return cache[key];
    },
    render(entry) {
      if (!entry) return '';
      if (entry.art) return artSvg(entry.art, false);
      if (entry.image) return `<img src="${entry.image}" alt="" class="sprite-img">`;
      // Der eigene Pirat kann sein Aussehen ändern: Aussehen gehört mit zum Schlüssel
      // Schlüssel mit Aussehen: Figuren mit gleicher id (z. B. Buggy als Gegner und als Crew) bleiben getrennt
      const key = entry.id + ':' + JSON.stringify(entry.look || {});
      if (!cache[key]) cache[key] = svg(entry.look || {});
      return cache[key];
    }
  };
})();
