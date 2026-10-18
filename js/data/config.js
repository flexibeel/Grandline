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
          reroll: 4, rerollStep: 3, extraOffers: 0, factionWeight: 2.4, interestMax: 3,
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

  // Erwachen nach einem Inselboss
  awaken: { atk: 4, hp: 10 },

  // Gegnerstärke
  enemyScale: 0.8,        // wie schnell normale Gegner pro Etappe stärker werden (längere Insel-Kapitel -> langsamer hochskalieren)
  eliteMult: 1.3,         // Kopfgeldjäger sind um diesen Faktor stärker
  // Mehr Leben, etwas weniger Angriff: Kämpfe dauern etwas länger, ohne insgesamt härter zu werden
  grunt: { hpBase: 16, hpPerLevel: 4.4, atkBase: 3.7, atkPerLevel: 1.06, spdMin: 3, spdMax: 7 },
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
  // Kampfwetter (nur normale Kämpfe und Kopfgeldjäger): so oft kommt eins, und was es tut
  // Bosskampf: länger je Meer, Boss weicht manchmal aus und kontert
  bossFight: { hp: 0.2, hpPerSea: 0.12, atk: 0.92, dodge: 0.08, counter: 0.15, counterMult: 0.6 },
  // Begegnung auf See mit der Crew eines anderen Spielers (statt eines normalen Kampfes)
  rival: { chance: 0.2, hp: 1.05, atk: 0.9, max: 4, gold: 12 },
  weatherChance: 0.35,
  weather: [
    { id: 'nebel',  name: 'Nebel',        text: 'Alle verfehlen öfter.',              miss: 0.12 },
    { id: 'wind',   name: 'Rückenwind',   text: 'Deine Crew ist schneller.',          crewSpd: 2 },
    { id: 'sturm',  name: 'Gegenwind',    text: 'Die Gegner sind schneller.',         foeSpd: 2 },
    { id: 'mond',   name: 'Vollmond',     text: 'Ulti-Leisten laden schneller.',      gain: 1.5 },
    { id: 'hitze',  name: 'Hitzewelle',   text: 'Mehr kritische Treffer für alle.',   crit: 0.1 },
    { id: 'jubel',  name: 'Schatzfieber', text: 'Deine Crew trifft härter.',          crewDmg: 0.12 }
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
