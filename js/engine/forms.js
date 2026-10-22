// Figurenreise: Erinnerungsstücke sammeln, Story-Formen freischalten (Daten: js/data/forms.js).
//   profile.forms = { mem: { id: Anzahl }, lvl: { id: Form-Stufe } }
//   Eine Form braucht: Story-Boss einmal besiegt (profile.seen.bosses) + genug Stücke. Die Stücke werden verbraucht.
//   Im Run wirkt die Stufe über run.start.forms (Replay-sicher): Leben und Angriff je Form +10 %.
//   Stil-Dojo: Bernstein aus dem Kontor gegen Stücke für eine Figur des Tagesstils (Minispiel in js/ui/dojo.js).
window.GL = window.GL || {};

(function () {
  const D = () => GL.data.forms || {};
  const C = () => GL.data.formConf || { bonus: 0.1, dojoCost: 20, dojoGain: [1, 3, 5], landgangChance: 0.25 };
  const num = v => Math.max(0, Math.floor(Number(v) || 0));

  function state(p) {
    const f = p.forms = p.forms && typeof p.forms === 'object' ? p.forms : {};
    f.mem = f.mem && typeof f.mem === 'object' ? f.mem : {};
    f.lvl = f.lvl && typeof f.lvl === 'object' ? f.lvl : {};
    return f;
  }
  const has = id => !!D()[id];
  const mem = (p, id) => num(state(p).mem[id]);
  const level = (p, id) => Math.min(((D()[id] || {}).forms || []).length, num(state(p).lvl[id]));
  const beaten = (p, boss) => ((p.seen && p.seen.bosses) || []).includes(boss);
  const known = (p, id) => (GL.config.starters || []).includes(id) || (p.unlocked || []).includes(id) || ((p.seen && p.seen.crew) || []).includes(id);

  // Nächste Form mit Stand: { f, i, bossOk, memOk, ok }
  function next(p, id) {
    const d = D()[id]; if (!d) return null;
    const i = level(p, id), f = d.forms[i];
    if (!f) return null;
    const bossOk = beaten(p, f.boss), memOk = mem(p, id) >= f.need;
    return { f, i, bossOk, memOk, ok: bossOk && memOk };
  }
  function add(p, id, n) {
    if (!has(id) || !(n > 0)) return 0;
    const s = state(p);
    s.mem[id] = mem(p, id) + n;
    return n;
  }
  // Aufsteigen: verbraucht die Stücke, gibt die neue Form zurück
  function up(p, id) {
    const nx = next(p, id);
    if (!nx || !nx.ok) return null;
    const s = state(p);
    s.mem[id] = mem(p, id) - nx.f.need;
    s.lvl[id] = nx.i + 1;
    sync(p);
    return nx.f;
  }
  const bossName = id => { const b = (GL.data.bosses || []).find(x => x.id === id); return b ? b.name : id; };
  const title = (p, id) => { const l = level(p, id); return l ? D()[id].forms[l - 1].title : null; };

  // Für die Pixel-Figuren: Stufen des aktuellen Profils (wie GL.mastery.alt)
  let lv = {};
  function sync(p) { lv = Object.assign({}, state(p).lvl); return p; }
  function lookOf(id) {
    const l = num(lv[id]), d = D()[id];
    if (!l || !d) return null;
    const look = (d.forms[Math.min(l, d.forms.length) - 1] || {}).look || {};
    return Object.keys(look).length ? look : null;
  }

  // Für den Run-Start: nur Figuren mit Form
  function startMap(p) {
    const out = {};
    Object.keys(state(p).lvl).forEach(id => { const l = level(p, id); if (l && has(id)) out[id] = l; });
    return out;
  }
  // Werte im Run (run.js makeMember)
  function boost(run, m) {
    const F = run && run.start && run.start.forms, l = F ? num(F[m.id]) : 0;
    if (!l) return m;
    const k = 1 + C().bonus * l;
    const max = Math.round(m.max * k);
    m.hp = Math.round(m.hp * (max / Math.max(1, m.max)));
    m.max = max;
    m.atk = Math.max(m.atk + l, Math.round(m.atk * k));
    m.form = l;
    return m;
  }

  // ---------- Stil-Dojo ----------
  const dayStyle = () => (GL.data.dojoDays || [])[new Date().getDay()] || 'alle';
  function dojoFigs(p) {
    const st = dayStyle();
    return Object.keys(D()).filter(id => {
      const c = (GL.data.crew || []).find(x => x.id === id);
      return c && known(p, id) && (st === 'alle' || c.type === st);
    });
  }
  const amber = p => (GL.kontor ? GL.kontor.state(p).amber + GL.kontor.pending(p) : 0);
  function dojoPay(p) {
    if (!GL.kontor || amber(p) < C().dojoCost) return false;
    GL.kontor.collect(p);
    const k = GL.kontor.state(p);
    if (k.amber < C().dojoCost) return false;
    k.amber -= C().dojoCost;
    p.counts = p.counts || {};
    p.counts.dojo = (p.counts.dojo || 0) + 1;
    return true;
  }
  // grade: 0 schlecht, 1 mittel, 2 gut
  function dojoReward(p, id, grade) {
    const g = C().dojoGain[Math.max(0, Math.min(2, grade | 0))] || 1;
    return add(p, id, g);
  }

  // ---------- Landgang: ab und zu ein Stück für jemanden aus der Stammcrew ----------
  function landgangDrop(p, ids) {
    const pool = (ids || []).filter(has);
    if (!pool.length || Math.random() >= C().landgangChance) return null;
    const id = pool[Math.floor(Math.random() * pool.length)];
    add(p, id, 1);
    return id;
  }

  GL.forms = { state, has, mem, level, next, add, up, title, bossName, sync, lookOf, startMap, boost, known,
    dayStyle, dojoFigs, dojoPay, dojoReward, amber, landgangDrop, conf: C };
})();
