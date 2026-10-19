// Spielregeln und Balancing an einer Stelle.
// Hier kannst du Zahlen ändern, ohne die Spiellogik anzufassen.
window.GL = window.GL || {};

GL.config = {
  saveVersion: 10,
  // Welt: 'onepiece' (Fanprojekt) oder 'neutral' (eigene Namen, siehe js/world/neutral.js)
  world: 'onepiece',
  // Eigene Online-Rangliste (Supabase). Leer lassen = Rangliste über die geteilte Claude-Seite.
  online: { url: 'https://ahalqeebrtzpcrvpnyxf.supabase.co', key: 'sb_publishable_00GGB1JXueV7rpMb8JxX8A_FT6brXAm',
            mailCode: false },   // true, sobald die Supabase-Mailvorlage {{ .Token }} enthält (dann gibt es zusätzlich einen 6-stelligen Code)

  // Aufbau eines Runs
  stepsPerIsland: 8,      // pro Meer: 2 Insel-Kapitel mit je 4 Etappen (3 Orte + Bösewicht bzw. Boss)
  chapterSteps: 4,        // Etappen pro Insel-Kapitel
  gateMult: 1.1,          // Bösewicht am Ende einer kleinen Insel: so viel stärker als ein Kopfgeldjäger
  maxCrew: 6,
  starters: ['ruffy', 'zorro', 'nami'],   // wählbare Kapitäne zu Beginn eines Runs
  choicesPerPick: 3,      // wie viele Optionen bei Rekrutierung/Teufelsfrucht
  captainChoices: 3,      // so viele Kapitäne stehen beim Start zur Wahl (plus dein eigener Pirat)

  // Raids und epische Früchte
  // Spezialangriff: Ladung pro Sieg (Kopfgeldjäger zählen doppelt), voll bei specialMax
  specialMax: 2,
  // Ausrüstung: Fundchancen, Truhe, Mitnahme-Plätze, Schmiede-Preise (Berry)
  items: { dropElite: 0.6, dropBoss: 1, dropTreasure: 0.3, chestMax: 40, takeBase: 2, maxLevel: 5, forgeBase: 25 },
  // Taverne: Preise in Gold, Gold für Siege (+ Zinsen), Neu würfeln wird pro Besuch teurer
  shop: { startGold: 30, base: 14, perStar: 10, perLevel: 3, locked: 12, sellShare: 0.5,
          reroll: 4, rerollStep: 3, extraOffers: 0, factionWeight: 2.4, typeWeight: 1.7, interestMax: 3,
          win: { battle: 10, elite: 16, boss: 28, raid: 28 } },
  artLevels: [1, 2, 4, 7, 11],   // Funde, die ein Artefakt für Stufe 1 bis 5 braucht
  trophyChance: { boss: 0.35, raid: 1, mini: 0.2 },   // Chance auf ein Artefakt
  bossBounty: [30, 120, 400],  // Kopfgeld in Mio. Berry pro besiegtem Inselboss
  specialBossCut: 0.22,   // Anteil Max-Leben, den der Boss verliert
  specialEscortCut: 0.6,  // Anteil Max-Leben bei Begleitern
  raidChance: 0.5,
  rareRaidChance: 0.15,   // Anteil der Raids, die gegen den seltenen Raid-Boss (Shanks) gehen        // Chance pro Insel ab der 2. Insel, dass ein Raid auf der Seekarte liegt
  raidEscapeHp: 0.25,
  // Endlos-Modus: Zuschlag pro Runde auf Leben/Angriff aller Gegner
  // Endlos-Fahrt: eigener Modus pro geschafftem Meer. Jede Runde stärkere Gegner (hp/atk je Runde)
  endless: { hp: 0.45, atk: 0.3, lvlPerSea: 4, startGold: 30, goldPerSea: 70, loopGold: 30, seaEase: [1, 0.72, 0.6, 0.52] },
  // Raid-Jagd (ab Rang, siehe features.js): Raid erscheint fast sicher, Beute-Chancen pro Sieg (+ pro Kopfgeld-Stufe)
  hunt: { raidChance: 0.85, epic: 0.35, legendary: 0.12, legendaryPerHeat: 0.03 },     // verlorener Raid: Crew entkommt mit diesem Anteil Leben
  epicChance: 0.3,        // Chance, dass eine freigeschaltete epische Frucht im Angebot ist

  // Seltenheit von Schätzen und Teufelsfrüchten.
  // q = Faktor auf die Werte, w = Gewicht beim Auswürfeln (normal / nach Kopfgeldjägern)
  rarities: [
    { id: 'common',    name: 'Gewöhnlich', q: 0.85, w: 60, wElite: 35 },
    { id: 'rare',      name: 'Selten',     q: 1.05, w: 28, wElite: 38 },
    { id: 'epic',      name: 'Episch',     q: 1.3,  w: 10, wElite: 21 },
    { id: 'legendary', name: 'Legendär',   q: 1.6,  w: 2,  wElite: 6 }
  ],

  // Sterne neuer Crewmitglieder: Gewicht und Bonus auf die Grundwerte
  // Zusammenlegen wie bei TFT: Taucht eine Figur aus deiner Crew mit gleichen Sternen in der Taverne auf,
  // macht ein Kauf aus beiden eine Figur mit einem Stern mehr (bis 3). Selten, damit es etwas Besonderes bleibt.
  merge: { chance: 0.14, hp: 0.25, atk: 0.2, atkMin: 2 },
  stars: [
    { n: 1, w: 44, hp: -3, atk: 0 },
    { n: 2, w: 36, hp: 0,  atk: 0 },
    { n: 3, w: 20, hp: 6,  atk: 2 }
  ],

  // Erfahrung und Level
  xp: { battle: 10, elite: 16, boss: 26, raid: 26 },  // pro Sieg, Gefallene bekommen die Hälfte
  xpNeed: { base: 14, perLevel: 8 },  // Level L -> L+1 braucht base + perLevel * L
  levelUp: { hp: 2, points: 2 },      // pro Level-up automatisch, plus Statuspunkte
  point: { hp: 5, atk: 1, spd: 1 },   // was ein Statuspunkt bringt

  // Ereignisse auf See
  eventChance: 0.2,       // Chance nach jeder Etappe

  // Heilung
  skipGold: 10,           // Frucht oder Schatz überspringen
  winHeal: 0.15,          // nach jedem gewonnenen Kampf (Anteil vom Max-Leben)
  restHeal: 0.4,          // Rast an Land
  reviveAfterBoss: 0.5,   // Gefallene kommen nach einem Inselboss mit diesem Anteil zurück
  reviveAfterWin: 0.1,    // Gefallene rappeln sich nach jedem gewonnenen Kampf mit diesem Anteil auf
  reviveAtRest: 0.3,      // Rast an Land weckt Gefallene mit diesem Anteil
  doctor: { chopper: 0.25, lazarett: 0.2, lazarett4: 0.3, lazarettN: 3, hito: 0.2 },   // Feldarzt: einmal pro Kampf holt er einen Gefallenen zurück
  // Gegnerwellen: normale Kämpfe ab dieser Etappe kommen in zwei Wellen (Welle 2 etwas schwächer, später mit Elite)
  waves: { fromStep: 2, extra: 2, hp: 0.85, atk: 0.95, eliteHp: 1.45, eliteAtk: 1.2, eliteFromSea: 1, raidHp: 1.2, raidExtra: 2 },

  // Erwachen nach einem Inselboss
  awaken: { atk: 4, hp: 10 },

  // Gegnerstärke
  // Kurswahl: gemütlich / ordentlich / ungemütlich. Stärkere Gegner auf der Insel, dafür mehr Gold, Kopfgeld und Beute
  risk: [
    { foe: 0, gold: 0, bounty: 0 },
    { foe: 0.06, gold: 0.15, bounty: 0.15 },
    { foe: 0.12, gold: 0.3, bounty: 0.3, drop: 0.6 }
  ],
  // Stammcrew-Duell: Kommando-Knöpfe (laden pro Zug, wirken ab dem nächsten Zug). charge = Züge bis voll
  // FUN: Kapitänsbefehle im Run-Kampf (Ladung in Zügen; ein Zug = eine Figur ist dran)
  runCmds: { charge: { rally: 4, guard: 6, burst: 9 }, rallyAtk: 0.18, rallyTurns: 6, guard: 0.25, guardTurns: 6, strike: 2, mend: 0.2 },
  duelCmds: { charge: { cheer: 10, food: 13, dice: 18 }, cheerAtk: 0.08, cheerTurns: 5, food: 0.2, salvoP: 0.3, salvo: 0.22, tripP: 0.28 },
  enemyScale: 0.9,        // wie schnell normale Gegner pro Etappe stärker werden (längere Insel-Kapitel -> langsamer hochskalieren)
  eliteMult: 1.3,         // Kopfgeldjäger sind um diesen Faktor stärker
  // Mehr Leben, etwas weniger Angriff: Kämpfe dauern etwas länger, ohne insgesamt härter zu werden
  // GEGNER-WERTE: Leben leicht angehoben (13 / 3.6 -> 13.5 / 3.75) als Ausgleich zum Treffer-Deckel (foeHit)
  grunt: { hpBase: 13.5, hpPerLevel: 3.75, atkBase: 4.8, atkPerLevel: 1.38, spdMin: 3, spdMax: 7 },
  maxGrunts: 4,
  // Besondere Gegner (Sanitäter, Schildträger …): Chance pro normalem Gegner, wächst pro Meer; höchstens max pro Kampf
  foeKinds: { base: 0.14, perSea: 0.09, cap: 0.45, max: 2, fromStep: 2 },

  // Kampf
  dmgSpread: 2,           // (alt, nicht mehr genutzt)
  dmgSpreadPct: 0.18,     // Schaden schwankt um +/- 18 %
  baseCrit: 0.05,         // Grund-Krit-Chance für alle
  luckyHit: 0.04,         // Volltreffer (nur eigene Crew): 2,5-facher Schaden
  // Glücksfund nach gewonnenen Kämpfen: Goldtruhe mit mindestens seltener Ausrüstung + Gold (Glücksmünze erhöht die Chance)
  luck: { battle: 0.06, elite: 0.12, boss: 0.2, raid: 0.25, gold: 15 },
  // Ultis: Energie pro eigenem Treffer / eingestecktem Treffer, bei max feuert die Ulti. Bosse starten mit etwas Energie.
  ult: { max: 100, gainHit: 40, gainHurt: 20, start: 20, bossStart: 40, fireChance: 0.6, maxWait: 2, spark: 0.05 },
  critMult: 2,
  // STATS: Deckel für Krit-Chance und Ausweichen. Was darüber liegt, verfällt nicht, sondern wird umgewandelt:
  //   critOver: je 1 % Krit-Chance über dem Deckel +critOver % Krit-Schaden (0.5 → 20 % drüber = +10 % Krit-Schaden)
  //   dodgeOver: je 1 % Ausweichen über dem Deckel +dodgeOver % Schutz (weniger Schaden), höchstens dodgeOverMax
  //   critMultMax/guardMax: Deckel aus effects.js (Krit-Schaden ×3, Schutz 60 %); der Überlauf kommt obendrauf
  caps: { crit: 0.85, dodge: 0.6, critOver: 0.5, dodgeOver: 0.5, dodgeOverMax: 0.2, critMultMax: 3, guardMax: 0.6 },
  // GEGNER-WERTE (21f): Schaden Gegner -> Crew lesbarer machen, ohne den Kampf leichter zu machen.
  //   cap    = ein einzelner normaler Gegner-Treffer (auch Konter) nimmt höchstens diesen Anteil vom Max-Leben
  //   capBig = angekündigte Brocken (Boss-Signatur, Wucht-Schlag nach Ankündigung, Überhitzt-Strahl, Salve) höchstens so viel
  //   critMult = Krit-Faktor der Gegner (Crew behält critMult oben); nicht in Duellen/PvP
  //   capHeat = pro Kopfgeld-Stufe wird der Deckel um so viel lockerer (Stufe 20: +30 %)
  //   atk    = Ausgleich auf den Angriff normaler Gegner je Meer, damit die Kappung die Gesamt-Schwierigkeit nicht senkt
  foeHit: { cap: 0.6, capBig: 0.8, capHeat: 0.015, critMult: 1.75, atk: [1.1, 1.2, 1.3] },
  // Kampfwetter (nur normale Kämpfe und Kopfgeldjäger): so oft kommt eins, und was es tut
  // Bosskampf: länger je Meer, Boss weicht manchmal aus und kontert
  // FIGHT: Bosse waren Pappkameraden (99 % Siege in 1,7 Runden). Jetzt mehr Leben und Biss, dazu Signatur-Angriffe.
  //   hpFloor/atkFloor: Boss hat mindestens so viel wie x normale Gegner derselben Etappe
  bossFight: { hp: 0.5, hpPerSea: 0.12, atk: 1.1, hpFloor: [3.0, 4.3, 6.0], atkFloor: [1.1, 1.3, 1.5], dodge: 0.08, counter: 0.15, counterMult: 0.6, windup: 1.8 },   // windup: schwerer Schlag nach Ankündigung
  // Begegnung auf See mit der Crew eines anderen Spielers (statt eines normalen Kampfes)
  rival: { chance: 0.2, hp: 1.05, atk: 0.9, max: 4, gold: 12 },
  // FIGHT: Pläne der Gegnergruppen (enemies.js foePlans): Salve (Anteil Angriff je Marine), Rausch (+Angriff je Gefallenem),
  // Biss (Blutungs-Chance), Welle (Anteil Ø-Angriff an alle), Strahl (Faktor Angriff), Untot (Leben beim Aufstehen)
  plan: { salvo: 0.45, frenzy: 0.1, bite: 0.18, wave: 0.55, beam: 1.6, undead: 0.3 },
  sig: { final: 1.3 },   // Boss-Signatur in der Endphase: so viel stärker
  // KAMPFTIEFE: Stil-Ketten und Schwung (battle.js). cut = Blutung nach Klinge-Krit (Anteil Angriff, Runden),
  //   rip = Kraft reißt Blutung auf (Restschaden × rip), expose = Technik gegen Geschwächt/Betäubt (+Schaden, Rüstung egal),
  //   rout = Furcht-Runden fürs Gefolge, wenn der Anführer fällt, moNeed = Schwung bis „in Fahrt“ (surgeEn Ulti, surgeAtk Angriff, max surgeMax pro Kampf)
  chain: { on: true, open: 0.25, cut: 0.45, cutRounds: 3, rip: 1, expose: 0.2, routRounds: 2, moNeed: 6, surgeEn: 35, surgeAtk: 0.12, surgeMax: 2 },
  riposteMult: 0.7,      // Schwertkunst-Konter: Anteil des eigenen Angriffs (kann kritisch sein)
  // FIGHT: dazu Kampf-Launen mit eigener Mechanik (Pulverfass, Möwen, glitschiges Deck, Zweikampf). Höchstens eine pro Kampf.
  weatherChance: 0.4,
  weather: [
    { id: 'nebel',  name: 'Nebel',        text: 'Alle verfehlen öfter.',              miss: 0.12 },
    { id: 'wind',   name: 'Rückenwind',   text: 'Deine Crew ist schneller.',          crewSpd: 2 },
    { id: 'sturm',  name: 'Gegenwind',    text: 'Die Gegner sind schneller.',         foeSpd: 2 },
    { id: 'mond',   name: 'Vollmond',     text: 'Ulti-Leisten laden schneller.',      gain: 1.5 },
    { id: 'hitze',  name: 'Hitzewelle',   text: 'Mehr kritische Treffer für alle.',   crit: 0.1 },
    { id: 'jubel',  name: 'Schatzfieber', text: 'Deine Crew trifft härter.',          crewDmg: 0.12 },
    { id: 'pulver', name: 'Pulverfass',   text: 'In Runde 2 fliegt ein Fass in die Luft. Vorne wird es heiß, auf beiden Seiten.', blast: 0.16 },
    { id: 'moewen', name: 'Möwenangriff', text: 'Möwen picken wahllos zu. Wer erwischt wird, setzt aus.', gulls: 0.45 },
    { id: 'glitsch', name: 'Glitschiges Deck', text: 'Wer zuerst dran ist, entscheidet jede Runde das Glück.', shuffle: true },
    { id: 'duell',  name: 'Zweikampf',    text: 'Die beiden Stärksten gehen aufeinander los. +25 % Schaden gegeneinander.', duel: 0.25 }
  ],
  typeStrong: 2,          // Schaden gegen einen Typ, gegen den man stark ist
  typeWeak: 0.5,          // Schaden gegen einen Typ, gegen den man schwach ist
  battleRoundsMax: 200,   // Sicherheitsgrenze gegen Endlos-Kämpfe

  // Kopfgeld-Stufen: Bonus pro Stufe auf Berry und Punkte
  heatBonus: { berry: 0.2, score: 0.25 },

  // Punkte (für Highscore und spätere Rangliste)
  score: { perStep: 100, perBounty: 500, perMio: 2 },   // Punkte: Etappen, Inselbosse, Kopfgeld in Mio.
  // Laune der See: jeder Run (ab dem 3.) bekommt eine kleine Besonderheit, aus dem Seed bestimmt
  moods: [
    { id: 'goldrausch', name: 'Goldrausch', icon: '💰', text: 'Siege bringen 40 % mehr Gold. Gegner haben 8 % mehr Leben.' },
    { id: 'tierzeit', name: 'Wilde See', icon: '🐗', text: 'Viele Tiere unterwegs. Dafür haben sie 10 % weniger Leben.' },
    { id: 'kopfgeld', name: 'Kopfgeldjagd', icon: '🎯', text: 'Kopfgeld-Ziele bringen 50 % mehr Kopfgeld, sind aber 10 % stärker.' },
    { id: 'flaute', name: 'Flaute', icon: '🌫', text: 'Alle Gegner sind 1 Tempo langsamer. Rast heilt mehr.' },
    { id: 'schatzfieber', name: 'Schatzfieber', icon: '✨', text: 'Mehr Glück: seltenere Schätze und öfter Goldtruhen.' },
    { id: 'rueckenwind', name: 'Rückenwind', icon: '⛵', text: 'Deine ganze Crew ist 1 Tempo schneller.' }
  ]
};

// Live-Start des großen Updates: ab diesem Moment zählt die Rangliste bei null (Fortschritt bleibt, frisch starten ist freiwillig).
//   start = 18.10.2026, 18:00 Uhr deutscher Zeit (16:00 UTC). Startabend bis 19.10. 23:59 → Flagge „Erste Fahrt“.
GL.config.season = { id: 's1', start: Date.UTC(2026, 9, 18, 16, 0, 0), launchEnd: Date.UTC(2026, 9, 19, 22, 0, 0) };
