// Landgang: kleine Abenteuer zum Durchklicken (wie Quests bei Shakes & Fidget), außerhalb der Runs.
// Eine Erkundung hat 3 Szenen und einen Boss-Moment. Deine Stammcrew ist dabei und redet mit.
// Ohne Energie und ohne Pflicht: Erkundungen sind jederzeit wiederholbar, die erste pro Tag
// und Ort bringt die volle Beute (inkl. Chance auf Ausrüstung und ein Fundstück).
//
//   need   = Freischaltung aus dem Profil: { isl: [Insel-ids] } (einmal besucht) oder { wins: n }
//   sea    = Meer-Index (Stärke der Beute)
//   scene  = Farben der kleinen Kopfgrafik, deco = Pixelbild (rows, c)
//   steps  = eigene Szenen (dazu kommen allgemeine aus GL.data.dungeonSteps), pro Erkundung 3 zufällig
//   Wahl:  l = Knopf, k = wer es gut kann (Typ, Rolle oder Bande), p = Grundchance,
//          ok/no = Text bei Erfolg/Pech ({who} = wer es macht), r = Beute: b Berry, s Meersplitter, g Ausrüstungs-Chance, h Mut zurück
//   find   = Fundstück: seltenes Sammelstück dieses Ortes (Pixelbild 12x12, Farben aus GL.data.huntPal)
window.GL = window.GL || {};
GL.data = GL.data || {};

// Allgemeine Szenen, die überall vorkommen können ({place} = Ort)
GL.data.dungeonSteps = [
  { t: 'Eine schwere Tür versperrt den Weg. Dahinter klimpert etwas.',
    c: [{ l: 'Aufbrechen', k: 'kraft', p: 0.5, ok: '{who} stemmt sich dagegen. Die Tür fliegt auf, dahinter liegt ein Beutel Berry.', no: '{who} rennt gegen die Tür. Die Tür gewinnt.', r: 'b' },
        { l: 'Schloss knacken', k: 'technik', p: 0.5, ok: '{who} fummelt kurz herum. Klick! Ein Kästchen mit Meersplittern.', no: 'Der Dietrich bricht ab. {who} schaut sehr unschuldig.', r: 's' },
        { l: 'Anderen Weg suchen', k: 'helfer', p: 0.7, ok: '{who} findet einen Seitengang. Unterwegs liegt eine Münze.', no: 'Der Seitengang war eine Sackgasse. Zurück, alle.', r: 'b' }] },
  { t: 'Eine Wache döst auf einem Fass. Ihr Schnarchen hallt durch den Gang.',
    c: [{ l: 'Vorbeischleichen', k: 'technik', p: 0.55, ok: '{who} huscht vorbei und klaut nebenbei den Geldbeutel.', no: 'Ein Brett knarzt. Die Wache schreckt hoch und alle rennen.', r: 'b' },
        { l: 'Umhauen', k: 'kaempfer', p: 0.55, ok: 'Ein Schlag von {who}, und die Wache schläft jetzt richtig.', no: '{who} verfehlt. Die Wache ruft Verstärkung.', r: 'b' },
        { l: 'Mit Essen ablenken', k: 'helfer', p: 0.6, ok: '{who} legt ein Brötchen hin. Die Wache kaut glücklich weiter.', no: 'Jemand aus der Crew hat das Brötchen schon selbst gegessen.', r: 'h' }] },
  { t: 'Eine wackelige Hängebrücke führt über eine tiefe Schlucht.',
    c: [{ l: 'Schnell rüberrennen', k: 'kaempfer', p: 0.5, ok: '{who} sprintet los. Alle hinterher, keiner fällt!', no: 'Ein Brett bricht. {who} hängt kurz am Seil, alle ziehen.', r: 'b' },
        { l: 'Seil kappen und schwingen', k: 'klinge', p: 0.5, ok: '{who} kappt ein Seil, und die Crew schwingt elegant hinüber.', no: 'Schwungvoll, aber in die falsche Richtung.', r: 's' },
        { l: 'Erst alles prüfen', k: 'helfer', p: 0.75, ok: '{who} prüft jedes Brett. Langsam, aber sicher.', no: 'Beim Prüfen fällt {who} der Rucksack runter.', r: 'h' }] },
  { t: 'Mitten im Raum steht eine Truhe. Verdächtig glänzende Truhe.',
    c: [{ l: 'Einfach aufmachen', k: 'brecher', p: 0.45, ok: 'Die Falle schnappt zu, aber {who} merkt es kaum. Drin: Ausrüstung!', no: 'Die Falle sitzt. {who} sieht kurz Sterne.', r: 'g' },
        { l: 'Falle entschärfen', k: 'technik', p: 0.55, ok: '{who} entschärft den Mechanismus. Drin liegt ein schönes Stück.', no: 'Ein Pfeil zischt knapp vorbei. Die Truhe bleibt zu.', r: 'g' },
        { l: 'Mit der Klinge aufhebeln', k: 'klinge', p: 0.5, ok: 'Ein sauberer Schnitt von {who}, der Deckel springt auf.', no: 'Die Klinge klemmt. Das wird ein Nachmittag.', r: 'b' }] },
  { t: 'Eine Wand voller alter Zeichen. Irgendwo muss ein Hebel sein.',
    c: [{ l: 'Zeichen lesen', k: 'helfer', p: 0.6, ok: '{who} liest laut vor. Ein Geheimfach öffnet sich.', no: 'Die Zeichen sind leider ein Einkaufszettel.', r: 's' },
        { l: 'Raten und drücken', k: 'technik', p: 0.45, ok: 'Glückstreffer! Der Boden dreht sich und gibt Münzen frei.', no: 'Falscher Knopf. Aus der Decke rieselt Staub.', r: 'b' },
        { l: 'Draufhauen', k: 'kraft', p: 0.35, ok: '{who} haut drauf. Die Wand ist weg, das Problem auch.', no: 'Die Wand hält. {who} pustet sich auf die Faust.', r: 'b' }] },
  { t: 'Am Wegrand sitzt ein kleiner Händler mit großem Rucksack.',
    c: [{ l: 'Handeln', k: 'technik', p: 0.6, ok: '{who} handelt den Preis runter, bis der Händler weint. Schnäppchen!', no: 'Der Händler ist schlauer. Teuer war es trotzdem lecker.', r: 's' },
        { l: 'Etwas Proviant kaufen', k: 'helfer', p: 0.85, ok: 'Frischer Proviant. Die Crew schöpft neuen Mut.', no: 'Der Proviant war leider schon alt.', r: 'h' },
        { l: 'Freundlich grüßen', k: 'kaempfer', p: 0.5, ok: 'Der Händler freut sich so, dass er etwas schenkt.', no: 'Der Händler hat keine Zeit. Weiter geht es.', r: 'b' }] }
];

