// Ereignisse auf See: tauchen gelegentlich zwischen zwei Etappen auf (config.eventChance).
// Jede Wahl hat ein Ergebnis (outcome). Mögliche Ergebnisse:
//   { berry: 30 }                     Berry, die am Ende des Runs dazukommen
//   { gold: 10 }                      Gold für die Taverne (nur in diesem Run)
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
  },
  {
    id: 'flaschenpost', title: 'Flaschenpost',
    text: 'Eine Flasche treibt am Bug vorbei. Darin eine Karte mit einem Kreuz und ein paar Münzen.',
    choices: [
      { label: 'Münzen nehmen', hint: '+12 Gold', outcome: { gold: 12 }, text: 'Die Münzen klimpern in der Bordkasse.' },
      { label: 'Dem Kreuz folgen', hint: '50 %: seltener Schatz, sonst nichts', outcome: { chance: 0.5, win: { relic: 1 }, lose: {} },
        text: 'Ihr folgt der Karte bis zur markierten Stelle.' }
    ]
  },
  {
    id: 'marktschiff', title: 'Ein schwimmender Markt',
    text: 'Händler auf einem bunten Floß bieten Proviant und Waffen an. Für Gold natürlich.',
    choices: [
      { label: 'Proviant kaufen', hint: '-10 Gold, Crew heilt 35 %', outcome: { gold: -10, heal: 0.35 }, text: 'Satt und zufrieden geht es weiter.' },
      { label: 'Training buchen', hint: '-10 Gold, +16 Erfahrung', outcome: { gold: -10, xp: 16 }, text: 'Ein alter Haudegen zeigt euch ein paar Tricks.' },
      { label: 'Weitersegeln', hint: 'Nichts passiert', outcome: {}, text: 'Ihr winkt den Händlern zu.' }
    ]
  },
  {
    id: 'kopfgeldplakat', title: 'Ein Kopfgeld-Plakat',
    text: 'An einer Boje hängt ein Steckbrief. Es ist euer Kapitän! Jemand hat das Kopfgeld erhöht.',
    choices: [
      { label: 'Stolz aufhängen', hint: '+2 Statuspunkte für den Kapitän', outcome: { points: 2 }, text: 'Der Kapitän platzt fast vor Stolz.' },
      { label: 'Verkaufen', hint: '+20 Gold', outcome: { gold: 20 }, text: 'Sammler zahlen gut für so ein Plakat.' }
    ]
  },
  {
    id: 'wettangeln', title: 'Wettangeln mit Fischern',
    text: 'Ein Fischerboot fordert euch zum Wettangeln heraus. Der Einsatz: Gold.',
    choices: [
      { label: 'Mitmachen', hint: '55 %: +25 Gold, sonst -10 Gold', outcome: { chance: 0.55, win: { gold: 25 }, lose: { gold: -10 } },
        text: 'Die Angeln sind eingeholt.' },
      { label: 'Ablehnen', hint: 'Nichts passiert', outcome: {}, text: 'Ihr lasst die Fischer in Ruhe.' }
    ]
  },
  {
    id: 'wildschweine', title: 'Wildschweine am Strand',
    text: 'Beim Wasserholen stürmt eine Rotte Wildschweine aus dem Dickicht. Sanji würde sagen: Abendessen!',
    choices: [
      { label: 'Jagen', hint: '60 %: ganze Crew heilt 30 %, sonst -10 % Leben', outcome: { chance: 0.6, win: { heal: 0.3 }, lose: { hurt: 0.1 } },
        text: 'Die Jagd ist vorbei. Am Feuer wird erzählt, was passiert ist.' },
      { label: 'Leise zurückziehen', hint: '+6 Erfahrung', outcome: { xp: 6 }, text: 'Ihr schleicht zurück zum Schiff und lernt dabei, leise zu sein.' }
    ]
  },
  {
    id: 'krabbenmarkt', title: 'Schwimmender Krabbenmarkt',
    text: 'Ein Händler auf einem riesigen Krabbenpanzer winkt euch heran. Er hat Gold und Gerüchte.',
    choices: [
      { label: 'Handeln', hint: '+12 Gold', outcome: { gold: 12 }, text: 'Der Krabbenhändler zahlt fair: 12 Gold für eure alten Seile.' },
      { label: 'Gerüchte hören', hint: 'Schatz wählen', outcome: { pick: 'treasure' }, text: 'Das Gerücht führt zu einer versteckten Kiste.' }
    ]
  },
  {
    id: 'moewenpost', title: 'Die Möwenpost bringt Zeitung',
    text: 'Eine Möwe mit Mütze landet an Deck. In der Zeitung: Steckbriefe, und euer Kapitän ist auch drin!',
    choices: [
      { label: 'Zeitung kaufen', hint: '-3 Gold, +2 Statuspunkte', outcome: { gold: -3, points: 2 }, text: 'Stolz auf den Steckbrief trainiert der Kapitän doppelt so hart.' },
      { label: 'Möwe füttern', hint: '+20 Berry', outcome: { berry: 20 }, text: 'Die Möwe lässt aus Dank ein paar Münzen fallen.' }
    ]
  },
  {
    id: 'nebelschiff', title: 'Ein Geisterschiff im Nebel',
    text: 'Im dichten Nebel taucht ein zerfallenes Schiff auf. Von Deck klingt leise Geigenmusik.',
    choices: [
      { label: 'An Bord gehen', hint: '50 %: seltener Schatz, sonst Furcht kostet 15 % Leben', outcome: { chance: 0.5, win: { relic: 1 }, lose: { hurt: 0.15 } },
        text: 'Der Nebel lichtet sich, das Geisterschiff ist verschwunden.' },
      { label: 'Abdrehen', hint: 'Nichts passiert', outcome: {}, text: 'Ihr dreht ab. Die Musik verklingt hinter euch.' }
    ]
  },
  {
    id: 'flaschenpost', title: 'Flaschenpost',
    text: 'Eine Flasche schaukelt neben dem Bug. Darin eine Karte mit einem roten Kreuz.',
    choices: [
      { label: 'Der Karte folgen', hint: 'Teufelsfrucht wählen', outcome: { pick: 'fruit' }, text: 'Am Kreuz liegt eine seltsame Frucht mit Wirbelmuster.' },
      { label: 'Für später aufheben', hint: '+25 Berry', outcome: { berry: 25 }, text: 'Ein Sammler im Hafen zahlt gut für alte Karten.' }
    ]
  }
];
