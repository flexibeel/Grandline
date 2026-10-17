// Startpunkt: verbindet Spiellogik, Speicherstand und Oberfläche.
(function () {
  const profile = GL.save.loadProfile();

  // run = null bedeutet: wir sind im Hauptquartier
  let run = GL.save.loadRun();
  let anim = null;                       // läuft gerade eine Kampfanimation?
  const ui = { restartArmed: false, newBest: false, album: null, sheet: null, profile, lastStage: null, lastBerry: null,
    intro: null, screen: 'title' };   // screen: 'title' (Startbildschirm) | 'profile' (Profil anlegen) | null

  const SPEED = { normal: 520, special: 950, fast: 90 };

  function draw() { GL.ui.render(run, anim, ui); }

  // Neue Freischaltungen kurz einblenden
  function toast(html) {
    const box = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 4200);
    setTimeout(() => t.remove(), 4800);
  }

  function saveProfile() { GL.save.storeProfile(profile); }

  function syncProfile() {
    if (!run) return saveProfile();
    GL.meta.update(profile, run).forEach(n => {
      if (n.kind === 'crew') {
        const d = GL.data.crew.find(c => c.id === n.id);
        toast(`<i>${GL.sprites.render(d)}</i><span><b>Freigeschaltet: ${d.name}</b>Ab jetzt als Kapitän wählbar und rekrutierbar.</span>`);
      } else if (n.kind === 'epic') {
        const f = GL.data.fruits.find(x => x.id === n.id);
        toast(`<i>${GL.sprites.icon('fruit', f.id, true)}</i><span><b>Epische Frucht: ${f.name}</b>Taucht ab jetzt in deinen Runs auf.</span>`);
      }
    });
    GL.save.storeProfile(profile);
  }

  function act(action) {
    if (!run) return;
    const wasFinished = GL.run.isFinished(run);
    const bountyBefore = run.bountyM || 0;
    const trophiesBefore = (run.trophies || []).length;
    if (!GL.run.act(run, action)) return;
    // Artefakt gefunden: nach dem Kopfgeld-Steckbrief einblenden
    if ((run.trophies || []).length > trophiesBefore) {
      const id = run.trophies[run.trophies.length - 1];
      const isNew = !(profile.vault[id] > 0);
      const before = GL.meta.artLevelFor(profile.vault[id] || 0);
      const lvl = GL.meta.artLevelFor((profile.vault[id] || 0) + 1);
      const up = lvl > before;
      const later = (run.bountyM || 0) > bountyBefore ? 3700 : 300;
      setTimeout(() => GL.ui.trophyPop(id, lvl, isNew, up, (profile.vault[id] || 0)), later);
    }
    // Boss oder Kopfgeld-Ziel besiegt: Steckbrief mit neuem Kopfgeld fliegt ins Bild
    if ((run.bountyM || 0) > bountyBefore) { const r = run; setTimeout(() => GL.ui.bountyPoster(r), 250); }
    if (action.type === 'fight') {
      startAnim();
      // Beim allerersten Level-up kurz erklären, wie man Punkte verteilt
      const leveled = run.battle.xp && run.battle.xp.some(x => x.to.lvl > x.from.lvl);
      if (leveled && !(profile.tips && profile.tips.level)) {
        profile.tips = Object.assign(profile.tips || {}, { level: true });
        setTimeout(() => toast(`<i>${GL.sprites.coin()}</i><span><b>Level-up!</b>Jedes Level bringt 2 Statuspunkte. Klicke auf eine Figur oder auf „Punkte verteilen“, um sie auf Leben, Angriff oder Tempo zu setzen.</span>`), 2500);
      }
    }
    if (!wasFinished && GL.run.isFinished(run)) {
      ui.newBest = GL.save.recordFinished(run);
      ui.lastBerry = GL.meta.finishRun(profile, run);
      // Online-Rangliste (nur in der geteilten Version)
      if (GL.online) GL.online.submit(profile, run).then(res => {
        saveProfile();
        if (res === 'best') toast(`<i>${GL.sprites.coin()}</i><span><b>Rangliste</b>Neuer Bestwert eingetragen!</span>`);
      });
    }
    // Während der Kampfanimation noch nichts verraten
    if (run.phase !== 'battle') syncProfile();
    GL.save.storeRun(run);
    draw();
  }

  // Duell: alle spielen denselben Seed ohne dauerhafte Boni (faire Bedingungen)
  const duelCode = seed => (seed >>> 0).toString(36).toUpperCase();
  function startDuel(code) {
    let seed;
    if (code) {
      const c = String(code).trim().toLowerCase().replace(/[^0-9a-z]/g, '');
      seed = parseInt(c, 36);
      if (!c || !isFinite(seed) || seed > 0xffffffff) { toast('<span><b>Ungültiger Code</b>Bitte prüfe den Duell-Code.</span>'); return; }
    } else {
      seed = GL.rng.newSeed();
    }
    stopAnim();
    ui.sheet = null;
    ui.album = null;
    run = GL.run.create(seed >>> 0, { heat: 0 });
    run.duel = duelCode(seed);
    ui.newBest = false;
    ui.lastBerry = null;
    saveProfile();
    GL.save.storeRun(run);
    draw();
    window.scrollTo(0, 0);
  }

  // Leinen los: neuer Run mit Werft-Ausbauten und Ausrüstung aus dem Lager
  function sail() {
    stopAnim();
    ui.sheet = null;
    ui.album = null;
    const gear = GL.meta.takeLoadout(profile);
    run = GL.run.create(undefined, {
      unlocked: profile.unlocked, epics: profile.epics, upgrades: profile.upgrades, gear, heat: profile.heat,
      arts: GL.meta.takeArtifacts(profile)
    });
    ui.newBest = false;
    ui.lastBerry = null;
    ui.restartArmed = false;
    saveProfile();
    GL.save.storeRun(run);
    draw();
    window.scrollTo(0, 0);
  }

  // Zurück ins Hauptquartier (nach Run-Ende oder beim Aufgeben)
  function toHq() {
    stopAnim();
    if (run && !GL.run.isFinished(run)) GL.meta.finishRun(profile, Object.assign({}, run, { phase: 'over', step: 0, bounties: 0, defeated: [], berry: 0 }));
    run = null;
    ui.sheet = null;
    ui.restartArmed = false;
    GL.save.clearRun();
    saveProfile();
    draw();
    window.scrollTo(0, 0);
  }

  // Kampfanimation: spielt die berechneten Ereignisse nacheinander ab
  function startAnim() {
    const b = run.battle;
    anim = {
      i: 0,
      crewHp: b.crewStart.slice(),
      enemyHp: b.enemies.map(e => e.hp),
      log: 'Der Kampf beginnt!',
      fast: false,
      done: b.events.length === 0,
      timer: null
    };
    anim.timer = setTimeout(stepAnim, SPEED.normal);
  }

  function stepAnim() {
    if (!anim || anim.done) return;
    const ev = run.battle.events[anim.i++];
    if (!ev) { anim.done = true; draw(); return; }
    const setHp = (side, to, hp) => { (side === 'crew' ? anim.crewHp : anim.enemyHp)[to] = hp; };
    if (ev.k === 'hit') setHp(ev.side === 'crew' ? 'enemy' : 'crew', ev.to, ev.hp);
    else if (ev.list) ev.list.forEach(x => { if (x.hp !== undefined) setHp(ev.side, x.to, x.hp); });
    if (ev.k === 'round') { anim.timer = setTimeout(stepAnim, anim.fast ? 0 : 60); GL.arena.play(ev); return; }
    anim.log = GL.ui.battleText(run, ev) || anim.log;
    // Arena direkt verändern statt neu zu zeichnen, damit Animationen laufen
    GL.arena.play(ev);
    const log = document.getElementById('log');
    if (log) log.textContent = anim.log;
    // Fähigkeiten-Hinweise etwas länger stehen lassen, damit man sie lesen kann
    const wait = ev.k === 'special' ? (anim.fast ? 900 : 1800) : anim.fast ? SPEED.fast : ev.k === 'hit' ? SPEED.normal : SPEED.special;
    anim.timer = setTimeout(stepAnim, wait);
  }

  function stopAnim() {
    if (anim) clearTimeout(anim.timer);
    anim = null;
  }

  document.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; e.stopPropagation(); return; }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const type = el.dataset.act;
    const i = Number(el.dataset.i);

    if (type !== 'restart') ui.restartArmed = false;
    if (type !== 'reset-all') ui.resetArmed = false;

    switch (type) {
      case 'node': act({ type: 'node', index: i }); break;
      case 'pick': act({ type: 'pick', index: i }); break;
      case 'up':   act({ type: 'swap', a: i, b: i - 1 }); break;
      case 'down': act({ type: 'swap', a: i, b: i + 1 }); break;
      case 'fight': act({ type: 'fight' }); break;
      case 'special': act({ type: 'special' }); break;
      case 'continue': stopAnim(); act({ type: 'continue' }); break;
      case 'fast':
        if (anim) { anim.fast = true; document.body.classList.add('fast'); }
        break;
      case 'skip': if (anim) { clearTimeout(anim.timer); anim.done = true; draw(); } break;
      case 'sail': sail(); break;
      case 'hq': toHq(); break;
      case 'restart':
        if (ui.restartArmed) toHq();
        else { ui.restartArmed = true; draw(); }
        break;
      case 'crew-toggle': ui.crewOpen = !ui.crewOpen; draw(); break;
      case 'heat': GL.meta.setHeat(profile, profile.heat + Number(el.dataset.d)); saveProfile(); draw(); break;
      case 'theme': {
        const dark = document.documentElement.dataset.theme !== 'dark';
        if (dark) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
        try { localStorage.setItem('grandline.theme', dark ? 'dark' : 'light'); } catch (err) { /* egal */ }
        updateThemeButton();
        break;
      }
      case 'intro-open': ui.intro = 0; draw(); break;
      case 'intro-next': ui.intro = Math.min(ui.intro + 1, GL.ui.introSteps - 1); draw(); break;
      case 'intro-prev': ui.intro = Math.max(ui.intro - 1, 0); draw(); break;
      case 'title-play':
        // Erster Start: erst Profil anlegen, dann kurze Anleitung
        if (!profile.nickname) { ui.screen = 'profile'; draw(); break; }
        ui.screen = null;
        if (!(profile.tips && profile.tips.intro)) ui.intro = 0;
        draw();
        break;
      case 'title-go': ui.screen = null; ui.hqTab = el.dataset.tab; if (el.dataset.tab === 'album') { ui.album = 'crew'; ui.hqTab = null; } draw(); break;
      case 'title-back': ui.screen = 'title'; draw(); break;
      case 'profile-edit': ui.screen = 'profile'; draw(); break;
      case 'avatar': ui.avatarPick = el.dataset.id; document.querySelectorAll('.av-opt').forEach(b => b.classList.toggle('on', b.dataset.id === el.dataset.id)); break;
      case 'profile-save': {
        const inp = document.getElementById('pf-name');
        const name = inp ? inp.value.trim() : '';
        if (!name) { inp && inp.focus(); inp && inp.classList.add('shake'); break; }
        profile.avatar = ui.avatarPick || profile.avatar || GL.config.starters[0];
        GL.online.rename(profile, name).then(ok => {
          saveProfile();
          if (ok) toast('<span><b>Willkommen an Bord!</b>Dein Profil steht in der Rangliste.</span>');
        });
        profile.nickname = name.slice(0, 24);
        saveProfile();
        ui.screen = null;
        if (!(profile.tips && profile.tips.intro)) ui.intro = 0;
        ui.lastStage = null;
        draw();
        break;
      }
      case 'intro-close':
        ui.intro = null;
        profile.tips = Object.assign(profile.tips || {}, { intro: true });
        saveProfile(); draw();
        break;
      case 'hq-tab': ui.hqTab = el.dataset.tab; draw(); break;
      case 'buy-upgrade': if (GL.meta.buyUpgrade(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'buy-gear': if (GL.meta.buyGear(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'toggle-gear': if (GL.meta.toggleLoadout(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'reroll': act({ type: 'reroll' }); break;
      case 'leave': act({ type: 'leave' }); break;
      case 'dismiss': act({ type: 'dismiss', index: i }); ui.sheet = null; draw(); break;
      case 'lb-cat': ui.lbCat = el.dataset.id; draw(); break;
      case 'duel-view': ui.duelView = el.dataset.id; draw(); break;
      case 'duel-new': startDuel(null); break;
      case 'duel-join': { const inp = document.getElementById('duel-code'); startDuel(inp ? inp.value : ''); break; }
      case 'duel-copy': {
        const txt = `Duell in Grand Line! Code: ${el.dataset.id}`;
        if (navigator.clipboard) navigator.clipboard.writeText(el.dataset.id).then(() => toast('<span><b>Kopiert</b>' + txt + '</span>'), () => toast('<span><b>Duell-Code</b>' + el.dataset.id + '</span>'));
        else toast('<span><b>Duell-Code</b>' + el.dataset.id + '</span>');
        break;
      }
      case 'reset-all': {
        if (!ui.resetArmed) { ui.resetArmed = true; ui.lastStage = null; draw(); break; }
        try { ['grandline.run', 'grandline.profile', 'grandline.best'].forEach(k => localStorage.removeItem(k)); } catch (e2) { /* egal */ }
        location.reload();
        break;
      }
      case 'set-nick': {
        const inp = document.getElementById('nick');
        GL.online.rename(profile, inp ? inp.value : '').then(ok => {
          saveProfile(); ui.lastStage = null; draw();
          toast(ok ? '<span><b>Eingetragen</b>Dein Profil steht jetzt in der Rangliste.</span>' : '<span><b>Name gespeichert</b>In die Online-Rangliste kommst du in der geteilten Version.</span>');
        });
        break;
      }
      case 'toggle-art': if (GL.meta.toggleArtifact(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'sheet': ui.sheet = i; draw(); break;
      case 'sheet-close': ui.sheet = null; draw(); break;
      case 'spend': {
        act({ type: 'spend', index: i, stat: el.dataset.stat });
        // Fertig geskillt: direkt zur nächsten Figur mit offenen Punkten, sonst Steckbrief schließen
        if (run && run.crew[i] && run.crew[i].points === 0) {
          const next = run.crew.findIndex(u => u.points > 0);
          ui.sheet = next >= 0 ? next : null;
          if (next >= 0) toast(`<span><b>Weiter mit ${GL.data.crew.find(c => c.id === run.crew[next].id).name}</b>${run.crew[next].points} Punkte offen</span>`);
          draw();
        }
        break;
      }
      case 'album': ui.album = 'crew'; draw(); break;
      case 'album-tab': ui.album = el.dataset.tab; draw(); break;
      case 'album-close': ui.album = null; draw(); break;
    }
    if (type === 'fight') document.body.classList.remove('fast');
  });

  // Tastenkürzel: 1-9 Optionen, Enter/Leertaste weiter, F schneller, S überspringen
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter' && e.target.id === 'pf-name') { e.preventDefault(); document.querySelector('[data-act=profile-save]')?.click(); return; }
    if (e.key === 'Enter' && e.target.id === 'nick') { e.preventDefault(); document.querySelector('[data-act=set-nick]')?.click(); return; }
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    // Startbildschirm: Leertaste/Enter = Spielen
    if (ui.screen) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.querySelector('#title [data-act=title-play], #title [data-act=profile-save]')?.click(); }
      return;
    }
    // Willkommens-Fenster: Leertaste/Enter weiter, Pfeile vor/zurück, Esc schließen
    if (ui.intro != null) {
      const intro = document.getElementById('intro');
      if (e.key === 'Escape') intro.querySelector('[data-act=intro-close]')?.click();
      else if (e.key === 'ArrowLeft') intro.querySelector('[data-act=intro-prev]')?.click();
      else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        intro.querySelector('.intro-foot .btn:not(.ghost)')?.click();
      }
      return;
    }
    if (e.key === 'Escape' && (ui.album || ui.sheet != null)) { ui.album = null; ui.sheet = null; draw(); return; }
    if (ui.album || ui.sheet != null) return;
    const stage = document.getElementById('stage');
    if (/^[1-9]$/.test(e.key)) {
      const opts = stage.querySelectorAll('.opt, .map-node.can');
      const b = opts[Number(e.key) - 1];
      if (b && !b.disabled) { e.preventDefault(); b.click(); }
      return;
    }
    // Leertaste/Enter = Universal-Weiter: Kampf starten, schneller, überspringen, weiter
    if ((e.key === 'Enter' || e.key === ' ') && !(e.target.matches && e.target.matches('button, .member, .crewmini'))) {
      e.preventDefault();
      if (anim && !anim.done) {
        stage.querySelector(anim.fast ? '[data-act=skip]' : '[data-act=fast]')?.click();
        return;
      }
      const main = stage.querySelector('[data-act=continue], [data-act=fight], [data-act=sail], [data-act=hq], [data-act=leave]');
      if (main) main.click();
      return;
    }
    if ((e.key === 'f' || e.key === 'F') && anim) { stage.querySelector('[data-act=fast]')?.click(); return; }
    if ((e.key === 'r' || e.key === 'R') && !anim) { stage.querySelector('[data-act=reroll]:not([disabled])')?.click(); return; }
    if ((e.key === 'q' || e.key === 'Q') && !anim) { stage.querySelector('[data-act=special]')?.click(); return; }
    if ((e.key === 's' || e.key === 'S') && anim) { stage.querySelector('[data-act=skip]')?.click(); return; }
    // Crew-Karten sind keine echten Buttons, daher Enter/Leertaste selbst auswerten
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.member, .crewmini')) {
      e.preventDefault();
      e.target.click();
    }
  });
  // Klick auf den abgedunkelten Hintergrund schließt den Steckbrief
  document.getElementById('sheet').addEventListener('click', e => {
    if (e.target.id === 'sheet') { ui.sheet = null; draw(); }
  });

  // ---------- Crew umsortieren: Ziehen und Tastatur ----------
  // Figur von Platz "from" nach "to" verschieben (als Folge von Tausch-Aktionen)
  function moveCrew(from, to) {
    if (!run || from === to || ['battle', 'over', 'win'].includes(run.phase)) return;
    const step = to > from ? 1 : -1;
    for (let i = from; i !== to; i += step) GL.run.act(run, { type: 'swap', a: i, b: i + step });
    GL.save.storeRun(run);
    draw();
  }

  // Gezogen werden kann in der Aufstellung (#slots) und in der Crew-Leiste oben (#crew).
  // Ablauf: Die Figur hängt als Kopie am Zeiger, das Original bleibt als halbdurchsichtiger
  // Platzhalter in der Liste und rückt live an die Stelle, an der man loslassen würde.
  const DRAG_SEL = '#slots .slot, #crew .crewmini, #crew .member';
  const ITEM_SEL = ':scope > .slot, :scope > .crewmini, :scope > .member';
  let drag = null;
  let suppressClick = false;

  function endDrag(commit) {
    if (!drag) return;
    const d = drag;
    drag = null;
    document.body.classList.remove('is-dragging');
    if (d.ghost) d.ghost.remove();
    d.el.classList.remove('drag-placeholder');
    if (!d.moved) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 50);
    const to = [...d.parent.querySelectorAll(ITEM_SEL)].indexOf(d.el);
    ui.lastStage = null;
    if (commit && to >= 0 && to !== d.from) moveCrew(d.from, to);
    else draw();
  }

  document.addEventListener('pointerdown', e => {
    const el = e.target.closest && e.target.closest(DRAG_SEL);
    if (!el || !run || ['battle', 'over', 'win', 'starter'].includes(run.phase)) return;
    if (e.button !== undefined && e.button !== 0) return;
    const parent = el.parentElement;
    drag = {
      el, parent, from: [...parent.querySelectorAll(ITEM_SEL)].indexOf(el),
      startX: e.clientX, startY: e.clientY, moved: false, ghost: null, offX: 0, offY: 0
    };
  });

  document.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 8) return;
      // Ziehen beginnt: Kopie erzeugen, die dem Zeiger folgt
      drag.moved = true;
      const r = drag.el.getBoundingClientRect();
      drag.offX = drag.startX - r.left;
      drag.offY = drag.startY - r.top;
      const g = drag.el.cloneNode(true);
      g.classList.add('drag-ghost');
      g.removeAttribute('data-act');
      g.style.width = r.width + 'px';
      g.style.height = r.height + 'px';
      document.body.appendChild(g);
      drag.ghost = g;
      drag.el.classList.add('drag-placeholder');
      document.body.classList.add('is-dragging');
    }
    e.preventDefault();
    drag.ghost.style.left = (e.clientX - drag.offX) + 'px';
    drag.ghost.style.top = (e.clientY - drag.offY) + 'px';
    // Nächsten Platz zum Zeiger finden und den Platzhalter dorthin verschieben
    const items = [...drag.parent.querySelectorAll(ITEM_SEL)];
    let best = null, bestD = Infinity;
    items.forEach(it => {
      const r = it.getBoundingClientRect();
      const dd = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
      if (dd < bestD) { bestD = dd; best = it; }
    });
    if (best && best !== drag.el) {
      const iBest = items.indexOf(best), iEl = items.indexOf(drag.el);
      drag.parent.insertBefore(drag.el, iBest > iEl ? best.nextSibling : best);
    }
  }, { passive: false });

  document.addEventListener('pointerup', () => endDrag(true));
  document.addEventListener('pointercancel', () => endDrag(false));
  window.addEventListener('blur', () => endDrag(false));

  document.addEventListener('keydown', e => {
    const slot = e.target.closest && e.target.closest('#slots .slot, #crew .crewmini, #crew .member');
    if (!slot || !run) return;
    const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    const fwd = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    if (!back && !fwd) return;
    e.preventDefault();
    const i = Number(slot.dataset.slot != null ? slot.dataset.slot : slot.dataset.i);
    const j = i + (back ? -1 : 1);
    if (j < 0 || j >= run.crew.length) return;
    moveCrew(i, j);
    document.querySelector(`#slots .slot[data-slot="${j}"], #crew [data-i="${j}"]`)?.focus();
  }, true);

  function updateThemeButton() {
    const b = document.getElementById('theme-btn');
    if (b) b.textContent = document.documentElement.dataset.theme === 'dark' ? 'Hell' : 'Dunkel';
  }

  // 3D: Sammelkarten kippen Richtung Maus
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('pointermove', e => {
    if (reduce || e.pointerType !== 'mouse') return;
    const card = e.target.closest && e.target.closest('.opt.card');
    document.querySelectorAll('.opt.card .card-face[style]').forEach(f => {
      if (!card || !card.contains(f)) f.removeAttribute('style');
    });
    if (!card) return;
    const face = card.querySelector('.card-face');
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    face.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(1) + 'deg');
    face.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(1) + 'deg');
    face.style.setProperty('--gx', (x * 100).toFixed(0) + '%');
    face.style.setProperty('--gy', (y * 100).toFixed(0) + '%');
  });

  updateThemeButton();
  syncProfile();
  draw();
  // Online-Rangliste: neu zeichnen, wenn sich Einträge ändern (nur im Hauptquartier sichtbar)
  if (GL.online) {
    GL.online.onChange(() => { if (!run && document.activeElement && document.activeElement.id !== 'nick') draw(); });
    GL.online.init(profile);
  }
})();
