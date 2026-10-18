// Kampfstile (wie Typen bei Pokémon) und ihre Synergien.
// strong = gegen diesen Typ macht man mehr Schaden (Faktoren in config.js).
//
// tiers = Synergie-Stufen: ab n Crewmitgliedern dieses Stils gelten die mods.
// Ein mod wirkt auf alle Crewmitglieder, die zu "scope" passen:
//   'all'           ganze Crew
//   'type:kraft'    alle mit diesem Kampfstil
//   'role:helfer'   alle mit dieser Rolle (siehe roles.js)
//   'faction:cp9'   alle aus dieser Bande (siehe factions.js)
//   'char:ruffy'    nur diese Figur
// Mögliche Werte in einem mod:
//   atk, spd       Angriff/Tempo im Kampf
//   crit           Chance auf kritischen Treffer (0.1 = 10 %)
//   critMult       zusätzlicher Krit-Schaden (0.5 = +50 %)
//   armor          so viel weniger Schaden pro Treffer
//   guard          Anteil weniger Schaden (0.25 = 25 %)
//   dodge          Chance, einem Angriff auszuweichen
//   dmgPct         zusätzlicher Schaden (0.2 = +20 %)
//   bossPct        zusätzlicher Schaden gegen Bosse
//   regen          Heilung am Ende jeder Runde
//   ignoreWeak     true = kein Malus durch Typnachteil
//   atkPerBounty   Angriff pro gesammeltem Kopfgeld
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.types = {
  // Wucht: große Treffer, Bosse knacken. Je mehr Kraft-Figuren, desto härter.
  kraft: {
    name: 'Kraft', strong: 'technik', build: 'Wucht', icon: '💥',
    pitch: 'Große Treffer, knackt Bosse',
    tiers: [
      { n: 2, text: 'Kraft-Figuren +3 Angriff und +10 % gegen Bosse', mods: [{ scope: 'type:kraft', atk: 3, bossPct: 0.1 }] },
      { n: 4, text: 'Kraft-Figuren +6 Angriff und +25 % gegen Bosse', mods: [{ scope: 'type:kraft', atk: 6, bossPct: 0.25 }] },
      { n: 6, text: 'Wucht-Bande: Kraft-Figuren +9 Angriff und +40 % gegen Bosse', mods: [{ scope: 'type:kraft', atk: 9, bossPct: 0.4 }] }
    ]
  },
  // Klinge: Krits. Wenig auf dem Papier, explodiert mit Glück.
  klinge: {
    name: 'Klinge', strong: 'kraft', build: 'Schwertkunst', icon: '⚔',
    pitch: 'Viele kritische Treffer',
    tiers: [
      { n: 2, text: 'Klinge-Figuren +25 % Krit-Chance und etwas härtere Krits', mods: [{ scope: 'type:klinge', crit: 0.25, critMult: 0.2 }] },
      { n: 4, text: 'Klinge-Figuren +40 % Krit-Chance und härtere Krits', mods: [{ scope: 'type:klinge', crit: 0.4, critMult: 0.5 }] },
      { n: 6, text: 'Schwertkunst: Klinge-Figuren +55 % Krit-Chance, Krits doppelt so hart', mods: [{ scope: 'type:klinge', crit: 0.55, critMult: 1.0 }] }
    ]
  },
  // Technik: Tempo und Ausweichen. Zuerst handeln, nicht getroffen werden.
  technik: {
    name: 'Technik', strong: 'klinge', build: 'Tempo', icon: '💨',
    pitch: 'Zuerst handeln, oft ausweichen',
    tiers: [
      { n: 2, text: 'Ganze Crew +2 Tempo, Technik-Figuren +2 Angriff und +10 % Ausweichen', mods: [{ scope: 'all', spd: 2 }, { scope: 'type:technik', atk: 2, dodge: 0.1 }] },
      { n: 4, text: 'Ganze Crew +3 Tempo und +6 % Ausweichen, Technik-Figuren +2 Angriff, +20 % Ausweichen, ohne Typnachteil', mods: [{ scope: 'all', spd: 3, dodge: 0.06 }, { scope: 'type:technik', atk: 2, dodge: 0.14, ignoreWeak: true }] },
      { n: 6, text: 'Tempo-Bande: ganze Crew +4 Tempo und +15 % Ausweichen, Technik-Figuren +4 Angriff', mods: [{ scope: 'all', spd: 4, dodge: 0.15 }, { scope: 'type:technik', atk: 4, dodge: 0.1 }] }
    ]
  }
};
