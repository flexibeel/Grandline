// Gemütlichkeit: kleiner Skilltree für die ganze Crew (Idee von Felix, 18.10.)
//
// Konzept
// - Skillpunkte kommen nebenbei und bleiben für immer: 1 pro Piratenrang, 1 alle 6 Fahrten,
//   1 alle 3 Landgänge und 1 alle 5 Vertraut-Stufen deiner Stammcrew. Keine Pflicht, kein Grind.
// - Vier kleine Pfade statt Diablo-Baum:
//     ⚓ Schiff      Ausbau, den man sieht: Hängematten, Herd, Krähennest, Bordkanone, Galionsfigur
//     ♥ Zusammenhalt Vertrautheit, Heilung nach Siegen, etwas mehr Erfahrung
//     🗺 Abenteuer  Berry, Glück, Startgold, Rang-EP, eine Auswahl mehr
//     ✨ Talente     pro Figur ein Kniff (Sanjis Herd, Zorros Gewichte, Namis Karte …),
//                    freigeschaltet ab Vertraut 2 mit dieser Figur
// - In den ersten drei Pfaden braucht jeder Knoten den davor. Talente sind frei wählbar.
// - Umskillen ist jederzeit kostenlos. Effekte bewusst klein, die Werft bleibt der große Ausbau.
// - Die Boni landen beim Ablegen in run.start.skills (Replay bleibt exakt gleich).
//
// Effekt-Schlüssel: hp, atk, spd (ganze Crew), restHeal, winHeal (Anteil), luck, xp, choices,
//   gold (Start-Gold), points (Startpunkte Kapitän), cannon (Schaden zu Kampfbeginn),
//   berry, rankXp, bond (Anteil)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.skilltree = {
  paths: [
    { id: 'schiff', icon: '⚓', name: 'Schiff', text: 'Dein Schiff wird gemütlicher. Und lauter.', nodes: [
      { id: 'haengematten', art: 'bed',    name: 'Hängematten',     eff: { hp: 2 },          text: 'Gut geschlafen: die ganze Crew startet mit +2 Leben.' },
      { id: 'herd',         art: 'pot',    name: 'Kombüsen-Herd',   eff: { restHeal: 0.1 },  text: 'Rast an Land heilt 10 % mehr.' },
      { id: 'kraehennest',  art: 'scope',  name: 'Krähennest',      eff: { luck: 0.15 },     text: 'Mehr Glück bei seltener Beute.' },
      { id: 'kanone',       art: 'cannon', name: 'Bordkanone',      eff: { cannon: 2 },      text: 'BUMM! Zu Kampfbeginn erleiden alle Gegner 2 Schaden.' },
      { id: 'galion',       art: 'figure', name: 'Galionsfigur',    eff: { luck: 0.1, gold: 1 }, text: 'Bringt Glück: etwas mehr Beute-Glück und 1 Gold mehr zum Start.' }
    ] },
    { id: 'herz', icon: '♥', name: 'Zusammenhalt', text: 'Wer zusammen isst, kämpft zusammen.', nodes: [
      { id: 'lagerfeuer',   art: 'fire',   name: 'Lagerfeuer-Abende', eff: { bond: 0.15 },   text: 'Deine Crew wird 15 % schneller vertraut.' },
      { id: 'pflaster',     art: 'pot',    name: 'Pflasterdose',      eff: { winHeal: 0.03 }, text: 'Nach jedem Sieg heilt die Crew ein bisschen mehr.' },
      { id: 'geschichten',  art: 'book',   name: 'Seemannsgarn',      eff: { xp: 0.1 },      text: 'Geschichten am Abend: 10 % mehr Erfahrung im Run.' },
      { id: 'kapitaensrede',art: 'flag',   name: 'Kapitänsrede',      eff: { points: 1 },    text: 'Dein Kapitän bekommt 1 Statuspunkt mehr zum Start.' },
      { id: 'zusammen',     art: 'heart',  name: 'Einer für alle', cost: 2, eff: { winHeal: 0.03, xp: 0.05 }, text: 'Nach Siegen heilt die Crew mehr und lernt 5 % schneller.' }
    ] },
    { id: 'beute', icon: '🗺', name: 'Abenteuer', text: 'Mehr Schatz, mehr Weg, mehr Geschichten.', nodes: [
      { id: 'sparschwein',  art: 'coin',   name: 'Sparschwein',     eff: { berry: 0.05 },    text: '5 % mehr Berry nach jedem Run.' },
      { id: 'startgold',    art: 'chest',  name: 'Notgroschen',     eff: { gold: 2 },        text: '2 Gold mehr zum Start für die Taverne.' },
      { id: 'logbuch',      art: 'scroll', name: 'Logbuch',         eff: { rankXp: 0.08 },   text: '8 % mehr Rang-EP für jeden Run.' },
      { id: 'schatznase',   art: 'map',    name: 'Schatznase',      eff: { luck: 0.1 },      text: 'Noch ein bisschen mehr Glück bei Beute.' },
      { id: 'fernrohr',     art: 'scope',  name: 'Goldenes Fernrohr', cost: 2, eff: { choices: 1 }, text: 'Eine Auswahl mehr bei Rekrutierung, Früchten und Schätzen.' }
    ] }
  ],
  // Talente: ab Vertraut 2 mit der Figur (Stammcrew), je 1 Punkt
  talents: [
    { id: 't-ruffy',   who: 'ruffy',   bond: 2, name: 'Fleischvorrat',      eff: { winHeal: 0.03 },  text: 'Ruffy teilt (fast) alles: nach Siegen heilt die Crew etwas mehr.' },
    { id: 't-zorro',   who: 'zorro',   bond: 2, name: 'Trainingsgewichte',  eff: { xp: 0.08 },       text: '8 % mehr Erfahrung im Run.' },
    { id: 't-nami',    who: 'nami',    bond: 2, name: 'Namis Seekarte',     eff: { berry: 0.05 },    text: '5 % mehr Berry. Nami nimmt nur 50 % Provision.' },
    { id: 't-sanji',   who: 'sanji',   bond: 2, name: 'Sanjis Herd',        eff: { restHeal: 0.1 },  text: 'Rast an Land heilt 10 % mehr.' },
    { id: 't-lysop',   who: 'lysop',   bond: 2, name: 'Lysops Glücksschleuder', eff: { luck: 0.1 },  text: 'Mehr Glück bei Beute. Lysop hat 8000 Glücksbringer.' },
    { id: 't-chopper', who: 'chopper', bond: 2, name: 'Choppers Medizin',   eff: { winHeal: 0.03 },  text: 'Nach Siegen heilt die Crew etwas mehr.' },
    { id: 't-robin',   who: 'robin',   bond: 2, name: 'Robins Bücher',      eff: { rankXp: 0.06 },   text: '6 % mehr Rang-EP.' },
    { id: 't-franky',  who: 'franky',  bond: 2, name: 'Cola-Motor',         eff: { gold: 2 },        text: 'SUPER! 2 Gold mehr zum Start.' },
    { id: 't-brook',   who: 'brook',   bond: 2, name: 'Brooks Ständchen',   eff: { bond: 0.1 },      text: 'Musik verbindet: 10 % schneller vertraut.' }
  ]
};

