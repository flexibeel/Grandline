// Startpunkt: verbindet Spiellogik, Speicherstand und Oberfläche.
(function () {
  const profile = GL.save.loadProfile();
  if (profile.nickname && !profile.playerCode) { GL.code.ensure(profile); GL.save.storeProfile(profile); }
  // Vitrine-Beute einmalig als Trophäen für die Stammcrew bereitstellen
  if (GL.cgear && profile.nickname && !profile.trophyInit && GL.meta.featureOpen(profile, 'stammcrew')) { GL.cgear.migrate(profile); GL.save.storeProfile(profile); }

  // run = null bedeutet: wir sind im Hauptquartier
  let run = GL.save.loadRun();
  let anim = null;                       // läuft gerade eine Kampfanimation?
  const ui = { restartArmed: false, newBest: false, album: null, sheet: null, profile, lastStage: null, lastBerry: null,
    intro: null, screen: 'title' };   // screen: 'title' (Startbildschirm) | 'profile' (Profil anlegen) | null
  // Willkommen zurück: nach mehr als drei Tagen Pause einmal kurz zeigen, was neu ist
  if (profile.nickname && (profile.rankXp || 0) > 0 && profile.lastVisit && Date.now() - profile.lastVisit > 3 * 864e5) ui.welcomeDue = true;
  ui.welcomeFrom = profile.lastVersion || null;
  // Großes Update (Landgang, Begleiter, Sounds): einmal die Neuigkeiten zeigen
  if (profile.nickname && (profile.rankXp || 0) > 0 && profile.lastVersion && profile.lastVersion < '2026-10-18j') ui.welcomeDue = true;
  profile.lastVisit = Date.now(); profile.lastVersion = GL.version;

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
  function moodNote() {
    if (!run || !run.mood || run.phase === 'starter' || ui.moodShown === run.seed || (run.step || 0) > 1) return;
    ui.moodShown = run.seed;
    const m = (GL.config.moods || []).find(x => x.id === run.mood);
    if (m) setTimeout(() => toast(`<span><b>${m.icon} Laune der See: ${m.name}</b>${m.text}</span>`), 600);
  }
  function draw() { autoArrange(); moodNote(); GL.ui.render(run, anim, ui); featureCheck(); livePos(); musicMode(); if (ui.petQueue && ui.petQueue.length) setTimeout(showPets, 450); }
  // Musik: Titelbild etwas hörbarer, Hauptquartier leise, auf Fahrt ganz leise
  function musicMode() {
    if (!GL.music) return;
    GL.music.setMode(ui.screen || ui.intro != null ? 'title' : run && !GL.run.isFinished(run) ? 'run' : 'hq');
    const slot = document.getElementById('mu-slot');
    if (slot) { const fc = (profile.friends || []).length, onl = GL.friends && GL.online ? (profile.friends || []).filter(c => { const r = GL.friends.rowOf(c); return r && Date.now() - Date.parse(r.updated || 0) < 240000; }).length : 0;
      const h = (profile.nickname ? `<button class="mu-btn head fr-btn" data-act="friends-open" aria-label="Freunde" title="Freunde${fc ? ': ' + fc : ''}">${GL.ui.friendsIcon}${onl ? `<em class="fr-on">${onl}</em>` : ''}</button>` : '') + `<button class="mu-btn head lang-btn" data-act="lang" title="Deutsch / English">${GL.i18n && GL.i18n.lang() === 'en' ? 'DE' : 'EN'}</button><button class="mu-btn head wk-btn${profile.wikiSeen ? '' : ' fresh'}" data-act="wiki-open" aria-label="Wiki öffnen" title="Wiki: Nachschlagen und Meta">${GL.ui.wikiIcon}</button>${GL.ui.musicBtn ? GL.ui.musicBtn('head') + GL.ui.sfxBtn('head') : ''}`; if (slot.innerHTML !== h) slot.innerHTML = h; }
  }
  // Automatische Aufstellung vor jedem Kampf: Brecher vorne, Kämpfer in der Mitte, Helfer hinten.
  // Läuft über normale Tausch-Aktionen, damit Replays gleich bleiben. Kein Umsortieren per Hand mehr.
  const ROLE_ORDER = { brecher: 0, kaempfer: 1, helfer: 2 };
  // Großer Auftritt vor Boss, Raid und Bösewicht: Figur fährt ins Bild, dann startet der Kampf
  function startFight() {
    if (!run || run.phase !== 'prep') return;
    const p = run.pending || {};
    const big = p.enemies && p.enemies.find(e => e.boss || e.mini || e.raid);
    if (document.querySelector('.boss-show')) return;   // Auftritt läuft schon: doppeltes Tippen nicht durchreichen
    if (!big || p.rival) { act({ type: 'fight' }); return; }
    const d = (GL.data.bosses.concat(GL.data.raids || [], GL.data.hunted || [])).find(x => x.id === big.id) || GL.data.crew.find(x => x.id === big.id) || {};
    const kind = p.kind === 'raid' ? 'Raid-Boss' : p.kind === 'boss' ? 'Boss des Meeres' : p.gate ? 'Bösewicht der Insel' : 'Kopfgeld-Ziel';
    const ab = GL.data.abilities[big.id];
    const esc = t => String(t || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const el = document.createElement('div');
    el.className = 'boss-show' + (p.kind === 'raid' ? ' raid' : p.kind === 'boss' ? ' boss' : ' mini');
    el.innerHTML = `<div class="bs-rays"></div><div class="bs-stripe"></div>
      <div class="bs-fig">${GL.sprites.renderShaded ? GL.sprites.renderShaded(d.look ? d : big) : GL.sprites.render(d)}</div>
      <div class="bs-card"><small>${kind}</small><b>${esc(d.name || big.name)}</b>
        ${d.bounty ? `<em>Kopfgeld ${d.bounty} Mio. ฿</em>` : ''}${ab ? `<i>${esc(ab.name)}</i>` : ''}</div>
      <span class="bs-tap">Tippen zum Starten</span>`;
    let done = false;
    const go = e => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (done) return; done = true; clearTimeout(auto);
      el.classList.add('out'); setTimeout(() => el.remove(), 180);
      suppressClick = false; act({ type: 'fight' });
    };
    el.addEventListener('click', go);
    el.addEventListener('touchend', e => { if (Date.now() - shownAt > 250) go(e); }, { passive: false });
    const shownAt = Date.now();
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    const auto = setTimeout(() => go(), document.body.classList.contains('fast') ? 1200 : 2000);
  }
  function autoArrange() {
    if (!run || run.phase !== 'prep' || !run.crew || run.crew.length < 2) return;
    const key = run.seed + ':' + run.step + ':' + (run.actions ? run.actions.length : 0);
    if (ui.arranged === key) return;
    const rank = u => {
      const d = GL.data.crew.find(c => c.id === u.id) || {};
      const role = u.role || d.role;
      return (u.hp <= 0 ? 10 : 0) + (ROLE_ORDER[role] != null ? ROLE_ORDER[role] : 1);
    };
    const want = run.crew.map((u, i) => ({ i, r: rank(u), hp: u.max || u.hp })).sort((a, b) => a.r - b.r || b.hp - a.hp || a.i - b.i).map(x => x.i);
    // Auswahl-Sortierung mit Nachbar-Tausch (wenige Aktionen)
    const order = run.crew.map((_, i) => i);
    let changed = false;
    for (let pos = 0; pos < want.length; pos++) {
      let at = order.indexOf(want[pos]);
      while (at > pos) { if (!GL.run.act(run, { type: 'swap', a: at - 1, b: at })) return; [order[at - 1], order[at]] = [order[at], order[at - 1]]; at--; changed = true; }
    }
    ui.arranged = run.seed + ':' + run.step + ':' + (run.actions ? run.actions.length : 0);
    if (changed) GL.save.storeRun(run);
  }
  // Wo bin ich gerade? (für die Rangliste: „gerade auf See“)
  function livePos() {
    if (!run || GL.run.isFinished(run) || run.phase === 'starter') { GL.livePos = null; return; }
    GL.livePos = { sea: GL.run.island(run).name, isl: (GL.run.chapterIsland(run) || {}).name || null, step: run.step, daily: !!run.daily };
  }
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { const t = document.getElementById('title'); if (t) t.dataset.last = ''; ui.lastStage = null; draw(); }));

  // Neu freigeschaltete Bereiche im Hauptquartier: ein ruhiges Pop-up nach dem anderen
  function featureCheck() {
    const old = document.getElementById('fpop');
    if (old && old.dataset.id === 'feedback') return;
    if (old && (old.dataset.id === 'install' || old.dataset.id === 'notes' || old.dataset.id === 'duel' || old.dataset.id === 'gear' || old.dataset.id === 'welcome')) return;
    if (!run && !ui.screen && ui.intro == null && !old && ui.welcomeDue) { ui.welcomeDue = false; openWelcome(); return; }
    if (!run && !ui.screen && ui.intro == null && !old && feedbackDue()) { openFeedback(); return; }
    if (!run && !ui.screen && ui.intro == null && !old && installDue()) { openInstall(); return; }
    if (run || ui.screen || ui.intro != null || !profile.nickname || !GL.meta.featuresNew) { if (old && !ui.fpop) old.remove(); return; }
    const fresh = !profile.seenFeatures;
    // Erste Funde zuerst (ein Fenster, kurz und freundlich). Bestehende Spieler: alte Funde gelten als gesehen.
    if (!profile.firstSeen) { profile.firstSeen = {}; if ((profile.rankXp || 0) > 0 && !profile.testerPops) (GL.data.firsts || []).forEach(x => { if (x.has(profile)) profile.firstSeen[x.id] = 1; }); saveProfile(); }
    const first = ui.firstDone ? null : (GL.data.firsts || []).find(x => !profile.firstSeen[x.id] && x.has(profile));
    const list = first ? [Object.assign({}, first, { tab: first.tab && GL.meta.featureOpen(profile, first.tab === 'lager' ? 'lager' : first.tab) ? first.tab : null })]
      : GL.meta.featuresNew(profile).slice().sort((a, b) => (!!b.tab - !!a.tab) || a.lvl - b.lvl), f = list[0];
    if (fresh) saveProfile();
    if (!f) { if (old) old.remove(); return; }
    if (old && old.dataset.id === f.id) return;
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = f.id;
    el.innerHTML = GL.ui.featurePop(f, list.slice(1));
    if (GL.sfx) GL.sfx.play(el.querySelector('.fpop-wow') ? 'found' : 'level');
    el.addEventListener('click', e => { if (e.target === el) closeFeature(f.id, false); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
  }
  // Als App installieren: einmal nach dem 1. Run (bei „Später“ noch einmal nach dem 5.), nur auf dem Handy im Browser
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  const isAppMode = () => { try { return matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone; } catch (e) { return false; } };
  const isPhone = () => { try { return matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900; } catch (e) { return false; } };
  function installDue() {
    if (!profile.nickname || isAppMode() || !isPhone() || ui.instOpen === false) return false;
    if (GL.meta.featuresNew && GL.meta.featuresNew(profile).length) return false;
    const runs = (profile.stats && profile.stats.runs) || 0, n = profile.installAsked || 0;
    return (n === 0 && runs >= 1) || (n === 1 && runs >= 5);
  }
  function openInstall() {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const el = document.createElement('div');
    el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = 'install';
    el.innerHTML = GL.ui.installPop(ios ? 'ios' : installEvt ? 'prompt' : 'android');
    document.body.appendChild(el);   // kein Wegtippen über den Rand: bewusst „Verstanden“ oder „Später“ wählen
    requestAnimationFrame(() => el.classList.add('in'));
  }
  function closeInstall() {
    profile.installAsked = (profile.installAsked || 0) + 1; saveProfile();
    ui.instOpen = false;
    const el = document.getElementById('fpop');
    if (el) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => { el.remove(); ui.instOpen = null; }, 260); }
  }

  // Bewertung nach dem 2. Run (und bei „Später“ noch einmal nach dem 6.)
  function feedbackDue() {
    if (!profile.nickname || GL.sandbox.on() || ui.fbOpen === false) return false;
    if (GL.meta.featuresNew && GL.meta.featuresNew(profile).length) return false;
    const runs = (profile.stats && profile.stats.runs) || 0, fb = profile.fb || {};
    if (fb.sent) return false;
    if (!fb.asked) return runs >= 2;
    return fb.asked === 1 && runs >= 6;
  }
  function openGearPop(html) {
    const old = document.getElementById('fpop'); if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = 'gear';
    el.innerHTML = html;
    el.addEventListener('click', e => { if (e.target === el) closePop(); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
  }
  // Jedes Fenster bekommt oben rechts einen schönen Schließen-Knopf (Handy: schnell raus)
  (function popCloser() {
    const add = () => {
      const card = document.querySelector('#fpop .fpop-card');
      if (!card || card.querySelector('.pop-x, .tv-sheet-x') || card.dataset.noclose) return;
      const old = card.querySelector('.dr-x'); if (old) old.remove();
      const b = document.createElement('button');
      b.className = 'pop-x'; b.dataset.act = 'pop-close'; b.setAttribute('aria-label', 'Schließen'); b.innerHTML = '<span>✕</span>';
      card.prepend(b);
    };
    new MutationObserver(add).observe(document.body, { childList: true, subtree: true });
  })();
  // Ankleidemenü öffnen bzw. ohne Flackern neu zeichnen
  function showDress(patch) {
    ui.dress = Object.assign({}, ui.dress || {}, patch || {});
    const html = GL.ui.dressRoom(profile, ui.dress);
    const el = document.getElementById('fpop');
    if (el && el.querySelector('.dress-pop')) {
      const sc = el.querySelector('.dress-pop').scrollTop, ws = el.scrollTop;
      el.innerHTML = html;
      const dp = el.querySelector('.dress-pop'); if (dp) dp.scrollTop = sc; el.scrollTop = ws;
    } else openGearPop(html);
  }
  function squadPushLater() { clearTimeout(ui.squadPush); ui.squadPush = setTimeout(() => { if (GL.online && GL.online.register) GL.online.register(profile); }, 1500); }
  // Karte auf Platz k setzen: steht sie schon in der Crew, tauschen beide die Plätze
  function squadPlace(id, k) {
    const ids = GL.meta.squadIds(profile).slice(), j = ids.indexOf(id);
    if (j >= 0) { if (k < ids.length) { const t = ids[k]; ids[k] = id; ids[j] = t; } }
    else if (k < ids.length) ids[k] = id; else ids.push(id);
    profile.squad = ids.filter(Boolean); saveProfile(); squadPushLater();
    if (GL.sfx) GL.sfx.play('tap');
  }
  // Kleine Reaktion beim Ausrüsten (einmal pro Teil etwas Vertrautheit)
  const GEAR_SAY = { waffe: ['Oh, die liegt gut in der Hand!', 'Damit trau ich mich an jeden Boss!', 'Scharf. Sehr scharf.'], kleid: ['Steht mir, oder?', 'Gemütlich und robust!', 'Jetzt seh ich aus wie ein echter Pirat!'], schmuck: ['Glänzt das schön!', 'Fühlt sich nach Glück an.', 'Für mich? Danke!'], trophae: ['Die kommt an einen Ehrenplatz!', 'Damit erzähl ich noch lange Geschichten.', 'Was für eine Erinnerung!'] };
  function gearThanks(crewId, it) {
    if (!it) return;
    const slot = GL.cgear.slotOf(it), L = GEAR_SAY[slot] || GEAR_SAY.waffe;
    profile.gearThanked = profile.gearThanked || [];
    const first = !profile.gearThanked.includes(it.uid);
    if (first) { profile.gearThanked.push(it.uid); if (profile.gearThanked.length > 300) profile.gearThanked.shift(); profile.squadXp = profile.squadXp || {}; profile.squadXp[crewId] = (profile.squadXp[crewId] || 0) + 5; }
    const d = crewId === 'self' ? { id: 'self', name: profile.nickname || 'Du', look: GL.meta.selfDef(profile).look } : GL.data.crew.find(c => c.id === crewId) || {};
    const line = L[(it.uid.length + (profile.gearThanked.length || 0)) % L.length];
    if (GL.sfx) GL.sfx.play('found');
    toast(`<span class="toast-say"><i>${GL.sprites.render(d)}</i><span><b>${esc2(d.name || '')}</b>„${esc2(line)}“${first ? ' <em class="ts-bond">♥ +5</em>' : ''}</span></span>`);
  }
  function openWelcome() {
    const el = document.createElement('div');
    el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = 'welcome';
    el.innerHTML = GL.ui.welcomePop(profile, ui.welcomeFrom);
    el.addEventListener('click', e => { if (e.target === el) closePop(); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
  }
  function openFeedback() {
    const old = document.getElementById('fpop'); if (old) old.remove();
    ui.fbStars = 0;
    const el = document.createElement('div');
    el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = 'feedback';
    el.innerHTML = GL.ui.feedbackPop(0);
    el.addEventListener('click', e => { if (e.target === el) closeFeedback(false); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
  }
  function closeFeedback(sent) {
    profile.fb = Object.assign({}, profile.fb || {}, { asked: ((profile.fb && profile.fb.asked) || 0) + (sent ? 0 : 1), sent: !!sent || !!(profile.fb && profile.fb.sent) });
    saveProfile();
    ui.fbOpen = false;
    const el = document.getElementById('fpop');
    if (el) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => { el.remove(); ui.fbOpen = null; }, 260); }
  }
  function closeFeature(id, go) {
    const fst = (GL.data.firsts || []).find(x => x.id === id);
    if (fst) { profile.firstSeen = profile.firstSeen || {}; profile.firstSeen[id] = 1; ui.firstDone = true; saveProfile(); }   // höchstens ein Fund-Fenster pro Besuch
    else { GL.meta.featuresNew(profile).forEach(x => GL.meta.featureSeen(profile, x.id)); GL.meta.featureSeen(profile, id); saveProfile(); }
    const f = fst || (GL.data.features || []).find(x => x.id === id);
    const el = document.getElementById('fpop');
    if (el) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => { el.remove(); draw(); }, 260); }
    if (go && f && f.tab) { ui.hqTab = f.tab; ui.hqRoom = f.tab; ui.lastStage = null; window.scrollTo(0, 0); }
    if (!el) draw();
  }

  // Neue Freischaltungen kurz einblenden
  function toast(html) {
    const box = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 3400);
    setTimeout(() => t.remove(), 3900);
  }

  function saveProfile() { if (profile.nickname) GL.code.ensure(profile); GL.save.storeProfile(profile); }

  // Neu freigespielte Kosmetik kurz zeigen (Hintergrund, Rahmen, Animation, Titel, Flagge)
  const COS_KIND = { backgrounds: 'Hintergrund', frames: 'Rahmen', animations: 'Animation', titles: 'Titel', flags: 'Flagge', badges: 'Abzeichen' };
  const allCos = () => Object.assign({}, GL.data.cosmetics, { badges: GL.data.badges || [] });
  function checkCosmetics() {
    if (GL.devAll) return;   // Entwickler-Konto hat alles frei, keine Flut an Meldungen
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
    GL.data.islands.concat(GL.data.islands.filter(x => x.alt).map(x => x.alt)).forEach((isl, k) => {
      const i = k < GL.data.islands.length ? k : GL.data.islands.findIndex(x => x.alt === isl);
      if (profile.chapterSeen.includes(isl.id)) return;
      if (!GL.meta.chapterProgress(profile, k < GL.data.islands.length ? i : isl).complete) return;
      profile.chapterSeen.push(isl.id);
      const reward = 150 * (i + 1);
      profile.berry = (profile.berry || 0) + reward;
      toast(`<span><b>Kapitel abgeschlossen: ${isl.name}</b>Alle Bösewichte und Bosse dieses Meeres besiegt. +${reward} Berry.</span>`);
    });
  }

  // Sammelbuch-Stufen einlösen (Berry sofort, Begleiter mit eigenem Fenster)
  function checkAlbum() {
    GL.meta.albumClaim(profile).forEach(x => {
      if (x.berry) toast(`<span><b>Sammelbuch: neue Stufe!</b>+${x.berry} Berry fürs fleißige Entdecken.</span>`);
      if (x.pet) ui.petQueue = (ui.petQueue || []).concat(x.pet);
    });
  }
  // Wartende Begleiter-Fenster zeigen, sobald gerade nichts anderes offen ist und kein Kampf läuft
  function showPets() {
    if (!ui.petQueue || !ui.petQueue.length || document.getElementById('fpop') || (anim && !anim.done)) return;
    const id = ui.petQueue.shift();
    openGearPop(GL.ui.petPop(id, profile));
    if (GL.sfx) GL.sfx.play('found');
  }

  function syncProfile() {
    if (!run) return saveProfile();
    GL.meta.update(profile, run).forEach(n => {
      if (n.kind === 'crew') {
        const d = GL.data.crew.find(c => c.id === n.id);
        toast(`<i>${GL.sprites.render(d)}</i><span><b>Freigeschaltet: ${d.name}</b>Ab jetzt als Kapitän wählbar und rekrutierbar.</span>`);
      } else if (n.kind === 'pet') {
        // Begleiter: eigenes kleines Fenster (erster Begleiter wird gleich mitgenommen)
        if (!(profile.cos && profile.cos.pet)) profile.cos = Object.assign({}, profile.cos, { pet: n.id });
        ui.petQueue = (ui.petQueue || []).concat(n.id);
      } else if (n.kind === 'epic') {
        const f = GL.data.fruits.find(x => x.id === n.id);
        toast(`<i>${GL.sprites.icon('fruit', f.id, true)}</i><span><b>Epische Frucht: ${f.name}</b>Taucht ab jetzt in deinen Runs auf.</span>`);
      }
    });
    checkChapters();
    checkAlbum();
    checkCosmetics();
    (profile.quests || []).forEach(q => {
      if (!q.told && GL.meta.questProgress(profile, q).done) {
        q.told = true;
        toast(`<span><b>Auftrag erfüllt: ${GL.meta.questDef(q).icon} ${GL.meta.questDef(q).text.replace('{n}', q.n)}</b>Belohnung im Hauptquartier abholen.</span>`);
      }
    });
    GL.save.storeProfile(profile);
  }

  // Alle offenen Statuspunkte nach Empfehlung verteilen
  function autoTrainAll(silent) {
    let g = 0;
    run.crew.forEach((u, j) => {
      while (run.crew[j].points > 0 && g++ < 200) {
        const rec = GL.advice.stat(run, j);
        if (!GL.run.act(run, { type: 'spend', index: j, stat: rec ? rec.stat : 'atk' })) return;
      }
    });
    if (silent) return;
    GL.save.storeRun(run); ui.lastStage = null; draw();
  }

  function act(action) {
    if (!run) return;
    const wasFinished = GL.run.isFinished(run);
    const bountyBefore = run.bountyM || 0;
    const trophiesBefore = (run.trophies || []).length;
    const itemsBefore = (run.items || []).length;
    const luckyBefore = run.luckyN || 0;
    const lootBefore = (run.loot || []).length;
    const mergeBefore = run.lastMerge;
    if (!GL.run.act(run, action)) return;
    // Sterne zusammengelegt: kleiner Glanzmoment
    if (run.lastMerge && run.lastMerge !== mergeBefore) {
      const mg = run.lastMerge, cd = GL.data.crew.find(c => c.id === mg.id) || {};
      if (GL.sfx) setTimeout(() => GL.sfx.play('level'), 120);
      ui.mergeFx = mg.id;
      setTimeout(() => { ui.mergeFx = null; }, 1600);
      toast(`<span class="toast-merge"><i>${GL.sprites.render(cd)}</i><span><b>${'★'.repeat(mg.to)} ${esc2(cd.name || '')} zusammengelegt!</b>+${mg.hp} Leben, +${mg.atk} Angriff, voll geheilt.</span></span>`);
    }
    if (profile.settings && profile.settings.autoTrain && action.type !== 'spend' && run.crew.some(u => u.points > 0)) autoTrainAll(true);
    if ((run.loot || []).length > lootBefore) run.loot.slice(lootBefore).forEach((id, k) => {
      const l = (GL.data.huntLoot || []).find(x => x.id === id);
      if (l) setTimeout(() => toast(`<span class="toast-item ir-${l.r >= 3 ? 'legendary' : 'epic'}"><b>Raid-Beute: ${l.name}</b>${l.r >= 3 ? 'Legendär!' : 'Episch.'} Kommt nach dem Run in deine Vitrine.</span>`), 1400 + k * 600);
    });
    if ((run.luckyN || 0) > luckyBefore && run.lucky) toast(`<span><b>🍀 Glücksfund!</b>Eine Goldtruhe: +${run.lucky.gold} Gold${run.lucky.item ? ' und seltene Ausrüstung' : ''}.</span>`);
    // Neue Ausrüstung gefunden: kurze Meldung in der Farbe der Seltenheit
    if ((run.items || []).length > itemsBefore) {
      const it = run.items[run.items.length - 1];
      const d = GL.data.items.find(x => x.id === it.id);
      const R = GL.config.rarities[it.r];
      const wearer = it.auto && run.crew.find(u => u.item === it.uid);
      const wName = wearer ? ((GL.data.crew.find(c => c.id === wearer.id) || {}).name || wearer.name || 'Crew') : '';
      setTimeout(() => toast(`<span class="toast-item ir-${R.id}"><b>${R.name}: ${d.name}</b><span>${wearer ? `Automatisch angelegt bei ${esc2(wName)}. Antippen einer Figur hängt um.` : 'Liegt in der Truhe. Figur antippen, „Ausrüstung“ wählen.'}</span></span>`), 900);
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
      ui.lastBond = GL.meta.runBond ? GL.meta.runBond(profile, run) : null;
      (ui.lastBond || []).filter(b => b.up).forEach(b => {
        const d = b.id === 'self' ? null : GL.data.crew.find(c => c.id === b.id);
        const M = GL.data.momentsOf ? GL.data.momentsOf(b.id, d ? d.role : 'kaempfer') : [];
        if (M.some(m => m.lvl === b.lvl)) setTimeout(() => toast(`<span><b>♥ Neuer Moment mit ${esc2(b.name)}</b>Tippe im Hafen auf die Figur und öffne den Steckbrief.</span>`), 1600);
      });
      ui.firstDone = false;
      // Tester-Modus (nur Entwickler): nach jedem Run wieder ein Tipp-Fenster, jeder dritte Run fragt nach Bewertung
      if (profile.testerPops) {
        const open = (GL.data.features || []).filter(f => GL.meta.featureOpen(profile, f.id));
        if (open.length) {
          profile.testerIdx = ((profile.testerIdx || 0) + 1) % open.length;
          profile.seenFeatures = (profile.seenFeatures || []).filter(id => id !== open[profile.testerIdx].id);
        }
        if (((profile.stats && profile.stats.runs) || 0) % 3 === 0) { profile.fb = {}; ui.fbOpen = null; }
        if (((profile.stats && profile.stats.runs) || 0) % 4 === 0) { ui.welcomeDue = true; ui.welcomeFrom = (GL.patchNotes[3] || {}).v; }
        profile.firstSeen = {};
      }
      if (run.daily) {
        const sc = GL.run.score(run);
        profile.daily = { d: run.daily, score: sc };
        const bonus = 60 + 10 * Math.min(7, profile.dailyStreak || 1), xpB = 25;
        profile.berry += bonus; GL.meta.addRankXp(profile, xpB);
        ui.lastBerry = (ui.lastBerry || 0) + bonus;
        // Tagesbeute: ein Ausrüstungsstück für die Crew. Sieg = sicher episch (mit Glück legendär), sonst 30 % episch
        let loot = null;
        if (GL.cgear) {
          const won = run.phase === 'win', x = Math.random();
          const r = won ? (x < 0.12 ? 3 : 2) : (x < 0.3 ? 2 : 1);
          loot = GL.cgear.roll({ r, name: 'Tageskarte', seaName: 'Tagesbeute', sea: Math.min(2, GL.run.islandIndex(run)) });
          GL.cgear.bag(profile).push(loot);
        }
        const lootTxt = loot ? ` Tagesbeute: ${GL.cgear.name ? GL.cgear.name(loot) : 'Ausrüstung'} (${['Gewöhnlich', 'Selten', 'Episch', 'Legendär'][loot.r] || ''}).` : '';
        setTimeout(() => toast(`<span><b>Tageskarte geschafft</b>${sc.toLocaleString('de-DE')} Punkte. Bonus: +${bonus} Berry, +${xpB} Rang-EP${(profile.dailyStreak || 1) > 1 ? ` · ${profile.dailyStreak} Tage in Folge` : ''}.${lootTxt}</span>`), 1200);
      }
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
  // Karte: Wettfahrt erstellen (eigener Code zum Teilen) oder Einladung annehmen
  function openDuelPop(code, invited) {
    const old = document.getElementById('fpop'); if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = 'duel';
    el.innerHTML = GL.ui.duelPop(code, invited);
    el.addEventListener('click', e => { if (e.target === el) closePop(); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
  }
  function closePop() {
    const el = document.getElementById('fpop');
    if (el) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), 260); }
  }
  function startDuel(code) {
    let seed;
    if (code) {
      const c = String(code).trim().toLowerCase().replace(/[^0-9a-z]/g, '');
      seed = parseInt(c, 36);
      if (!c || !isFinite(seed) || seed > 0xffffffff) { toast('<span><b>Ungültiger Code</b>Bitte prüfe den Wettfahrt-Code.</span>'); return; }
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

  // Platzierung der letzten Tageskarten auszahlen (sobald die Rangliste geladen ist, ab dem Folgetag)
  const DAILY_PRIZE = [300, 220, 180];
  function checkDailyPay() {
    const st = GL.online && GL.online.state ? GL.online.state() : null;
    if (!st || st.status !== 'ready' || !st.uid || !(profile.dailyPay || []).length) return;
    const today = GL.daily.today();
    const due = profile.dailyPay.filter(d => d < today);
    if (!due.length) return;
    due.forEach(d => {
      const code = GL.daily.code(d);
      const list = (st.rows || []).filter(x => x.duels && x.duels[code]).sort((a, b) => b.duels[code].score - a.duels[code].score);
      const pos = list.findIndex(x => x.id === st.uid);
      if (pos < 0) return;   // eigenes Ergebnis nicht (mehr) in der Liste: nichts auszahlen
      const prize = DAILY_PRIZE[pos] || (pos < 10 ? 120 : 60);
      profile.berry += prize;
      if (pos === 0 && list.length > 1) profile.dailyFirst = (profile.dailyFirst || 0) + 1;
      toast(`<span><b>Tageskarte vom ${d.slice(8, 10)}.${d.slice(5, 7)}.: Platz ${pos + 1} von ${list.length}</b>+${prize} Berry${pos === 0 && list.length > 1 ? ' · Tagessieg!' : ''}</span>`);
    });
    profile.dailyPay = profile.dailyPay.filter(d => d >= today);
    saveProfile();
    if (!run) { ui.lastStage = null; draw(); }
  }

  // Tageskarte: gleicher Seed für alle, keine dauerhaften Boni, ein Versuch pro Tag
  function startDaily() {
    const day = GL.daily.today();
    if (GL.daily.done(profile) || (run && run.daily === day)) { toast('<span><b>Heute schon gesegelt</b>Morgen gibt es eine neue Tageskarte.</span>'); return; }
    stopAnim();
    ui.sheet = null; ui.album = null;
    run = GL.run.create(GL.daily.seed(day), { heat: 0, self: selfNow() });
    run.duel = GL.daily.code(day);
    run.daily = day;
    // Serie: gestern auch gespielt?
    const y = new Date(Date.now() - 864e5); const yd = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    profile.dailyStreak = profile.daily && profile.daily.d === yd ? (profile.dailyStreak || 1) + 1 : 1;
    profile.daily = { d: day, score: null };
    profile.dailyPay = (profile.dailyPay || []).concat([day]).slice(-7);
    ui.newBest = false; ui.lastBerry = null; ui.restartArmed = false;
    saveProfile();
    GL.save.storeRun(run);
    draw();
    window.scrollTo(0, 0);
  }

  // Leinen los: neuer Run mit Werft-Ausbauten und Ausrüstung aus dem Lager
  function sail(endlessSea) {
    stopAnim();
    ui.sheet = null;
    ui.album = null;
    const gear = GL.meta.takeLoadout(profile);
    run = GL.run.create(undefined, {
      unlocked: profile.unlocked, epics: profile.epics, upgrades: profile.upgrades, gear, heat: profile.heat,
      arts: GL.meta.takeArtifacts(profile), self: selfNow(), items: GL.meta.takeItems(profile),
      hunt: GL.meta.featureOpen(profile, 'jagd') ? (profile.hunt || null) : null,
      altOpen: GL.meta.featureOpen(profile, 'route'),
      altOpen1: GL.meta.featureOpen(profile, 'route2'),
      buddy: GL.meta.squadUnlocked(profile) && profile.buddy && GL.meta.squadIds(profile).includes(profile.buddy) && profile.buddy !== 'self' ? profile.buddy : null,
      endlessSea: Number.isInteger(endlessSea) && GL.meta.seasCleared(profile).includes(endlessSea) ? endlessSea : undefined
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
    checkAlbum();
    if (run && !GL.run.isFinished(run)) GL.meta.finishRun(profile, Object.assign({}, run, { phase: 'over', step: 0, bounties: 0, defeated: [], berry: 0 }));
    run = null;
    ui.sheet = null;
    ui.hqRoom = null;
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
      speed: (profile.settings && profile.settings.speed) || 2,
      done: b.events.length === 0,
      timer: null
    };
    document.body.classList.toggle('fast', anim.speed >= 3);
    anim.rn = 0;
    setTimeout(showSpeed, 50);
    anim.timer = setTimeout(stepAnim, SPEED.normal * SPEEDF[anim.speed]);
  }
  // Drei Tempostufen statt Überspringen: Man sieht den Kampf immer, aber er quält nicht
  const SPEEDF = [1, 0.9, 0.55, 0.32, 0.18];
  const showSpeed = () => { const f = document.getElementById('field'); if (f && anim) f.dataset.speed = anim.speed; };

  function stepAnim() {
    if (!anim || anim.done) return;
    const ev = run.battle.events[anim.i++];
    if (!ev) { anim.done = true; if (GL.sfx) GL.sfx.play(run.battle.win ? 'win' : 'lose'); draw(); return; }
    const setHp = (side, to, hp) => { (side === 'crew' ? anim.crewHp : anim.enemyHp)[to] = hp; };
    if (ev.k === 'hit') setHp(ev.side === 'crew' ? 'enemy' : 'crew', ev.to, ev.hp);
    else if (ev.list) ev.list.forEach(x => { if (x.hp !== undefined) setHp(ev.side, x.to, x.hp); });
    if (ev.k === 'round') { anim.rn = ev.n; showSpeed(); anim.timer = setTimeout(stepAnim, anim.speed >= 3 ? 0 : 60); GL.arena.play(ev); return; }
    anim.log = GL.ui.battleText(run, ev) || anim.log;
    // Arena direkt verändern statt neu zu zeichnen, damit Animationen laufen
    GL.arena.play(ev);
    if (GL.sfx) GL.sfx.battle(ev, anim.speed);
    const log = document.getElementById('log');
    if (log) log.textContent = anim.log;
    // Fähigkeiten-Hinweise etwas länger stehen lassen, damit man sie lesen kann
    // Wie bei TFT: lange Kämpfe werden mit den Runden von selbst etwas flotter
    const f = (SPEEDF[anim.speed] || 0.55) * (anim.rn >= 7 ? 0.65 : anim.rn >= 4 ? 0.82 : 1);
    const big = ev.k === 'rage' || ev.k === 'will' || ev.k === 'weather' || ev.final || (ev.k === 'revive' && ev.by === 'vivre');   // Wendepunkte bekommen immer etwas Zeit
    const wait = ev.k === 'special' ? Math.max(900, 1800 * f) : ev.k === 'ult' ? Math.max(500, SPEED.ult * f)
      : ev.k === 'revive' && ev.by === 'vivre' ? Math.max(1700, 2600 * f) : big ? Math.max(900, 1500 * f) : ev.k === 'hit' ? SPEED.normal * f : SPEED.special * f;
    anim.timer = setTimeout(stepAnim, wait);
  }

  function startSquadDuel(row) {
    if (!GL.meta.squadUnlocked(profile)) { toast('<span><b>Noch gesperrt</b>Die Stammcrew gibt es nach deinem ersten gewonnenen Run oder ab Rang 5.</span>'); return; }
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
    if (!row.npc && GL.online.duelReport) GL.online.duelReport(row.id, res.win, Math.abs(ratingDelta || 0), profile.nickname);
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
    if (!ev) { if (GL.sfx) GL.sfx.play(f.res.win ? 'win' : 'lose'); f.timer = setTimeout(() => { f.playing = false; draw(); }, 900); return; }
    GL.arena.play(ev);
    if (GL.sfx) GL.sfx.battle(ev, f.fast ? 3 : 1);
    const rb = document.getElementById('duel-log');
    if (rb && ev.k === 'ult') rb.textContent = `⚡ ${ev.name}!`;
    const wait = (ev.k === 'round' ? 80 : ev.k === 'ult' ? 850 : ev.k === 'hit' ? 380 : 620) * (f.fast ? 0.4 : 1);
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

  // App-Gefühl: kein Zoomen per Zwei-Finger-Geste oder Doppeltipp (iOS ignoriert sonst user-scalable)
  ['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  // Doppeltipp-Zoom verhindert schon touch-action: manipulation (CSS), schnelle Tipps bleiben so erhalten

  // ---------- Finger als Zeiger: kurz halten, dann gleiten = Infos wie mit der Maus ----------
  // Normales Wischen scrollt weiter. Erst wer den Finger kurz stillhält, „scrubbt“: die Seite bleibt stehen,
  // und eine Blase über dem Finger zeigt die Info zu dem, worüber man gerade fährt.
  (function fingerScrub() {
    let hold = null, scrub = false, bubble = null, lastEl = null, sx = 0, sy = 0, hideT = null;
    const tipOf = el => el && el.closest && el.closest('[data-tip]');
    const show = (x, y) => {
      const t = tipOf(document.elementFromPoint(x, y));
      if (t !== lastEl) {
        if (lastEl) lastEl.classList.remove('scrub-on');
        lastEl = t;
        if (t) { t.classList.add('scrub-on'); if (navigator.vibrate) try { navigator.vibrate(6); } catch (e) {} }
      }
      if (!bubble) { bubble = document.createElement('div'); bubble.className = 'scrub-tip'; document.body.appendChild(bubble); }
      const txt = t ? t.getAttribute('data-tip') : '';
      bubble.hidden = !txt;
      if (!txt) return;
      const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
      const lines = txt.split('\n');
      const html = `<b>${esc(lines[0])}</b>${lines.slice(1).map(l => `<span>${esc(l)}</span>`).join('')}`;
      if (bubble.innerHTML !== html) bubble.innerHTML = html;
      const w = bubble.offsetWidth, h = bubble.offsetHeight;
      bubble.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2)) + 'px';
      bubble.style.top = Math.max(8, y - h - 56) + 'px';
    };
    const stop = () => {
      clearTimeout(hold); hold = null;
      if (!scrub) return;
      scrub = false; document.body.classList.remove('scrubbing');
      clearTimeout(hideT);
      hideT = setTimeout(() => { if (bubble) bubble.hidden = true; if (lastEl) lastEl.classList.remove('scrub-on'); lastEl = null; }, 900);
    };
    document.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) { stop(); return; }
      const p = e.touches[0]; sx = p.clientX; sy = p.clientY;
      if (!tipOf(e.target)) return;
      clearTimeout(hold);
      hold = setTimeout(() => { hold = null; scrub = true; suppressClick = true; document.body.classList.add('scrubbing'); clearTimeout(hideT); show(sx, sy); }, 280);
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      const p = e.touches[0];
      if (!scrub) { if (hold && Math.hypot(p.clientX - sx, p.clientY - sy) > 9) { clearTimeout(hold); hold = null; } return; }
      e.preventDefault();
      show(p.clientX, p.clientY);
    }, { passive: false });
    document.addEventListener('touchend', () => { const was = scrub; stop(); if (was) setTimeout(() => { suppressClick = false; }, 60); }, { passive: true });
    document.addEventListener('touchcancel', stop, { passive: true });
    document.addEventListener('contextmenu', e => { if (scrub || tipOf(e.target)) e.preventDefault(); });
  })();

  // ---------- Ausrüstung per Hand ziehen: Teil aus der Tasche auf einen Platz einer Figur ----------
  (function gearDrag() {
    let drag = null;
    document.addEventListener('pointerdown', e => {
      const chip = e.target.closest('.cg-bagit .cg-chip[data-uid]');
      if (!chip || e.button > 0) return;
      const it = GL.cgear && GL.cgear.bag(profile).find(x => x.uid === chip.dataset.uid);
      if (!it) return;
      drag = { chip, it, slot: GL.cgear.slotOf(it), x: e.clientX, y: e.clientY, on: false, ghost: null, id: e.pointerId };
    });
    document.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.on) {
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
        drag.on = true;
        drag.ghost = drag.chip.cloneNode(true); drag.ghost.classList.add('cg-ghost'); document.body.appendChild(drag.ghost);
        document.querySelectorAll(`.cg-row [data-act="cg-slot"][data-slot="${drag.slot}"], [data-cgslot="${drag.slot}"]`).forEach(x => x.classList.add('drop-ok'));
        document.body.classList.add('cg-dragging');
      }
      e.preventDefault();
      drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
      const t = document.elementFromPoint(e.clientX, e.clientY);
      document.querySelectorAll('.drop-hover').forEach(x => x.classList.remove('drop-hover'));
      const slot = t && t.closest('.drop-ok'); if (slot) slot.classList.add('drop-hover');
    }, { passive: false });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.on) return;
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 400);
      if (d.ghost) d.ghost.remove();
      document.body.classList.remove('cg-dragging');
      const t = document.elementFromPoint(e.clientX, e.clientY);
      const slot = t && t.closest('[data-act="cg-slot"], [data-cgslot]');
      document.querySelectorAll('.drop-ok, .drop-hover').forEach(x => x.classList.remove('drop-ok', 'drop-hover'));
      if (!slot) return;
      if (slot.dataset.slot !== d.slot) { toast('<span><b>Passt hier nicht</b>Dieses Teil gehört auf den Platz „' + ((GL.data.crewGear.slots.find(s => s.id === d.slot) || {}).name || '') + '“.</span>'); return; }
      GL.cgear.equip(profile, slot.dataset.id, d.it.uid); profile.gearNew = []; gearThanks(slot.dataset.id, d.it); saveProfile(); ui.lastStage = null; draw();
      if (document.querySelector('.dress-pop')) showDress({ uid: null, slot: d.slot });
    };
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', e => { if (drag && drag.ghost) drag.ghost.remove(); document.body.classList.remove('cg-dragging'); document.querySelectorAll('.drop-ok, .drop-hover').forEach(x => x.classList.remove('drop-ok', 'drop-hover')); drag = null; });
  })();

  // ---------- Ausrüstung: Vergleich beim Darüberfahren (Maus) ----------
  (function gearHover() {
    let tip = null, cur = null;
    const hide = () => { if (tip) tip.remove(); tip = null; cur = null; };
    document.addEventListener('pointerover', e => {
      if (e.pointerType !== 'mouse') return;
      const chip = e.target.closest('.cg-bagit .cg-chip[data-uid]');
      if (!chip) { if (tip && !e.target.closest('.gtip-float')) hide(); return; }
      if (cur === chip.dataset.uid) return;
      hide(); cur = chip.dataset.uid;
      const crewId = (document.querySelector('.dress-pop') && ui.dress && ui.dress.id) || null;
      const html = GL.ui.gearTip(profile, cur, crewId); if (!html) return;
      tip = document.createElement('div'); tip.className = 'gtip-float'; tip.innerHTML = html; document.body.appendChild(tip);
      const r = chip.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = r.right + 10, y = r.top - 4;
      if (x + tw > innerWidth - 8) x = r.left - tw - 10;
      if (x < 8) x = Math.min(innerWidth - tw - 8, Math.max(8, r.left));
      if (y + th > innerHeight - 8) y = innerHeight - th - 8;
      tip.style.left = x + 'px'; tip.style.top = Math.max(8, y) + 'px';
    });
    ['pointerdown', 'scroll', 'keydown'].forEach(t => document.addEventListener(t, hide, true));
  })();

  // ---------- Stammcrew: Karten auf einen Platz ziehen (Maus sofort, Finger nach kurzem Halten) ----------
  (function squadDrag() {
    let dr = null;
    const clear = () => { document.querySelectorAll('.sq-drop-ok, .sq-drop-hover').forEach(x => x.classList.remove('sq-drop-ok', 'sq-drop-hover')); document.body.classList.remove('sq-dragging'); };
    const begin = () => {
      dr.on = true;
      const src = dr.el.querySelector('.sqc-spr, .sqd-spr') || dr.el;
      dr.ghost = document.createElement('div'); dr.ghost.className = 'sq-ghost'; dr.ghost.innerHTML = src.innerHTML; document.body.appendChild(dr.ghost);
      dr.ghost.style.left = dr.cx + 'px'; dr.ghost.style.top = dr.cy + 'px';
      document.querySelectorAll('[data-sqslot]').forEach(x => x.classList.add('sq-drop-ok'));
      document.body.classList.add('sq-dragging');
      if (navigator.vibrate && dr.touch) try { navigator.vibrate(12); } catch (e) {}
    };
    document.addEventListener('pointerdown', e => {
      const el = e.target.closest('[data-sqcard], [data-sqid]');
      if (!el || e.button > 0 || e.target.closest('.sqd-x, .sqd-bond')) return;
      dr = { el, id: el.dataset.sqcard || el.dataset.sqid, x: e.clientX, y: e.clientY, cx: e.clientX, cy: e.clientY, on: false, pid: e.pointerId, touch: e.pointerType !== 'mouse' };
      if (dr.touch) dr.hold = setTimeout(() => { if (dr && !dr.on) begin(); }, 260);
    });
    document.addEventListener('touchmove', e => { if (dr && dr.on) e.preventDefault(); }, { passive: false });
    document.addEventListener('pointermove', e => {
      if (!dr || e.pointerId !== dr.pid) return;
      dr.cx = e.clientX; dr.cy = e.clientY;
      if (!dr.on) {
        if (Math.hypot(e.clientX - dr.x, e.clientY - dr.y) < 7) return;
        if (dr.touch) { clearTimeout(dr.hold); dr = null; return; }   // Finger bewegt sich sofort: scrollen
        begin();
      }
      e.preventDefault();
      dr.ghost.style.left = e.clientX + 'px'; dr.ghost.style.top = e.clientY + 'px';
      document.querySelectorAll('.sq-drop-hover').forEach(x => x.classList.remove('sq-drop-hover'));
      const t = document.elementFromPoint(e.clientX, e.clientY), sl = t && t.closest('[data-sqslot]');
      if (sl) sl.classList.add('sq-drop-hover');
    }, { passive: false });
    const end = e => {
      if (!dr || e.pointerId !== dr.pid) return;
      const d = dr; dr = null; clearTimeout(d.hold);
      if (!d.on) return;
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 400);
      if (d.ghost) d.ghost.remove();
      const t = document.elementFromPoint(e.clientX, e.clientY), sl = t && t.closest('[data-sqslot]');
      clear();
      if (!sl) return;
      squadPlace(d.id, Number(sl.dataset.sqslot)); ui.sqPick = null; ui.lastStage = null; draw();
    };
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', e => { if (dr) { clearTimeout(dr.hold); if (dr.ghost) dr.ghost.remove(); } clear(); dr = null; });
  })();

  document.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; e.stopPropagation(); return; }
    // Offenes Fenster (Steckbrief im Run, Album): Klick daneben schließt es, ohne dahinter etwas auszulösen
    if (!e.target.closest('#toasts, #fpop')) {
      const sh = document.getElementById('sheet'), al = document.getElementById('album');
      const opener = e.target.closest('[data-act=sheet]');
      if (ui.sheet != null && sh && !sh.hidden && !sh.contains(e.target) && !opener) { ui.sheet = null; draw(); e.stopPropagation(); return; }
      if (ui.album && al && !al.hidden && !al.contains(e.target)) { ui.album = null; draw(); e.stopPropagation(); return; }
    }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const type = el.dataset.act;
    const i = Number(el.dataset.i);
    if (!keyPick && ['pick', 'node', 'fight', 'leave', 'continue', 'sail', 'again', 'train', 'squad-fight', 'squad-match'].includes(type)
        && performance.now() - (window.__glStageAt || 0) < 350) return;

    // Leises Klick-Geräusch bei jedem Knopf (Hintergrund-Klicks auf 'noop' nicht)
    if (GL.sfx && type !== 'noop' && type !== 'sfx') GL.sfx.play(type === 'pick' && run && run.phase === 'recruit' ? 'coin' : 'tap');
    if (type !== 'restart') ui.restartArmed = false;
    if (type !== 'acc-reset' && type !== 'acc-delete') ui.accArmed = null;
    if (type !== 'logout') ui.logoutArmed = false;
    if (type !== 'slot-del') ui.slotDel = null;

    switch (type) {
      case 'node': {
        // Begegnung auf See: manchmal kreuzt die Crew eines anderen Spielers deinen Kurs (statt eines normalen Kampfes)
        const RV = GL.config.rival;
        let rival = null;
        if (RV && run && run.options && run.options[i] === 'battle' && !run.daily && !run.duel && !GL.sandbox.on() && Math.random() < RV.chance) {
          const st = GL.online && GL.online.state ? GL.online.state() : {};
          const cands = (st.rows || []).filter(r => r.id !== st.uid && (r.squad || []).length >= 2 && !r.npc);
          const r = cands[Math.floor(Math.random() * cands.length)];
          if (r) rival = { name: r.name, team: r.squad.map(x => ({ id: x.id === 'rival' ? 'self' : x.id, type: x.type, look: x.look || null })) };
        }
        act(rival ? { type: 'node', index: i, rival } : { type: 'node', index: i });
        break;
      }
      case 'pick': {
        // Schätze und Früchte: erster Tipp wählt aus (Karte hebt sich), zweiter Tipp nimmt. Tastatur nimmt sofort.
        const two = run && ['treasure', 'fruit'].includes(run.phase) && el.classList.contains('card') && !(e && e.detail === 0);
        const key = run ? run.seed + ':' + run.step + ':' + run.phase : '';
        if (two && !(GL.pickSel && GL.pickSel.key === key && GL.pickSel.i === i)) {
          GL.pickSel = { key, i }; ui.lastStage = null; draw(); break;
        }
        GL.pickSel = null; ui.tvSel = null; act({ type: 'pick', index: i }); break;
      }
      case 'loot-skip': GL.pickSel = null; act({ type: 'skip' }); break;
      case 'tv-sel': ui.tvSel = i; ui.lastStage = null; draw(); break;
      case 'tv-target': ui.tvTarget = { id: run.crew[i] && run.crew[i].id, key: run.seed + ':' + run.step }; ui.lastStage = null; draw(); break;
      case 'up':   act({ type: 'swap', a: i, b: i - 1 }); break;
      case 'down': act({ type: 'swap', a: i, b: i + 1 }); break;
      case 'fight': startFight(); break;
      case 'special': act({ type: 'special' }); break;
      case 'continue': stopAnim(); act({ type: 'continue' }); break;
      case 'fast':
        if (anim) {
          anim.speed = anim.speed >= 4 ? 1 : anim.speed + 1; showSpeed();
          profile.settings = Object.assign({}, profile.settings, { speed: anim.speed }); saveProfile();
          document.body.classList.toggle('fast', anim.speed >= 3);
          const b = document.querySelector('[data-act=fast]'); if (b) b.innerHTML = GL.ui.speedLabel(anim.speed);
        }
        break;
      case 'skip': if (anim) { clearTimeout(anim.timer); anim.done = true; draw(); } break;
      case 'sail': sail(); break;
      case 'ship-pick': {
        const it = (GL.data.shipParts[el.dataset.k] || []).find(x => x.id === el.dataset.v);
        if (!it || !GL.meta.cosmeticUnlocked(profile, it)) break;
        profile.ship = Object.assign({}, profile.ship, { [el.dataset.k]: it.id }); saveProfile();
        const t = document.getElementById('title'); if (t) t.dataset.last = '';
        draw();
        break;
      }
      case 'endless-start': closePop(); sail(Number(el.dataset.i)); break;
      case 'endless-open': openGearPop(GL.ui.endlessPop(profile)); break;
      case 'hunt-open': openGearPop(GL.ui.huntPop(profile)); break;
      // Landgang: kleine Abenteuer im Fenster (js/ui/dungeon.js)
      case 'dg-open': case 'dg-list': case 'dg-start': case 'dg-go': case 'dg-pick': case 'dg-next': case 'dg-fast': {
        // Landgang mit Bosskampf der Stammcrew: Beute wird beim Kampfende gespeichert (onSave)
        GL.dungeon.onSave = () => { saveProfile(); ui.lastStage = null; draw(); };
        const h = GL.dungeon.act(type, el.dataset, profile);
        if (type === 'dg-fast') { el.classList.toggle('on'); break; }
        if (GL.dungeon.dirty) { saveProfile(); ui.lastStage = null; draw(); }
        if (h == null) { if (type !== 'dg-open' && type !== 'dg-list') closePop(); break; }
        const box = document.getElementById('fpop');
        // Fenster-Art bleibt 'gear' (featureCheck lässt es offen), Landgang wird extra markiert
        if (box && box.dataset.dg) { box.innerHTML = h; box.scrollTop = 0; }
        else { openGearPop(h); const b2 = document.getElementById('fpop'); if (b2) b2.dataset.dg = '1'; }
        GL.dungeon.after();
        break;
      }
      case 'daily-info': openGearPop(GL.ui.dailyPop(profile)); break;
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
      case 'title-go': if (!GL.meta.featureOpen(profile, el.dataset.tab)) { toast('<span><b>Noch ein bisschen segeln</b>Die Rangliste öffnet sich nach deinem ersten Run.</span>'); break; }
        ui.screen = null; ui.hqTab = el.dataset.tab; ui.hqRoom = el.dataset.tab; if (el.dataset.tab === 'album') { ui.album = 'crew'; ui.hqTab = null; } draw(); break;
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
      case 'reload': {
        // Wie F5, auch in der Handy-App: Stand sichern, dann frisch laden (umgeht alte Zwischenspeicher)
        try { if (run) GL.save.storeRun(run); } catch (e) {}
        document.body.classList.add('reloading');
        setTimeout(() => { location.replace(location.pathname + '?u=' + Date.now() + location.hash); }, 120);
        break;
      }
      case 'fullscreen': {
        const d = document, de = d.documentElement;
        const isOn = d.fullscreenElement || d.webkitFullscreenElement;
        try {
          if (isOn) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
          else { const p = (de.requestFullscreen || de.webkitRequestFullscreen).call(de, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); }
        } catch (e2) { /* nicht unterstützt */ }
        break;
      }
      case 'daily-start': closePop(); startDaily(); break;
      case 'endless': {
        if (!run || run.phase !== 'win') break;
        stopAnim(); ui.newBest = false; ui.lastBerry = null;
        act({ type: 'endless' });
        toast(`<span><b>Endlos-Runde ${run.loop + 1}</b>Die Gegner sind jetzt stärker. Viel Glück!</span>`);
        window.scrollTo(0, 0);
        break;
      }
      case 'daily-day': ui.dailyDay = el.dataset.id; ui.lastStage = null; draw(); break;
      case 'mail-reveal': GL.ui.toggleMail(); ui.lastStage = null; { const t = document.getElementById('title'); if (t) t.dataset.last = ''; } draw(); break;
      case 'slot-switch': case 'slot-fresh': {
        let to = type === 'slot-fresh' ? -1 : Number(el.dataset.i);
        if (type === 'slot-fresh') { for (let k = 1; k < GL.slots.max; k++) if (k !== GL.slots.active() && !GL.slots.info(k)) { to = k; break; } }
        if (to < 0) { toast('<span><b>Kein freier Platz</b>Lösche zuerst einen Zweitpiraten unter „Spielstände“.</span>'); break; }
        stopAnim();
        saveProfile(); if (run) GL.save.storeRun(run);
        if (GL.slots.switchTo(to)) { try { sessionStorage.removeItem('gl.pulled'); } catch (e2) { /* egal */ } location.reload(); }
        break;
      }
      case 'slot-del': {
        const k = Number(el.dataset.i);
        if (ui.slotDel !== k) { ui.slotDel = k; ui.lastStage = null; draw(); break; }
        ui.slotDel = null; GL.slots.remove(k); ui.lastStage = null; draw();
        break;
      }
      case 'admin-tester': {
        const st = GL.online.state();
        if (!(st.email && /^westerhol[dt]\.felix@gmail\.com$/i.test(st.email))) break;
        profile.testerPops = !profile.testerPops; saveProfile(); draw();
        toast(profile.testerPops ? 'Tester-Modus an: Tipps und Fragen kommen wieder' : 'Tester-Modus aus');
        break;
      }
      case 'admin-star': {
        const st = GL.online.state();
        if (!(st.email && /^westerhol[dt]\.felix@gmail\.com$/i.test(st.email))) break;
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
      case 'lang': if (GL.i18n) GL.i18n.set(GL.i18n.lang() === 'en' ? 'de' : 'en'); break;
      case 'sfx': {
        const onNow = GL.sfx && GL.sfx.toggle();
        toast(onNow ? '<span><b>Geräusche an</b>Leise Klänge für Kämpfe und Knöpfe.</span>' : '<span><b>Geräusche aus</b>Mit dem Lautsprecher jederzeit wieder an.</span>');
        ui.lastStage = null; const t0s = document.getElementById('title'); if (t0s) t0s.dataset.last = ''; draw();
        break;
      }
      case 'music': {
        const onNow = GL.music && GL.music.toggle();
        toast(onNow ? '<span><b>Musik an</b>Im Startbild etwas lauter, im Spiel leise im Hintergrund.</span>' : '<span><b>Musik aus</b>Mit ♪ jederzeit wieder an.</span>');
        ui.lastStage = null; const t = document.getElementById('title'); if (t) t.dataset.last = ''; draw();
        break;
      }
      case 'wiki-open': case 'wiki-tab': {
        ui.wikiTab = el.dataset.v || ui.wikiTab || 'basis';
        if (!profile.wikiSeen) { profile.wikiSeen = 1; saveProfile(); }
        if (type === 'wiki-tab') { const c = document.querySelector('#fpop .fpop-card'); if (c) { const h = GL.ui.wikiPop(ui.wikiTab, profile); const tmp = document.createElement('div'); tmp.innerHTML = h; c.replaceWith(tmp.firstElementChild); break; } }
        openGearPop(GL.ui.wikiPop(ui.wikiTab, profile));
        if (GL.online && GL.online.refresh && ui.wikiTab === 'meta') GL.online.refresh();
        ui.lastStage = null; draw();
        break;
      }
      case 'coach-ok': {
        profile.coachSeen = (profile.coachSeen || []).concat(el.dataset.v); saveProfile(); ui.lastStage = null; draw(); break;
      }
      case 'dbox': {
        const r = GL.meta.dboxClaim(profile);
        if (!r) { toast(`<span><b>Heute schon geöffnet</b>Morgen wartet die nächste Kiste. Serie: ${profile.dbox.streak} ${profile.dbox.streak === 1 ? 'Tag' : 'Tage'}.</span>`); break; }
        saveProfile();
        el.classList.add('opening');
        toast(`<span><b>Tageskiste: +${r.berry} Berry${r.shards ? `, +${r.shards} 🔹` : ''}${r.gear ? ', episches Teil!' : ''}</b>Besuchstag ${r.day}/7${r.day < 7 ? `. An Tag 7 wartet ein episches Ausrüstungsteil. Pausen sind kein Problem.` : '. Danach beginnt es wieder bei Tag 1.'}</span>`);
        setTimeout(() => { ui.lastStage = null; draw(); }, 700);
        break;
      }
      case 'week-open': openGearPop(GL.ui.weekPop(profile)); break;
      case 'week-claim': {
        const r = GL.meta.weeklyClaim(profile);
        if (r) { saveProfile(); closePop(); toast(`<span><b>Woche geschafft!</b>+${r.berry} Berry, +${r.shards} 🔹${r.gear ? ' und ' + esc2(GL.cgear.name(r.gear)) : ''}</span>`); draw(); }
        break;
      }
      case 'sticker': {
        GL.sticker.make(GL.ui.stickerInfo(profile)).then(blob => { ui.stickerBlob = blob; openGearPop(GL.ui.stickerPop(URL.createObjectURL(blob))); }).catch(() => toast('<span><b>Sticker ging gerade nicht</b></span>'));
        break;
      }
      case 'sticker-copy': {
        if (!ui.stickerBlob) break;
        GL.sticker.copy(ui.stickerBlob).then(ok => toast(ok ? '<span><b>Sticker kopiert</b>In WhatsApp einfügen und abschicken.</span>' : '<span><b>Kopieren geht hier nicht</b>Nimm „Teilen“ oder „Speichern“.</span>')).catch(() => toast('<span><b>Kopieren geht hier nicht</b>Nimm „Teilen“ oder „Speichern“.</span>'));
        break;
      }
      case 'sticker-share': {
        if (!ui.stickerBlob) break;
        GL.sticker.share(ui.stickerBlob, profile.nickname).then(ok => { if (!ok) GL.sticker.download(ui.stickerBlob, profile.nickname); }).catch(() => {});
        break;
      }
      case 'sticker-save': if (ui.stickerBlob) GL.sticker.download(ui.stickerBlob, profile.nickname); break;
      case 'friends-open': {
        openGearPop(GL.ui.friendsPop(profile));
        if (GL.online && GL.online.refresh) GL.online.refresh();
        if (GL.friends) GL.friends.qr(GL.friends.link()).then(svg => { const q = document.getElementById('fr-qr'); if (q) q.innerHTML = svg; }).catch(() => { const q = document.getElementById('fr-qr'); if (q) q.innerHTML = '<small>QR-Code gerade nicht verfügbar</small>'; });
        break;
      }
      case 'friend-add': {
        const inp = document.getElementById('fr-code');
        const c = inp ? inp.value : '';
        if (!GL.friends.add(profile, c)) { toast('<span><b>Code passt nicht</b>Freundescodes haben 6 Zeichen, z. B. K7Q-F9X.</span>'); break; }
        saveProfile(); toast(`<span><b>Freund hinzugefügt</b>${GL.friends.rowOf(c) ? esc2(GL.friends.rowOf(c).name) + ' ist jetzt in deiner Liste.' : 'Sobald er online ist, siehst du ihn hier.'}</span>`);
        const c2 = document.querySelector('#fpop .fpop-card'); if (c2) { const t = document.createElement('div'); t.innerHTML = GL.ui.friendsPop(profile); c2.replaceWith(t.firstElementChild); }
        GL.friends.qr(GL.friends.link()).then(svg => { const q = document.getElementById('fr-qr'); if (q) q.innerHTML = svg; }).catch(() => {});
        break;
      }
      case 'friend-del': {
        const c = el.dataset.id;
        if (!(GL.uiConfirm && GL.uiConfirm.fr === c && Date.now() < GL.uiConfirm.until)) { GL.uiConfirm = { fr: c, until: Date.now() + 3000 }; el.textContent = 'Wirklich?'; el.classList.add('ask'); break; }
        GL.friends.remove(profile, c); saveProfile(); GL.uiConfirm = null;
        const c2 = document.querySelector('#fpop .fpop-card'); if (c2) { const t = document.createElement('div'); t.innerHTML = GL.ui.friendsPop(profile); c2.replaceWith(t.firstElementChild); }
        GL.friends.qr(GL.friends.link()).then(svg => { const q = document.getElementById('fr-qr'); if (q) q.innerHTML = svg; }).catch(() => {});
        break;
      }
      case 'friend-share': {
        const url = GL.friends.link();
        const text = `Ahoi! Spiel mit mir Grand Line, ein gemütliches One-Piece-Roguelike. Mein Freundescode: ${GL.friends.mine()}`;
        if (navigator.share) navigator.share({ title: 'Grand Line', text, url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(() => toast('<span><b>Link kopiert</b>Schick ihn deinem besten Kumpel.</span>')).catch(() => {});
        break;
      }
      case 'friend-copy': {
        if (navigator.clipboard) navigator.clipboard.writeText(GL.friends.mine()).then(() => toast('<span><b>Freundescode kopiert</b></span>')).catch(() => {});
        break;
      }
      case 'friend-view': { closePop(); ui.viewPlayer = el.dataset.id; draw(); break; }
      case 'syn-open': {
        if (run) openGearPop(GL.ui.synPop(run));
        break;
      }
      case 'squad-match': {
        const st = GL.online.state();
        const mine = GL.meta.squadPower(GL.meta.squadRefs(profile));
        const me = String(profile.nickname || '').trim().toLowerCase();
        const myR = profile.squadRating == null ? 1000 : profile.squadRating;
        const pool = (st.rows || []).filter(x => x.id !== st.uid && x.squadOn && (x.squad || []).length && String(x.name || '').trim().toLowerCase() !== me)
          .map(x => ({ x, d: Math.abs((x.squadPower || GL.meta.squadPower(x.squad)) - mine) + Math.abs((x.squadRating || 1000) - myR) / 4 })).sort((p, q) => p.d - q.d).slice(0, 5);
        // Abwechslung: zuletzt gezeigte Gegner zuerst überspringen (falls es andere passende gibt)
        ui.recentFoes = ui.recentFoes || [];
        const fresh = pool.filter(p => !ui.recentFoes.includes(p.x.id));
        const pickFrom = fresh.length ? fresh : pool;
        let row = pickFrom.length ? pickFrom[Math.floor(Math.random() * Math.min(3, pickFrom.length))].x : null;
        if (row) { ui.recentFoes.push(row.id); if (ui.recentFoes.length > 3) ui.recentFoes.shift(); }
        if (!row) {
          // Niemand passendes online: Übungscrew der Marine auf deinem Niveau
          const lvl = GL.meta.squadLevel(profile);
          const ids = ['koby', 'tashigi', 'hina', 'garp', 'smoker'].sort(() => Math.random() - 0.5).slice(0, GL.meta.squadIds(profile).length);
          const squad = ids.map(id => { const d = GL.data.crew.find(c => c.id === id); const max = d.hp + (lvl - 1) * 3;
            return { id, name: d.name, type: d.type, role: d.role, faction: d.faction, lvl, hp: max, max, atk: d.atk + Math.floor((lvl - 1) * 0.45), spd: d.spd }; });
          row = ui.npcRow = { id: 'npc-marine', name: 'Übungscrew der Marine', rank: 'Marine-Ausbilder', squad, squadPower: GL.meta.squadPower(squad), npc: true };
        }
        // Erst zeigen, wer es ist und wie die Chancen stehen, dann angreifen oder weitersuchen
        ui.matchRow = row;
        const mineRefs = GL.meta.squadRefs(profile);
        let w = 0; for (let k = 0; k < 24; k++) if (GL.squad.fight(mineRefs, row.squad, (k * 7919 + 13) >>> 0).win) w++;
        openGearPop(GL.ui.matchPop(row, profile, Math.round(100 * w / 24)));
        break;
      }
      case 'squad-attack': {
        const row = ui.matchRow; if (!row) break;
        closePop();
        ui.viewPlayer = row.id;
        startSquadDuel(row);
        break;
      }
      case 'duel-skip': {
        // Kein Überspringen mehr: schneller abspielen
        if (ui.squadFight) { ui.squadFight.fast = !ui.squadFight.fast; el.textContent = ui.squadFight.fast ? 'Normal' : 'Schneller'; }
        break;
      }
      case 'squad-back': if (ui.squadFight) clearTimeout(ui.squadFight.timer); ui.squadFight = null; draw(); break;
      case 'lb-view': ui.viewPlayer = el.dataset.id; draw(); break;
      case 'lb-view-close': if (ui.squadFight) clearTimeout(ui.squadFight.timer); ui.viewPlayer = null; ui.squadFight = null; draw(); break;
      case 'noop': break;
      case 'char-part': ui.draft.char.look[el.dataset.part] = el.dataset.v; draw(); break;
      case 'char-hat': ui.draft.char.look.hat = el.dataset.v; draw(); break;
      case 'char-acc': ui.draft.char.look.acc = el.dataset.v || undefined; ui.lastStage = null; { const t = document.getElementById('title'); if (t) t.dataset.last = ''; } draw(); break;
      case 'char-type': ui.draft.char.type = el.dataset.v; draw(); break;
      case 'char-role': ui.draft.char.role = el.dataset.v; draw(); break;
      case 'cos-pick': ui.draft.cos[el.dataset.kind] = el.dataset.v; draw(); break;
      case 'profile-save': {
        const inp = document.getElementById('pf-name');
        const name = inp ? inp.value.trim() : '';
        if (!name) { inp && inp.focus(); inp && inp.classList.add('shake'); break; }
        const nc = GL.nameCheck(name);
        if (!nc.ok) { ui.nameError = nc.msg; ui.draft.name = name; ui.lastStage = null; const t = document.getElementById('title'); if (t) t.dataset.last = ''; draw(); break; }
        ui.nameError = null;
        profile.char = ui.draft.char;
        profile.cos = ui.draft.cos;
        profile.nickname = name.slice(0, 24);
        if (GL.friends && GL.friends.applyRef(profile)) setTimeout(() => toast('<span><b>Willkommen an Bord!</b>Ein Freund hat dich eingeladen: +150 Berry als Geschenk.</span>'), 1200);
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
      case 'hq-home': { const was = ui.hqRoom; ui.hqRoom = null; draw(); window.scrollTo(0, 0);
        const st = document.getElementById('stage'); if (st && was) { st.classList.remove('room-in', 'room-side'); void st.offsetWidth; st.classList.add('room-out'); setTimeout(() => st.classList.remove('room-out'), 300); }
        break; }
      case 'hq-tab': if (GL.meta.featureOpen(profile, el.dataset.tab)) {
        // Wie in einer App: Raum gleitet herein (seitlich innerhalb einer Gruppe, sonst von unten)
        const prevRoom = ui.hqRoom;
        if (['stammcrew', 'schmiede', 'lager', 'kammer'].includes(el.dataset.tab)) ui.crewLast = el.dataset.tab;
        ui.hqTab = el.dataset.tab; ui.hqRoom = el.dataset.tab; draw(); window.scrollTo(0, 0);
        const st = document.getElementById('stage');
        if (st && prevRoom !== ui.hqRoom) { st.classList.remove('room-in', 'room-side'); void st.offsetWidth; st.classList.add(prevRoom && el.closest('.room-seg') ? 'room-side' : 'room-in'); } if (/rangliste|stammcrew/.test(ui.hqTab) && GL.online && GL.online.refresh) GL.online.refresh(); } break;
      case 'hunt-pick': { profile.hunt = profile.hunt === el.dataset.id ? null : el.dataset.id; saveProfile(); ui.lastStage = null; draw(); const fp = document.getElementById('fpop'); if (fp && fp.querySelector('.hunt-row')) fp.innerHTML = GL.ui.huntPop(profile); break; }
      case 'showcase': if (GL.meta.toggleShowcase(profile, el.dataset.id)) { saveProfile(); ui.lastStage = null; draw(); if (GL.online && GL.online.register) GL.online.register(profile); } break;
      case 'fpop-go': closeFeature(el.dataset.id, true); break;
      case 'fpop-close': closeFeature(el.dataset.id, false); break;
      case 'fpop-map': closeFeature(el.dataset.id, false); setTimeout(() => { ui.wikiTab = 'routen'; openGearPop(GL.ui.wikiPop('routen', profile)); }, 300); break;
      case 'wb-close': closePop(); break;
      case 'pop-close': closePop(); break;
      // ---------- Crew-Ausrüstung ----------
      case 'cg-slot': openGearPop(GL.ui.gearPick(profile, el.dataset.id, el.dataset.slot)); break;
      case 'dress': ui.sqPick = null; showDress({ id: el.dataset.id, slot: null, uid: null }); break;
      case 'dr-slot': showDress({ id: el.dataset.id, slot: el.dataset.slot || null, uid: null }); break;
      case 'dr-item': showDress({ uid: ui.dress && ui.dress.uid === el.dataset.uid ? null : el.dataset.uid }); break;
      case 'dr-on': {
        const it = GL.cgear.bag(profile).find(x => x.uid === el.dataset.uid);
        GL.cgear.equip(profile, el.dataset.id, el.dataset.uid); profile.gearNew = []; gearThanks(el.dataset.id, it); saveProfile();
        showDress({ uid: null, slot: it ? GL.cgear.slotOf(it) : null }); ui.lastStage = null; draw(); break;
      }
      case 'dr-off': GL.cgear.unequip(profile, el.dataset.id, el.dataset.slot); saveProfile(); showDress({ uid: null }); ui.lastStage = null; draw(); break;
      case 'bottle': showDress({ send: el.dataset.uid || null }); break;
      case 'bottle-to': {
        const B = GL.cgear.bag(profile), k = B.findIndex(x => x.uid === el.dataset.uid);
        if (k < 0 || GL.cgear.wornBy(profile, el.dataset.uid) || !GL.online.bottleSend) break;
        const it = B[k], to = el.dataset.to, nm = el.dataset.name;
        el.disabled = true;
        GL.online.bottleSend(to, JSON.parse(JSON.stringify(it)), profile.nickname || 'Pirat').then(res => {
          if (res.ok) {
            const j = B.findIndex(x => x.uid === it.uid); if (j >= 0) B.splice(j, 1);
            GL.meta.gone(profile, it.uid); saveProfile();
            if (GL.sfx) GL.sfx.play('found');
            toast(`<span><b>🍾 Flaschenpost unterwegs</b>${esc2(GL.cgear.name(it))} schwimmt zu ${esc2(nm)}.</span>`);
            showDress({ uid: null, send: null }); ui.lastStage = null; draw();
          } else {
            toast(`<span><b>Flaschenpost klappt gerade nicht</b>${res.why === 'limit' ? 'Heute sind schon 5 Flaschen unterwegs. Morgen wieder!' : res.why === 'offline' ? 'Dafür musst du online sein.' : 'Bitte später nochmal versuchen.'} Das Teil bleibt in deiner Truhe.</span>`);
            showDress({ send: null });
          }
        });
        break;
      }
      case 'sq-filter': ui.sqFilter = el.dataset.v; ui.lastStage = null; draw(); break;
      case 'sq-all': ui.sqAll = true; ui.lastStage = null; draw(); break;
      case 'sq-pick': {
        const id = el.dataset.id, ids = GL.meta.squadIds(profile).slice();
        if (ui.sqPick === id) { ui.sqPick = null; }
        else if (ids.includes(id)) { ui.sqPick = null; showDress({ id, slot: null, uid: null }); break; }
        else if (ids.length < GL.meta.squadSize) { ids.push(id); profile.squad = ids; saveProfile(); squadPushLater(); ui.sqPick = null; }
        else ui.sqPick = id;
        ui.lastStage = null; draw(); break;
      }
      case 'sq-place': { if (ui.sqPick) { squadPlace(ui.sqPick, Number(el.dataset.k)); ui.sqPick = null; } ui.lastStage = null; draw(); break; }
      case 'cg-on': {
        GL.cgear.equip(profile, el.dataset.id, el.dataset.uid); profile.gearNew = []; gearThanks(el.dataset.id, GL.cgear.bag(profile).find(x => x.uid === el.dataset.uid)); saveProfile(); closePop(); ui.lastStage = null; draw();
        break;
      }
      case 'cg-off': GL.cgear.unequip(profile, el.dataset.id, el.dataset.slot); saveProfile(); closePop(); ui.lastStage = null; draw(); break;
      case 'cg-item': { const it = GL.cgear.bag(profile).find(x => x.uid === el.dataset.uid); if (it) openGearPop(GL.ui.gearView(it, true, profile)); break; }
      case 'cg-reroll': {
        if (GL.cgear.reroll(profile, el.dataset.uid)) {
          saveProfile(); ui.lastStage = null; draw();
          const it = GL.cgear.bag(profile).find(x => x.uid === el.dataset.uid);
          if (document.querySelector('.dress-pop')) showDress({});
          else if (it) openGearPop(GL.ui.gearView(it, true, profile));
        }
        break;
      }
      case 'cg-scrap': {
        const b = GL.cgear.scrap(profile, el.dataset.uid);
        if (b) { saveProfile(); if (document.querySelector('.dress-pop')) showDress({ uid: null }); else closePop(); ui.lastStage = null; draw(); const ls = profile.lastScrap || {}; toast(`<i>${GL.sprites.coin()}</i><span><b>Zerlegt</b>+${b} Berry${ls.shards ? ` · +${ls.shards} 🔹` : ''}${ls.snacks ? ` · +${ls.snacks} 🍙 Proviant` : ''}</span>`); }
        break;
      }
      case 'cg-peek': {
        const row = (GL.online.state().rows || []).find(r => r.id === el.dataset.row);
        const g = row && row.squad && row.squad[+el.dataset.i] && (row.squad[+el.dataset.i].gear || [])[+el.dataset.k];
        if (g) openGearPop(GL.ui.gearView(g, false, profile));
        break;
      }
      case 'fb-open': openFeedback(); break;
      case 'notes-open': {
        profile.notesSeen = GL.version; saveProfile();
        const old = document.getElementById('fpop'); if (old) old.remove();
        const el = document.createElement('div');
        el.id = 'fpop'; el.className = 'fpop'; el.dataset.id = 'notes';
        el.innerHTML = GL.ui.notesPop();
        el.addEventListener('click', e => { if (e.target === el || e.target.closest('[data-act=notes-close]')) { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), 260); ui.lastStage = null; draw(); } });
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('in'));
        break;
      }
      case 'inst-go': {
        if (installEvt) { installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; }); profile.installAsked = 2; closeInstall(); }
        else if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {}); closeInstall(); }
        else closeInstall();
        break;
      }
      case 'inst-done': profile.installAsked = 1; closeInstall(); break;
      case 'inst-later': closeInstall(); break;
      case 'fb-star': {
        ui.fbStars = Number(el.dataset.i);
        document.querySelectorAll('.fb-star').forEach(b => { const n = Number(b.dataset.i); b.classList.toggle('on', n <= ui.fbStars); b.setAttribute('aria-checked', String(n === ui.fbStars)); });
        const sb = document.querySelector('[data-act=fb-send]'); if (sb) sb.disabled = false;
        break;
      }
      case 'fb-send': {
        if (!ui.fbStars) break;
        const t = document.getElementById('fb-text');
        GL.online.sendFeedback(ui.fbStars, t ? t.value.trim() : '', (profile.stats && profile.stats.runs) || 0, GL.meta.rankIndex(profile) + 1);
        closeFeedback(true);
        toast('<span><b>Danke!</b>Dein Feedback ist angekommen.</span>');
        break;
      }
      case 'fb-later': closeFeedback(false); break;
      case 'buy-upgrade': if (GL.meta.buyUpgrade(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'buy-gear': if (GL.meta.buyGear(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'toggle-gear': if (GL.meta.toggleLoadout(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'reroll': ui.tvSel = null; act({ type: 'reroll' }); break;
      case 'again': toHq(); sail(); break;   // direkt den nächsten Run starten
      case 'equip': act({ type: 'equip', index: i, uid: el.dataset.uid || null }); break;
      case 'toggle-item': if (GL.meta.toggleItem(profile, el.dataset.id)) { saveProfile(); draw(); } break;
      case 'forge-sel': ui.forgeSel = el.dataset.id && ui.forgeSel !== el.dataset.id ? el.dataset.id : null; ui.scrapArmed = null; ui.lastStage = null; draw(); break;
      case 'forge-flt': ui.forgeFlt = el.dataset.v; ui.lastStage = null; draw(); break;
      case 'forge': if (GL.meta.forge(profile, el.dataset.id)) { saveProfile(); toast('<span><b>Geschmiedet!</b>Der Gegenstand ist eine Stufe stärker.</span>'); draw(); } break;
      case 'scrap': {
        if (ui.scrapArmed !== el.dataset.id) { ui.scrapArmed = el.dataset.id; toast('<span><b>Einschmelzen?</b>Zum Bestätigen nochmal klicken.</span>'); ui.lastStage = null; draw(); break; }
        const val = GL.meta.scrap(profile, el.dataset.id);
        ui.scrapArmed = null; saveProfile(); toast(`<span><b>Eingeschmolzen</b>+${val} Berry</span>`); draw();
        break;
      }
      case 'leave': act({ type: 'leave' }); break;
      case 'dismiss': {
        // Sicherheitsfrage ohne Fenster: erster Tipp färbt den Knopf rot („Wirklich?“), zweiter Tipp entlässt
        const c = GL.uiConfirm;
        if (!c || c.i !== i || Date.now() > c.until) {
          GL.uiConfirm = { i, until: Date.now() + 3500 };
          ui.lastStage = null; draw();
          clearTimeout(ui.confirmT); ui.confirmT = setTimeout(() => { GL.uiConfirm = null; ui.lastStage = null; draw(); }, 3600);
          break;
        }
        GL.uiConfirm = null; clearTimeout(ui.confirmT);
        act({ type: 'dismiss', index: i }); ui.sheet = null; draw(); break;
      }
      case 'tv-swap': {
        // Ein Tipp: Besiegte bzw. schwächste Figur entlassen und das Angebot direkt anheuern
        const j = Number(el.dataset.j);
        if (run && run.crew[j]) { act({ type: 'dismiss', index: j }); act({ type: 'pick', index: i }); ui.tvSel = null; ui.tvTarget = null; }
        draw(); break;
      }
      case 'lb-cat': ui.lbCat = el.dataset.id; draw(); break;
      case 'duel-view': ui.duelView = el.dataset.id; draw(); break;
      case 'duel-new': openDuelPop(duelCode(GL.rng.newSeed()), false); break;
      case 'duel-go': { const c = el.dataset.id; closePop(); startDuel(c); break; }
      case 'duel-later': closePop(); break;
      case 'duel-join': { const inp = document.getElementById('duel-code'); startDuel(inp ? inp.value : ''); break; }
      case 'duel-copy': {
        const code = el.dataset.id;
        const txt = `Wettfahrt in Grand Line! Gleiche Route, wer holt mehr Punkte? Code: ${code}\n${location.origin}${location.pathname}?wettfahrt=${code}`;
        // Handy: Teilen-Menü (WhatsApp & Co.), sonst kopieren
        if (navigator.share && matchMedia('(pointer: coarse)').matches) { navigator.share({ title: 'Grand Line Wettfahrt', text: txt }).catch(() => {}); break; }
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('<span><b>Kopiert</b>Code ' + code + ' samt Link. Einfach an deinen Kumpel schicken.</span>'), () => toast('<span><b>Wettfahrt-Code</b>' + code + '</span>'));
        else toast('<span><b>Wettfahrt-Code</b>' + code + '</span>');
        break;
      }
      // Account zurücksetzen (Name und Aussehen bleiben) oder ganz löschen. Zweimal klicken zum Bestätigen.
      case 'acc-reset':
      case 'acc-delete': {
        const kind = type === 'acc-reset' ? 'reset' : 'delete';
        if (ui.accArmed !== kind) { ui.accArmed = kind; if (el.closest('#fpop')) { el.textContent = 'Sicher? Nochmal tippen'; break; } ui.lastStage = null; draw(); if (ui.screen) { document.getElementById('title').dataset.last = ''; draw(); } break; }
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
      case 'stream-toggle': {
        const on = GL.streamer.set(!GL.streamer.on());
        ui.codeShow = false; ui.xferCode = null;
        const t = document.getElementById('title'); if (t) t.dataset.last = '';
        ui.lastStage = null; draw();
        toast(on ? '<span><b>🎥 Streamer-Modus an</b>Mail und Spielercode sind jetzt überall verdeckt.</span>' : '<span><b>Streamer-Modus aus</b></span>');
        break;
      }
      case 'code-show': if (GL.streamer.on()) break; ui.codeShow = !ui.codeShow; ui.lastStage = null; draw(); break;
      case 'code-copy': {
        const c = profile.playerCode;
        const ok = () => toast('<span><b>Spielercode kopiert</b>Gut aufheben und niemandem zeigen.</span>');
        if (navigator.clipboard) navigator.clipboard.writeText(c).then(ok, () => { if (GL.streamer.on()) return; ui.codeShow = true; ui.lastStage = null; draw(); });
        else if (!GL.streamer.on()) { ui.codeShow = true; ui.lastStage = null; draw(); }
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
        if (!GL.code.valid(v)) { ui.codeError = 'Der Code hat 6 Zeichen, z. B. K7Q-F9X.'; if (t0) t0.dataset.last = ''; draw(); break; }
        el.disabled = true; el.textContent = 'Suche Spielstand …';
        GL.online.codeLoad(v).then(res => {
          if (!res.ok || !res.data) {
            ui.codeError = res.ok ? 'Zu diesem Code gibt es keinen Spielstand. Tippfehler? Auf dem anderen Gerät einmal das Spiel öffnen, damit er gespeichert wird.' : res.msg;
            if (t0) t0.dataset.last = ''; draw(); return;
          }
          const p = res.data;
          p.playerCode = GL.code.format(v);
          p.codeClaimed = true;
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
        if (profile.nickname && !profile.codeClaimed && !(GL.online.state().email)) { toast('<span><b>Noch nicht gesichert</b>Dein Spielercode ist noch nicht online. Ohne Verbindung wäre der Fortschritt nach dem Abmelden weg.</span>'); break; }
        if (!ui.logoutArmed) { ui.logoutArmed = true; const t = document.getElementById('title'); if (t) t.dataset.last = ''; draw(); break; }
        el.disabled = true; el.textContent = 'Melde ab …';
        const done = () => {
          // Lokale Kopie weg, damit kein zweiter Eintrag mit deinem Namen entsteht. Online bleibt alles im Konto.
          try { ['grandline.run', 'grandline.profile', 'grandline.best', 'grandline.uid'].forEach(k => localStorage.removeItem(k)); sessionStorage.removeItem('gl.pulled'); } catch (e2) { /* egal */ }
          location.reload();
        };
        const bye = (async () => { try { if (profile.playerCode) await GL.online.codeSave(profile); } catch (e2) { /* egal */ } await GL.online.logout(); })();
        Promise.race([bye, new Promise(r => setTimeout(r, 4000))]).then(done, done);
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
        const nc = GL.nameCheck(inp ? inp.value : '');
        if (!nc.ok) { toast(`<span><b>Name nicht erlaubt</b>${esc2(nc.msg)}</span>`); break; }
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
        autoTrainAll();
        toast('<span><b>Training erledigt</b>Alle haben das empfohlene Training bekommen.</span>');
        break;
      }
      case 'auto-train-toggle': {
        profile.settings = profile.settings || {};
        profile.settings.autoTrain = !profile.settings.autoTrain;
        saveProfile();
        if (profile.settings.autoTrain && run) autoTrainAll();
        ui.lastStage = null; draw();
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
      case 'album': checkAlbum(); ui.album = el.dataset.tab || 'stats'; draw(); break;
      case 'buddy-open': openGearPop(GL.ui.buddyPop(profile)); break;
      case 'buddy-set': {
        profile.buddy = el.dataset.v || null; saveProfile();
        openGearPop(GL.ui.buddyPop(profile)); ui.lastStage = null; draw();
        break;
      }
      case 'crew-gift': {
        const id = el.dataset.id, r = GL.meta.giveSnack(profile, id);
        if (!r) break;
        saveProfile();
        openGearPop(GL.ui.crewCard(profile, id));
        const box = document.querySelector('#fpop .cc-spr'); if (box) { box.classList.add('gifted'); }
        if (GL.sfx) GL.sfx.play(r.up ? 'level' : 'heal');
        const d = id === 'self' ? { name: profile.nickname } : GL.data.crew.find(c => c.id === id);
        const M = GL.data.momentsOf ? GL.data.momentsOf(id, d && d.role) : [];
        toast(`<span><b>${esc2(d ? d.name : '')} freut sich ♥</b>${r.up ? `Vertraut ${r.lvl}!${M.some(m => m.lvl === r.lvl) ? ' Ein neuer gemeinsamer Moment wartet.' : ''}` : '+15 Vertrautheit.'}</span>`);
        break;
      }
      case 'crew-nick': {
        const id = el.dataset.id, inp = document.getElementById('cc-nick');
        if (!inp) break;
        profile.crewNick = Object.assign({}, profile.crewNick, { [id]: inp.value.replace(/[<>]/g, '').trim().slice(0, 16) });
        if (!profile.crewNick[id]) delete profile.crewNick[id];
        saveProfile(); openGearPop(GL.ui.crewCard(profile, id));
        break;
      }
      case 'moment': {
        const id = el.dataset.id;
        profile.momSeen = Object.assign({}, profile.momSeen, { [id + ':' + i]: 1 }); saveProfile();
        openGearPop(GL.ui.momentPop(profile, id, i)); if (GL.sfx) GL.sfx.play('found');
        break;
      }
      case 'crew-card': { const id = el.dataset.id; if (id) { openGearPop(GL.ui.crewCard(profile, id)); if (GL.sfx) GL.sfx.play('heal'); } break; }
      case 'pet-set': {
        // Begleiter mitnehmen (leer = absetzen). Sitzt im Profil auf der Schulter und steht im Hafen am Steg
        const v = el.dataset.v || null;
        if (v && !(profile.pets || []).includes(v)) break;
        profile.cos = Object.assign({}, profile.cos, { pet: v });
        saveProfile();
        if (document.getElementById('fpop') && el.closest('#fpop')) closePop();
        const t = document.getElementById('title'); if (t) t.dataset.last = '';
        ui.lastStage = null; draw();
        break;
      }
      case 'album-tab': ui.album = el.dataset.tab; draw(); break;
      case 'album-close': ui.album = null; draw(); break;
    }
    if (type === 'fight') document.body.classList.remove('fast');
  });

  // Tastenkürzel: 1-9 Optionen, Enter/Leertaste weiter, F schneller, S überspringen
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter' && e.target.id === 'pf-name') { e.preventDefault(); document.querySelector('[data-act=profile-save]')?.click(); return; }
    if (e.key === 'Enter' && e.target.id === 'code-in') { e.preventDefault(); document.querySelector('[data-act=code-login]')?.click(); return; }
    if (e.key === 'Enter' && e.target.id === 'cc-nick') { e.preventDefault(); document.querySelector('[data-act=crew-nick]')?.click(); return; }
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
    // Esc: oberstes Fenster schließen (Pop-up, Spieler-Karte, Album, Steckbrief, Raum im Hafen)
    if (e.key === 'Escape') {
      const pop = document.getElementById('fpop');
      if (pop) { closePop(); return; }
      if (ui.viewPlayer) { ui.viewPlayer = null; ui.squadFight = null; draw(); return; }
      if (ui.peek) { ui.peek = false; draw(); return; }
    }
    if (e.key === 'Escape' && (ui.album || ui.sheet != null)) { ui.album = null; ui.sheet = null; draw(); return; }
    if (e.key === 'Escape' && run && ui.tvSel != null && ui.tvSel >= 0) { ui.tvSel = -1; ui.lastStage = null; draw(); return; }
    if (e.key === 'Escape' && !run && ui.hqRoom) { ui.hqRoom = null; draw(); return; }
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
        stage.querySelector('[data-act=fast]')?.click();
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
  // Umsortieren per Hand ist abgeschaltet (Aufstellung passiert automatisch, siehe autoArrange)
  const DRAG_SEL = '.no-manual-reorder';
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
    const slot = e.target.closest && e.target.closest('.no-manual-reorder');
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
  // Einladung per Link (?wettfahrt=CODE): nach dem Profil-Anlegen die Wettfahrt anbieten
  try {
    const inv = new URLSearchParams(location.search).get('wettfahrt');
    if (inv && /^[0-9a-z]{1,8}$/i.test(inv)) {
      history.replaceState(null, '', location.pathname);
      const tryInvite = () => { if (profile.nickname && !ui.screen) openDuelPop(inv.toUpperCase(), true); else setTimeout(tryInvite, 1500); };
      setTimeout(tryInvite, 800);
    }
  } catch (e) { /* egal */ }
  // Online-Rangliste: neu zeichnen, wenn sich Einträge ändern (nur im Hauptquartier sichtbar)
  if (GL.online) {
    GL.online.onChange(() => {
      if (GL.friends && profile.nickname) {
        const got = GL.friends.checkInvites(profile);
        if (got.length) { saveProfile(); openGearPop(GL.ui.invitePop(got, profile)); }
        // Freund kommt online: kleiner Hinweis (höchstens zwei auf einmal, nicht während eines Kampfes)
        const on = GL.friends.cameOnline ? GL.friends.cameOnline(profile) : [];
        if (on.length && !(anim && !anim.done)) on.slice(0, 2).forEach(n => toast(`<span><b><i class="on-dot"></i> ${esc2(n)} ist online</b>Ahoi! Vielleicht Lust auf ein Crew-Duell?</span>`));
      }
    });
    GL.online.onChange(() => { checkDailyPay(); if ((!run || ui.screen) && document.activeElement && document.activeElement.id !== 'nick') draw(); });
    // Online liegt ein neuerer Spielstand (anderes Gerät): übernehmen und neu laden
    GL.online.onRemoteProfile(remote => {
      if (sessionStorage.getItem('gl.pulled')) return;
      try { sessionStorage.setItem('gl.pulled', '1'); } catch (e2) { /* egal */ }
      // Nicht blind überschreiben: Beute und Freischaltungen aus dem lokalen Stand bleiben erhalten
      let merged = remote;
      try { if (profile && profile.nickname && (!remote.nickname || remote.nickname === profile.nickname)) merged = GL.meta.mergeProfiles(remote, profile); } catch (e3) { merged = remote; }
      GL.save.replaceProfile(merged);
      location.reload();
    });
    GL.online.init(profile);
    // Angriffe auf die eigene Stammcrew seit dem letzten Besuch (kurz nach dem Start, dann alle 5 Min.)
    const checkDefense = () => {
      if (!profile.nickname || !GL.meta.squadUnlocked(profile) || !GL.online.duelInbox) return;
      GL.online.duelInbox().then(list => {
        if (!list.length) return;
        let held = 0, lost = 0, change = 0;
        list.forEach(x => { if (x.attacker_won) { lost++; change -= x.delta; } else { held++; change += Math.max(1, Math.round(x.delta / 2)); } });
        profile.squadRating = Math.max(0, (profile.squadRating == null ? 1000 : profile.squadRating) + change);
        profile.squadDef = { held: (profile.squadDef && profile.squadDef.held || 0) + held, lost: (profile.squadDef && profile.squadDef.lost || 0) + lost };
        saveProfile();
        if (GL.online.register) GL.online.register(profile);
        const last = list[list.length - 1];
        const who = GL.safeName ? GL.safeName(last.attacker_name || 'Pirat') : (last.attacker_name || 'Pirat');
        const head = list.length === 1
          ? `${esc2(who)} hat deine Stammcrew herausgefordert`
          : `${list.length} Piraten haben deine Stammcrew herausgefordert`;
        const body = list.length === 1
          ? (last.attacker_won ? 'und gewonnen.' : 'und verloren. Deine Crew hat gehalten!')
          : `${held}× gehalten, ${lost}× verloren.`;
        toast(`<span><b>${head}</b>${body} Crew-Rating ${change >= 0 ? '+' : ''}${change}.</span>`);
        ui.lastStage = null; draw();
      });
    };
    setTimeout(checkDefense, 6000);
    // Flaschenpost von Freunden abholen
    const checkBottles = () => {
      if (!profile.nickname || !GL.cgear || !GL.online.bottleInbox) return;
      GL.online.bottleInbox().then(list => {
        const got = list.map(x => ({ it: GL.cgear.clean(x.item, GL.safeName ? GL.safeName(x.from_name || 'Pirat') : x.from_name), from: x.from_name })).filter(x => x.it);
        if (!got.length) return;
        got.forEach(x => { GL.cgear.bag(profile).push(x.it); profile.gearNew = (profile.gearNew || []).concat([x.it.uid]); });
        saveProfile();
        const x = got[0], who = esc2(GL.safeName ? GL.safeName(x.from || 'Pirat') : (x.from || 'Pirat'));
        if (GL.sfx) GL.sfx.play('found');
        openGearPop(`<div class="fpop-card bottle-pop" role="dialog"><span class="fpop-kicker">Flaschenpost</span><div class="bottle-art">🍾</div>
          <h3 id="fpop-t">${got.length === 1 ? `${who} hat dir etwas geschickt!` : `${got.length} Flaschen sind angespült!`}</h3>
          <div class="bottle-items">${got.map(g => `<span class="bottle-it cr-${GL.cgear.RID[g.it.r]}">${GL.ui.cgArtOf(g.it)}<b>${esc2(GL.cgear.name(g.it))}</b><small>von ${esc2(g.from || 'Pirat')}</small></span>`).join('')}</div>
          <p class="hint">Liegt jetzt in deiner Truhe bei der Stammcrew.</p>
          <div class="fpop-btns"><button class="btn" data-act="dress" data-id="${esc2((GL.meta.squadIds(profile)[0]) || 'self')}">Ansehen</button><button class="btn ghost" data-act="pop-close">Später</button></div></div>`);
        ui.lastStage = null; draw();
      });
    };
    setTimeout(checkBottles, 8000);
    setInterval(checkBottles, 300000);
    // App wieder vorne: neuere Version laden bzw. Spielstand vom anderen Gerät holen
    let lastSync = Date.now();
    const backToApp = () => {
      if (document.hidden || Date.now() - lastSync < 20000) return;
      lastSync = Date.now();
      const idle = !run || GL.run.isFinished(run);
      fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(j => {
        if (j && j.v && GL.version && j.v !== GL.version && ui.updAsked !== j.v) {
          // Nicht einfach neu laden: fragen. Im Run nur ein leiser Hinweis, die Frage kommt danach.
          // Auch mitten im Run: einmal fragen (nicht während eine Kampfanimation läuft). Der Run bleibt gespeichert.
          if (!document.getElementById('fpop') && !(anim && !anim.done)) { ui.updAsked = j.v; openGearPop(GL.ui.updatePop(j, !idle)); }
        }
      }).catch(() => {});
      if (idle) { try { sessionStorage.removeItem('gl.pulled'); } catch (e2) { /* egal */ } GL.online.resync && GL.online.resync(); }
    };
    document.addEventListener('visibilitychange', backToApp);
    window.addEventListener('focus', backToApp);
    setInterval(() => { if (!document.hidden) checkDefense(); }, 300000);
    setInterval(() => { if (!document.hidden) { lastSync = 0; backToApp(); } }, 180000);   // alle 3 Minuten nach Updates schauen
  }
})();
