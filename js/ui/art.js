// Pixel-Grafik-Bibliothek (Fork W): Szenen, Requisiten und Symbole als SVG mit leichtem 3D-Look
// (Umriss dunkel, Licht oben links, Schatten unten rechts). Alles crispEdges, skaliert sauber.
//
//   GL.art.scene(id, opts)  → SVG 64×36, opts: { time: 'day'|'dusk'|'night', weather: 'rain'|'snow'|'fog'|'storm', ship: true|false }
//     ids: see (offene See), ankunft (Insel voraus), dorf, hafen, dschungel, wueste, schnee, wolken, sturm, nebel
//     bewegte Teile haben Klassen: ga-wave, ga-cloud, ga-gull, ga-ship, ga-rain, ga-snow, ga-fog, ga-flash (CSS unten in style.css „Fork W“)
//   GL.art.prop(id)         → SVG 16×16
//     ids: fass, kiste, palme, leuchtturm, marine, moewe, flaschenpost, karte, topf, feuer, steckbrief, anker
//   GL.art.icon(id)         → SVG 12×12 (Knotentypen und mehr)
//     ids: kampf, taverne, schatz, frucht, rast, elite, boss, event, haendler, landgang, raid
//     Aliase wie die Run-Knoten: battle, recruit, treasure, fruit, rest, elite, boss, raid, shop, dungeon
//   GL.art.ids()            → { scenes, props, icons } für Galerie/Tests
window.GL = window.GL || {};

