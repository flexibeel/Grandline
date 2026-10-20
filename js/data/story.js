// Story „Das Rezept vom Ende der Welt": kurze, witzige Szenen, die nach und nach freischalten.
//   when(p)  = ab wann die Szene kommt, need = kurzer Hinweis dazu
//   bg       = Bühne: hafen, nacht, schiff, insel, kueche
//   lines    = [Sprecher, Deutsch, Englisch, Emote?, Effekt?]
//   Sprecher: 'self' (du), Crew-ID oder 'kalle' (Zeitungsmöwe)
//   Effekte:  shake (Bild wackelt), zoom (Kamera auf Sprecher), jump (alle hüpfen), flash, dramatic (Trommelwirbel), boing, sparkle
window.GL = window.GL || {};
GL.data = GL.data || {};

(function () {
  const runs = p => (p.stats && p.stats.runs) || 0;
  const wins = p => (p.stats && p.stats.wins) || 0;
  const bosses = p => Object.keys(p.counts || {}).filter(k => k.indexOf('defeated:') === 0).reduce((s, k) => s + (p.counts[k] || 0), 0);
  const landgang = p => Object.values(p.dungeons || {}).reduce((s, d) => s + ((d && d.clears) || 0), 0);
  const rank = p => (GL.meta && GL.meta.rankIndex ? GL.meta.rankIndex(p) : 0);

  GL.data.story = [
    { id: 'c1', no: 1, bg: 'hafen', when: p => !!p.nickname,
      title: ['Ein Neuer an Bord', 'New on board'], need: ['Sofort', 'Right away'],
      lines: [
        ['ruffy', 'HE! DU! Willst du in meine Crew?', 'HEY! YOU! Wanna join my crew?', '!', 'zoom'],
        ['self', 'Ich wollte eigentlich nur fragen, wo es zum Bäcker geht.', 'I actually just wanted to ask where the bakery is.', '💦'],
        ['nami', 'Sag einfach ja. Er fragt sonst, bis die Sonne untergeht. Und dann noch mal.', 'Just say yes. Otherwise he asks until sunset. And then again.'],
        ['ruffy', 'Abgemacht! Du bist jetzt Kapitän in Ausbildung. Das Gehalt ist Abenteuer.', 'Deal! You are now captain-in-training. The salary is adventure.', '✨', 'jump'],
        ['zorro', 'Hmpf. Hauptsache, du kannst rudern. Ich kann es nämlich nicht. Aus Prinzip.', 'Hmph. As long as you can row. I cannot. On principle.'],
        ['ruffy', 'LEINEN LOS! Irgendwo da draußen wartet das beste Fleisch der Welt!', 'CAST OFF! Somewhere out there the best meat in the world is waiting!', '🍖', 'shake']
      ] },
    { id: 'c2', no: 2, bg: 'schiff', when: p => runs(p) >= 1,
      title: ['Die Flaschenpost', 'Message in a bottle'], need: ['Nach deiner ersten Fahrt', 'After your first voyage'],
      lines: [
        ['ruffy', 'Eine Flasche! Mit Papier drin! Ist das ein Snack?', 'A bottle! With paper inside! Is it a snack?', '!', 'boing'],
        ['sanji', 'Das ist eine Seite aus einem Kochbuch. Nimm sie aus dem Mund.', 'That is a page from a cookbook. Take it out of your mouth.', '💢'],
        ['self', '„Das Ur-Fleisch. Wer es isst, wird nie wieder hungrig.“', '“The Primal Meat. Whoever eats it is never hungry again.”', '', 'dramatic'],
        ['ruffy', 'NIE WIEDER HUNGRIG?! Das klingt furchtbar. Ich will es sofort.', 'NEVER HUNGRY AGAIN?! That sounds awful. I want it right now.', '😱', 'shake'],
        ['nami', 'Ein Rezept, das Millionen wert ist. Ich nehme bescheidene neunzig Prozent.', 'A recipe worth millions. I will take a modest ninety percent.', '💰', 'sparkle'],
        ['zorro', 'Steht da noch was drauf?', 'Anything else on it?'],
        ['self', '„Sammle alle sieben Seiten.“', '“Collect all seven pages.”'],
        ['zorro', 'Sieben. Natürlich sieben. Nie ist es eine.', 'Seven. Of course seven. It is never one.', '💢']
      ] },
    { id: 'c3', no: 3, bg: 'insel', when: p => runs(p) >= 3,
      title: ['Die Insel, die weglief', 'The island that ran away'], need: ['Nach 3 Fahrten', 'After 3 voyages'],
      lines: [
        ['nami', 'Zorro. Drei Stunden. Die Insel ist so groß wie ein Badetuch.', 'Zoro. Three hours. The island is the size of a beach towel.', '💢', 'zoom'],
        ['zorro', 'Ich hab mich nicht verlaufen. Die Insel hat sich bewegt.', 'I did not get lost. The island moved.'],
        ['self', 'Wenn ich ehrlich bin, klingt das fast glaubwürdig.', 'To be honest, that almost sounds believable.', '💦'],
        ['lysop', 'Ich hab mal eine Insel gefangen! Mit bloßen Händen! Sie war … klein.', 'I once caught an island! With my bare hands! It was… small.', '✨', 'jump'],
        ['nami', 'Lysop.', 'Usopp.', '', 'dramatic'],
        ['lysop', 'Es war ein Stein. Ein großer, inselhafter Stein.', 'It was a rock. A large, island-like rock.', '💦'],
        ['zorro', 'Egal. Lag im Gebüsch. Eure komische Seite.', 'Whatever. It was in the bushes. Your weird page.'],
        ['ruffy', 'SEITE ZWEI! Zorro, du bist ein Genie im Verlaufen!', 'PAGE TWO! Zoro, you are a genius at getting lost!', '♥', 'jump']
      ] },
    { id: 'c4', no: 4, bg: 'kueche', when: p => bosses(p) >= 1,
      title: ['Siegesessen', 'Victory dinner'], need: ['Nach deinem ersten besiegten Bösewicht', 'After your first defeated villain'],
      lines: [
        ['sanji', 'Siegesessen. Für Ruffy: Fleisch, gefolgt von Fleisch, als Dessert Fleisch.', 'Victory dinner. For Luffy: meat, followed by meat, with meat for dessert.', '♪', 'sparkle'],
        ['ruffy', 'Sanji, das ist das Schönste, was je jemand für mich gekocht hat. Bis morgen.', 'Sanji, this is the most beautiful thing anyone ever cooked for me. Until tomorrow.', '♥', 'boing'],
        ['chopper', 'Der Bösewicht hatte Seite drei in der Hosentasche!', 'The villain had page three in his pocket!', '!', 'jump'],
        ['self', '„…nur wer nicht allein isst, findet den Weg.“', '“…only those who never eat alone will find the way.”', '', 'dramatic'],
        ['robin', 'Kein Rezept. Ein Rätsel. Wie die meisten guten Dinge.', 'Not a recipe. A riddle. Like most good things.'],
        ['self', 'Chopper, du hast das echt gut gemacht.', 'Chopper, you did really well.'],
        ['chopper', 'Lob macht mich überhaupt nicht glücklich, du Idiot! … Sag es noch mal.', 'Praise does not make me happy at all, you jerk! … Say it again.', '♥', 'shake']
      ] },
    { id: 'c5', no: 5, bg: 'hafen', when: p => GL.meta && GL.meta.squadUnlocked && GL.meta.squadUnlocked(p),
      title: ['Ein Zuhause im Hafen', 'A home in the harbor'], need: ['Wenn deine Stammcrew freigeschaltet ist', 'When your home crew unlocks'],
      lines: [
        ['franky', 'SUUUPER! Ich hab euch ein Hafenhaus gebaut! Mit Cola-Brunnen!', 'SUUUPER! I built you a harbor house! With a cola fountain!', '✨', 'shake'],
        ['nami', 'Und wer hat das bezahlt?', 'And who paid for it?', '💢', 'zoom'],
        ['franky', 'Das ist eine sehr gute Frage. Nächste Frage!', 'That is an excellent question. Next question!', '💦', 'boing'],
        ['robin', 'Ein Ort, an den man zurückkehrt. Das ist mehr wert als Gold.', 'A place to come back to. That is worth more than gold.', '♥'],
        ['nami', 'Nichts ist mehr wert als Gold. … Aber die Kissen sind wirklich weich.', 'Nothing is worth more than gold. … But the cushions are really soft.'],
        ['self', 'Hinter dem Bild klebt was. Seite vier!', 'Something is stuck behind the painting. Page four!', '!', 'jump'],
        ['ruffy', 'Wir bleiben! Also, zwischen den Abenteuern. Und zum Essen. Vor allem zum Essen.', 'We stay! Between adventures, that is. And for meals. Mostly for meals.', '♪']
      ] },
    { id: 'c6', no: 6, bg: 'nacht', when: p => landgang(p) >= 1 || runs(p) >= 8,
      title: ['Ein Lied für Seite fünf', 'A song for page five'], need: ['Nach deinem ersten Landgang (oder 8 Fahrten)', 'After your first shore leave (or 8 voyages)'],
      lines: [
        ['brook', 'Yohoho! Ich habe Noten am Strand gefunden. Darf ich?', 'Yohoho! I found sheet music on the beach. May I?', '♪', 'sparkle'],
        ['self', 'Moment … das ist Seite fünf. Das Rezept ist ein LIED?', 'Wait… that is page five. The recipe is a SONG?', '?', 'zoom'],
        ['sanji', 'Ein gutes Gericht hat Rhythmus. Ich sage das seit Jahren. Keiner hört zu.', 'A good dish has rhythm. I have said so for years. Nobody listens.'],
        ['ruffy', 'Fleisch mit Musik. Ich wusste nicht, dass ich das brauche.', 'Meat with music. I did not know I needed this.', '🍖', 'jump'],
        ['brook', 'Mir kommen die Tränen. Obwohl ich gar keine Augen habe!', 'I am moved to tears. Even though I have no eyes!', '💦', 'boing'],
        ['zorro', '…Spiel. Aber leise. Ich bin offiziell im Dienst. Also schlafe ich.', '…Play. But quietly. I am officially on duty. So I am sleeping.', 'Zz']
      ] },
    { id: 'c7', no: 7, bg: 'insel', when: p => wins(p) >= 1,
      title: ['Am Ende der Grand Line', 'At the end of the Grand Line'], need: ['Nach deinem ersten ganzen Sieg', 'After your first full victory'],
      lines: [
        ['ruffy', 'GESCHAFFT! WO IST DAS FLEISCH?!', 'WE MADE IT! WHERE IS THE MEAT?!', '!', 'shake'],
        ['robin', 'Seite sechs und sieben. Ich lese vor.', 'Pages six and seven. I will read.', '', 'dramatic'],
        ['robin', '„Das Ur-Fleisch ist kein Fleisch. Es ist das Essen, das man mit seiner Crew teilt.“', '“The Primal Meat is not meat. It is the meal you share with your crew.”', '✨', 'flash'],
        ['ruffy', '…Also KEIN Fleisch?', '…So NO meat?', '😱', 'zoom'],
        ['sanji', 'Doch. Auch Fleisch. Ich koche heute alles, was der Kühlschrank hergibt.', 'Yes. Also meat. Tonight I cook everything the fridge has.', '♪'],
        ['ruffy', 'Puh. Ich hatte kurz Angst um die Welt.', 'Phew. For a second I feared for the world.', '💦', 'boing'],
        ['nami', 'Und die Millionen?', 'And the millions?', '💢'],
        ['ruffy', 'Wir fahren einfach noch mal! Mit euch ist es am schönsten!', 'We just sail again! It is best with you guys!', '♥', 'jump']
      ] },
    { id: 'c8', no: 8, bg: 'hafen', when: p => wins(p) >= 2 || rank(p) >= 10,
      title: ['Eilmeldung!', 'Breaking news!'], need: ['Nach 2 Siegen oder Rang 11', 'After 2 victories or rank 11'],
      lines: [
        ['kalle', 'KRAA! Eilmeldung! KRAA! Ich werde nach Wörtern bezahlt!', 'KRAA! Breaking news! KRAA! I am paid by the word!', '!', 'shake'],
        ['nami', '„Fake-Strohhüte auf allen Märkten. Das Original? Ausverkauft.“', '“Fake straw hats at every market. The original? Sold out.”', '', 'dramatic'],
        ['ruffy', 'FAKE-STROHHÜTE?! Das ist Betrug!', 'FAKE STRAW HATS?! That is fraud!', '💢', 'zoom'],
        ['nami', 'Das ist Geschäftssinn. Ich bin ein bisschen beeindruckt.', 'That is business sense. I am a little impressed.', '💰'],
        ['lysop', 'Ich hab den Händler gesehen! Augenklappe. Drei Beine. Oder zwei. Es war dunkel.', 'I saw the seller! Eye patch. Three legs. Or two. It was dark.', '💦', 'boing'],
        ['ruffy', 'Fortsetzung folgt! … Gibt es da Essen?', 'To be continued! … Is there food?', '?', 'jump']
      ] }
  ];
})();

