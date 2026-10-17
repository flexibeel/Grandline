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
  kraft: {
    name: 'Kraft', strong: 'technik',
    tiers: [
      { n: 2, text: 'Kraft-Figuren +2 Angriff', mods: [{ scope: 'type:kraft', atk: 2 }] },
      { n: 4, text: 'Kraft-Figuren +6 Angriff', mods: [{ scope: 'type:kraft', atk: 6 }] }
    ]
  },
  klinge: {
    name: 'Klinge', strong: 'kraft',
    tiers: [
      { n: 2, text: 'Klinge-Figuren +20 % Krit-Chance', mods: [{ scope: 'type:klinge', crit: 0.2 }] },
      { n: 4, text: 'Klinge-Figuren +45 % Krit-Chance und härtere Krits', mods: [{ scope: 'type:klinge', crit: 0.45, critMult: 0.5 }] }
    ]
  },
  technik: {
    name: 'Technik', strong: 'klinge',
    tiers: [
      { n: 2, text: 'Ganze Crew +2 Tempo, Technik-Figuren +2 Angriff', mods: [{ scope: 'all', spd: 2 }, { scope: 'type:technik', atk: 2 }] },
      { n: 4, text: 'Ganze Crew +3 Tempo, Technik-Figuren ohne Typnachteil', mods: [{ scope: 'all', spd: 3 }, { scope: 'type:technik', ignoreWeak: true }] }
    ]
  }
};
