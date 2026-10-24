// Meere in der Reihenfolge, in der sie besucht werden. Jedes Meer besteht aus zwei Insel-Kapiteln
// immer gleich: erst eine kleine Insel (am Ende wartet ihr Bösewicht), dann eine große Insel
// (am Ende wartet der Boss des Meeres). Vor jedem Kapitel wählt man den Kurs: welche Insel als Nächstes?
//
//   small: kleine Inseln, pro Run werden 2 davon zur Wahl gestellt
//          villain = Bösewicht am Ende (id aus hunted.js), places = Orte auf der Insel (eine Reihe pro Ort)
//   big:   große Inseln, boss = id aus enemies.js (GL.data.bosses), beide stehen zur Wahl
//   villains = Kopfgeld-Ziele, die auf dieser Insel unterwegs sein können
//   lair = Name des letzten Orts (Kampf gegen den Bösewicht bzw. Boss)
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.islands = [
  { id: 'east-blue', name: 'Ostmeer', bosses: ['smoker', 'arlong'],
    tagline: 'Das ruhigste Meer der Welt. Hier kennt jeder jeden, sogar die Möwen.',
    small: [
      { id: 'shells-town', name: 'Zollhafen', villain: 'morgan', lair: 'Wachhaus am Pier',
        text: 'Ein Hafen mit mehr Schranken als Schiffen. Die Kronwacht verzollt hier sogar das Wetter.', places: ['Hafen', 'Zollgasse'], bias: ['battle'] },
      { id: 'orange-town', name: 'Gauklerbucht', villain: 'buggy', lair: 'Großes Zelt',
        text: 'Die Stadt ist leer, nur die Zeltstangen klappern. Eine Narrenbande hat sich einquartiert und verlangt Applaus.', places: ['Leere Gassen', 'Tierladen'], bias: ['recruit'] },
      { id: 'syrup', name: 'Honigtal', villain: 'kuro', lair: 'Herrenhaus am Hang',
        text: 'Ein Dorf, in dem nachmittags alle schlafen. Nur im Herrenhaus brennt nachts noch verdächtig lange Licht.', places: ['Küstenhang', 'Dorfplatz'], bias: ['rest'] },
      { id: 'baratie', name: 'Suppenkahn', villain: 'krieg', lair: 'Kombüsendeck',
        text: 'Ein Wirtshaus auf dem Wasser. Hungrige Piraten zahlen hier mit Ärger statt mit Talern.', places: ['Offene See', 'Küche'], bias: ['rest', 'fruit'] },
      // Remix (Großer Neustart): zwei neue Inseln im East Blue
      { id: 'gecko-klippen', name: 'Dämmerklippe', villain: 'jango', lair: 'Pendelfelsen',
        text: 'Steile Felsen im Abendrot. Wer hier zu lange aufs Meer starrt, schläft im Stehen ein.', places: ['Pendelpfad', 'Leuchtfeuer'], bias: ['fruit', 'rest'] },
      { id: 'eisenbucht', name: 'Rostbucht', villain: 'gin', lair: 'Rostiges Wrack',
        text: 'Eine Bucht voller Schiffswracks. Im Rost lauert jemand, der seit Tagen nichts gegessen hat und entsprechend gelaunt ist.', places: ['Wrackfeld', 'Ankerfriedhof'], bias: ['elite', 'battle'] }
    ],
    big: [
      { id: 'loguetown', name: 'Salzhafen', boss: 'smoker', lair: 'Glockenplatz', villains: ['buggy', 'pearl', 'morgan'], bias: ['recruit'],
        text: 'Der letzte große Hafen vor der Strömung. Wer hier ablegt, kommt anders zurück, falls überhaupt.', places: ['Hafenviertel', 'Marktplatz'] },
      { id: 'arlong-park', name: 'Flossenriff', boss: 'arlong', lair: 'Riff-Festung', villains: ['hatchan', 'pearl', 'chew'], bias: ['battle'],
        text: 'Eine Bande aus der Tiefe hat die Dörfer am Riff besetzt. Sie verlangt Zoll in Muscheln, und zwar in großen.', places: ['Palmendorf', 'Zitronenhain'] }
    ] },

  { id: 'paradies', name: 'Wilde See', bosses: ['crocodile', 'enel'],
    tagline: 'Sand, Wolken und Dschungel. Hier ist das Wetter die lauteste Figur an Bord.',
    small: [
      { id: 'whisky-peak', name: 'Feierspitze', villain: 'mr9', lair: 'Festhalle',
        text: 'Die Bewohner feiern jeden Piraten, der anlegt. Zu freundlich, um wahr zu sein.', places: ['Willkommenstor', 'Lampiongasse'], bias: ['recruit'] },
      { id: 'little-garden', name: 'Urwaldkap', villain: 'mr3', lair: 'Moosige Hütte',
        text: 'Ein Dschungel, in dem die Bäume älter sind als jede Seekarte. Irgendwo grollt es seit hundert Jahren.', places: ['Urwald', 'Knochenlichtung'], bias: ['fruit'] },
      { id: 'drumm', name: 'Frostspitze', villain: 'wapol', lair: 'Gipfelburg',
        text: 'Eine Winterinsel ohne Ärzte, aber mit sehr viel Schnee. Oben auf dem Gipfel friert jemand beleidigt vor sich hin.', places: ['Schneefeld', 'Eisdorf'], bias: ['rest'] },
      { id: 'jaya', name: 'Spötterküste', villain: 'bellamy', lair: 'Großmaul-Taverne',
        text: 'Hier lacht man über jeden, der noch träumt. Am lautesten lachen die, die nie abgelegt haben.', places: ['Küstenwald', 'Tavernenviertel'], bias: ['treasure'] },
      // Remix: der Eingang zur Strömung als eigene Insel
      { id: 'zwillingskap', name: 'Walkap', villain: 'mr4', lair: 'Leuchtturm am Kap',
        text: 'Hier biegt die Strömung bergauf ab. Ein Riesenwal schwimmt seit Jahren gegen den Fels, und am Leuchtturm wartet Ärger mit Zündschnur.', places: ['Walbauch', 'Steilstrom'], bias: ['fruit', 'rest'] }
    ],
    big: [
      { id: 'alabasta', name: 'Glutwüste', boss: 'crocodile', lair: 'Sonnenpalast', villains: ['mr1', 'mr4', 'zala'], bias: ['treasure'],
        text: 'Ein Wüstenkönigreich, in dem es seit Jahren nicht geregnet hat. Ein Sandsturm zieht durchs Land, und er hat einen Besitzer.', places: ['Dünenmeer', 'Spielstadt'] },
      { id: 'skypiea', name: 'Wolkenhof', boss: 'enel', lair: 'Himmelstempel', villains: ['ohm'], bias: ['fruit'],
        text: 'Eine Insel auf den Wolken, an nichts festgebunden. Wer hier oben das Wetter macht, hält sich für unfehlbar.', places: ['Wolkenmeer', 'Sonnenstrand'] }
    ],
    // Zweite Route für das zweite Meer (ab Rang 12, feature 'route2'): zehntausend Meter unter dem Meer
    alt: { id: 'fischmenschen', name: 'Tiefsee', feature: 'route2', bosses: ['hody', 'vander'],
      tagline: 'Tief unter der Strömung, in einer Blase aus Licht. Das Flossenvolk mag Gäste, nur nicht alle.',
      small: [
        { id: 'tiefsee', name: 'Laternengrund', villain: 'hyouzou', lair: 'Wrack im Dunkeln',
          text: 'Je tiefer das Schiff sinkt, desto dunkler wird es. Im Wrack wartet jemand mit sehr scharfem Werkzeug.', places: ['Laternenfische', 'Sinkende Blase'] },
        { id: 'korallenhuegel', name: 'Korallengasse', villain: 'zeo', lair: 'Korallentor',
          text: 'Bunte Korallen und Cafés mit Meerblick von unten. Hier verschwinden ständig Dinge, und niemand sieht, wer.', places: ['Blasenstraße', 'Muschelcafé'] },
        { id: 'fischmenschen-viertel', name: 'Flossenviertel', villain: 'daruma', lair: 'Verlassene Gasse',
          text: 'Ein vergessenes Viertel am Rand der Blase. Unter dem Pflaster gräbt sich einer durch den Boden.', places: ['Muschelmarkt', 'Alte Brunnen'] },
        { id: 'meerwald', name: 'Tangwald', villain: 'dosun', lair: 'Lichtung der Wurzeln',
          text: 'Ein stiller Wald aus Licht und Seetang. Ein Hai mit Hammerkopf bewacht den Weg und nimmt das sehr ernst.', places: ['Leuchtwurzeln', 'Schiffsfriedhof'] }
      ],
      big: [
        { id: 'gyoncorde', name: 'Perlenplatz', boss: 'hody', lair: 'Vor dem Palast', villains: ['ikaros', 'dosun'],
          text: 'Der große Platz der Tiefe. Ein Hai mit Groll im Herzen will hier Reden halten, die keiner hören will.', places: ['Flossenstraße', 'Tribünen'] },
        { id: 'ryugu', name: 'Blasenpalast', boss: 'vander', lair: 'Über dem Palast', villains: ['ikaros', 'zeo'],
          text: 'Der Palast des Flossenvolks in einer Riesenblase. Über ihm hängt ein Schiff, das da nicht hingehört.', places: ['Muschelhalle', 'Palastgarten'] }
      ] } },

  { id: 'enies-lobby', name: 'Gerichtsinsel', bosses: ['rob-lucci', 'kaku'],
    tagline: 'Der Amtssitz der Krone. Für alles gibt es ein Formular, für die Rückfahrt keins.',
    small: [
      { id: 'long-ring', name: 'Windebene', villain: 'foxy', lair: 'Wettkampfarena',
        text: 'Ein flaches Land, über das ständig der Wind pfeift. Eine Bande fordert zum Crew-Wettkampf, Einsatz: ein Mitglied.', places: ['Grasebene', 'Festplatz'] },
      { id: 'water-7', name: 'Messinghafen', villain: 'fukuro', lair: 'Große Werft',
        text: 'Die Stadt der Schiffsbauer, alles glänzt nach Messing. Hinter den Kulissen tragen ein paar Arbeiter zu saubere Schuhe.', places: ['Kanäle', 'Bastlerhaus'] },
      { id: 'puffing-tom', name: 'Meeresbahn', villain: 'nero', lair: 'Lokomotive',
        text: 'Ein Zug, der übers Meer fährt, mitten durch den Sturm. Die Waggons sind voller Kronwacht, alle mit Fahrkarte.', places: ['Letzter Waggon', 'Mittelwagen'] },
      { id: 'enies-gate', name: 'Aktentor', villain: 'spandam', lair: 'Stempelhalle',
        text: 'Das Haupttor der Gerichtsinsel. Wer rein will, braucht drei Stempel, wer raus will, vier.', places: ['Haupttor', 'Amtsgasse'] }
    ],
    big: [
      { id: 'tower', name: 'Siegelturm', boss: 'rob-lucci', lair: 'Turmspitze', villains: ['jabra', 'wanze', 'blueno'],
        text: 'Der höchste Turm der Krone. Ganz oben wartet ihr bester Agent und hat dafür extra den Feierabend verschoben.', places: ['Gerichtssaal', 'Treppenhaus'] },
      { id: 'tor', name: 'Brückentor', boss: 'kaku', lair: 'Torbogen', villains: ['blueno', 'wanze', 'jabra'],
        text: 'Der Weg führt über die Dächer bis zum großen Tor. Wer es passiert, hat keine Akte mehr, nur noch Gegner.', places: ['Brücke', 'Dachgarten'] }
    ],
    // Zweite Route für das dritte Meer (ab Rang 8, siehe features.js): Beim Kurs setzen steht dann
    // eine Insel aus jeder Route zur Wahl. Die Wahl entscheidet, welches Meer man befährt.
    alt: { id: 'thriller-bark', name: 'Gruselmeer', feature: 'route', bosses: ['moria', 'kuma'],
      tagline: 'Nebel, Spuk und Pilzwälder. Die Geister sind höflich, nur ihr Herr nicht. Dahinter liegt der Spiegel-Archipel.',
      small: [
        { id: 'florian', name: 'Nebelkap', villain: 'absalom', lair: 'Nebelwand',
          text: 'Ein Nebel, der nie aufzieht. Wer hier verschwindet, schickt höchstens noch eine sehr höfliche Postkarte.', places: ['Nebelbank', 'Geisterschiff'] },
        { id: 'grusel-garten', name: 'Pilzwald', villain: 'perona', lair: 'Spukturm',
          text: 'Kleine Geister schweben durch die Pilze und entschuldigen sich, wenn sie jemanden erschrecken. Mutlos wird man trotzdem.', places: ['Friedhof', 'Leuchtpilze'] },
        { id: 'hogback-labor', name: 'Nadelkeller', villain: 'hogback', lair: 'Flickstube',
          text: 'Ein Arzt näht hier Gespenster zusammen. Sie stehen immer wieder auf und bedanken sich jedes Mal.', places: ['Kellergang', 'Kühlhaus'] },
        { id: 'mangroven', name: 'Wurzelmoor', villain: 'duval', lair: 'Blasenpark',
          text: 'Seifenblasen steigen aus den Wurzeln. Eine Bande mit Eisenmaske lauert und hält sich für unwiderstehlich.', places: ['Wurzelpfad', 'Blasenufer'] }
      ],
      big: [
        { id: 'thriller-schloss', name: 'Spukschloss', boss: 'moria', lair: 'Thronsaal', villains: ['absalom', 'hogback'],
          text: 'Ein Schloss, so groß wie ein Schiff, das im Nebel treibt. Sein Herr sammelt Schatten wie andere Briefmarken.', places: ['Schlosshof', 'Tanzsaal'] },
        { id: 'sabaody', name: 'Spiegel-Archipel', boss: 'kuma', lair: 'Großer Markt', villains: ['duval', 'perona'],
          text: 'Ein Wald aus Seifenblasen, in dem alle Banden der Welt einkaufen. Hier gibt es alles, außer Ruhe. Ein stiller Riese räumt den Weg frei.', places: ['Blasenwald', 'Markt aller Meere'] }
      ] } }
];
// Insel-Twists (Großer Neustart): jedes Insel-Kapitel bekommt aus dem Seed eine kleine Sonderregel,
// damit sich kein Run wie der letzte anfühlt. Ohne Zufallszug (Replays bleiben gleich), siehe GL.run.twist.
//   types = zusätzliche Orte im Kartentopf, foeSpd = Tempo der Gegner, foeKinds = Extra-Chance auf besondere Gegner
GL.data.twists = [
  { id: 'markttag',   icon: '🏮', name: 'Markttag',        text: 'Mehr Tavernen auf der Karte. Heute ist viel los im Hafen.', types: ['recruit', 'recruit'] },
  { id: 'kopfgeld',   icon: '📜', name: 'Steckbrief-Woche', text: 'Mehr Kopfgeldjäger unterwegs: starke Gegner, dafür mehr Schätze.', types: ['elite', 'elite'] },
  { id: 'schatzinsel', icon: '💎', name: 'Schatzinsel',    text: 'Mehr Schatztruhen und Teufelsfrüchte auf der Karte.', types: ['treasure', 'fruit'] },
  { id: 'patrouille', icon: '⚓', name: 'Kronwacht-Razzia',    text: 'Mehr besondere Gegner: Leibwachen, Sanitäter, Raufbolde.', types: ['battle'], foeKinds: 0.18 },
  { id: 'ruhig',      icon: '🌙', name: 'Stille Bucht',     text: 'Mehr Rastplätze, alle Gegner sind 1 Tempo langsamer.', types: ['rest'], foeSpd: -1 },
  { id: 'sturm',      icon: '🌊', name: 'Sturmflut',        text: 'Alle Gegner sind 1 Tempo schneller, dafür treiben mehr Früchte an.', types: ['fruit', 'fruit'], foeSpd: 1, weather: 'storm' },
  // Wetter und Lage (Lage & Wetter): goldX = mehr/weniger Gold nach Siegen, restAdd = Rast heilt mehr/weniger, foeHp = Gegner-Leben
  { id: 'regen',      icon: '🌧', name: 'Dauerregen',       text: 'Rutschiges Deck: Gegner 1 Tempo langsamer. Die Decken sind nass, Rast heilt weniger.', foeSpd: -1, restAdd: -0.1, weather: 'rain',
    en: ['Endless rain', 'Slippery deck: enemies 1 speed slower. The blankets are wet, resting heals less.'] },
  { id: 'nebel',      icon: '🌫', name: 'Dichter Nebel',    text: 'Im Nebel findet man Dinge. Und Dinge finden einen: mehr Schätze, mehr besondere Gegner.', types: ['treasure'], foeKinds: 0.12, weather: 'fog',
    en: ['Thick fog', 'In the fog you find things. And things find you: more treasure, more special enemies.'] },
  { id: 'hitze',      icon: '☀', name: 'Hitzewelle',       text: 'Alle schwitzen, die Gegner am meisten: 8 % weniger Leben. Dafür gibt es weniger Gold, keiner will arbeiten.', foeHp: -0.08, goldX: -0.2,
    en: ['Heatwave', 'Everyone sweats, enemies most of all: 8% less health. Less gold, though, nobody wants to work.'] },
  { id: 'vollmond',   icon: '🌕', name: 'Vollmond',         text: 'Die Gegner sind gereizt (+8 % Leben), mehr Kopfgeldjäger. Wer gewinnt, kassiert 25 % mehr Gold.', foeHp: 0.08, goldX: 0.25, types: ['elite'], time: 'night',
    en: ['Full moon', 'Enemies are grumpy (+8% health), more bounty hunters. Winners earn 25% more gold.'] },
  { id: 'marktfest',  icon: '🎪', name: 'Marktfest',        text: 'Überall Stände: mehr Tavernen und 20 % mehr Gold nach Siegen. Die Taschendiebe sind auch da.', types: ['recruit'], goldX: 0.2,
    en: ['Market fair', 'Stalls everywhere: more taverns and 20% more gold after wins. The pickpockets came too.'] },
  { id: 'schnee',     icon: '❄', name: 'Schneegestöber',   text: 'Alle frieren: Gegner 1 Tempo langsamer, aber dick eingepackt (+6 % Leben).', foeSpd: -1, foeHp: 0.06, weather: 'snow',
    en: ['Snow flurry', 'Everyone is freezing: enemies 1 speed slower, but well wrapped up (+6% health).'] },
  { id: 'gewitter',   icon: '⛈', name: 'Gewitter',         text: 'Blitze über dem Meer: Gegner 1 Tempo schneller, aber die Beute glänzt (+30 % Gold).', foeSpd: 1, goldX: 0.3, weather: 'storm',
    en: ['Thunderstorm', 'Lightning over the sea: enemies 1 speed faster, but the loot shines (+30% gold).'] },
  { id: 'moewen',     icon: '🐦', name: 'Möwenplage',       text: 'Die Möwen klauen Kleingeld (−15 % Gold), lassen aber Früchte fallen. Kalle bestreitet alles.', goldX: -0.15, types: ['fruit'],
    en: ['Gull plague', 'Gulls steal small change (−15% gold) but drop fruit. Kalle denies everything.'] },
  { id: 'abendrot',   icon: '🌅', name: 'Abendrot',         text: 'Ein schöner Abend. Rast heilt mehr, und keiner hat Lust auf Streit.', restAdd: 0.12, types: ['rest'], time: 'dusk',
    en: ['Red sky at night', 'A lovely evening. Resting heals more and nobody fancies a fight.'] },
  null, null, null
];
// Daten eines Meeres im Run (berücksichtigt die gewählte Route)
GL.data.seaOf = (run, idx) => { const S = GL.data.islands[idx]; return S && S.alt && run && run.alt && run.alt[idx] ? S.alt : S; };
// Ist die zweite Route dieses Meeres im Run offen? Meer 2 (Gruselmeer) = run.altOpen, Meer 1 (Tiefsee) = run.altOpen1.
// Alte Spielstände kennen altOpen1 nicht -> false, damit ihre Würfe gleich bleiben.
GL.data.altOpen = (run, idx) => { const S = GL.data.islands[idx]; if (!S || !S.alt || !run) return false; return S.alt.feature === 'route2' ? !!run.altOpen1 : !!run.altOpen; };

// Texte für die Routen-Knoten auf der Karte
GL.data.nodes = {
  battle:   { title: 'Kronwacht-Streife',  text: 'Kampf gegen Soldaten und Piraten.' },
  elite:    { title: 'Kopfgeldjäger',      text: 'Starker Gegner, dafür gibt es einen Schatz.' },
  recruit:  { title: 'Taverne',            text: 'Neue Crewmitglieder mit Gold anheuern.' },
  fruit:    { title: 'Teufelsfrucht',      text: 'Wähle 1 von 3.' },
  treasure: { title: 'Schatztruhe',        text: 'Wähle 1 von 3 Schätzen. Sie wirken den ganzen Run.' },
  rest:     { title: 'Rast an Land',       text: 'Heilt alle um 40 %.' },
  boss:     { title: 'Inselboss',          text: 'Besiege ihn für Kopfgeld und Erwachen.' },
  raid:     { title: 'Raid',               text: 'Extrem starker Gegner. Sieg: epische Teufelsfrucht für immer. Niederlage beendet den Run nicht.' }
};
