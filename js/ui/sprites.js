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
    // Story-Formen (js/data/forms.js): mehrere kleine Details auf einmal
    (Array.isArray(look.facc) ? look.facc : []).forEach(k => (FORM_ACC[k] || []).forEach(([y, x, ch]) => { if (grid[y]) grid[y][x] = ch; }));
  }
  // y, x, Farbe. S = Haut der Figur, H = Haarfarbe, X Dampf, Z Bauchbinde, V Taktstock/Tattoo/Buch, Y Gold,
  // M Metall, L hell (Hemd, Maske, Knochen), A Bernstein (Band, Umhang, Flammen), I Blüten-Rosa
  const rowOf = (y, x0, x1, ch) => { const a = []; for (let x = x0; x <= x1; x++) a.push([y, x, ch]); return a; };
  const FORM_ACC = {
    weste: [[6, 5, 'S'], [6, 6, 'S'], [7, 5, 'S'], [7, 6, 'S'], [8, 5, 'S'], [8, 6, 'S']],
    dampf: [[0, 0, 'X'], [0, 11, 'X'], [2, 0, 'X'], [3, 11, 'X'], [1, 11, 'X']],
    bauchbinde: [2, 3, 4, 5, 6, 7, 8, 9].map(x => [9, x, 'Z']),
    ohrringe: [[4, 2, 'Y'], [5, 2, 'Y'], [3, 1, 'Y']],
    tattoo: [[7, 1, 'V']],
    taktstock: [[5, 11, 'V'], [6, 11, 'V'], [7, 11, 'V'], [8, 11, 'V'], [9, 11, 'V'], [10, 11, 'V'], [11, 11, 'V']],
    // Lysop: lange Nase, Gürtel mit Beutel, Maske und Umhang
    langnase: [[4, 10, 'S'], [4, 11, 'S']],
    gurt: rowOf(9, 2, 9, 'W').concat([[10, 2, 'W'], [10, 3, 'W']]),
    maske: [[3, 2, 'L'], [3, 3, 'L'], [3, 4, 'K'], [3, 5, 'L'], [3, 6, 'L'], [3, 7, 'K'], [3, 8, 'L'], [3, 9, 'L']].concat(rowOf(4, 2, 9, 'L')),
    umhang: [[6, 1, 'A'], [6, 10, 'A'], [7, 0, 'A'], [7, 11, 'A'], [8, 0, 'A'], [8, 11, 'A'], [9, 0, 'A'], [9, 11, 'A']],
    // Sanji: Haarsträhne über dem Auge, weißes Hemd, Zigarette, brennendes Bein
    straehne: [[2, 6, 'H'], [2, 7, 'H'], [2, 8, 'H'], [3, 7, 'H'], [3, 8, 'H']],
    hemd: [[6, 5, 'L'], [6, 6, 'L'], [7, 5, 'L'], [7, 6, 'L'], [8, 5, 'L'], [8, 6, 'L']],
    zigarette: [[5, 8, 'L'], [5, 9, 'L'], [5, 10, 'R']],
    feuerbein: [[11, 2, 'F'], [11, 3, 'A'], [12, 2, 'A'], [12, 3, 'F'], [13, 2, 'F'], [13, 3, 'A']],
    // Chopper: Kreuz auf dem Hut, Arzttasche, Geweih, Fell
    kreuz: [[0, 5, 'L'], [0, 6, 'L'], [1, 4, 'L'], [1, 5, 'L'], [1, 6, 'L'], [1, 7, 'L']],
    arzttasche: [[10, 10, 'W'], [10, 11, 'Y'], [11, 10, 'W'], [11, 11, 'W']],
    geweih: [[0, 1, 'W'], [0, 2, 'W'], [1, 1, 'W'], [0, 9, 'W'], [0, 10, 'W'], [1, 10, 'W']],
    fell: [[6, 0, 'W'], [7, 0, 'W'], [8, 0, 'W'], [6, 11, 'W'], [7, 11, 'W'], [8, 11, 'W']],
    // Robin: Stirnband, Buch, zusätzliche Arme, Blüten
    haarband: rowOf(2, 3, 8, 'A'),
    buch: [[7, 11, 'V'], [8, 11, 'V'], [9, 11, 'V'], [9, 10, 'L']],
    extraarme: [[4, 0, 'S'], [5, 1, 'S'], [6, 0, 'S'], [4, 11, 'S'], [5, 10, 'S'], [6, 11, 'S']],
    blueten: [[0, 0, 'I'], [2, 0, 'I'], [0, 11, 'I'], [2, 11, 'I']],
    // Franky: Sonnenbrille, Metallarme, Brustplatte, Schraubenschlüssel
    sonnenbrille: rowOf(3, 2, 9, 'K'),
    metallarm: [[7, 1, 'M'], [8, 1, 'M'], [7, 10, 'M'], [8, 10, 'M']],
    brustplatte: rowOf(7, 4, 7, 'M').concat(rowOf(8, 4, 7, 'M')),
    werkzeug: [[5, 10, 'M'], [5, 11, 'M'], [6, 11, 'M'], [7, 11, 'M'], [8, 11, 'M']],
    // Brook: leere Augenhöhlen, Rippen, Geige mit Bogen, Noten
    augenhoehlen: [[3, 3, 'K'], [3, 4, 'K'], [3, 7, 'K'], [3, 8, 'K']],
    rippen: rowOf(6, 4, 7, 'L').concat([[7, 5, 'L'], [7, 6, 'L']], rowOf(8, 4, 7, 'L')),
    geige: [[6, 0, 'W'], [7, 0, 'W'], [8, 0, 'W'], [9, 0, 'W'], [6, 11, 'K'], [7, 11, 'K'], [8, 11, 'K'], [9, 11, 'K']],
    noten: [[3, 0, 'Y'], [4, 0, 'Y'], [2, 11, 'Y'], [3, 11, 'Y']]
  };
  const ACC_COL = { K: '#1a1a1a', R: '#c0392b', G: '#3a2a20', Y: '#f2d24a', W: '#6a4424', F: '#e0483b', Q: '#d8d8d8', X: '#f2eeee', Z: '#3f8f4f', V: '#2f6fb0',
    M: '#8a96a4', L: '#f4f0e6', A: '#e8a030', I: '#f08ab4' };
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
    ['hair', 'skin', 'shirt', 'pants', 'hatColor', 'beard', 'nose', 'coat', 'scarf'].forEach(k => { if (l[k] != null) l[k] = safeCol(l[k]); });
    ['hat', 'acc', 'mask', 'hairStyle', 'style', 'eyes'].forEach(k => { if (l[k] != null && !/^[a-z0-9_-]{0,24}$/i.test(String(l[k]))) delete l[k]; });
    if (l.x != null) l.x = Array.isArray(l.x) ? l.x.filter(k => typeof k === 'string' && /^[a-z]{1,20}$/.test(k)).slice(0, 4) : [];
    if (l.facc != null) l.facc = Array.isArray(l.facc) ? l.facc.filter(k => typeof k === 'string' && FORM_ACC[k]).slice(0, 4) : [];
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
  // ---------- Kampffiguren im Stil der Kulissen (SPR) ----------
  // Weicher Umriss in der dunkleren Farbe des Nachbar-Pixels („selektiver Umriss“ wie bei modernen Pixel-Künstlern),
  // Licht von oben links in drei Stufen. Liefert Pixel als Liste, damit Ober- und Unterkörper getrennt atmen können.
  function pixelsOf(grid, w, h, colorOf, noShade) {
    const at = (x, y) => (y >= 0 && y < h && x >= 0 && x < w && grid[y][x]) || '.';
    const px = [];
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      const ch = at(x, y);
      if (ch !== '.') {
        let col = colorOf(ch);
        if (!noShade || !noShade.includes(ch)) {
          const eR = at(x + 1, y) !== ch, eB = at(x, y + 1) !== ch, eL = at(x - 1, y) !== ch, eT = at(x, y - 1) !== ch;
          if (eR && eB) col = mix(col, 'k', 0.3);
          else if (eR || eB) col = mix(col, 'k', 0.16);
          else if (eT && eL) col = mix(col, 'w', 0.22);
          else if (eT || eL) col = mix(col, 'w', 0.12);
        }
        px.push([x, y, col]);
        continue;
      }
      // Umriss: Farbe vom Nachbarn nehmen und abdunkeln; unten/rechts (Schattenseite) dunkler als oben/links
      const nb = [[0, 1, 1], [1, 0, 1], [-1, 0, 0], [0, -1, 0]].find(([dx, dy]) => at(x + dx, y + dy) !== '.');
      if (!nb) continue;
      const src = colorOf(at(x + nb[0], y + nb[1]));
      const shadowSide = x > w / 2 || y > h * 0.6;
      px.push([x, y, mix(src, 'k', shadowSide ? 0.66 : 0.56), shadowSide ? 1 : 0.92]);
    }
    return px;
  }
  const rectsOf = list => list.map(([x, y, c, o]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"${o && o < 1 ? ` fill-opacity="${o}"` : ''}/>`).join('');
  // Angriffsbild: Oberkörper einen Pixel nach vorn, Ausfallschritt, Faust hoch
  function lungeGrid(grid) {
    const g = grid.map(r => r.slice());
    for (let y = 0; y <= 10; y++) g[y] = ['.'].concat(grid[y].slice(0, 11));
    const legs = { 11: '..PP.....PP.', 12: '.PP.......PP', 13: '.OO.......OO' };
    Object.keys(legs).forEach(y => { g[y] = legs[y].split(''); });
    if (g[8][11] === 'S') g[8][11] = '.';
    if (g[6][11] === '.') g[6][11] = 'S';
    return g;
  }
  // 4D Gefühle im Gesicht (Board G0, Felix 24.10.): Ebene nach applyLook, [Zeile, Spalte, Zeichen].
  // Gesetzt wird nur auf Haut/Augen (Masken, Brillen und Accessoires bleiben), der Schweißtropfen nur neben den Kopf.
  // m Mund, c Wangen, s Haut 45 % dunkler, w Schweiß, b Brauen
  const MOOD = {
    froh: [[4, 4, 'm'], [4, 7, 'm'], [5, 5, 'm'], [5, 6, 'm'], [4, 3, 'c'], [4, 8, 'c']],
    muede: [[3, 4, 's'], [3, 7, 's'], [4, 4, 's'], [4, 7, 's'], [5, 5, 'm'], [2, 10, 'w'], [3, 10, 'w']],
    sauer: [[2, 5, 'b'], [2, 6, 'b'], [4, 5, 'm'], [4, 6, 'm'], [5, 4, 'm'], [5, 7, 'm']]
  };
  function applyMood(grid, g) {
    (MOOD[g] || []).forEach(([y, x, ch]) => {
      const was = grid[y] && grid[y][x];
      if (ch === 'w' ? was === '.' : (was === 'S' || was === 'E')) grid[y][x] = ch;
    });
  }
  function svgShaded(look, mood) {
    look = safeLook(look);
    const grid = BASE.map(r => r.split(''));
    applyLook(grid, look);
    if (mood) applyMood(grid, mood);
    const colors = Object.assign({ H: look.hair, S: look.skin, E: '#1a1a1a', C: look.shirt, P: look.pants, O: '#2a1f14', B: look.hatColor || look.hair, D: look.beard, N: look.nose }, ACC_COL, MASK_COL[look.mask] || {},
      mood ? { m: '#6a2a22', c: '#ec8a8e', s: mix(look.skin || '#e8b98a', 'k', 0.45), w: '#8fd3f4', b: '#2a1a12' } : {});
    const colorOf = ch => colors[ch] || '#888888';
    const NOSH = 'EYTKRGWFQLAImcswb';
    // Ruhebild: Oberkörper (bis Gürtel) und Beine getrennt, damit der Oberkörper beim Atmen um einen Pixel sinkt
    const idle = pixelsOf(grid, 12, 14, colorOf, NOSH);
    const up = idle.filter(p => p[1] <= 9), low = idle.filter(p => p[1] > 9);
    const atk = pixelsOf(lungeGrid(grid), 12, 14, colorOf, NOSH);
    return `<svg viewBox="-1 -1 14 16" aria-hidden="true" class="spr"><g class="sp-i"><g class="sp-l">${rectsOf(low)}</g><g class="sp-u">${rectsOf(up)}</g></g><g class="sp-a">${rectsOf(atk)}</g></svg>`;
  }

  // Eigene Pixelbilder (z. B. Tiere): rows + Farben, optional mit Licht und Schatten an den Kanten
  const artCache = new Map();
  function artSvg(art, shaded) {
    const key = art.rows.join('|') + (shaded ? 's' : '');
    if (artCache.has(key)) return artCache.get(key);
    // Gezeichnet mit Blick nach links; gespiegelt gespeichert, damit Gegner (im Kampf gespiegelt) zur Crew schauen
    const rows = art.rows.map(x => x.split('').reverse().join(''));
    const h = rows.length, w = Math.max(...rows.map(r => r.length));
    const g2 = rows.map(row => row.padEnd(w, '.').split('').map(ch => art.c[ch] ? ch : '.'));
    let svgOut;
    if (shaded) {
      // Kampfbild: gleicher Stil wie die Figuren (weicher Farb-Umriss, Licht oben links, atmender Oberteil)
      const px = pixelsOf(g2, w, h, ch => art.c[ch] || '#888888');
      const cut = Math.round(h * 0.62);
      svgOut = `<svg viewBox="-1 -1 ${w + 2} ${h + 2}" aria-hidden="true" class="spr"><g class="sp-i"><g class="sp-l">${rectsOf(px.filter(p => p[1] > cut))}</g><g class="sp-u">${rectsOf(px.filter(p => p[1] <= cut))}</g></g></svg>`;
    } else {
      let r = outline(g2, w, h);
      rows.forEach((row, y) => row.split('').forEach((ch, x) => {
        const c0 = art.c[ch]; if (!c0) return;
        r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c0}"/>`;
      }));
      // Pixel-Umriss: macht Tiere im Kampfbild klar lesbar
      svgOut = `<svg viewBox="-1 -1 ${w + 2} ${h + 2}" aria-hidden="true">${r}</svg>`;
    }
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
    hammer: { c: { A: '#8a8f99', B: '#c9ced8', C: '#6b4a2e', D: '#3a2a1e' }, rows: ['..........', '.AAAAAAA..', '.ABBBBBA..', '.AAAAAAA..', '....C.....', '....C.....', '....C.....', '....C.....', '...DCD....', '..........'] },
    wetzstein: { c: { A: '#7a8088', B: '#a9b0b8', C: '#d8dde4', D: '#4d5258' }, rows: ['..........', '..........', '.DDDDDDDD.', 'DAAAAAAAAD', 'DABBBBBBAD', 'DCCCCCCCCD', '.DDDDDDDD.', '..........', '..........', '..........'] },
    federschuh: { c: { A: '#c98a4e', B: '#8a5a32', C: '#f4efe2', D: '#5f3c20' }, rows: ['......C...', '.....CC...', '....CC....', '..AAAA....', '..AAAA....', '..AAAAAA..', '.AAAAAAAA.', '.BBBBBBBB.', '.DDDDDDDD.', '..........'] },
    kraeuter: { c: { A: '#5d8f4a', B: '#8cc06a', C: '#d6c08a', D: '#8a6a44' }, rows: ['...DDDD...', '..DDDDDD..', '..CCCCCC..', '..CBBBBC..', '..CBAABC..', '..CBAABC..', '..CBBBBC..', '..CCCCCC..', '..DDDDDD..', '..........'] },
    ankerkette: { c: { A: '#6b7078', B: '#9aa0a8', C: '#3f444b' }, rows: ['....AA....', '...A..A...', '....AA....', '....B.....', '....B.....', '.A..B..A..', '.AA.B.AA..', '..AAAAA...', '...CCC....', '..........'] },
    trommel: { c: { A: '#b3362d', B: '#e8d8b0', C: '#6b4a2e', D: '#f2c94c' }, rows: ['..........', '.BBBBBBBB.', 'BBBBBBBBBB', 'ADADADADAD', 'AAAAAAAAAA', 'ADADADADAD', 'AAAAAAAAAA', '.CCCCCCCC.', '..........', '..........'] },
    mandarinen: { c: { A: '#f08a24', B: '#ffc061', C: '#3d8b46', D: '#8a5a32', E: '#5f3c20' }, rows: ['...C..C...', '..ACA.CA..', '.ABAAABAA.', '.AAAAAAAA.', 'DDDDDDDDDD', 'DEEEEEEEED', 'DDDDDDDDDD', 'DEEEEEEEED', 'DDDDDDDDDD', '..........'] },
    medkoffer: { c: { A: '#e8e2d4', B: '#c9bfa8', C: '#d8433a', D: '#6b4a2e', E: '#8a6a44' }, rows: ['...DDDD...', '...D..D...', '.AAAAAAAA.', 'AAAACCAAAA', 'AAAACCAAAA', 'ACCCCCCCCA', 'ACCCCCCCCA', 'AAAACCAAAA', 'ABBBCCBBBA', '.BBBBBBBB.'] },
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
  // Werft-Segel ab Stufe 1: bauchiger und eine Reihe länger
  const SHIP_BIG = [
    '.......F........',
    '.......MFF......',
    '....SSSMSSSS....',
    '..SSSSSMSSSSSS..',
    '..SSSSSMSSSSSS..',
    '...SSSSMSSSSS...',
    '....SSSMSSSS....',
    '.R.R.R.M.R.R.R..',
    'HHHHHHHHHHHHHHHH',
    '.HHHHHHHHHHHHHH.',
    '..HHHHHHHHHHHH..',
    '...HHHHHHHHHH...'
  ];
  // Farbe aufhellen (amt > 0) oder abdunkeln (amt < 0)
  function shade(hex, amt) {
    const n = parseInt(String(hex).slice(1), 16);
    if (isNaN(n)) return hex;
    const f = v => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
  }

  // Figuren-Meisterschaft Silber: zweites Outfit, nur für die Crew-Figur selbst (nicht für Gegner mit gleicher id)
  // Story-Form (js/engine/forms.js) legt sich darüber: Titel-Look schlägt zweites Outfit
  function mlook(entry) {
    let look = entry.look || {};
    const d = (GL.data.crew || []).find(c => c.id === entry.id);
    if (!d || d !== entry) return look;
    if (GL.mastery && GL.mastery.alt(entry.id)) look = GL.mastery.altLook(look);
    const f = GL.forms && GL.forms.lookOf(entry.id);
    return f ? Object.assign({}, look, f) : look;
  }
  // ===================== C4a: Malwerk 24 × 30 (Vorlage tools/pixel-probe/px24.js, Felix 24.10.) =====================
  // Gleiches System wie oben (Grundkörper + Look-Werte + Teile), nur doppelt so fein. Licht oben links, Umriss in der
  // dunkleren Nachbarfarbe, Gesicht als Ebene (5 Gefühle), Blinzeln, Atmen, Angriffsbild.
  // Rückfall: Kennt das neue Raster einen Teil des Looks noch nicht (z. B. Form-Accessoires der Sturmmöwen),
  // zeichnet die Engine die Figur weiter im alten 12 × 14 (p24ok).
  const P24 = (function () {
    const W = 24, H = 30;
    // Linke Hälfte, rechts gespiegelt. H Haare, S Haut, C Oberteil, P Hose, U Gürtel, O Schuhe
    const HALF = [
      '........HHHH', '......HHHHHH', '.....HHHHHHH', '....HHHHHHHH', '...HHHHHHHHH',
      '...HHSHHHSHH', '...HSSSSSSSS', '...HSSSSSSSS', '..SSSSSSSSSS', '..SSSSSSSSSS',
      '...SSSSSSSSS', '...SSSSSSSSS', '....SSSSSSSS', '......SSSSSS', '.........SSS',
      '.....CCCCCCC', '...CCCCCCCCC', '..CCCCCCCCCC', '..CC.CCCCCCC', '..SS.CCCCCCC',
      '..SS.CCCCCCC', '..SS.CCCCCCC', '.....UUUUUUU', '.....PPPPPPP', '.....PPPPPP.',
      '.....PPPPP..', '.....PPPPP..', '.....PPPPP..', '....OOOOOO..', '....OOOOOO..'
    ];
    const flip = s => s.split('').reverse().join('');
    const BASE = HALF.map(r => r + flip(r));
    const UPPER = 22;
    const mir = list => list.concat(list.map(([y, x, ch]) => [y, W - 1 - x, ch]));
    const EYES = mir([[7, 8, 'X'], [7, 9, 'E'], [8, 8, 'E'], [8, 9, 'E'], [9, 8, 'J'], [9, 9, 'J']]);
    EYES.forEach(p => { if (p[0] === 7 && p[1] === 14) p[2] = 'X'; if (p[0] === 7 && p[1] === 15) p[2] = 'E'; });
    const FACE = {
      normal: { eyes: EYES, add: mir([[6, 8, 'b'], [6, 9, 'b']]).concat([[11, 11, 'm'], [11, 12, 'm']]) },
      froh: { eyes: EYES, add: mir([[6, 8, 'b'], [6, 9, 'b'], [10, 6, 'c'], [10, 7, 'c'], [11, 10, 'm'], [12, 11, 'm']]) },
      sauer: { eyes: EYES.filter(([y, x]) => !(y === 7 && (x === 9 || x === 14))),
        add: mir([[6, 7, 'b'], [6, 8, 'b'], [7, 9, 'b']]).concat([[11, 11, 'm'], [11, 12, 'm'], [12, 10, 'm'], [12, 13, 'm']]) },
      muede: { eyes: EYES.filter(([y]) => y === 9).map(([y, x]) => [y, x, 'E']),
        add: mir([[7, 8, 'l'], [7, 9, 'l'], [8, 8, 'l'], [8, 9, 'l'], [6, 7, 'b'], [6, 8, 'b']]).concat([[11, 11, 'm'], [11, 12, 'm'], [6, 21, 'w'], [7, 21, 'w'], [7, 22, 'w']]) },
      schreck: { eyes: mir([[7, 8, 'X'], [7, 9, 'X'], [8, 8, 'X'], [8, 9, 'E'], [9, 8, 'X'], [9, 9, 'X']]),
        add: mir([[5, 8, 'b'], [5, 9, 'b']]).concat([[11, 11, 'm'], [11, 12, 'm'], [12, 11, 'm'], [12, 12, 'm']]) }
    };
    const BLINK = mir([[9, 8, 'E'], [9, 9, 'E']]);

    // Teile schreiben: Zeilen ab Zeile y0, '.' bleibt durchsichtig. sym = linke Hälfte (12), wird gespiegelt.
    const rows = (y0, list) => { const a = []; list.forEach((r, i) => r.split('').forEach((ch, x) => { if (ch !== '.') a.push([y0 + i, x, ch]); })); return a; };
    const sym = (y0, list) => rows(y0, list.map(r => r + flip(r)));
    const at = (pts) => pts; // [y, x, ch] direkt

    // Hüte: B Hut, k Hut dunkel (Krempe, Band), q Hut hell. clear = Zeilen, die vorher ganz geleert werden.
    const HATS = {
      straw: { clear: [0, 1, 2, 3], px: sym(0, ['........BBBB', '.......BBBBB', '......BBBBBB', '.....kkkkkkk', '.BBBBBBBBBBB', '..kkkkkkkkkk']) },
      band: { px: rows(4, ['...BBBBBBBBBBBBBBBBBB...', '...kkkkkkkkkkkkkkkkkkB..', '.....................BB.', '......................B.', '......................B.']) },
      cap: { px: sym(0, ['.......BBBBB', '.....BBBBBqB', '....BBBBBBBB', '...BBBBBBBBB', '..kkkkkkkkkk']) },
      afro: { px: sym(0, ['....HHHHHHHH', '..HHHHHHHHHH', '.HHHHHHHHHHH', 'HHHHHHHHHHHH', 'HHHHHHHHHHHH', 'HHHHHSHHHSHH', 'HHH.........', 'HHH.........', 'HH..........', 'HH..........', '.HH.........']) },
      hood: { clear: [0, 1, 2, 3], px: sym(0, ['......BBBBBB', '....BBBBBBBB', '...BBBBBBBBB', '..BBBBBBBBBB', '..BBBBBBBBBB', '.BBBkkkkkkkk', '.BBk........', '.BBk........', '.BB.........', '.BB.........', '.BBk........', '.BBk........', '..BBk.......', '...BBBk.....', '....BBBB....', '...BBBB.....']) },
      tophat: { clear: [0, 1, 2, 3, 4], px: sym(0, ['......BBBBBB', '......BqBBBB', '......BqBBBB', '......BBBBBB', '......kkkkkk', '..BBBBBBBBBB']) },
      ears: { px: sym(0, ['..BB........', '.BqqB.......', '.BqqB.......', '..BBBBBBBBBB']) },
      // C4 Kronwacht: Zweispitz, zu große Kappe, Zipfelmütze, Ohrenschützer
      zweispitz: { clear: [0, 1, 2, 3], px: sym(0, ['......BBBBBB', '...BBBBBBBBB', 'BBBBBBBBBBBB', '.kkkkkkkkkkk', '...BBBBBBBBB']).concat(at([[1, 11, 'A'], [1, 12, 'A'], [2, 11, 'r'], [2, 12, 'r']])) },
      grosskappe: { clear: [0, 1, 2, 3, 4, 5], px: sym(0, ['.......BBBBB', '.....BBBBBBB', '...BBBBBBBBB', '..BBBBBBBBBB', '..BBBBBBBBBB', '..BBBBBBBBBB', '.kkkkkkkkkkk']).concat(at([[2, 11, 'A'], [2, 12, 'A'], [3, 11, 'A'], [3, 12, 'A'], [7, 2, 'H'], [7, 3, 'H'], [8, 3, 'H'], [7, 20, 'H'], [7, 21, 'H'], [8, 20, 'H']])) },
      zipfel: { clear: [0, 1, 2, 3], px: rows(0, ['.......BBBBBBBBBB.......', '.....BBqqBBqqBBBBBB.....', '....BBBBBBBBBBBBBBBBB...', '...BBBqqBBqqBBqqBBBBBB..', '...kkkkkkkkkkkkkkkkkkBB.', '......................B.', '.....................WW.', '.....................WW.']) },
      ohrenschuetzer: { px: sym(1, ['.......kkkkk', '....kk......', '..kk........', '..k.........', '..k.........', 'qBB.........', 'BBBB........', 'BBBB........', 'BBBB........', 'qBB.........']) },
      // C4 Schattenkorps: Melone, Kappe mit Öhrchen
      melone: { clear: [0, 1, 2, 3], px: sym(0, ['........BBBB', '......BBBBBB', '.....BqBBBBB', '.....kkkkkkk', '..BBBBBBBBBB']) },
      ohrenkappe: { clear: [0, 1, 2, 3], px: sym(0, ['...BB.......', '...BqBBBBBBB', '...BBBBBBBBB', '...BBBBBBBBB', '..kkkkkkkkkk']) },
      tricorn: { clear: [0, 1, 2, 3], px: sym(0, ['.B......BBBB', '.BB...BBBBBB', '.BBBBBBBBBBB', 'BBBBBBBBBBBB', 'kkkkkkkkkkkk']).concat(at([[1, 11, 'A'], [1, 12, 'A']])) },
      // C4 Zirkus der Narren: Narrenkappe (zweifarbig, Schellen), Sonnenhut
      narrenkappe: { clear: [0, 1, 2, 3], px: rows(0, ['A......................A', '.BB..................qq.', '..BBB....BBBqqq....qqq..', '...BBBBBBBBBqqqqqqqqq...', '..kkkkkkkkkkkkkkkkkkkk..']) },
      sonnenhut: { clear: [0, 1, 2, 3], px: sym(0, ['.......BBBBB', '......BBBBBB', '......kkkkkk', 'BBBBBBBBBBBB']).concat(at([[2, 7, 'F'], [1, 7, 'F'], [2, 6, 'A']])) },
      // C4 Die zwei Flotten: Kochmütze
      kochmuetze: { clear: [0, 1, 2, 3], px: sym(0, ['.....BqBBqBB', '....BBBBBBBB', '.....BBBBBBB', '.....qBBBBBB', '....kkkkkkkk']) },
      // C4 Freibeuter der Krone: Fellmütze mit Flecken, breiter Federhut
      fellmuetze: { clear: [0, 1, 2, 3], px: sym(0, ['......BBBBBB', '....BqBBBBBB', '...BBBBBBBBB', '...BBBBBBBBB', '..kkkkkkkkkk']).concat(at([[1, 8, 'L'], [2, 14, 'L'], [3, 6, 'L'], [1, 16, 'L'], [3, 17, 'L'], [2, 10, 'L']])) },
      federhut: { clear: [0, 1, 2, 3, 4], px: rows(0, ['.......BBBBBBBB....XX...', '......BBBBBBBBBB..XX....', '......kkkkkkkkkk.XX.....', '.BBBBBBBBBBBBBBBBBBBBBB.', '...kkBBBBBBBBBBBBBBkk...']) }
    };
    // Masken und Kostüme (eigene Farben je Maske): G hell, g dunkel, Y Augen, T Zähne, W Wolke
    const MASKS = {
      croc: { clear: [0, 1, 2, 3, 4], px: sym(0, ['....gYg.....', '..GGGGGGGGGG', '.GGGGgGGGGGG', 'GGGGGGGGGGGG', 'GGGGGGGGGGGG', 'GTGTGTGTGTGT', 'Gg..........', 'Gg..........', 'Gg..........', 'Gg..........', 'GgT.........', 'GGT.........', '.GGT........', '..GGGTT.....']) },
      shark: { clear: [0, 1, 2], px: rows(0, ['..........GG............', '.........GGGG...........', '.....GGGGGGGGGGGGG......', '....GGGGGGGGGGGGGGGG....', '...GGGGGGGGGGGGGGGGGG...', '...TgTgTgTgTgTgTgTgTg...']) },
      leopard: { clear: [0, 1], px: sym(0, ['...GG.......', '..GYGG......', '..GGGGGgGGGG', '...GgGGGGGgG', '...GGGGgGGGG', '...GGgGGGGGG']) },
      giraffe: { px: sym(0, ['.....g......', '.....G......', '.....G......', '....GGgGGGGG', '...GGGGGGgGG', '...gGGGGGGGG']) },
      bat: { clear: [0, 1], px: sym(0, ['G...........', 'GG..........', 'GGG...GGGGGG', '.GGGGGGGGGGG', '..GGGGGGGGGG', '...GgGGGGGGG', '...G........', '...G........']) },
      cloud: { px: sym(0, ['.....WW..WWW', '..WWWWWWWWWW', '.WWWWWWWWWWW', 'WWWWWWWWWWWW', '.WW.........']) },
      bolt: { px: sym(0, ['..Y....Y....', '..YY...YY..Y', '...YY.YYYYYY', '...YYYYYYYYY']) },
      bear: { clear: [0], px: sym(0, ['..GG........', '.GgGG.......', '.GGGGGGGGGGG', '..GGGGGGGGGG', '...GGGGGGGGG']) },
      octo: { clear: [0, 1, 2], px: sym(0, ['......GGGGGG', '....GGGGGGGG', '...GGGgGGGGG', '..GGGGGGGGGG', '..GGGGGGGGGG', '.gGGg.gGGg..', '.g..........', 'g...........', '.g..........', 'g...........', '.g..........']) }
    };
    const MASK_COL = {
      croc: { G: '#5c9a42', g: '#2f5a24', Y: '#f2d24a', T: '#f4f0e0' }, shark: { G: '#6f8fb0', g: '#4a6680', T: '#f4f0e0' },
      leopard: { G: '#e0b040', g: '#6a4a1a', Y: '#f4d98a' }, giraffe: { G: '#e8c060', g: '#8a5a2a' }, bat: { G: '#4a3260', g: '#2e1e3e' },
      cloud: { W: '#eef0f2' }, bolt: { Y: '#f2d24a' }, bear: { G: '#6a4a30', g: '#c89a70' }, octo: { G: '#e88a9a', g: '#b85a6a' }
    };
    // Kleine Zusätze (eigener Pirat und Figuren): K schwarz, R Narbe, L Brillengestell, A Gold, V Holz, F Blüte, Z Rauch
    const ACC = {
      augenklappe: rows(6, ['...KKKKKKKKKKKKKKKKKK...', '.......KKKK.............', '.......KKKK.............', '.......KKKK.............', '........KK..............']),
      narbe: at([[7, 6, 'R'], [8, 6, 'R'], [9, 7, 'R'], [10, 7, 'R'], [11, 8, 'R']]),
      brille: sym(6, ['.......LLLL.', '.......L..L.', '.......L..LL', '.......L..L.', '.......LLLL.']),
      ohrring: at([[10, 2, 'A'], [11, 2, 'A'], [10, 21, 'A'], [11, 21, 'A']]),
      pfeife: at([[12, 13, 'V'], [12, 14, 'V'], [12, 15, 'V'], [12, 16, 'V'], [11, 17, 'V'], [12, 17, 'V'], [11, 18, 'V'], [12, 18, 'V'], [9, 19, 'Z'], [8, 20, 'Z'], [7, 19, 'Z']]),
      blume: at([[2, 17, 'F'], [3, 16, 'F'], [3, 18, 'F'], [4, 17, 'F'], [3, 17, 'A']])
    };
    const BEARD = sym(8, ['...D........', '...D........', '...DD.......', '...DDDDDD...', '....DDDDDDDD', '......DDDDDD', '.........DDD']);
    const NOSE = at([[9, 11, 'N'], [9, 12, 'N'], [10, 11, 'N'], [10, 12, 'N']]);
    const LONGHAIR = [].concat(...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(y => [[y, 2, 'H'], [y, 3, 'H'], [y, 20, 'H'], [y, 21, 'H']]), [[17, 2, 'H'], [17, 21, 'H'], [6, 4, 'H'], [6, 19, 'H']]);
    // Frisuren (look.hairStyle): ändern die Grundform der Haare, bevor Hüte darüber kommen
    const HAIR = {
      glatze: g => { [0, 1].forEach(y => { g[y] = g[y].map(() => '.'); }); rows(2, ['.......SSSSSSSSSS.......', '.....SSSSSSSSSSSSSS.....', '....SSSSSSSSSSSSSSSS....', '...SSSSSSSSSSSSSSSSSS...']).forEach(([y, x, ch]) => { g[y][x] = ch; }); },
      buerste: g => { [0, 1].forEach(y => { g[y] = g[y].map(() => '.'); }); sym(2, ['.....HHHHHHH', '....HHHHHHHH', '...HHHHHHHHH', '...HSSSSSSSS']).forEach(([y, x, ch]) => { g[y][x] = ch; }); },
      dutt: g => { sym(0, ['..HH........', '.HHHH.......', '.HHHH.......', '..HH........']).forEach(([y, x, ch]) => { g[y][x] = ch; }); },
      zopf: g => { rows(5, ['....................H...', '.....................HH.', '......................H.', '.....................aHH', '......................HH', '......................HH', '......................HH', '.....................HH.', '......................H.']).forEach(([y, x, ch]) => { if (g[y][x] === '.' || ch === 'a') g[y][x] = ch === 'a' ? 'F' : ch; }); },
      bob: g => { sym(5, ['...HHHHHHHHH', '..HH........', '..HH........', '..HH........', '..HH........', '..HH........', '...H........']).forEach(([y, x, ch]) => { g[y][x] = ch; }); },
      locken: g => { sym(3, ['...HH.......', '..HHH.......', '..HH........', '.HHH........', '.HH.........', '.HHH........', '..HH........', '.HHH........', '..HH........', '...H........']).forEach(([y, x, ch]) => { g[y][x] = ch; }); },
      tolle: g => { rows(0, ['.....HHHHHHHHHHHH.......', '...HHHHHHHHHHHHHHH......', '..HHHHHHHHHHHHHHHHH.....', '.HHHHH..................']).forEach(([y, x, ch]) => { g[y][x] = ch; }); },
      zoepfe: g => { [9, 10, 11, 12, 13, 14, 15, 16].forEach(y => { g[y][2] = 'H'; g[y][3] = y % 2 ? 'H' : 'b'; g[y][21] = 'H'; g[y][20] = y % 2 ? 'H' : 'b'; }); g[17][2] = g[17][21] = 'F'; },
      stachel: g => { rows(0, ['......H...HH...H..H.....', '......HHHHHHHHHHHH......']).forEach(([y, x, ch]) => { g[y][x] = ch; }); },
      kranz: g => { HAIR.glatze(g); sym(3, ['...H........', '..HHH.......', '..HH........', '..H.........']).forEach(([y, x, ch]) => { g[y][x] = ch; }); }
    };
    // Markenzeichen (look.x, höchstens 4): Q Mantel (look.coat), I Schal (look.scarf), M Metall, n Dose, p Pflaster, i Eis
    const EXTRA = {
      mantel: sym(16, ['.....QQ.....', '.....QQ.....', '.....QQ.....', '.....QQ.....', '.....QQ.....', '.....QQ.....', '....QQQ.....', '....QQ......', '....QQ......', '....QQ......', '....QQ......']),
      schal: rows(14, ['........IIIIIIII........', '.......IIIIIIIIII.......', '...............II.......', '...............II.......', '...............I........']),
      keksdose: rows(21, ['.....AAAA...............', '....nnnnnn..............', '....nAnnAn..............', '....nnnnnn..............', '.....nnnn...............']),
      handschellen: rows(22, ['................MM.MM....', '...............M..M..M...', '...............M..M..M...', '................MM.MM....']),
      kette: at([[15, 7, 'M'], [16, 8, 'M'], [17, 9, 'M'], [18, 10, 'M'], [19, 11, 'M'], [20, 12, 'M'], [21, 13, 'M'], [16, 7, 'M'], [18, 9, 'M'], [20, 11, 'M']]),
      schwertruecken: at([[9, 22, 'V'], [10, 22, 'V'], [11, 22, 'V'], [12, 22, 'V'], [13, 21, 'A'], [13, 22, 'A'], [13, 23, 'A'], [14, 22, 'K'], [15, 22, 'F'], [15, 23, 'F'], [16, 23, 'F'], [14, 23, 'F']]),
      dreigriffe: at([[9, 1, 'V'], [10, 1, 'V'], [11, 1, 'V'], [12, 1, 'A'], [11, 0, 'L'], [12, 0, 'L'], [13, 0, 'A'], [12, 2, 'K'], [13, 2, 'K'], [14, 2, 'A'], [13, 1, 'V'], [14, 1, 'V']]),
      pflaster: at([[10, 16, 'p'], [10, 17, 'p'], [11, 16, 'p'], [11, 17, 'p'], [10, 18, 'p']]),
      dampf: at([[14, 0, 'Z'], [15, 0, 'Z'], [15, 1, 'Z'], [13, 1, 'Z'], [14, 23, 'Z'], [13, 22, 'Z'], [13, 23, 'Z'], [12, 23, 'Z']]),
      kessel: at([[11, 0, 'A'], [11, 1, 'A'], [12, 0, 'A'], [12, 1, 'A'], [13, 0, 'A'], [13, 1, 'A'], [14, 1, 'A'], [10, 1, 'K'], [8, 0, 'Z'], [7, 1, 'Z'], [6, 0, 'Z']]),
      schnauzer: rows(10, ['......DDDDDDDDDDDD......', '.....DDDD......DDDD.....', '.....DD..........DD.....']),
      // C4 Schattenkorps
      mappe: rows(21, ['.....................LL.', '...................VVVVV', '...................VAVVV', '...................VVVVV', '...................VVVVV']),
      schaum: at([[12, 21, 'i'], [11, 22, 'i'], [13, 22, 'i'], [12, 23, 'i'], [8, 22, 'i'], [9, 23, 'i'], [5, 21, 'i']]),
      schminke: at([[6, 11, 'R'], [6, 12, 'R'], [9, 6, 'R'], [10, 6, 'R'], [10, 7, 'R'], [9, 17, 'R'], [10, 17, 'R'], [10, 16, 'R']]),
      faecher: at([[15, 0, 'F'], [15, 1, 'A'], [15, 2, 'F'], [16, 0, 'A'], [16, 1, 'F'], [16, 2, 'A'], [17, 1, 'F'], [17, 2, 'F'], [18, 2, 'V']]),
      schluessel: at([[22, 6, 'A'], [23, 6, 'A'], [23, 5, 'A'], [24, 6, 'A'], [24, 7, 'A'], [23, 7, 'M'], [25, 6, 'M'], [25, 7, 'M']]),
      klauen: at([[19, 2, 'K'], [19, 3, 'K'], [20, 2, 'K'], [20, 3, 'K'], [21, 2, 'K'], [21, 3, 'K'], [22, 1, 'M'], [22, 3, 'M'], [23, 1, 'M'], [23, 3, 'M'],
        [19, 20, 'K'], [19, 21, 'K'], [20, 20, 'K'], [20, 21, 'K'], [21, 20, 'K'], [21, 21, 'K'], [22, 20, 'M'], [22, 22, 'M'], [23, 20, 'M'], [23, 22, 'M']]),
      stiefel: sym(23, ['.....AAAAA..', '.....OOOOO..', '.....OOOOO..', '.....OOOOO..', '.....OOOOO..']),
      reissverschluss: rows(11, ['.........MKMKMK.........']).concat(at([[12, 14, 'M']])),
      mundpflaster: at([[10, 10, 'p'], [10, 13, 'p'], [11, 11, 'p'], [11, 12, 'p'], [12, 10, 'p'], [12, 13, 'p']]),
      // C4 Barock-Bund
      boa: rows(14, ['......II.IIIIII.II......', '....IIIIIIIIIIIIIIII....', '...II..............II...', '..II................II..', '..I..................I..']),
      spitzenschuhe: sym(25, ['......c.....', '.....c.c....', '......c.....', '....cccccc..', '....cccccc..']),
      russ: at([[10, 7, 'l'], [10, 8, 'l'], [6, 15, 'l'], [18, 7, 'K'], [19, 8, 'K'], [20, 16, 'K'], [24, 6, 'K'], [25, 16, 'K']]),
      schleier: sym(1, ['.....ZZZZZZZ', '...ZZZZZZZZZ', '..ZZ........', '..Z.........', '.ZZ.........', '.ZZ.........', '.ZZ.........', '.ZZ.........']),
      klingen: at([[22, 2, 'M'], [23, 1, 'M'], [24, 1, 'M'], [25, 0, 'M'], [22, 3, 'M'], [23, 3, 'M'], [24, 3, 'M'], [22, 21, 'M'], [23, 22, 'M'], [24, 22, 'M'], [25, 23, 'M'], [22, 20, 'M'], [23, 20, 'M'], [24, 20, 'M']]),
      pelz: rows(14, ['......IIIIIIIIIIII......', '....IIIIIIIIIIIIIIII....', '....II............II....']),
      sanduhr: at([[22, 15, 'A'], [22, 16, 'A'], [23, 15, 'p'], [23, 16, 'p'], [24, 15, 'A'], [24, 16, 'A']]),
      narbequer: at([[11, 6, 'R'], [11, 7, 'R'], [10, 8, 'R'], [10, 9, 'R'], [10, 10, 'R'], [10, 11, 'R'], [10, 12, 'R'], [10, 13, 'R'], [10, 14, 'R'], [10, 15, 'R'], [9, 16, 'R'], [9, 17, 'R']]),
      schutzbrille: at([[3, 8, 'M'], [3, 9, 'i'], [3, 10, 'M'], [3, 13, 'M'], [3, 14, 'i'], [3, 15, 'M'], [4, 8, 'M'], [4, 9, 'M'], [4, 10, 'M'], [4, 11, 'K'], [4, 12, 'K'], [4, 13, 'M'], [4, 14, 'M'], [4, 15, 'M']]),
      federkragen: rows(13, ['...I..I..........I..I...', '...IIIII........IIIII...', '..IIIIIIII....IIIIIIII..', '....IIII........IIII....']),
      lippen: at([[11, 10, 'F'], [11, 11, 'F'], [11, 12, 'F'], [11, 13, 'F'], [12, 11, 'F'], [12, 12, 'F']]),
      notizbuch: rows(18, ['VVV', 'VpV', 'VpV', 'VVV']),
      tattoo: at([[6, 5, 'R'], [7, 5, 'R'], [8, 5, 'R'], [8, 6, 'R'], [9, 6, 'R'], [10, 7, 'R'], [11, 7, 'R']]),
      windwirbel: at([[16, 0, 'Z'], [15, 1, 'Z'], [16, 2, 'Z'], [17, 1, 'Z'], [18, 0, 'Z'], [18, 23, 'Z'], [17, 22, 'Z'], [19, 22, 'Z'], [18, 21, 'Z']]),
      // C4 Flossenvolk
      saegenase: at([[10, 12, 'M'], [10, 13, 'M'], [10, 14, 'M'], [10, 15, 'M'], [10, 16, 'M'], [10, 17, 'M'], [10, 18, 'M'], [10, 19, 'M'], [10, 20, 'M'], [10, 21, 'M'], [10, 22, 'M'], [11, 14, 'X'], [11, 16, 'X'], [11, 18, 'X'], [11, 20, 'X'], [11, 22, 'X'], [9, 12, 'M'], [9, 13, 'M']]),
      zahnkette: at([[15, 7, 'K'], [16, 8, 'X'], [16, 9, 'K'], [17, 10, 'X'], [17, 11, 'K'], [17, 12, 'K'], [17, 13, 'X'], [16, 14, 'K'], [16, 15, 'X'], [15, 16, 'K']]),
      haizaehne: at([[11, 10, 'X'], [11, 11, 'K'], [11, 12, 'X'], [11, 13, 'K'], [12, 10, 'K'], [12, 11, 'X'], [12, 12, 'K'], [12, 13, 'X']]),
      aermel: sym(16, ['.S..........', 'SS..........', 'S...........', 'SS..........', '.S..........', 'S...........']),
      tinte: at([[22, 1, 'K'], [23, 0, 'K'], [23, 1, 'K'], [23, 2, 'K'], [24, 1, 'K'], [25, 3, 'K'], [21, 0, 'K']]),
      schwarzgurt: rows(22, ['.....KKKKKKKKKKKKKK.....']).concat(at([[23, 13, 'K'], [24, 13, 'K'], [25, 14, 'K'], [23, 14, 'K']])),
      handschuhe: at([[18, 2, 'A'], [18, 3, 'A'], [19, 2, 'K'], [19, 3, 'K'], [20, 2, 'K'], [20, 3, 'K'], [21, 2, 'K'], [21, 3, 'K'], [18, 20, 'A'], [18, 21, 'A'], [19, 20, 'K'], [19, 21, 'K'], [20, 20, 'K'], [20, 21, 'K'], [21, 20, 'K'], [21, 21, 'K']]),
      flosse: rows(10, ['S.', 'SS', 'SSS', 'SSS']),
      schnorchel: at([[2, 21, 'A'], [3, 21, 'A'], [4, 21, 'A'], [5, 22, 'A'], [6, 22, 'A'], [7, 22, 'A'], [8, 22, 'A'], [9, 22, 'A'], [10, 21, 'A'], [11, 20, 'A'], [11, 19, 'A'], [11, 18, 'A'], [1, 21, 'F'], [1, 20, 'F']]),
      flasche: at([[20, 5, 'K'], [21, 5, 'F'], [21, 6, 'F'], [22, 5, 'F'], [22, 6, 'F'], [23, 5, 'F'], [23, 6, 'F'], [21, 4, 'F']]),
      eiszapfen: at([[15, 4, 'i'], [16, 4, 'i'], [17, 4, 'i'], [15, 19, 'i'], [16, 19, 'i'], [17, 19, 'i'], [16, 3, 'i'], [16, 20, 'i']]),
      // C4 Zirkus der Narren
      baelle: at([[13, 1, 'F'], [14, 1, 'F'], [15, 0, 'A'], [16, 0, 'A'], [17, 1, 'n'], [18, 1, 'n']]),
      konfetti: at([[2, 1, 'F'], [6, 0, 'A'], [9, 23, 'n'], [4, 22, 'A'], [12, 22, 'F'], [0, 4, 'n'], [25, 2, 'A'], [26, 21, 'F']]),
      keule: rows(11, ['.....................VV.', '....................VVVV', '....................VLVV', '....................VVVV', '....................VVLV', '.....................VV.', '.....................V..', '.....................V..']).concat(at([[22, 21, 'V']])),
      messer: at([[10, 0, 'M'], [11, 0, 'M'], [12, 0, 'V'], [14, 1, 'M'], [15, 1, 'M'], [16, 1, 'V']]),
      fackel: at([[12, 22, 'A'], [13, 21, 'F'], [13, 22, 'A'], [13, 23, 'F'], [14, 22, 'F'], [15, 22, 'V'], [16, 22, 'V'], [17, 22, 'V'], [18, 22, 'V']]),
      peitsche: at([[20, 1, 'V'], [21, 1, 'V'], [22, 0, 'L'], [23, 0, 'L'], [24, 1, 'L'], [25, 2, 'L'], [26, 2, 'L'], [27, 1, 'L'], [27, 0, 'L']]),
      metallarm: at([[16, 3, 'M'], [17, 2, 'M'], [17, 3, 'M'], [18, 2, 'K'], [18, 3, 'M'], [19, 2, 'M'], [19, 3, 'M'], [20, 2, 'M'], [20, 3, 'K'], [21, 2, 'M'], [21, 3, 'M'], [22, 2, 'M'], [22, 3, 'M']]),
      magnet: at([[18, 21, 'F'], [18, 22, 'F'], [18, 23, 'F'], [19, 21, 'F'], [19, 23, 'F'], [20, 21, 'M'], [20, 23, 'M'], [21, 22, 'Z'], [17, 23, 'Z']]),
      sicheln: at([[15, 1, 'M'], [16, 0, 'M'], [17, 0, 'M'], [18, 1, 'M'], [20, 1, 'V'], [21, 1, 'V'], [15, 22, 'M'], [16, 23, 'M'], [17, 23, 'M'], [18, 22, 'M'], [20, 22, 'V'], [21, 22, 'V']]),
      fleischkeule: at([[14, 21, 'V'], [14, 22, 'V'], [15, 20, 'V'], [15, 21, 'V'], [15, 22, 'V'], [15, 23, 'V'], [16, 20, 'V'], [16, 21, 'V'], [16, 22, 'V'], [16, 23, 'V'], [17, 21, 'V'], [17, 22, 'V'], [18, 22, 'X'], [19, 22, 'X'], [20, 22, 'X'], [20, 23, 'X'], [21, 23, 'X']]),
      schwanz: at([[22, 4, 'Q'], [22, 3, 'Q'], [23, 3, 'Q'], [23, 2, 'Q'], [24, 2, 'Q'], [24, 1, 'Q'], [25, 1, 'Q'], [25, 0, 'Q'], [26, 0, 'Q'], [22, 2, 'k'], [23, 1, 'k'], [24, 0, 'k']]),
      karten: at([[16, 21, 'X'], [15, 22, 'X'], [16, 22, 'F'], [15, 23, 'X'], [16, 23, 'X'], [17, 22, 'X'], [17, 23, 'n']]),
      puppe: at([[21, 4, 'p'], [22, 4, 'A'], [23, 3, 'A'], [23, 4, 'A'], [23, 5, 'A'], [24, 4, 'A'], [25, 3, 'A'], [25, 5, 'A']]),
      mundharmonika: at([[12, 10, 'M'], [12, 11, 'K'], [12, 12, 'M'], [12, 13, 'K'], [12, 14, 'M'], [12, 15, 'M']]),
      trommel: rows(19, ['........AAAAAAAA........', '........FXFFXFFX........', '........XFFXFFXF........', '........AAAAAAAA........']),
      // C4 Die zwei Flotten
      glut: at([[20, 2, 'F'], [21, 2, 'F'], [21, 3, 'A'], [19, 1, 'A'], [17, 0, 'F'], [14, 1, 'A'], [11, 0, 'F'], [9, 22, 'F'], [12, 23, 'A'], [6, 23, 'F']]),
      blauflamme: mir([[21, 2, 'n'], [21, 3, 'n'], [20, 2, 'w'], [20, 1, 'n'], [19, 1, 'w'], [18, 1, 'n'], [17, 0, 'w'], [16, 1, 'w']]),
      feder: at([[2, 22, 'X'], [3, 22, 'X'], [3, 21, 'X'], [4, 21, 'X'], [5, 21, 'X'], [6, 20, 'K'], [1, 22, 'K']]),
      blueten: at([[2, 1, 'c'], [7, 0, 'c'], [11, 1, 'p'], [5, 22, 'c'], [10, 23, 'c'], [14, 22, 'p'], [24, 1, 'c'], [26, 22, 'c']]),
      gewehr: at([[1, 23, 'M'], [2, 23, 'M'], [3, 23, 'M'], [4, 22, 'M'], [5, 22, 'M'], [6, 22, 'M'], [7, 22, 'V'], [8, 22, 'V'], [9, 22, 'V'], [10, 22, 'V'], [11, 23, 'V'], [12, 23, 'V'], [13, 23, 'V']]),
      latz: rows(15, ['........P......P........', '........P......P........', '........PAPPPPAP........', '........PPPPPPPP........', '........PPPPPPPP........', '........PPPPPPPP........', '........PPPPPPPP........']),
      pfanne: at([[20, 22, 'V'], [19, 22, 'V'], [18, 22, 'V'], [17, 21, 'K'], [17, 22, 'K'], [17, 23, 'K'], [16, 21, 'K'], [16, 22, 'K'], [16, 23, 'K'], [15, 22, 'K'], [14, 22, 'Z'], [13, 23, 'Z']]),
      armbrust: at([[18, 19, 'V'], [18, 20, 'V'], [18, 21, 'V'], [18, 22, 'V'], [18, 23, 'M'], [15, 22, 'M'], [16, 22, 'M'], [17, 22, 'M'], [19, 22, 'M'], [20, 22, 'M'], [21, 22, 'M'], [16, 21, 'L'], [20, 21, 'L']]),
      zielglas: at([[6, 13, 'M'], [6, 14, 'M'], [6, 15, 'M'], [6, 16, 'M'], [7, 13, 'M'], [8, 13, 'M'], [9, 13, 'M'], [7, 16, 'M'], [8, 16, 'M'], [9, 16, 'M'], [10, 13, 'M'], [10, 14, 'M'], [10, 15, 'M'], [10, 16, 'M'], [8, 17, 'M'], [8, 18, 'M'], [8, 19, 'K']]),
      zielrohr: at([[0, 23, 'M'], [1, 23, 'M'], [2, 23, 'M'], [3, 22, 'M'], [4, 22, 'M'], [5, 22, 'K'], [6, 22, 'K'], [5, 21, 'K'], [6, 21, 'K'], [7, 22, 'M'], [8, 22, 'V'], [9, 22, 'V'], [10, 22, 'V'], [11, 22, 'V'], [12, 23, 'V'], [13, 23, 'V'], [14, 23, 'V']]),
      anker: at([[15, 1, 'M'], [16, 1, 'M'], [17, 0, 'M'], [17, 1, 'M'], [18, 1, 'M'], [19, 1, 'M'], [20, 1, 'M'], [21, 1, 'M'], [22, 1, 'M'], [23, 1, 'M'], [24, 0, 'M'], [24, 1, 'M'], [24, 2, 'M'], [23, 0, 'M'], [23, 2, 'M'], [14, 1, 'K']]),
      domino: at([[6, 7, 'K'], [6, 8, 'K'], [6, 9, 'K'], [6, 10, 'K'], [6, 13, 'K'], [6, 14, 'K'], [6, 15, 'K'], [6, 16, 'K'], [7, 7, 'K'], [7, 10, 'K'], [7, 11, 'K'], [7, 12, 'K'], [7, 13, 'K'], [7, 16, 'K'], [8, 7, 'K'], [8, 10, 'K'], [8, 13, 'K'], [8, 16, 'K'], [9, 7, 'K'], [9, 10, 'K'], [9, 13, 'K'], [9, 16, 'K'], [10, 8, 'K'], [10, 9, 'K'], [10, 14, 'K'], [10, 15, 'K']]),
      // C4 Freibeuter der Krone (I = look.scarf für Schlange und Schirm)
      steuerrad: at([[18, 20, 'V'], [18, 21, 'V'], [18, 22, 'V'], [19, 19, 'V'], [19, 21, 'V'], [19, 23, 'V'], [20, 19, 'V'], [20, 20, 'V'], [20, 21, 'A'], [20, 22, 'V'], [20, 23, 'V'], [21, 19, 'V'], [21, 21, 'V'], [21, 23, 'V'], [22, 20, 'V'], [22, 21, 'V'], [22, 22, 'V'], [17, 21, 'V'], [23, 21, 'V']]),
      grossschwert: at([[1, 22, 'A'], [2, 22, 'V'], [3, 22, 'V'], [4, 22, 'V'], [5, 21, 'A'], [5, 22, 'A'], [5, 23, 'A'], [6, 22, 'A']].concat([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(y => [y, 22, 'K']), [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(y => [y, 23, 'K']), [[24, 22, 'K']])),
      schlange: at([[13, 4, 'I'], [13, 5, 'K'], [14, 4, 'I'], [14, 5, 'I'], [14, 6, 'F'], [15, 4, 'I'], [16, 3, 'I'], [16, 2, 'I'], [17, 3, 'I'], [18, 2, 'I'], [18, 3, 'I'], [19, 3, 'I'], [20, 2, 'I']]),
      herzen: at([[1, 1, 'F'], [1, 3, 'F'], [2, 1, 'F'], [2, 2, 'F'], [2, 3, 'F'], [3, 2, 'F'], [2, 20, 'F'], [2, 22, 'F'], [3, 20, 'F'], [3, 21, 'F'], [3, 22, 'F'], [4, 21, 'F'], [23, 1, 'c'], [23, 3, 'c'], [24, 2, 'c']]),
      bogen: at([[14, 22, 'V'], [15, 23, 'V'], [16, 23, 'V'], [17, 23, 'V'], [18, 23, 'V'], [19, 23, 'V'], [20, 23, 'V'], [21, 23, 'V'], [22, 23, 'V'], [23, 22, 'V'], [15, 22, 'Z'], [16, 22, 'Z'], [17, 22, 'Z'], [18, 22, 'Z'], [20, 22, 'Z'], [21, 22, 'Z'], [22, 22, 'Z'], [19, 22, 'F'], [19, 21, 'V']]),
      sonnenbrille: rows(6, ['......KKKKKKKKKKKK......', '.......KXKK..KXKK.......', '........KK....KK........']),
      faden: mir([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(y => [y, 0, 'X']).concat([[18, 1, 'X'], [19, 1, 'X'], [5, 1, 'X']])),
      pfoten: mir([[19, 1, 'L'], [19, 2, 'L'], [19, 3, 'L'], [19, 4, 'L'], [20, 1, 'L'], [20, 2, 'c'], [20, 3, 'c'], [20, 4, 'L'], [21, 1, 'L'], [21, 2, 'L'], [21, 3, 'L'], [21, 4, 'L'], [22, 2, 'L'], [22, 3, 'L'], [18, 2, 'L'], [18, 3, 'L']]),
      schirm: at([[11, 23, 'K'], [12, 22, 'I'], [12, 23, 'I'], [13, 22, 'I'], [13, 23, 'I'], [14, 22, 'I'], [14, 23, 'I'], [15, 22, 'I'], [15, 23, 'X'], [16, 22, 'I'], [17, 22, 'X'], [18, 22, 'K'], [19, 22, 'K'], [20, 22, 'K'], [21, 22, 'K'], [22, 22, 'K'], [23, 22, 'K'], [23, 21, 'K']]),
      teddy: at([[18, 0, 'V'], [18, 2, 'V'], [19, 0, 'V'], [19, 1, 'V'], [19, 2, 'V'], [20, 0, 'K'], [20, 1, 'V'], [20, 2, 'K'], [21, 0, 'V'], [21, 1, 'p'], [21, 2, 'V'], [22, 0, 'V'], [22, 1, 'V'], [22, 2, 'V'], [23, 0, 'V'], [23, 2, 'V']]),
      geister: at([[2, 0, 'Z'], [2, 1, 'Z'], [2, 2, 'Z'], [3, 0, 'K'], [3, 1, 'Z'], [3, 2, 'K'], [4, 0, 'Z'], [4, 1, 'Z'], [4, 2, 'Z'], [5, 0, 'Z'], [5, 2, 'Z'], [23, 21, 'Z'], [23, 22, 'Z'], [23, 23, 'Z'], [24, 21, 'K'], [24, 22, 'Z'], [24, 23, 'K'], [25, 21, 'Z'], [25, 22, 'Z'], [25, 23, 'Z'], [26, 21, 'Z'], [26, 23, 'Z']]),
      fledermaus: at([[1, 0, 'K'], [1, 4, 'K'], [2, 0, 'K'], [2, 1, 'K'], [2, 2, 'K'], [2, 3, 'K'], [2, 4, 'K'], [3, 1, 'K'], [3, 3, 'K'], [0, 18, 'K'], [0, 22, 'K'], [1, 18, 'K'], [1, 19, 'K'], [1, 20, 'K'], [1, 21, 'K'], [1, 22, 'K'], [2, 19, 'K'], [2, 21, 'K']]),
      stehkragen: mir([[9, 1, 'Q'], [10, 1, 'Q'], [10, 2, 'Q'], [11, 1, 'Q'], [11, 2, 'Q'], [12, 2, 'Q'], [12, 3, 'Q'], [13, 3, 'Q'], [13, 4, 'Q'], [13, 5, 'Q'], [14, 4, 'Q'], [14, 5, 'Q'], [14, 6, 'Q'], [14, 7, 'Q']]),
      nadel: at([[13, 23, 'M'], [14, 23, 'M'], [15, 22, 'M'], [16, 22, 'M'], [17, 22, 'M'], [18, 22, 'M'], [13, 22, 'F'], [12, 21, 'F'], [12, 22, 'F'], [19, 23, 'F'], [20, 23, 'F'], [21, 22, 'F']]),
      // C4 Einzelgänger Zirrus: Blitzstab, Wolke unter den Füßen, Wolkenkragen, kleine Blitze
      blitzstab: at([[2, 23, 'X'], [3, 21, 'A'], [3, 22, 'A'], [4, 22, 'A'], [5, 21, 'A'], [5, 22, 'A'], [6, 22, 'A'], [6, 23, 'A'], [7, 22, 'A'], [4, 20, 'X']].concat([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(y => [y, 22, y % 4 ? 'V' : 'A']))),
      wolke: rows(26, ['ZZZ.......ZZZ.......ZZZ.', 'ZZZZ......ZZZZ.....ZZZZZ', 'ZZZZ......ZZZZ......ZZZZ', '.ZZ........ZZ........ZZ.']),
      wolkenkragen: rows(14, ['......ZZZZZZZZZZZZ......', '.....ZZZ.ZZZZZZ.ZZZ.....']),
      blitze: at([[1, 1, 'A'], [2, 2, 'A'], [3, 1, 'A'], [4, 2, 'A'], [10, 22, 'A'], [11, 23, 'A'], [12, 22, 'A'], [13, 23, 'A'], [22, 1, 'A'], [23, 0, 'A'], [24, 1, 'A']])
    };
    // C4 Sturmmöwen Board 2: Form-Teile der Story-Formen (look.facc, höchstens 4), gezeichnet nach look.x und vor dem Abzeichen.
    // Liste oder Funktion g => ... (z. B. nur leere Felder füllen). Neue Farben: o Orange, v Blattgrün, e Dunkelgrün,
    // t Türkis, u Violett, s Stahl dunkel, d Leder, y Trankgrün
    const swap = (from, to, list) => g => list.forEach(([y, x]) => { if (g[y] && from.includes(g[y][x])) g[y][x] = to; });
    const span = (y0, y1, xs) => { const a = []; for (let y = y0; y <= y1; y++) xs.forEach(x => a.push([y, x])); return a; };
    const free = list => g => list.forEach(([y, x, ch]) => { if (g[y] && g[y][x] === '.') g[y][x] = ch; });
    const many = (...fs) => g => fs.forEach(f => (typeof f === 'function' ? f(g) : f.forEach(([y, x, ch]) => { if (g[y] && x >= 0 && x < W) g[y][x] = ch; })));
    const aura = c => at([[2, 0, c], [4, 1, c], [6, 0, c], [9, 1, c], [12, 0, c], [15, 1, c], [1, 23, c], [3, 22, c], [5, 23, c], [18, 23, c], [20, 22, c], [22, 23, c]]);
    const FACC = {
      // Rafe: A offene Weste, Glut | B Faustbandagen, Wirbelfäuste
      weste: many(swap('C', 'n', span(15, 21, [4, 5, 6, 7, 8, 15, 16, 17, 18, 19])), swap('C', 'S', span(19, 21, [10, 11, 12, 13]))),
      glut: at([[14, 1, 'o'], [12, 0, 'o'], [10, 1, 'o'], [13, 22, 'o'], [11, 23, 'o'], [9, 22, 'o'], [16, 0, 'A'], [11, 1, 'A'], [15, 23, 'A'], [8, 23, 'A'], [7, 1, 'Z'], [6, 0, 'Z'], [6, 22, 'Z'], [5, 23, 'Z']]),
      faustband: many(span(19, 21, [2, 3, 20, 21]).map(([y, x]) => [y, x, y === 20 ? 'n' : 'X'])),
      wirbel: mir([[16, 1, 'n'], [17, 0, 'w'], [18, 1, 'n'], [19, 0, 'w'], [20, 1, 'n'], [21, 0, 'w'], [22, 1, 'w']]),
      // Soren: A Bauchbinde, Ohrringe | B Armtuch (das Erinnerungsstück), Dämonen-Schimmer
      bauchbinde: many(swap('C', 'R', span(20, 21, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])), at([[22, 7, 'R'], [23, 7, 'R'], [24, 6, 'R']])),
      ohrringe: at([[9, 1, 'A'], [10, 2, 'A'], [11, 2, 'A']]),
      armtuch: at([[16, 2, 'K'], [16, 3, 'K'], [17, 2, 'K'], [17, 3, 'K'], [17, 1, 'K'], [18, 0, 'K'], [18, 1, 'K']]),
      daemon: aura('u'),
      // Nela: A Windrosen-Tattoo, Wetterstab | B Kompass am Gürtel, Regenwolke
      tattoo: many(swap('C', 'S', span(16, 18, [2, 3, 20, 21])), at([[16, 3, 'n'], [17, 2, 'n'], [17, 3, 't'], [18, 3, 'n']])),
      wetterstab: at([5, 6, 7].map(y => [y, 22, 'Z']).concat([[6, 21, 'Z'], [6, 23, 'Z']], [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(y => [y, 22, y === 13 || y === 19 ? 'X' : 'n']))),
      kompass: at([[19, 16, 'L'], [20, 16, 'L'], [21, 15, 'A'], [21, 16, 'A'], [21, 17, 'A'], [22, 15, 'A'], [22, 16, 'X'], [22, 17, 'A'], [23, 15, 'A'], [23, 16, 'F'], [23, 17, 'A']]),
      regenwolke: at([[4, 1, 'Z'], [4, 2, 'Z'], [5, 0, 'Z'], [5, 1, 's'], [5, 2, 's'], [6, 0, 's'], [6, 1, 's'], [6, 2, 's'], [7, 0, 's'], [7, 1, 's'], [8, 0, 'w'], [9, 1, 'A'], [10, 1, 'A'], [11, 0, 'w'], [12, 1, 'w'], [13, 0, 'w']]),
      // Lasse: A Gurt, Schleuder, Heldenmaske, Umhang | B Holzschwert, große Schleuder, Nebel (dazu Hut papierhut/hood)
      gurt: at([15, 16, 17, 18, 19, 20, 21].map(y => [[y, 17 - (y - 15), 'd'], [y, 18 - (y - 15), 'd']]).flat().concat([[16, 17, 'A'], [19, 15, 'V'], [20, 15, 'V'], [20, 14, 'V']])),
      schleuder: at([[13, 21, 'V'], [13, 22, 'F'], [13, 23, 'V'], [14, 21, 'V'], [14, 23, 'V'], [15, 22, 'V'], [16, 22, 'V'], [17, 22, 'V'], [18, 22, 'd']]),
      heldenmaske: at(span(7, 9, [6, 7, 10, 11, 12, 13, 16, 17]).map(([y, x]) => [y, x, 'n']).concat([[6, 7, 'n'], [6, 8, 'n'], [6, 9, 'n'], [6, 14, 'n'], [6, 15, 'n'], [6, 16, 'n'], [10, 7, 'n'], [10, 8, 'n'], [10, 9, 'n'], [10, 14, 'n'], [10, 15, 'n'], [10, 16, 'n'], [8, 5, 'n'], [9, 4, 'n'], [8, 18, 'n'], [9, 19, 'n']])),
      umhang: free(span(15, 27, [0, 1, 2, 3, 4, 19, 20, 21, 22, 23]).filter(([y, x]) => x >= 3 - Math.floor((y - 15) / 4) && x <= 20 + Math.floor((y - 15) / 4)).map(([y, x]) => [y, x, 'F']).concat(at([[14, 5, 'F'], [14, 6, 'F'], [14, 17, 'F'], [14, 18, 'F']]))),
      holzschwert: at([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(y => [y, 22, 'V']).concat([[6, 22, 'p'], [18, 21, 'd'], [18, 22, 'd'], [18, 23, 'd'], [19, 22, 'd'], [20, 22, 'd']])),
      grossschleuder: at([[9, 21, 'V'], [9, 22, 'F'], [9, 23, 'V'], [10, 21, 'V'], [10, 23, 'V'], [11, 21, 'V'], [11, 23, 'V'], [12, 21, 'V'], [12, 22, 'V'], [12, 23, 'V'], [13, 22, 'V'], [14, 22, 'd'], [15, 22, 'd'], [16, 22, 'V'], [17, 22, 'V']]),
      nebel: free([[27, 1, 'Z'], [27, 2, 'Z'], [28, 0, 'Z'], [28, 1, 'Z'], [28, 2, 'Z'], [28, 3, 'Z'], [29, 0, 'Z'], [29, 2, 'Z'], [27, 21, 'Z'], [27, 22, 'Z'], [28, 20, 'Z'], [28, 21, 'Z'], [28, 22, 'Z'], [28, 23, 'Z'], [29, 21, 'Z'], [29, 23, 'Z'], [29, 11, 'Z'], [29, 12, 'Z'], [28, 11, 'Z']]),
      // Santo: A Strähne, dunkle Weste, Flammenbein | B Kochschürze, schwarze Stiefel, Wirbeltritt
      straehne: at([[6, 13, 'H'], [6, 14, 'H'], [6, 15, 'H'], [6, 16, 'H'], [7, 14, 'H'], [7, 15, 'H'], [7, 16, 'H'], [8, 14, 'H'], [8, 15, 'H'], [9, 15, 'H']]),
      anzug: many(swap('C', 'K', span(15, 21, [4, 5, 6, 7, 8, 15, 16, 17, 18, 19])), at([[19, 9, 'A'], [21, 9, 'A']])),
      feuerbein: free([[22, 19, 'A'], [23, 19, 'o'], [24, 19, 'F'], [25, 19, 'o'], [26, 19, 'F'], [27, 19, 'o'], [28, 20, 'F'], [29, 20, 'o'], [27, 20, 'A'], [25, 20, 'A'], [23, 20, 'F'], [25, 13, 'F'], [26, 13, 'o'], [27, 13, 'F'], [28, 13, 'A']]),
      schuerze: at(span(22, 27, [8, 9, 10, 11, 12, 13, 14, 15]).map(([y, x]) => [y, x, y === 24 && x >= 10 && x <= 13 ? 'p' : 'X']).concat([5, 6, 7, 16, 17, 18].map(x => [22, x, 'X']), [[23, 6, 'X'], [24, 6, 'X']])),
      schwarzstiefel: many(swap('POAc', 'K', span(24, 29, [4, 5, 6, 7, 8, 9, 14, 15, 16, 17, 18, 19])), at([[26, 7, 'A'], [26, 16, 'A']])),
      wirbeltritt: mir([[22, 2, 'w'], [23, 1, 'w'], [24, 0, 'w'], [25, 0, 'X'], [26, 0, 'w'], [27, 1, 'w'], [28, 2, 'X']]),
      // Pipo: A Kreuz, Arzttasche, Geweih-Mütze, Fellkragen | B Stethoskop, Wundertrank, grüner Schimmer
      kreuz: at([[16, 14, 'X'], [17, 13, 'X'], [17, 14, 'X'], [17, 15, 'X'], [18, 14, 'X']]),
      arzttasche: rows(21, ['....................dd..', '...................KKKKK', '...................KKXKK', '...................KXXXK', '...................KKXKK', '...................KKKKK']).concat(at([[21, 19, 'd'], [21, 22, 'd']])),
      geweih: sym(0, ['..V.V.......', '...VV.......', '....VV......']),
      fell: rows(14, ['......dddddddddddd......', '....dddddddddddddddd....', '...dd..............dd...']),
      stethoskop: at([[15, 9, 'K'], [15, 14, 'K'], [16, 14, 'K'], [17, 15, 'K'], [18, 15, 'K'], [19, 15, 'K'], [20, 14, 'M'], [20, 15, 'M'], [21, 14, 'M'], [21, 15, 'M'], [20, 16, 'K']]),
      trank: at([[15, 1, 'X'], [16, 0, 'X'], [17, 1, 'p'], [18, 0, 'v'], [18, 1, 'v'], [19, 0, 'v'], [19, 1, 'y'], [20, 0, 'v'], [20, 1, 'v'], [21, 0, 'e'], [21, 1, 'e']]),
      gruenaura: aura('v'),
      // Rubina: A dickes Buch, Lupe, Blütenwirbel | B Pinsel, Schriftrolle, Ranken
      buch: rows(16, ['nnn', 'nAn', 'nnn', 'nnn', 'nnn', 'ppp']),
      lupe: at([[14, 21, 'M'], [14, 22, 'M'], [14, 23, 'M'], [15, 21, 'M'], [15, 22, 'i'], [15, 23, 'M'], [16, 21, 'M'], [16, 22, 'M'], [16, 23, 'M'], [17, 22, 'V'], [18, 22, 'V'], [19, 22, 'V']]),
      bluetenwirbel: at([[6, 0, 'c'], [9, 1, 'X'], [12, 0, 'c'], [5, 23, 'X'], [8, 22, 'c'], [13, 23, 'c'], [20, 0, 'X'], [22, 23, 'c'], [25, 1, 'c'], [27, 22, 'X']]),
      pinsel: at([[13, 22, 'L'], [14, 22, 'p'], [15, 22, 'p'], [16, 22, 'A'], [17, 22, 'V'], [18, 22, 'V'], [19, 22, 'V'], [20, 22, 'V']]),
      schriftrolle: rows(16, ['Vp.', 'pp.', 'pL.', 'pp.', 'pL.', 'Vp.']).concat(at([[18, 2, 'S'], [19, 2, 'S']])),
      ranken: free([[27, 4, 'v'], [26, 4, 'e'], [25, 4, 'v'], [24, 4, 'v'], [23, 4, 'e'], [22, 4, 'v'], [21, 4, 'v'], [20, 4, 'e'], [19, 4, 'v'], [18, 4, 'v'], [17, 1, 'v'], [16, 1, 'e'], [15, 1, 'v'], [24, 3, 'c'], [20, 4, 'F'], [15, 0, 'c'],
        [27, 19, 'v'], [26, 19, 'v'], [25, 19, 'e'], [24, 19, 'v'], [23, 19, 'v'], [22, 19, 'e'], [21, 19, 'v'], [20, 19, 'c'], [19, 19, 'v'], [18, 19, 'e'], [23, 20, 'F'], [29, 3, 'e'], [29, 20, 'e']]),
      // Bolzen: A Stahlarm, Schraubenschlüssel, Brustplatte, Werkzeuggurt | B Zahnrad-Schulter, Ölkanne, Bauplan, Hammer
      stahlarm: at(span(16, 21, [2, 3]).map(([y, x]) => [y, x, (y === 17 && x === 2) || (y === 20 && x === 3) ? 'K' : 'M']).concat([[15, 4, 'A']])),
      schluessel: at([[11, 21, 'M'], [11, 23, 'M'], [12, 21, 'M'], [12, 22, 'M'], [12, 23, 'M']].concat([13, 14, 15, 16, 17, 18, 19].map(y => [y, 22, y === 16 ? 's' : 'M']))),
      brustplatte: rows(15, ['.........MMMMMM.........', '.........MKMMKM.........', '.........MMMMMM.........', '.........MMMMMM.........', '.........MKMMKM.........']),
      werkzeuggurt: rows(22, ['.....dddddddddddddd.....']).concat(at([[22, 11, 'A'], [22, 12, 'A'], [23, 5, 's'], [23, 6, 's'], [23, 7, 's'], [24, 6, 'V'], [25, 6, 'V'], [23, 9, 'd'], [23, 10, 'd'], [24, 9, 'd'], [24, 10, 'd'], [23, 17, 'M'], [24, 17, 'M'], [25, 17, 'M'], [25, 16, 'M'], [25, 18, 'M']])),
      zahnrad: at([[14, 20, 'M'], [15, 19, 'M'], [15, 20, 'M'], [15, 21, 'M'], [16, 18, 'M'], [16, 19, 'M'], [16, 20, 'K'], [16, 21, 'M'], [16, 22, 'M'], [17, 19, 'M'], [17, 20, 'M'], [17, 21, 'M'], [18, 20, 'M'], [14, 18, 's'], [14, 22, 's'], [18, 18, 's'], [18, 22, 's']]),
      oelkanne: at([[16, 0, 'A'], [17, 1, 'A'], [18, 0, 'A'], [18, 1, 'A'], [19, 0, 'F'], [19, 1, 'A'], [20, 0, 'F'], [20, 1, 'A'], [21, 0, 'A'], [21, 1, 'A']]),
      bauplan: rows(15, ['ww', 'nn', 'nX', 'nn', 'Xn', 'nn', 'ww']),
      hammer: at([[14, 21, 's'], [14, 22, 's'], [14, 23, 's'], [15, 21, 's'], [15, 22, 's'], [15, 23, 's'], [16, 22, 'V'], [17, 22, 'V'], [18, 22, 'V'], [19, 22, 'V'], [20, 22, 'V']]),
      // Bruno: A Knochenkette, Seelenhauch, Geige, Noten | B Bühnenbrille, Mikrofon, Akkordeon, Noten
      knochenkette: rows(15, ['........XpXpXpXp........']).concat(at([[16, 11, 'X'], [16, 12, 'X']])),
      geisterhauch: at([[7, 0, 'i'], [8, 0, 'Z'], [10, 0, 'i'], [12, 0, 'Z'], [13, 1, 'i'], [14, 0, 'i'], [7, 23, 'i'], [8, 23, 'Z'], [10, 23, 'i'], [12, 23, 'Z'], [13, 22, 'i']]),
      geige: at([[12, 1, 'K'], [13, 1, 'K'], [14, 1, 'K'], [15, 1, 'V'], [16, 0, 'V'], [16, 1, 'd'], [16, 2, 'V'], [17, 1, 'V'], [18, 0, 'V'], [18, 1, 'd'], [18, 2, 'V'], [19, 1, 'V'], [12, 23, 'L'], [13, 22, 'p'], [14, 22, 'p'], [15, 21, 'p']]),
      noten: free([[1, 1, 'A'], [2, 1, 'A'], [3, 1, 'A'], [3, 0, 'A'], [1, 2, 'A'], [0, 22, 'A'], [1, 22, 'A'], [2, 22, 'A'], [2, 21, 'A'], [0, 23, 'A'], [24, 1, 'A'], [25, 1, 'A'], [25, 0, 'A']]),
      buehnenbrille: rows(7, ['.......KKKK..KKKK.......', '.......KKKKAAKKKK.......']),
      mikro: at([[10, 22, 's'], [10, 23, 's'], [11, 22, 'K'], [11, 23, 'K'], [12, 22, 'A']].concat([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map(y => [y, 22, 'M']), [[29, 20, 'M'], [29, 21, 'M'], [29, 22, 'M'], [29, 23, 'M']])),
      akkordeon: rows(18, Array(6).fill('......KFdFdFdFdFdK......')).concat(at([[19, 6, 'A'], [21, 6, 'A'], [19, 17, 'A'], [21, 17, 'A']]))
    };
    // Papierhut (Lasse, Kapitän der Kinderbande)
    HATS.papierhut = { clear: [0, 1, 2, 3], px: sym(0, ['...........q', '.........BBB', '.......BBBBq', '.....BBBBBBB', '...BBBBBBBBB', '..kkkkkkkkkk']) };
    // Fraktions-Abzeichen (Leitfarbe, je Fraktion ein Teil). Schlüssel = Banden-id, Varianten mit _a/_b fürs Board.
    // r Leitfarbe, a Messing
    const BADGE = {
      marine_schaerpe: { px: at([[15, 6, 'r'], [16, 7, 'r'], [16, 6, 'r'], [17, 8, 'r'], [17, 7, 'r'], [18, 9, 'r'], [18, 8, 'r'], [19, 10, 'r'], [19, 9, 'r'], [20, 11, 'a'], [20, 10, 'a'], [21, 12, 'r'], [21, 11, 'r'], [22, 13, 'r'], [22, 12, 'r']]), c: { r: '#b8343a', a: '#d9a640' } },
      marine_abzeichen: { px: at([[17, 7, 'a'], [17, 9, 'a'], [18, 7, 'a'], [18, 8, 'r'], [18, 9, 'a'], [19, 7, 'a'], [19, 8, 'a'], [19, 9, 'a']]), c: { r: '#b8343a', a: '#d9a640' } }
    };
    BADGE.cp9_krawatte = { px: at([[15, 10, 'a'], [15, 13, 'a'], [15, 11, 'r'], [15, 12, 'r'], [16, 11, 'r'], [16, 12, 'r'], [17, 11, 'r'], [17, 12, 'r'], [18, 11, 'r'], [18, 12, 'r'], [19, 11, 'r'], [19, 12, 'r'], [20, 11, 'r'], [20, 12, 'r'], [21, 11, 'r']]), c: { r: '#6a3fa0', a: '#cfd6dc' } };
    BADGE.cp9_nadel = { px: at([[16, 7, 'a'], [17, 6, 'r'], [17, 7, 'r'], [17, 8, 'r'], [18, 7, 'a']]), c: { r: '#8a5ac8', a: '#cfd6dc' } };
    const BOW = at([[15, 9, 'r'], [15, 10, 'r'], [15, 13, 'r'], [15, 14, 'r'], [15, 11, 'a'], [15, 12, 'a'], [16, 10, 'r'], [16, 11, 'r'], [16, 12, 'r'], [16, 13, 'r'], [17, 11, 'r'], [17, 12, 'r']]);
    const BELT = rows(22, ['.....rrrrrraarrrrrr.....']).concat(at([[21, 11, 'a'], [21, 12, 'a']]));
    BADGE.baroque_schleife = { px: BOW, c: { r: '#7a1f35', a: '#d9a640' } };
    BADGE.baroque_guertel = { px: BELT, c: { r: '#7a1f35', a: '#d9a640' } };
    BADGE.revolution_schleife = { px: BOW, c: { r: '#7a1f35', a: '#8fb08a' } };
    BADGE.revolution_guertel = { px: BELT, c: { r: '#7a1f35', a: '#8fb08a' } };
    BADGE.fischmensch_muschel = { px: at([[15, 11, 'a'], [16, 11, 'r'], [16, 12, 'r'], [17, 10, 'r'], [17, 11, 'a'], [17, 12, 'r'], [17, 13, 'r'], [18, 11, 'r'], [18, 12, 'r']]), c: { r: '#2fb8b0', a: '#f4f0e0' } };
    BADGE.fischmensch_armband = { px: at([[17, 2, 'r'], [17, 3, 'r'], [18, 2, 'a'], [18, 3, 'r'], [17, 20, 'r'], [17, 21, 'r'], [18, 20, 'r'], [18, 21, 'a']]), c: { r: '#2fb8b0', a: '#f4f0e0' } };
    BADGE.fischmensch = BADGE.fischmensch_muschel; // Flossenvolk: Muschel (Felix, 25.10.)
    // Zirkus der Narren: Magenta, Pomp-Truppe mit Creme, Wildfänge mit Gelb
    const RUFF = sym(14, ['......rarara', '.....r.r.r.r']);
    const RAUTE = at([[15, 11, 'r'], [15, 12, 'r'], [16, 10, 'r'], [16, 11, 'a'], [16, 12, 'a'], [16, 13, 'r'], [17, 10, 'r'], [17, 11, 'a'], [17, 12, 'a'], [17, 13, 'r'], [18, 11, 'r'], [18, 12, 'r']]);
    BADGE.buggy_kragen = { px: RUFF, c: { r: '#c2318a', a: '#f4f0e0' } };
    BADGE.buggy_raute = { px: RAUTE, c: { r: '#c2318a', a: '#f4f0e0' } };
    BADGE.supernova_kragen = { px: RUFF, c: { r: '#c2318a', a: '#f2d24a' } };
    BADGE.supernova_raute = { px: RAUTE, c: { r: '#c2318a', a: '#f2d24a' } };
    // Die zwei Flotten: Gischt-Flotte Elfenbein mit Marineblau, Rotmantel-Flotte Mohnrot mit Creme
    const TUCH = rows(15, ['........rrraarrr........', '.........rrrrrr.........', '..........rrrr..........', '...........rr...........']);
    const WIMPEL = at([[16, 7, 'a'], [17, 7, 'a'], [18, 7, 'a'], [19, 7, 'a'], [16, 8, 'r'], [16, 9, 'r'], [16, 10, 'r'], [17, 8, 'r'], [17, 9, 'r']]);
    BADGE.weissbart_tuch = { px: TUCH, c: { r: '#ece3cc', a: '#2f5a9a' } };
    BADGE.weissbart_wimpel = { px: WIMPEL, c: { r: '#ece3cc', a: '#2f5a9a' } };
    BADGE.rothaar_tuch = { px: TUCH, c: { r: '#c8302c', a: '#f4f0e0' } };
    BADGE.rothaar_wimpel = { px: WIMPEL, c: { r: '#c8302c', a: '#f4f0e0' } };
    // Freibeuter der Krone: Tannengrün mit Gold, Schauerbarken-Bande Tannengrün mit Nebelgrau
    const SIEGEL = at([[16, 13, 'r'], [16, 14, 'r'], [16, 15, 'r'], [17, 13, 'r'], [17, 14, 'a'], [17, 15, 'r'], [18, 13, 'r'], [18, 14, 'r'], [18, 15, 'r'], [19, 13, 'a'], [19, 15, 'a']]);
    const KLAPPE = mir([[15, 5, 'a'], [15, 6, 'r'], [16, 3, 'r'], [16, 4, 'r'], [16, 5, 'r'], [16, 6, 'a'], [17, 3, 'a'], [17, 4, 'a']]);
    BADGE.samurai_siegel = { px: SIEGEL, c: { r: '#2f6a4a', a: '#d9a640' } };
    BADGE.samurai_klappe = { px: KLAPPE, c: { r: '#2f6a4a', a: '#d9a640' } };
    BADGE.thriller_siegel = { px: SIEGEL, c: { r: '#2f6a4a', a: '#a8b0b8' } };
    BADGE.thriller_klappe = { px: KLAPPE, c: { r: '#2f6a4a', a: '#a8b0b8' } };
    // Sturmmöwen: Blau mit Weiß (Vorschläge fürs Board, aktiv erst nach Felix' Wahl)
    BADGE.strohhut_moewe = { px: at([[16, 6, 'r'], [16, 7, 'r'], [16, 8, 'r'], [16, 9, 'r'], [17, 6, 'a'], [17, 7, 'r'], [17, 8, 'r'], [17, 9, 'a'], [18, 6, 'r'], [18, 7, 'a'], [18, 8, 'a'], [18, 9, 'r'], [19, 6, 'r'], [19, 7, 'r'], [19, 8, 'r'], [19, 9, 'r']]), c: { r: '#2f6ab0', a: '#f4f4f0' } };
    BADGE.strohhut_kragen = { px: rows(15, ['.....' + 'ra'.repeat(7) + '.....']), c: { r: '#2f6ab0', a: '#f4f4f0' } };
    BADGE.strohhut = BADGE.strohhut_moewe; // Sturmmöwen: Möwen-Anstecker (Felix, 25.10.)
    BADGE.samurai = BADGE.samurai_siegel; BADGE.thriller = BADGE.thriller_siegel; // Freibeuter der Krone: Kaperbrief-Siegel (Felix, 25.10.)
    BADGE.weissbart = BADGE.weissbart_tuch; BADGE.rothaar = BADGE.rothaar_tuch; // Die zwei Flotten: Halstuch (Felix, 25.10.)
    BADGE.buggy = BADGE.buggy_kragen; BADGE.supernova = BADGE.supernova_kragen; // Zirkus der Narren: Rüschenkragen (Felix, 25.10.)
    BADGE.baroque = BADGE.baroque_schleife; BADGE.revolution = BADGE.revolution_schleife; // Barock-Bund: Halsschleife (Felix, 25.10.)
    BADGE.cp9 = BADGE.cp9_krawatte; // Schattenkorps: Krawatte (Felix, 25.10.)
    BADGE.marine = BADGE.marine_schaerpe; // Kronwacht: Schärpe (Felix, 25.10.)

    // Kann das neue Raster diesen Look schon ganz zeichnen?
    function ok(look) {
      if (look.hat && !HATS[look.hat]) return false;
      if (look.mask && !MASKS[look.mask]) return false;
      if (look.acc && !ACC[look.acc]) return false;
      if (Array.isArray(look.facc) && look.facc.length) return false; // Form-Teile der Sturmmöwen: kommen zuletzt
      return true;
    }
    function grid(look, mood, blink, fac) {
      const g = BASE.map(r => r.split(''));
      const put = list => list.forEach(([y, x, ch]) => { if (g[y] && x >= 0 && x < W) g[y][x] = ch; });
      if (HAIR[look.hairStyle]) HAIR[look.hairStyle](g);
      if (look.longHair) put(LONGHAIR);
      const part = HATS[look.hat] || null, mask = MASKS[look.mask] || null;
      [part, mask].forEach(p => { if (p && p.clear) p.clear.forEach(y => { g[y] = g[y].map(() => '.'); }); });
      if (part) put(part.px);
      if (mask) put(mask.px);
      if (look.beard) put(BEARD);
      if (look.nose) put(NOSE);
      if (ACC[look.acc]) put(ACC[look.acc]);
      (Array.isArray(look.x) ? look.x : []).forEach(k => { if (EXTRA[k]) put(EXTRA[k]); });
      (Array.isArray(look.facc) ? look.facc : []).forEach(k => { const f = FACC[k]; if (typeof f === 'function') f(g); else if (f) put(f); });
      const bd = fac && BADGE[fac];
      if (bd) put(bd.px);
      const f = FACE[mood] || FACE.normal;
      const onFace = list => list.forEach(([y, x, ch]) => { const was = g[y] && g[y][x]; if (ch === 'w' ? was === '.' : was === 'S') g[y][x] = ch; });
      onFace(blink ? BLINK : f.eyes);
      onFace(f.add.filter(([, , ch]) => !(blink && ch === 'l')));
      return g;
    }
    // Angriffsbild: Oberkörper 1 Pixel vor, vorderer Arm als Faust nach vorn, Ausfallschritt
    function lunge(g0) {
      const g = g0.map(r => r.slice());
      for (let y = 0; y <= UPPER; y++) g[y] = ['.'].concat(g0[y].slice(0, W - 1));
      for (let y = 17; y <= 21; y++) { g[y][21] = '.'; g[y][22] = '.'; g[y][23] = '.'; }
      [[16, 19], [16, 20], [16, 21], [17, 19], [17, 20], [17, 21]].forEach(([y, x]) => { g[y][x] = 'C'; });
      [[15, 22], [16, 22], [17, 22], [15, 23], [16, 23], [17, 23]].forEach(([y, x]) => { g[y][x] = 'S'; });
      const legs = ['......PPPPPPPPPPPPPP....', '.....PPPPPP..PPPPPP.....', '....PPPPP.....PPPPPP....', '...PPPPP.......PPPPP....', '..PPPPP.........PPPPP...', '.OOOOOO.........OOOOOO..', '.OOOOOO.........OOOOOO..'];
      legs.forEach((r, i) => { g[23 + i] = r.split(''); });
      return g;
    }
    const SHADE = 'HSCPUOBDGgNQIn';
    function pixels(g, look, fac) {
      const skin = look.skin || '#f2c9a0', hat = look.hatColor || look.hair;
      const col = Object.assign({
        H: look.hair, S: skin, C: look.shirt, P: look.pants, U: mix(look.pants || '#555555', 'k', 0.45), O: '#3a2a1c',
        B: hat, k: mix(hat || '#888888', 'k', 0.35), q: mix(hat || '#888888', 'w', 0.35), D: look.beard || look.hair, N: look.nose || '#d8433a',
        E: '#1c1420', X: '#ffffff', J: '#3b4f7a', b: mix(look.hair || '#555555', 'k', 0.35), m: '#7a2e2a', c: '#f08f8a', l: mix(skin, 'k', 0.38), w: '#8fd3f4',
        K: '#1a1a1a', R: '#b8463a', L: '#3a2a20', A: '#f2c94c', V: '#6a4424', F: '#e0483b', Z: '#e4e0dc',
        Q: look.coat || mix(look.shirt || '#888888', 'k', 0.3), I: look.scarf || '#7ab0e0', M: '#9aa4ae', n: '#3d6fb0', p: '#f2e2c4', i: '#cfeefc', r: '#b8343a', a: '#d9a640',
        o: '#e8902c', v: '#5aa04a', e: '#2f6a34', t: '#3aa8a0', u: '#9a6ad0', s: '#4e5662', d: '#8a5a34', y: '#d8f0a0'
      }, MASK_COL[look.mask] || {}, (fac && BADGE[fac] && BADGE[fac].c) || {});
      const at = (x, y) => (y >= 0 && y < H && x >= 0 && x < W && g[y][x]) || '.';
      const fam = ch => 'EXJbmcl'.includes(ch) ? 'S' : ch;
      const out = [];
      for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) {
        const ch = at(x, y);
        if (ch !== '.') {
          let c = col[ch] || '#888888';
          if (SHADE.includes(ch)) {
            const same = (dx, dy) => fam(at(x + dx, y + dy)) === ch;
            const eR = !same(1, 0), eB = !same(0, 1), eL = !same(-1, 0), eT = !same(0, -1);
            const above = at(x, y - 1);
            if (eR && eB) c = mix(c, 'k', 0.32);
            else if (eR || eB) c = mix(c, 'k', 0.2);
            else if (!same(2, 0) || !same(0, 2)) c = mix(c, 'k', 0.09);
            else if (eT && eL) c = mix(c, 'w', 0.26);
            else if (eT || eL) c = mix(c, 'w', 0.14);
            if ((ch === 'S' && 'HBkGgDI'.includes(above)) || (ch === 'S' && y === 14) || (ch === 'C' && y === 15 && x >= 9 && x <= 14)) c = mix(c, 'k', 0.2);
          }
          out.push([x, y, c, 1]);
          continue;
        }
        const nb = [[0, 1], [1, 0], [-1, 0], [0, -1]].find(([dx, dy]) => at(x + dx, y + dy) !== '.');
        if (!nb) continue;
        const n = at(x + nb[0], y + nb[1]);
        const shadow = x > W / 2 || y > H * 0.6;
        const k = 'wZ'.includes(n) ? 0.35 : (shadow ? 0.7 : 0.6);
        out.push([x, y, mix(col[n] || '#888888', 'k', k), shadow ? 1 : 0.94]);
      }
      return out;
    }
    // Pixel einer Farbe in einer Zeile zu einem Rechteck zusammenfassen
    function rects(list) {
      const by = {};
      list.forEach(p => { (by[p[1]] = by[p[1]] || []).push(p); });
      let s = '';
      Object.keys(by).forEach(y => {
        const r = by[y].sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < r.length; i++) {
          let j = i;
          while (j + 1 < r.length && r[j + 1][0] === r[j][0] + 1 && r[j + 1][2] === r[i][2] && r[j + 1][3] === r[i][3]) j++;
          s += `<rect x="${r[i][0]}" y="${y}" width="${j - i + 1}" height="1" fill="${r[i][2]}"${r[i][3] < 1 ? ` fill-opacity="${r[i][3]}"` : ''}/>`;
          i = j;
        }
      });
      return s;
    }
    // Gleiches Seitenverhältnis wie das alte Raster (14 : 16), damit nichts im Layout springt
    const VB = '-2 -1 28 32';
    function flat(look, fac) {
      return `<svg viewBox="${VB}" aria-hidden="true" class="p24" shape-rendering="crispEdges">${rects(pixels(grid(look, 'normal', false, fac), look, fac))}</svg>`;
    }
    function shaded(look, mood, fac) {
      const g = grid(look, mood, false, fac);
      const open = pixels(g, look, fac), shut = pixels(grid(look, mood, true, fac), look, fac);
      const seen = new Set(open.map(p => p[0] + ',' + p[1] + p[2]));
      const blink = shut.filter(p => !seen.has(p[0] + ',' + p[1] + p[2]) && p[1] >= 5 && p[1] <= 13);
      const up = open.filter(p => p[1] <= UPPER), low = open.filter(p => p[1] > UPPER);
      const atk = pixels(lunge(g), look, fac);
      return `<svg viewBox="${VB}" aria-hidden="true" class="spr p24" shape-rendering="crispEdges"><g class="sp-i"><g class="sp-l">${rects(low)}</g><g class="sp-u">${rects(up)}<g class="p24-blink">${rects(blink)}</g></g></g><g class="sp-a">${rects(atk)}</g></svg>`;
    }
    return { W, H, ok, flat, shaded, grid, HATS, MASKS, ACC, BADGE, FACE, HAIR, EXTRA, FACC };
  })();

  GL.sprites = {
    p24: P24,
    // Schiff mit eigenen Teilen (look = { sail, hull, flag, deco } aus GL.data.shipParts); ohne Angabe: das eigene Schiff
    ship(look) {
      const L = look || GL.sprites.myShip || {};
      const P = GL.data.shipParts || {};
      const pick = (k, id) => ((P[k] || []).find(x => x.id === id) || (P[k] || [])[0] || {});
      const sail = pick('sail', L.sail), hull = pick('hull', L.hull), flag = pick('flag', L.flag), deco = pick('deco', L.deco);
      // Werft-Stufen sichtbar: nur am eigenen Schiff (ohne look) oder wenn look.upg mitkommt
      const U = (look ? look.upg : GL.sprites.myUpg) || {};
      const su = Math.min(2, U.segel || 0), ku = Math.min(2, U.kanonen || 0), ru = Math.min(5, U.rumpf || 0);
      const key = 'ship:' + [sail.id, hull.id, flag.id, deco.id, su, ku, ru].join('/');
      if (cache[key]) return cache[key];
      const c = { S: sail.c || '#f1eee8', M: '#5a4433', H: hull.c || '#6b4a32', R: hull.r || '#3a2a1e', F: flag.c || '#1a1a1a' };
      const rows = (su ? SHIP_BIG : SHIP).map(r => r.split(''));
      if (flag.big) { rows[0][8] = 'F'; rows[1][10] = 'F'; rows[0][9] = 'F'; }
      // Segel Stufe 2: Rah (Holzbalken) über dem Segel, ragt links und rechts heraus
      if (su >= 2) for (let x = 3; x <= 12; x++) rows[2][x] = 'M';
      let r = '';
      const px = (x, y, col) => { r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`; };
      rows.forEach((row, y) => row.forEach((ch, x) => {
        if (ch === '.') return;
        let col = c[ch];
        if (ch === 'S' && sail.pat === 'streifen' && y % 2 === 1) col = sail.c2;
        if (ch === 'S' && sail.pat === 'flicken' && (x * 7 + y * 3) % 9 === 0) col = sail.c2;
        if (ch === 'S' && sail.pat === 'stern' && ((x === 5 && y === 3) || (x === 9 && y === 4) || (x === 10 && y === 2))) col = sail.c2;
        px(x, y, col);
      }));
      // Rumpf: 1-2 Flicken (heller), 3-4 Eisenbeschlag an Bug und Heck, 5 goldener Kiel (sonst ab 4 Kupfer)
      const patch = shade(c.H, 0.28), nail = shade(c.H, -0.35), iron = '#4a525c', ironHi = '#7d8792';
      if (ru >= 1) { px(3, 10, patch); px(4, 10, nail); }
      if (ru >= 2) { px(10, 10, patch); px(11, 10, patch); }
      if (ru >= 3) { px(0, 8, ironHi); px(1, 9, iron); px(15, 8, ironHi); px(14, 9, iron); }
      if (ru >= 4) for (let x = 3; x <= 12; x++) px(x, 11, ru >= 5 ? (x % 3 ? '#d8b04a' : '#f2d77a') : (x % 3 ? '#a8653a' : '#c98552'));
      // Kanonen: Stufe 1 zwei Luken, Stufe 2 vier
      const ports = ku >= 2 ? [3, 6, 9, 12] : ku ? [5, 10] : [];
      const hn = parseInt(c.H.slice(1), 16), dark = ((hn >> 16) * 0.3 + ((hn >> 8) & 255) * 0.59 + (hn & 255) * 0.11) < 60;
      ports.forEach(x => px(x, 9, dark ? c.R : '#241a14'));
      Object.keys(deco.px || {}).forEach(col => deco.px[col].forEach(([x, y]) => px(x, y, col)));
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
        // Plastische Knoten-Symbole aus der Grafik-Bibliothek (art.js), sonst die alten flachen
        if (GL.art && GL.art.icon) { const a = GL.art.icon(id); if (a) return (cache[key] = a); }
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
    // mood: 4D-Gefühl ('froh' | 'muede' | 'sauer'), nur für Figuren mit Pixel-Look
    renderShaded(entry, mood) {
      if (!entry) return '';
      if (entry.art) return artSvg(entry.art, true);
      if (entry.monster && GL.art && GL.art.monsterArt) { const ma = GL.art.monsterArt(entry.monster); if (ma) return artSvg(ma, true); }
      if (entry.image) return `<img src="${entry.image}" alt="" class="sprite-img">`;
      const lk = mlook(entry);
      const md = mood && MOOD[mood] ? mood : '';
      const key = 'sh:' + entry.id + ':' + JSON.stringify(lk) + md + ':' + (entry.faction || '');
      if (!cache[key]) { const sl = safeLook(lk); cache[key] = P24.ok(sl) ? P24.shaded(sl, md || 'normal', entry.faction) : svgShaded(lk, md); }
      return cache[key];
    },
    render(entry) {
      if (!entry) return '';
      if (entry.art) return artSvg(entry.art, false);
      if (entry.monster && GL.art && GL.art.monsterArt) { const ma = GL.art.monsterArt(entry.monster); if (ma) return artSvg(ma, false); }
      if (entry.image) return `<img src="${entry.image}" alt="" class="sprite-img">`;
      // Der eigene Pirat kann sein Aussehen ändern: Aussehen gehört mit zum Schlüssel
      // Schlüssel mit Aussehen: Figuren mit gleicher id (z. B. Buggy als Gegner und als Crew) bleiben getrennt
      const lk = mlook(entry);
      const key = entry.id + ':' + JSON.stringify(lk) + ':' + (entry.faction || '');
      if (!cache[key]) { const sl = safeLook(lk); cache[key] = P24.ok(sl) ? P24.flat(sl, entry.faction) : svg(lk); }
      return cache[key];
    }
  };
})();