// Was die Crew unterwegs sagt. go = Start, ok = nach Erfolg, no = nach Pech, boss = vor dem Boss, end = am Ende
GL.data.dungeonLines = {
  ruffy:   { go: ['Abenteuer! Gibt es da drin Fleisch?', 'Los, los, los!'], ok: ['Shishishi! Weiter!', 'Hab ich doch gesagt!'], no: ['Egal, nochmal!', 'Ich hab Hunger.'], boss: ['Den hau ich um!', 'Der sieht stark aus. Super!'], end: ['Jetzt gibt es Fleisch!', 'Morgen wieder?'] },
  zorro:   { go: ['Ich geh vor. Wo ist vorne?', 'Weckt mich, wenn es spannend wird.'], ok: ['Hmpf. Zu einfach.', 'Weiter.'], no: ['Das war Absicht.', 'Wer hat den Weg verlegt?'], boss: ['Endlich ein Gegner.', 'Drei Schwerter reichen.'], end: ['Gibt es hier irgendwo Sake?'] },
  nami:    { go: ['Wenn es hier Schätze gibt, gehören sie mir.', 'Keiner fasst etwas an, ohne zu fragen!'], ok: ['Das zähle ich gleich nach.', 'Hach, Berry!'], no: ['Das zieh ich euch von der Beute ab!', 'Typisch Jungs.'], boss: ['Ihr kümmert euch, ich halte die Beute.'], end: ['Gute Ausbeute. Für mich.'] },
  lysop:   { go: ['Ich hab die Ich-darf-nicht-in-Höhlen-Krankheit.', 'Ich hab schon tausend solcher Höhlen erobert!'], ok: ['Genau wie ich es geplant hatte!', 'Der große Käpt’n Lysop schlägt wieder zu!'], no: ['Das war ein Test. Ihr habt bestanden.', 'Meine Beine zittern nur vor Freude.'], boss: ['Ich decke euch. Von ganz hinten.'], end: ['Diese Geschichte erzähle ich noch meinen Enkeln!'] },
  sanji:   { go: ['Ich pack uns Bento ein.', 'Nami-Mäuschen, ich beschütze dich!'], ok: ['Ein Gentleman löst das mit Stil.', 'Alles nach Rezept.'], no: ['Verdammt, mein Anzug!', 'Das nächste Mal koche ich die Tür.'], boss: ['Den servier ich ab.'], end: ['Heute Abend gibt es ein Festmahl.'] },
  chopper: { go: ['Ist es da drin dunkel? Ich hab keine Angst! Ein bisschen.'], ok: ['Wir haben es geschafft!', 'Das freut mich gar nicht, du Idiot!'], no: ['Hat sich jemand wehgetan? Ich hab Verbandszeug!', 'Aaah! Ein Arzt! Ach, ich bin ja der Arzt.'], boss: ['Ich versteck mich… falsch rum!'], end: ['Alle gesund. Das ist das Wichtigste.'] },
  robin:   { go: ['Wie spannend. Hier riecht es nach Geschichte.'], ok: ['Wie erwartet.', 'Interessant.'], no: ['Hätte schlimmer kommen können. Wir hätten sterben können.'], boss: ['Ich leihe euch ein paar Hände.'], end: ['Das schreibe ich in mein Tagebuch.'] },
  franky:  { go: ['SUUUPER! Ein Abenteuer!'], ok: ['Das war super, Baby!', 'Cola-Power!'], no: ['Kein Problem, das bau ich um.'], boss: ['Zeit für ein Upgrade!'], end: ['Ich bin heute super drauf!'] },
  brook:   { go: ['Ich hätte Gänsehaut, wenn ich Haut hätte. Yohoho!'], ok: ['Yohohoho!', 'Ein Lied für diesen Sieg!'], no: ['Mir fällt das Herz in die Hose. Ich habe aber kein Herz. Yohoho!'], boss: ['Darf ich vorher noch spielen?'], end: ['Was für ein Abend. Ein Ständchen?'] },
  self:    { go: ['Na dann, Crew. Auf geht’s!', 'Bleibt dicht hinter mir.'], ok: ['Gut gemacht!', 'Genau so!'], no: ['Kopf hoch, weiter.', 'Passiert den Besten.'], boss: ['Alle bereit? Dann los!'], end: ['Das war ein schöner Landgang.'] },
  buggy:   { go: ['Ich, der große Buggy, führe euch an!'], ok: ['Natürlich! Ich bin genial!'], no: ['Das war nicht ich! Meine Hand war das!'], boss: ['Ich lenke ihn ab. Von sehr weit weg.'], end: ['Alles meins! Ach so, teilen.'] },
  vivi:    { go: ['Ich komme mit. Ich bin eure Freundin.'], ok: ['Wir sind ein gutes Team!'], no: ['Gebt nicht auf!'], boss: ['Für meine Freunde!'], end: ['Danke, dass ich dabei sein durfte.'] },
  ace:     { go: ['Lasst euch nicht aufhalten.'], ok: ['Heiß, oder?'], no: ['…Zzz. Oh, bin ich eingeschlafen?'], boss: ['Feuerfaust!'], end: ['Danke fürs Mitnehmen.'] },
  law:     { go: ['Das war nicht mein Plan.'], ok: ['Wie berechnet.'], no: ['Hört auf, ohne Plan loszurennen.'], boss: ['Room.'], end: ['…Das war gar nicht schlecht.'] },
  jinbei:  { go: ['Ich halte euch den Rücken frei.'], ok: ['Sauber gemacht.'], no: ['Ruhig bleiben. Durchatmen.'], boss: ['Fischmenschen-Karate!'], end: ['Ein guter Tag zur See.'] },
  koby:    { go: ['Ich… ich schaff das! Ich will Admiral werden!'], ok: ['Ich hab es geschafft!'], no: ['Ich übe noch!'], boss: ['Nicht weglaufen, Koby!'], end: ['Danke, dass ihr an mich glaubt.'] },
  garp:    { go: ['Bwahaha! Wer will Kekse?'], ok: ['Faust der Liebe!'], no: ['Zzz… was? Weiter!'], boss: ['Den erziehe ich.'], end: ['Kekse für alle!'] },
  smoker:  { go: ['Keine Dummheiten.'], ok: ['Hm.'], no: ['Tch.'], boss: ['Weißer Rauch!'], end: ['Ich hab euch im Auge.'] },
  crocodile: { go: ['Beeilt euch. Ich hasse Zeitverschwendung.'], ok: ['Kukuku.'], no: ['Erbärmlich.'], boss: ['Sand frisst alles.'], end: ['Ich nehme meinen Anteil.'] },
  hancock: { go: ['Ich gehe nur mit, weil Ruffy hier ist.'], ok: ['Natürlich. Ich bin schön.'], no: ['Das verzeihe ich euch, weil ich schön bin.'], boss: ['Liebespfeil!'], end: ['War Ruffy beeindruckt?'] },
  perona:  { go: ['Ist es da drin süß? Nein? Langweilig.'], ok: ['Horohoho!'], no: ['Negativ… so negativ.'], boss: ['Geister, los!'], end: ['Ich will was Süßes.'] },
  sabo:    { go: ['Für die Freiheit!'], ok: ['Sauber!'], no: ['Nicht schlimm, wir ziehen das durch.'], boss: ['Drachenklaue!'], end: ['Grüßt Ruffy von mir.'] },
  mihawk:  { go: ['Ich begleite euch. Aus Langeweile.'], ok: ['…'], no: ['Schwach.'], boss: ['Ein Schnitt genügt.'], end: ['Akzeptabel.'] },
  whitebeard: { go: ['Gurarara! Meine Söhne, los!'], ok: ['Gurarara!'], no: ['Kein Grund zur Sorge.'], boss: ['Das Meer bebt!'], end: ['Familie ist alles.'] },
  kid:     { go: ['Aus dem Weg!'], ok: ['Ha! Zu leicht.'], no: ['Wer war das?!'], boss: ['Jetzt wird es laut!'], end: ['Nächstes Mal was Härteres.'] },
  enel:    { go: ['Ein Gott braucht keinen Landgang. Aber gut.'], ok: ['Yahahaha!'], no: ['Unmöglich.'], boss: ['Zehn Millionen Volt!'], end: ['Das war göttlich.'] }
};
// Wenn eine Figur keine eigenen Sätze hat: nach Rolle
GL.data.dungeonLinesRole = {
  kaempfer: { go: ['Endlich was los!', 'Ich bin bereit.'], ok: ['Das war ja einfach.', 'Weiter!'], no: ['Autsch. Nochmal!', 'Das zählt nicht.'], boss: ['Der gehört mir.'], end: ['Guter Kampf.'] },
  helfer:   { go: ['Bleibt zusammen, ja?', 'Ich hab alles eingepackt.'], ok: ['Gut gemacht, alle!', 'Schön vorsichtig.'], no: ['Ich hab Pflaster dabei.', 'Kurz durchatmen.'], boss: ['Ich passe auf euch auf.'], end: ['Alle heil zurück. Schön.'] },
  brecher:  { go: ['Ich geh vor.', 'Hinter mich, alle.'], ok: ['Steht noch alles.', 'Kein Kratzer.'], no: ['Hat kaum gekitzelt.', 'Nächstes Mal halte ich das.'], boss: ['Der kommt nicht an mir vorbei.'], end: ['Gut, dass ich dabei war.'] }
};

