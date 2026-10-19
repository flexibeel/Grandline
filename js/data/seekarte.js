// DUNGEON-SUCHE: Seekarte der Gerüchte. Landgang-Orte liegen versteckt auf einer Karte pro Meer.
// Man segelt vom Hafen los, der Nebel lichtet sich dauerhaft, Hinweise führen zu den Orten.
// Gefundene Orte bleiben markiert und starten den bekannten Landgang (js/ui/dungeon.js).
// Regeln: js/engine/seekarte.js · Anzeige: js/ui/seekarte.js · Texte als [deutsch, englisch]
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.seekarte = {
  cfg: {
    cols: 8, rows: 9,       // eine Karte, eigene Welt (hochkant, passt aufs Handy)
    home: [0, 8],           // Hafen unten links
    prov: 6,                // Proviant pro Fahrt (1 pro Zug). Zurück im Hafen wieder voll.
    reach: 2,               // so weit segelt das Schiff pro Zug (in alle Richtungen)
    finds: 3,               // Treibgut pro Fahrt
    see: 3,                 // so weit sieht man Boss-Silhouetten durch den Nebel
    event: 0.3              // Chance auf ein Ereignis auf See pro Zug (wenn kein Treibgut)
  },
  // Wo die Orte liegen (Spalte, Reihe). Fest, damit die Karte für alle gleich ist.
  spots: {
    zirkus: [3, 6], graeber: [1, 3], ruinen: [4, 3], drumm: [6, 4], koralle: [7, 7],
    kanaele: [1, 1], impel: [4, 1], gruft: [6, 2]
  },
  // Gebiete mit eigenem Charakter (eine Zeile pro Kartenreihe, ein Buchstabe pro Feld)
  map: ['NNNNNNNN', 'NNNNNNNN', 'NNNNNNNN', 'SSSSKKKK', 'SSSSKKKK', 'BBBBKKKK', 'BBBBBBTT', 'BBBBBBTT', 'BBBBBBTT'],
  regions: {
    B: { id: 'bucht', label: [2, 7], sea: ['#56b3a3', '#4fab9b'], name: ['Ruhige Bucht', 'Quiet Bay'],
      text: ['So ruhig, dass selbst Lysop hier mutig wird. Kurz.', 'So calm even Lysop gets brave here. Briefly.'], deco: 'palm' },
    S: { id: 'sand', label: [2, 4], sea: ['#6cb7a0', '#78bca0'], name: ['Sandmeer', 'Sand Sea'],
      text: ['Das Wasser schmeckt nach Wüste. Niemand weiß, wie Wasser nach Wüste schmecken kann.', 'The water tastes of desert. Nobody knows how water can taste of desert.'], deco: 'cactus' },
    K: { id: 'frost', label: [5, 3], sea: ['#7db6cf', '#8cc2d8'], name: ['Frostwolken-See', 'Frostcloud Sea'],
      text: ['Oben Wolken, unten Eis, dazwischen ihr. Mütze auf.', 'Clouds above, ice below, you in between. Hat on.'], deco: 'berg' },
    T: { id: 'tief', label: [6, 6], sea: ['#2f6f8f', '#2a6584'], name: ['Tiefseegraben', 'Deep Trench'],
      text: ['Hier ist das Meer so tief, dass unten jemand anderes wohnt.', 'The sea is so deep here that someone else lives at the bottom.'], deco: 'kelp' },
    N: { id: 'nebel', label: [2, 0], sea: ['#5b7f86', '#56777e'], name: ['Nebelmeer', 'Sea of Mist'],
      text: ['Wilde Gewässer. Die Möwen fliegen hier lieber zu zweit.', 'Wild waters. Even the gulls fly in pairs here.'], deco: 'rock' }
  },
  // Kleine Deko-Inseln (ohne Spielwirkung), damit jedes Gebiet anders aussieht
  isles: [[1, 7, 'palm'], [5, 8, 'palm'], [0, 4, 'cactus'], [3, 4, 'cactus'], [5, 5, 'berg'], [7, 3, 'berg'], [6, 8, 'kelp'], [0, 0, 'rock'], [7, 0, 'rock'], [2, 2, 'rock']],
  // Ereignisse auf See (beim Segeln, wenn kein Treibgut da ist). w = Gewicht, more = Gebiet, in dem es öfter passiert
  events: {
    delfine:   { w: 3, more: 'B', name: ['Delfine', 'Dolphins'], text: ['Delfine schieben das Schiff ein Stück. Gratis. Verdächtig. +1 Proviant.', 'Dolphins push the ship along. For free. Suspicious. +1 supply.'] },
    strudel:   { w: 2, more: 'T', name: ['Strudel', 'Whirlpool'], text: ['Ein Strudel dreht das Schiff einmal im Kreis und spuckt es woanders aus. Die Karte freut sich.', 'A whirlpool spins the ship around and spits it out elsewhere. The chart is delighted.'] },
    moewe:     { w: 2, more: 'N', name: ['Schwatzmöwe', 'Gossip gull'], text: ['Eine Möwe landet auf dem Mast und erzählt Dinge. Eines davon ist nützlich.', 'A gull lands on the mast and talks. One thing it says is useful.'] },
    seekoenig: { w: 1, more: 'T', name: ['Seekönig', 'Sea king'], text: ['Ein Seekönig taucht auf, gähnt und spuckt ein paar Münzen aus. Dann taucht er wieder ab. Ein guter Tag.', 'A sea king surfaces, yawns and spits out a few coins. Then it dives again. A good day.'] },
    flaute:    { w: 2, more: 'S', name: ['Flaute', 'Doldrums'], text: ['Kein Wind. Die Crew spielt Karten. Zorro verliert und behauptet, er habe geschlafen.', 'No wind. The crew plays cards. Zorro loses and claims he was asleep.'] }
  },
  // Treibgut pro Fahrt. w = Gewicht
  kinds: {
    bottle: { w: 3, name: ['Flaschenpost', 'Message in a bottle'],
      text: ['Eine Flasche mit Brief. Briefe von Fremden enthalten meist Gerüchte oder Rechnungen.', 'A bottle with a letter. Letters from strangers usually hold rumours or bills.'] },
    wreck:  { w: 2, name: ['Wrack', 'Wreck'],
      text: ['Wer hier gesunken ist, hatte eine Karte. Jetzt hast du einen Fetzen davon.', 'Whoever sank here had a map. Now you have a scrap of it.'] },
    crate:  { w: 2, name: ['Treibende Kiste', 'Floating crate'],
      text: ['Eine Kiste ohne Absender. Finderlohn ist, was drin ist.', 'A crate with no sender. Finder’s fee is whatever’s inside.'] },
    storm:  { w: 1, name: ['Sturmwolke', 'Storm cloud'],
      text: ['Wer hier anhält, wird nass und braucht 1 Proviant extra. Drumherum segeln ist gratis.', 'Stop here and you get wet and use 1 extra supply. Sailing around is free.'] }
  },
  // Richtungen für Gerüchte (dx, dy → Wort)
  dirs: {
    n: ['im Norden', 'to the north'], s: ['im Süden', 'to the south'], o: ['im Osten', 'to the east'], w: ['im Westen', 'to the west'],
    no: ['im Nordosten', 'to the north-east'], nw: ['im Nordwesten', 'to the north-west'], so: ['im Südosten', 'to the south-east'], sw: ['im Südwesten', 'to the south-west']
  },
  far: [['gleich um die Ecke', 'just around the corner'], ['ein gutes Stück weit', 'a fair way off'], ['ziemlich weit draußen', 'quite far out']],
  // Gerüchte aus der Taverne / Flaschenpost. {d} = Richtung, {f} = Entfernung, {p} = Ort
  rumours: [
    ['Ein Fischer schwört: {d}, {f}, liegt {p}. Er schwört auch, dass sein Hering sprechen kann.', 'A fisherman swears: {d}, {f}, lies {p}. He also swears his herring can talk.'],
    ['„{p}? {d}. {f}.“ Der Wirt poliert dabei ein Glas, das davon nicht sauberer wird.', '“{p}? {d}. {f}.” The landlord polishes a glass that isn’t getting any cleaner.'],
    ['Eine alte Seefrau zeichnet mit Bier eine Karte auf den Tisch: {p}, {d}, {f}. Dann trinkt sie die Karte.', 'An old sailor draws a map in beer on the table: {p}, {d}, {f}. Then she drinks the map.']
  ],
  letters: [
    ['„Wer das liest: {p} liegt {d}, {f}. Bitte nicht weitersagen.“ Hiermit weitergesagt.', '“Whoever reads this: {p} lies {d}, {f}. Please don’t tell anyone.” Consider it told.'],
    ['Ein Liebesbrief. Hinten drauf, als Wegbeschreibung: {p}, {d}, {f}. Romantik ist tot, Navigation nicht.', 'A love letter. On the back, as directions: {p}, {d}, {f}. Romance is dead, navigation isn’t.']
  ],
  txt: {
    kicker: ['Seekarte der Gerüchte', 'Chart of Rumours'],
    title: ['Landgang-Orte suchen', 'Hunt for shore leave spots'],
    hint: ['Tippe aufs Wasser zum Segeln. Wo du warst, bleibt die Karte klar.', 'Tap the water to sail. Where you’ve been, the chart stays clear.'],
    hintTut: ['Tipp: Die Taverne im Hafen kennt ein Gerücht. Die Möwen auch, aber die reden nicht mit dir.', 'Tip: the harbour tavern knows a rumour. So do the gulls, but they won’t talk to you.'],
    prov: ['Proviant', 'Supplies'],
    provOut: ['Proviant alle. Die Crew murrt. Zurück zum Hafen, dort ist die Kombüse wieder voll.', 'Out of supplies. The crew grumbles. Back to the harbour, the galley is full again.'],
    home: ['Zurück zum Hafen', 'Back to harbour'],
    homeText: ['Im Hafen: Proviant aufgefüllt, neues Treibgut draußen. Nichts läuft weg, auch nicht die Orte.', 'In harbour: supplies refilled, new flotsam out there. Nothing runs away, the spots neither.'],
    harbour: ['Hafen', 'Harbour'],
    tavern: ['Taverne: Gerücht hören', 'Tavern: hear a rumour'],
    tavernName: ['Hafentaverne', 'Harbour tavern'],
    tavernDone: ['Der Wirt hat heute genug geredet. Nächste Fahrt wieder.', 'The landlord has talked enough. Next trip again.'],
    tavernNone: ['„Gerüchte? Hier ist alles gefunden. Trink was.“', '“Rumours? Everything around here is found. Have a drink.”'],
    compass: ['Kompass', 'Compass'],
    hot: ['heiß!', 'hot!'], warm: ['wärmer', 'warmer'], cold: ['kälter', 'colder'], same: ['lauwarm', 'lukewarm'], idle: ['zittert', 'twitches'], done: ['ruht', 'rests'],
    charted: ['erkundet', 'charted'],
    found: ['Gefunden!', 'Found!'],
    foundText: ['{p} ist ab jetzt auf deiner Karte markiert. Anlegen geht jederzeit.', '{p} is now marked on your chart. You can land any time.'],
    land: ['Anlegen', 'Go ashore'],
    sighted: ['Gesichtet', 'Sighted'],
    sightedText: ['Ein Kartenfetzen zeigt hier etwas. Hinsegeln, um den Ort zu finden.', 'A map scrap shows something here. Sail there to find the spot.'],
    loot: ['Beute', 'Loot'],
    lootGear: ['Ausrüstung', 'Gear'],
    lootShards: ['Meersplitter', 'Sea Shards'],
    lootFind: ['Fundstück', 'Keepsake'],
    boss: ['Boss', 'Boss'],
    level: ['Stufe', 'Level'],
    list: ['Liste', 'List'],
    unknown: ['{n} Gerüchte noch unentdeckt', '{n} rumours still undiscovered'],
    allFound: ['Alle Orte dieses Meeres gefunden. Die Karte ist trotzdem hübsch.', 'All spots in this sea found. The chart is still pretty.'],
    moreLater: ['Weitere Gerüchte bringen Inseln, die du im Run besuchst.', 'More rumours come from islands you visit on runs.'],
    noSea: ['Noch keine Gerüchte. Besuche Inseln im Run, dann redet man im Hafen über dich und über Orte.', 'No rumours yet. Visit islands on runs, then the harbour talks about you and about places.'],
    berry: ['+{n} Berry', '+{n} Berry'],
    scrap: ['Kartenfetzen! Ein Stück Karte ist jetzt klar, mit einem Kreuz drauf.', 'Map scrap! A piece of the chart is now clear, with a cross on it.'],
    scrapNone: ['Nur alte Seile und ein Stiefel. Der Stiefel bleibt hier.', 'Just old ropes and a boot. The boot stays.'],
    stormHit: ['Mitten im Sturm angehalten. Das war bewusst, sagt Nami. Es war nicht bewusst. −1 Proviant.', 'Stopped right in the storm. On purpose, says Nami. It was not. −1 supply.'],
    water: ['Offenes Wasser', 'Open water'],
    waterText: ['Hier ist nichts. Noch nicht mal Gerüchte.', 'Nothing here. Not even rumours.'],
    fog: ['Nebel', 'Fog'],
    fogText: ['Unbekanntes Wasser. Hinsegeln, dann weißt du mehr.', 'Uncharted water. Sail there, then you’ll know more.'],
    help: ['So geht die Seekarte', 'How the chart works'],
    helpLines: [
      ['Tippe aufs Wasser: Das Schiff segelt bis zu 2 Felder. Jeder Zug kostet 1 Proviant.', 'Tap the water: the ship sails up to 2 squares. Each move costs 1 supply.'],
      ['Wo du gesegelt bist, verschwindet der Nebel. Für immer.', 'Where you’ve sailed, the fog lifts. For good.'],
      ['Taverne, Flaschenpost und Wracks verraten, wo Orte liegen. Der Kompass sagt wärmer oder kälter. Direkt daneben anhalten = gefunden.', 'Tavern, bottles and wrecks reveal where spots are. The compass says warmer or colder. Stop right next to one = found.'],
      ['Gefundene Orte bleiben markiert. Antippen, anlegen, Landgang wie gewohnt. Proviant ist pro Fahrt, im Hafen gibt es neuen.', 'Found spots stay marked. Tap, go ashore, shore leave as usual. Supplies are per trip, the harbour refills them.']
    ],
    ok: ['Leinen los', 'Cast off'],
    migrated: ['Deine bekannten Orte sind schon eingetragen.', 'Your known spots are already marked.'],
    lair: ['Boss-Versteck', 'Boss lair'],
    looming: ['Da ragt etwas aus dem Nebel', 'Something looms in the mist'],
    loomingText: ['Eine Silhouette, eine Flagge, ein schlechtes Gefühl. Näher ran, dann weißt du mehr.', 'A silhouette, a flag, a bad feeling. Get closer to find out.'],
    locked: ['Noch zu gefährlich', 'Still too dangerous'],
    lockedText: ['Eine dunkle Insel, eine Flagge, kein Gerücht. Die Crew rudert lieber weiter. Freischalten: {n}', 'A dark island, a flag, no rumour. The crew would rather row on. Unlock: {n}'],
    waits: ['{b} wartet', '{b} is waiting'],
    away: ['{n} Züge entfernt', '{n} moves away'],
    away1: ['1 Zug entfernt', '1 move away'],
    go: ['Hinsegeln', 'Sail there'],
    clears: ['{n}× gemeistert', 'cleared {n}×'],
    marks: ['Dungeon-Marken', 'Dungeon tokens'],
    epic: ['{p} % episch', '{p} % epic'],
    you: ['Dein Schiff', 'Your ship'],
    region: ['Gebiet', 'Region']
  }
};