// Einspieler zum Live-Start (18.10.2026, 18 Uhr). Läuft einmal nach dem frischen Start, nicht Teil der Kapitel-Reihe.
GL.data.storyLaunch = [
  { id: 'launch', no: 0, bg: 'hafen', kicker: ['Live-Event', 'Live event'],
    title: ['Leinen los auf der Grand Line', 'Cast off on the Grand Line'], need: ['Live-Start', 'Live start'],
    lines: [
      ['kalle', 'KRAA! Extrablatt! Das große Update ist da! Ich habe es vor allen anderen gewusst!', 'KRAA! Extra! The big update is here! I knew before everyone!', '!', 'shake'],
      ['nami', 'Die Rangliste fängt um 18 Uhr bei null an. Meine Erfolge sind trotzdem noch da, ja? JA?', 'The leaderboard starts at zero at 6 pm. My achievements are still there, right? RIGHT?', '💢', 'zoom'],
      ['robin', 'Es begann an einem Herbstabend. Ein junger Kapitän namens Felix wollte etwas Gemütliches bauen.', 'It began on an autumn evening. A young captain named Felix wanted to build something cozy.', '', 'dramatic'],
      ['robin', 'Erst ein Schiff aus Pixeln. Dann eine Crew. Dann Inseln, Schätze und eine erstaunliche Menge Fehler.', 'First a ship made of pixels. Then a crew. Then islands, treasure and an astonishing number of bugs.'],
      ['nami', 'Und dann kamen die Testpiraten und sind tausendmal untergegangen. Danke. Wirklich.', 'And then the test pirates came and sank a thousand times. Thank you. Really.', '♥', 'sparkle'],
      ['franky', 'Neuer Rumpf, neue Segel, ein Skillbaum und eine Bordkanone! Alles SUUUPER, alles bezahlt! Glaube ich!', 'New hull, new sails, a skill tree and a deck cannon! All SUUUPER, all paid for! I think!', '✨', 'sparkle'],
      ['zorro', 'Alle an derselben Startlinie. Endlich ein fairer Kampf.', 'Everyone at the same starting line. Finally a fair fight.'],
      ['self', 'Und was gewinnt, wer zuerst die beste Beute hat?', 'And what does whoever gets the best loot first win?', '?'],
      ['ruffy', 'Ruhm! Ehre! Und den besten Platz am Tisch, wenn wir danach alle zusammen essen!', 'Glory! Honor! And the best seat at the table when we all eat together afterwards!', '🍖', 'jump'],
      ['ruffy', 'LEINEN LOS! AUF DIE GRAND LINE!', 'CAST OFF! TO THE GRAND LINE!', '!', 'flash']
    ] },
  // Update-Szene für Rückkehrer: Der Spielmacher fliegt ein (late = erscheint erst bei seinem ersten Satz).
  // Den Schlachtruf (Zeile mit 'ARRR') kann man frei austauschen.
  { id: 'u-spielmacher', no: 0, bg: 'hafen', late: ['dev'], kicker: ['Update', 'Update'],
    title: ['Besuch von ganz oben', 'A visitor from above'], need: ['Nach dem Update', 'After the update'],
    lines: [
      ['ruffy', 'Da bist du ja wieder! Wir haben hier auf dem Steg gewartet. Die ganze Zeit. Ohne Essen.', 'There you are again! We waited right here on the pier. The whole time. Without food.', '!', 'jump'],
      ['nami', 'Er hat zwei Fässer Fleisch gegessen. „Ohne Essen“ ist eine kühne Behauptung.', 'He ate two barrels of meat. “Without food” is a bold claim.', '💢'],
      ['kalle', 'KRAA! Da oben! Ist das ein Vogel? Ein Schiff? Eine Möwe mit Ambitionen?!', 'KRAA! Up there! Is it a bird? A ship? A seagull with ambitions?!', '!', 'dramatic'],
      ['dev', 'ARRR! Macht Platz, ihr Landratten! Hier landet der Kerl mit dem Schlüssel zum Code!', 'ARRR! Make way, landlubbers! Here lands the guy with the key to the code!', '✨', 'flash'],
      ['dev', 'Ich bin …', 'I am …', '', 'dramatic'],
      ['dev', '… ich.', '… me.', ''],
      ['zorro', 'Sehr hilfreich.', 'Very helpful.', '💦'],
      ['dev', 'Flex. Für Freunde: Flex. Für Feinde: auch Flex. Ich hab mir nur einen Namen gemerkt.', 'Flex. Friends call me Flex. Enemies also call me Flex. I only memorized one name.', '😎'],
      ['dev', 'Ich hab dieses Spiel gebaut. Die Inseln, die Crew, die Kanonen. Und ehrlich gesagt auch die meisten Fehler.', 'I built this game. The islands, the crew, the cannons. And honestly, most of the bugs too.', '', 'zoom'],
      ['zorro', 'Dann bist du also schuld, dass ich mich auf der Karte ständig verlaufe.', 'So you are the reason I keep getting lost on the map.', '?'],
      ['dev', 'Nein. Das schaffst du ganz allein.', 'No. You manage that all by yourself.', '😏'],
      ['dev', 'Hört zu, Piraten: Ab jetzt kommen regelmäßig Updates. Und ihr bestimmt mit, wohin die Reise geht.', 'Listen up, pirates: updates will keep coming. And you help decide where the voyage goes.', '', 'zoom'],
      ['dev', 'Nervt euch was? Fehlt was? Unten im Hafen unter „★ Feedback“ landet alles direkt bei mir. Ich lese wirklich jeden Zettel.', 'Something annoying? Something missing? Down in the harbor under “★ Feedback” it all lands right with me. I really read every note.', '♥', 'sparkle'],
      ['robin', 'Sogar die mit den Rechtschreibfehlern. Er korrigiert sie nur nicht.', 'Even the ones with spelling mistakes. He just does not correct them.'],
      ['dev', 'Das Spiel bleibt kostenlos. Wer etwas Gutes tun will: Das nächste Tierheim freut sich mehr als ich.', 'The game stays free. If you want to do something nice: your local animal shelter needs it more than I do.', '🐾'],
      ['ruffy', 'Verstanden! Also: ESSEN! Äh … ich meine: LEINEN LOS!', 'Got it! So: FOOD! Uh … I mean: CAST OFF!', '🍖', 'jump']
    ] }
];
