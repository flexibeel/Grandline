// Startpunkt: verbindet Spiellogik, Speicherstand und Oberfläche.
(function () {
  const profile = GL.save.loadProfile();
  if (profile.nickname && !profile.playerCode) { GL.code.ensure(profile); GL.save.storeProfile(profile); }

  // run = null bedeutet: wir sind im Hauptquartier
  let run = GL.save.loadRun();
  let anim = null;                       // läuft gerade eine Kampfanimation?
  const ui = { restartArmed: false, newBest: false, album: null, sheet: null, profile, lastStage: null, lastBerry: null,
    intro: null, screen: 'title' };   // screen: 'title' (Startbildschirm) | 'profile' (Profil anlegen) | null

  // Eigener Pirat: beim Laden eintragen, damit Avatar und Name überall stimmen
  const selfNow = () => GL.meta.selfDef(profile);
  if (selfNow()) GL.run.registerSelf(selfNow());
  // Entwurf für den Profil-Bildschirm (wird erst beim Speichern übernommen)
  function openProfile() {
    const look = { hair: '#6b4a2a', skin: '#f2c9a0', shirt: '#2f6fb0', pants: '#3b5a8c', hat: 'band', hatColor: '#c0392b' };
    const ch = profile.char || { type: 'kraft', role: 'kaempfer', look };
    ui.draft = {
      name: profile.nickname || '',
      char: { type: ch.type, role: ch.role, look: Object.assign({}, ch.look) },
      cos: Object.assign({ bg: 'meer', frame: 'holz', anim: 'ruhig', title: 'neuling', flag: 'keine', badge: 'keins' }, profile.cos || {})
    };
    ui.profileFrom = ui.screen || 'hq';
    ui.screen = 'profile';
    draw();
  }

  const SPEED = { normal: 430, special: 820, ult: 900, fast: 90 };

  const esc2 = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let keyPick = false;   // Auswahl per Taste 1-9: ohne Bestätigung
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

  function saveProfile() { if (profile.nickname) GL.code.ensure(profile); GL.save.storeProfile(profile); }

  // Neu freigespielte Kosmetik kurz zeigen (Hintergrund, Rahmen, Animation, Titel, Flagge)
  const COS_KIND = { backgrounds: 'Hintergrund', frames: 'Rahmen', animations: 'Animation', titles: 'Titel', flags: 'Flagge', badges: 'Abzeichen' };
  const allCos = () => Object.assign({}, GL.data.cosmetics, { badges: GL.data.badges || [] });
  function checkCosmetics() {
    const vals = GL.meta.progressValues(profile);
    const now = [];
    const ALL = allCos();
    Object.keys(ALL).forEach(k => ALL[k].forEach(it => {
      if (Object.keys(it.req || {}).length && GL.meta.cosmeticUnlocked(profile, it, vals)) now.push(k + ':' + it.id);
    }));
    if (!profile.cosSeen) { profile.cosSeen = now; return; }
    const fresh = now.filter(x => !profile.cosSeen.includes(x));
    if (!fresh.length) return;
    profile.cosSeen = profile.cosSeen.concat(fresh);
    fresh.slice(0, 3).forEach(x => {
      const [k, id] = x.split(':');
      const it = ALL[k].find(y => y.id === id);
      toast(`<span><b>Neu für dein Profil: ${COS_KIND[k]} „${it.name}“</b>Im Profil ausrüsten, alle sehen es in der Rangliste.</span>`);
    });
    if (fresh.length > 3) toast(`<span><b>Und ${fresh.length - 3} weitere Profil-Teile</b>Schau im Profil vorbei.</span>`);
  }

  // Kapitel-Fortschritt: alle Bösewichte + Bosse eines Meeres einmal besiegt -> Berry-Belohnung
  function checkChapters() {
    if (!profile.chapterSeen) profile.chapterSeen = [];
    GL.data.islands.forEach((isl, i) => {
      if (profile.chapterSeen.includes(isl.id)) return;
      if (!GL.meta.chapterProgress(profile, i).complete) return;
      profile.chapterSeen.push(isl.id);
      const reward = 150 * (i + 1);
      profile.berry = (profile.berry || 0) + reward;
      toast(`<span><b>Kapitel abgeschlossen: ${isl.name}</b>Alle Bösewichte und Bosse dieses Meeres besiegt. +${reward} Berry.</span>`);
    });
  }

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
    checkChapters();
    checkCosmetics();
    (profile.quests || []).forEach(q => {
      if (!q.told && GL.meta.questProgress(profile, q).done) {
        q.told = true;
        toast(`<span><b>Auftrag erfüllt: ${GL.meta.questDef(q).icon} ${GL.meta.questDef(q).text.replace('{n}', q.n)}</b>Belohnung im Hauptquartier abholen.</span>`);
      }
    });
    GL.save.storeProfile(profile);
  }

  function act(action) {
    if (!run) return;
    const wasFinished = GL.run.isFinished(run);
    const bountyBefore = run.bountyM || 0;
    const trophiesBefore = (run.trophies || []).length;
    const itemsBefore = (run.items || []).length;
    const luckyBefore = run.luckyN || 0;
    if (!GL.run.act(run, action)) return;
    if ((run.luckyN || 0) > luckyBefore && run.lucky) toast(`<span><b>🍀 Glücksfund!</b>Eine Goldtruhe: +${run.lucky.gold} Gold${run.lucky.item ? ' und seltene Ausrüstung' : ''}.</span>`);
    // Neue Ausrüstung gefunden: kurze Meldung in der Farbe der Seltenheit
    if ((run.items || []).length > itemsBefore) {
      const it = run.items[run.items.length - 1];
      const d = GL.data.items.find(x => x.id === it.id);
      const R = GL.config.rarities[it.r];
      setTimeout(() => toast(`<span class="toast-item ir-${R.id}"><b>${R.name}: ${d.name}</b>Im Steckbrief einer Figur anlegen.</span>`), 900);
    }
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
      arts: GL.meta.takeArtifacts(profile), self: selfNow(), items: GL.meta.takeItems(profile)
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
    const wait = ev.k === 'special' ? (anim.fast ? 900 : 1800) : ev.k === 'ult' ? (anim.fast ? 350 : SPEED.ult)
      : anim.fast ? SPEED.fast : ev.k === 'hit' ? SPEED.normal : SPEED.special;
    anim.timer = setTimeout(stepAnim, wait);
  }

  function startSquadDuel(row) {
    if (!GL.meta.squadUnlocked(profile)) { toast('<span><b>Noch gesperrt</b>Die Stammcrew gibt es nach deinem ersten gewonnenen Run oder ab Rang 10.</span>'); return; }
    if (ui.squadFight && ui.squadFight.timer) clearTimeout(ui.squadFight.timer);
    const res = GL.squad.fight(GL.meta.squadRefs(profile), row.squad, (Date.now() ^ (Math.random() * 1e9)) >>> 0);
    if (res.win) profile.squadW = (profile.squadW || 0) + 1; else profile.squadL = (profile.squadL || 0) + 1;
    const ratingDelta = GL.meta.squadRate(profile, row.npc ? (profile.squadRating == null ? 1000 : profile.squadRating) - 80 : row.squadRating, res.win);
    const xp = GL.meta.squadGainXp ? GL.meta.squadGainXp(profile, res.me.map(r => r.id), res.win) : null;
    // Darstellung im Kampffeld: Figuren in Startzustand, fremder Pirat mit eigenem Aussehen
    const dRun = { step: 0, seed: 1, captain: res.me[0] && res.me[0].id,
      crew: res.me.map(r => Object.assign({}, r, { hp: r.max, def: r.id === 'self' ? { id: 'self', name: r.name, look: r.look, type: r.type } : null })),
      battle: { kind: 'duel', events: res.events, shown: false,
        enemies: res.foe.map(r => Object.assign({}, r, { hp: r.max, def: r.id === 'rival' ? { id: 'self', name: r.name, look: r.look, type: r.type } : null })) } };
    ui.squadFight = { id: row.id, res, xp, ratingDelta, playing: true, i: 0, dRun, theirName: row.name };
    saveProfile(); draw();
    GL.arena.mounted(dRun);
    ui.squadFight.timer = setTimeout(playDuel, 900);
    if (GL.online && GL.online.register) GL.online.register(profile);
  }

  // Stammcrew-Duell im Kampffeld abspielen (eigene kleine Schleife, unabhängig vom Run)
  function playDuel() {
    const f = ui.squadFight;
    if (!f || !f.playing) return;
    const ev = f.res.events[f.i++];
    if (!ev) { f.timer = setTimeout(() => { f.playing = false; draw(); }, 900); return; }
    GL.arena.play(ev);
    const rb = document.getElementById('duel-log');
    if (rb && ev.k === 'ult') rb.textContent = `⚡ ${ev.name}!`;
    const wait = ev.k === 'round' ? 80 : ev.k === 'ult' ? 850 : ev.k === 'hit' ? 380 : 620;
    f.timer = setTimeout(playDuel, wait);
  }

  function stopAnim() {
    if (anim) clearTimeout(anim.timer);
    anim = null;
  }

  // Tooltips (data-tip): per Klick/Tipp auf- und zuklappen, damit es auch ohne Maus geht
  document.addEventListener('click', e => {
    const tip = e.target.closest('[data-tip]');
    document.querySelectorAll('.tt-open').forEach(x => { if (x !== tip) x.classList.remove('tt-open'); });
    if (tip) tip.classList.toggle('tt-open');
  });

  document.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; e.stopPropagation(); return; }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const type = el.dataset.act;
    const i = Number(el.dataset.i);
    if (!keyPick && ['pick', 'node', 'fight', 'leave', 'continue', 'sail', 'again', 'train', 'squad-fight', 'squad-match'].includes(type)
        && performance.now() - (window.__glStageAt || 0) < 350) return;

    if (type !== 'restart') ui.restartArmed = false;
    if (type !== 'acc-reset' && type !== 'acc-delete') ui.accArmed = null;
    if (type !== 'logout') ui.logoutArmed = false;

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
      case 'peek': ui.peek = true; draw(); break;
      case 'peek-close': ui.peek = false; draw(); break;
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
        if (!profile.nickname) { openProfile(); break; }
        ui.screen = null;
        if (!(profile.tips && profile.tips.intro)) ui.intro = 0;
        draw();
        break;
      case 'title-go': ui.screen = null; ui.hqTab = el.dataset.tab; if (el.dataset.tab === 'album') { ui.album = 'crew'; ui.hqTab = null; } draw(); break;
      case 'title-back': ui.screen = ui.profileFrom === 'hq' ? null : 'title'; draw(); break;
      case 'profile-edit': openProfile(); break;
      case 'login-open': ui.loginFrom = ui.screen || 'hq'; ui.screen = 'login'; draw(); break;
      case 'login-back': ui.screen = ui.loginFrom === 'hq' ? null : 'title'; draw(); break;
      case 'cap-filter': ui.capFilter = el.dataset.v; ui.lastStage = null; draw(); break;
      case 'fuse': {
        const it = GL.meta.fuse(profile, Number(el.dataset.r));
        if (it) {
          const d = GL.data.items.find(x => x.id === it.id);
          const R = GL.config.rarities[it.r];
          toast(`<span class="toast-item ir-${R.id}"><b>Verschmolzen: ${R.name} ${d ? d.name : ''}</b>Liegt jetzt in der Schmiede.</span>`);
          saveProfile(); ui.lastStage = null; draw();
        }
        break;
      }
      case 'admin-star': {
        const st = GL.online.state();
        if (!(st.email && /^westerholt\.felix/i.test(st.email))) break;
        profile.cos = Object.assign({}, profile.cos || {}, { star: !(profile.cos && profile.cos.star) });
        saveProfile(); ui.lastStage = null; draw();
        if (GL.online.register) GL.online.register(profile);
        break;
      }
      case 'squad-toggle': {
        const ids = GL.meta.squadIds(profile).slice();
        const id = el.dataset.id;
        const k = ids.indexOf(id);
        if (k >= 0) { if (ids.length > 1) ids.splice(k, 1); }
        else if (ids.length < GL.meta.squadSize) ids.push(id);
        else { ids.pop(); ids.push(id); }
        profile.squad = ids;
        saveProfile(); ui.lastStage = null; draw();
        clearTimeout(ui.squadPush);
        ui.squadPush = setTimeout(() => { if (GL.online && GL.online.register) GL.online.register(profile); }, 1500);
        break;
      }
      case 'squad-fight': {
        const st = GL.online.state();
        const row = (st.rows || []).find(x => x.id === el.dataset.id) || (ui.npcRow && ui.npcRow.id === el.dataset.id ? ui.npcRow : null);
        if (row) startSquadDuel(row);
        break;
      }
      case 'squad-match': {
        const st = GL.online.state();
        const mine = GL.meta.squadPower(GL.meta.squadRefs(profile));
        const me = String(profile.nickname || '').trim().toLowerCase();
        const myR = profile.squadRating == null ? 1000 : profile.squadRating;
        const pool = (st.rows || []).filter(x => x.id !== st.uid && x.squadOn && (x.squad || []).length && String(x.name || '').trim().toLowerCase() !== me)
          .map(x => ({ x, d: Math.abs((x.squadPower || GL.meta.squadPower(x.squad)) - mine) + Math.abs((x.squadRating || 1000) - myR) / 4 })).sort((p, q) => p.d - q.d).slice(0, 3);
        let row = pool.length ? pool[Math.floor(Math.random() * pool.length)].x : null;
        if (!row) {
          // Niemand passendes online: Übungscrew der Marine auf deinem Niveau
          const lvl = GL.meta.squadLevel(profile);
          const ids = ['koby', 'tashigi', 'hina', 'garp', 'smoker'].sort(() => Math.random() - 0.5).slice(0, GL.meta.squadIds(profile).length);
          const squad = ids.map(id => { const d = GL.data.crew.find(c => c.id === id); const max = d.hp + (lvl - 1) * 3;
            return { id, name: d.name, type: d.type, role: d.role, faction: d.faction, lvl, hp: max, max, atk: d.atk + Math.floor((lvl - 1) * 0.45), spd: d.spd }; });
          row = ui.npcRow = { id: 'npc-marine', name: 'Übungscrew der Marine', rank: 'Marine-Ausbilder', squad, squadPower: GL.meta.squadPower(squad), npc: true };
        }
        ui.viewPlayer = row.id;
        startSquadDuel(row);
        break;
      }
      case 'duel-skip': {
        if (ui.squadFight) { clearTimeout(ui.squadFight.timer); ui.squadFight.playing = false; draw(); }
        break;
      }
      case 'squad-back': if (ui.squadFight) clearTimeout(ui.squadFight.timer); ui.squadFight = null; draw(); break;
      case 'lb-view': ui.viewPlayer = el.dataset.id; draw(); break;
      case 'lb-view-close': if (ui.squadFight) clearTimeout(ui.squadFight.timer); ui.viewPlayer = null; ui.squadFight = null; draw(); break;
      case 'noop': break;
      case 'char-part': ui.draft.char.look[el.dataset.part] = el.dataset.v; draw(); break;
      case 'char-hat': ui.draft.char.look.hat = el.dataset.v; draw(); break;
      case 'char-type': ui.draft.char.type = el.dataset.v; draw(); break;
      case 'char-role': ui.draft.char.role = el.dataset.v; draw(); break;
      case 'cos-pick': ui.draft.cos[el.dataset.kind] = el.dataset.v; draw(); break;
      case 'profile-save': {
        const inp = document.getElementById('pf-name');
        const name = inp ? inp.value.trim() : '';
        if (!name) { inp && inp.focus(); inp && inp.classList.add('shake'); break; }
        profile.char = ui.draft.char;
        profile.cos = ui.draft.cos;
        profile.nickname = name.slice(0, 24);
        GL.run.registerSelf(selfNow());
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
      case 'again': toHq(); sail(); break;   // direkt den nächsten Run starten
      case 'equip': act({ type: 'equip', index: i, uid: el.dataset.uid || null }); break;
      case 'toggle-item': if (GL.meta.toggleItem(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'forge': if (GL.meta.forge(profile, el.dataset.id)) { saveProfile(); toast('<span><b>Geschmiedet!</b>Der Gegenstand ist eine Stufe stärker.</span>'); draw(); } break;
      case 'scrap': {
        if (ui.scrapArmed !== el.dataset.id) { ui.scrapArmed = el.dataset.id; toast('<span><b>Einschmelzen?</b>Zum Bestätigen nochmal klicken.</span>'); break; }
        const val = GL.meta.scrap(profile, el.dataset.id);
        ui.scrapArmed = null; saveProfile(); toast(`<span><b>Eingeschmolzen</b>+${val} Berry</span>`); draw();
        break;
      }
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
      // Account zurücksetzen (Name und Aussehen bleiben) oder ganz löschen. Zweimal klicken zum Bestätigen.
      case 'acc-reset':
      case 'acc-delete': {
        const kind = type === 'acc-reset' ? 'reset' : 'delete';
        if (ui.accArmed !== kind) { ui.accArmed = kind; ui.lastStage = null; draw(); if (ui.screen) { document.getElementById('title').dataset.last = ''; draw(); } break; }
        el.disabled = true; el.textContent = 'Einen Moment …';
        const keep = { nickname: profile.nickname, char: profile.char, cos: profile.cos };
        const done = () => {
          try {
            ['grandline.run', 'grandline.profile', 'grandline.best'].forEach(k => localStorage.removeItem(k));
            sessionStorage.removeItem('gl.pulled');
            if (kind === 'reset') {
              const fresh = Object.assign(GL.meta.newProfile(), keep, { savedAt: Date.now() });
              localStorage.setItem('grandline.profile', JSON.stringify(fresh));
            }
          } catch (e2) { /* egal */ }
          location.reload();
        };
        const p = GL.online && GL.online.wipe ? GL.online.wipe(kind === 'delete', keep) : Promise.resolve();
        Promise.race([p, new Promise(r => setTimeout(r, 4000))]).then(done, done);
        break;
      }
      case 'mail-link':
      case 'mail-login': {
        const inp = document.getElementById('mail');
        const v = inp ? inp.value.trim() : '';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { toast('<span><b>E-Mail prüfen</b>Bitte eine gültige Adresse eingeben.</span>'); break; }
        (type === 'mail-link' ? GL.online.linkEmail(v) : GL.online.loginEmail(v)).then(res => {
          ui.loginError = res.ok ? null : res.msg;
          if (!res.ok) toast(`<span><b>Hat nicht geklappt</b>${res.msg}</span>`);
          const t = document.getElementById('title'); if (t) t.dataset.last = '';
          ui.lastStage = null; draw();
        });
        break;
      }
      case 'code-show': ui.codeShow = !ui.codeShow; ui.lastStage = null; draw(); break;
      case 'code-copy': {
        const c = profile.playerCode;
        const ok = () => toast('<span><b>Spielercode kopiert</b>Gut aufheben und niemandem zeigen.</span>');
        if (navigator.clipboard) navigator.clipboard.writeText(c).then(ok, () => { ui.codeShow = true; ui.lastStage = null; draw(); });
        else { ui.codeShow = true; ui.lastStage = null; draw(); }
        break;
      }
      case 'code-mail': {
        const body = `Mein Grand-Line-Spielercode (geheim halten!):\n\n${profile.playerCode}\n\nAnmelden: ${location.origin}${location.pathname} → Anmelden → Mit Spielercode`;
        location.href = `mailto:?subject=${encodeURIComponent('Mein Grand-Line-Spielercode')}&body=${encodeURIComponent(body)}`;
        break;
      }
      case 'code-login': {
        const inp = document.getElementById('code-in');
        const v = inp ? inp.value : '';
        const t0 = document.getElementById('title');
        if (!GL.code.valid(v)) { ui.codeError = 'Der Code hat 16 Zeichen, z. B. K7QF-9XKD-M2PA-4TRB.'; if (t0) t0.dataset.last = ''; draw(); break; }
        el.disabled = true; el.textContent = 'Suche Spielstand …';
        GL.online.codeLoad(v).then(res => {
          if (!res.ok || !res.data) {
            ui.codeError = res.ok ? 'Zu diesem Code gibt es keinen Spielstand. Tippfehler? Auf dem anderen Gerät einmal das Spiel öffnen, damit er gespeichert wird.' : res.msg;
            if (t0) t0.dataset.last = ''; draw(); return;
          }
          const p = res.data;
          p.playerCode = GL.code.format(v);
          p.savedAt = Date.now();
          GL.save.replaceProfile(p);
          try { localStorage.removeItem('grandline.run'); sessionStorage.setItem('gl.pulled', '1'); } catch (e2) { /* egal */ }
          toast(`<span><b>Willkommen zurück, ${esc2(p.nickname || 'Pirat')}!</b>Spielstand geladen.</span>`);
          setTimeout(() => location.reload(), 700);
        }).catch(err => { ui.codeError = err.message; if (t0) t0.dataset.last = ''; draw(); });
        break;
      }
      case 'xfer-copy': {
        GL.transfer.exportCode(profile).then(code => {
          ui.xferCode = code; ui.transferOpen = true;
          const t = document.getElementById('title'); if (t) t.dataset.last = '';
          draw();
          const done = () => toast('<span><b>Code kopiert</b>Jetzt an dich selbst schicken und am anderen Gerät einfügen.</span>');
          if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, () => toast('<span><b>Bitte den Code markieren und kopieren</b>Er steht im Feld unter dem Knopf.</span>'));
        });
        break;
      }
      case 'xfer-import': {
        const inp = document.getElementById('xfer-in');
        GL.transfer.importCode(inp ? inp.value : '').then(p => {
          p.savedAt = Date.now();
          GL.save.replaceProfile(p);
          try { localStorage.removeItem('grandline.run'); sessionStorage.setItem('gl.pulled', '1'); } catch (e2) { /* egal */ }
          toast('<span><b>Spielstand übernommen</b>Lädt neu …</span>');
          setTimeout(() => location.reload(), 600);
        }).catch(err => toast(`<span><b>Hat nicht geklappt</b>${esc2(err.message)}</span>`));
        break;
      }
      case 'logout': {
        if (!ui.logoutArmed) { ui.logoutArmed = true; const t = document.getElementById('title'); if (t) t.dataset.last = ''; draw(); break; }
        el.disabled = true; el.textContent = 'Melde ab …';
        const done = () => {
          // Lokale Kopie weg, damit kein zweiter Eintrag mit deinem Namen entsteht. Online bleibt alles im Konto.
          try { ['grandline.run', 'grandline.profile', 'grandline.best', 'grandline.uid'].forEach(k => localStorage.removeItem(k)); sessionStorage.removeItem('gl.pulled'); } catch (e2) { /* egal */ }
          location.reload();
        };
        Promise.race([GL.online.logout(), new Promise(r => setTimeout(r, 3000))]).then(done, done);
        break;
      }
      case 'mail-code': {
        const inp = document.getElementById('mail-code');
        const v = inp ? inp.value.replace(/\D/g, '') : '';
        if (v.length < 6) { toast('<span><b>Code prüfen</b>Der Code aus der Mail hat 6 Ziffern.</span>'); break; }
        el.disabled = true; el.textContent = 'Prüfe …';
        GL.online.verifyCode(v).then(res => {
          if (res.ok) {
            toast('<span><b>Angemeldet</b>Dein Account wird geladen …</span>');
            try { sessionStorage.removeItem('gl.pulled'); } catch (e2) { /* egal */ }
            setTimeout(() => location.reload(), 700);
          } else {
            toast(`<span><b>Hat nicht geklappt</b>${res.msg}</span>`);
            ui.lastStage = null; draw();
          }
        });
        break;
      }
      case 'mail-again': {
        const st = GL.online.state();
        st.mailSent = ''; ui.lastStage = null;
        const t = document.getElementById('title'); if (t) t.dataset.last = '';
        draw();
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
      case 'quest-claim': {
        const r = GL.meta.questClaim(profile, el.dataset.id);
        if (r) {
          toast(`<span><b>Auftrag erledigt!</b>+${r.q.berry} Berry, +${r.q.xp} Rang-EP${r.ups.length ? ` · Neuer Rang: ${GL.data.ranks[r.ups[r.ups.length - 1]].name}` : ''}</span>`);
          saveProfile(); ui.lastStage = null; draw();
        }
        break;
      }
      case 'quest-reroll': {
        if (GL.meta.questReroll(profile, el.dataset.id)) { saveProfile(); ui.lastStage = null; draw(); }
        break;
      }
      case 'train': {
        const u = run && run.crew[i];
        if (!u) break;
        const plan = { atk: ['atk'], hp: ['hp'], spd: ['spd'], mix: ['hp', 'atk'] }[el.dataset.c] || ['atk'];
        let k = 0;
        while (run.crew[i].points > 0) { act({ type: 'spend', index: i, stat: plan[k % plan.length] }); k++; if (k > 40) break; }
        break;
      }
      case 'train-auto': {
        if (!run) break;
        let g = 0;
        run.crew.forEach((u, j) => {
          while (run.crew[j].points > 0 && g++ < 200) {
            const rec = GL.advice.stat(run, j);
            act({ type: 'spend', index: j, stat: rec ? rec.stat : 'atk' });
          }
        });
        toast('<span><b>Training erledigt</b>Alle haben das empfohlene Training bekommen.</span>');
        break;
      }
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
      if (b && !b.disabled) { e.preventDefault(); keyPick = true; b.click(); keyPick = false; }
      return;
    }
    // Leertaste/Enter = Universal-Weiter: Kampf starten, schneller, überspringen, weiter
    if ((e.key === 'Enter' || e.key === ' ') && !(e.target.matches && e.target.matches('button, .member, .crewmini'))) {
      e.preventDefault();
      if (anim && !anim.done) {
        stage.querySelector(anim.fast ? '[data-act=skip]' : '[data-act=fast]')?.click();
        return;
      }
      const main = stage.querySelector('[data-act=continue], [data-act=fight], [data-act=sail], [data-act=again], [data-act=hq], [data-act=leave]');
      if (main) main.click();
      return;
    }
    if ((e.key === 'f' || e.key === 'F') && anim) { stage.querySelector('[data-act=fast]')?.click(); return; }
    if ((e.key === 'h' || e.key === 'H') && !anim) { stage.querySelector('[data-act=hq]')?.click(); return; }
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

  document.addEventListener('input', e => {
    if (e.target.id === 'pf-name' && ui.draft) ui.draft.name = e.target.value;
  });

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
  // Lebenszeichen für die Live-Anzeige "auf See": alle 2 Minuten, solange das Spiel offen ist
  setInterval(() => {
    if (document.hidden || !profile.nickname || !GL.online || !GL.online.register) return;
    GL.online.register(profile);
  }, 120000);
  syncProfile();
  draw();
  // Online-Rangliste: neu zeichnen, wenn sich Einträge ändern (nur im Hauptquartier sichtbar)
  if (GL.online) {
    GL.online.onChange(() => { if (!run && document.activeElement && document.activeElement.id !== 'nick') draw(); });
    // Online liegt ein neuerer Spielstand (anderes Gerät): übernehmen und neu laden
    GL.online.onRemoteProfile(remote => {
      if (sessionStorage.getItem('gl.pulled')) return;
      try { sessionStorage.setItem('gl.pulled', '1'); } catch (e2) { /* egal */ }
      GL.save.replaceProfile(remote);
      location.reload();
    });
    GL.online.init(profile);
  }
})();
