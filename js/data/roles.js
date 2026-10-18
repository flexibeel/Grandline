// Rollen und ihre Synergien. Aufbau wie bei den Kampfstilen in types.js.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.roles = {
  brecher: {
    name: 'Brecher', build: 'Bollwerk', icon: '🛡', pitch: 'Hält vorne alles aus',
    tiers: [
      { n: 2, text: 'Brecher erleiden 3 weniger Schaden', mods: [{ scope: 'role:brecher', armor: 3 }] },
      { n: 3, text: 'Brecher erleiden 5 weniger Schaden, ganze Crew 1 weniger', mods: [{ scope: 'role:brecher', armor: 4 }, { scope: 'all', armor: 1 }] },
      { n: 4, text: 'Bollwerk: Brecher erleiden 8 weniger Schaden, ganze Crew 2 weniger', mods: [{ scope: 'role:brecher', armor: 6 }, { scope: 'all', armor: 2 }] }
    ]
  },
  kaempfer: {
    name: 'Kämpfer', build: 'Sturmtrupp', icon: '🔥', pitch: 'Mehr Schaden für alle Kämpfer',
    tiers: [
      { n: 2, text: 'Kämpfer +20 % Schaden', mods: [{ scope: 'role:kaempfer', dmgPct: 0.2 }] },
      { n: 4, text: 'Kämpfer +45 % Schaden', mods: [{ scope: 'role:kaempfer', dmgPct: 0.45 }] },
      { n: 6, text: 'Sturmtrupp: Kämpfer +70 % Schaden', mods: [{ scope: 'role:kaempfer', dmgPct: 0.7 }] }
    ]
  },
  helfer: {
    name: 'Helfer', build: 'Lazarett', icon: '💚', pitch: 'Heilt jede Runde, lange Kämpfe',
    tiers: [
      { n: 2, text: 'Ganze Crew heilt 4 Leben pro Runde', mods: [{ scope: 'all', regen: 4 }] },
      { n: 3, text: 'Ganze Crew heilt 8 Leben pro Runde', mods: [{ scope: 'all', regen: 8 }] },
      { n: 4, text: 'Lazarett: ganze Crew heilt 11 Leben pro Runde und erleidet 10 % weniger Schaden', mods: [{ scope: 'all', regen: 11, guard: 0.1 }] }
    ]
  }
};
