// Offene See: Regeln (ohne Anzeige). Daten/Texte: js/data/opensea.js, Anzeige: js/ui/opensea.js
//
// Ein Ort der Routenkarte ('sea') öffnet eine kleine Seekarte: COLS Spalten × ROWS Reihen.
// Spalte 0 = Start, letzte Spalte = Ziel-Insel. Pro Zug segelt das Schiff eine Spalte weiter
// (Reihe ±1). Danach treiben die Stürme ein Feld weiter; wer mit einem Sturm auf demselben Feld
// endet, verliert Leben. Funde öffnen die bekannten Abläufe (Kampf, Schatz, Taverne, Ereignis),
// danach geht es mit run.phase = 'sea' auf der Karte weiter (Haken in run.js: advance + act).
//
// Aktionen (über GL.run.act, landen in run.actions, Replays rechnen alles gleich nach):
//   { type: 'sea', c, r }        ein Feld der nächsten Spalte ansteuern
//   { type: 'sea', direct: true } geradeaus bis zur Insel (Stürme treiben bei jedem Feld weiter)
// Zustand: run.sea = { open, cols, rows, ship: [c, r], path: [[c, r]], finds: [{ c, r, k, done }],
//                      storms: [{ c, r, dc, dr }], hits, found, dest }
window.GL = window.GL || {};

