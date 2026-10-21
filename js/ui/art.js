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
//   GL.art.monster(id)      → SVG 14×16 (ART2): seekoenig, krabbe, sumpfaffe, marinerekrut, jaegerduo, fischmensch, skorpion, schneewolf, wolkenwaechter, zombiematrose, giftqualle, roboter
//   GL.art.npc(id)          → SVG 14×16 Porträt (ART2): hafenwirtin, kartograph, kadettin, fischerjunge, haendler, waerter
//   Szenen (ART2) zusätzlich: geisterschiff, grotte, markt_nacht, vulkan, wrackfriedhof, kirschhafen
//   GL.art.digits(text, kind) → Pixel-Ziffern (0-9 + - % KRIT !), kind: normal | crit | heal | poison | shield | burn
//   GL.art.ids()            → { scenes, props, icons, monsters, npcs } für Galerie/Tests
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

  // ===== ART2: Monster, NPC-Porträts, Quest-Kulissen, Pixel-Ziffern =====
  // Monster 14×16 (gleiche Größenordnung wie die Arena-Sprites), nur Grafik, noch keine Gegnerdaten.
  const MONSTERS = {
    seekoenig: { pal: { h: '#3fa7a0', H: '#2a7470', i: '#bfe8d8' }, rows: [
      '....kkk.......', '...khhhk..kk..', '..khwzhhk.kik.', '..khhhhhhkkik.', '.khhhhhhhhhHk.', '.krrrrkhhhhHk.',
      '..kwkwkhiiHk..', '...kkkkhiiHk..', '.......khiHk..', '......khiiHk..', '.....khiiHk...', '....khiiHk....',
      '..kkhiiHHk....', '.kihhhHHk..k..', 'kiihhHkk..kik.', '.kkkkk....kk..'] },
    krabbe: { rows: [
      '..............', '..............', '..kk......kk..', '.krrk....krrk.', '.krRk....kRrk.', '..kk.kkkk.kk..',
      '...kkrrrrkk...', '..krrzrrzrrk..', '.krrrrrrrrrRk.', 'krrfrrrrrrrRRk', 'krRrrrrrrrRRRk', '.kRRRRRRRRRRk.',
      '..kkkkkkkkkk..', '.k.k.k..k.k.k.', 'k..k..kk..k..k', '..............'] },
    sumpfaffe: { rows: [
      '....kkkkkk....', '...kbbbbbbk...', '..kbnnnnnnbk..', '.kkbnzknzkbkk.', 'kbkbnnnnnnbkbk', '.k.kbnRRnbk.k.',
      '....kbbbbk....', '...kbbgbbbk...', '..kbbgggbbBk..', '.kbkbbgbbBkbk.', '.kbkbbbbbBkbk.', '.kk.kbbbBk.kk.',
      '....kbBkbBk...', '....kbk.kbk...', '...kddk.kddk..', '...kkk..kkk...'] },
    marinerekrut: { rows: [
      '.....kkkk.....', '....kwwwwk....', '...kuuuuuuk...', '....knnnnk....', '....knzznk....', '....knnNnk....',
      '...kwwwwwwk.k.', '..kwwuwwuwwkek', '..kwwwwwwwwkek', '..knkwwwwkknek', '....kwwwwk..ek', '....kuuuuk..k.',
      '....kuk.kuk...', '....kuk.kuk...', '...kddk.kddk..', '...kkk..kkk...'] },
    jaegerduo: { rows: [
      '..kkk...kkk...', '.kdddk.kRRRk..', 'kdddddkRRRRRk.', '.knnk...knnk..', '.kzzk...kzzk..', '.knnk...knnk..',
      'kooook.kttttk.', 'kooOok.ktTttk.', 'kooOokskTttk..', '.kook.s.kttk..', '.kbbk...kssk..', '.kbbk...kssk..',
      '.kbbk...kssk..', '.kddk...kddk..', 'kddk...kddk...', 'kkk....kkk....'] },
    fischmensch: { pal: { h: '#5fb3c8', H: '#3a7f94' }, rows: [
      '.....kkkk.....', '....khhhhk.k..', '...khhzhhhkhk.', '...khhhhhhhk..', '..kkhrrrrhkk..', '.khhhkwwkhhhk.',
      'khhhhhkkhhhhhk', 'khhHhhhhhhHhhk', '.khkHhhhhHkhk.', '.khk.ksssk.khk', '..k..ksssk..k.', '.....khhhk....',
      '....khhkhhk...', '....khk.khk...', '...kHHk.kHHk..', '...kkk..kkk...'] },
    skorpion: { rows: [
      '..............', '..............', '.........kk...', '........kook..', '.........kok..', '..........kok.',
      '..........kok.', '.........kook.', '..kk....kook..', '.kOok.kkook...', 'kooOkkooook...', '.kkkooozoook..',
      '...kooooooOk..', '..kOooooooOOk.', '.k.kOOOOOOk.k.', 'k.k.kkkkkk.k.k'] },
    schneewolf: { rows: [
      '..............', '..............', '..............', '.kk...........', 'kwWk..........', 'kwwWk......k..',
      'kwzwwkkkkkkwk.', 'kkwwwwwwwwwwk.', '.kwwwwwwwwwWk.', '..kwwwwwwwWWk.', '..kwWwwwwWWk..', '..kwk.kwk.kWk.',
      '..kwk.kwk.kwk.', '..kSk.kSk.kSk.', '..kk..kk..kk..', '..............'] },
    wolkenwaechter: { rows: [
      '.......y......', '..kk...yk.kk..', '.kwwk.kykkwwk.', 'kwwWk.knnk.kwk', 'kwWk..kzzk..kk', '.kk..kknnkk.y.',
      '....kwwwwwwkyk', '...kwwyywwwkyk', '...kwwwwwwwkyk', '....kwwwwwk.yk', '....kssssk..y.', '....kwwwwk..y.',
      '....kwk.kwk...', '...kwwk.kwwk..', '..kwwwwkwwwwk.', '...kkkk.kkkk..'] },
    zombiematrose: { pal: { h: '#9bb08a', H: '#6f8462' }, rows: [
      '....kkkkk.....', '...kuuuuuk....', '...khhhhhk....', '...khzhkhk....', '...khhhhHk....', '...khRRhk.....',
      '..kwuwwuwk....', '.kwwuwwuwwk...', 'khkwuwwuwkhk..', 'kh.kwwwwwk.hk.', '.k.kwkwwwk..k.', '...kuuuuuk....',
      '...kuk.kuk....', '...kuk..khk...', '..kddk..khk...', '..kkk...kkk...'] },
    giftqualle: { rows: [
      '....kkkkkk....', '..kkqqqqqqkk..', '.kqqpqqqqqpqk.', 'kqqpppqqqppqqk', 'kqqqqzqqzqqqqk', 'kpqqqqqqqqqqpk',
      '.kpPpPpPpPpPk.', '..kp.kp.kp.k..', '..kp.kp..kp...', '...kp.kp.kp...', '...kp..kp.kp..', '..kp...kp..k..',
      '..k....kp.....', '.......k......', '..............', '..............'] },
    roboter: { rows: [
      '....kkkkkk....', '...kssssssk...', '..kssSssSssk..', '..ksfkssfksk..', '..ksssssssSk..', '...kStttStk...',
      '.kksssssssskk.', 'kssksSssSsksSk', 'ksSksssssksSSk', 'kssktttttksSSk', '.kk.ksssSk.kk.', '....kssSSk....',
      '....ksk.kSk...', '...kssk.kSSk..', '..ktttk.ktttk.', '..kkkkk.kkkkk.'] }
  };
  // NPC-Porträts 14×16 (Kopf und Schultern), eigene Figuren
  const NPCS = {
    hafenwirtin: { rows: [
      '...kkkkkkkk...', '..kRrrrrrrRk..', '.kRrrRrrRrrRk.', '.kRknnnnnnkRk.', '.kRnnnnnnnnRk.', '.kRnzknnkznRk.',
      '..knnnnnnnnk..', '..knnnrrnnnk..', '...knnnnnnk...', '....kkNNkk....', '..kkwwwwwwkk..', '.kwwrwwwwrwwk.',
      'kwwwwrrrrwwwwk', 'kwwwwwwwwwwwWk', 'kbbbbbbbbbbbBk', 'kkkkkkkkkkkkkk'] },
    kartograph: { rows: [
      '....kkkkkk....', '...kSSSSSSk...', '..kSsnnnnsSk..', '..knnnnnnnnk..', '..kzzzknzzzk..', '..kzwzkkzwzk..',
      '..knnnnNnnnk..', '..knsssssnnk..', '...kssssssk...', '....kssssk....', '..kkCccccCkk..', '.kCccmccmccCk.',
      'kCcccccccccCCk', 'kCccCcccCcccCk', 'kCCCCCCCCCCCCk', 'kkkkkkkkkkkkkk'] },
    kadettin: { rows: [
      '...kkkkkkkk...', '..kwwwwwwwwk..', '.kuuuuuuuuuuk.', '..kooonnooook.', '..konnnnnnook.', '..knzknnkznok.',
      '..knnnnnnnnok.', '..knnnRnnnnok.', '...knnnnnnkok.', '....kkNNkk.ok.', '..kkwwuuwwkkk.', '.kwwwwuuwwwwk.',
      'kwwuwwwwwwuwwk', 'kwwwwwwwwwwwWk', 'kuuuuuuuuuuuUk', 'kkkkkkkkkkkkkk'] },
    fischerjunge: { rows: [
      '..............', '...kkkkkkkk...', '..kyyyyyyyyk..', '.kyyYyyyyYyyk.', '..kdnnnnnndk..', '..knzknnkznk..',
      '..knnnnnnnnk..', '..knnnRRnnnk..', '...knnnnnnk...', '....kkNNkk....', '..kkuuuuuukk..', '.kuuauuuauuuk.',
      'kuuuuuuuuuuuUk', 'kuuuuuuuuuuuUk', 'kbbbbbbbbbbbBk', 'kkkkkkkkkkkkkk'] },
    haendler: { rows: [
      '....kkkkkk....', '...kPPPPPPk...', '..kPpppppppk..', '.kkkkkkkkkkkk.', '..knnnnnnnnk..', '..knzknnkzzk..',
      '..knnnnnnnnk..', '..knddddddnk..', '...kdnnnndk...', '....kkNNkk....', '..kkppppppkk..', '.kppyppppyppk.',
      'kpppppppppppPk', 'kppppppppkskPk', 'kPPPPPPPPkSkPk', 'kkkkkkkkkkkkkk'] },
    waerter: { rows: [
      '....kkkkkk....', '...kttttttk...', '..kttttttttk..', '..ktnnnnnntk..', '..knzknnkznk..', '..knnnnnnnnk..',
      '..kSnnnnnnSk..', '..kSSnnnnSSk..', '...kSSSSSSk...', '....kSSSSk....', '..kkrrwwrrkk..', '.krrwwrrwwrrk.',
      'krrwwrrwwrrwwk', 'kwwrrwwrrwwrRk', 'krrwwrrwwrrwRk', 'kkkkkkkkkkkkkk'] }
  };
  // Neue Quest-/Folgen-Kulissen (gleiche Hilfen wie oben, time/weather passen)
  function mastBroken(x, y, h) { return r(x, y, 2, h, '#4a3424') + r(x - 3, y + 2, 7, 1, '#3a2a1e') + r(x + 2, y + 3, 4, 3, '#cfc6b4', 0.8); }
  function stall(x, y, roof) { return r(x, y, 12, 2, roof) + r(x + 1, y + 2, 10, 1, '#f2e6cf') + r(x + 1, y + 3, 1, 6, '#5e3b1d') + r(x + 10, y + 3, 1, 6, '#5e3b1d') + r(x, y + 8, 12, 2, '#8a5a30') + r(x + 3, y + 7, 2, 1, '#f08a24') + r(x + 6, y + 7, 2, 1, '#d8433a'); }
  function lantern(x, y) { return r(x, y, 1, 2, '#3a2a1e') + r(x - 1, y + 2, 3, 3, '#ffd58a') + r(x - 2, y + 1, 5, 5, '#ffd58a', 0.25); }
  function sakura(x, y) { return r(x + 3, y + 7, 2, 9, '#6b4424') + r(x + 1, y, 6, 2, '#f6b8cf') + r(x, y + 2, 8, 3, '#f6b8cf') + r(x + 5, y + 2, 3, 3, '#e08aab') + r(x + 1, y + 5, 6, 2, '#e08aab'); }
  Object.assign(SCENES, {
    geisterschiff: (t) => sky('night') + sea('night') + `<g class="ga-ship">${r(22, 8, 2, 14, '#2a2a33')}${r(36, 6, 2, 16, '#2a2a33')}${r(17, 10, 8, 6, '#a9b6a0', 0.6)}${r(31, 8, 9, 7, '#a9b6a0', 0.55)}${r(18, 15, 2, 1, '#2a2a33')}${r(33, 13, 3, 2, '#2a2a33')}${r(12, 21, 36, 2, '#24242c')}${r(14, 23, 32, 2, '#1b1b22')}${r(25, 19, 2, 2, '#7dff9a')}${r(40, 19, 2, 2, '#7dff9a')}${r(10, 18, 44, 8, '#7dff9a', 0.08)}</g>` + weather('fog'),
    grotte: () => r(0, 0, 64, 12, '#2a6e9e') + r(0, 12, 64, 12, '#215a86') + r(0, 24, 64, 12, '#18456c') + r(18, 0, 4, 20, '#9fd3f0', 0.25) + r(34, 0, 3, 24, '#9fd3f0', 0.2) + r(46, 0, 5, 16, '#9fd3f0', 0.18) + r(0, 28, 20, 8, '#3a4a5a') + r(44, 26, 20, 10, '#3a4a5a') + r(2, 25, 10, 3, '#4a5a6a') + r(48, 23, 12, 3, '#4a5a6a') + r(24, 31, 16, 5, '#e9d6a0') + r(28, 14, 4, 2, '#f08a24') + r(27, 15, 1, 1, '#f08a24') + r(40, 9, 3, 2, '#f2c94c') + `<g class="ga-gull">${r(14, 18, 1, 1, '#cfe4f4')}${r(16, 14, 1, 1, '#cfe4f4')}${r(15, 10, 2, 2, '#cfe4f4')}${r(50, 12, 1, 1, '#cfe4f4')}${r(52, 8, 2, 2, '#cfe4f4')}</g>` + r(10, 30, 2, 6, '#3d8b46') + r(8, 32, 2, 4, '#2f6a2e') + r(54, 28, 2, 8, '#d8433a', 0.8),
    markt_nacht: () => sky('night') + r(0, 22, 64, 14, '#3a2e26') + r(0, 22, 64, 1, '#5a4636') + stall(4, 13, '#c0503a') + stall(24, 12, '#3f6fa0') + stall(44, 13, '#c9a227') + lantern(20, 8) + lantern(40, 7) + lantern(60, 9) + r(0, 30, 64, 1, '#2a2019') + r(10, 26, 2, 3, '#f2c9a0') + r(30, 27, 2, 3, '#f2c9a0') + r(52, 26, 2, 3, '#f2c9a0'),
    vulkan: (t) => r(0, 0, 64, 7, '#4a1f1f') + r(0, 7, 64, 7, '#7a2e22') + r(0, 14, 64, 7, '#b0452a') + mountain(32, 24, 16, '#4a3a34', '#2e2420', false) + r(29, 7, 6, 2, '#ff8a2a') + r(30, 5, 4, 2, '#ffd27a') + r(28, 9, 2, 6, '#ff5a1a') + r(34, 10, 2, 7, '#ff5a1a') + r(26, 2, 3, 2, '#5a5a5a', 0.7) + r(33, 0, 4, 3, '#5a5a5a', 0.6) + sea('dusk', 24).replace(/#5a6fa0|#4a5e90|#3c4f80/g, m => ({ '#5a6fa0': '#6a3a3a', '#4a5e90': '#5a3030', '#3c4f80': '#4a2626' }[m])) + boat(4, 15),
    wrackfriedhof: (t) => sky(t === 'night' ? 'night' : 'storm') + sea(t === 'night' ? 'night' : 'storm') + mastBroken(8, 14, 10) + mastBroken(24, 11, 12) + mastBroken(44, 13, 10) + r(38, 22, 14, 2, '#3a2a1e') + r(4, 23, 12, 2, '#3a2a1e') + r(20, 24, 10, 1, '#3a2a1e') + r(56, 18, 3, 6, '#4a3424') + weather('fog'),
    kirschhafen: (t) => sky(t) + clouds(t) + sea(t, 23) + r(0, 20, 42, 3, '#8a5a30') + r(0, 23, 42, 1, '#5e3b1d') + [4, 14, 24, 34].map(x => r(x, 24, 2, 5, '#5e3b1d')).join('') + sakura(44, 6) + sakura(54, 9) + r(44, 21, 20, 2, '#6aa25a') + `<g class="ga-snow">${[[10, 4], [18, 9], [30, 3], [38, 12], [48, 2], [58, 14], [26, 16]].map(([x, y]) => r(x, y, 1, 1, '#f6b8cf')).join('')}</g>` + boat(22, 9)
  });
  // Pixel-Ziffern 3×5 (+ Umriss) für Schadenszahlen: 0-9 + - % und „KRIT“
  const FONT = {
    '0': ['xxx', 'x.x', 'x.x', 'x.x', 'xxx'], '1': ['.x.', 'xx.', '.x.', '.x.', 'xxx'], '2': ['xxx', '..x', 'xxx', 'x..', 'xxx'],
    '3': ['xxx', '..x', '.xx', '..x', 'xxx'], '4': ['x.x', 'x.x', 'xxx', '..x', '..x'], '5': ['xxx', 'x..', 'xxx', '..x', 'xxx'],
    '6': ['xxx', 'x..', 'xxx', 'x.x', 'xxx'], '7': ['xxx', '..x', '.x.', '.x.', '.x.'], '8': ['xxx', 'x.x', 'xxx', 'x.x', 'xxx'],
    '9': ['xxx', 'x.x', 'xxx', '..x', 'xxx'], '+': ['...', '.x.', 'xxx', '.x.', '...'], '-': ['...', '...', 'xxx', '...', '...'],
    '%': ['x.x', '..x', '.x.', 'x..', 'x.x'], 'K': ['x.x', 'x.x', 'xx.', 'x.x', 'x.x'], 'R': ['xx.', 'x.x', 'xx.', 'x.x', 'x.x'],
    'I': ['xxx', '.x.', '.x.', '.x.', 'xxx'], 'T': ['xxx', '.x.', '.x.', '.x.', '.x.'], ' ': ['...', '...', '...', '...', '...'], '!': ['.x.', '.x.', '.x.', '...', '.x.']
  };
  const DIGIT_COL = { normal: ['#ffffff', '#d8d2c4'], crit: ['#ffe28a', '#f2a91c'], heal: ['#a8f08a', '#4fbf4a'], poison: ['#d6a8ff', '#9b6fd1'], shield: ['#a8d8ff', '#4f8fe0'], burn: ['#ffb07a', '#f06a24'] };
  function digits(text, kind) {
    const s = String(text).toUpperCase().split('').filter(ch => FONT[ch]);
    if (!s.length) return '';
    const key = 'dg:' + s.join('') + ':' + (kind || 'normal');
    if (cache[key]) return cache[key];
    const [c1, c2] = DIGIT_COL[kind] || DIGIT_COL.normal;
    const W = s.length * 4 + 1, H = 7;
    // Umriss: jedes gesetzte Pixel bekommt einen dunklen 1-px-Rand, darüber Füllung mit Licht oben / Schatten unten
    const on = new Set(), px = [];
    s.forEach((ch, i) => FONT[ch].forEach((row, y) => row.split('').forEach((v, x) => { if (v === 'x') { const X = i * 4 + x + 1, Y = y + 1; on.add(X + ',' + Y); px.push([X, Y]); } })));
    let out = '';
    const seen = new Set();
    px.forEach(([x, y]) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const k = (x + dx) + ',' + (y + dy); if (!on.has(k) && !seen.has(k)) { seen.add(k); out += r(x + dx, y + dy, 1, 1, '#2b1d14'); } } });
    px.forEach(([x, y]) => { out += r(x, y, 1, 1, y >= 4 ? c2 : c1); });
    return (cache[key] = `<svg viewBox="-1 -1 ${W + 1} ${H + 1}" shape-rendering="crispEdges" class="ga-digits dg-${kind || 'normal'}" style="width:${(W + 1) * 3}px;height:${(H + 1) * 3}px" aria-hidden="true">${out}</svg>`);
  }

  GL.art = {
    // Freies Raster (z. B. Kaperfahrt-Teile aus js/data/kfart.js): rows = Zeilen, w×h, pal ergänzt/überschreibt die gemeinsame Palette
    raw(key, rows, w, h, pal, cls) {
      const k = 'raw:' + key;
      if (cache[k]) return cache[k];
      return (cache[k] = svg(w, h, grid(rows, w, pal), cls || 'ga-raw'));
    },
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
    monster(id) {
      const key = 'mo:' + id;
      if (cache[key]) return cache[key];
      const m = MONSTERS[id];
      if (!m) return '';
      return (cache[key] = svg(14, 16, grid(m.rows, 14, m.pal), 'ga-monster'));
    },
    // Monster als {c, rows} für GL.sprites (bekommt dort Umriss und Schattierung wie die Tiere)
    monsterArt(id) {
      const m = MONSTERS[id];
      if (!m) return null;
      const c = Object.assign({}, P, m.pal || {}); delete c.k; delete c['.'];
      return { c, rows: m.rows };
    },
    npc(id) {
      const key = 'np:' + id;
      if (cache[key]) return cache[key];
      const m = NPCS[id];
      if (!m) return '';
      return (cache[key] = svg(14, 16, grid(m.rows, 14, m.pal), 'ga-npc'));
    },
    digits,
    ids: () => ({ scenes: Object.keys(SCENES), props: Object.keys(PROPS), icons: Object.keys(ICONS), monsters: Object.keys(MONSTERS), npcs: Object.keys(NPCS) })
  };
})();