(function () {
  // Gemeinsame Palette: Kleinbuchstabe = Grundton, Großbuchstabe = Schatten, k = Umriss
  const P = {
    k: '#2b1d14', w: '#fbf6ea', W: '#d9cfbc', z: '#1a1a1a',
    y: '#f2c94c', Y: '#b8862a', f: '#ffe28a',
    b: '#b07a44', B: '#8a5a30', d: '#5e3b1d',
    r: '#d8433a', R: '#9a2a22',
    g: '#5aa24a', G: '#2f6a2e', l: '#8fd06a',
    s: '#dfe3ea', S: '#9aa3b2', t: '#5d6575',
    o: '#f08a24', O: '#b85a14',
    u: '#4f8fe0', U: '#2a5a9a', a: '#9fd3f0',
    p: '#9b6fd1', P: '#5e3a8a', q: '#c9a8ef',
    c: '#f3e2bd', C: '#d6bd8a', n: '#f2c9a0', N: '#c99a72',
    e: '#7a7a7a', E: '#4a4a4a', m: '#e8d9b0'
  };
  const cache = {};
  // Raster → Rechtecke (gleiche Farben in einer Zeile werden zusammengefasst)
  function grid(rows, w, pal) {
    const C = Object.assign({}, P, pal || {});
    let out = '';
    rows.forEach((row, y) => {
      const s = (row + '.'.repeat(w)).slice(0, w);
      let x = 0;
      while (x < w) {
        const ch = s[x];
        if (ch === '.' || !C[ch]) { x++; continue; }
        let n = 1; while (x + n < w && s[x + n] === ch) n++;
        out += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${C[ch]}"/>`;
        x += n;
      }
    });
    return out;
  }
  const svg = (w, h, body, cls) => `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" class="${cls || ''}" aria-hidden="true">${body}</svg>`;

  // ---------- Symbole 12×12 ----------
  const ICONS = {
    kampf: [
      'sk........ks',
      'kSk......kSk',
      '.kSk....kSk.',
      '..kSk..kSk..',
      '...kSkkSk...',
      '....kSSk....',
      '....kSSk....',
      '...kykkyk...',
      '..kYk..kYk..',
      '.kbk....kbk.',
      'kdk......kdk',
      'kk........kk'],
    taverne: [
      '..kkkkkk....',
      '.kwwwwwwk...',
      'kwwWwwwwWk..',
      'kbBbBbBbdkk.',
      'kyyyyyyyykdk',
      'kyfyyyyyYk.k',
      'kyfyyyyyYk.k',
      'kyfyyyyyYkdk',
      'kyyyyyyyYkk.',
      'kbBbBbBbdk..',
      '.kkkkkkkkk..',
      '............'],
    schatz: [
      '...kkkkkk...',
      '..kyfyyfyk..',
      '.kfyyyyyyYk.',
      'kkkkkkkkkkkk',
      'kbbbbyybbbdk',
      'kbBBkYYkBBdk',
      'kkkkkyykkkkk',
      'kbbBBkkBBbdk',
      'kbBBBBBBBBdk',
      'kbBBBBBBBBdk',
      'kddddddddddk',
      '.kkkkkkkkkk.'],
    frucht: [
      '.....kGk....',
      '....kGgk....',
      '...kkkGkk...',
      '..kpqpppPk..',
      '.kpqpPpqpPk.',
      '.kqppqpPppk.',
      '.kppPpqppPk.',
      '.kpqppPpqPk.',
      '.kpPpqpppPk.',
      '..kPpPppPk..',
      '...kkPPkk...',
      '....kkkk....'],
    rast: [
      '.....ko.....',
      '....kofk....',
      '....kofok...',
      '...kofffok..',
      '..kofffffok.',
      '..koffwffok.',
      '..kOoffffOk.',
      '...kOoooOk..',
      '.kbbkkkkbbk.',
      'kBBdbbbbdBBk',
      '.kkddddddkk.',
      '............'],
    elite: [
      '..kkkkkkkk..',
      '.kRrrrrrrRk.',
      'kRrrrrrrrrRk',
      'kwwwwwwwwwWk',
      'kwzzwwwwzzWk',
      'kwzzwwwwzzWk',
      'kwwwwzzwwwWk',
      '.kwwwwwwwWk.',
      '..kwzwzwzk..',
      '..kWWWWWWk..',
      '...kkkkkk...',
      '............'],
    boss: [
      'k.kkkkkkkk.k',
      'kwkwwwwwwkwk',
      '.kwwwwwwwwk.',
      '.kwzzwwzzwk.',
      '.kwzzwwzzwk.',
      '.kwwwkkwwwk.',
      '..kwwwwwwk..',
      '..kwkwkwkk..',
      'kk.kkkkkk.kk',
      'kwkk....kkwk',
      'k.kwk..kwk.k',
      '...kk..kk...'],
    event: [
      '..kkkkkkkk..',
      '.kcmcccccck.',
      'kCkccccccCk.',
      '.kcckRkcck..',
      '.kccckRkck..',
      '.kccckRkck..',
      '.kccckRkck..',
      '.kcccckcck..',
      '.kccckRkck..',
      '.kccccccck..',
      'kCcccccccCk.',
      '.kkkkkkkkk..'],
    haendler: [
      '....kkkk....',
      '...kdBBdk...',
      '....kkkk....',
      '...kbbbbk...',
      '..kbByybBk..',
      '.kbByyyYbBk.',
      '.kbyykyyYbk.',
      '.kbyyyyyYbk.',
      '.kbByyyYbBk.',
      '..kBbbbbBk..',
      '...kkkkkk...',
      '............'],
    landgang: [
      '......kGGk..',
      '....kGglGk..',
      '...kGglgGGk.',
      '..kGk.kdk.k.',
      '......kbk...',
      '......kbk...',
      '.....kbdk...',
      '..kkkkbdkkk.',
      '.kcccccccCk.',
      'kcmcccccccCk',
      'kauuuuuuuuUk',
      '.kkkkkkkkkk.'],
    raid: [
      '......kkkk..',
      '.....kffyk..',
      '....kffyk...',
      '...kffyk....',
      '..kffyykkkk.',
      '.kffffffyyk.',
      '.kkkkfffyk..',
      '....kffyk...',
      '...kffyk....',
      '..kfyk......',
      '..kyk.......',
      '..kk........']
  };
  const ALIAS = { battle: 'kampf', recruit: 'taverne', treasure: 'schatz', fruit: 'frucht', rest: 'rast', shop: 'haendler', dungeon: 'landgang', bounty: 'elite' };

  // ---------- Requisiten 16×16 ----------
  const PROPS = {
    fass: [
      '....kkkkkkkk....', '...kbbbbbbBBk...', '..kddddddddddk..', '..kbbBbbbbBBdk..', '..kbBbbbbbbBdk..', '..kssSssssSStk..',
      '..kbbBbbbbbBdk..', '..kbBbbbbbbBdk..', '..kbbBbbbbbBdk..', '..kssSssssSStk..', '..kbBbbbbbbBdk..', '..kbbBbbbbbBdk..',
      '..kddddddddddk..', '...kBBbbbbBBk...', '....kkkkkkkk....', '................'],
    kiste: [
      '................', '................', '.kkkkkkkkkkkkkk.', '.kbbbbbbbbbbbbdk', '.kbdddddddddddbk', '.kbdbBbbbbbBbdbk',
      '.kbdBbdbbbdbBdbk', '.kbdbbbdbdbbbdbk', '.kbdbbbbdbbbbdbk', '.kbdbbbdbdbbbdbk', '.kbdBbdbbbdbBdbk', '.kbdbBbbbbbBbdbk',
      '.kbdddddddddddbk', '.kddddddddddddddk', '.kkkkkkkkkkkkkk.', '................'],
    palme: [
      '..kGGk...kGGk...', '.kGglGk.kGlgGk..', 'kGgllgGkGgllgGk.', '.k..kGgglgGk..k.', '....kGgllggGk...', '...kGk.kbk.kGk..',
      '..k...kbBk...k..', '.......kbk......', '......kbBk......', '......kbk.......', '.....kbBk.......', '.....kbk........',
      '....kbBk........', '..kkcccckk......', '.kcmcccccCk.....', 'kkkkkkkkkkkk....'],
    leuchtturm: [
      '......kkkk......', '.....kfyyfk.....', '....kyfffyyk....', '.....kRrrRk.....', '.....kwwwWk.....', '.....krrrRk.....',
      '....kwwwwWWk....', '....krrrrrRk....', '....kwwwwwWk....', '...krrrrrrrRk...', '...kwwwwwwwWk...', '...krrrrkkrRk...',
      '..kwwwwwkdkwWk..', '..kSsssssssSSk..', '.kSSssssssssSStk', '.kkkkkkkkkkkkkk.'],
    marine: [
      '.......kk.......', '.......kuk......', '..kkkkkkukkkkk..', '..kwwwwkkwwwwk..', '..kwwuwwkwwuwk..', '..kwwwwwkwwwwk..',
      '...kwwwwkwwwk...', '.......kk.......', 'kwkwkwkwkwkwkwk.', 'kssssssssssssssk', 'kSswswswswswsSSk', '.kSsssssssssSSk.',
      '..kSSSSSSSSSSk..', '...kkkkkkkkkk...', '................', '................'],
    moewe: [
      '................', '................', '................', '.kk..........kk.', 'kwWk........kWwk', '.kwWk......kWwk.',
      '..kwWkk..kkWwk..', '...kwwWkkWwwk...', '....kwwwwwwk....', '.....kwwwwyyk...', '......kwwWkk....', '.......kkk......',
      '................', '................', '................', '................'],
    flaschenpost: [
      '................', '..........kk....', '.........kddk...', '.........kBBk...', '........kaaaak..', '.......kaacaUk..',
      '......kaacccUk..', '.....kaaccmcUk..', '....kaaccccUk...', '...kaaccmcUk....', '..kaaccccUk.....', '..kaacccUk......',
      '..kaaaaUk.......', '...kUUUk........', '....kkk.........', '................'],
    karte: [
      '................', '.kkkkkkkkkkkkkk.', 'kCcccccccccccccC', 'kcmccccccuuccccC', 'kcckcccccuuuccck', 'kccckccccccucCck',
      'kcccckkcccccccck', 'kcGgcccckccccRck', 'kcgGgcccckccRkck', 'kccGcccccckRcRck', 'kcccccccccccRcck', 'kcccuucccccccccC',
      'kCccuuucccccmccC', '.kkkkkkkkkkkkkk.', '................', '................'],
    topf: [
      '.....w...w......', '....w.w.w.w.....', '.....w...w......', '...kkkkkkkkkk...', '..ktsssssssStk..', 'kktkkkkkkkkkktkk',
      'k.ktSssssssStk.k', '..ktSsssssssStk.', '..ktSssssssSStk.', '..ktSSsssssSStk.', '...ktSSSSSSStk..', '....kkkkkkkk....',
      '...kokOokoOk....', '...kfoofofok....', '..kdBdkdBdkdBk..', '................'],
    feuer: [
      '.......ko.......', '......kofk......', '......kofok.....', '.....koffok.....', '....kofffok.k...', '....koffffokok..',
      '...koffwffffok..', '...koffwwffok...', '...kOofffffOk...', '....kOoooooOk...', '..kbbkkkkkkbbk..', '.kBBbbbdbbbbBBk.',
      'kdBbbdkkkdbbbBdk', '.kkddkk.kkddkk..', '................', '................'],
    steckbrief: [
      '.kkkkkkkkkkkkk..', '.kcmcccccccccCk.', '.kckzkzzzkzkcCk.', '.kccccccccccccCk', '.kcCnnnnnnnnCcCk', '.kcCnzznnzznCcCk',
      '.kcCnnnnnnnnCcCk', '.kcCnnnRRnnnCcCk', '.kcCCCCCCCCCCcCk', '.kccczkzzkzcccCk', '.kcccccccccccCCk', '.kcczzzzzzzzcCCk',
      '.kcccccccccccCCk', '.kCCCCCCCCCCCCCk', '.kkkkkkkkkkkkkk.', '................'],
    anker: [
      '......kkkk......', '.....kskkSk.....', '.....kSk.kk.....', '......kkkk......', '...kkkksSkkkk...', '...kssssssSSk...',
      '...kkkksSkkkk...', '.......sS.......', '.......sS.......', '.k.....sS.....k.', 'kSk....sS....kSk', '.kSk...sS...kSk.',
      '..kSkk.sS.kkSk..', '...kSSsssSSSk...', '....kkkkkkkk....', '................']
  };

  // ---------- Szenen 64×36 ----------
  const SKY = {
    day:   [['#8ec9ea', 0, 6], ['#a8d6ef', 6, 12], ['#c6e4f4', 12, 18], ['#e2f1f8', 18, 21]],
    dusk:  [['#6a74b0', 0, 5], ['#b882a6', 5, 10], ['#ee9e7a', 10, 15], ['#f8cf96', 15, 21]],
    night: [['#141c33', 0, 7], ['#1d2a48', 7, 14], ['#2a3a5e', 14, 21]],
    storm: [['#3b4250', 0, 7], ['#4c5464', 7, 14], ['#5f6878', 14, 21]]
  };
  const SEA = {
    day: ['#3f8fc0', '#357fb0', '#2c6e9e'], dusk: ['#5a6fa0', '#4a5e90', '#3c4f80'],
    night: ['#1f3a5c', '#18304e', '#122641'], storm: ['#3a5468', '#2f475a', '#243a4c']
  };
  const r = (x, y, w, h, c, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o != null ? ` opacity="${o}"` : ''}/>`;
  function sky(time) {
    let s = (SKY[time] || SKY.day).map(([c, a, b]) => r(0, a, 64, b - a, c)).join('');
    if (time === 'night') {
      s += r(50, 4, 4, 4, '#f4ecd0') + r(49, 5, 1, 2, '#f4ecd0') + r(54, 5, 1, 2, '#f4ecd0') + r(52, 4, 2, 2, '#d8cfae');
      [[6, 3], [14, 7], [22, 2], [31, 6], [40, 3], [58, 11], [9, 12], [27, 11]].forEach(([x, y]) => { s += r(x, y, 1, 1, '#fff6d8'); });
    } else if (time === 'dusk') {
      s += r(28, 15, 8, 4, '#ffd58a') + r(27, 16, 10, 2, '#ffd58a') + r(30, 14, 4, 1, '#ffe7b0');
    } else if (time !== 'storm') {
      s += r(51, 3, 6, 6, '#fff6c8') + r(50, 4, 8, 4, '#fff6c8') + r(52, 2, 4, 1, '#fff6c8') + r(52, 9, 4, 1, '#fff6c8');
    }
    return s;
  }
  function clouds(time) {
    const c = time === 'night' ? '#3c4a6a' : time === 'storm' ? '#7a8392' : time === 'dusk' ? '#f6d2c0' : '#ffffff';
    const sh = time === 'night' ? '#2c3854' : time === 'storm' ? '#5e6676' : time === 'dusk' ? '#d9a9a0' : '#dbe9f2';
    const one = (x, y) => r(x + 2, y, 7, 2, c) + r(x, y + 2, 12, 2, c) + r(x + 1, y + 4, 10, 1, sh);
    return `<g class="ga-cloud">${one(4, 5)}${one(34, 9)}</g>`;
  }
  function sea(time, top) {
    const S = SEA[time] || SEA.day, y0 = top || 21;
    const hl = time === 'night' ? '#4a6c94' : time === 'dusk' ? '#9fa9d0' : time === 'storm' ? '#8aa0b0' : '#a8dcf2';
    let s = r(0, y0, 64, 5, S[0]) + r(0, y0 + 5, 64, 5, S[1]) + r(0, y0 + 10, 64, 36 - y0 - 10, S[2]);
    let w = '';
    [[3, y0 + 2], [19, y0 + 4], [41, y0 + 1], [55, y0 + 6], [10, y0 + 8], [33, y0 + 10], [48, y0 + 12]].forEach(([x, y], i) => { w += r(x, y, i % 2 ? 4 : 3, 1, hl); });
    return s + `<g class="ga-wave">${w}</g>`;
  }
  function boat(x, y) {
    // kleines eigenes Schiff (passt zum Hafen-Schiff)
    return `<g class="ga-ship">${r(x + 6, y, 1, 9, '#5a4433')}${r(x + 7, y, 3, 2, '#1a1a1a')}${r(x + 2, y + 2, 4, 5, '#f1eee8')}${r(x + 7, y + 2, 4, 5, '#f1eee8')}${r(x + 3, y + 1, 3, 1, '#f1eee8')}${r(x + 7, y + 7, 1, 1, '#d9cfbc')}
      ${r(x, y + 9, 14, 1, '#3a2a1e')}${r(x, y + 10, 14, 2, '#6b4a32')}${r(x + 1, y + 12, 12, 1, '#5a3c26')}${r(x + 2, y + 13, 10, 1, '#4a301e')}</g>`;
  }
  function gulls() {
    const g = (x, y) => r(x, y, 1, 1, '#ffffff') + r(x + 1, y + 1, 1, 1, '#ffffff') + r(x + 2, y, 1, 1, '#ffffff');
    return `<g class="ga-gull">${g(20, 6)}${g(26, 4)}</g>`;
  }
  function island(x, w, col, top) {
    // Insel-Silhouette mit Strand
    return r(x + 2, top, w - 4, 2, col) + r(x, top + 2, w, 3, col) + r(x - 1, top + 5, w + 2, 1, '#e9d6a0');
  }
  function palm(x, y) {
    return r(x + 2, y + 2, 1, 8, '#7a5230') + r(x + 3, y + 4, 1, 6, '#5e3b1d') + r(x, y, 6, 1, '#3d8b46') + r(x - 1, y + 1, 3, 1, '#2f6a2e') + r(x + 4, y + 1, 3, 1, '#2f6a2e') + r(x + 1, y - 1, 3, 1, '#5aa24a');
  }
  function house(x, y, roof) {
    return r(x, y + 3, 7, 5, '#f2e6cf') + r(x + 5, y + 3, 2, 5, '#d8c8a8') + r(x - 1, y + 2, 9, 1, roof) + r(x, y + 1, 7, 1, roof) + r(x + 1, y, 5, 1, roof) + r(x + 2, y + 5, 2, 3, '#6b4424') + r(x + 5, y + 4, 1, 1, '#9fd3f0');
  }
  // Stufen-Berg (Pixel-Dreieck) mit Licht links, Schatten rechts und Schneekappe
  function mountain(cx, base, h, lit, shade, cap) {
    let s = '';
    for (let i = 0; i < h; i++) {
      const half = Math.round((i + 1) * 1.15), y = base - h + i;
      s += r(cx - half, y, half, 1, lit) + r(cx, y, half, 1, shade);
      if (cap && i < Math.ceil(h / 3)) s += r(cx - half, y, half * 2, 1, i < Math.ceil(h / 3) - 1 ? '#ffffff' : '#e6eef5');
    }
    return s;
  }
  // Baumkrone in Stufen (statt Kasten)
  function tree(x, y, c1, c2) {
    return r(x + 3, y + 8, 2, 10, '#5e3b1d') + r(x + 2, y, 4, 1, c1) + r(x + 1, y + 1, 6, 2, c1) + r(x, y + 3, 8, 3, c1) + r(x + 5, y + 3, 3, 3, c2) + r(x + 1, y + 6, 6, 2, c2);
  }
  function weather(kind) {
    if (kind === 'rain' || kind === 'storm') {
      let d = '';
      for (let i = 0; i < 22; i++) d += r((i * 13) % 64, (i * 7) % 30, 1, 3, '#cfe4f4', 0.7);
      return `<g class="ga-rain">${d}</g>` + (kind === 'storm' ? `<g class="ga-flash">${r(0, 0, 64, 36, '#ffffff', 0.55)}</g>` : '');
    }
    if (kind === 'snow') {
      let d = '';
      for (let i = 0; i < 24; i++) d += r((i * 11) % 64, (i * 5) % 34, 1, 1, '#ffffff');
      return `<g class="ga-snow">${d}</g>`;
    }
    if (kind === 'fog') return `<g class="ga-fog">${r(-10, 14, 50, 3, '#ffffff', 0.45)}${r(20, 19, 54, 4, '#ffffff', 0.4)}${r(-6, 26, 44, 3, '#ffffff', 0.35)}</g>`;
    return '';
  }
  const SCENES = {
    see: (t) => sky(t) + clouds(t) + gulls() + sea(t) + boat(25, 13),
    ankunft: (t) => sky(t) + clouds(t) + sea(t) + island(36, 24, t === 'night' ? '#2a4a3a' : '#4f8a4a', 16) + palm(44, 8) + palm(52, 10) + boat(8, 14),
    dorf: (t) => sky(t) + clouds(t) + r(0, 18, 64, 3, '#6aa25a') + house(6, 10, '#c0503a') + house(20, 11, '#3f6fa0') + house(40, 9, '#c0503a') + r(54, 8, 2, 10, '#7a5230') + r(51, 6, 8, 3, '#3d8b46') + sea(t, 21) + r(0, 21, 64, 1, '#e9d6a0'),
    hafen: (t) => sky(t) + clouds(t) + sea(t, 22) + r(0, 20, 40, 3, '#8a5a30') + r(0, 23, 40, 1, '#5e3b1d') + [2, 10, 18, 26, 34].map(x => r(x, 24, 2, 6, '#5e3b1d')).join('') + r(48, 6, 5, 16, '#f2e6cf') + r(48, 10, 5, 2, '#d8433a') + r(48, 15, 5, 2, '#d8433a') + r(47, 4, 7, 2, '#3a2a1e') + r(49, 2, 3, 2, '#ffe28a') + boat(30, 9),
    dschungel: (t) => sky(t) + r(0, 14, 64, 22, t === 'night' ? '#173a26' : '#2f6a2e') + [-2, 7, 16, 25, 34, 43, 52, 60].map((x, i) => tree(x, 5 + (i % 3) * 2, i % 2 ? '#3d8b46' : '#5aa24a', '#2f6a2e')).join('') + r(0, 28, 64, 8, '#2a5a26') + r(0, 27, 64, 1, '#8fd06a') + r(12, 30, 3, 1, '#8fd06a') + r(40, 32, 4, 1, '#8fd06a'),
    wueste: (t) => sky(t === 'night' ? 'night' : t === 'dusk' ? 'dusk' : 'day').replace(/#8ec9ea|#a8d6ef|#c6e4f4|#e2f1f8/g, m => ({ '#8ec9ea': '#f6d4a0', '#a8d6ef': '#f8e0b4', '#c6e4f4': '#fbe9c6', '#e2f1f8': '#fdf2da' }[m])) + r(0, 20, 64, 16, '#e6b872') + r(6, 17, 22, 3, '#eec37e') + r(36, 18, 26, 2, '#eec37e') + r(42, 10, 8, 8, '#f2e2c4') + r(44, 8, 4, 2, '#f2e2c4') + r(45, 6, 2, 2, '#e8c25a') + r(47, 10, 3, 8, '#d8c8a8') + r(0, 28, 64, 1, '#c8924e'),
    schnee: (t) => sky(t) + mountain(16, 23, 12, '#c9d6e4', '#9fb2c6', true) + mountain(44, 23, 17, '#d8e4ee', '#a9bccf', true) + mountain(30, 23, 8, '#bccbdb', '#93a7bc', true) + r(0, 22, 64, 14, '#f4f8fb') + r(0, 22, 64, 1, '#ffffff') + r(8, 27, 10, 1, '#dfe8f0') + r(38, 30, 14, 1, '#dfe8f0') + weather('snow'),
    wolken: (t) => sky(t === 'night' ? 'night' : 'day') + r(0, 22, 64, 14, '#ffffff') + r(0, 21, 20, 2, '#ffffff') + r(26, 20, 22, 3, '#ffffff') + r(0, 27, 64, 1, '#e4f0fb') + r(0, 31, 64, 1, '#e4f0fb') + r(46, 9, 6, 6, '#f2c94c') + r(45, 10, 8, 4, '#f2c94c') + r(48, 15, 2, 6, '#b8862a') + boat(14, 9),
    sturm: () => sky('storm') + clouds('storm') + sea('storm') + boat(25, 13) + weather('storm'),
    nebel: (t) => sky(t) + sea(t) + boat(25, 13) + weather('fog')
  };

  GL.art = {
    scene(id, opts) {
      const o = opts || {}, t = o.time || 'day', key = 'sc:' + id + ':' + t + ':' + (o.weather || '') + ':' + (o.ship === false ? 0 : 1);
      if (cache[key]) return cache[key];
      const f = SCENES[id] || SCENES.see;
      let body = f(t);
      if (o.ship === false) body = body.replace(/<g class="ga-ship">[\s\S]*?<\/g>/, '');
      if (o.weather && id !== 'sturm' && id !== 'nebel') body += weather(o.weather);
      return (cache[key] = svg(64, 36, body, 'ga-scene sc-' + id));
    },
    prop(id) {
      const key = 'pr:' + id;
      if (cache[key]) return cache[key];
      const rows = PROPS[id];
      if (!rows) return '';
      return (cache[key] = svg(16, 16, grid(rows, 16), 'ga-prop'));
    },
    icon(id) {
      const k = ALIAS[id] || id, key = 'ic:' + k;
      if (cache[key]) return cache[key];
      const rows = ICONS[k];
      if (!rows) return '';
      return (cache[key] = svg(12, 12, grid(rows, 12), 'ga-icon icon'));
    },
    ids: () => ({ scenes: Object.keys(SCENES), props: Object.keys(PROPS), icons: Object.keys(ICONS) })
  };
})();
