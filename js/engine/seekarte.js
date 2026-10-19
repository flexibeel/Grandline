// DUNGEON-SUCHE: Regeln der Seekarte der Gerüchte (ohne Anzeige). Daten/Texte: js/data/seekarte.js
//
// Läuft im Hauptquartier, nicht im Run (Math.random reicht, wie beim Landgang).
// Zustand im Profil (wird mit dem Profil gespeichert, auch in der Cloud):
//   profile.sk = { v, fog: '0101…' (cols*rows, 1 = erkundet), found: [ids], seen: [ids gesichtet],
//                  trip: { ship: [c, r], prov, finds: [{ c, r, k, done, about }], tav, last } }
// Ein Ort ist auf der Karte versteckt, sobald der Landgang nach den alten Regeln frei wäre („Gerücht“).
// Gefunden ist er, wenn das Schiff auf oder neben seinem Feld anhält. Danach startet er den Landgang wie gewohnt.
window.GL = window.GL || {};

(function () {
  const D = () => GL.data.seekarte;
  const C = () => D().cfg;
  const N = () => C().cols * C().rows;
  const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const dgs = () => (GL.data.dungeons || []).filter(d => D().spots[d.id]);
  const dg = id => dgs().find(d => d.id === id) || null;
  const spot = id => D().spots[id];

  // Gerücht = Landgang wäre nach den alten Regeln offen (Insel besucht / Run gewonnen)
  function rumoured(profile, d) {
    const n = d.need || {};
    if (n.wins) return ((profile.stats && profile.stats.wins) || 0) >= n.wins;
    const seen = (profile.seen && profile.seen.islands) || [];
    return (n.isl || []).some(id => seen.includes(id));
  }

  function fogReveal(s, c, r, rad) {
    const a = s.fog.split('');
    for (let y = r - rad; y <= r + rad; y++) for (let x = c - rad; x <= c + rad; x++) {
      if (x >= 0 && y >= 0 && x < C().cols && y < C().rows) a[y * C().cols + x] = '1';
    }
    s.fog = a.join('');
  }
  const clear = (s, c, r) => s.fog[r * C().cols + c] === '1';

  // Bestehende Spieler: alles, was schon offen ist (oder schon gemeistert), gilt als gefunden.
  function migrate(profile) {
    if (profile.sk && profile.sk.v) return false;
    const s = profile.sk = { v: 1, fog: '0'.repeat(N()), found: [], seen: [], trip: null };
    fogReveal(s, C().home[0], C().home[1], 1);
    dgs().forEach(d => {
      const st = profile.dungeons && profile.dungeons[d.id];
      if (rumoured(profile, d) || (st && st.clears)) { s.found.push(d.id); const p = spot(d.id); fogReveal(s, p[0], p[1], 1); }
    });
    s.migrated = s.found.length;
    return true;
  }
  function state(profile) {
    migrate(profile);
    const s = profile.sk;
    if (!s.fog || s.fog.length !== N()) s.fog = (s.fog || '').padEnd(N(), '0').slice(0, N());
    s.found = s.found || []; s.seen = s.seen || [];
    if (!s.trip) newTrip(profile);
    return s;
  }
  const known = (profile, id) => !!(profile.sk && (profile.sk.found || []).includes(id));
  // Noch zu findende Orte (Gerücht ja, gefunden nein)
  const hidden = profile => dgs().filter(d => rumoured(profile, d) && !known(profile, d.id));

  // Neue Fahrt: Proviant voll, Schiff im Hafen, frisches Treibgut
  function newTrip(profile) {
    const s = profile.sk, cfg = C();
    const taken = new Set([cfg.home.join(',')].concat(Object.values(D().spots).map(p => p.join(','))));
    const free = [];
    for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) if (!taken.has(c + ',' + r) && dist([c, r], cfg.home) >= 1) free.push([c, r]);
    const K = D().kinds, ids = Object.keys(K), finds = [];
    const weighted = () => { let x = Math.random() * ids.reduce((a, k) => a + K[k].w, 0); for (const k of ids) { x -= K[k].w; if (x < 0) return k; } return ids[0]; };
    const hid = hidden(profile);
    // Erste Suche: eine Flaschenpost gleich vor dem Hafen, die zum nächsten Ort zeigt
    if (hid.length && !s.found.length) {
      const near = free.filter(p => dist(p, cfg.home) === 1);
      const p = near.length ? near.splice(Math.floor(Math.random() * near.length), 1)[0] : null;
      if (p) { free.splice(free.findIndex(q => q[0] === p[0] && q[1] === p[1]), 1); finds.push({ c: p[0], r: p[1], k: 'bottle', done: false }); }
    }
    while (finds.length < cfg.finds + 1 && free.length) {
      const p = free.splice(Math.floor(Math.random() * free.length), 1)[0];
      let k = weighted();
      if (k === 'storm' && finds.some(f => f.k === 'storm')) k = 'crate';
      finds.push({ c: p[0], r: p[1], k, done: false });
    }
    s.trip = { ship: cfg.home.slice(), prov: cfg.prov, finds, tav: false, last: null, comp: null, msg: null };
    s.trip.last = nearestDist(profile, s.trip.ship);
    return s.trip;
  }
  function nearest(profile, from) {
    let best = null;
    hidden(profile).forEach(d => { const k = dist(spot(d.id), from); if (!best || k < best.k) best = { d, k }; });
    return best;
  }
  const nearestDist = (profile, from) => { const n = nearest(profile, from); return n ? n.k : null; };

  function canReach(profile, c, r) {
    const s = profile.sk, t = s.trip;
    if (!t || t.prov <= 0) return false;
    if (c < 0 || r < 0 || c >= C().cols || r >= C().rows) return false;
    const k = dist([c, r], t.ship);
    return k >= 1 && k <= C().reach;
  }

  // Richtung und Entfernung als Gerücht-Text
  function dirWord(from, to) {
    const dx = to[0] - from[0], dy = to[1] - from[1];
    const v = Math.abs(dy) * 2 < Math.abs(dx) ? '' : dy < 0 ? 'n' : 's';
    const h = Math.abs(dx) * 2 < Math.abs(dy) ? '' : dx > 0 ? 'o' : 'w';
    return (v + h) || 'o';
  }
  function rumourText(from, d, pool) {
    const L = v => (GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en' ? v[1] : v[0]);
    const to = spot(d.id), k = dist(from, to);
    const far = D().far[k <= 2 ? 0 : k <= 4 ? 1 : 2];
    const name = GL.i18n && GL.i18n.t ? GL.i18n.t(d.name) : d.name;
    return L(pick(pool)).replace('{d}', L(D().dirs[dirWord(from, to)])).replace('{f}', L(far)).replace('{p}', name);
  }

  // Ergebnis eines Zugs: { found: [ids], find: {k, msg}, storm, compass }
  function move(profile, c, r) {
    const s = state(profile), t = s.trip;
    if (!canReach(profile, c, r)) return null;
    const from = t.ship.slice();
    // Nebel entlang des Weges lichten
    const steps = dist(from, [c, r]);
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(from[0] + (c - from[0]) * i / steps), y = Math.round(from[1] + (r - from[1]) * i / steps);
      fogReveal(s, x, y, 1);
    }
    t.ship = [c, r];
    t.prov = Math.max(0, t.prov - 1);
    const out = { found: [], find: null, storm: false };
    // Treibgut am Zielfeld
    const f = t.finds.find(x => x.c === c && x.r === r && !x.done);
    if (f) out.find = useFind(profile, f);
    if (f && f.k === 'storm') { out.storm = true; t.prov = Math.max(0, t.prov - 1); }
    // Orte in Reichweite 1 gefunden
    hidden(profile).forEach(d => { if (dist(spot(d.id), [c, r]) <= 1) { s.found.push(d.id); out.found.push(d.id); const p = spot(d.id); fogReveal(s, p[0], p[1], 1); } });
    // Kompass: wärmer / kälter
    const now = nearestDist(profile, t.ship);
    out.compass = now == null ? 'done' : now <= 2 ? 'hot' : t.last == null ? 'idle' : now < t.last ? 'warm' : now > t.last ? 'cold' : 'same';
    t.last = now; t.comp = out.compass;
    t.msg = null;
    return out;
  }
  function useFind(profile, f) {
    const s = profile.sk, t = s.trip, en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
    const T = k => D().txt[k][en ? 1 : 0];
    f.done = true;
    const res = { k: f.k, lines: [] };
    const hid = hidden(profile);
    if (f.k === 'bottle') {
      const b = 5 + Math.floor(Math.random() * 10);
      profile.berry = (profile.berry || 0) + b; res.lines.push(T('berry').replace('{n}', b));
      const n = nearest(profile, t.ship);
      if (n) { res.lines.unshift(rumourText(t.ship, n.d, D().letters)); if (!s.found.length && !s.seen.includes(n.d.id)) s.seen.push(n.d.id); res.about = n.d.id; }
    } else if (f.k === 'wreck') {
      const unseen = hid.filter(d => !s.seen.includes(d.id));
      const d = unseen.length ? pick(unseen) : hid.length ? pick(hid) : null;
      if (d) { const p = spot(d.id); fogReveal(s, p[0], p[1], 1); if (!s.seen.includes(d.id)) s.seen.push(d.id); res.lines.push(T('scrap')); res.about = d.id; }
      else { const b = 15 + Math.floor(Math.random() * 15); profile.berry = (profile.berry || 0) + b; res.lines.push(T('scrapNone'), T('berry').replace('{n}', b)); }
    } else if (f.k === 'crate') {
      if (Math.random() < 0.3) { profile.shards = (profile.shards || 0) + 1; res.lines.push('+1 ' + T('lootShards')); }
      else { const b = 12 + Math.floor(Math.random() * 20); profile.berry = (profile.berry || 0) + b; res.lines.push(T('berry').replace('{n}', b)); }
    } else if (f.k === 'storm') {
      res.lines.push(T('stormHit'));
    }
    return res;
  }
  // Taverne im Hafen: ein Gerücht pro Fahrt. Wer noch nichts gefunden hat, bekommt das Kreuz gleich mit.
  function tavern(profile) {
    const s = state(profile), t = s.trip;
    if (t.tav) return { already: true };
    const n = nearest(profile, C().home);
    if (!n) return { none: true };
    t.tav = true;
    if (!s.found.length || n.k <= 2) { if (!s.seen.includes(n.d.id)) s.seen.push(n.d.id); }
    return { text: rumourText(C().home, n.d, D().rumours), about: n.d.id };
  }
  function home(profile) { state(profile); return newTrip(profile); }

  GL.seekarte = { migrate, state, known, hidden, rumoured, move, tavern, home, canReach, spot, dist, dgs, dg, clear, nearest,
    // Für dungeon.js: darf dieser Ort per Landgang betreten werden? (ohne Seekarte: wie früher)
    allowed: (profile, id) => !D().spots[id] || known(profile, id) };
})();
