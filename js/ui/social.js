// Mitsegler im Hafen (Fork SOC): das Gefühl, mit ein paar anderen cozyen Leuten unterwegs zu sein.
//   GL.social.ships(profile)    → kleine Schiffe anderer Spieler in der Hafen-Szene (antippen = Spielerkarte)
//   GL.social.note(profile)     → vergleicht die Rangliste mit dem letzten Stand und schreibt das Hafen-Logbuch (true = geändert)
//   GL.social.logbook(profile)  → bis zu 3 Zeilen „Hafen-Logbuch“ mit 🍻-Knopf
//   GL.social.cheer(profile, i) → Prost (vorerst nur lokal, siehe tools/hafen-gruss-idee.sql)
//   GL.social.passBy(run)       → höchstens einmal pro Run: Text für „ein anderes Schiff kreuzt“
// Nur vorhandene Ranglisten-Daten (schon durch safeRows), keine neue Tabelle, keine Spiellogik.
window.GL = window.GL || {};

(function () {
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const L = (de, e) => (en() ? e : de);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' })[ch]);
  const clean = s => String(s == null ? '' : s).replace(/[<>"'`&\\\u0000-\u001f]/g, '').trim();
  const DAY = 864e5;
  const ageOf = r => { const t = Date.parse(r && r.updated); return isFinite(t) ? Date.now() - t : Infinity; };
  const online = r => ageOf(r) < 240000;

  function st() { return GL.online && GL.online.state ? GL.online.state() : {}; }
  // Andere echte Spieler mit Namen, die in den letzten Tagen gesegelt sind, zuletzt aktive zuerst
  function others(profile, maxAge) {
    const s = st();
    if (s.backend !== 'supabase') return [];
    const me = String((profile && profile.nickname) || '').trim().toLowerCase();
    return (s.rows || []).filter(r => r && r.id && r.id !== s.uid && !r.npc && clean(r.name) && clean(r.name).toLowerCase() !== me
      && !/^(pirat|unbekannter pirat|-)$/i.test(clean(r.name)) && ageOf(r) < (maxAge || 3 * DAY))
      .sort((a, b) => ageOf(a) - ageOf(b));
  }
  function where(r) {
    if (online(r) && r.pos && r.pos.sea) return '⛵ ' + clean(r.pos.isl && r.pos.isl !== r.pos.sea ? r.pos.isl : r.pos.sea).slice(0, 18);
    const a = ageOf(r);
    return a < 3600e3 ? L('⚓ vor Anker', '⚓ at anchor') : a < DAY ? L('⚓ schläft im Hafen', '⚓ asleep in port') : L('⚓ länger weg', '⚓ away a while');
  }

  // ---------- Schiffe in der Hafen-Szene ----------
  function ships(profile) {
    const list = others(profile).slice(0, 4);
    if (!list.length || !GL.sprites || !GL.sprites.ship) return '';
    return `<div class="soc-fleet">${list.map((r, k) => {
      const n = clean(r.name).slice(0, 24), cn = r.crewName ? clean(r.crewName).slice(0, 20) : '';
      const on = online(r), w = where(r);
      const label = `${n}${cn ? ' · ' + cn : ''} · ${w}`;
      return `<button class="soc-ship s${k}${on ? ' on' : ''}" data-act="lb-view" data-id="${esc(r.id)}" aria-label="${esc(label)}" title="${esc(label)}">
        <span class="soc-hull">${GL.sprites.ship(r.ship && typeof r.ship === 'object' ? r.ship : { std: 1 })}</span>
        <span class="soc-tag"><b>${on ? '<i class="on-dot"></i>' : ''}${esc(n.length > 10 ? n.slice(0, 9) + '…' : n)}</b><small>${esc(w)}</small></span></button>`;
    }).join('')}</div>`;
  }

  // ---------- Hafen-Logbuch ----------
  const LEAGUE_EN = { planke: 'Plank League', bronze: 'Bronze League', silber: 'Silver League', gold: 'Gold League', diamant: 'Diamond League', legende: 'Legend League' };
  const leagueOf = v => { const l = GL.dliga ? GL.dliga.league(v) : null; return l ? { id: l.id, name: (en() ? l.en : l.name) + (en() ? ' league' : '-Liga') } : null; };   // Dungeon-Liga
  const pick = (arr, seed) => arr[Math.abs(seed | 0) % arr.length];
  const hash = s => { let h = 7; String(s).split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) | 0; }); return h; };
  function line(e) {
    const n = esc(e.n), v = e.v, h = hash(e.n + e.k + e.at);
    switch (e.k) {
      case 'boss': return v > 1 ? L(`${n} hat ${v} Inselbosse erledigt. Die Versicherung ist alarmiert.`, `${n} took down ${v} island bosses. The insurers are alarmed.`)
        : pick([L(`${n} hat einen Inselboss verprügelt. Der Boss bestreitet das.`, `${n} beat up an island boss. The boss denies everything.`),
          L(`${n} hat einen Inselboss besiegt und dabei kaum geflucht.`, `${n} defeated an island boss and barely swore.`)], h);
      case 'win': return pick([L(`${n} hat die Grand Line bezwungen. Angeblich ohne Karte.`, `${n} conquered the Grand Line. Reportedly without a map.`),
        L(`${n} ist ganz durchgesegelt. Die Möwen gratulieren, wenn auch laut.`, `${n} sailed all the way through. The gulls congratulate, loudly.`)], h);
      case 'league': return L(`${n} spielt jetzt in der ${esc(v)}. Die Marine legt eine Akte an.`, `${n} is now in the ${esc(v)}. The Marines have opened a file.`);
      case 'crew': return L(`${n} segelt jetzt als „${esc(v)}“. Die Flagge ist noch nicht trocken.`, `${n} now sails as “${esc(v)}”. The flag is still drying.`);
      case 'sea': return L(`${n} hat ein ganzes Meer abgehakt. Das Meer nimmt es gelassen.`, `${n} ticked off an entire sea. The sea is taking it well.`);
      case 'land': return L(`${n} war auf Landgang und kam mit vollen Taschen zurück.`, `${n} went ashore and came back with full pockets.`);
      case 'bounty': return L(`${n} hat ein neues Kopfgeld-Hoch: ${Number(v) || 0} Mio. ฿. Die Steckbriefe werden nachgedruckt.`, `${n} hit a new bounty high: ${Number(v) || 0}M ฿. Wanted posters are being reprinted.`);
      case 'new': return L(`Neu im Hafen: ${n}. Bitte freundlich winken, nicht füttern.`, `New in port: ${n}. Please wave kindly. Do not feed.`);
      case 'fact': return esc(v);
      default: return '';
    }
  }
  const ICO = { boss: '💀', win: '🏁', league: '🏅', crew: '🏴', sea: '🗺', land: '🏝', bounty: '📜', new: '⚓', fact: '📖' };
  const snapOf = r => ({ n: clean(r.name).slice(0, 24), b: +r.bossKills || 0, w: +r.wins || 0, r: +r.dlRating || 0,
    c: r.crewName ? clean(r.crewName).slice(0, 20) : '', s: +r.seasDone || 0, l: +r.landgang || 0, t: +r.topBounty || 0 });

  function note(profile) {
    if (!profile) return false;
    const rows = others(profile, 14 * DAY);
    if (!rows.length) return false;
    const so = profile.social = profile.social || {};
    const first = !so.snap;
    const snap = so.snap || {};
    const now = Date.now(), add = [];
    rows.forEach(r => {
      const cur = snapOf(r), old = snap[r.id];
      if (!first && !old) add.push({ k: 'new', n: cur.n, id: r.id });
      if (old) {
        const ev = (k, v) => add.push({ k, n: cur.n, v, id: r.id });
        if (cur.w > old.w) ev('win', cur.w - old.w);
        else if (cur.b > old.b) ev('boss', cur.b - old.b);
        if (cur.s > old.s) ev('sea', cur.s);
        const la = leagueOf(old.r || 0), lb = leagueOf(cur.r || 0);
        if (cur.r > old.r && la && lb && lb.id !== la.id && old.r) ev('league', lb.name);
        if (cur.c && cur.c !== old.c) ev('crew', cur.c);
        if (cur.t > old.t && old.t > 0 && cur.t >= 50) ev('bounty', cur.t);
        if (cur.l > old.l && !add.some(x => x.id === r.id)) ev('land', cur.l - old.l);
      }
      snap[r.id] = cur;
    });
    // Schnappschuss klein halten: nur die zuletzt gesehenen 40
    const keep = rows.slice(0, 40).map(r => r.id);
    Object.keys(snap).forEach(id => { if (!keep.includes(id)) delete snap[id]; });
    so.snap = snap;
    if (!add.length) return first;
    // Pro Spieler höchstens zwei Meldungen auf einmal, neueste oben
    const per = {};
    const fresh = add.filter(e => (per[e.id] = (per[e.id] || 0) + 1) <= 2).map((e, i) => ({ k: e.k, n: e.n, v: e.v, at: now - i }));
    so.log = fresh.concat(so.log || []).filter(e => now - e.at < 7 * DAY).slice(0, 10);
    return true;
  }
  // Noch nichts passiert? Dann ein paar Hafen-Fakten über die anderen, damit der Hafen nicht leer wirkt
  function facts(profile) {
    return others(profile, 7 * DAY).slice(0, 6).map(r => {
      const n = esc(clean(r.name).slice(0, 24)), cn = r.crewName ? esc(clean(r.crewName).slice(0, 20)) : '';
      const b = +r.bossKills || 0, w = +r.wins || 0;
      const v = cn ? L(`${n} segelt unter der Flagge „${cn}“. Niemand weiß genau, warum.`, `${n} sails under the flag “${cn}”. Nobody quite knows why.`)
        : w ? L(`${n} hat die Grand Line schon ${w}× geschafft und erwähnt das gern.`, `${n} has beaten the Grand Line ${w}× and likes to mention it.`)
        : b ? L(`${n} hat ${b} Inselbosse auf dem Gewissen. Schläft trotzdem gut.`, `${n} has ${b} island bosses on their conscience. Sleeps fine.`)
        : L(`${n} ist auch auf See. Man grüßt sich, man kennt sich.`, `${n} is out at sea too. You nod, you know each other.`);
      return { k: 'fact', n: '', v, at: 0, fact: true, raw: true };
    }).slice(0, 3);
  }
  function logbook(profile) {
    if (st().backend !== 'supabase') return '';
    const so = (profile && profile.social) || {};
    const now = Date.now();
    let list = (so.log || []).filter(e => now - e.at < 3 * DAY).slice(0, 3);
    const real = list.length > 0;
    if (!real) list = facts(profile);
    if (!list.length) return '';
    return `<div class="soc-log pxf"><span class="soc-log-h">${L('📜 Hafen-Logbuch', '📜 Harbour log')}</span>${list.map((e, i) => {
      const txt = e.raw ? e.v : line(e);   // Fakten sind schon escaped
      const done = real && e.ch;
      return `<div class="soc-row"><i class="soc-ico" aria-hidden="true">${ICO[e.k] || '📖'}</i><span>${txt}</span>${real ? `<button class="soc-cheer${done ? ' done' : ''}" data-act="soc-cheer" data-i="${i}" aria-label="${L('Prost', 'Cheers')}"${done ? ' disabled' : ''}>🍻${done ? `<em>${L('Prost!', 'Cheers!')}</em>` : ''}</button>` : ''}</div>`;
    }).join('')}</div>`;
  }
  function cheer(profile, i) {
    const so = profile && profile.social;
    if (!so || !so.log) return false;
    const now = Date.now();
    const list = so.log.filter(e => now - e.at < 3 * DAY).slice(0, 3);
    const e = list[+i];
    if (!e || e.ch) return false;
    e.ch = 1;
    return true;
  }

  // ---------- Unterwegs: ein anderes Schiff kreuzt (höchstens einmal pro Run) ----------
  function passBy(run, profile) {
    if (!run || run.daily) return null;
    const key = 'gl.pass.' + (run.seed || 0);
    try { if (sessionStorage.getItem(key)) return null; } catch (e) { /* egal */ }
    if ((run.step || 0) < 2) return null;
    const sea = GL.run && GL.run.island ? (GL.run.island(run) || {}).name : '';
    const live = others(profile, 600000).filter(r => r.pos && r.pos.sea);
    if (!live.length) return null;
    const r = live.find(x => x.pos.sea === sea) || live[0];
    try { sessionStorage.setItem(key, '1'); } catch (e) { /* egal */ }
    const n = esc(clean(r.name).slice(0, 24)), cn = r.crewName ? esc(clean(r.crewName).slice(0, 20)) : '';
    const same = r.pos.sea === sea;
    return `<span><b>⛵ ${same ? L(`${n} kreuzt in der Ferne`, `${n} passes in the distance`) : L(`Teleschnecke: ${n} ist auch auf See`, `Den Den Mushi: ${n} is out at sea too`)}</b>${cn ? L(`Flagge: „${cn}“. `, `Flag: “${cn}”. `) : ''}${same ? L('Man winkt. Höflich, aber knapp.', 'You wave. Politely, but briefly.') : L(`Gerade irgendwo bei ${esc(clean(r.pos.sea))}. Grüße werden ausgerichtet.`, `Somewhere near ${esc(clean(r.pos.sea))}. Regards will be passed on.`)}</span>`;
  }

  // BATTLE2: „Auf offener See geblieben“ – gescheiterte Runs aller Spieler seit heute früh (Tages-Schnappschuss runs−wins)
  function seaLost(profile) {
    const s = st();
    if (!profile || s.backend !== 'supabase' || !(s.rows || []).length) return 0;
    const so = profile.social = profile.social || {};
    const day = new Date().toISOString().slice(0, 10);
    if (!so.lost || so.lost.d !== day) so.lost = { d: day, m: {} };
    const m = so.lost.m; let n = 0;
    (s.rows || []).forEach(r => {
      if (!r || !r.id || r.npc) return;
      const lost = Math.max(0, (Number(r.runs) || 0) - (Number(r.wins) || 0));
      if (m[r.id] == null) m[r.id] = lost; else n += Math.max(0, lost - m[r.id]);
    });
    const ids = Object.keys(m); if (ids.length > 80) ids.slice(0, ids.length - 80).forEach(k => delete m[k]);
    return n;
  }
  function seaLostLine(profile) {
    const n = seaLost(profile);
    if (!n) return '';
    const en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
    const t = en ? (n === 1 ? '1 brave sailor stayed out on the open sea today. The gulls send their regards.' : `${n} brave sailors stayed out on the open sea today. The gulls send their regards.`)
      : (n === 1 ? '1 tapferer Segler ist heute auf offener See geblieben. Die Möwen lassen grüßen.' : `${n} tapfere Segler sind heute auf offener See geblieben. Die Möwen lassen grüßen.`);
    return `<div class="sea-lost"><i>🌊</i><span>${t}</span></div>`;
  }
  GL.social = { ships, note, logbook, cheer, passBy, seaLostLine, _others: others };
})();
