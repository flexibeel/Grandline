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
      tricorn: { clear: [0, 1, 2, 3], px: sym(0, ['.B......BBBB', '.BB...BBBBBB', '.BBBBBBBBBBB', 'BBBBBBBBBBBB', 'kkkkkkkkkkkk']).concat(at([[1, 11, 'A'], [1, 12, 'A']])) }
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
      stachel: g => { rows(0, ['......H...HH...H..H.....', '......HHHHHHHHHHHH......']).forEach(([y, x, ch]) => { g[y][x] = ch; }); }
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
      eiszapfen: at([[15, 4, 'i'], [16, 4, 'i'], [17, 4, 'i'], [15, 19, 'i'], [16, 19, 'i'], [17, 19, 'i'], [16, 3, 'i'], [16, 20, 'i']])
    };
    // Fraktions-Abzeichen (Leitfarbe, je Fraktion ein Teil). Schlüssel = Banden-id, Varianten mit _a/_b fürs Board.
    // r Leitfarbe, a Messing
    const BADGE = {
      marine_schaerpe: { px: at([[15, 6, 'r'], [16, 7, 'r'], [16, 6, 'r'], [17, 8, 'r'], [17, 7, 'r'], [18, 9, 'r'], [18, 8, 'r'], [19, 10, 'r'], [19, 9, 'r'], [20, 11, 'a'], [20, 10, 'a'], [21, 12, 'r'], [21, 11, 'r'], [22, 13, 'r'], [22, 12, 'r']]), c: { r: '#b8343a', a: '#d9a640' } },
      marine_abzeichen: { px: at([[17, 7, 'a'], [17, 9, 'a'], [18, 7, 'a'], [18, 8, 'r'], [18, 9, 'a'], [19, 7, 'a'], [19, 8, 'a'], [19, 9, 'a']]), c: { r: '#b8343a', a: '#d9a640' } }
    };

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
        Q: look.coat || mix(look.shirt || '#888888', 'k', 0.3), I: look.scarf || '#7ab0e0', M: '#9aa4ae', n: '#3d6fb0', p: '#f2e2c4', i: '#cfeefc', r: '#b8343a', a: '#d9a640'
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
    return { W, H, ok, flat, shaded, grid, HATS, MASKS, ACC, BADGE, FACE, HAIR, EXTRA };
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
