// Rollen und ihre Synergien. Aufbau wie bei den Kampfstilen in types.js.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.roles = {
  brecher: {
    name: 'Brecher', build: 'Bollwerk', icon: '🛡', pitch: 'Hält vorne alles aus',
    tiers: [
      { n: 2, text: 'Brecher erleiden 3 weniger Schaden', mods: [{ scope: 'role:brecher', armor: 3 }] },
      { n: 3, text: 'Brecher erleiden 5 weniger Schaden und ziehen die Angriffe auf sich, ganze Crew 1 weniger', mods: [{ scope: 'role:brecher', armor: 4, taunt: 1 }, { scope: 'all', armor: 1 }] },
      { n: 4, text: 'Bollwerk: Brecher erleiden 8 weniger Schaden und ziehen sogar Schützen auf sich, ganze Crew 2 weniger', mods: [{ scope: 'role:brecher', armor: 6, taunt: 2 }, { scope: 'all', armor: 2 }] }
    ]
  },
  kaempfer: {
    name: 'Kämpfer', build: 'Sturmtrupp', icon: '🔥', pitch: 'Mehr Schaden für alle Kämpfer',
    tiers: [
      { n: 2, text: 'Kämpfer +20 % Schaden, 35 % Nachsetzen nach einem K.O.', mods: [{ scope: 'role:kaempfer', dmgPct: 0.2, killChain: 0.35 }] },
      { n: 4, text: 'Kämpfer +45 % Schaden, 55 % Nachsetzen nach einem K.O.', mods: [{ scope: 'role:kaempfer', dmgPct: 0.45, killChain: 0.55 }] },
      { n: 6, text: 'Sturmtrupp: Kämpfer +70 % Schaden, 75 % Nachsetzen nach einem K.O.', mods: [{ scope: 'role:kaempfer', dmgPct: 0.7, killChain: 0.75 }] }
    ]
  },
  helfer: {
    name: 'Helfer', build: 'Lazarett', icon: '💚', pitch: 'Heilt jede Runde, lange Kämpfe',
    tiers: [
      { n: 2, text: 'Ganze Crew heilt 4 Leben pro Runde', mods: [{ scope: 'all', regen: 4 }] },
      { n: 3, text: 'Ganze Crew heilt 8 Leben pro Runde, einmal pro Kampf steht eine Gefallene wieder auf', mods: [{ scope: 'all', regen: 8 }] },
      { n: 4, text: 'Lazarett: ganze Crew heilt 11 Leben pro Runde, erleidet 10 % weniger Schaden, Wiederbeleben stärker', mods: [{ scope: 'all', regen: 11, guard: 0.1 }] }
    ]
  }
};
