// F0 Weltgedächtnis (claude/PLAN-FOLGEN.md Abschnitt 3): Die Welt merkt sich über Fahrten hinweg, was du getan hast.
// profile.world = {
//   bekannte: { folgenId: { ende, mal, wo } },   // wie eine Folge ausging (ende = Flag der Variante oder 'neutral')
//   orte:     { inselId:  { tat, mal } },        // was an einem Ort passiert ist (ab F1/4A)
//   ruf:      { fraktion: Zahl -3..3 },          // Ruf (ab F4)
//   taten:    ['id', ...]                        // einmalige Taten
// }
// Replay-Regel: Die Fahrt liest nur die Kopie run.start.world (beim Ablegen gezogen). Was in der Fahrt passiert,
// sammelt run.merk und wird erst nach finishRun ins Profil geschrieben. Ohne run.start.world (alte Replays) merkt nichts.
// Namen: GL.world ist schon die neutrale Namensliste (js/world/neutral.js), deshalb GL.gedaechtnis.
window.GL = window.GL || {};
GL.gedaechtnis = (function () {
  const ID = /^[a-z0-9_-]{1,32}$/;
  const MAX = { bekannte: 80, orte: 80, ruf: 20, taten: 200, merk: 40 };
  const str = v => (typeof v === 'string' && ID.test(v) ? v : null);
  const num = (v, lo, hi) => { const n = Math.floor(Number(v)); return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; };

  // Saubere Fassung (Profil, Cloud-Stand oder run.start). Unbekanntes fliegt raus, Größen sind gedeckelt.
  function clean(w) {
    const o = { bekannte: {}, orte: {}, ruf: {}, taten: [] };
    if (!w || typeof w !== 'object' || Array.isArray(w)) return o;
    const map = (src, n, fn) => { if (!src || typeof src !== 'object' || Array.isArray(src)) return {}; const r = {}; Object.keys(src).filter(str).slice(0, n).forEach(k => { const v = fn(src[k]); if (v != null) r[k] = v; }); return r; };
    o.bekannte = map(w.bekannte, MAX.bekannte, e => e && typeof e === 'object' ? { ende: str(e.ende) || 'neutral', mal: num(e.mal, 1, 999), wo: str(e.wo) } : null);
    o.orte = map(w.orte, MAX.orte, e => e && typeof e === 'object' ? { tat: str(e.tat) || 'da', mal: num(e.mal, 1, 999) } : null);
    o.ruf = map(w.ruf, MAX.ruf, v => num(v, -3, 3));
    o.taten = Array.isArray(w.taten) ? Array.from(new Set(w.taten.filter(str))).slice(-MAX.taten) : [];
    return o;
  }
  // Kopie fürs Ablegen (run.start.world)
  function snap(profile) { return clean(profile && profile.world); }

  // In der Fahrt: ein Merkzeichen vormerken. k = 'bekannte' | 'orte' | 'ruf' | 'tat'
  function note(run, m) {
    if (!run || !run.start || !run.start.world || !m || !str(m.id)) return;
    const L = run.merk = run.merk || [];
    if (L.length >= MAX.merk) return;
    const e = { k: m.k, id: m.id };
    if (m.k === 'bekannte') { e.ende = str(m.ende) || 'neutral'; e.wo = str(m.wo); }
    else if (m.k === 'orte') e.tat = str(m.tat) || 'da';
    else if (m.k === 'ruf') e.d = num(m.d, -3, 3);
    else if (m.k !== 'tat') return;
    L.push(e);
  }

  // Nach finishRun: Merkzeichen der Fahrt ins Profil schreiben. Gibt die Zahl der Einträge zurück.
  function apply(profile, run) {
    if (!profile || !run || !Array.isArray(run.merk) || !run.merk.length || run.merkDone) return 0;
    const w = profile.world = clean(profile.world);
    let n = 0;
    run.merk.forEach(m => {
      if (!m || !str(m.id)) return;
      if (m.k === 'bekannte') { const a = w.bekannte[m.id]; w.bekannte[m.id] = { ende: str(m.ende) || 'neutral', mal: Math.min(999, ((a && a.mal) || 0) + 1), wo: str(m.wo) || (a && a.wo) || null }; n++; }
      else if (m.k === 'orte') { const a = w.orte[m.id]; w.orte[m.id] = { tat: str(m.tat) || 'da', mal: Math.min(999, ((a && a.mal) || 0) + 1) }; n++; }
      else if (m.k === 'ruf') { w.ruf[m.id] = num((w.ruf[m.id] || 0) + (m.d || 0), -3, 3); n++; }
      else if (m.k === 'tat') { if (!w.taten.includes(m.id)) { w.taten.push(m.id); n++; } }
    });
    profile.world = clean(w);
    run.merkDone = true;
    return n;
  }

  // Zwei Spielstände zusammenführen (GL.meta.mergeProfiles): nichts löschen, pro Eintrag gilt der öfter erlebte Stand,
  // bei Gleichstand die Basis (der neuere Stand). Ruf: Basis, außer sie kennt die Fraktion nicht.
  function merge(base, other) {
    const a = clean(base), b = clean(other);
    ['bekannte', 'orte'].forEach(k => Object.keys(b[k]).forEach(id => { const x = a[k][id], y = b[k][id]; if (!x || (y.mal || 0) > (x.mal || 0)) a[k][id] = y; }));
    Object.keys(b.ruf).forEach(id => { if (a.ruf[id] == null) a.ruf[id] = b.ruf[id]; });
    a.taten = Array.from(new Set(a.taten.concat(b.taten)));
    return clean(a);
  }

  // Lesen in der Fahrt (für F1 und später): immer aus der Kopie, nie aus dem Profil
  function kennt(run, folgenId) { const w = run && run.start && run.start.world; return (w && w.bekannte && w.bekannte[folgenId]) || null; }

  return { clean, snap, note, apply, merge, kennt };
})();
if (typeof module !== 'undefined') module.exports = GL;