// Kleine Pixelbilder für die Kopfgrafik
const DG_DECO = {
  zelt:   { c: { R: '#c0392b', W: '#f4ece0', Y: '#e8c25a', K: '#3a2c20' }, rows: ['.......Y........', '......RRR.......', '.....RWRWR......', '....RWRWRWR.....', '...RWRWRWRWR....', '..RWRWRWRWRWR...', '.RWRWRWKKWRWRW..', 'RWRWRWRKKRWRWRW.', 'RWRWRWRKKRWRWRW.'] },
  berg:   { c: { W: '#f6f8ff', w: '#c8d0e0', G: '#6a7a8a', P: '#b06aa0', K: '#3a2c20' }, rows: ['.........PP.....', '........PWWP....', '.......GWWWWG...', '......GWWwWWWG..', '.....GWwwWWwWWG.', '....GGwWWWWWwWG.', '...GGGGWwWWWGGGG', '..GGGGGGGGGGGGGG', '.GGGGGGGGGGGGGGG'] },
  grab:   { c: { S: '#e8c87a', s: '#c8a050', K: '#3a2c20', Y: '#f2d24a' }, rows: ['.......Y........', '......SSS.......', '.....SSsSS......', '....SSSsSSS.....', '...SSSSsSSSS....', '..SSSSSKSSSSS...', '.SSSSSKKKSSSSS..', 'SSSSSSKKKSSSSSS.', 'ssssssssssssssss'] },
  ruine:  { c: { W: '#f4f0e6', w: '#c8c2b0', G: '#6aa84a', Y: '#f2d24a' }, rows: ['...WW.......Y...', '...WW......YYY..', '...WW...WW..Y...', '...Ww...WW......', '...WW...Ww..WW..', 'G..WW.G.WW..WW.G', 'GGWWWWGGWWGGWWGG', 'GGGGGGGGGGGGGGGG', 'GGGGGGGGGGGGGGGG'] },
  kanal:  { c: { B: '#3a6a9a', b: '#6a9ac8', W: '#c4904f', w: '#8a5a2a', R: '#c0392b' }, rows: ['....RR..........', '....W...........', '....W...........', '..wWWWWWWWw.....', '...wwwwwwww.....', 'bBbBbBbBbBbBbBbB', 'BbBbBbBbBbBbBbBb', 'bBbBbBbBbBbBbBbB', 'BBBBBBBBBBBBBBBB'] },
  gruft:  { c: { G: '#8a8a9a', g: '#5a5a6a', K: '#2a2030', P: '#9a6ab0', W: '#f2eef8' }, rows: ['.....GGGG.......', '....GgggGG......', '....GgWgGG...W..', '....GgggGG..WWW.', '..GGGGGGGGGG.W..', '..GgKKKKKKgG....', '..GgKKKKKKgG....', 'PPPPPPPPPPPPPPPP', 'PPPPPPPPPPPPPPPP'] },
  koralle:{ c: { P: '#e870a0', p: '#f8b4cf', O: '#f08a3a', B: '#3a6a9a', Y: '#f2d24a' }, rows: ['..P.....O.......', '.PpP...OO..P....', '..P.P.O.O.PpP...', '..PPP..OO..P..Y.', '...P...O..PP.YYY', '..PP..OO...P..Y.', 'BBPBBBBOBBBPBBBB', 'BBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBB'] },
  gitter: { c: { S: '#9aa0a8', s: '#5a6068', K: '#2a2028', R: '#c0392b' }, rows: ['SSSSSSSSSSSSSSSS', 'S.S..S..S..S..SS', 'S.S..S..S..S..SS', 'S.S..S..S..S..SS', 'SSSSSSSSSSSSSSSS', 'S.S..S..S..S..SS', 'S.S..S..S..S..SS', 'RRRRRRRRRRRRRRRR', 'ssssssssssssssss'] }
};

