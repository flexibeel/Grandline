// Ereignisse auf See: tauchen gelegentlich zwischen zwei Etappen auf (config.eventChance).
// Jede Wahl hat ein Ergebnis (outcome). Mögliche Ergebnisse:
//   { berry: 30 }                     Berry, die am Ende des Runs dazukommen
//   { heal: 0.25 }                    ganze Crew heilt Anteil vom Max-Leben
//   { hurt: 0.15 }                    ganze Crew verliert Anteil vom Max-Leben (nie unter 1)
//   { xp: 12 }                        Erfahrung für die ganze Crew
//   { points: 2 }                     Statuspunkte für den Kapitän
//   { relic: 1 }                      zufälliger Schatz mit dieser Seltenheit (0-3)
//   { pick: 'fruit' | 'recruit' | 'treasure' }   Auswahl wie an einem Routen-Knoten
//   { chance: 0.6, win: {...}, lose: {...} }    Glücksspiel
//   text = was danach angezeigt wird ({n} = Zahl)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.events = [
  {
    id: 'treibgut', title: 'Treibgut gesichtet',
    text: 'Zwischen den Wellen treiben Kisten und Fässer. Vielleicht ist etwas Wertvolles dabei.',
    choices: [
      { label: 'Bergen', hint: '+30 Berry', outcome: { berry: 30 }, text: 'Ihr fischt 30 Berry aus dem Wasser.' },
      { label: 'Weitersegeln', hint: 'Nichts passiert', outcome: {}, text: 'Ihr segelt weiter.' }
    ]
  },
  {
    id: 'sturm', title: 'Ein Sturm zieht auf',
    text: 'Schwarze Wolken türmen sich auf. Mitten hindurch wäre schneller und eine harte Schule.',
    choices: [
      { label: 'Mitten durch', hint: '-15 % Leben, +14 Erfahrung', outcome: { hurt: 0.15, xp: 14 },
        text: 'Der Sturm war hart, aber die Crew hat viel gelernt.' },
      { label: 'Ausweichen', hint: 'Nichts passiert', outcome: {}, text: 'Ihr umfahrt den Sturm in sicherem Abstand.' }
    ]
  },
  {
    id: 'seekoenig', title: 'Ein Seekönig taucht auf!',
    text: 'Ein riesiges Seeungeheuer versperrt den Weg. In seinem Bauch sollen Schätze liegen.',
    choices: [
      { label: 'Angreifen', hint: '55 %: epischer Schatz, sonst -30 % Leben',
        outcome: { chance: 0.55, win: { relic: 2 }, lose: { hurt: 0.3 } },
        text: 'Der Kampf gegen den Seekönig ist vorbei.' },
      { label: 'Fliehen', hint: 'Nichts passiert', outcome: {}, text: 'Mit vollen Segeln entkommt ihr.' }
    ]
  },
  {
    id: 'haendler', title: 'Ein Händlerschiff',
    text: 'Ein fröhlicher Händler winkt euch heran. Er hat seltsame Früchte an Bord.',
    choices: [
      { label: 'Handeln', hint: '-40 Berry, Teufelsfrucht wählen', outcome: { berry: -40, pick: 'fruit' }, text: 'Ihr handelt mit dem Händler.' },
      { label: 'Plaudern', hint: '+8 Erfahrung', outcome: { xp: 8 }, text: 'Der Händler erzählt Geschichten von der Grand Line.' }
    ]
  },
  {
    id: 'flaschenpost', title: 'Eine Flaschenpost',
    text: 'In der Flasche steckt eine alte Trainingsanleitung eines berühmten Kämpfers.',
    choices: [
      { label: 'Lesen', hint: 'Kapitän +2 Statuspunkte', outcome: { points: 2 }, text: 'Dein Kapitän lernt ein paar neue Tricks.' },
      { label: 'Verkaufen', hint: '+25 Berry', outcome: { berry: 25 }, text: 'Ein Sammler zahlt 25 Berry dafür.' }
    ]
  },
  {
    id: 'schiffbruch', title: 'Ein Schiffbrüchiger',
    text: 'Auf einem Floß klammert sich jemand an ein Fass und winkt verzweifelt.',
    choices: [
      { label: 'An Bord holen', hint: 'Crewmitglied wählen', outcome: { pick: 'recruit' }, text: 'Ihr rettet den Schiffbrüchigen.' },
      { label: 'Versorgen und weiter', hint: '+15 Berry Belohnung', outcome: { berry: 15 }, text: 'Er bedankt sich mit 15 Berry.' }
    ]
  },
  {
    id: 'quelle', title: 'Insel mit Quelle',
    text: 'Eine kleine Insel mit klarem Wasser und Palmen. Im Dickicht glitzert etwas.',
    choices: [
      { label: 'Ausruhen', hint: 'Crew heilt 30 %', outcome: { heal: 0.3 }, text: 'Die Crew ruht sich aus.' },
      { label: 'Erkunden', hint: '50 %: Schatz, sonst nichts', outcome: { chance: 0.5, win: { relic: 0 }, lose: {} },
        text: 'Ihr durchsucht die Insel.' }
    ]
  },
  {
    id: 'muschel', title: 'Etwas glitzert im Wasser',
    text: 'Eine seltsame Muschel treibt neben dem Schiff. Vielleicht ein Dial aus den Himmelsinseln?',
    choices: [
      { label: 'Tauchen', hint: '60 %: seltener Schatz, sonst -10 % Leben', outcome: { chance: 0.6, win: { relic: 1 }, lose: { hurt: 0.1 } },
        text: 'Ihr taucht nach der Muschel.' },
      { label: 'Weitersegeln', hint: 'Nichts passiert', outcome: {}, text: 'Die Muschel versinkt in der Tiefe.' }
    ]
  },
  {
    id: 'party', title: 'Party an Deck!',
    text: 'Die Crew hat Lust auf Fleisch, Musik und Sake. Ein Abend Pause würde allen guttun.',
    choices: [
      { label: 'Feiern', hint: 'Crew heilt 20 %, +10 Erfahrung', outcome: { heal: 0.2, xp: 10 }, text: 'Was für eine Nacht! Alle sind gut gelaunt.' },
      { label: 'Trainieren', hint: 'Kapitän +2 Statuspunkte', outcome: { points: 2 }, text: 'Statt zu feiern wird hart trainiert.' }
    ]
  },
  {
    id: 'kontrolle', title: 'Marine-Kontrolle',
    text: 'Ein Marineschiff fordert euch auf beizudrehen. Der Kapitän sieht bestechlich aus.',
    choices: [
      { label: 'Bestechen', hint: '-30 Berry', outcome: { berry: -30 }, text: 'Die Marine sieht in die andere Richtung.' },
      { label: 'Durchbrechen', hint: '-15 % Leben, +16 Erfahrung', outcome: { hurt: 0.15, xp: 16 }, text: 'Mit Kanonendonner geht es durch die Blockade.' }
    ]
  },
  {
    id: 'kartograf', title: 'Ein alter Kartenzeichner',
    text: 'Auf einer Felsinsel sitzt ein Mann mit Seekarten. Er bietet einen Tausch an.',
    choices: [
      { label: 'Karte kaufen', hint: '-25 Berry, Schatz wählen', outcome: { berry: -25, pick: 'treasure' }, text: 'Die Karte führt zu einem Versteck.' },
      { label: 'Zuhören', hint: '+6 Erfahrung, +15 Berry', outcome: { xp: 6, berry: 15 }, text: 'Er erzählt vom One Piece und schenkt euch ein paar Münzen.' }
    ]
  }
];