(function () {
  const T = () => GL.data.skilltree;
  const all = () => T().paths.reduce((a, p) => a.concat(p.nodes.map((n, i) => Object.assign({ path: p.id, idx: i }, n))), []).concat(T().talents.map(t => Object.assign({ path: 'talent' }, t)));
  const find = id => all().find(n => n.id === id) || null;
  const cost = n => n.cost || 1;
  const bondOf = (p, who) => (GL.meta && GL.meta.squadBonus ? GL.meta.squadBonus((p.squadXp || {})[who]) : 0);
  const landgang = p => Object.values(p.dungeons || {}).reduce((s, d) => s + ((d && d.clears) || 0), 0);

  GL.skills = {
    find, all,
    // Woher die Punkte kommen (für die Anzeige)
    sources(p) {
      const rank = GL.meta ? GL.meta.rankIndex(p) : 0;
      const runs = Math.floor(((p.stats && p.stats.runs) || 0) / 6);
      const land = Math.floor(landgang(p) / 3);
      const bond = Math.floor(Object.values(p.squadXp || {}).reduce((s, x) => s + GL.meta.squadBonus(x), 0) / 5);
      return { rank, runs, land, bond };
    },
    earned(p) { const s = GL.skills.sources(p); return s.rank + s.runs + s.land + s.bond; },
    learned(p) { return (Array.isArray(p.skills) ? p.skills : []).filter(id => find(id)); },
    spent(p) { return GL.skills.learned(p).reduce((s, id) => s + cost(find(id)), 0) + GL.skills.polishSpent(p); },
    // Feinschliff (20t): wenn alle Pfade voll sind, fließen weitere Punkte in kleine, endlose Stufen (mit Deckel)
    POLISH: [
      { k: 'berry', icon: '🪙', name: 'Feinschliff: Berry', max: 15, per: 0.01, text: '+1 % Berry je Punkt' },
      { k: 'goldPct', icon: '💰', name: 'Feinschliff: Gold', max: 15, per: 0.01, text: '+1 % Gold pro Sieg je Punkt' },
      { k: 'hp', icon: '♥', name: 'Feinschliff: Leben', max: 8, per: 1, text: '+1 Leben für jede Figur je Punkt' }
    ],
    polish(p) { const o = (p.polish && typeof p.polish === 'object') ? p.polish : {}; const out = {}; GL.skills.POLISH.forEach(x => { out[x.k] = Math.max(0, Math.min(x.max, Math.floor(+o[x.k] || 0))); }); return out; },
    polishSpent(p) { const o = GL.skills.polish(p); return Object.values(o).reduce((a, b) => a + b, 0); },
    treeDone(p) { return T().paths.every(pa => pa.nodes.every(n => GL.skills.has(p, n.id))); },
    polishUp(p, k) {
      const x = GL.skills.POLISH.find(y => y.k === k), o = GL.skills.polish(p);
      if (!x || !GL.skills.treeDone(p) || GL.skills.free(p) < 1 || o[k] >= x.max) return false;
      o[k]++; p.polish = o; return true;
    },
    free(p) { return Math.max(0, GL.skills.earned(p) - GL.skills.spent(p)); },
    has(p, id) { return GL.skills.learned(p).includes(id); },
    // Warum ein Knoten noch nicht geht (null = lernbar)
    blocker(p, id) {
      const n = find(id);
      if (!n) return 'Unbekannt';
      if (GL.skills.has(p, id)) return 'Schon gelernt';
      if (n.path === 'talent') {
        if (bondOf(p, n.who) < n.bond) { const d = GL.data.crew.find(c => c.id === n.who); return `Vertraut ${n.bond} mit ${d ? d.name : n.who}`; }
      } else if (n.idx > 0) {
        const prev = T().paths.find(x => x.id === n.path).nodes[n.idx - 1];
        if (!GL.skills.has(p, prev.id)) return `Erst „${prev.name}“ lernen`;
      }
      if (GL.skills.free(p) < cost(n)) return cost(n) > 1 ? `Braucht ${cost(n)} Skillpunkte` : 'Kein Skillpunkt frei';
      return null;
    },
    learn(p, id) {
      if (GL.skills.blocker(p, id)) return false;
      p.skills = GL.skills.learned(p).concat(id);
      return true;
    },
    // Umskillen: alles zurück, kostenlos
    reset(p) { p.skills = []; p.polish = {}; },
    // Summe aller Effekte (geht als run.start.skills in den Run)
    bonus(p) {
      const out = {};
      GL.skills.learned(p).forEach(id => {
        const n = find(id);
        // Talente wirken nur, solange die Vertrautheit reicht (sie sinkt nie, ist also nur Absicherung)
        if (n.path === 'talent' && bondOf(p, n.who) < n.bond) return;
        Object.keys(n.eff).forEach(k => { out[k] = Math.round(((out[k] || 0) + n.eff[k]) * 1000) / 1000; });
      });
      const po = GL.skills.polish(p);
      GL.skills.POLISH.forEach(x => { if (po[x.k]) out[x.k] = Math.round(((out[x.k] || 0) + po[x.k] * x.per) * 1000) / 1000; });
      return out;
    }
  };
})();
