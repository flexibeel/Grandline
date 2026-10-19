// DUNGEON-SUCHE: Regeln der Seekarte der Gerüchte (ohne Anzeige). Daten/Texte: js/data/seekarte.js
//
// Läuft im Hauptquartier, nicht im Run (Math.random reicht, wie beim Landgang).
// Zustand im Profil (wird mit dem Profil gespeichert, auch in der Cloud, siehe meta.mergeProfiles):
//   profile.sk = { v, fog: '0101…' (cols*rows, 1 = erkundet), found: [ids], seen: [ids gesichtet],
//                  trip: { ship: [c, r], prev, prov, finds: [{ c, r, k, done }], tav, last, comp, msg } }
// Ein Ort kann gefunden werden, sobald der Landgang nach den alten Regeln frei wäre (Insel besucht / Run gewonnen).
// Gefunden ist er, wenn das Schiff direkt neben ihm anhält. Danach startet er den Landgang wie gewohnt.
// Gesperrte Orte sieht man als dunkle Silhouette („noch zu gefährlich“), finden kann man sie erst später.
window.GL = window.GL || {};

(function () {
  const D = () => GL.data.seekarte;
  const C = () => D().cfg;
  const N = () => C().cols * C().rows;
  const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const en = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const L = v => (Array.isArray(v) ? v[en() ? 1 : 0] : v);
  const TX = k => L(D().txt[k]);
  const dgs = () => (GL.data.dungeons || []).filter(d => D().spots[d.id]);
  const dg = id => dgs().find(d => d.id === id) || null;
  const spot = id => D().spots[id];
  const inside = (c, r) => c >= 0 && r >= 0 && c < C().cols && r < C().rows;
  const region = (c, r) => D().regions[(D().map[r] || '')[c]] || D().regions.B;
  // Felder, auf denen man nicht anhalten kann: Landgang-Inseln und Deko-Inseln
  function blocked(c, r) {
    return Object.values(D().spots).some(p => p[0] === c && p[1] === r) || (D().isles || []).some(p => p[0] === c && p[1] === r);
  }

  // Gerücht = Landgang wäre nach den alten Regeln offen
  function rumoured(profile, d) {
    const n = d.need || {};
    if (n.wins) return ((profile.stats && profile.stats.wins) || 0) >= n.wins;
    const seen = (profile.seen && profile.seen.islands) || [];
    return (n.isl || []).some(id => seen.includes(id));
  }

  function fogReveal(s, c, r, rad) {
    const a = s.fog.split('');
    for (let y = r - rad; y <= r + rad; y++) for (let x = c - rad; x <= c + rad; x++) if (inside(x, y)) a[y * C().cols + x] = '1';
    s.fog = a.join('');
  }
  const clear = (s, c, r) => s.fog[r * C().cols + c] === '1';

  // Einmalig beim Laden (main.js): Bestehende Spieler bekommen alles, was schon offen oder gemeistert ist, als „gefunden“.
  // Neue Spieler haben noch keine Gerüchte, für sie startet die Karte leer.
  function migrate(profile) {
    if (!profile || (profile.sk && profile.sk.v)) return false;
    const s = profile.sk = { v: 1, fog: '0'.repeat(N()), found: [], seen: [], trip: null };
    fogReveal(s, C().home[0], C().home[1], 1);
    dgs().forEach(d => {
      const st = profile.dungeons && profile.dungeons[d.id];
      if (rumoured(profile, d) || (st && st.clears)) { s.found.push(d.id); const p = spot(d.id); fogReveal(s, p[0], p[1], 1); }
    });
    s.migrated = s.found.length;
    newTrip(profile);
    return true;
  }
  function state(profile) {
    migrate(profile);
    const s = profile.sk;
    if (typeof s.fog !== 'string' || s.fog.length !== N()) s.fog = String(s.fog || '').padEnd(N(), '0').slice(0, N());
    fogReveal(s, C().home[0], C().home[1], 1);
    s.found = s.found || []; s.seen = s.seen || [];
    if (!s.trip || !Array.isArray(s.trip.ship)) newTrip(profile);
    // Erstes Gerücht kam dazu, während das Schiff unberührt im Hafen lag: Fahrt neu auslegen (mit Flaschenpost am Hafen)
    const t = s.trip;
    if (!s.found.length && t.prov === C().prov && !t.prev && !t.finds.some(f => f.k === 'bottle' && dist([f.c, f.r], C().home) === 1) && hidden(profile).length) newTrip(profile);
    return s;
  }
  const known = (profile, id) => !!(profile.sk && (profile.sk.found || []).includes(id));
  // Noch zu findende Orte (Gerücht ja, gefunden nein)
  const hidden = profile => dgs().filter(d => rumoured(profile, d) && !known(profile, d.id));
  // Status eines Orts: found | hidden | locked
  const status = (profile, d) => (known(profile, d.id) ? 'found' : rumoured(profile, d) ? 'hidden' : 'locked');

  // Neue Fahrt: Proviant voll, Schiff im Hafen, frisches Treibgut
  function newTrip(profile) {
    const s = profile.sk, cfg = C();
    const free = [];
    for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) if (!blocked(c, r) && dist([c, r], cfg.home) >= 1) free.push([c, r]);
    const takeAt = p => { const i = free.findIndex(q => q[0] === p[0] && q[1] === p[1]); if (i >= 0) free.splice(i, 1); };
    const K = D().kinds, ids = Object.keys(K), finds = [];
    const weighted = () => { let x = Math.random() * ids.reduce((a, k) => a + K[k].w, 0); for (const k of ids) { x -= K[k].w; if (x < 0) return k; } return ids[0]; };
    // Solange noch nichts gefunden ist: eine Flaschenpost gleich vor dem Hafen, die zum nächsten Ort zeigt
    if (hidden(profile).length && !s.found.length) {
      const near = free.filter(p => dist(p, cfg.home) === 1);
      const p = near.length ? pick(near) : null;
      if (p) { takeAt(p); finds.push({ c: p[0], r: p[1], k: 'bottle', done: false }); }
    }
    // Rest des Treibguts nicht direkt am Hafen, damit sich das Rausfahren lohnt
    const far = () => free.filter(p => dist(p, cfg.home) >= 2);
    while (finds.length < cfg.finds + 1 && far().length) {
      const p = pick(far());
      takeAt(p);
      let k = weighted();
      if (k === 'storm' && finds.some(f => f.k === 'storm')) k = 'crate';
      finds.push({ c: p[0], r: p[1], k, done: false });
    }
    s.trip = { ship: cfg.home.slice(), prev: null, prov: cfg.prov, finds, tav: false, last: null, comp: null, msg: null, n: (s.trip && s.trip.n || 0) + 1 };
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
    const t = profile.sk && profile.sk.trip;
    if (!t || t.prov <= 0 || !inside(c, r) || blocked(c, r)) return false;
    const k = dist([c, r], t.ship);
    return k >= 1 && k <= C().reach;
  }
  function reach(profile) {
    const out = [], t = profile.sk.trip;
    for (let r = t.ship[1] - C().reach; r <= t.ship[1] + C().reach; r++) for (let c = t.ship[0] - C().reach; c <= t.ship[0] + C().reach; c++) if (canReach(profile, c, r)) out.push([c, r]);
    return out;
  }

  // Richtung und Entfernung als Gerücht-Text
  function dirWord(from, to) {
    const dx = to[0] - from[0], dy = to[1] - from[1];
    const v = Math.abs(dy) * 2 < Math.abs(dx) ? '' : dy < 0 ? 'n' : 's';
    const h = Math.abs(dx) * 2 < Math.abs(dy) ? '' : dx > 0 ? 'o' : 'w';
    return (v + h) || 'o';
  }
  const dname = d => (GL.i18n && GL.i18n.t ? GL.i18n.t(d.name) : d.name);
  function rumourText(from, d, pool) {
    const to = spot(d.id), k = dist(from, to);
    const far = D().far[k <= 2 ? 0 : k <= 4 ? 1 : 2];
    return L(pick(pool)).replace('{d}', L(D().dirs[dirWord(from, to)])).replace('{f}', L(far)).replace('{p}', dname(d));
  }
  const see = (s, id) => { if (!s.seen.includes(id)) s.seen.push(id); };

  // Ereignis auf See (friedlich). Gebiet macht manche wahrscheinlicher.
  function seaEvent(profile, out) {
    const s = profile.sk, t = s.trip, E = D().events, reg = (D().map[t.ship[1]] || '')[t.ship[0]];
    const ids = Object.keys(E);
    const w = k => E[k].w * (E[k].more === reg ? 3 : 1);
    let x = Math.random() * ids.reduce((a, k) => a + w(k), 0), id = ids[0];
    for (const k of ids) { x -= w(k); if (x < 0) { id = k; break; } }
    const ev = { id, lines: [L(E[id].text)] };
    if (id === 'delfine') t.prov = Math.min(C().prov, t.prov + 1);
    if (id === 'seekoenig') { const b = 20 + Math.floor(Math.random() * 20); profile.berry = (profile.berry || 0) + b; ev.lines.push(TX('berry').replace('{n}', b)); }
    if (id === 'moewe') {
      const n = nearest(profile, t.ship);
      if (n) { ev.lines.push(rumourText(t.ship, n.d, D().letters)); if (n.k <= 3) see(s, n.d.id); ev.about = n.d.id; }
      else { const b = 8; profile.berry = (profile.berry || 0) + b; ev.lines.push(TX('berry').replace('{n}', b)); }
    }
    if (id === 'strudel') {
      const opts = [];
      for (let r = t.ship[1] - 2; r <= t.ship[1] + 2; r++) for (let c = t.ship[0] - 2; c <= t.ship[0] + 2; c++) if (inside(c, r) && !blocked(c, r) && dist([c, r], t.ship) === 2 && !t.finds.some(f => f.c === c && f.r === r && !f.done)) opts.push([c, r]);
      if (opts.length) { const p = pick(opts); t.prev = t.ship.slice(); t.ship = p; fogReveal(s, p[0], p[1], 1); }
    }
    out.event = ev;
  }

  // Ein Zug. Ergebnis: { found: [ids], find, event, compass }
  function move(profile, c, r) {
    const s = state(profile), t = s.trip;
    if (!canReach(profile, c, r)) return null;
    const from = t.ship.slice();
    const steps = dist(from, [c, r]);
    for (let i = 1; i <= steps; i++) fogReveal(s, Math.round(from[0] + (c - from[0]) * i / steps), Math.round(from[1] + (r - from[1]) * i / steps), 1);
    t.prev = from; t.ship = [c, r];
    t.prov = Math.max(0, t.prov - 1);
    const out = { found: [], find: null, event: null };
    const f = t.finds.find(x => x.c === c && x.r === r && !x.done);
    if (f) { out.find = useFind(profile, f); if (f.k === 'storm') t.prov = Math.max(0, t.prov - 1); }
    else if (Math.random() < C().event && t.n > 1) seaEvent(profile, out);
    // Orte direkt nebenan gefunden (auch nach einem Strudel)
    hidden(profile).forEach(d => { const p = spot(d.id); if (dist(p, t.ship) <= 1) { s.found.push(d.id); see(s, d.id); out.found.push(d.id); fogReveal(s, p[0], p[1], 1); } });
    // Gesperrte Orte in der Nähe: sichtbar machen (Silhouette)
    dgs().forEach(d => { if (dist(spot(d.id), t.ship) <= 1) see(s, d.id); });
    const now = nearestDist(profile, t.ship);
    out.compass = now == null ? 'done' : now <= 2 ? 'hot' : t.last == null ? 'idle' : now < t.last ? 'warm' : now > t.last ? 'cold' : 'same';
    t.last = now; t.comp = out.compass;
    t.msg = out.found.length ? { k: 'found', id: out.found[0] } : out.find ? { k: 'find', f: out.find } : out.event ? { k: 'event', e: out.event } : t.prov <= 0 ? { k: 'out' } : null;
    return out;
  }
  function useFind(profile, f) {
    const s = profile.sk, t = s.trip;
    f.done = true;
    const res = { k: f.k, lines: [] };
    const hid = hidden(profile);
    if (f.k === 'bottle') {
      const b = 5 + Math.floor(Math.random() * 10);
      profile.berry = (profile.berry || 0) + b;
      const n = nearest(profile, t.ship);
      if (n) { res.lines.push(rumourText(t.ship, n.d, D().letters)); if (!s.found.length || n.k <= 3) see(s, n.d.id); res.about = n.d.id; }
      res.lines.push(TX('berry').replace('{n}', b));
    } else if (f.k === 'wreck') {
      const unseen = hid.filter(d => !s.seen.includes(d.id));
      const d = unseen.length ? pick(unseen) : hid.length ? pick(hid) : null;
      if (d) { see(s, d.id); res.lines.push(TX('scrap')); res.about = d.id; }
      else { const b = 15 + Math.floor(Math.random() * 15); profile.berry = (profile.berry || 0) + b; res.lines.push(TX('scrapNone'), TX('berry').replace('{n}', b)); }
    } else if (f.k === 'crate') {
      if (Math.random() < 0.3) { profile.shards = (profile.shards || 0) + 1; res.lines.push('+1 ' + TX('lootShards')); }
      else { const b = 12 + Math.floor(Math.random() * 20); profile.berry = (profile.berry || 0) + b; res.lines.push(TX('berry').replace('{n}', b)); }
    } else if (f.k === 'storm') res.lines.push(TX('stormHit'));
    return res;
  }
  // Taverne im Hafen: ein Gerücht pro Fahrt (zeigt die Silhouette des nächsten Orts)
  function tavern(profile) {
    const s = state(profile), t = s.trip;
    if (t.tav) return { already: true };
    const n = nearest(profile, C().home);
    if (!n) return { none: true };
    t.tav = true;
    see(s, n.d.id);
    const res = { text: rumourText(C().home, n.d, D().rumours), about: n.d.id };
    t.msg = { k: 'tavern', text: res.text };
    return res;
  }
  function home(profile) { state(profile); const t = newTrip(profile); t.msg = { k: 'home' }; return t; }
  // Für meta.mergeProfiles: zwei Stände zusammenführen (gefundene Orte vereinen, Nebel nur lichten)
  function merge(a, b) {
    if (!a || !a.v) return b ? JSON.parse(JSON.stringify(b)) : a;
    if (!b || !b.v) return a;
    const u = (x, y) => Array.from(new Set([].concat(x || [], y || [])));
    const fa = String(a.fog || ''), fb = String(b.fog || ''), n = Math.max(fa.length, fb.length);
    let fog = '';
    for (let i = 0; i < n; i++) fog += fa[i] === '1' || fb[i] === '1' ? '1' : '0';
    return Object.assign({}, a, { fog, found: u(a.found, b.found), seen: u(a.seen, b.seen) });
  }

  // Ein Stand ohne Seekarte (alter Spielstand, z. B. aus der Cloud) wird mit einem neuen zusammengeführt:
  // alles, was dort schon offen oder gemeistert war, gilt als gefunden (wie bei migrate).
  function adopt(profile) {
    if (!profile || !profile.sk || !profile.sk.v) return;
    const s = profile.sk;
    if (typeof s.fog !== 'string' || s.fog.length !== N()) s.fog = String(s.fog || '').padEnd(N(), '0').slice(0, N());
    s.found = s.found || [];
    dgs().forEach(d => {
      const st = profile.dungeons && profile.dungeons[d.id];
      if ((rumoured(profile, d) || (st && st.clears)) && !s.found.includes(d.id)) { s.found.push(d.id); const p = spot(d.id); fogReveal(s, p[0], p[1], 1); }
    });
  }

  GL.seekarte = { migrate, adopt, state, known, hidden, status, rumoured, move, tavern, home, canReach, reach, spot, dist, dgs, dg, clear, nearest, region, blocked, merge,
    foundCount: profile => dgs().filter(d => known(profile, d.id)).length,
    // Für dungeon.js: darf dieser Ort per Landgang betreten werden? (Orte ohne Platz auf der Karte: wie früher)
    allowed: (profile, id) => { migrate(profile); return !D().spots[id] || known(profile, id); } };
})();
