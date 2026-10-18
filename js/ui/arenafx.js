// Kampf-Grafik: kleine, liebevolle Pixel-Effekte im Kampffenster (nur Anzeige, keine Spiellogik).
//   GL.arenaFx.hit(ev, A, T, type, fast)  Funken + Typ-Effekt beim Einschlag (Kraft: Schockstrich, Klinge: Bogen, Technik: Leuchtspur)
//   GL.arenaFx.aoe(side, idx, by)          Flächenangriff: Schockwelle läuft über alle Getroffenen
//   GL.arenaFx.ult(ev)                     Spezialangriff: kurzer Farb-Wisch + Pixel-Funken in Typfarbe
//   GL.arenaFx.ko(node, pos)               K.O.: kreisende Sternchen über der liegenden Figur (statt „K.O.“-Schild)
//   GL.arenaFx.koMark()                    Markup der Sternchen für bereits liegende Figuren
// Bei Turbo/Überspringen (body.fast) wird alles stark reduziert.
window.GL = window.GL || {};

(function () {
  const COL = {
    kraft: ['#ff9a5a', '#ffd27a', '#e0583a'],
    klinge: ['#bff5d2', '#ffffff', '#5fbf86'],
    technik: ['#9fd8ff', '#ffffff', '#4f8fe0']
  };
  const fastNow = () => document.body.classList.contains('fast');
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const box = () => document.querySelector('#field .f-fx');
  const fu = (side, i) => document.querySelector(`#field .fu[data-side="${side}"][data-i="${i}"]`);
  function center(node) {
    const f = document.getElementById('field');
    const b = node && node.querySelector('.fu-body');
    if (!f || !b) return null;
    const a = f.getBoundingClientRect(), r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2 - a.left, y: r.top + r.height / 2 - a.top };
  }
  function put(cls, pos, life, vars, html) {
    const b = box();
    if (!b || !pos) return null;
    const n = document.createElement('span');
    n.className = 'xfx ' + cls;
    n.style.left = pos.x + 'px'; n.style.top = pos.y + 'px';
    if (vars) Object.keys(vars).forEach(k => n.style.setProperty(k, vars[k]));
    if (html) n.innerHTML = html;
    b.appendChild(n);
    setTimeout(() => n.remove(), life || 600);
    return n;
  }
  // Pixel-Funken: kleine Quadrate fliegen in festen Richtungen weg (kein Zufall nötig, sieht trotzdem lebendig aus)
  const DIRS = [[1, -0.6], [-1, -0.7], [0.4, -1], [-0.5, -1], [1, 0.2], [-1, 0.25], [0.15, -1.1], [0.8, -0.95]];
  function sparks(pos, cols, n, dist) {
    if (!pos) return;
    for (let k = 0; k < n; k++) {
      const d = DIRS[k % DIRS.length], len = (dist || 26) * (0.7 + (k % 3) * 0.2);
      put('xfx-spark', pos, 480, { '--sx': (d[0] * len).toFixed(0) + 'px', '--sy': (d[1] * len).toFixed(0) + 'px', '--c': cols[k % cols.length], '--dl': (k * 12) + 'ms' });
    }
  }

  function hit(ev, A, T, type, fast) {
    if (!T || ev.miss || ev.blocked) return;
    const c = COL[type] || COL.kraft;
    if (fast || reduced()) { if (ev.crit) sparks(T, c, 3, 18); return; }
    if (type === 'klinge') {
      // Schnitt: heller Bogen quer über das Ziel, Krit = zwei gekreuzte Bögen
      put('xfx-arc', T, 380, { '--c': c[0] });
      if (ev.crit) put('xfx-arc x2', T, 420, { '--c': c[1] });
    } else if (type === 'technik') {
      // Schuss: Leuchtspur vom Schützen zum Ziel
      if (A) {
        const dx = T.x - A.x, dy = T.y - A.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
        put('xfx-trail', A, 320, { '--len': len.toFixed(0) + 'px', '--ang': ang.toFixed(1) + 'deg', '--c': c[0] });
      }
      put('xfx-pop', T, 360, { '--c': c[0] });
    } else {
      // Wucht: Schockstrich am Boden + kurzer Druckring
      put('xfx-shock', { x: T.x, y: T.y + 20 }, 420, { '--c': c[0] });
      put('xfx-pop big', T, 380, { '--c': c[1] });
    }
    sparks(T, c, ev.crit ? 8 : 5, ev.crit ? 34 : 24);
  }

  function aoe(side, idx, by) {
    const pts = (idx || []).map(i => center(fu(side, i))).filter(Boolean);
    if (pts.length < 2) return;
    const fast = fastNow() || reduced();
    const minX = Math.min(...pts.map(p => p.x)), maxX = Math.max(...pts.map(p => p.x));
    const y = pts.reduce((s, p) => s + p.y, 0) / pts.length + 18;
    const col = by === 'bleed' ? '#e0583a' : by === 'special' ? '#ffd27a' : '#ffb35a';
    // Schockwelle: ein Band läuft von links nach rechts über alle Getroffenen
    put('xfx-wave', { x: minX - 30, y }, fast ? 260 : 620, { '--w': (maxX - minX + 60).toFixed(0) + 'px', '--c': col });
    if (!fast) pts.forEach((p, k) => setTimeout(() => sparks(p, [col, '#fff4c8'], 4, 20), 60 + k * 70));
  }

  function ult(ev) {
    const field = document.getElementById('field');
    if (!field || fastNow() || reduced()) return;
    const run = window.__glRun || {};
    const list = ev.side === 'crew' ? run.crew : (run.battle || {}).enemies;
    const u = list && list[ev.from];
    const c = COL[(u && u.type) || 'kraft'] || COL.kraft;
    const w = document.createElement('div');
    w.className = 'xfx-wipe ' + (ev.side === 'crew' ? 'us' : 'them');
    w.style.setProperty('--c', c[0]); w.style.setProperty('--c2', c[2]);
    field.appendChild(w);
    setTimeout(() => w.remove(), 650);
    const p = center(fu(ev.side, ev.from));
    if (p) setTimeout(() => sparks(p, c, 8, 40), 120);
  }

  const KO_MARK = '<span class="fu-ko kx" aria-hidden="true"><i></i><i></i><i></i></span>';
  function ko(node, pos) {
    if (!node) return;
    if (!node.querySelector('.fu-ko')) node.insertAdjacentHTML('afterbegin', KO_MARK);
    if (pos && !fastNow()) put('xfx-puff', { x: pos.x, y: pos.y + 14 }, 600);
  }

  GL.arenaFx = { hit, aoe, ult, ko, koMark: () => KO_MARK };
})();