(function () {
  const R = GL.rng;
  const COLS = 6, ROWS = 4;
  const D = () => GL.data.openSea;

  // Ohne Zufallszug: liegt in diesem Insel-Kapitel eine Offene See? (Hash aus Seed + Kapitel)
  function hash(run, salt) {
    let h = (run.seed ^ Math.imul((salt + 1) | 0, 2246822519)) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 2654435761) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489917) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0);
  }
  // Wird von genChart aufgerufen: macht in der ersten Reihe (immer alle wählbar) einen gewöhnlichen Ort zur Offenen See
  function place(run, rows) {
    if (!D() || run.daily) return;
    const k = (run.loop || 0) * 16 + Math.floor(run.step / GL.config.chapterSteps);
    const h = hash(run, 7000 + k);
    if ((h % 1000) / 1000 >= D().cfg.chance) return;
    const row = rows[0];
    if (!row || rows.length < 3) return;
    const battles = row.filter(n => n.t === 'battle').length;
    // nie den einzigen Kampf der allerersten Etappe ersetzen
    const ok = row.map((n, i) => i).filter(i => ['recruit', 'fruit', 'treasure'].includes(row[i].t) || (row[i].t === 'battle' && (run.step > 0 || battles > 1)));
    if (!ok.length) return;
    const i = ok[(h >>> 10) % ok.length];
    row[i].t = 'sea';
  }

  function kindsFor(run) {
    const K = D().kinds, X = GL.run._x;
    const ch = X.islandIndex(run) * 2 + X.chapterIdx(run);
    return Object.keys(K).filter(k => !K[k].from || ch >= K[k].from - 1);
  }
  function pickWeighted(run, ids) {
    const K = D().kinds;
    let x = R.float(run) * ids.reduce((s, k) => s + K[k].w, 0);
    for (const k of ids) { x -= K[k].w; if (x < 0) return k; }
    return ids[ids.length - 1];
  }

  function start(run) {
    const C = D().cfg;
    // Funde in verschiedenen Spalten (1 … COLS-2), Stürme auf freien Feldern
    const cols = R.sample(run, [1, 2, 3, 4], C.finds).sort((a, b) => a - b);
    let pool = kindsFor(run);
    const finds = cols.map(c => {
      const k = pickWeighted(run, pool.length ? pool : kindsFor(run));
      pool = pool.filter(x => x !== k);
      return { c, r: R.int(run, 0, ROWS - 1), k, done: false };
    });
    const r0 = R.int(run, 1, ROWS - 2);
    const storms = [];
    for (let s = 0; s < C.storms; s++) {
      let c, r, g = 0;
      do { c = R.int(run, 2, COLS - 2); r = R.int(run, 0, ROWS - 1); g++; }
      while (g < 30 && (finds.some(f => f.c === c && f.r === r) || storms.some(x => x.c === c && x.r === r)));
      const dirs = [[0, 1], [0, -1], [-1, 0], [-1, 1], [-1, -1]];
      const d = dirs[R.int(run, 0, dirs.length - 1)];
      storms.push({ c, r, dc: d[0], dr: d[1] });
    }
    run.sea = { open: true, cols: COLS, rows: ROWS, ship: [0, r0], path: [[0, r0]], finds, storms, hits: 0, found: 0,
      dest: GL.run.stopName(run, GL.run.rowIdx(run) + 1), tick: 0 };
    run.phase = 'sea';
    run.pool = []; run.pending = null;
  }

  // Ein Sturm treibt ein Feld weiter und prallt an den Rändern ab (Start- und Zielspalte bleiben frei)
  function drift(st) {
    let c = st.c + st.dc, r = st.r + st.dr, dc = st.dc, dr = st.dr;
    if (c < 1 || c > COLS - 2) { dc = -dc; c = st.c + dc; }
    if (r < 0 || r > ROWS - 1) { dr = -dr; r = st.r + dr; }
    c = Math.max(1, Math.min(COLS - 2, c)); r = Math.max(0, Math.min(ROWS - 1, r));
    return { c, r, dc, dr };
  }
  const stormsAfter = (s, n) => { let list = s.storms; for (let i = 0; i < n; i++) list = list.map(drift); return list; };
  // Felder, die vom Schiff aus erreichbar sind (nächste Spalte, Reihe ±1; Zielinsel aus jeder Reihe)
  function reach(s) {
    const [c, r] = s.ship;
    if (c >= COLS - 1) return [];
    if (c + 1 === COLS - 1) return [[COLS - 1, r]];
    return [r - 1, r, r + 1].filter(y => y >= 0 && y < ROWS).map(y => [c + 1, y]);
  }
  const canReach = (s, c, r) => reach(s).some(p => p[0] === c && p[1] === r);
  // Vorschau „geradeaus zur Insel“: in welchen Zügen trifft ein Sturm?
  function directHits(s) {
    let list = s.storms, n = 0;
    for (let c = s.ship[0] + 1; c < COLS; c++) { list = list.map(drift); if (c < COLS - 1 && list.some(x => x.c === c && x.r === s.ship[1])) n++; }
    return n;
  }

  // Ein Zug: Schiff setzen, Stürme treiben lassen, Treffer prüfen. Gibt den Fund zurück (oder null).
  function step(run, c, r, lines) {
    const s = run.sea, C = D().cfg;
    s.ship = [c, r]; s.path.push([c, r]); s.tick++;
    s.prev = s.storms.map(x => ({ c: x.c, r: x.r }));   // nur für die Gleit-Animation
    s.storms = s.storms.map(drift);
    if (c < COLS - 1 && s.storms.some(x => x.c === c && x.r === r)) {
      s.hits++;
      run.crew.forEach(u => { if (u.hp > 0) u.hp = Math.max(1, u.hp - Math.ceil(u.max * C.stormHurt)); });
      lines.push(`Crew verliert ${Math.round(C.stormHurt * 100)} % Leben`);
      s.lastStorm = s.tick;
    }
    return s.finds.find(f => f.c === c && f.r === r && !f.done) || null;
  }

  function arrive(run, lines) {
    const s = run.sea, C = D().cfg, X = GL.run._x;
    s.open = false;
    run.gold = (run.gold || 0) + C.arriveGold;
    lines.push(`+${C.arriveGold} Gold`);
    X.dropItem(run, C.dropBase + C.dropPer * s.found);
    const T = D().txt;
    run.notice = { title: T.arriveTitle, text: s.found || s.hits ? T.arriveText.map(t => t.replace('{f}', s.found).replace('{s}', s.hits)) : T.arriveCalm, lines: (run.notice && run.notice.lines || []).concat(lines) };
    run.seaDone = { found: s.found, hits: s.hits };
    run.sea = null;
    X.advance(run);
  }

  // Fund öffnen: bekannte Abläufe der Engine. Danach führt advance() (Haken) zurück auf die Seekarte.
  function openFind(run, f) {
    const X = GL.run._x, K = D().kinds[f.k];
    f.done = true; run.sea.found++;
    if (K.fight) {
      run.pending = { kind: K.fight, who: null, gate: false, sea: f.k, enemies: X.makeEnemies(run, K.fight, null, false) };
      run.phase = 'prep';
    } else if (f.k === 'wreck') {
      X.openTreasure(run);
    } else if (f.k === 'merchant') {
      X.openShop(run);
    } else {
      const ev = GL.data.events[R.int(run, 0, GL.data.events.length - 1)];
      run.event = { id: ev.id };
      run.phase = 'event';
    }
  }

  function act(run, a) {
    const s = run.sea;
    if (run.phase !== 'sea' || !s || !s.open) return false;
    const lines = [];
    run.notice = null;
    if (a.direct) {
      const r = s.ship[1];
      while (s.ship[0] < COLS - 1) step(run, s.ship[0] + 1, r, lines);   // Funde unterwegs bleiben liegen
      if (lines.length) run.notice = { title: D().txt.storm, text: D().txt.stormHit.map(t => t.replace('{p}', Math.round(D().cfg.stormHurt * 100))), lines: lines.splice(0) };
      arrive(run, lines);
      return true;
    }
    const c = a.c | 0, r = a.r | 0;
    if (!canReach(s, c, r)) return false;
    const f = step(run, c, r, lines);
    if (lines.length) run.notice = { title: D().txt.storm, text: D().txt.stormHit.map(t => t.replace('{p}', Math.round(D().cfg.stormHurt * 100))), lines: lines.splice(0) };
    if (c >= COLS - 1) { arrive(run, lines); return true; }
    if (f) openFind(run, f);
    return true;
  }

  GL.seaRun = { place, start, act, reach, canReach, stormsAfter, directHits, drift, COLS, ROWS };
})();
