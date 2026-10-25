// Inselwahl als Wisch-Karten (22s): Karten fliegen rein, wischen wählt die Insel, Antippen klappt Details auf.
// Darüber (9c D) das Meeresband: Schiff in der Mitte, Parallax beim Wischen, Insel der Mitte am Horizont.
// Nach „Kurs auf …“ eine kurze Szene (~2 s): Schiff legt ab, der Bösewicht zeigt sich. Tippen überspringt.
// Die Karten baut render.js (Phase 'course'), hier steckt nur das Verhalten. Gewählt wird weiter über data-act="pick".
window.GL = window.GL || {};

(function () {
  const en = () => !!(GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en');
  const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const cards = tr => [...tr.querySelectorAll('.isl-card')];

  // Welche Karte steht gerade in der Mitte?
  function current(tr) {
    const cs = cards(tr); if (!cs.length) return -1;
    const mid = tr.getBoundingClientRect().left + tr.clientWidth / 2;
    let best = 0, bd = Infinity;
    cs.forEach((c, k) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = k; } });
    return best;
  }

  // Mitte markieren: Karte leuchtet, Bösewicht stellt sich vor, Punkte und Knopf ziehen mit
  function sync(tr) {
    const k = current(tr); if (k < 0) return;
    const cs = cards(tr), stage = tr.closest('#stage') || document;
    if (tr.dataset.cur === String(k)) return;
    tr.dataset.cur = String(k);
    cs.forEach((c, j) => { c.classList.toggle('is-cur', j === k); if (j !== k) c.classList.remove('open'); });
    stage.querySelectorAll('.isl-dots i').forEach((d, j) => d.classList.toggle('on', j === k));
    const go = stage.querySelector('.isl-go'); if (!go) return;
    const c = cs[k], i = c.dataset.i;
    const name = (c.querySelector('.co-name') || {}).textContent || '';
    go.dataset.i = i;
    const t = go.querySelector('.isl-go-t');
    if (t) t.textContent = (en() ? 'Set course: ' : 'Kurs auf ') + name;
  }

  function center(tr, c, smooth) {
    const left = c.offsetLeft - (tr.clientWidth - c.offsetWidth) / 2;
    tr.scrollTo({ left, behavior: smooth && !calm() ? 'smooth' : 'auto' });
  }

  // 9c D: Meeresband über den Karten. Das eigene Schiff liegt in der Mitte, beim Wischen ziehen Wolken,
  // Horizont-Inseln und Wellen versetzt vorbei (Parallax), die Insel der mittleren Karte steht am Horizont.
  // Bewegt sich nur beim Wischen (direkt an die Scroll-Position gekoppelt), sonst läuft nichts.
  const S = 70;   // Abstand der Horizont-Inseln in Pixeln der Szene. Die Insel der Mitte steht bei x = 104, das Schiff links davon (x ≈ 40)
  const px = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  // Insel-Silhouette je Kulisse (fern und etwas blass), cx = Mitte, b = Wasserlinie
  function isle(th, cx, b) {
    const L = '#e3d4a4';
    const hill = (w, h, c) => px(cx - w / 2 + 2, b - h, w - 4, 2, c) + px(cx - w / 2, b - h + 2, w, h - 2, c);
    const beach = w => px(cx - w / 2 - 1, b - 1, w + 2, 1, L);
    const palm = (x, c) => px(x, b - 9, 1, 6, '#7a6a52') + px(x - 2, b - 10, 5, 1, c) + px(x - 3, b - 9, 2, 1, c) + px(x + 2, b - 9, 2, 1, c);
    const hut = (x, roof) => px(x, b - 6, 5, 3, '#e8dcc4') + px(x - 1, b - 7, 7, 1, roof) + px(x, b - 8, 5, 1, roof);
    switch (th) {
      case 'snow': return hill(22, 5, '#7f9fb0') + px(cx - 5, b - 9, 10, 4, '#8eaebe') + px(cx - 2, b - 11, 4, 2, '#f2f6f8') + px(cx - 4, b - 9, 8, 1, '#f2f6f8') + beach(22);
      case 'desert': return hill(26, 3, '#d9b87a') + px(cx - 4, b - 7, 8, 1, '#c9a462') + px(cx - 3, b - 8, 6, 1, '#c9a462') + px(cx - 2, b - 9, 4, 1, '#c9a462') + px(cx - 5, b - 6, 10, 3, '#c9a462');
      case 'grave': return hill(22, 4, '#5a4f6e') + px(cx + 2, b - 12, 4, 8, '#4a405e') + px(cx + 1, b - 13, 6, 1, '#4a405e') + px(cx + 3, b - 10, 1, 1, '#ffd58a') + px(cx - 7, b - 7, 1, 3, '#4a405e') + px(cx - 8, b - 6, 3, 1, '#4a405e') + beach(22);
      case 'reef': case 'bubble': return px(cx - 9, b - 2, 18, 2, '#5aa0a0') + px(cx - 6, b - 5, 2, 3, '#e8857a') + px(cx - 7, b - 4, 1, 1, '#e8857a') + px(cx + 3, b - 6, 2, 4, '#e8a06a') + px(cx + 5, b - 5, 1, 1, '#e8a06a') + px(cx - 1, b - 9, 2, 2, '#cfeff4') + px(cx + 1, b - 12, 1, 1, '#cfeff4');
      case 'sky': return px(cx - 8, b - 12, 16, 2, '#ffffff') + px(cx - 10, b - 10, 20, 2, '#eef4f8') + px(cx - 4, b - 15, 8, 3, '#8fb882') + px(cx - 1, b - 17, 2, 2, '#e8dcc4');
      case 'navy': case 'dock': case 'town': case 'city':
        return hill(24, 3, '#8a9a8a') + hut(cx - 8, '#b8604a') + hut(cx + 3, '#5a78a0') + px(cx - 1, b - 11, 2, 8, '#a8a8a0') + px(cx - 2, b - 12, 4, 1, '#888880') + beach(24);
      case 'whale': return px(cx - 10, b - 4, 20, 4, '#5a7890') + px(cx - 7, b - 6, 12, 2, '#5a7890') + px(cx + 8, b - 7, 2, 3, '#5a7890') + px(cx - 4, b - 5, 1, 1, '#ffffff') + px(cx - 2, b - 9, 1, 2, '#cfeff4') + px(cx - 4, b - 10, 1, 1, '#cfeff4') + px(cx, b - 10, 1, 1, '#cfeff4');
      case 'baratie': return px(cx - 10, b - 3, 20, 3, '#8a5a3a') + px(cx - 7, b - 7, 14, 4, '#e8dcc4') + px(cx - 8, b - 8, 16, 1, '#b8604a') + px(cx - 5, b - 6, 2, 2, '#ffd58a') + px(cx + 2, b - 6, 2, 2, '#ffd58a') + px(cx - 1, b - 12, 1, 4, '#6a5a4a');
      case 'circus': return hill(22, 3, '#7aa06a') + px(cx - 5, b - 8, 10, 5, '#e8dcc4') + px(cx - 5, b - 8, 2, 5, '#d8605a') + px(cx + 1, b - 8, 2, 5, '#d8605a') + px(cx - 3, b - 10, 6, 2, '#d8605a') + px(cx, b - 12, 1, 2, '#6a5a4a') + beach(22);
      case 'bamboo': return hill(24, 6, '#5a8a52') + px(cx - 6, b - 12, 1, 6, '#6aa05a') + px(cx - 2, b - 14, 1, 8, '#6aa05a') + px(cx + 3, b - 11, 1, 5, '#6aa05a') + px(cx + 6, b - 13, 1, 7, '#6aa05a') + beach(24);
      default: return hill(24, 4, '#6f9a62') + palm(cx - 5, '#4e8a4a') + palm(cx + 5, '#4e8a4a') + beach(24);
    }
  }
  function waves(from, to, y, every, c) {
    let w = ''; for (let x = from, k = 0; x < to; x += every, k++) w += px(x + (k % 3) * 2, y + (k % 2), k % 2 ? 4 : 3, 1, c);
    return w;
  }
  function band(tr) {
    const cs = cards(tr), n = cs.length;
    const ship = `<g class="kf-ship">${px(56, 12, 1, 8, '#5a4433')}${px(57, 12, 3, 2, '#1a1a1a')}${px(52, 14, 4, 5, '#f1eee8')}${px(57, 14, 4, 5, '#f1eee8')}${px(53, 13, 3, 1, '#f1eee8')}`
      + `${px(50, 20, 14, 1, '#3a2a1e')}${px(50, 21, 14, 2, '#6b4a32')}${px(51, 23, 12, 1, '#5a3c26')}</g>`;
    const wake = `<g class="kf-wake">${px(44, 23, 4, 1, '#e8f6fc')}${px(39, 24, 3, 1, '#cfeaf6')}${px(66, 23, 2, 1, '#e8f6fc')}</g>`;
    const cloud = (x, y) => px(x + 2, y, 7, 2, '#ffffff') + px(x, y + 2, 12, 2, '#ffffff') + px(x + 1, y + 4, 10, 1, '#dbe9f2');
    let clouds = ''; for (let x = -30, k = 0; x < 200 + n * 14; x += 38, k++) clouds += cloud(x, 2 + (k % 3) * 2);
    const isles = cs.map((c, k) => `<g class="kf-isle">${isle(c.dataset.th, 104 + k * S, 18)}</g>`).join('');
    const div = document.createElement('div');
    div.className = 'kf-band';
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = `<svg viewBox="0 0 160 28" preserveAspectRatio="xMidYMax slice">
      ${px(-200, -10, 600, 18, '#9fd3ec')}${px(-200, 8, 600, 6, '#bfe4f2')}${px(-200, 14, 600, 4, '#d8eff6')}
      <g class="kf-l1">${clouds}</g>
      ${px(-200, 18, 600, 3, '#4f9fcc')}${px(-200, 21, 600, 3, '#3f8fc0')}${px(-200, 24, 600, 8, '#357fb0')}
      <g class="kf-l2">${isles}</g>
      <g class="kf-l3">${waves(-80, 200 + n * S * 1.4, 22, 9, '#a8dcf2')}${waves(-60, 200 + n * S * 1.4, 26, 13, '#7fc2e4')}</g>
      <g transform="translate(-17 0)">${wake}${ship}</g>
    </svg>`;
    return div;
  }
  // Wisch-Stand (0 bis n-1, mit Nachkommastellen) auf die Ebenen übertragen. Nur während des Scrollens.
  function drift(tr) {
    const b = tr._band; if (!b) return;
    const max = tr.scrollWidth - tr.clientWidth, n = cards(tr).length;
    const p = max > 0 ? tr.scrollLeft / max * (n - 1) : 0;
    b.l1.style.transform = `translateX(${(-p * 10).toFixed(2)}px)`;
    b.l2.style.transform = `translateX(${(-p * S).toFixed(2)}px)`;
    b.l3.style.transform = `translateX(${(-p * S * 1.4).toFixed(2)}px)`;
    const dir = p > (tr._p == null ? p : tr._p) ? 'r' : p < tr._p ? 'l' : '';
    tr._p = p;
    if (dir) { b.el.classList.remove('l', 'r'); b.el.classList.add(dir, 'mv'); }
    clearTimeout(tr._mv);
    tr._mv = setTimeout(() => b.el.classList.remove('mv'), 220);   // Blickrichtung bleibt, nur die Neigung geht
  }
  function addBand(tr) {
    const sw = tr.closest('.isl-swipe'); if (!sw || !sw.parentNode) return;
    const el = band(tr);
    sw.parentNode.insertBefore(el, sw);
    tr._band = { el, l1: el.querySelector('.kf-l1'), l2: el.querySelector('.kf-l2'), l3: el.querySelector('.kf-l3') };
    drift(tr);
    el.classList.remove('l', 'mv');
  }

  // Nach jedem Neuaufbau der Bühne: Startzustand setzen (render.js ersetzt #stage komplett)
  function init() {
    const tr = document.querySelector('#stage .isl-track');
    if (!tr || tr.dataset.ready) return;
    tr.dataset.ready = '1';
    delete tr.dataset.cur;
    sync(tr);
    addBand(tr);
    // Einflug erst, wenn die Meeres-Ankündigung weg ist (sonst fliegen die Karten unsichtbar dahinter rein)
    const sw = tr.closest('.isl-swipe');
    let n = 0;
    const go = () => { if (document.getElementById('scene') && n++ < 25) { setTimeout(go, 150); return; } if (sw) sw.classList.add('go'); };
    go();
    tr.addEventListener('scroll', () => { cancelAnimationFrame(tr._raf); tr._raf = requestAnimationFrame(() => { sync(tr); drift(tr); }); }, { passive: true });
  }
  new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });

  // Karte antippen: Seitenkarte holt sich in die Mitte, mittlere Karte klappt auf. Taste 1-9 wählt sofort.
  document.addEventListener('click', e => {
    const c = e.target.closest && e.target.closest('.isl-card');
    if (!c) return;
    const tr = c.closest('.isl-track'); if (!tr) return;
    e.preventDefault();
    if (e.detail === 0) {   // Tastatur: direkt Kurs setzen
      center(tr, c, false); sync(tr);
      const go = document.querySelector('#stage .isl-go'); if (go) go.click();
      return;
    }
    if (!c.classList.contains('is-cur')) { center(tr, c, true); return; }
    c.classList.toggle('open');
    if (GL.sfx) GL.sfx.play('tap');
  });

  // Kurz-Szene vor dem eigentlichen Kurs-Setzen
  function scene(card, done) {
    if (calm() || !card) { done(); return; }
    const boss = card.querySelector('.isl-boss-spr'), name = card.querySelector('.isl-foe b'), isl = card.querySelector('.co-name');
    const ship = GL.sprites && GL.sprites.ship ? GL.sprites.ship() : '⛵';
    const wrap = document.createElement('div');
    wrap.className = 'isl-scene-pop';
    wrap.setAttribute('role', 'dialog');
    wrap.innerHTML = `<div class="isp-sky"><i class="isp-sun"></i></div><div class="isp-sea"></div>
      <div class="isp-ship">${ship}</div>
      <div class="isp-isl"><small>${en() ? 'Course set' : 'Kurs gesetzt'}</small><b>${isl ? isl.textContent : ''}</b></div>
      <div class="isp-land"></div>
      <div class="isp-boss">${boss ? boss.innerHTML : ''}</div>
      <div class="isp-name"><small>${en() ? 'Waiting for you' : 'Erwartet dich'}</small><b>${name ? name.textContent : ''}</b></div>`;
    document.body.appendChild(wrap);
    let over = false;
    const end = () => { if (over) return; over = true; clearTimeout(t); wrap.classList.add('out'); setTimeout(() => { wrap.remove(); done(); }, 220); };
    const t = setTimeout(end, 2100);
    wrap.addEventListener('click', end);
    requestAnimationFrame(() => wrap.classList.add('in'));
  }

  // Den Knopf abfangen: erst die Szene, dann klickt er sich selbst (main.js wählt dann wie gewohnt)
  window.addEventListener('click', e => {
    const go = e.target.closest && e.target.closest('#stage .isl-go');
    if (!go || go.dataset.played) return;
    e.stopPropagation(); e.preventDefault();
    if (go.dataset.busy) return;
    go.dataset.busy = '1';
    const tr = document.querySelector('#stage .isl-track');
    const card = tr ? cards(tr).find(c => c.dataset.i === go.dataset.i) : null;
    if (GL.sfx) GL.sfx.play('tap');
    // Klick erst nach diesem Ereignis auslösen: Ein Knopf, der gerade geklickt wird, ignoriert ein zweites click()
    scene(card, () => { go.dataset.played = '1'; setTimeout(() => go.click(), 0); });
  }, true);
})();
