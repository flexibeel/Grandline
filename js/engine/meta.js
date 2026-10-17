// Dauerhafter Fortschritt über Runs hinweg (Profil).
// Kein Zugriff auf Speicher oder Seite: main.js lädt und speichert das Profil.
window.GL = window.GL || {};

(function () {
  const add = (list, id) => { if (id && !list.includes(id)) { list.push(id); return true; } return false; };

  GL.meta = {
    newProfile() {
      return {
        version: 1,
        unlocked: [],      // freigeschaltete Figuren (Kapitäne)
        epics: [],         // freigeschaltete epische Früchte
        seen: { crew: [], bosses: [], fruits: [], relics: [] },
        counts: {},        // z. B. { 'defeated:smoker': 2, 'reached:2': 1, win: 3 }
        current: { seed: null, counted: [] },   // was im laufenden Run schon gezählt wurde
        stats: { runs: 0, wins: 0, berryTotal: 0 },
        berry: 0,          // Währung im Hauptquartier
        upgrades: {},      // Werft-Stufen { rumpf: 2 }
        gear: {},          // Lager: Anzahl je Ausrüstung { proviant: 2 }
        loadout: [],       // was beim nächsten Run mitkommt
        vault: {},
        chest: [],         // Ausrüstung in der Truhe [{ uid, id, r, lvl }]
        itemLoadout: [],   // uids, die in den nächsten Run mitkommen         // Schatzkammer: Anzahl Funde je Artefakt { jitte: 2 } (Stufe = Anzahl, höchstens 5)
        artLoadout: [],    // ausgerüstete Artefakte
        rankXp: 0,         // Piratenrang (Account-Fortschritt)
        heatMax: 0,        // höchste freigeschaltete Kopfgeld-Stufe
        heat: 0            // gewählte Stufe für den nächsten Run
      };
    },

    // Ältere Profile um neue Felder ergänzen
    migrate(p) {
      const fresh = GL.meta.newProfile();
      Object.keys(fresh).forEach(k => { if (p[k] === undefined) p[k] = fresh[k]; });
      Object.keys(fresh.stats).forEach(k => { if (p.stats[k] === undefined) p.stats[k] = fresh.stats[k]; });
      return p;
    },

    // Berry für einen beendeten Run
    berryFor(profile, run) {
      const raids = (run.defeated || []).filter(id => GL.data.raids.some(r => r.id === id)).length;
      const hunted = (run.defeated || []).filter(id => (GL.data.hunted || []).some(h => h.id === id)).length;
      const base = run.step * 8 + run.bounties * 40 + raids * 40 + hunted * 12 + (run.phase === 'win' ? 120 : 0);
      const heat = (run.heat || 0) * GL.config.heatBonus.berry;
      // Rang-Bonus: jeder Piratenrang gibt dauerhaft +2 % Berry
      const rankBonus = GL.meta.rankIndex(profile) * 0.02;
      const artBonus = (run.arts || []).reduce((s, x) => {
        const art = (GL.data.artifacts || []).find(t => t.id === x.id);
        return s + (art && art.berry ? GL.run.artValue(art, x.lvl) : 0);
      }, 0);
      return Math.max(0, Math.round(base * (1 + GL.run.upgradeTotal(profile.upgrades, 'berry') + heat + rankBonus + artBonus)) + (run.berry || 0));
    },

    // ---------- Piratenrang ----------
    // Prestige: Stufen nach dem letzten Rang (je GL.data.prestigeXp Rang-EP)
    prestige(profile) {
      const R = GL.data.ranks, last = R[R.length - 1].xp;
      return Math.max(0, Math.floor(((profile.rankXp || 0) - last) / (GL.data.prestigeXp || 2500)));
    },
    rankIndex(profile) {
      const R = GL.data.ranks;
      let i = 0;
      R.forEach((r, k) => { if (profile.rankXp >= r.xp) i = k; });
      return i;
    },

    rankProgress(profile) {
      const R = GL.data.ranks;
      const i = GL.meta.rankIndex(profile);
      const cur = R[i], next = R[i + 1];
      if (!next) {
        const P = GL.data.prestigeXp || 2500;
        return { i, rank: cur, next: null, prestige: GL.meta.prestige(profile), have: (profile.rankXp - cur.xp) % P, need: P };
      }
      return { i, rank: cur, next, have: profile.rankXp - cur.xp, need: next.xp - cur.xp };
    },

    // Rang-Erfahrung für einen Run
    rankXpFor(run) {
      const raids = (run.defeated || []).filter(id => GL.data.raids.some(r => r.id === id)).length;
      const hunted = (run.defeated || []).filter(id => (GL.data.hunted || []).some(h => h.id === id)).length;
      const base = run.step * 3 + run.bounties * 15 + raids * 12 + hunted * 6 + (run.phase === 'win' ? 40 : 0);
      // Kleiner Trost: auch ein kurzer Run bringt etwas Rang-EP
      return Math.max(10, Math.round(base * (1 + (run.heat || 0) * 0.15)));
    },

    // Rang-Erfahrung gutschreiben, Belohnungen verteilen. Gibt neue Ränge zurück.
    addRankXp(profile, xp) {
      const before = GL.meta.rankIndex(profile);
      profile.rankXp += xp;
      const after = GL.meta.rankIndex(profile);
      const ups = [];
      for (let k = before + 1; k <= after; k++) {
        const r = GL.data.ranks[k];
        if (r.reward.berry) profile.berry += r.reward.berry;
        if (r.reward.gear) profile.gear[r.reward.gear] = (profile.gear[r.reward.gear] || 0) + 1;
        ups.push(k);
      }
      return ups;
    },

    // ---------- Hauptquartier ----------
    upgradeCost(profile, id) {
      const u = GL.data.upgrades.find(x => x.id === id);
      const lvl = profile.upgrades[id] || 0;
      return lvl < u.costs.length ? u.costs[lvl] : null;
    },

    buyUpgrade(profile, id) {
      const cost = GL.meta.upgradeCost(profile, id);
      if (cost == null || profile.berry < cost) return false;
      profile.berry -= cost;
      profile.upgrades[id] = (profile.upgrades[id] || 0) + 1;
      return true;
    },

    // ---------- Eigener Pirat ----------
    // Werte wachsen mit dem Piratenrang: so lohnt es sich, immer wieder mit ihm zu spielen
    selfDef(profile) {
      const ch = profile.char;
      if (!ch || !profile.nickname) return null;
      const k = GL.meta.rankIndex(profile);
      const base = { kraft: { hp: 33, atk: 8, spd: 5 }, klinge: { hp: 29, atk: 9, spd: 6 }, technik: { hp: 27, atk: 8, spd: 7 } }[ch.type] || { hp: 30, atk: 8, spd: 6 };
      return {
        name: profile.nickname, type: ch.type || 'kraft', role: ch.role || 'kaempfer', look: ch.look,
        hp: base.hp + Math.round(k * 1.4), atk: base.atk + Math.floor(k / 3), spd: base.spd + Math.floor(k / 7),
        rally: 1 + Math.floor(k / 5)
      };
    },

    // Verbrauchte/zerlegte Teile merken, damit sie beim Zusammenführen zweier Spielstände nicht zurückkommen
    gone(profile, uid) { const g = profile.gone = profile.gone || []; if (!g.includes(uid)) g.push(uid); if (g.length > 400) g.splice(0, g.length - 400); },
    // Zwei Spielstände zusammenführen (z. B. Handy + PC oder Cloud-Stand ist neuer, hat aber Beute nicht).
    // Basis ist der neuere Stand; dazu kommt alles, was nur im anderen liegt und nicht verbraucht wurde.
    mergeProfiles(base, other) {
      if (!base || !other) return base || other;
      const p = JSON.parse(JSON.stringify(base));
      const gone = new Set([].concat(p.gone || [], other.gone || []));
      p.gone = Array.from(gone).slice(-400);
      const byUid = (a, b) => { const have = new Set((a || []).map(x => x.uid)); return (a || []).concat((b || []).filter(x => x && x.uid && !have.has(x.uid) && !gone.has(x.uid))).filter(x => !gone.has(x.uid)); };
      p.gearBag = byUid(p.gearBag, other.gearBag);
      p.chest = byUid(p.chest, other.chest);
      const union = (a, b) => Array.from(new Set([].concat(a || [], b || [])));
      ['unlocked', 'epics', 'invites', 'friends', 'artLoadout'].forEach(k => { if (other[k]) p[k] = k === 'artLoadout' ? (p[k] || other[k]) : union(p[k], other[k]); });
      const maxMap = k => { p[k] = Object.assign({}, other[k] || {}, p[k] || {}); Object.keys(other[k] || {}).forEach(x => { p[k][x] = Math.max(p[k][x] || 0, other[k][x] || 0); }); };
      ['vault', 'loot', 'counts'].forEach(maxMap);
      if (other.seen) { p.seen = p.seen || {}; Object.keys(other.seen).forEach(k => { p.seen[k] = union(p.seen[k], other.seen[k]); }); }
      ['rankXp', 'heatMax', 'bestStep', 'endlessBest', 'endlessLoops', 'squadW', 'shards'].forEach(k => { if (other[k] != null) p[k] = Math.max(p[k] || 0, other[k] || 0); });
      if (other.stats) { p.stats = p.stats || {}; ['runs', 'wins', 'berryTotal'].forEach(k => { p.stats[k] = Math.max(p.stats[k] || 0, other.stats[k] || 0); }); }
      return p;
    },
    // ---------- Ausrüstung: Truhe und Schmiede ----------
    storeItems(profile, run) {
      profile.chest = profile.chest || [];
      (run.items || []).forEach(it => {
        const have = profile.chest.find(x => x.uid === it.uid);
        if (have) { have.lvl = it.lvl || have.lvl; return; }
        profile.chest.push({ uid: it.uid, id: it.id, r: it.r, lvl: it.lvl || 0 });
      });
      // Volle Truhe: die schwächsten fliegen raus
      const max = GL.config.items.chestMax;
      if (profile.chest.length > max) {
        profile.chest.sort((a, b) => (b.r * 10 + (b.lvl || 0)) - (a.r * 10 + (a.lvl || 0)));
        profile.chest.length = max;
      }
      profile.itemLoadout = (profile.itemLoadout || []).filter(uid => profile.chest.some(x => x.uid === uid));
    },
    itemSlots(profile) { return GL.config.items.takeBase + Math.min(4, Math.floor(GL.meta.rankIndex(profile) / 5)); },
    toggleItem(profile, uid) {
      profile.itemLoadout = profile.itemLoadout || [];
      const i = profile.itemLoadout.indexOf(uid);
      if (i >= 0) { profile.itemLoadout.splice(i, 1); return true; }
      if (profile.itemLoadout.length >= GL.meta.itemSlots(profile) || !profile.chest.some(x => x.uid === uid)) return false;
      profile.itemLoadout.push(uid);
      return true;
    },
    forgeCost(it) { return it.lvl >= GL.config.items.maxLevel ? null : GL.config.items.forgeBase * (it.lvl + 1) * (it.r + 1); },
    forge(profile, uid) {
      const it = (profile.chest || []).find(x => x.uid === uid);
      const cost = it ? GL.meta.forgeCost(it) : null;
      if (cost == null || profile.berry < cost) return false;
      profile.berry -= cost;
      it.lvl++;
      return true;
    },
    scrap(profile, uid) {
      const i = (profile.chest || []).findIndex(x => x.uid === uid);
      if (i < 0) return 0;
      const it = profile.chest[i];
      const val = 8 * (it.r + 1) + 10 * (it.lvl || 0);
      profile.chest.splice(i, 1);
      GL.meta.gone(profile, uid);
      profile.itemLoadout = (profile.itemLoadout || []).filter(x => x !== uid);
      profile.berry += val;
      return val;
    },
    // Verschmelzen: 3 Teile gleicher Seltenheit (nicht ausgerüstet, niedrigste Stufe zuerst) -> 1 zufälliges Teil der nächsten Seltenheit
    fuseCost(r) { return 40 * (r + 1); },
    fusable(profile, r) {
      const on = profile.itemLoadout || [];
      return (profile.chest || []).filter(x => x.r === r && !on.includes(x.uid)).sort((a, b) => (a.lvl || 0) - (b.lvl || 0));
    },
    fuse(profile, r) {
      const max = GL.config.rarities.length - 1;
      const pool = GL.meta.fusable(profile, r);
      const cost = GL.meta.fuseCost(r);
      if (r >= max || pool.length < 3 || profile.berry < cost) return null;
      const used = pool.slice(0, 3).map(x => x.uid);
      profile.chest = profile.chest.filter(x => !used.includes(x.uid));
      used.forEach(u => GL.meta.gone(profile, u));
      profile.berry -= cost;
      const defs = GL.data.items;
      const def = defs[Math.floor(Math.random() * defs.length)];
      const it = { uid: 'f' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), id: def.id, r: r + 1, lvl: 0 };
      profile.chest.push(it);
      return it;
    },
    takeItems(profile) {
      return (profile.itemLoadout || []).map(uid => (profile.chest || []).find(x => x.uid === uid)).filter(Boolean)
        .slice(0, GL.meta.itemSlots(profile)).map(x => ({ uid: x.uid, id: x.id, r: x.r, lvl: x.lvl || 0 }));
    },

    // ---------- Kosmetik ----------
    // Werte, die die Freischaltungen prüfen
    progressValues(profile) {
      const c = profile.counts || {};
      const sum = list => list.reduce((s, id) => s + (c['defeated:' + id] || 0), 0);
      const R = profile.records || {};
      return {
        rank: GL.meta.rankIndex(profile) + 1,
        runs: profile.stats.runs || 0,
        wins: profile.stats.wins || 0,
        kos: R.kos || 0,
        maxHit: R.maxHit || 0,
        bosses: sum(GL.data.bosses.map(b => b.id)),
        hunted: sum((GL.data.hunted || []).map(h => h.id)),
        raids: sum(GL.data.raids.map(r => r.id)),
        artifacts: Object.keys(profile.vault || {}).length,
        reached: [0, 1, 2].filter(i => c['reached:' + i]).length - 1,
        islands: Object.keys(c).filter(k => k.startsWith('isle:')).length,
        heat: profile.heatMax || 0,
        duels: profile.squadW || 0,
        quests: profile.questsDone || 0,
        prestige: GL.meta.prestige(profile),
        invites: (profile.invites || []).length
      };
    },
    cosmeticUnlocked(profile, item, vals) {
      // Entwickler-Konto: alles Optische frei (Bedingung bleibt sichtbar)
      if (GL.devAll) return true;
      const v = vals || GL.meta.progressValues(profile);
      return Object.keys(item.req || {}).every(k => (v[k] || 0) >= item.req[k]);
    },
    // Text der Bedingung, z. B. "Rang 5" oder "50 K.o.s"
    reqText(item) {
      const L = { rank: 'Rang', runs: 'Runs', wins: 'Siege', kos: 'K.o.s', maxHit: 'Schaden mit einem Schlag', bosses: 'Inselbosse besiegt',
        hunted: 'Kopfgeld-Ziele besiegt', raids: 'Raids gewonnen', artifacts: 'Artefakte gefunden', reached: 'Meer erreicht',
        islands: 'verschiedene Inseln besucht', heat: 'Kopfgeld-Stufe', duels: 'Stammcrew-Duelle gewonnen', quests: 'Aufträge erledigt', prestige: 'Prestige-Stufe', invites: 'Freund eingeladen' };
      return Object.keys(item.req || {}).map(k => k === 'heat' ? `Kopfgeld-Stufe ${item.req.heat}` : k === 'rank' ? `Rang ${item.req.rank}` : k === 'reached' ? `${GL.data.islands[item.req.reached].name} erreichen` : `${item.req[k]} ${L[k]}`).join(', ') || 'frei';
    },

    // Artefakt-Plätze: einer zu Beginn, dazu einer ab Rang 5, 9 und 13
    artSlots(profile) {
      return 1 + Math.min(4, Math.floor(GL.meta.rankIndex(profile) / 5));
    },

    // Stufe aus der Anzahl der Funde: 1, 2, 4, 7, 11 Funde für Stufe 1 bis 5
    artLevelFor(n) {
      const need = GL.config.artLevels;
      let lvl = 0;
      need.forEach((x, k) => { if (n >= x) lvl = k + 1; });
      return lvl;
    },

    artLevel(profile, id) {
      return GL.meta.artLevelFor(profile.vault[id] || 0);
    },

    toggleArtifact(profile, id) {
      const i = profile.artLoadout.indexOf(id);
      if (i >= 0) { profile.artLoadout.splice(i, 1); return true; }
      if (!(profile.vault[id] > 0) || profile.artLoadout.length >= GL.meta.artSlots(profile)) return false;
      profile.artLoadout.push(id);
      return true;
    },

    // Für GL.run.create: ausgerüstete Artefakte mit Stufe
    takeArtifacts(profile) {
      return profile.artLoadout.filter(id => profile.vault[id] > 0).slice(0, GL.meta.artSlots(profile))
        .map(id => ({ id, lvl: GL.meta.artLevel(profile, id) }));
    },

    slots(profile) {
      return 1 + GL.run.upgradeTotal(profile.upgrades, 'slots');
    },

    // ---------- Stammcrew: feste Offline-Crew, gegen die andere Spieler antreten können ----------
    // Level wächst mit dem Piratenrang, Werft-Ausbauten zählen mit, Synergien gelten wie im Run.
    squadSize: 4,
    // Endgame: Stammcrew und Crew-Liga erst nach einem gewonnenen Run oder ab Rang 5
    squadUnlocked(profile) { return GL.meta.featureOpen(profile, 'stammcrew'); },

    // ---------- Freischaltungen im Hauptquartier (siehe js/data/features.js) ----------
    level(profile) { return GL.meta.rankIndex(profile) + 1 + GL.meta.prestige(profile) * 100; },
    // Meere, deren Boss man schon einmal besiegt hat (für die Endlos-Fahrt)
    seasCleared(profile) {
      const beaten = (profile.seen && profile.seen.bosses) || [];
      return GL.data.islands.map((isl, i) => ((isl.bosses || []).concat(isl.alt ? isl.alt.bosses || [] : []).some(b => beaten.includes(b)) ? i : -1)).filter(i => i >= 0);
    },
    featureOpen(profile, id) {
      const f = (GL.data.features || []).find(x => x.id === id);
      if (!f) return true;
      if (f.req && !f.req(profile)) return false;
      return GL.meta.level(profile) >= f.lvl || !!(f.or && f.or(profile));
    },
    // Nächste noch gesperrte Freischaltung (für den Hinweis „Ab Level X: …“)
    featureNext(profile) {
      return (GL.data.features || []).filter(f => !GL.meta.featureOpen(profile, f.id) && !(f.req && GL.meta.level(profile) >= f.lvl)).sort((a, b) => a.lvl - b.lvl)[0] || null;
    },
    // Neu freigeschaltet und noch nicht vorgestellt. Bestehende Spieler bekommen beim ersten Mal keine Pop-up-Flut.
    featuresNew(profile) {
      const open = (GL.data.features || []).filter(f => GL.meta.featureOpen(profile, f.id));
      if (!profile.seenFeatures) { profile.seenFeatures = (profile.rankXp || 0) > 0 ? open.map(f => f.id) : []; }
      return open.filter(f => !profile.seenFeatures.includes(f.id));
    },
    // Raid-Jagd: wählbare Ziele (Shanks erst, wenn man ihn einmal besiegt hat)
    huntTargets(profile) {
      return GL.data.raids.map(r => ({ raid: r, open: !r.rare || ((profile.counts || {})['defeated:' + r.id] || 0) > 0 }));
    },
    toggleShowcase(profile, id) {
      if (!(profile.loot || {})[id]) return false;
      profile.showcase = profile.showcase || [];
      const i = profile.showcase.indexOf(id);
      if (i >= 0) profile.showcase.splice(i, 1);
      else { if (profile.showcase.length >= 3) profile.showcase.shift(); profile.showcase.push(id); }
      return true;
    },
    featureSeen(profile, id) {
      profile.seenFeatures = profile.seenFeatures || [];
      if (!profile.seenFeatures.includes(id)) profile.seenFeatures.push(id);
    },
    // Crew-Liga nach Rating (Elo, Start 1000)
    leagues: [
      { id: 'planke', name: 'Planken-Liga', min: 0, col: '#8a7a66' },
      { id: 'bronze', name: 'Bronze-Liga', min: 900, col: '#cf8446' },
      { id: 'silber', name: 'Silber-Liga', min: 1050, col: '#9aa5b2' },
      { id: 'gold', name: 'Gold-Liga', min: 1200, col: '#e0a92a' },
      { id: 'diamant', name: 'Diamant-Liga', min: 1400, col: '#4fb6d8' },
      { id: 'legende', name: 'Legenden-Liga', min: 1600, col: '#8a4fd0' }
    ],
    league(rating) {
      const r = rating == null ? 1000 : rating;
      return GL.meta.leagues.filter(l => r >= l.min).pop();
    },
    // Rating nach einem Duell (nur das eigene ändert sich; K = 32)
    squadRate(profile, oppRating, win) {
      const me = profile.squadRating == null ? 1000 : profile.squadRating;
      const opp = oppRating == null ? 1000 : oppRating;
      const exp = 1 / (1 + Math.pow(10, (opp - me) / 400));
      const delta = Math.round(32 * ((win ? 1 : 0) - exp));
      profile.squadRating = Math.max(0, me + delta);
      profile.squadBest = Math.max(profile.squadBest || 0, profile.squadRating);
      return delta;
    },
    squadPool(profile) {
      const ids = (profile.char && profile.nickname ? ['self'] : []).concat(GL.config.starters, profile.unlocked || []);
      return ids.filter((v, i, a) => a.indexOf(v) === i && (v === 'self' || GL.data.crew.some(c => c.id === v && !c.self)));
    },
    squadIds(profile) {
      const pool = GL.meta.squadPool(profile);
      const s = (profile.squad || []).filter(id => pool.includes(id)).slice(0, GL.meta.squadSize);
      return s.length ? s : pool.slice(0, GL.meta.squadSize);
    },
    squadLevel(profile) {
      return Math.min(15, 1 + Math.floor(GL.meta.rankIndex(profile) * 0.65));
    },
    // Extra-Level einer Figur aus Stammcrew-EP (Duelle): Stufe L braucht insgesamt 30 * L * (L + 1) / 2 EP, bis +10
    squadBonus(xp) {
      let L = 0;
      while (L < 10 && (xp || 0) >= 15 * (L + 1) * (L + 2)) L++;
      return L;
    },
    squadNext(xp) {
      const L = GL.meta.squadBonus(xp);
      if (L >= 10) return null;
      const from = 15 * L * (L + 1), to = 15 * (L + 1) * (L + 2);
      return { have: (xp || 0) - from, need: to - from };
    },
    squadGainXp(profile, ids, win) {
      profile.squadXp = profile.squadXp || {};
      const gain = win ? 12 : 4;
      const ups = [];
      ids.forEach(id => {
        const before = GL.meta.squadBonus(profile.squadXp[id]);
        profile.squadXp[id] = (profile.squadXp[id] || 0) + gain;
        if (GL.meta.squadBonus(profile.squadXp[id]) > before) {
          const d = id === 'self' ? { name: profile.nickname } : GL.data.crew.find(c => c.id === id);
          ups.push(d ? d.name : id);
        }
      });
      return { gain, ups };
    },
    squadRefs(profile) {
      const base = GL.meta.squadLevel(profile);
      const up = profile.upgrades || {};
      const mod = { atk: GL.run.upgradeTotal(up, 'atk'), hp: GL.run.upgradeTotal(up, 'hp'), spd: GL.run.upgradeTotal(up, 'spd') };
      const self = GL.meta.selfDef(profile);
      return GL.meta.squadIds(profile).map(id => {
        const d = id === 'self' ? self : GL.data.crew.find(c => c.id === id);
        if (!d) return null;
        const lvl = base + GL.meta.squadBonus((profile.squadXp || {})[id]);
        const max = d.hp + (lvl - 1) * 3 + mod.hp;
        const r = { id, name: d.name, type: d.type, role: d.role, faction: d.faction || null, lvl,
          hp: max, max, atk: d.atk + Math.floor((lvl - 1) * 0.45) + mod.atk, spd: d.spd + mod.spd };
        // Angelegte Crew-Ausrüstung
        if (GL.cgear) {
          const t = GL.cgear.totals(profile, id);
          r.max += t.hp || 0; r.hp = r.max; r.atk += t.atk || 0; r.spd += t.spd || 0;
          const cap = GL.data.crewGear.caps || {};
          const gb = {}; ['crit', 'dodge', 'armor', 'dmgPct', 'critMult', 'regen', 'ultStart'].forEach(k => { if (t[k]) gb[k] = cap[k] ? Math.min(cap[k], t[k]) : t[k]; });
          if (Object.keys(gb).length) r.gb = gb;
          const wl = GL.cgear.wornList(profile, id);
          if (wl.length) r.gear = wl;
        }
        if (id === 'self') { r.look = self.look; r.rally = self.rally; }
        return r;
      }).filter(Boolean);
    },
    squadPower(refs) {
      return Math.round((refs || []).reduce((s, r) => { const g = r.gb || {};
        return s + r.max * 0.5 + r.atk * 4 + r.spd * 2 + (g.crit || 0) * 150 + (g.dodge || 0) * 150 + (g.armor || 0) * 4 + (g.dmgPct || 0) * 120 + (g.critMult || 0) * 60 + (g.regen || 0) * 6 + (g.ultStart || 0) * 0.4; }, 0));
    },

    // ---------- Lebenszeit-Zähler für Aufträge ----------
    // Zählt Zuwächse aus dem laufenden Run dazu (update() läuft öfter pro Run, daher nur die Differenz)
    trackLife(profile, run) {
      const L = profile.life = profile.life || {};
      const cur = profile.current;
      const seen = cur.life = cur.life || {};
      const S = run.stats || {};
      const kt = S.koT || {};
      const hunted = (run.defeated || []).filter(id => (GL.data.hunted || []).some(h => h.id === id)).length;
      const bosses = (run.defeated || []).filter(id => GL.data.bosses.some(b => b.id === id)).length;
      const now = { dmg: S.dmg || 0, kos: S.kos || 0, crits: S.crits || 0, ults: S.ults || 0, won: S.won || 0, hunted, bosses,
        steps: run.step || 0, ko_kraft: kt.kraft || 0, ko_klinge: kt.klinge || 0, ko_technik: kt.technik || 0 };
      Object.keys(now).forEach(k => {
        const d = now[k] - (seen[k] || 0);
        if (d > 0) { L[k] = (L[k] || 0) + d; seen[k] = now[k]; }
      });
      L.maxHit = Math.max(L.maxHit || 0, S.maxHit || 0);
    },
    lifeValue(profile, kind) {
      if (kind === 'duels') return profile.squadW || 0;
      return (profile.life || {})[kind] || 0;
    },

    // ---------- Aufträge ----------
    questTier(profile) { return Math.min(2, Math.floor(GL.meta.rankIndex(profile) / 6)); },
    newQuest(profile, avoid) {
      const Q = GL.data.quests.filter(q => !(avoid || []).includes(q.kind));
      const t = Q[Math.floor(Math.random() * Q.length)];
      const tier = GL.meta.questTier(profile);
      const R = GL.data.questReward[tier];
      return { id: 'q' + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36), kind: t.kind, n: t.n[tier], tier,
        base: t.max ? 0 : GL.meta.lifeValue(profile, t.kind), berry: R.berry, xp: R.xp };
    },
    questsEnsure(profile) {
      const day = new Date().toISOString().slice(0, 10);
      profile.quests = profile.quests || [];
      if (profile.questDay !== day) {
        // Neuer Tag: unfertige Aufträge werden ersetzt, fertige bleiben zum Abholen
        profile.quests = profile.quests.filter(q => GL.meta.questProgress(profile, q).done);
        profile.questDay = day;
        profile.questReroll = 1;
      }
      while (profile.quests.length < 3) profile.quests.push(GL.meta.newQuest(profile, profile.quests.map(q => q.kind)));
      return profile.quests;
    },
    questDef(q) { return GL.data.quests.find(t => t.kind === q.kind) || { icon: '?', text: '?' }; },
    questProgress(profile, q) {
      const def = GL.meta.questDef(q);
      const have = def.max ? GL.meta.lifeValue(profile, q.kind) : GL.meta.lifeValue(profile, q.kind) - (q.base || 0);
      return { have: Math.min(q.n, Math.max(0, have)), need: q.n, done: have >= q.n };
    },
    questClaim(profile, id) {
      const i = (profile.quests || []).findIndex(q => q.id === id);
      if (i < 0) return null;
      const q = profile.quests[i];
      if (!GL.meta.questProgress(profile, q).done) return null;
      profile.berry += q.berry;
      const ups = GL.meta.addRankXp(profile, q.xp);
      profile.questsDone = (profile.questsDone || 0) + 1;
      profile.quests[i] = GL.meta.newQuest(profile, profile.quests.map(x => x.kind));
      return { q, ups };
    },
    questReroll(profile, id) {
      if (!(profile.questReroll > 0)) return false;
      const i = (profile.quests || []).findIndex(q => q.id === id);
      if (i < 0) return false;
      profile.questReroll--;
      profile.quests[i] = GL.meta.newQuest(profile, profile.quests.map(x => x.kind));
      return true;
    },

    // Kapitel-Fortschritt eines Meeres: die 4 Bösewichte der kleinen Inseln plus beide Insel-Bosse.
    // Da pro Run nur 2 von 4 kleinen Inseln und einer von 2 Bossen drankommen, braucht es mehrere Runs,
    // bis alle sechs einmal besiegt wurden - daher ein eigener Fortschrittsbalken über Runs hinweg.
    chapterTargets(seaIdx) {
      const isl = typeof seaIdx === 'object' ? seaIdx : GL.data.islands[seaIdx];
      if (!isl) return [];
      return [...new Set(isl.small.map(s => s.villain).concat(isl.bosses))];
    },
    chapterProgress(profile, seaIdx) {
      // seaIdx: Index eines Meeres oder direkt das Meer (z. B. die zweite Route)
      const targets = GL.meta.chapterTargets(seaIdx);
      const counts = profile.counts || {};
      const done = targets.filter(id => (counts['defeated:' + id] || 0) > 0).length;
      return { done, total: targets.length, pct: targets.length ? Math.round(100 * done / targets.length) : 0, complete: targets.length > 0 && done >= targets.length };
    },

    buyGear(profile, id) {
      const g = GL.data.gear.find(x => x.id === id);
      if (!g || profile.berry < g.cost) return false;
      profile.berry -= g.cost;
      profile.gear[id] = (profile.gear[id] || 0) + 1;
      return true;
    },

    setHeat(profile, level) {
      profile.heat = Math.max(0, Math.min(level, profile.heatMax));
      return true;
    },

    toggleLoadout(profile, id) {
      const i = profile.loadout.indexOf(id);
      if (i >= 0) { profile.loadout.splice(i, 1); return true; }
      if (!(profile.gear[id] > 0) || profile.loadout.length >= GL.meta.slots(profile)) return false;
      profile.loadout.push(id);
      return true;
    },

    // Beim Ablegen: Ausrüstung aus dem Lager nehmen. Gibt die Liste für GL.run.create zurück.
    takeLoadout(profile) {
      const used = profile.loadout.filter(id => profile.gear[id] > 0).slice(0, GL.meta.slots(profile));
      used.forEach(id => { profile.gear[id]--; });
      profile.loadout = profile.loadout.filter(id => profile.gear[id] > 0);
      return used;
    },

    // Überträgt Entdeckungen aus dem laufenden Run ins Profil und prüft
    // Freischaltungen. Gibt neu Freigeschaltetes zurück: [{ kind, id }]
    update(profile, run) {
      const news = [];
      const seen = profile.seen;
      run.crew.forEach(u => add(seen.crew, u.id));
      (run.defeated || []).forEach(id => add(seen.bosses, id));
      seen.islands = seen.islands || [];
      (run.course || []).forEach(id => id && add(seen.islands, id));
      (run.eaten || []).forEach(id => add(seen.fruits, id));
      (run.relics || []).forEach(x => add(seen.relics, x.id || x));
      // Endlos-Fahrt: zählt nicht für Freischaltungen (Kapitäne, erwachte Früchte gibt es nur auf den normalen Routen)
      const E = run.endlessSea != null;
      if (!E) (run.epics || []).forEach(id => { if (add(profile.epics, id)) news.push({ kind: 'epic', id }); });

      // Jedes Ereignis zählt nur einmal pro Run
      if (profile.current.seed !== run.seed) profile.current = { seed: run.seed, counted: [] };
      const counts = profile.counts;
      const count = key => {
        if (profile.current.counted.includes(key)) return false;
        profile.current.counted.push(key);
        counts[key] = (counts[key] || 0) + 1;
        return true;
      };
      // Artefakte wandern sofort in die Schatzkammer (auch wenn der Run danach verloren geht)
      (run.trophies || []).forEach((id, k) => {
        if (!count('trophy:' + k)) return;
        const isNew = !profile.vault[id];
        profile.vault[id] = (profile.vault[id] || 0) + 1;
        news.push({ kind: 'artifact', id, isNew, lvl: GL.meta.artLevelFor(profile.vault[id]) });
        // Erstes Artefakt: automatisch ausrüsten, wenn ein Platz frei ist
        if (isNew && profile.artLoadout.length < GL.meta.artSlots(profile)) profile.artLoadout.push(id);
      });
      // Figuren-Statistik: Schaden, K.o.s und Einsätze je Figur (für die Statistik-Seite)
      if (run.battle && run.battle.events && run.stats && run.stats.fights) {
        const bk = 'bt:' + run.stats.fights;
        if (!profile.current.counted.includes(bk)) {
          profile.current.counted.push(bk);
          const CS = profile.charStats = profile.charStats || {};
          const at = i => { const u = run.crew[i]; return u ? (CS[u.id] = CS[u.id] || { dmg: 0, kos: 0, fights: 0, best: 0, runs: 0, wins: 0 }) : null; };
          run.crew.forEach((u, i) => { const x = at(i); if (x) x.fights++; });
          run.battle.events.forEach(ev => {
            if (ev.k === 'hit' && ev.side === 'crew' && ev.dmg > 0) { const x = at(ev.from); if (x) { x.dmg += ev.dmg; x.best = Math.max(x.best, ev.dmg); if (ev.hp <= 0) x.kos++; } }
          });
        }
      }
      if (GL.run.isFinished(run) && !profile.current.counted.includes('cs-end')) {
        profile.current.counted.push('cs-end');
        const CS = profile.charStats = profile.charStats || {};
        run.crew.forEach(u => { const x = CS[u.id] = CS[u.id] || { dmg: 0, kos: 0, fights: 0, best: 0, runs: 0, wins: 0 }; x.runs++; if (run.phase === 'win') x.wins++; });
      }
      if (!E) (run.defeated || []).forEach(id => count('defeated:' + id));
      GL.meta.trackLife(profile, run);
      if (!E) for (let i = 0; i <= GL.run.islandIndex(run); i++) count('reached:' + i);
      (run.course || []).forEach(id => { if (id) count('isle:' + id); });
      const won = run.phase === 'win' && !E;
      if (won) count('win');
      // Für neue Freischalt-Ziele: mit wem gewonnen, welche Bande, Tageskarten
      if (won) {
        run.crew.forEach(u => count('winWith:' + u.id));
        if (run.captain) count('winWith:' + run.captain);
        const fc = {};
        run.crew.forEach(u => { if (u.faction) fc[u.faction] = (fc[u.faction] || 0) + 1; });
        Object.keys(fc).forEach(f => { for (let k = 1; k <= fc[f]; k++) count('winFaction:' + f + ':' + k); });
      }
      if (run.daily && GL.run.isFinished(run)) count('daily');

      GL.data.unlocks.forEach(u => {
        if (profile.unlocked.includes(u.unlock)) return;
        const w = u.when;
        const times = w.times || 1;
        let ok = false;
        if (w.defeated) ok = (counts['defeated:' + w.defeated] || 0) >= times;
        if (w.reached !== undefined) ok = (counts['reached:' + w.reached] || 0) >= times;
        if (w.win) ok = (counts.win || 0) >= times;
        if (w.winWithout) ok = won && run.captain !== w.winWithout;
        if (w.epics) ok = (profile.epics || []).length >= w.epics;
        if (w.epic) ok = (profile.epics || []).includes(w.epic);
        if (w.raids) ok = GL.data.raids.reduce((s2, r) => s2 + (counts['defeated:' + r.id] || 0), 0) >= w.raids;
        if (w.heat) ok = (profile.heatMax || 0) >= w.heat;
        if (w.runs) ok = (profile.stats.runs || 0) >= w.runs;
        if (w.winWith) ok = (counts['winWith:' + w.winWith] || 0) >= times;
        if (w.winFaction) ok = (counts['winFaction:' + w.winFaction + ':' + (w.n || 1)] || 0) >= times;
        if (w.isle) ok = (counts['isle:' + w.isle] || 0) >= times;
        if (w.kos) ok = GL.meta.lifeKos(profile) >= w.kos;
        if (w.daily) ok = (counts.daily || 0) >= w.daily;
        if (w.endless) ok = Math.max(0, ...Object.values(profile.endlessSeaBest || {})) >= w.endless;
        if (ok) { profile.unlocked.push(u.unlock); news.push({ kind: 'crew', id: u.unlock }); }
      });
      return news;
    },

    // Die nächsten Freischaltungen, am weitesten fortgeschrittene zuerst
    nextUnlocks(profile, n) {
      return GL.data.unlocks.filter(u => !profile.unlocked.includes(u.unlock) && GL.data.crew.some(c => c.id === u.unlock))
        .map(u => { const pr = GL.meta.progress(profile, u); return { u, pr, f: pr.have / Math.max(1, pr.need) }; })
        .sort((a, b) => b.f - a.f || a.pr.need - b.pr.need).slice(0, n || 3);
    },
    lifeKos(profile) { return Math.max((profile.life && profile.life.kos) || 0, (profile.records && profile.records.kos) || 0); },
    // ---------- Tageskiste: einmal pro Tag, Serie für Tage am Stück ----------
    dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    dboxReady(profile) { return !profile.dbox || profile.dbox.d !== GL.meta.dayKey(); },
    dboxClaim(profile) {
      if (!GL.meta.dboxReady(profile)) return null;
      const today = GL.meta.dayKey();
      // Gemütlich: eine Pause bricht nichts ab, jeder Besuchstag zählt weiter
      const streak = profile.dbox ? (profile.dbox.streak || 1) + 1 : 1;
      profile.dbox = { d: today, streak };
      const day = ((streak - 1) % 7) + 1;   // Tag 1 bis 7, dann von vorn
      const r = { streak, day, berry: 30 + 10 * day, shards: day >= 3 ? (day === 7 ? 4 : 1) : 0, gear: null };
      profile.berry = (profile.berry || 0) + r.berry;
      profile.shards = (profile.shards || 0) + r.shards;
      if (day === 7 && GL.cgear) { r.gear = GL.cgear.roll({ r: 2, name: 'Wochentreue', seaName: 'Tageskiste', sea: 2 }); GL.cgear.bag(profile).push(r.gear); }
      return r;
    },
    // ---------- Wochen-Herausforderung: drei Aufgaben pro Kalenderwoche ----------
    WEEK_TASKS: [
      { id: 'runs', text: 'Spiele 5 Runs', need: 5 }, { id: 'wins', text: 'Gewinne einen Run', need: 1 },
      { id: 'bosses', text: 'Besiege 3 Inselbosse', need: 3 }, { id: 'hunted', text: 'Besiege 5 Kopfgeld-Ziele', need: 5 },
      { id: 'kos', text: 'Besiege 80 Gegner', need: 80 }, { id: 'daily', text: 'Spiele 2 Tageskarten', need: 2 },
      { id: 'duels', text: 'Gewinne 2 Crew-Duelle', need: 2, squad: true }, { id: 'islands', text: 'Entdecke eine neue Insel', need: 1 }
    ],
    weekId(d) {
      d = new Date(d || Date.now()); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
      const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
      return t.getUTCFullYear() + '-W' + String(Math.ceil(((t - y) / 864e5 + 1) / 7)).padStart(2, '0');
    },
    weekVals(profile) {
      const v = GL.meta.progressValues(profile);
      return { runs: v.runs, wins: v.wins, bosses: v.bosses, hunted: v.hunted, kos: GL.meta.lifeKos(profile), daily: (profile.counts && profile.counts.daily) || 0, duels: v.duels, islands: v.islands };
    },
    weekly(profile) {
      const id = GL.meta.weekId();
      if (!profile.week || profile.week.id !== id) {
        let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        const pool = GL.meta.WEEK_TASKS.filter(t => !t.squad || GL.meta.squadUnlocked(profile));
        const pick = [];
        while (pick.length < 3 && pool.length) { pick.push(pool.splice(h % pool.length, 1)[0].id); h = (h * 1103515245 + 12345) >>> 0; }
        profile.week = { id, tasks: pick, base: GL.meta.weekVals(profile), claimed: false };
      }
      const now = GL.meta.weekVals(profile);
      const tasks = profile.week.tasks.map(tid => { const t = GL.meta.WEEK_TASKS.find(x => x.id === tid); const have = Math.max(0, (now[tid] || 0) - (profile.week.base[tid] || 0)); return Object.assign({}, t, { have: Math.min(have, t.need), done: have >= t.need }); });
      return { id: profile.week.id, tasks, done: tasks.every(t => t.done), claimed: profile.week.claimed };
    },
    weeklyClaim(profile) {
      const w = GL.meta.weekly(profile);
      if (!w.done || w.claimed) return null;
      profile.week.claimed = true;
      profile.berry = (profile.berry || 0) + 150;
      profile.shards = (profile.shards || 0) + 3;
      const gear = GL.cgear ? GL.cgear.roll({ r: 2, name: 'Wochenheld', seaName: 'Wochen-Herausforderung', sea: 2 }) : null;
      if (gear) GL.cgear.bag(profile).push(gear);
      return { berry: 150, shards: 3, gear };
    },

    // Fortschritt zu einer Freischaltung, z. B. { have: 1, need: 3 }
    progress(profile, u) {
      const w = u.when;
      const need = w.times || 1;
      let have = 0;
      if (w.defeated) have = profile.counts['defeated:' + w.defeated] || 0;
      if (w.reached !== undefined) have = profile.counts['reached:' + w.reached] || 0;
      if (w.win) have = profile.counts.win || 0;
      if (w.winWithout) have = profile.unlocked.includes(u.unlock) ? 1 : 0;
      if (w.epics) return { have: Math.min((profile.epics || []).length, w.epics), need: w.epics };
      if (w.epic) have = (profile.epics || []).includes(w.epic) ? 1 : 0;
      if (w.raids) return { have: Math.min(GL.data.raids.reduce((s2, r) => s2 + (profile.counts['defeated:' + r.id] || 0), 0), w.raids), need: w.raids };
      if (w.heat) return { have: Math.min(profile.heatMax || 0, w.heat), need: w.heat };
      if (w.runs) return { have: Math.min(profile.stats.runs || 0, w.runs), need: w.runs };
      if (w.winWith) have = profile.counts['winWith:' + w.winWith] || 0;
      if (w.winFaction) have = profile.counts['winFaction:' + w.winFaction + ':' + (w.n || 1)] || 0;
      if (w.isle) have = profile.counts['isle:' + w.isle] || 0;
      if (w.kos) return { have: Math.min(GL.meta.lifeKos(profile), w.kos), need: w.kos };
      if (w.daily) return { have: Math.min(profile.counts.daily || 0, w.daily), need: w.daily };
      if (w.endless) return { have: Math.min(Math.max(0, ...Object.values(profile.endlessSeaBest || {})), w.endless), need: w.endless };
      return { have: Math.min(have, need), need };
    },

    // Einmal pro beendetem Run aufrufen
    // Gibt die neu freigeschaltete Kopfgeld-Stufe zurück (oder 0)
    finishRun(profile, run) {
      profile.stats.runs++;
      if (run.phase === 'win') profile.stats.wins++;
      profile.lastHeatUnlock = 0;
      if (run.phase === 'win' && (run.heat || 0) >= profile.heatMax && profile.heatMax < GL.data.heat.length) {
        profile.heatMax++;
        profile.heat = profile.heatMax;
        profile.lastHeatUnlock = profile.heatMax;
      }
      // Ausrüstung aus dem Run kommt in die Truhe (mitgenommene kehren zurück)
      GL.meta.storeItems(profile, run);
      // Raid-Beute in die Vitrine
      profile.loot = profile.loot || {};
      (run.loot || []).forEach(id => { profile.loot[id] = (profile.loot[id] || 0) + 1; });
      profile.lastLoot = (run.loot || []).slice();
      // Crew-Ausrüstung für die Stammcrew (ab Freischaltung)
      profile.lastGear = GL.cgear && GL.meta.featureOpen(profile, 'stammcrew') ? GL.cgear.drops(profile, run).map(x => x.uid) : [];
      // Lebenslange Rekorde für Kosmetik und Rangliste
      const S = run.stats || {};
      const R = profile.records || (profile.records = { kos: 0, maxHit: 0, dmg: 0 });
      R.kos += S.kos || 0;
      R.dmg += S.dmg || 0;
      R.maxHit = Math.max(R.maxHit, S.maxHit || 0);
      // Endlos-Fahrt: Belohnung nach tatsächlich gesegelten Etappen (nicht nach dem Startmeer)
      const E = run.endlessSea != null;
      const eff = E ? Object.assign({}, run, { step: run.step - run.endlessSea * GL.config.stepsPerIsland + (run.loopSteps || 0), bounties: (run.loop || 0) + run.bounties }) : run;
      if (E) {
        const rec = profile.endlessRec || { sea: -1, loops: 0 };
        if (run.endlessSea > rec.sea || (run.endlessSea === rec.sea && (run.loop || 0) > rec.loops)) profile.endlessRec = { sea: run.endlessSea, loops: run.loop || 0 };
        profile.endlessSeaBest = profile.endlessSeaBest || {};
        profile.endlessSeaBest[run.endlessSea] = Math.max(profile.endlessSeaBest[run.endlessSea] || 0, run.loop || 0);
        // Meersplitter: pro geschaffter Runde so viele wie das Meer tief ist (nur einmal pro Runde gutgeschrieben)
        const paid = profile.shardPaid && profile.shardPaid.seed === run.seed ? profile.shardPaid.n : 0;
        const got = Math.max(0, (run.loop || 0) - paid) * (run.endlessSea + 1);
        profile.shards = (profile.shards || 0) + got; profile.lastShards = got;
        profile.shardPaid = { seed: run.seed, n: run.loop || 0 };
      }
      // Kopfgeld-Serie: längste Serie im Run gibt Extra-Berry
      profile.lastStreak = run.bestStreak || 0;
      const berry = GL.meta.berryFor(profile, eff) + Math.max(0, (run.bestStreak || 0) - 2) * 3;
      profile.berry += berry;
      profile.stats.berryTotal += berry;
      const xp = GL.meta.rankXpFor(eff);
      const reachNow = E ? 0 : run.phase === 'win' ? GL.run.totalSteps() : (run.step || 0);
      // Endlos-Modus: weiteste Strecke über alle Runden
      if (run.loop) { profile.endlessBest = Math.max(profile.endlessBest || 0, (run.loopSteps || 0) + reachNow); profile.endlessLoops = Math.max(profile.endlessLoops || 0, run.loop + (run.phase === 'win' ? 1 : 0)); }
      else if (run.phase === 'win') profile.endlessLoops = Math.max(profile.endlessLoops || 0, 1);
      if (!E && !run.loop && reachNow >= (profile.bestStep || 0)) {
        // Weiteste Fahrt mit Meer und Insel-Kapitel merken (für die Rangliste)
        const st = Math.max(0, Math.min(reachNow, GL.run.totalSteps() - 1));
        const si = Math.min(Math.floor(st / GL.config.stepsPerIsland), GL.data.islands.length - 1);
        const isl = GL.run.chapterIsland(run, st);
        profile.bestPlace = { sea: GL.data.seaOf(run, si).name, isl: isl ? isl.name : null, won: run.phase === 'win' };
      }
      profile.bestStep = Math.max(profile.bestStep || 0, reachNow);
      profile.lastRank = { xp, before: profile.rankXp, ups: GL.meta.addRankXp(profile, xp) };
      return berry;
    }
  };
})();
