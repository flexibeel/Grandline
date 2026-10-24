// Weltbau C3: Pixel-Probe 24 × 30 (nur Probe, nicht im Spiel eingebunden).
// Gleiches System wie js/ui/sprites.js: Grundkörper + Look-Werte + Teile, nur doppelt so fein.
// Läuft im Browser (window.PX24) und in Node (module.exports).
(function (root) {
  // Linke Hälfte (Spalte 0 bis 11), rechts wird gespiegelt. 30 Zeilen.
  // H Haare, S Haut, C Oberteil, P Hose, U Gürtel, O Schuhe
  const HALF = [
    '........HHHH', //  0
    '......HHHHHH', //  1
    '.....HHHHHHH', //  2
    '....HHHHHHHH', //  3
    '...HHHHHHHHH', //  4
    '...HHSHHHSHH', //  5 Pony
    '...HSSSSSSSS', //  6 Brauen
    '...HSSSSSSSS', //  7 Augen oben
    '..SSSSSSSSSS', //  8 Augen Mitte, Ohr
    '..SSSSSSSSSS', //  9 Augen unten, Ohr
    '...SSSSSSSSS', // 10 Wangen
    '...SSSSSSSSS', // 11 Mund
    '....SSSSSSSS', // 12
    '......SSSSSS', // 13 Kinn
    '.........SSS', // 14 Hals
    '.....CCCCCCC', // 15 Schultern
    '...CCCCCCCCC', // 16
    '..CCCCCCCCCC', // 17
    '..CC.CCCCCCC', // 18
    '..SS.CCCCCCC', // 19 Unterarm
    '..SS.CCCCCCC', // 20
    '..SS.CCCCCCC', // 21 Hand
    '.....UUUUUUU', // 22 Gürtel
    '.....PPPPPPP', // 23
    '.....PPPPPP.', // 24
    '.....PPPPP..', // 25
    '.....PPPPP..', // 26
    '.....PPPPP..', // 27
    '....OOOOOO..', // 28
    '....OOOOOO..'  // 29
  ];
  const W = 24, H = 30;
  const BASE = HALF.map(r => r + r.split('').reverse().join(''));
  const UPPER = 22; // bis hier atmet der Oberkörper

  // Gesicht als eigene Ebene: [Zeile, Spalte, Zeichen], linke Seite, wird gespiegelt.
  // E Pupille, X Lichtpunkt, J Iris unten, b Braue, m Mund, c Wange, l Lid (Haut dunkel), w Schweiß
  const mir = list => list.concat(list.map(([y, x, ch]) => [y, W - 1 - x, ch]));
  const EYES = mir([[7, 8, 'X'], [7, 9, 'E'], [8, 8, 'E'], [8, 9, 'E'], [9, 8, 'J'], [9, 9, 'J']]);
  // Lichtpunkt bei beiden Augen oben links (nicht gespiegelt)
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
  // Blinzeln: Augen zu, nur ein Strich unten
  const BLINK = mir([[9, 8, 'E'], [9, 9, 'E']]);

  // Teile im neuen Raster (Probe: nur was die drei Figuren brauchen)
  const row = (y, x0, x1, ch) => { const a = []; for (let x = x0; x <= x1; x++) a.push([y, x, ch]); return a; };
  const PARTS = {
    // flacher Hut mit Krempe
    hat_straw: { clear: [0, 1, 2, 3], px: [].concat(row(0, 8, 15, 'B'), row(1, 7, 16, 'B'), row(2, 6, 17, 'B'), row(3, 5, 18, 'B'), row(4, 1, 22, 'B'), row(5, 2, 21, 'B')) },
    // Stirnband über der Stirn, Knoten mit zwei Enden rechts
    hat_band: [].concat(row(4, 3, 20, 'B'), row(5, 3, 20, 'B'), [[4, 21, 'B'], [5, 21, 'B'], [5, 22, 'B'], [6, 21, 'B'], [6, 22, 'B'], [7, 22, 'B'], [8, 22, 'B']]),
    // lange Haare bis zur Schulter
    longHair: [].concat(...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(y => [[y, 2, 'H'], [y, 3, 'H'], [y, 20, 'H'], [y, 21, 'H']]), [[17, 2, 'H'], [17, 21, 'H'], [6, 4, 'H'], [6, 19, 'H']])
  };

  // Farben
  const mix = (hex, to, k) => {
    const h = String(hex || '#888').replace('#', ''); if (h.length < 6) return hex;
    const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    const t = to === 'w' ? [255, 255, 255] : to === 'k' ? [20, 12, 8] : [0, 2, 4].map(i => parseInt(to.slice(1 + i, 3 + i), 16));
    return '#' + c.map((v, i) => Math.round(v + (t[i] - v) * k).toString(16).padStart(2, '0')).join('');
  };

  function gridOf(look, mood, blink) {
    const g = BASE.map(r => r.split(''));
    const put = list => list.forEach(([y, x, ch]) => { if (g[y] && x >= 0 && x < W) g[y][x] = ch; });
    if (look.longHair) put(PARTS.longHair);
    const hat = PARTS['hat_' + look.hat];
    if (hat && hat.clear) hat.clear.forEach(y => { g[y] = g[y].map(() => '.'); });
    if (hat) put(hat.px || hat);
    const f = FACE[mood] || FACE.normal;
    // Gesicht nur auf Haut (Hut, Haare und Masken bleiben), Schweiß nur neben den Kopf
    const onFace = list => list.forEach(([y, x, ch]) => {
      const was = g[y] && g[y][x];
      if (ch === 'w' ? was === '.' : was === 'S') g[y][x] = ch;
    });
    onFace(blink ? BLINK : f.eyes);
    onFace(f.add.filter(([, , ch]) => !(blink && ch === 'l')));
    return g;
  }

  // Licht oben links, Schatten unten rechts, je Fläche eine Schattenfarbe (automatisch dunkler).
  // Dazu Schlagschatten unter Haaren/Hut und unter dem Kinn.
  const SHADE = 'HSCPUOB';
  function pixels(look, mood, blink) {
    const g = gridOf(look, mood, blink);
    const skin = look.skin || '#f2c9a0';
    const col = {
      H: look.hair, S: skin, C: look.shirt, P: look.pants, U: mix(look.pants, 'k', 0.45), O: '#3a2a1c', B: look.hatColor || look.hair,
      E: '#1c1420', X: '#ffffff', J: look.eyes || '#3b4f7a', b: mix(look.hair, 'k', 0.35), m: '#7a2e2a', c: '#f08f8a', l: mix(skin, 'k', 0.38), w: '#8fd3f4'
    };
    const at = (x, y) => (y >= 0 && y < H && x >= 0 && x < W && g[y][x]) || '.';
    const fam = ch => 'EXJbmcl'.includes(ch) ? 'S' : ch; // Gesicht zählt für Licht/Schatten zur Haut
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
          // Schlagschatten: Haut/Hemd direkt unter Haaren, Hut oder Kinn
          if ((ch === 'S' && (above === 'H' || above === 'B')) || (ch === 'S' && y === 14) || (ch === 'C' && y === 15 && x >= 9 && x <= 14)) c = mix(c, 'k', 0.2);
        }
        out.push([x, y, c, 1]);
        continue;
      }
      // Umriss: dunklere Farbe des Nachbarn (selektiver Umriss wie im Spiel), Schattenseite dunkler
      const nb = [[0, 1], [1, 0], [-1, 0], [0, -1]].find(([dx, dy]) => at(x + dx, y + dy) !== '.');
      if (!nb) continue;
      const src = col[at(x + nb[0], y + nb[1])] || '#888888';
      const shadow = x > W / 2 || y > H * 0.6;
      const k = at(x + nb[0], y + nb[1]) === 'w' ? 0.35 : (shadow ? 0.7 : 0.6);
      out.push([x, y, mix(src, 'k', k), shadow ? 1 : 0.94]);
    }
    return out;
  }
  // Pixel einer Farbe in einer Zeile zusammenfassen (weniger Rechtecke, gut für 12 Figuren im Kampf)
  function rects(list) {
    const rowsOf = {};
    list.forEach(p => { (rowsOf[p[1]] = rowsOf[p[1]] || []).push(p); });
    let s = '', n = 0;
    Object.keys(rowsOf).forEach(y => {
      const r = rowsOf[y].sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < r.length; i++) {
        let j = i;
        while (j + 1 < r.length && r[j + 1][0] === r[j][0] + 1 && r[j + 1][2] === r[i][2] && r[j + 1][3] === r[i][3]) j++;
        s += `<rect x="${r[i][0]}" y="${y}" width="${j - i + 1}" height="1" fill="${r[i][2]}"${r[i][3] < 1 ? ` fill-opacity="${r[i][3]}"` : ''}/>`;
        n++; i = j;
      }
    });
    return { s, n };
  }
  // Ruhebild mit Atmen (Oberkörper sinkt um 1 Pixel) und Blinzeln (zweites Gesicht, per CSS kurz eingeblendet)
  function svg(look, mood, opts) {
    opts = opts || {};
    const open = pixels(look, mood, false), shut = pixels(look, mood, true);
    const key = p => p[0] + ',' + p[1] + p[2];
    const shutOnly = shut.filter(p => !open.some(q => key(q) === key(p)) && p[1] >= 5 && p[1] <= 13);
    const up = open.filter(p => p[1] <= UPPER), low = open.filter(p => p[1] > UPPER);
    const a = rects(low), b = rects(up), c = rects(shutOnly);
    const cls = opts.still ? 'p24' : 'p24 p24-live';
    return { svg: `<svg viewBox="-1 -1 ${W + 2} ${H + 2}" class="${cls}" shape-rendering="crispEdges" aria-hidden="true"><g class="p24-l">${a.s}</g><g class="p24-u">${b.s}<g class="p24-blink">${c.s}</g></g></svg>`, rects: a.n + b.n + c.n, pixels: open.length };
  }
  const api = { W, H, BASE, FACE, PARTS, MOODS: Object.keys(FACE), pixels, svg, gridOf };
  if (typeof module !== 'undefined') module.exports = api; else root.PX24 = api;
})(this);
