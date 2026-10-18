// Saison 1 (18.10.2026, 18 Uhr): Countdown, Live-Event, Einladung, Saison-Rangliste und freiwilliger Neustart.
// Zeitpunkt in GL.config.season. Zum Testen: localStorage 'gl.seasonAt' = Startzeit in ms.
window.GL = window.GL || {};

(function () {
  const S = () => GL.config.season || { id: null, start: 0 };
  const startAt = () => { try { const t = Number(localStorage.getItem('gl.seasonAt')); if (t > 0) return t; } catch (e) { /* egal */ } return S().start; };
  const started = () => !!S().id && Date.now() >= startAt();
  const msLeft = () => Math.max(0, startAt() - Date.now());
  const inLaunch = () => started() && Date.now() < (S().launchEnd || 0) + (startAt() - S().start);
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const BACKUP = 'grandline.profile.testfahrt';

  // Alter Spielstand von vor dem Neustart? (Neue Profile nach dem Start tragen die Saison schon)
  function stale(p) { return started() && p && p.nickname && p.season !== S().id; }

  // Freiwilliger frischer Start: Name, Aussehen, Freunde, Bande bleiben, dazu Veteranen-Titel (und Geschenk für Weitgekommene)
  function convert(p) {
    try { localStorage.setItem(BACKUP, JSON.stringify(p)); ['grandline.run', 'grandline.best'].forEach(k => localStorage.removeItem(k)); } catch (e) { /* egal */ }
    const fresh = GL.meta.newProfile();
    const runs = (p.stats && p.stats.runs) || 0;
    Object.assign(fresh, {
      nickname: p.nickname, char: p.char, friends: p.friends || [], invites: p.invites || [], refBy: p.refBy,
      playerCode: p.playerCode, codeClaimed: p.codeClaimed, wikiSeen: p.wikiSeen, crewName: p.crewName,
      cos: Object.assign({}, p.cos && p.cos.star ? { star: p.cos.star } : {}, runs >= 1 ? { title: 'veteran' } : {}),
      veteran: runs >= 1 ? 1 : 0, oldRuns: runs, season: S().id, seasonWipe: true,
      savedAt: Date.now()
    });
    // Wer es weit geschafft hat (zweites Meer erreicht oder einen Sieg), bekommt zwei epische Ausrüstungsteile für die Crew
    const far = (p.counts && p.counts['reached:1']) || (p.stats && p.stats.wins);
    if (far && GL.cgear && GL.cgear.roll) {
      try {
        const bag = GL.cgear.bag(fresh);
        for (let i = 0; i < 2; i++) bag.push(GL.cgear.roll({ r: 2, name: 'Testfahrt', seaName: 'Dank für die Testfahrt', sea: 1 }));
        fresh.vetGift = 2;
      } catch (e) { /* egal */ }
    }
    return fresh;
  }

  // Startabend: wer jetzt segelt, bekommt die Flagge „Erste Fahrt“
  function markLaunch(p) { if (inLaunch() && !p.launch) { p.launch = 1; return true; } return false; }

  const pad = n => String(n).padStart(2, '0');
  function clock(ms) {
    const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return (h ? h + ':' : '') + pad(m) + ':' + pad(x);
  }
  const when = () => en() ? 'today 6 pm (CEST)' : 'heute 18:00 Uhr';

  // Kalender: .ics zum Herunterladen und Google-Kalender-Link
  function ics() {
    const d = new Date(startAt()), e = new Date(startAt() + 3600000);
    const f = x => x.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const url = location.origin + location.pathname;
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grand Line//DE', 'BEGIN:VEVENT', 'UID:grandline-s1@flexibeel', 'DTSTAMP:' + f(new Date()),
      'DTSTART:' + f(d), 'DTEND:' + f(e), 'SUMMARY:Grand Line: Saison 1 startet ⛵', 'DESCRIPTION:Skillbaum, neue Routen, Rangliste ab null. Leinen los! ' + url, 'URL:' + url,
      'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'DESCRIPTION:Grand Line startet gleich!', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(txt);
  }
  function gcal() {
    const f = x => new Date(x).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Grand Line: Saison 1 startet ⛵') +
      '&dates=' + f(startAt()) + '/' + f(startAt() + 3600000) + '&details=' + encodeURIComponent('Skillbaum, neue Routen, Rangliste ab null. Leinen los! ' + location.origin + location.pathname);
  }
  function shareText() {
    return en()
      ? 'Grand Line Season 1 starts ' + when() + '! Skill tree, new routes, leaderboard from zero. Sail with me and grab the best loot first ⛵'
      : 'Grand Line Saison 1 startet ' + when() + '! Skillbaum, neue Routen, Rangliste ab null. Segel mit mir los und schnapp dir zuerst die beste Beute ⛵';
  }

  // Kleine Pixel-Bühne: Schiff auf Wellen, Möwen, Sterne
  function stage(profile) {
    const ship = GL.sprites && GL.sprites.ship ? GL.sprites.ship((profile && profile.cos && profile.cos.ship) || undefined) : '';
    const crew = ['ruffy', 'zorro', 'nami'].map(id => GL.data.crew.find(c => c.id === id)).filter(Boolean)
      .map((d, i) => `<i class="sz-who" style="--i:${i}">${GL.sprites.render(d)}</i>`).join('');
    return `<div class="sz-stage" aria-hidden="true"><i class="sz-sun"></i><i class="sz-gull a"></i><i class="sz-gull b"></i>
      <span class="sz-ship">${ship}</span><span class="sz-crew">${crew}</span><i class="sz-wave a"></i><i class="sz-wave b"></i></div>`;
  }
  function timerHtml(big) {
    return `<span class="sz-timer${big ? ' big' : ''}" data-season-timer>${clock(msLeft())}</span>`;
  }

  // Banner im Titelbild und im Hafen (nur vor dem Start)
  function banner(profile) {
    if (!S().id || started()) return '';
    return `<button class="sz-banner" data-act="season-open">
      <span class="sz-live"><i></i>LIVE</span>
      <span class="sz-bt"><b>${en() ? 'Season 1 · ' + when() : 'Saison 1 · ' + when()}</b><small>${en() ? 'Skill tree, new routes, leaderboard from zero' : 'Skillbaum, neue Routen, Rangliste ab null'}</small></span>
      ${timerHtml(false)}</button>`;
  }

  // Fenster: Live-Event mit Countdown, Kalender und Einladen
  function popup(profile, invitedBy) {
    const live = started();
    const head = invitedBy
      ? (en() ? `<b>${invitedBy}</b> invites you aboard!` : `<b>${invitedBy}</b> lädt dich an Bord ein!`)
      : (en() ? 'Live event' : 'Live-Event');
    const title = live ? (en() ? 'Season 1 has begun!' : 'Saison 1 hat begonnen!') : (en() ? 'Season 1 starts ' + when() : 'Saison 1 startet ' + when());
    const text = live
      ? (en() ? 'Season 1 is live! The leaderboard starts at zero, everyone at the same line. Set sail now and be the first with the best gear!' : 'Saison 1 läuft! Die Rangliste startet bei null, alle an derselben Startlinie. Segel jetzt los und sei der Erste mit der tollsten Ausrüstung!')
      : (en() ? 'At 6 pm Season 1 begins: skill tree, new routes, new enemies, new items, a new game system. The leaderboard starts at zero. Be there live, set sail with your buddies and be the first with the best gear!'
        : 'Um 18 Uhr beginnt Saison 1: Skillbaum, neue Routen, neue Gegner, neue Items, ein neues Spielsystem. Die Rangliste startet bei null. Sei live dabei, segel mit deinen Kumpanen los und sei der Erste mit der tollsten Ausrüstung!');
    const keep = en() ? 'Your progress stays. The leaderboard starts at zero: only voyages from 6 pm count. Fancy a fresh start? You can choose it then, with a reward for testers.' : 'Dein Fortschritt bleibt. Die Rangliste startet bei null: Es zählen nur Fahrten ab 18 Uhr. Lust auf einen Neuanfang? Kannst du dann freiwillig wählen, mit Belohnung für Tester.';
    const canInvite = profile && profile.nickname && GL.friends && GL.online && GL.online.state && GL.online.state().uid;
    return `<div class="fpop-card sz-pop">
      <div class="sz-kicker">${live ? '<span class="sz-live on"><i></i>LIVE</span>' : '<span class="sz-live"><i></i>LIVE</span>'} ${head}</div>
      ${stage(profile)}
      <h3 class="sz-title">${title}</h3>
      ${live ? '' : `<div class="sz-count">${timerHtml(true)}<small>${en() ? 'until departure' : 'bis zum Ablegen'}</small></div>`}
      <p class="sz-text">${text}</p>
      ${live ? '' : `<p class="sz-keep">${keep}</p>`}
      <div class="sz-btns">
        ${live ? `<button class="btn" data-act="season-go">${en() ? 'Cast off!' : 'Leinen los!'}</button>${profile && profile.nickname && (profile.stats && profile.stats.runs) ? `<button class="btn ghost sz-fresh" data-act="season-fresh">${en() ? 'Start fresh (with reward)' : 'Frisch starten (mit Belohnung)'}</button>` : ''}` : `
        <a class="btn ghost sz-cal" href="${ics()}" download="grand-line-start.ics">📅 ${en() ? 'Add to calendar' : 'In den Kalender'}</a>
        <a class="btn ghost sz-cal" href="${gcal()}" target="_blank" rel="noopener">Google ${en() ? 'Calendar' : 'Kalender'}</a>`}
        ${canInvite ? `<button class="btn sz-inv" data-act="season-invite">💌 ${en() ? 'Invite buddies' : 'Kumpels einladen'}</button>` : ''}
        ${invitedBy || !live ? `<button class="btn${canInvite ? ' ghost' : ''}" data-act="pop-close">${profile && profile.nickname ? (en() ? 'Got it' : 'Alles klar') : (en() ? 'Climb aboard' : 'An Bord kommen')}</button>` : ''}
      </div>
    </div>`;
  }

  // Einladen: Link + QR + Teilen
  function invitePop(profile) {
    const link = GL.friends.link();
    return `<div class="fpop-card sz-pop sz-invite">
      <div class="sz-kicker">💌 ${en() ? 'Invite buddies' : 'Kumpels einladen'}</div>
      <h3 class="sz-title">${en() ? 'Sail together!' : 'Gemeinsam lossegeln!'}</h3>
      <p class="sz-text">${en() ? 'Whoever opens your link becomes your sailing buddy automatically and gets 150 Berry as a welcome gift.' : 'Wer deinen Link öffnet, wird automatisch dein Segelkumpan und bekommt 150 Berry als Willkommensgeschenk.'}</p>
      <div class="sz-qr" id="sz-qr"><small>${en() ? 'Loading QR code…' : 'QR-Code lädt …'}</small></div>
      <input class="sz-link" readonly value="${link}" aria-label="Link">
      <div class="sz-btns">
        <button class="btn" data-act="season-share">${en() ? 'Send link' : 'Link verschicken'}</button>
        <button class="btn ghost" data-act="pop-close">${en() ? 'Done' : 'Fertig'}</button>
      </div>
    </div>`;
  }

  // Sekündlich alle Countdowns auffrischen; bei null einmal Bescheid geben
  let fired = false;
  function tick(onZero) {
    const left = msLeft();
    document.querySelectorAll('[data-season-timer]').forEach(el => { const t = clock(left); if (el.textContent !== t) el.textContent = t; });
    if (S().id && left <= 0 && !fired && onZero) { fired = true; onZero(); }
  }

  GL.season = { started, msLeft, stale, convert, markLaunch, inLaunch, banner, popup, invitePop, tick, shareText, clock, id: () => S().id, backupKey: BACKUP };
})();
