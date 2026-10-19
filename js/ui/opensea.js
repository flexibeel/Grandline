// Offene See: Anzeige der kleinen Seekarte (Phase 'sea'). Regeln: js/engine/opensea.js, Texte: js/data/opensea.js
//   GL.seaUi.stage(run, h)        → HTML für #stage (h.noticeBox aus render.js)
//   GL.seaUi.click(type, el, run) → { act } | { pop } | null (main.js ruft das für data-act="sea-…" auf)
// Alles Pixel-Art im Stil des Spiels: warmes Türkis, Holzrahmen, Creme-Plaketten. Lebendige See per CSS
// (treibende Stürme, Möwen, ein Händler am Horizont, Seeschlange, Kielwasser), bei reduzierter Bewegung still.
window.GL = window.GL || {};

(function () {
  const en = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const L = v => (Array.isArray(v) ? v[en() ? 1 : 0] : v);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' })[ch]);
  const D = () => GL.data.openSea;
  const T = k => L(D().txt[k]);
  let sel = null;          // { key, c, r } angetippter Punkt (nur Anzeige, nicht gespeichert)

  // ---------- Pixel-Helfer ----------
  const PAL = { k: '#2b1d14', w: '#fbf6ea', W: '#d9cfbc', y: '#f2c94c', Y: '#b8862a', b: '#b07a44', B: '#8a5a30', d: '#5e3b1d',
    g: '#5aa24a', G: '#2f6a2e', l: '#8fd06a', s: '#9aa3b2', S: '#5d6575', t: '#3d4452', u: '#9fd3f0', a: '#d8efe6', c: '#f3e2bd', C: '#d6bd8a', r: '#d8433a', f: '#ffe28a' };
  function grid(rows, cls, pal) {
    const P = Object.assign({}, PAL, pal || {});
    const w = rows[0].length, h = rows.length;
    let o = '';
    rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch !== '.' && P[ch]) o += `<rect x="${x}" y="${y}" width="1" height="1" fill="${P[ch]}"/>`; } });
    return `<svg class="${cls || ''}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
  }
  const ART = {
    wreck: ['..........d...', '.........dw...', '........dwww..', '.......d..w...', '......d.......', '.....d........',
      '..kkkdkk..kk..', '.kbbbbbbk.kyyk.', 'kbBbBbBbbkkYYk', '.kdddddddkkkk.', 'aaakkkkkkaaaaa', '.aa.aa..aa.aa.'],
    isle: ['.....gl.......', '....gGGlg.....', '...g..d..g....', '......d.......', '......d.......', '....kkdkk.....',
      '..kcccccccck..', '.kccggglcccck.', 'kcCcccccccCcck', 'aakkkkkkkkkkaa', '.aa..aa..aa...'],
    storm: ['.....kkkk.......', '...kkSSSSkkk....', '..kSSsssSSSSk...', '.kSssssssssSSk..', 'kSsssssssssssSk.', 'kSSSSSSSSSSSSSk.',
      '.kkkkkfkkkkkk...', '..u...ff..u.....', '.u...ff..u...u..', '....ff..u...u...', '...f...u...u....'],
    bolt: ['..kkk', '.kffk', '.kfk.', 'kffkk', 'kfffk', '.kfk.', '.kk..'],
    gull: ['k...k', '.k.k.', '..k..'],
    fish: ['.yy.y', 'yyyyy', '.yy.y'],
    hump: ['..kkk...', '.khhhk..', 'khhhhhk.', 'aaaaaaaa'],
    buoy: ['..k..', '.krk.', 'kwwwk', '.krk.', 'aaaaa'],
    seaIcon: ['.....k......', '....kwk.....', '...kwwk.....', '..kwwwk.....', '.kwwwwk.....', '.....k......', 'kkkkkkkkkk..', '.kbbbbbbbk..', '..kBBBBBk...', 'u.uu.u.uu.u.', '.uu.uu.uu.uu', '............']
  };
  const art = (id, cls, pal) => grid(ART[id], cls, pal);
  // Zielinsel: Sand, Grün, zwei Palmen, Hütte, Steg und Fähnchen
  function destArt() {
    const R = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    let o = '';
    o += R(3, 30, 22, 2, '#d8efe6') + R(1, 28, 26, 2, '#7cc4b0');                       // Brandung
    o += R(4, 21, 20, 8, '#e8cf94') + R(2, 23, 24, 5, '#e8cf94') + R(5, 28, 18, 1, '#c9a46a');   // Sand
    o += R(6, 18, 16, 6, '#5aa24a') + R(8, 16, 12, 3, '#6eb85a') + R(10, 15, 7, 2, '#8fd06a');    // Grün
    o += R(16, 12, 6, 6, '#c0503a') + R(15, 11, 8, 2, '#8a3a2e') + R(18, 15, 2, 3, '#5e3b1d');   // Hütte
    o += R(7, 6, 1, 12, '#7a5232') + R(4, 5, 7, 2, '#3d8b46') + R(3, 6, 2, 2, '#3d8b46') + R(10, 6, 2, 2, '#3d8b46');   // Palme
    o += R(12, 9, 1, 8, '#7a5232') + R(10, 8, 5, 2, '#5aa24a') + R(14, 9, 2, 1, '#5aa24a');
    o += R(23, 4, 1, 8, '#5e3b1d') + R(24, 4, 4, 3, '#d8433a');                                // Fahne
    o += R(0, 24, 5, 1, '#8a5a30') + R(1, 25, 1, 3, '#5e3b1d') + R(4, 25, 1, 3, '#5e3b1d');   // Steg
    return `<svg class="os-dest-art" viewBox="0 0 28 33" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
  }
  // See als Pixel-Seekarte: Bänder in warmem Türkis, Wellenstriche, Kartenlinien, Kompass, Felsen, Flachwasser vor der Insel
  let seaCache = null;
  function seaArt(seed) {
    if (seaCache && seaCache.seed === seed) return seaCache.html;
    const W = 96, H = 64, R = (x, y, w, h, c, op) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${op ? ` opacity="${op}"` : ''}/>`;
    let o = R(0, 0, W, H, '#4ea597') + R(0, 16, W, 16, '#49a093') + R(0, 32, W, 16, '#44998c') + R(0, 48, W, 16, '#3f9285');
    o += R(80, 0, 16, H, '#63b5a4') + R(84, 0, 12, H, '#79c2ae');   // Flachwasser vor der Insel
    let h = (seed >>> 0) || 7;
    const rnd = () => { h = Math.imul(h ^ (h >>> 13), 1103515245) + 12345 >>> 0; return (h >>> 8) / 16777216; };
    let wv = '';
    for (let i = 0; i < 46; i++) { const x = Math.floor(rnd() * 90), y = Math.floor(rnd() * 62); wv += R(x, y, 3, 1, '#9fdccb', '.7') + R(x + 1, y - 1 < 0 ? 0 : y - 1, 1, 1, '#c7ecdf', '.6'); }
    // Kartenlinien vom Kompass aus (gepunktet, Creme)
    let ln = '';
    [[90, 6], [70, 60], [94, 34], [40, 2]].forEach(([tx, ty]) => {
      const n = 30; for (let k = 2; k < n; k += 2) { const x = Math.round(10 + (tx - 10) * k / n), y = Math.round(54 + (ty - 54) * k / n); ln += R(x, y, 1, 1, '#f3e2bd', '.28'); }
    });
    // Kompass unten links
    const cx = 10, cy = 54, cc = '#f3e2bd', cd = '#6b4a2a';
    const comp = R(cx - 6, cy, 13, 1, cc, '.8') + R(cx, cy - 6, 1, 13, cc, '.8') + R(cx - 1, cy - 1, 3, 3, cc) + R(cx, cy, 1, 1, cd) + R(cx, cy - 6, 1, 2, '#d8433a');
    // zwei Felsen mit Schaum (Deko, zwischen den Feldern)
    const rock = (x, y) => R(x, y + 2, 6, 1, '#d8efe6') + R(x + 1, y, 4, 2, '#7a7f88') + R(x + 2, y - 1, 2, 1, '#9aa3b2') + R(x + 3, y, 2, 1, '#5d6575');
    o += `<g class="os-wv">${wv}</g>` + ln + comp + rock(31, 31) + rock(63, 47) + rock(47, 14);
    o += R(0, 0, W, 1, '#2b1d14', '.25') + R(0, H - 1, W, 1, '#2b1d14', '.25');
    const html = `<svg class="os-sea" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true">${o}</svg>`;
    seaCache = { seed, html };
    return html;
  }

  // Patch: Routen-Symbol für 'sea' (render.js/journeyView fragen GL.sprites.icon('node', t))
  if (GL.sprites && GL.sprites.icon) {
    const base = GL.sprites.icon;
    GL.sprites.icon = function (kind, id, epic) { return kind === 'node' && id === 'sea' ? art('seaIcon', 'icon os-ico') : base.call(this, kind, id, epic); };
  }

  // ---------- Geometrie ----------
  const jit = (c, r, k) => { const x = Math.sin(c * 12.9898 + r * 78.233 + k * 37.719) * 43758.5453; return (x - Math.floor(x) - 0.5); };
  function pos(s, c, r) {
    const last = c >= s.cols - 1;
    const x = last ? 92 : 4 + (c + 0.5) / (s.cols - 0.6) * 86 + jit(c, r, 1) * 4;
    const y = (r + 0.5) / s.rows * 100 + (last ? 0 : jit(c, r, 2) * 6);
    return [x, y];
  }
  const st = (s, c, r) => { const [x, y] = pos(s, c, r); return `left:${x.toFixed(2)}%;top:${y.toFixed(2)}%`; };

  function findIcon(f) {
    if (f.k === 'pirates') return `<span class="os-flip">${GL.sprites.ship({ sail: 'nacht', hull: 'schwarz', flag: 'rot' })}</span>`;
    if (f.k === 'merchant') return `${GL.sprites.ship({ sail: 'streifen', hull: 'hell', flag: 'gold' })}<i class="os-coin">${GL.sprites.coin()}</i>`;
    if (f.k === 'monster') return (GL.art && GL.art.monster && GL.art.monster('seekoenig')) || art('hump', '', { h: '#3fa7a0' });
    if (f.k === 'wreck') return art('wreck');
    return art('isle') + '<i class="os-q">?</i>';
  }
  const DANGER = [{ max: 0.6, cls: 'low', name: 'Gefahr gering' }, { max: 2, cls: 'mid', name: 'Gefahr mittel' }, { max: 1e9, cls: 'high', name: 'Gefahr hoch' }];
  function danger(run, kind) {
    try { const r = GL.run.estimate(run, kind), i = DANGER.findIndex(d => r < d.max);
      return `<span class="danger d-${DANGER[i].cls}">${'<i></i>'.repeat(i + 1)}${DANGER[i].name}</span>`; } catch (e) { return ''; }
  }
  const GAIN = { pirates: ['⚔ +Gold', '⚔ +gold'], monster: ['⚔ + Schatz', '⚔ + treasure'], wreck: ['Schatz', 'Treasure'], merchant: ['Crew', 'Crew'], isle: ['Ereignis', 'Event'] };

  // ---------- Bühne ----------
  function stage(run, h) {
    const s = run.sea;
    if (!s) return '';
    const S = GL.seaRun, key = run.seed + ':' + run.step;
    if (sel && sel.key !== key) sel = null;
    const reach = S.reach(s), next = S.stormsAfter(s, 1);
    const isReach = (c, r) => reach.some(p => p[0] === c && p[1] === r);
    const stormNext = (c, r) => c < s.cols - 1 && next.some(x => x.c === c && x.r === r);
    const pct = Math.round(D().cfg.stormHurt * 100);
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let o = '';
    // Kielwasser: gestrichelte Linie über alle gesegelten Felder
    const pts = s.path.map(([c, r]) => pos(s, c, r));
    o += `<svg class="os-wake" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}"/></svg>`;
    // Start-Boje
    o += `<span class="os-buoy" style="${st(s, 0, s.path[0][1])}">${art('buoy')}</span>`;
    // Lebendige See (Deko ohne Spielwirkung)
    o += `<span class="os-life os-gull a">${art('gull')}</span><span class="os-life os-gull b">${art('gull')}</span>`;
    o += `<span class="os-life os-trader">${GL.sprites.ship({ sail: 'himmel', hull: 'hell', flag: 'gold' })}</span>`;
    o += `<span class="os-life os-hump">${art('hump', '', { h: '#2f7f74' })}</span>`;
    o += `<span class="os-life os-fish">${art('fish')}</span>`;
    // erreichbare Felder (Daumen-Ziele)
    reach.forEach(([c, r]) => {
      if (c >= s.cols - 1) return;
      const f = s.finds.find(x => x.c === c && x.r === r && !x.done);
      if (f) return;
      const warn = stormNext(c, r);
      o += `<button class="os-cell${warn ? ' warn' : ''}${sel && sel.c === c && sel.r === r ? ' on' : ''}" data-act="sea-tap" data-c="${c}" data-r="${r}" style="${st(s, c, r)}" aria-label="${esc(T('water'))}"><i></i></button>`;
    });
    // Funde
    s.finds.forEach((f, i) => {
      const K = D().kinds[f.k], can = isReach(f.c, f.r), passed = f.c <= s.ship[0];
      if (f.done) { o += `<span class="os-find done" style="${st(s, f.c, f.r)}" aria-hidden="true"><i class="os-chk">✓</i></span>`; return; }
      o += `<button class="os-find k-${f.k}${can ? ' can' : ''}${passed ? ' gone' : ''}${stormNext(f.c, f.r) && can ? ' warn' : ''}${sel && sel.c === f.c && sel.r === f.r ? ' on' : ''}" data-act="sea-tap" data-c="${f.c}" data-r="${f.r}" style="${st(s, f.c, f.r)};--d:${i * 0.4}s" aria-label="${esc(L(K.name))}">
        <span class="os-plate">${findIcon(f)}</span></button>`;
    });
    // Stürme: jetzt und (als ⚡) wo sie nach dem nächsten Zug sind
    s.storms.forEach((x, i) => {
      const pv = s.prev && s.prev[i];
      o += `<button class="os-storm" data-act="sea-tap" data-c="${x.c}" data-r="${x.r}" data-storm="1" style="${st(s, x.c, x.r)};--d:${i * 0.7}s"${pv && !reduce ? ` data-from="${st(s, pv.c, pv.r)}"` : ''} aria-label="${esc(T('storm'))}">${art('storm')}</button>`;
    });
    next.forEach(x => { o += `<span class="os-ghost" style="${st(s, x.c, x.r)}" title="${esc(T('stormNext').replace('{p}', pct))}">${art('bolt')}</span>`; });
    // Zielinsel (rechts, über alle Reihen)
    const destReach = reach.some(p => p[0] >= s.cols - 1);
    o += `<button class="os-dest${destReach ? ' can' : ''}" data-act="sea-tap" data-c="${s.cols - 1}" data-r="${s.ship[1]}" aria-label="${esc(s.dest)}">${destArt()}<b class="os-dest-name" lang="${en() ? 'en' : 'de'}">${esc(s.dest)}</b></button>`;
    // Schiff
    const prev = s.path.length > 1 ? s.path[s.path.length - 2] : null;
    o += `<span class="os-ship" style="${st(s, s.ship[0], s.ship[1])}"${prev && !reduce ? ` data-from="${st(s, prev[0], prev[1])}"` : ''} aria-hidden="true"><i class="os-foam"></i>${GL.sprites.ship()}</span>`;

    // Info-Fenster unten: Auswahl oder Hinweis
    const done = s.finds.filter(f => f.done).length;
    const chips = `<span class="os-chip">${art('wreck', 'os-ci')}<b>${done}/${s.finds.length}</b><small>${esc(T('finds'))}</small></span>${s.hits ? `<span class="os-chip bad">${art('storm', 'os-ci')}<b>${s.hits}×</b><small>−${pct} %</small></span>` : ''}`;
    let panel;
    if (sel) {
      const f = sel.storm ? null : s.finds.find(x => x.c === sel.c && x.r === sel.r && !x.done);
      const isDest = sel.c >= s.cols - 1;
      const can = isReach(sel.c, sel.r) || (isDest && destReach);
      let icon, name, text, extra = '';
      if (sel.storm) { icon = art('storm'); name = T('storm'); text = T('stormNext').replace('{p}', pct); }
      else if (isDest) { icon = destArt(); name = s.dest; text = T('destText').replace('{g}', D().cfg.arriveGold); }
      else if (f) { const K = D().kinds[f.k]; icon = findIcon(f); name = L(K.name); text = L(K.text);
        extra = `<span class="os-gain">${esc(L(GAIN[f.k]))}</span>${K.fight ? danger(run, K.fight) : ''}`; }
      else { icon = art('seaIcon'); name = T('water'); text = T('waterText'); }
      const away = !can && !sel.storm && sel.c > s.ship[0] ? sel.c - s.ship[0] : 0;
      const warn = can && stormNext(sel.c, sel.r) ? `<span class="os-warn">${art('bolt', 'os-bi')}${esc(T('stormNext').replace('{p}', pct))}</span>` : '';
      panel = `<div class="os-panel sel"><button class="pop-x os-x" data-act="sea-x" aria-label="Schließen"><span>✕</span></button>
        <span class="os-pi k-${f ? f.k : isDest ? 'dest' : 'x'}">${icon}</span>
        <span class="os-pt"><b>${esc(name)}</b><small>${esc(text)}</small><span class="os-pchips">${extra}${warn}${away ? `<span class="os-away">${away} ${en() ? (away === 1 ? 'move' : 'moves') : (away === 1 ? 'Zug' : 'Züge')} ${en() ? 'away' : 'entfernt'}</span>` : ''}</span></span>
        ${can ? `<button class="btn os-go" data-act="sea-go" data-c="${isDest ? s.cols - 1 : sel.c}" data-r="${isDest ? s.ship[1] : sel.r}">${esc(isDest ? T('land') : T('go'))}</button>` : ''}</div>`;
    } else {
      const dh = S.directHits(s);
      panel = `<div class="os-panel" lang="${en() ? 'en' : 'de'}"><span class="os-pt"><small class="os-hint">${esc(s.ship[0] === 0 ? T('hint') : T('hint2'))}</small><span class="os-pchips">${chips}</span></span>
        <button class="btn ghost os-direct" data-act="sea-direct">${esc(destReach ? T('land') : T('direct'))}${dh ? `<i class="os-dw" title="${esc(T('stormRoute'))}">${art('bolt', 'os-bi')}${dh > 1 ? '×' + dh : ''}</i>` : ''}</button></div>`;
    }
    if (!reduce) requestAnimationFrame(mount);
    return `${h && h.noticeBox ? h.noticeBox(run) : ''}<div class="os">
      <div class="os-head"><span class="os-kick">${art('seaIcon', 'os-ki')}${esc(T('kicker'))}</span><h2>${esc(T('title').replace('{d}', s.dest))}</h2>
        <button class="os-help" data-act="sea-help" aria-label="${esc(T('help'))}">?</button></div>
      <div class="os-frame"><div class="os-map${s.lastStorm === s.tick ? ' hit' : ''}">${seaArt(run.seed)}${o}</div></div>
      ${panel}
    </div>`;
  }
  // Bewegung nachspielen (FLIP): Schiff und Stürme starten auf ihrem alten Feld und gleiten ins neue
  function mount() {
    document.querySelectorAll('.os-map [data-from]:not([data-moved])').forEach(el => {
      el.dataset.moved = '1';
      const to = el.getAttribute('style');
      el.style.transition = 'none';
      el.setAttribute('style', el.dataset.from + ';transition:none');
      void el.offsetWidth;
      el.setAttribute('style', to);
      el.classList.add('moving');
      setTimeout(() => el.classList.remove('moving'), 750);
    });
  }

  function helpPop() {
    const g = D().cfg.arriveGold, p = Math.round(D().cfg.stormHurt * 100);
    const ico = [art('seaIcon'), art('wreck'), art('storm'), destArt()];
    return `<div class="fpop-card os-help-pop"><span class="event-kicker">${esc(T('kicker'))}</span><h3>${esc(T('help'))}</h3>
      <ul class="os-hl">${D().txt.helpLines.map((l, i) => `<li><i>${ico[i]}</i><span>${esc(L(l).replace('{p}', p).replace('{g}', g))}</span></li>`).join('')}</ul>
      <div class="fpop-btns"><button class="btn" data-act="pop-close">${esc(T('ok'))}</button></div></div>`;
  }

  function click(type, el, run) {
    if (!run || run.phase !== 'sea' || !run.sea) return null;
    const s = run.sea, key = run.seed + ':' + run.step;
    const c = Number(el.dataset.c), r = Number(el.dataset.r);
    if (type === 'sea-help') return { pop: helpPop() };
    if (type === 'sea-x') { sel = null; return null; }
    if (type === 'sea-direct') { sel = null; return { act: { type: 'sea', direct: true } }; }
    if (type === 'sea-go') { sel = null; return { act: { type: 'sea', c, r } }; }
    // sea-tap: leeres, sicheres Wasser in Reichweite → sofort segeln (wenig Tippen). Sonst erst das Info-Fenster.
    const storm = !!el.dataset.storm;
    const isDest = c >= s.cols - 1;
    const f = !storm && s.finds.find(x => x.c === c && x.r === r && !x.done);
    const can = GL.seaRun.canReach(s, isDest ? s.cols - 1 : c, r);
    const warn = GL.seaRun.stormsAfter(s, 1).some(x => x.c === c && x.r === r);
    if (!storm && !f && can && !isDest && !warn) { sel = null; return { act: { type: 'sea', c, r } }; }
    if (sel && sel.key === key && sel.c === c && sel.r === r && !!sel.storm === storm && can && !storm) { sel = null; return { act: { type: 'sea', c, r } }; }   // zweiter Tipp = segeln
    sel = { key, c, r, storm };
    return null;
  }

  GL.seaUi = { stage, click, icon: () => art('seaIcon', 'icon os-ico') };
})();
