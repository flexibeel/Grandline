// Banden: dritte Synergie-Ebene neben Kampfstil und Rolle.
// Aufbau wie in types.js (tiers mit mods).
// Die Strohhutbande hat mehr Mitglieder, deshalb liegen ihre Stufen höher.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.factions = {
  strohhut: {
    name: 'Strohhutbande',
    tiers: [
      { n: 3, text: 'Ganze Crew +10 % Schaden', mods: [{ scope: 'all', dmgPct: 0.1 }] },
      { n: 6, text: 'Ganze Crew +25 % Schaden und heilt 1 Leben pro Runde', mods: [{ scope: 'all', dmgPct: 0.25, regen: 1 }] }
    ]
  },
  marine: {
    name: 'Marine',
    tiers: [
      { n: 2, text: 'Ganze Crew erleidet 1 weniger Schaden', mods: [{ scope: 'all', armor: 1 }] },
      { n: 4, text: 'Ganze Crew erleidet 3 weniger Schaden', mods: [{ scope: 'all', armor: 3 }] }
    ]
  },
  cp9: {
    name: 'CP9',
    tiers: [
      { n: 2, text: 'CP9 weicht 15 % der Angriffe aus', mods: [{ scope: 'faction:cp9', dodge: 0.15 }] },
      { n: 4, text: 'CP9 weicht 30 % aus und +20 % Krit-Chance', mods: [{ scope: 'faction:cp9', dodge: 0.3, crit: 0.2 }] }
    ]
  },
  weissbart: {
    name: 'Weißbart-Bande',
    tiers: [
      { n: 2, text: 'Familie: ganze Crew heilt 2 Leben pro Runde', mods: [{ scope: 'all', regen: 2 }] },
      { n: 3, text: 'Familie: ganze Crew heilt 4 Leben pro Runde und erleidet 1 weniger Schaden', mods: [{ scope: 'all', regen: 4, armor: 1 }] }
    ]
  },
  samurai: {
    name: 'Samurai der Meere',
    tiers: [
      { n: 2, text: 'Samurai +20 % Schaden und +10 % Krit-Chance', mods: [{ scope: 'faction:samurai', dmgPct: 0.2, crit: 0.1 }] },
      { n: 3, text: 'Samurai +40 % Schaden und +20 % Krit-Chance', mods: [{ scope: 'faction:samurai', dmgPct: 0.4, crit: 0.2 }] }
    ]
  },
  baroque: {
    name: 'Baroque Works',
    tiers: [
      { n: 2, text: 'Ganze Crew +2 Tempo', mods: [{ scope: 'all', spd: 2 }] },
      { n: 4, text: 'Ganze Crew +3 Tempo und +2 Angriff', mods: [{ scope: 'all', spd: 3, atk: 2 }] }
    ]
  }
};