GL.data.dungeons = [
  { id: 'zirkus', name: 'Buggys Zirkuszelt', sea: 0, need: { isl: ['shells-town', 'orange-town', 'syrup', 'baratie', 'loguetown', 'arlong-park'] }, needText: 'Fahre einmal durch den East Blue.',
    scene: { sky: '#f6c88a', ground: '#c89a5a', deco: DG_DECO.zelt }, boss: 'buggy',
    intro: 'Das Zirkuszelt in Orange Town ist verlassen. Fast. Drinnen kichert jemand.',
    steps: [
      { t: 'Ein Löwe auf einem Einrad versperrt die Manege.',
        c: [{ l: 'Löwen streicheln', k: 'helfer', p: 0.55, ok: '{who} krault ihn hinter dem Ohr. Er schnurrt und rollt weg.', no: 'Der Löwe mag {who} nicht. Gar nicht.', r: 'h' },
            { l: 'Einrad umtreten', k: 'kraft', p: 0.55, ok: 'Plumps. Der Löwe sitzt beleidigt im Sand. Darunter: Münzen.', no: 'Das Einrad hat Stützräder.', r: 'b' }] },
      { t: 'Eine Kanone mit der Aufschrift „Buggy-Ball“. Sie zeigt auf euch.',
        c: [{ l: 'Lunte austreten', k: 'kaempfer', p: 0.55, ok: '{who} tritt die Lunte aus. Puh.', no: 'Zu spät! Bumm! Die Crew ist schwarz im Gesicht.', r: 's' },
            { l: 'Kanone umdrehen', k: 'technik', p: 0.5, ok: '{who} dreht sie um. Die Kanone schießt die Zeltplane weg. Sterne!', no: 'Sie dreht sich zurück. Wie macht sie das?', r: 'b' }] }
    ],
    bossText: 'Buggy der Clown steigt aus einer Kiste. „Wer hat meinen Zirkus betreten?!“',
    bossC: [{ l: 'Auf die Nase zeigen', k: 'technik', p: 0.55, ok: '{who} sagt „rote Nase“. Buggy explodiert vor Wut und vergisst zu kämpfen.', no: 'Buggy zerfällt in Teile und kitzelt alle durch.', r: 'g' },
            { l: 'Teile festhalten', k: 'kraft', p: 0.5, ok: '{who} fängt Buggys Hände ein. Er gibt auf und rückt seine Schatzkiste raus.', no: 'Die Teile fliegen überall hin. Chaos.', r: 'g' },
            { l: 'Klinge ziehen', k: 'klinge', p: 0.4, ok: 'Ein Hieb von {who}. Buggy flieht in seine Kiste.', no: 'Klingen wirken bei Buggy nicht. Wusstet ihr das nicht?', r: 'g' }],
    find: { id: 'clownsnase', name: 'Rote Clownsnase', text: 'Quietscht, wenn man drückt. Buggy will sie zurück.',
      art: ['............', '............', '....rrrr....', '...rRRRrr...', '..rRxRRRrr..', '..rRRRRRrr..', '..rRRRRRrr..', '..rrRRRrrr..', '...rrrrrr...', '....rrrr....', '............', '............'] } },

  { id: 'drumm', name: 'Gipfel von Drumm', sea: 1, need: { isl: ['drumm'] }, needText: 'Besuche Drumm.',
    scene: { sky: '#cfe0f4', ground: '#f4f6fb', deco: DG_DECO.berg }, boss: 'wapol',
    intro: 'Der Weg zum Schloss führt durch Schnee bis zur Hüfte. Oben brennt Licht.',
    steps: [
      { t: 'Ein Schneesturm zieht auf. Man sieht kaum die eigene Hand.',
        c: [{ l: 'Iglu bauen', k: 'brecher', p: 0.6, ok: '{who} schaufelt ein Iglu. Drinnen ist es warm und gemütlich.', no: 'Das Iglu wird ein Schneehaufen. Mit Crew drin.', r: 'h' },
            { l: 'Weiterstapfen', k: 'kraft', p: 0.5, ok: '{who} spurt voraus. Am Wegrand liegt eine vergessene Kiste.', no: 'Alle sind jetzt Schneemänner.', r: 'b' }] },
      { t: 'Riesige Schneehasen hoppeln heran. Sie wirken hungrig.',
        c: [{ l: 'Proviant teilen', k: 'helfer', p: 0.65, ok: '{who} verteilt Möhren. Die Hasen begleiten euch ein Stück.', no: 'Die Hasen wollen mehr. Viel mehr.', r: 's' },
            { l: 'Bergab rodeln', k: 'kaempfer', p: 0.5, ok: 'Auf einem Brett rauscht ihr davon. Wuuuh!', no: 'Das Brett war ein Hase. Er ist nicht begeistert.', r: 'b' }] }
    ],
    bossText: 'Wapol steht vor dem Schloss und kaut auf einem Kanonenrohr. „Das ist MEIN Berg!“',
    bossC: [{ l: 'Ihn mit Kanonen füttern', k: 'technik', p: 0.5, ok: '{who} reicht ihm eine Kanonenkugel. Er schluckt, schwankt und rollt den Berg runter.', no: 'Wapol frisst stattdessen eure Leiter.', r: 'g' },
            { l: 'Kopfnuss', k: 'kraft', p: 0.55, ok: 'Bong! Wapol fliegt in den Schnee. Seine Schatzkammer steht offen.', no: 'Wapol beißt in die Faust von {who}. Aua.', r: 'g' },
            { l: 'Den Arzt rufen', k: 'helfer', p: 0.5, ok: 'Doktorin Kureha taucht auf. Wapol rennt um sein Leben.', no: 'Die Doktorin ist gerade beim Tee.', r: 'g' }],
    find: { id: 'kirschblute', name: 'Schneekirschblüte', text: 'Eine rosa Blüte aus Schnee. Sie schmilzt nie.',
      art: ['............', '.....PP.....', '....PxxP....', '.PP.PppP.PP.', 'PxxPPppPPxxP', 'PppPpyypPppP', '.PPPpyypPPP.', '...PPppPP...', '..PxxPPxxP..', '..PppP.PppP.', '...PP...PP..', '............'] } },

  { id: 'graeber', name: 'Gräber von Alabasta', sea: 1, need: { isl: ['alabasta'] }, needText: 'Besuche Alabasta.',
    scene: { sky: '#f6d890', ground: '#e8c87a', deco: DG_DECO.grab }, boss: 'mr1',
    intro: 'Unter dem Sand liegt eine Grabkammer. Es riecht nach altem Gold und Staub.',
    steps: [
      { t: 'Sand rieselt von der Decke. Die Kammer füllt sich langsam.',
        c: [{ l: 'Schnell weiter', k: 'kaempfer', p: 0.55, ok: '{who} findet den Ausgang, bevor es eng wird.', no: 'Alle stecken bis zum Bauch im Sand. Peinlich.', r: 'b' },
            { l: 'Decke abstützen', k: 'brecher', p: 0.6, ok: '{who} hält die Decke. Dahinter glitzert eine Nische.', no: 'Die Decke ist schwerer als gedacht.', r: 's' }] },
      { t: 'Ein Riesenkrebs blockiert den Gang und klappert mit den Scheren.',
        c: [{ l: 'Aufsteigen und reiten', k: 'helfer', p: 0.5, ok: '{who} klettert rauf. Der Krebs trägt euch freundlich weiter.', no: 'Der Krebs schüttelt alle ab.', r: 'h' },
            { l: 'Scheren zubinden', k: 'technik', p: 0.55, ok: '{who} knotet die Scheren zu. Er krabbelt beleidigt weg.', no: 'Der Knoten hält nicht. Zwick!', r: 'b' }] }
    ],
    bossText: 'Mr. 1 tritt aus dem Schatten. Seine Arme glänzen wie Klingen. „Ihr kommt nicht weiter.“',
    bossC: [{ l: 'Stahl gegen Stahl', k: 'klinge', p: 0.5, ok: '{who} schneidet durch, was nicht zu schneiden war. Mr. 1 nickt und geht.', no: 'Klingen prallen ab. Funken sprühen.', r: 'g' },
            { l: 'Mit Gewalt', k: 'kraft', p: 0.45, ok: '{who} schlägt zu, bis Mr. 1 Respekt zeigt.', no: 'Autsch. Er ist wirklich aus Stahl.', r: 'g' },
            { l: 'Ablenken und vorbei', k: 'technik', p: 0.5, ok: '{who} wirft Sand. Ihr huscht an Mr. 1 vorbei zum Schatz.', no: 'Er hat Sand in den Augen. Ihr auch.', r: 'g' }],
    find: { id: 'koenigssiegel', name: 'Siegel von Alabasta', text: 'Ein goldenes Siegel mit dem Wappen des Königs.',
      art: ['............', '....gggg....', '..ggGGGGgg..', '.gGGyyyyGGg.', '.gGyGGGGyGg.', 'gGyGGkkGGyGg', 'gGyGkGGkGyGg', '.gGyGGGGyGg.', '.gGGyyyyGGg.', '..ggGGGGgg..', '....gggg....', '............'] } },

  { id: 'ruinen', name: 'Ruinen von Skypiea', sea: 1, need: { isl: ['skypiea'] }, needText: 'Besuche Skypiea.',
    scene: { sky: '#bfe0f8', ground: '#7ab85a', deco: DG_DECO.ruine }, boss: 'ohm',
    intro: 'Zwischen riesigen Ranken liegt die alte Stadt Shandora. Irgendwo läutet eine Glocke.',
    steps: [
      { t: 'Eine Wolkenstraße führt über den Abgrund. Wie fest ist eine Wolke?',
        c: [{ l: 'Einfach drauf', k: 'kaempfer', p: 0.5, ok: 'Sie trägt! {who} hüpft vergnügt weiter.', no: 'Eine Wolke ist… weich. Sehr weich.', r: 'b' },
            { l: 'Mit Dial testen', k: 'technik', p: 0.6, ok: '{who} prüft mit einem Dial. Darunter steckt ein zweiter!', no: 'Der Dial bläst {who} die Frisur weg.', r: 's' }] },
      { t: 'Die Ranke ist hoch. Oben hängen goldene Früchte.',
        c: [{ l: 'Hochklettern', k: 'kraft', p: 0.55, ok: '{who} ist in zwei Sätzen oben. Gold!', no: 'Ein Blatt, ein Rutsch, ein Plumps.', r: 'b' },
            { l: 'Mit der Klinge pflücken', k: 'klinge', p: 0.5, ok: 'Ein Schnitt, und die Früchte fallen direkt in den Sack.', no: 'Die Frucht fällt {who} auf den Kopf.', r: 'g' }] }
    ],
    bossText: 'Priester Ohm wartet in seinem Prüfungsfeld. Seine Eisenwolken zischen.',
    bossC: [{ l: 'Durch das Feld rennen', k: 'kaempfer', p: 0.5, ok: '{who} weicht jeder Falle aus und steht vor ihm. Ohm verneigt sich.', no: 'Eisenwolke links, Eisenwolke rechts. Au, au.', r: 'g' },
            { l: 'Hund ablenken', k: 'helfer', p: 0.55, ok: '{who} wirft einen Knochen. Ohms Hund rennt, Ohm hinterher.', no: 'Der Hund mag lieber {who}.', r: 'g' },
            { l: 'Wolken zerschneiden', k: 'klinge', p: 0.45, ok: '{who} schneidet die Eisenwolke entzwei. Der Weg ist frei.', no: 'Eisen ist hart. Auch in Wolkenform.', r: 'g' }],
    find: { id: 'goldglocke', name: 'Kleine Goldglocke', text: 'Ein Nachbau der großen Glocke. Klingt nach Zuhause.',
      art: ['.....kk.....', '.....gg.....', '....gGGg....', '...gGyyGg...', '...gGyyGg...', '..gGyyyyGg..', '..gGyyyyGg..', '.gGyyyyyyGg.', '.gggggggggg.', '.....kk.....', '....kkkk....', '............'] } },

  { id: 'kanaele', name: 'Kanäle von Water 7', sea: 2, need: { isl: ['water-7', 'puffing-tom', 'enies-gate', 'long-ring'] }, needText: 'Besuche Water 7 oder eine Nachbarinsel.',
    scene: { sky: '#a8d0f0', ground: '#6a9ac8', deco: DG_DECO.kanal }, boss: 'fukuro',
    intro: 'Mit einem Yagara-Bullen gleitet ihr durch die Kanäle. Unten im Wasser blitzt etwas.',
    steps: [
      { t: 'Eine Aqua Laguna rollt heran. Die Welle ist riesig.',
        c: [{ l: 'Festhalten!', k: 'brecher', p: 0.55, ok: '{who} hält alle fest. Die Welle spült Treibgut an.', no: 'Alle sind klitschnass. Der Bulle lacht.', r: 'b' },
            { l: 'Auf der Welle reiten', k: 'kaempfer', p: 0.45, ok: 'Wuuuh! {who} surft vorneweg. Was für ein Ritt!', no: 'Die Welle reitet euch.', r: 's' }] },
      { t: 'In der Werft streiten zwei Zimmerleute über einen Bauplan.',
        c: [{ l: 'Mitbauen', k: 'technik', p: 0.55, ok: '{who} schlägt etwas vor. Die Zimmerleute schenken euch Werkzeug.', no: 'Das Boot schwimmt. Kopfüber.', r: 'g' },
            { l: 'Schlichten', k: 'helfer', p: 0.6, ok: '{who} bringt beide zum Lachen. Als Dank gibt es Kekse.', no: 'Jetzt streiten sie zu dritt.', r: 'h' }] }
    ],
    bossText: 'Fukuro rollt heran. „Tschapapa! Ich weiß alles über euch!“ Sein Reißverschlussmund steht offen.',
    bossC: [{ l: 'Reißverschluss zu!', k: 'technik', p: 0.55, ok: '{who} zieht seinen Mund zu. Endlich Ruhe. Er lässt euch durch.', no: 'Er plaudert alle Geheimnisse der Crew aus. Peinlich!', r: 'g' },
            { l: 'Wegrollen lassen', k: 'kraft', p: 0.5, ok: '{who} schubst ihn an. Er rollt in den Kanal. Platsch.', no: 'Er rollt zurück. Auf euch.', r: 'g' }],
    find: { id: 'cola-flasche', name: 'Leere Colaflasche', text: 'Eine von Frankys Lieblingsflaschen. Super!',
      art: ['....kkkk....', '....bBBb....', '....bBBb....', '...bBBBBb...', '..bBxBBBBb..', '..bBxBBBBb..', '..brrrrrrb..', '..brxxxxrb..', '..brrrrrrb..', '..bBBBBBBb..', '..bbbbbbbb..', '............'] } },

  { id: 'gruft', name: 'Gruft von Thriller Bark', sea: 2, need: { isl: ['florian', 'grusel-garten', 'hogback-labor', 'mangroven', 'thriller-schloss'] }, needText: 'Besuche eine Insel von Thriller Bark.',
    scene: { sky: '#3a2c4a', ground: '#5a4a6a', deco: DG_DECO.gruft }, boss: 'absalom',
    intro: 'Nebel kriecht über den Friedhof. Ein Grabstein steht offen, darunter führt eine Treppe nach unten.',
    steps: [
      { t: 'Kleine Geister schweben heran. Wer sie berührt, wird traurig.',
        c: [{ l: 'Positiv denken!', k: 'kaempfer', p: 0.5, ok: '{who} grinst die Geister einfach weg.', no: '„Ich bin es nicht wert, ein Pirat zu sein…“ seufzt {who}.', r: 's' },
            { l: 'Laternen anzünden', k: 'helfer', p: 0.6, ok: '{who} macht Licht. Die Geister mögen das gar nicht.', no: 'Das Streichholz ist nass.', r: 'b' }] },
      { t: 'Ein Zombie spielt Klavier. Ziemlich gut sogar.',
        c: [{ l: 'Applaudieren', k: 'helfer', p: 0.65, ok: 'Der Zombie verbeugt sich gerührt und schenkt euch etwas.', no: 'Er verlangt eine Zugabe. Von euch.', r: 'h' },
            { l: 'Salz werfen', k: 'technik', p: 0.5, ok: '{who} wirft Salz. Der Zombie sinkt friedlich um.', no: 'Das war Zucker. Er spielt jetzt fröhlicher.', r: 'b' }] }
    ],
    bossText: 'Absalom wird unsichtbar. Irgendwo kichert es. „Wo bin ich wohl?“',
    bossC: [{ l: 'Mehl verstreuen', k: 'technik', p: 0.6, ok: '{who} pustet Mehl in die Luft. Da ist er! Er gibt auf.', no: 'Jetzt sind alle weiß. Absalom auch, aber er lacht.', r: 'g' },
            { l: 'Wild um sich hauen', k: 'kraft', p: 0.4, ok: 'Treffer! {who} hat tatsächlich etwas erwischt.', no: '{who} trifft nur den Kronleuchter.', r: 'g' },
            { l: 'Mit Haki spüren', k: 'kaempfer', p: 0.5, ok: '{who} schließt die Augen. „Links.“ Bumm. Sieg.', no: '„Rechts.“ Es war links.', r: 'g' }],
    find: { id: 'schattenglas', name: 'Schatten im Glas', text: 'Er zappelt, wenn man das Glas schüttelt.',
      art: ['...ssss.....', '...SSSS.....', '..SllllS....', '..SlkklS....', '..SkkkkS....', '..SlkklS....', '..SkllkS....', '..SllllS....', '..SSSSSS....', '............', '............', '............'] } },

  { id: 'koralle', name: 'Korallenhöhle', sea: 1, need: { isl: ['tiefsee', 'korallenhuegel', 'fischmenschen-viertel', 'meerwald', 'gyoncorde', 'ryugu'] }, needText: 'Besuche die Fischmenscheninsel.',
    scene: { sky: '#3a7ab0', ground: '#2a5a8a', deco: DG_DECO.koralle }, boss: 'hyouzou',
    intro: 'Tief unter dem Meer leuchten die Korallen in allen Farben. Eine Blase hält die Luft für euch fest.',
    steps: [
      { t: 'Eure Luftblase wird kleiner. Langsam, aber sicher.',
        c: [{ l: 'Neue Blase suchen', k: 'helfer', p: 0.6, ok: '{who} findet eine riesige Blase. Und darin eine Perle.', no: 'Die Blase war eine Qualle.', r: 's' },
            { l: 'Schneller schwimmen', k: 'kaempfer', p: 0.5, ok: '{who} zieht alle mit. Gerade noch geschafft!', no: 'Wer eine Teufelsfrucht gegessen hat, hängt jetzt an den anderen.', r: 'b' }] },
      { t: 'Eine Meerjungfrau winkt aus einer Muschel. Sie hat sich verfangen.',
        c: [{ l: 'Netz durchschneiden', k: 'klinge', p: 0.6, ok: '{who} befreit sie. Sie schenkt euch eine Perlenkette.', no: 'Jetzt hängt {who} auch im Netz.', r: 'g' },
            { l: 'Muschel aufstemmen', k: 'kraft', p: 0.55, ok: '{who} öffnet die Muschel. Freudiges Winken und ein Kuss auf die Wange.', no: 'Die Muschel schnappt zu. Zwick.', r: 'h' }] }
    ],
    bossText: 'Hyouzou, der Schwertkämpfer mit acht Armen, schwankt heran. Er hat wohl zu viel Gift getrunken.',
    bossC: [{ l: 'Acht gegen drei', k: 'klinge', p: 0.5, ok: '{who} pariert jede Klinge. Hyouzou fällt um und schnarcht.', no: 'Acht Klingen sind viel. Sehr viel.', r: 'g' },
            { l: 'Wasser reichen', k: 'helfer', p: 0.55, ok: '{who} reicht ihm Wasser. Er wird nüchtern, schämt sich und geht.', no: 'Er nimmt das Wasser und kämpft weiter.', r: 'g' },
            { l: 'Mit Fischmenschen-Karate', k: 'fischmensch', p: 0.5, ok: 'Ein Wasserstoß von {who}. Hyouzou wird an Land gespült.', no: 'Das Wasser hört nicht auf {who}.', r: 'g' }],
    find: { id: 'perlmuschel', name: 'Schimmernde Muschel', text: 'Hält man sie ans Ohr, hört man die Fischmenscheninsel.',
      art: ['............', '............', '....PPPP....', '..PPpPpPPP..', '.PpPPpPPpPP.', '.PPpPPpPPpP.', 'PpPPpxxPPpPP', 'PPpPxxxxPpPP', '.PPPPxxPPPP.', '..PPPPPPPP..', '............', '............'] } },

  { id: 'impel', name: 'Keller von Impel Down', sea: 2, need: { wins: 1 }, needText: 'Gewinne einen Run.',
    scene: { sky: '#4a3a3a', ground: '#3a2c2c', deco: DG_DECO.gitter }, boss: 'mr5',
    intro: 'Das Unterwassergefängnis. Ganz unten, im vergessenen Keller, liegt die Schatzkammer der Wärter.',
    steps: [
      { t: 'Ein Feld voller Teufelsfrucht-Fallen. Seestein überall.',
        c: [{ l: 'Rüberspringen', k: 'kaempfer', p: 0.5, ok: '{who} springt von Stein zu Stein. Keiner berührt den Seestein.', no: 'Seestein! Alle fühlen sich auf einmal schlapp.', r: 's' },
            { l: 'Steine wegräumen', k: 'brecher', p: 0.6, ok: '{who} räumt den Weg frei. Darunter: Schlüssel.', no: 'Die Steine sind schwerer als die Hoffnung.', r: 'b' }] },
      { t: 'Ein Gefangener ruft aus seiner Zelle: „Bringt mich hier raus!“',
        c: [{ l: 'Befreien', k: 'helfer', p: 0.55, ok: '{who} öffnet die Zelle. Der Gefangene verrät ein Versteck.', no: 'Es war ein Wärter in Verkleidung. Mist.', r: 'g' },
            { l: 'Erst ausfragen', k: 'technik', p: 0.6, ok: '{who} fragt geschickt nach. Er verrät, wo die Vorräte liegen.', no: 'Er erzählt nur von seiner Katze.', r: 'h' }] }
    ],
    bossText: 'Ein Wärter mit explodierender Nase stellt sich in den Weg. Mr. 5, im Nebenjob.',
    bossC: [{ l: 'Nasenspray anbieten', k: 'helfer', p: 0.5, ok: '{who} reicht ein Taschentuch. Mr. 5 ist gerührt und lässt euch vorbei.', no: 'Er niest. Es explodiert.', r: 'g' },
            { l: 'Vorbeistürmen', k: 'kraft', p: 0.5, ok: '{who} rammt sich durch. Die Schatzkammer steht offen!', no: 'Bumm. Bumm. Bumm.', r: 'g' },
            { l: 'Säbel kreuzen', k: 'klinge', p: 0.45, ok: '{who} schneidet die Lunte seiner Nase ab. Problem gelöst.', no: 'Er niest auf die Klinge. Igitt.', r: 'g' }],
    find: { id: 'zellenschluessel', name: 'Großer Zellenschlüssel', text: 'Passt in jede Zelle von Ebene 1 bis 5. Angeblich.',
      art: ['............', '..gggg......', '.gGGGGg.....', '.gG..Gg.....', '.gGGGGg.....', '..gGGgg.....', '....gG......', '....gG......', '....gGgg....', '....gG......', '....gGgg....', '............'] } }
];
