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
      { n: 2, text: 'Kraft-Figuren +3 Angriff, +10 % gegen Bosse, 15 % Rüstungsbruch', mods: [{ scope: 'type:kraft', atk: 3, bossPct: 0.1, armorBreak: 0.15 }] },
      { n: 4, text: 'Kraft-Figuren +6 Angriff, +25 % gegen Bosse, 25 % Rüstungsbruch', mods: [{ scope: 'type:kraft', atk: 6, bossPct: 0.25, armorBreak: 0.25 }] },
      { n: 6, text: 'Wucht-Bande: Kraft-Figuren +9 Angriff, +40 % gegen Bosse, 35 % Rüstungsbruch', mods: [{ scope: 'type:kraft', atk: 9, bossPct: 0.4, armorBreak: 0.35 }] }
    ]
  },
  // Klinge: Krits. Wenig auf dem Papier, explodiert mit Glück.
  klinge: {
    name: 'Klinge', strong: 'kraft', build: 'Schwertkunst', icon: '⚔',
    pitch: 'Viele kritische Treffer',
    tiers: [
      { n: 2, text: 'Klinge-Figuren +35 % Krit-Chance, etwas härtere Krits, 25 % Konter', mods: [{ scope: 'type:klinge', crit: 0.35, critMult: 0.4, riposte: 0.25 }] },
      { n: 4, text: 'Klinge-Figuren +40 % Krit-Chance, härtere Krits, 35 % Konter', mods: [{ scope: 'type:klinge', crit: 0.4, critMult: 0.5, riposte: 0.35 }] },
      { n: 6, text: 'Schwertkunst: Klinge-Figuren +55 % Krit-Chance, Krits doppelt so hart, 45 % Konter', mods: [{ scope: 'type:klinge', crit: 0.55, critMult: 1.0, riposte: 0.45 }] }
    ]
  },
  // Technik: Tempo und Ausweichen. Zuerst handeln, nicht getroffen werden.
  technik: {
    name: 'Technik', strong: 'klinge', build: 'Tempo', icon: '💨',
    pitch: 'Zuerst handeln, oft ausweichen',
    tiers: [
      { n: 2, text: 'Ganze Crew +2 Tempo, Technik-Figuren +3 Angriff, +10 % Ausweichen, 30 % Extra-Zug', mods: [{ scope: 'all', spd: 2 }, { scope: 'type:technik', atk: 3, dodge: 0.1, extraTurn: 0.3 }] },
      { n: 4, text: 'Ganze Crew +3 Tempo und +6 % Ausweichen, Technik-Figuren +2 Angriff, +20 % Ausweichen, 35 % Extra-Zug, ohne Typnachteil', mods: [{ scope: 'all', spd: 3, dodge: 0.06 }, { scope: 'type:technik', atk: 2, dodge: 0.14, ignoreWeak: true, extraTurn: 0.35 }] },
      { n: 6, text: 'Tempo-Bande: ganze Crew +4 Tempo und +15 % Ausweichen, Technik-Figuren +4 Angriff, 45 % Extra-Zug', mods: [{ scope: 'all', spd: 4, dodge: 0.15 }, { scope: 'type:technik', atk: 4, dodge: 0.1, extraTurn: 0.45 }] }
    ]
  }
};
