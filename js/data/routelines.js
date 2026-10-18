// Reise-Erzählung: Sätze für die Routenwahl (Phase 'map'). Statt einer Knotenkarte erzählt die Crew, was vor ihr liegt.
// Auswahl ist fest aus Seed + Etappe (kein Zufallszug), damit Replays gleich bleiben.
//   intro[sprecher]  = Lagebeschreibung einer Figur (de, en)
//   isle[insel-id]   = Insel-eigene Lagesätze (werden bevorzugt, wenn vorhanden)
//   near             = Lage, wenn ein Bösewicht/Boss zur Wahl steht ({foe})
//   node[typ]        = ein Satz pro Wahlkarte; elite/gate/boss mit {foe}
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.routeLines = {
  intro: {
    ruffy: [
      ['Vor uns gabelt sich der Weg. Links riecht nach Fleisch. Rechts auch, wenn man sich Mühe gibt.', 'The path splits ahead. Left smells like meat. So does right, if you try hard enough.'],
      ['Ich hab ein gutes Gefühl! Das hab ich immer. Es stimmt nicht immer.', 'I have a good feeling! I always do. It is not always right.'],
      ['Abenteuer! Da vorne! Und da! Und da hinten auch, glaube ich!', 'Adventure! Over there! And there! And back there too, I think!'],
      ['Nami sagt, wir sollen klug wählen. Ich wähle klug. Also, schnell.', 'Nami says choose wisely. I choose wisely. Well, quickly.']
    ],
    nami: [
      ['Laut Karte gibt es mehrere Wege. Laut Ruffy gibt es nur einen: geradeaus.', 'The map shows several routes. Luffy says there is only one: straight ahead.'],
      ['Der Wind dreht. Wer jetzt trödelt, rudert. Ich rudere nicht.', 'The wind is turning. Whoever dawdles rows. I do not row.'],
      ['Ich hab die Route geplant. Bitte haltet euch dran. Bitte.', 'I planned the route. Please stick to it. Please.'],
      ['Wolken im Westen, Gold im Osten. Ihr wisst, wohin ich will.', 'Clouds in the west, gold in the east. You know where I want to go.']
    ],
    zorro: [
      ['Ich kenn den Weg. Glaube ich. Dieser Felsen sieht vertraut aus.', 'I know the way. I think. That rock looks familiar.'],
      ['Irgendwo da vorne wartet jemand Starkes. Gut. Ich war fast eingeschlafen.', 'Someone strong is waiting up ahead. Good. I almost fell asleep.'],
      ['Norden ist da, wo ich hinzeige. Diskussion beendet.', 'North is where I point. End of discussion.']
    ],
    lysop: [
      ['M-meine Ich-darf-nicht-auf-diese-Insel-Krankheit meldet sich. Nur so als Info.', 'M-my can’t-go-on-this-island disease is acting up. Just so you know.'],
      ['Ich, der große Kapitän Lysop, habe die Lage gecheckt. Sie ist… lagig.', 'I, the great Captain Usopp, have scouted the area. It is… very area-ish.'],
      ['Hinter dem Hügel? Achttausend Marinesoldaten. Oder Möwen. Eins von beiden.', 'Behind the hill? Eight thousand marines. Or seagulls. One of the two.']
    ],
    sanji: [
      ['Die Vorräte reichen noch. Für alle außer Ruffy.', 'Supplies will last. For everyone except Luffy.'],
      ['Ich rieche Gewürze, Rauch und Ärger. Zwei davon kann ich kochen.', 'I smell spices, smoke and trouble. I can cook two of those.'],
      ['Wo immer wir hingehen: Abendessen gibt es um sieben.', 'Wherever we go: dinner is at seven.']
    ],
    chopper: [
      ['Ich hab alle untersucht. Ihr seid gesund. Leider auch übermütig.', 'I checked everyone. You are healthy. Sadly also reckless.'],
      ['Meine Nase sagt: Da vorne sind Leute. Und ein sehr nervöses Wildschwein.', 'My nose says: people ahead. And a very nervous boar.'],
      ['Wenn wir kämpfen, bitte nur kleine Wunden. Ich hab nicht so viel Verband.', 'If we fight, small wounds only please. I am low on bandages.']
    ],
    robin: [
      ['Die Spuren hier sind alt. Fufu, und ein paar sehr frisch.', 'The tracks here are old. Fufu, and some are very fresh.'],
      ['In alten Karten hieß diese Gegend „Ort der vielen Fehler“. Wie charmant.', 'Old maps called this area “place of many mistakes”. How charming.'],
      ['Jeder Weg erzählt eine Geschichte. Einer davon endet wohl mit Prügelei.', 'Every path tells a story. One of them probably ends in a brawl.']
    ],
    franky: [
      ['Das Schiff läuft SUUUPER! Die Frage ist nur: wohin?', 'The ship runs SUUUPER! The only question is: where to?'],
      ['Ich hab einen neuen Knopf eingebaut. Er entscheidet die Route. Spaß, oder?', 'I installed a new button. It picks the route. Kidding. Probably.']
    ],
    brook: [
      ['Yohoho! Mir läuft ein Schauer über den Rücken. Obwohl ich nur Rücken habe!', 'Yohoho! A shiver runs down my spine. Which is all I have!'],
      ['Ein Lied für die Weiterfahrt? Ich hätte da ein fröhliches über Schiffbruch.', 'A song for the journey? I have a cheerful one about shipwrecks.']
    ],
    kalle: [
      ['KRAA! Neueste Lage: Wege, keine Ahnung, viel Möwe.', 'KRAA! Latest report: routes, no idea, lots of gull.'],
      ['KRAA! Exklusiv: Da vorne passiert was. Mehr Infos gegen Fisch.', 'KRAA! Exclusive: something is happening ahead. More details for fish.']
    ]
  },
  isle: {
    'shells-town': [['Shells Town. Eine Marine-Basis, ein Zaun und sehr viel schlechte Laune.', 'Shells Town. One marine base, one fence and a lot of bad mood.']],
    'orange-town': [['Orange Town ist auffallend leer. Und auffallend zirkusartig.', 'Orange Town is suspiciously empty. And suspiciously circus-like.']],
    'syrup': [['Ein ruhiges Dorf mit einem Hang. Ruhige Dörfer sind die verdächtigsten.', 'A quiet village with a slope. Quiet villages are the most suspicious.']],
    'baratie': [['Das Restaurant auf dem Meer. Die Gäste kämpfen hier um Tische. Wörtlich.', 'The restaurant at sea. Guests fight for tables here. Literally.']],
    'gecko-klippen': [['Die Gecko-Klippen. Steil, windig, voller Leute, die einen hypnotisieren wollen.', 'The Gecko Cliffs. Steep, windy, full of people who want to hypnotise you.']],
    'eisenbucht': [['Die Eisenbucht. Hier rostet sogar die Stimmung.', 'Iron Bay. Even the mood rusts here.']],
    'loguetown': [['Loguetown. Hier fing alles an und hier endet so manches. Kein Druck.', 'Loguetown. Everything began here and plenty ended here. No pressure.']],
    'arlong-park': [['Arlong Park. Nami sagt nichts. Das sagt genug.', 'Arlong Park. Nami says nothing. That says enough.']],
    'whisky-peak': [['Whisky Peak. Alle sind sehr nett. Zu nett. Verdächtig nett.', 'Whisky Peak. Everyone is very nice. Too nice. Suspiciously nice.']],
    'little-garden': [['Little Garden. Die Bäume sind groß, die Tiere größer, die Bewohner am größten.', 'Little Garden. The trees are big, the animals bigger, the locals biggest.']],
    'drumm': [['Drumm. Kalt genug, dass sogar Zorro eine Jacke erwägt. Erwägt.', 'Drum. Cold enough that even Zoro considers a jacket. Considers.']],
    'jaya': [['Jaya. Hier lacht man über Träumer. Wir sind Träumer. Passt.', 'Jaya. People laugh at dreamers here. We are dreamers. Fits.']],
    'zwillingskap': [['Das Zwillingskap. Ein Leuchtturm, ein Wal-Gerücht und viel Gegenwind.', 'Twin Cape. One lighthouse, one whale rumour and plenty of headwind.']],
    'alabasta': [['Alabasta. Sand im Schuh, Sand im Essen, Sand in der Seele.', 'Alabasta. Sand in your shoes, sand in your food, sand in your soul.']],
    'skypiea': [['Skypiea. Wolken, auf denen man gehen kann. Die Physik hat Urlaub.', 'Skypiea. Clouds you can walk on. Physics is on holiday.']],
    'water-7': [['Water 7. Kanäle, Werften und Leute, die Schiffe ernster nehmen als Menschen.', 'Water 7. Canals, shipyards and people who take ships more seriously than people.']],
    'enies-gate': [['Das Tor der Gerechtigkeit. Sehr groß. Sehr zu.', 'The Gates of Justice. Very big. Very closed.']]
  },
  near: [
    ['{foe} wartet irgendwo da vorne. Man spürt es. Oder es ist Sanjis Pfeffer.', '{foe} is waiting somewhere ahead. You can feel it. Or it is Sanji’s pepper.'],
    ['Gerüchte sagen, {foe} hat schlechte Laune. Gerüchte haben meistens recht.', 'Rumour says {foe} is in a bad mood. Rumours are usually right.'],
    ['Steckbrief an der Wand: {foe}. Irgendwer hat einen Schnurrbart draufgemalt.', 'Wanted poster on the wall: {foe}. Someone drew a moustache on it.']
  ],
  node: {
    battle: [
      ['Eine Marine-Patrouille macht Mittagspause. Wir könnten sie stören.', 'A marine patrol is on lunch break. We could interrupt.'],
      ['Ein paar Piraten mit viel Muskeln und wenig Plan.', 'A few pirates with lots of muscle and very little plan.'],
      ['Leute mit Säbeln, die „Halt!“ rufen. Klassiker.', 'People with sabres shouting “Halt!”. A classic.'],
      ['Eine Schlägerei im Hafen. Man könnte mitmachen. Man sollte.', 'A harbour brawl. One could join. One should.'],
      ['Soldaten bewachen eine Kiste. Was drin ist, weiß keiner. Genau deshalb.', 'Soldiers guard a crate. Nobody knows what is inside. Exactly why.'],
      ['Eine Bande, die sich „die Gefürchteten“ nennt. Mutig, sich so zu nennen.', 'A gang calling themselves “the Feared”. Bold name choice.'],
      ['Kopfgeldjäger-Lehrlinge. Sie üben noch. An uns.', 'Bounty hunter apprentices. Still practising. On us.'],
      ['Ein Kontrollposten. Papiere haben wir keine. Fäuste schon.', 'A checkpoint. We have no papers. We do have fists.'],
      ['Jemand hat Ruffy „Gummi-Junge“ genannt. Jetzt gibt es Streit.', 'Someone called Luffy “rubber boy”. Now there is a fight.'],
      ['Ein Haufen Marinesoldaten, die gerade einen Kuchen teilen. Bald nicht mehr.', 'A bunch of marines sharing a cake. Not for long.']
    ],
    elite: [
      ['{foe} trainiert am Strand. Mit Felsbrocken. Und mit Passanten.', '{foe} is training on the beach. With boulders. And passers-by.'],
      ['Ein Kopfgeld von dieser Größe sieht man selten. {foe} offenbar auch.', 'You rarely see a bounty this size. Neither does {foe}, apparently.'],
      ['{foe} hat unseren Steckbrief gesehen und fühlt sich herausgefordert.', '{foe} saw our wanted poster and feels challenged.'],
      ['Nami flüstert: „{foe}. Denk an das Kopfgeld.“ Sie denkt an nichts anderes.', 'Nami whispers: “{foe}. Think of the bounty.” She thinks of nothing else.'],
      ['{foe} blockiert die Brücke. Es ist die einzige Brücke. Natürlich.', '{foe} is blocking the bridge. The only bridge. Naturally.'],
      ['Im Lokal sitzt {foe} und isst unser Abendessen. Das wird persönlich.', '{foe} is in the pub eating our dinner. This is getting personal.'],
      ['{foe} hängt am Pier herum und guckt böse. Das Kopfgeld guckt zurück.', '{foe} is hanging around the pier looking mean. The bounty looks back.'],
      ['{foe} ist in der Gegend. Nami hat bereits die Belohnung ausgerechnet.', '{foe} is in the area. Nami has already done the maths on the reward.'],
      ['Ein Steckbrief, ein Gesicht, ein Name: {foe}. Und eine Schatzkiste daneben.', 'One poster, one face, one name: {foe}. And a treasure chest nearby.'],
      ['{foe} sucht Streit. Zorro sucht auch Streit. Was für ein Zufall.', '{foe} is looking for a fight. So is Zoro. What a coincidence.']
    ],
    gate: [
      ['Die Leute flüstern {foe}s Namen nur. Ruffy ruft ihn.', "People only whisper {foe}'s name. Luffy shouts it."],
      ['{foe} hat eine Rede vorbereitet. Wir haben Fäuste vorbereitet.', '{foe} has prepared a speech. We have prepared fists.'],
      ['Ein Schild am Weg: „Eigentum von {foe}. Betreten verboten.“ Gelesen, ignoriert.', 'A sign on the path: “Property of {foe}. Keep out.” Read, ignored.'],
      ['{foe} herrscht über diese Insel. Wer weiter will, muss an ihm vorbei.', '{foe} rules this island. Whoever wants to pass goes through him.'],
      ['Alle Wege führen zu {foe}. Das ist kein Zufall, das ist Inselpolitik.', 'All roads lead to {foe}. Not a coincidence, island politics.'],
      ['{foe} steht da, als hätte er auf uns gewartet. Hat er wahrscheinlich.', '{foe} stands there like he was waiting for us. He probably was.']
    ],
    boss: [
      ['{foe} ist größer als auf dem Steckbrief. Steckbriefe lügen immer.', '{foe} is bigger than on the poster. Posters always lie.'],
      ['Lysop hat sich spontan krank gemeldet. {foe} wartet trotzdem.', 'Usopp called in sick. {foe} is waiting anyway.'],
      ['Das ist der Moment, für den wir gesegelt sind. Und {foe} weiß das.', 'This is what we sailed for. And {foe} knows it.'],
      ['{foe} lacht. Das ist unhöflich. Ruffy lacht zurück. Das ist ansteckend.', '{foe} laughs. Rude. Luffy laughs back. Contagious.'],
      ['{foe}. Der große Brocken. Atmet alle nochmal durch.', '{foe}. The big one. Everybody breathe.'],
      ['Da ist {foe}. Ruffy grinst. Das ist entweder gut oder sehr schlecht.', 'There is {foe}. Luffy grins. Either very good or very bad.'],
      ['{foe} wartet. Wer jetzt noch heilen will, sollte das vorher getan haben.', '{foe} is waiting. If you wanted to heal, you should have done it before.']
    ],
    raid: [
      ['Die Wellen werden höher. Nami sagt, das ist kein Wetter. Das ist ein Gegner.', 'The waves grow taller. Nami says that is not weather. That is an enemy.'],
      ['Ein Schatten, so groß wie eine Insel. Er hat Augen. Er hat Hunger.', 'A shadow as big as an island. It has eyes. It is hungry.'],
      ['Wer das hier schafft, bekommt eine Frucht für immer. Wer nicht, eine Geschichte.', 'Win this and you get a fruit forever. Lose and you get a story.'],
      ['Etwas Riesiges bewegt sich unter Wasser. Klug wäre umdrehen. Wir sind nicht klug.', 'Something huge moves under water. Smart would be turning back. We are not smart.'],
      ['Ein Gegner, über den man Lieder singt. Traurige Lieder, meistens.', 'A foe they sing songs about. Sad songs, mostly.']
    ],
    recruit: [
      ['Ein Musiker ohne Publikum, ein Koch ohne Küche, ein Schwertkämpfer ohne Orientierung.', 'A musician with no audience, a cook with no kitchen, a swordsman with no sense of direction.'],
      ['Am schwarzen Brett: „Suche Crew. Kann alles. Außer Schwimmen.“', 'On the notice board: “Seeking crew. Can do anything. Except swim.”'],
      ['Eine Taverne, in der die Tische wackeln und die Leute nicht.', 'A tavern where the tables wobble and the people do not.'],
      ['Jemand fordert Ruffy zum Wetttrinken heraus. Mit Milch. Ruffy verliert nie.', 'Someone challenges Luffy to a drinking contest. With milk. Luffy never loses.'],
      ['Eine Taverne mit Leuten, die heimlich auf ein Abenteuer warten.', 'A tavern full of people secretly waiting for an adventure.'],
      ['Ein Lokal, in dem jemand sehr laut erzählt, wie stark er ist. Wir prüfen das.', 'A pub where someone is loudly explaining how strong he is. We will check.'],
      ['Eine Kneipe, ein schiefes Schild, ein paar neue Gesichter.', 'One pub, one crooked sign, a few new faces.'],
      ['Ruffy will „nur mal gucken“ und kommt mit drei neuen Freunden zurück.', 'Luffy wants to “just have a look” and comes back with three new friends.'],
      ['Ein Hafenlokal. Sanji sagt, das Essen ist schlecht. Die Leute sind gut.', 'A harbour pub. Sanji says the food is bad. The people are good.'],
      ['Ein Treffpunkt für Glücksritter. Alle suchen eine Crew. Wir haben eine.', 'A meeting spot for fortune seekers. Everyone wants a crew. We have one.']
    ],
    fruit: [
      ['Ein Pirat verkauft eine Frucht „mit kleinem Haken“. Der Haken: Man sinkt.', 'A pirate sells a fruit “with a small catch”. The catch: you sink.'],
      ['Eine Frucht treibt im Wasser. Wer schwimmt hin? Niemand mit Frucht.', 'A fruit drifts in the water. Who swims for it? Nobody with a fruit.'],
      ['Robin hat in einer Ruine eine Frucht gefunden. Sie war im Bilderbuch.', 'Robin found a fruit in a ruin. It was in a picture book.'],
      ['Ein Marktstand mit dem Schild: „Garantiert verflucht. Halber Preis.“', 'A market stall with a sign: “Guaranteed cursed. Half price.”'],
      ['Ein Baum mit einer einzelnen, sehr seltsamen Frucht. Schmeckt bestimmt furchtbar.', 'A tree with one very strange fruit. Surely tastes awful.'],
      ['Ein Händler mit „ganz normalem Obst“. Es ist nicht normal.', 'A merchant selling “perfectly normal fruit”. It is not normal.'],
      ['Eine Kiste mit spiralförmigen Früchten. Jemand hat „Nicht essen“ draufgeschrieben.', 'A crate of swirly fruit. Someone wrote “do not eat” on it.'],
      ['Ein Markt, auf dem eine Frucht leise brummt. Brummen ist kein gutes Zeichen.', 'A market where one fruit hums quietly. Humming is not a good sign.'],
      ['Ein verlassener Garten. Die Früchte darin sehen aus, als hätten sie Pläne.', 'An abandoned garden. The fruit in it looks like it has plans.']
    ],
    treasure: [
      ['Lysop hat eine Schatzkarte gezeichnet. Diesmal stimmt sie angeblich.', 'Usopp drew a treasure map. This time it is supposedly accurate.'],
      ['Eine Kiste mit drei Schlössern. Franky hat drei Hämmer.', 'A chest with three locks. Franky has three hammers.'],
      ['Ein Papagei sagt immer wieder „Gold unter der Palme“. Wir glauben dem Papagei.', 'A parrot keeps saying “gold under the palm”. We trust the parrot.'],
      ['Hinter einem Wasserfall glitzert etwas. Entweder Gold oder ein sehr nasser Spiegel.', 'Something glitters behind a waterfall. Gold or a very wet mirror.'],
      ['Ein X auf dem Boden. Entweder Schatz oder sehr fauler Kartenzeichner.', 'An X on the ground. Either treasure or a very lazy mapmaker.'],
      ['Eine Truhe in einer Höhle. Nami ist schon drin, bevor wir fragen.', 'A chest in a cave. Nami is inside before we can ask.'],
      ['Ein Wrack mit glänzendem Bauch. Glänzen ist gut.', 'A wreck with a shiny belly. Shiny is good.'],
      ['Eine alte Ruine. Robin lächelt. Das heißt meistens: Schatz.', 'An old ruin. Robin smiles. That usually means treasure.'],
      ['Ein Haufen Kisten, die keinem zu gehören scheinen. Bis jetzt.', 'A pile of crates that seem to belong to no one. Until now.']
    ],
    rest: [
      ['Ein Fischerdorf lädt zum Essen ein. Sanji ist beleidigt und dankbar zugleich.', 'A fishing village invites us to eat. Sanji is offended and grateful at once.'],
      ['Ein stiller Hafen, in dem nur die Möwen streiten.', 'A quiet harbour where only the gulls argue.'],
      ['Eine Hängematte zwischen zwei Palmen. Wer zuerst da ist, gewinnt.', 'A hammock between two palms. First come, first served.'],
      ['Ein Badetag. Franky poliert das Schiff, alle anderen sich selbst.', 'A bath day. Franky polishes the ship, everyone else themselves.'],
      ['Ein Abend ohne Gefahr. Brook spielt leise. Sogar Zorro hört zu.', 'An evening without danger. Brook plays softly. Even Zoro listens.'],
      ['Ein Strand mit Palmen und Schatten. Selbst Zorro würde hier freiwillig schlafen.', 'A beach with palms and shade. Even Zoro would sleep here voluntarily.'],
      ['Eine ruhige Bucht. Sanji kocht, Chopper verbindet, alle atmen durch.', 'A calm bay. Sanji cooks, Chopper bandages, everyone breathes.'],
      ['Eine heiße Quelle. Brook sagt, sie wärmt bis auf die Knochen. Er muss es wissen.', 'A hot spring. Brook says it warms you to the bone. He would know.'],
      ['Ein Lagerfeuer am Ufer. Lysop erzählt Lügen, alle hören zu.', 'A campfire on the shore. Usopp tells lies, everyone listens.'],
      ['Eine Wiese ohne Feinde. Verdächtig, aber gemütlich.', 'A meadow without enemies. Suspicious, but cosy.']
    ]
  }
};
