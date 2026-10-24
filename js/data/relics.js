// Schätze: bleiben den ganzen Run über aktiv (wie passive Items bei Pokelike).
//
// Werte werden beim Finden ausgewürfelt (Seltenheit, siehe config.js rarities).
//   vals  = Grundwerte, die mit der Seltenheit skaliert werden. In text, mods und flags
//           steht statt einer Zahl der Name des Werts, z. B. atk: 'a' und im Text {a}.
//           Liste mit 4 Zahlen = fester Wert pro Seltenheit (für kleine Werte).
//           Ganze Zahlen bleiben ganz, Anteile (unter 1) werden als Prozent angezeigt.
//   unique = true: keine Seltenheit, immer gleich stark
//   mods  = Werte im Kampf (Aufbau wie in types.js)
//   flags = Sonderregeln, die die Spiellogik kennt:
//     winHeal       zusätzliche Heilung nach Siegen (0.2 = 20 %)
//     noWinHeal     keine normale Heilung nach Siegen (winHeal von anderen Schätzen wirkt weiter)
//     bossStartCut  Bosse starten mit weniger Leben (0.2 = 20 %)
//     vivre         einmal pro Run: gefallene Crew steht mit diesem Anteil Leben wieder auf
//     firstBlock    so viele gegnerische Treffer pro Kampf werden abgewehrt
//     cannon        Schaden an allen Gegnern zu Kampfbeginn
//     effBonus      Bonus auf "sehr effektiv" (1 = dreifach statt doppelt)
//     crewLimit     zusätzliche Crewplätze
//     healBonus     mehr Heilung durch Helfer und Heil-Fähigkeiten (1 = doppelt)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.relics = [
  { id: 'sake',       name: 'Sake-Fass',           vals: { a: [2, 3, 5, 7] }, text: 'Klinge-Figuren +{a} Angriff.',
    mods: [{ scope: 'type:klinge', atk: 'a' }] },
  { id: 'fleisch',    name: 'Riesen-Fleischkeule', vals: { p: 0.4 },      text: 'Nach jedem Sieg heilt die Crew zusätzlich {p}.',
    flags: { winHeal: 'p' } },
  { id: 'logport',    name: 'Log Port',            vals: { a: [2, 3, 4, 6], b: [1, 1, 2, 3] },  text: 'Ganze Crew +{a} Tempo und +{b} Angriff.',
    mods: [{ scope: 'all', spd: 'a', atk: 'b' }] },
  { id: 'steckbrief', name: 'Kopfgeld-Steckbrief', vals: { p: 0.5 },      text: '+{p} Schaden gegen Bosse.',
    mods: [{ scope: 'all', bossPct: 'p' }] },
  { id: 'seestein',   name: 'Seestein-Netz',       vals: { p: 0.2 },      text: 'Bosse beginnen den Kampf mit {p} weniger Leben.',
    flags: { bossStartCut: 'p' } },
  { id: 'vivre',      name: 'Vivre Card',          vals: { p: 0.3 },      text: 'Fällt die ganze Crew, steht sie einmal pro Run mit {p} Leben wieder auf.',
    flags: { vivre: 'p' } },
  { id: 'dial',       name: 'Impact Dial',         vals: { a: [1, 2, 3, 4] }, text: 'Die ersten {a} gegnerischen Treffer in jedem Kampf werden abgewehrt.',
    flags: { firstBlock: 'a' } },
  { id: 'cola',       name: 'Cola-Fass',           vals: { a: [1, 2, 3, 4] }, text: 'Brecher erleiden {a} weniger Schaden.',
    mods: [{ scope: 'role:brecher', armor: 'a' }] },
  { id: 'kanone',     name: 'Schiffskanone',       vals: { a: 8 },        text: 'Zu Kampfbeginn erleiden alle Gegner {a} Schaden.',
    flags: { cannon: 'a' } },
  { id: 'haki',       name: 'Willenskraft-Training',       vals: { p: 1 },        text: 'Sehr effektive Treffer machen {p} mehr Schaden.',
    flags: { effBonus: 'p' } },
  { id: 'wado',       name: 'Wado Ichimonji',      vals: { p: [0.1, 0.15, 0.2, 0.3] }, text: 'Kämpfer +{p} Krit-Chance.',
    mods: [{ scope: 'role:kaempfer', crit: 'p' }] },
  { id: 'sunny',      name: 'Sunny-Bauplan',       unique: true,          text: 'Platz für ein 7. Crewmitglied.',
    flags: { crewLimit: 1 } },
  { id: 'rausch',     name: 'Kampfrausch',         vals: { a: [2, 3, 5, 7] }, text: 'Ganze Crew +{a} Angriff. Dafür keine normale Heilung nach Siegen, Heil-Schätze wirken weiter.',
    mods: [{ scope: 'all', atk: 'a' }], flags: { noWinHeal: true } },
  { id: 'medizin',    name: 'Medizinbuch',         vals: { p: 1 },        text: 'Heilung durch Helfer, Chopper und Vina +{p}.',
    flags: { healBonus: 'p' } },
  { id: 'strohhut',   name: 'Ruffys Strohhut',     vals: { a: [1, 2, 3, 4], b: [1, 1, 2, 2] },  text: 'Kraft-Figuren +{a} Angriff, zusätzlich +{b} pro gesammeltem Kopfgeld.',
    mods: [{ scope: 'type:kraft', atk: 'a', atkPerBounty: 'b' }] },
  // Neu zur großen Neuauflage
  { id: 'mandarinen', name: 'Mandarinen-Kiste',    vals: { a: [1, 1, 2, 2] }, text: 'Ganze Crew heilt sich am Ende jeder Runde um {a}.',
    mods: [{ scope: 'all', regen: 'a' }] },
  { id: 'medkoffer',  name: 'Choppers Medizinkoffer', vals: { p: [0.3, 0.35, 0.45, 0.6] }, text: 'Nach jedem Sieg stehen Gefallene mit {p} Leben wieder auf. Chopper hat sie gebeten, nicht so viel zu sterben.',
    flags: { reviveWin: 'p' } },
  { id: 'loewenkopf', name: 'Sunny-Löwenkopf',     vals: { a: [5, 7, 9, 12], b: [1, 2, 3, 4] }, text: 'Zu Kampfbeginn erleiden alle Gegner {a} Schaden, ganze Crew +{b} Tempo.',
    mods: [{ scope: 'all', spd: 'b' }], flags: { cannon: 'a' } },
  // Je ein Schatz pro Kampfstil (Wucht, Schwertkunst, Tempo, Lazarett, Bollwerk, Sturmtrupp)
  { id: 'hammer',     name: 'Schmiedehammer',      vals: { a: [1, 1, 1, 2], p: [0.1, 0.15, 0.2, 0.3] }, text: 'Kraft-Figuren +{a} Angriff und +{p} Schaden gegen Bosse. Klopft auch Rost aus Kanonen.',
    mods: [{ scope: 'type:kraft', atk: 'a', bossPct: 'p' }] },
  { id: 'wetzstein',  name: 'Alter Wetzstein',     vals: { p: [0.15, 0.25, 0.35, 0.5] }, text: 'Krits von Klinge-Figuren treffen {p} härter. Zorro schwört drauf. Zorro schwört auf vieles.',
    mods: [{ scope: 'type:klinge', critMult: 'p' }] },
  { id: 'federschuh', name: 'Federleichte Schuhe', vals: { a: [1, 1, 1, 2], p: [0.04, 0.05, 0.07, 0.1] }, text: 'Technik-Figuren +{a} Tempo und {p} Ausweichen. Riechen leicht nach Möwe.',
    mods: [{ scope: 'type:technik', spd: 'a', dodge: 'p' }] },
  { id: 'kraeuter',   name: 'Kräutertee-Dose',     vals: { p: [0.08, 0.1, 0.15, 0.2], q: [0.2, 0.3, 0.4, 0.5] }, text: 'Helfer erleiden {p} weniger Schaden, Heilung durch Helfer +{q}. Schmeckt nach Wiese.',
    mods: [{ scope: 'role:helfer', guard: 'p' }], flags: { healBonus: 'q' } },
  { id: 'ankerkette', name: 'Ankerkette',          vals: { a: [1, 1, 2, 2], p: [0.02, 0.03, 0.04, 0.05] }, text: 'Brecher erleiden {a} weniger Schaden, ganze Crew {p} weniger. Schwer, aber beruhigend.',
    mods: [{ scope: 'role:brecher', armor: 'a' }, { scope: 'all', guard: 'p' }] },
  { id: 'trommel',    name: 'Kriegstrommel',       vals: { p: [0.1, 0.14, 0.2, 0.28] }, text: 'Kämpfer +{p} Schaden. Brook spielt sie, wenn ihr nicht hinseht.',
    mods: [{ scope: 'role:kaempfer', dmgPct: 'p' }] }
];
