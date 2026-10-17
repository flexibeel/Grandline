// Rollen und ihre Synergien. Aufbau wie bei den Kampfstilen in types.js.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.roles = {
  brecher: {
    name: 'Brecher',
    tiers: [
      { n: 2, text: 'Brecher erleiden 2 weniger Schaden', mods: [{ scope: 'role:brecher', armor: 2 }] },
      { n: 3, text: 'Brecher erleiden 4 weniger Schaden', mods: [{ scope: 'role:brecher', armor: 4 }] }
    ]
  },
  kaempfer: {
    name: 'Kämpfer',
    tiers: [
      { n: 2, text: 'Kämpfer +20 % Schaden', mods: [{ scope: 'role:kaempfer', dmgPct: 0.2 }] },
      { n: 4, text: 'Kämpfer +45 % Schaden', mods: [{ scope: 'role:kaempfer', dmgPct: 0.45 }] }
    ]
  },
  helfer: {
    name: 'Helfer',
    tiers: [
      { n: 2, text: 'Ganze Crew heilt 3 Leben pro Runde', mods: [{ scope: 'all', regen: 3 }] },
      { n: 3, text: 'Ganze Crew heilt 6 Leben pro Runde', mods: [{ scope: 'all', regen: 6 }] }
    ]
  }
};
