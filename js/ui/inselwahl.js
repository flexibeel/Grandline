// Inselwahl als Wisch-Karten (22s): Karten fliegen rein, wischen wählt die Insel, Antippen klappt Details auf.
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

  // Nach jedem Neuaufbau der Bühne: Startzustand setzen (render.js ersetzt #stage komplett)
  function init() {
    const tr = document.querySelector('#stage .isl-track');
    if (!tr || tr.dataset.ready) return;
    tr.dataset.ready = '1';
    delete tr.dataset.cur;
    sync(tr);
    // Einflug erst, wenn die Meeres-Ankündigung weg ist (sonst fliegen die Karten unsichtbar dahinter rein)
    const sw = tr.closest('.isl-swipe');
    let n = 0;
    const go = () => { if (document.getElementById('scene') && n++ < 25) { setTimeout(go, 150); return; } if (sw) sw.classList.add('go'); };
    go();
    tr.addEventListener('scroll', () => { cancelAnimationFrame(tr._raf); tr._raf = requestAnimationFrame(() => sync(tr)); }, { passive: true });
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
