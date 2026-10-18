// Stil-Kombos: Sind zwei Kampfstile gleichzeitig aktiv (je mindestens die erste Stufe), gibt es einen kleinen Extra-Bonus.
//   a, b  = 'type:<id>' oder 'role:<id>' (wie in types.js / roles.js)
//   mods  = wie bei den Synergien
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.combos = [
  { id: 'sturmangriff', a: 'type:kraft', b: 'type:technik', icon: '💥💨', name: 'Sturmangriff',
    text: 'Ganze Crew +1 Tempo, Kraft-Figuren +10 % Schaden.',
    joke: 'Erst rennen, dann hauen. Die Reihenfolge ist wichtig.',
    mods: [{ scope: 'all', spd: 1 }, { scope: 'type:kraft', dmgPct: 0.1 }] },
  { id: 'schnitte', a: 'type:klinge', b: 'type:technik', icon: '⚔💨', name: 'Tausend Schnitte',
    text: 'Klinge-Figuren +8 % Krit-Chance und +6 % Ausweichen.',
    joke: 'Schneller schneiden, als der Gegner „Moment mal“ sagen kann.',
    mods: [{ scope: 'type:klinge', crit: 0.08, dodge: 0.06 }] },
  { id: 'festung', a: 'role:helfer', b: 'role:brecher', icon: '💚🛡', name: 'Festung',
    text: 'Ganze Crew +1 Rüstung, Brecher heilen 2 Leben pro Runde.',
    joke: 'Niemand kommt rein. Leider auch kein Lieferdienst.',
    mods: [{ scope: 'all', armor: 1 }, { scope: 'role:brecher', regen: 2 }] },
  { id: 'brocken', a: 'type:kraft', b: 'role:helfer', icon: '💥💚', name: 'Zäher Brocken',
    text: 'Kraft-Figuren heilen 2 Leben pro Runde und erleiden 5 % weniger Schaden.',
    joke: 'Haut zu. Steht wieder auf. Haut wieder zu. Ein Kreislauf.',
    mods: [{ scope: 'type:kraft', regen: 2, guard: 0.05 }] },
  { id: 'klingensturm', a: 'type:klinge', b: 'role:kaempfer', icon: '⚔🔥', name: 'Klingensturm',
    text: 'Krits von Kämpfern treffen 25 % härter.',
    joke: 'Spitze Sachen. Viele davon. In schneller Folge.',
    mods: [{ scope: 'role:kaempfer', critMult: 0.25 }] }
];
