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
        ['ruffy', 'EY! Du! Willst du in meine Crew?', 'HEY! You! Wanna join my crew?', '!', 'zoom'],
        ['self', 'Ich wollte nur nach dem Weg fragen…', 'I just wanted directions…', '💦'],
        ['nami', 'Sag ja. Sonst fragt er noch 200 Mal. Ich hab mitgezählt.', 'Say yes. Or he asks 200 more times. I counted.'],
        ['ruffy', 'Abgemacht! Du bist jetzt Kapitän in Ausbildung!', 'Deal! You are now captain-in-training!', '✨', 'jump'],
        ['zorro', 'Hmpf. Hauptsache, er kann rudern.', 'Hmph. As long as they can row.'],
        ['ruffy', 'LEINEN LOS! Irgendwo da draußen gibt es das beste Fleisch der Welt!', 'CAST OFF! Somewhere out there is the best meat in the world!', '🍖', 'shake']
      ] },
    { id: 'c2', no: 2, bg: 'schiff', when: p => runs(p) >= 1,
      title: ['Die Flaschenpost', 'Message in a bottle'], need: ['Nach deiner ersten Fahrt', 'After your first voyage'],
      lines: [
        ['ruffy', 'Eine Flasche! Mit Papier drin! Kann man das essen?', 'A bottle! With paper inside! Can I eat it?', '!', 'boing'],
        ['sanji', 'NEIN. … Das ist eine Seite aus einem Kochbuch.', 'NO. … This is a page from a cookbook.', '💢'],
        ['self', '„Das Ur-Fleisch. Wer es isst, wird nie wieder hungrig.“', '“The Primal Meat. Whoever eats it is never hungry again.”', '', 'dramatic'],
        ['ruffy', 'NIE WIEDER HUNGRIG?! Klingt gruselig. Ich will es trotzdem.', 'NEVER HUNGRY AGAIN?! Sounds scary. I still want it.', '😱', 'shake'],
        ['nami', 'Wenn das echt ist: Millionen. Ich sag nur: Gewinnbeteiligung.', 'If it is real: millions. Just saying: profit share.', '💰', 'sparkle'],
        ['zorro', 'Steht da noch was?', 'Anything else on it?'],
        ['self', '„Sammle alle sieben Seiten.“', '“Collect all seven pages.”'],
        ['zorro', 'Sieben?! Das sind ja Hausaufgaben.', 'Seven?! That is homework.', '💢']
      ] },
    { id: 'c3', no: 3, bg: 'insel', when: p => runs(p) >= 3,
      title: ['Die Insel, die weglief', 'The island that ran away'], need: ['Nach 3 Fahrten', 'After 3 voyages'],
      lines: [
        ['nami', 'Zorro. Drei Stunden. Wo warst du?!', 'Zoro. Three hours. Where were you?!', '💢', 'zoom'],
        ['zorro', 'Ich hab mich nicht verlaufen. Die Insel ist weggelaufen.', 'I did not get lost. The island ran away.'],
        ['self', 'Lowkey glaub ich ihm das.', 'Lowkey, I believe him.', '💦'],
        ['lysop', 'Ich hab mal eine Insel gefangen! Mit bloßen Händen!', 'I once caught an island! With my bare hands!', '✨', 'jump'],
        ['nami', 'Cap.', 'Cap.', '', 'dramatic'],
        ['lysop', 'N-no cap! … Okay, ein bisschen cap.', 'N-no cap! … Okay, a little cap.', '💦'],
        ['zorro', 'Egal. Lag im Gebüsch. Eure komische Seite.', 'Whatever. Was in the bushes. Your weird page.'],
        ['ruffy', 'SEITE ZWEI! Zorro, du Legende!', 'PAGE TWO! Zoro, you legend!', '♥', 'jump']
      ] },
    { id: 'c4', no: 4, bg: 'kueche', when: p => bosses(p) >= 1,
      title: ['Siegesessen', 'Victory dinner'], need: ['Nach deinem ersten besiegten Bösewicht', 'After your first defeated villain'],
      lines: [
        ['sanji', 'Siegesessen! Für Ruffy: Drei-Gänge-Fleisch.', 'Victory dinner! For Luffy: three courses of meat.', '♪', 'sparkle'],
        ['ruffy', 'Sanji, ich liebe dich. Wegen dem Fleisch.', 'Sanji, I love you. Because of the meat.', '♥', 'boing'],
        ['chopper', 'Der Bösewicht hatte Seite drei in der Tasche!', 'The villain had page three in his pocket!', '!', 'jump'],
        ['self', '„…nur wer nicht allein isst, findet den Weg.“', '“…only those who never eat alone will find the way.”', '', 'dramatic'],
        ['robin', 'Kein Rezept. Ein Rätsel. Fufu.', 'Not a recipe. A riddle. Fufu.'],
        ['self', 'Chopper, du bist voll süß.', 'Chopper, you are so cute.'],
        ['chopper', 'Sag das nicht, du Idiot! … Sag es nochmal.', 'Don’t say that, you jerk! … Say it again.', '♥', 'shake']
      ] },
    { id: 'c5', no: 5, bg: 'hafen', when: p => GL.meta && GL.meta.squadUnlocked && GL.meta.squadUnlocked(p),
      title: ['Ein Zuhause im Hafen', 'A home in the harbor'], need: ['Wenn deine Stammcrew freigeschaltet ist', 'When your home crew unlocks'],
      lines: [
        ['franky', 'SUUUPER! Ich hab euch ein Hafenhaus gebaut! Mit Cola-Brunnen!', 'SUUUPER! I built you a harbor house! With a cola fountain!', '✨', 'shake'],
        ['nami', 'Und wer hat das bezahlt?', 'And who paid for it?', '💢', 'zoom'],
        ['franky', '…Nächste Frage!', '…Next question!', '💦', 'boing'],
        ['robin', 'Ein Ort, an den man zurückkehrt. Mehr wert als Gold.', 'A place to come back to. Worth more than gold.', '♥'],
        ['nami', 'NICHTS ist mehr wert als Gold. … Aber es ist gemütlich.', 'NOTHING is worth more than gold. … But it is cozy.'],
        ['self', 'Hinterm Bild! Seite vier!', 'Behind the painting! Page four!', '!', 'jump'],
        ['ruffy', 'Das Haus hat Rizz. Wir bleiben. Also, zwischen den Abenteuern.', 'This house has rizz. We stay. Between adventures.', '♪']
      ] },
    { id: 'c6', no: 6, bg: 'nacht', when: p => landgang(p) >= 1 || runs(p) >= 8,
      title: ['Ein Lied für Seite fünf', 'A song for page five'], need: ['Nach deinem ersten Landgang (oder 8 Fahrten)', 'After your first shore leave (or 8 voyages)'],
      lines: [
        ['brook', 'Yohoho! Noten am Strand gefunden. Darf ich?', 'Yohoho! Found sheet music on the beach. May I?', '♪', 'sparkle'],
        ['self', 'Moment… das ist Seite fünf! Das Rezept ist ein LIED?', 'Wait… that is page five! The recipe is a SONG?', '?', 'zoom'],
        ['sanji', 'Ein Gericht braucht Rhythmus. Sag ich ja immer.', 'A dish needs rhythm. I always say so.'],
        ['ruffy', 'Fleisch mit Musik. DAS ist der Vibe.', 'Meat with music. THAT is the vibe.', '🍖', 'jump'],
        ['brook', 'Mir kommen die Tränen. Obwohl ich keine Augen habe!', 'I am tearing up. Even though I have no eyes!', '💦', 'boing'],
        ['zorro', '…Spiel. Aber leise. Ich penn gleich.', '…Play. But quietly. Napping soon.', 'Zz']
      ] },
    { id: 'c7', no: 7, bg: 'insel', when: p => wins(p) >= 1,
      title: ['Am Ende der Grand Line', 'At the end of the Grand Line'], need: ['Nach deinem ersten ganzen Sieg', 'After your first full victory'],
      lines: [
        ['ruffy', 'GESCHAFFT! WO IST DAS FLEISCH?!', 'WE MADE IT! WHERE IS THE MEAT?!', '!', 'shake'],
        ['robin', 'Seite sechs und sieben. Ich lese vor.', 'Pages six and seven. I will read.', '', 'dramatic'],
        ['robin', '„Das Ur-Fleisch ist kein Fleisch. Es ist das Essen, das man mit seiner Crew teilt.“', '“The Primal Meat is not meat. It is the meal you share with your crew.”', '✨', 'flash'],
        ['ruffy', '…Also KEIN Fleisch?', '…So NO meat?', '😱', 'zoom'],
        ['sanji', 'Doch. Auch Fleisch. Ich koch heute alles.', 'Yes. Also meat. I am cooking everything.', '♪'],
        ['ruffy', 'PUH.', 'PHEW.', '💦', 'boing'],
        ['nami', 'Und das GELD?', 'And the MONEY?', '💢'],
        ['ruffy', 'Wir fahren nochmal! Mit euch ist es einfach am schönsten!', 'We sail again! With you guys it is just the best!', '♥', 'jump']
      ] },
    { id: 'c8', no: 8, bg: 'hafen', when: p => wins(p) >= 2 || rank(p) >= 10,
      title: ['Eilmeldung!', 'Breaking news!'], need: ['Nach 2 Siegen oder Rang 11', 'After 2 victories or rank 11'],
      lines: [
        ['kalle', 'KRAA! Eilmeldung! KRAA!', 'KRAA! Breaking news! KRAA!', '!', 'shake'],
        ['nami', '„Fake-Strohhüte auf allen Märkten. Original? Ausverkauft.“', '“Fake straw hats at every market. The original? Sold out.”', '', 'dramatic'],
        ['ruffy', 'FAKE-STROHHÜTE?! Das ist Betrug!', 'FAKE STRAW HATS?! That is fraud!', '💢', 'zoom'],
        ['nami', '…Das ist Business. Respekt ehrlich.', '…That is business. Honestly, respect.', '💰'],
        ['lysop', 'Ich hab den Händler gesehen! Augenklappe. Drei Beine. Oder zwei.', 'I saw the seller! Eye patch. Three legs. Or two.', '💦', 'boing'],
        ['ruffy', 'Fortsetzung folgt! … Gibt es da Essen?', 'To be continued! … Is there food?', '?', 'jump']
      ] }
  ];
})();

// Einspieler zum Live-Start (18.10.2026, 18 Uhr). Läuft einmal nach dem frischen Start, nicht Teil der Kapitel-Reihe.
GL.data.storyLaunch = [
  { id: 'launch', no: 0, bg: 'hafen', kicker: ['Live-Event', 'Live event'],
    title: ['Leinen los auf der Grand Line', 'Cast off on the Grand Line'], need: ['Live-Start', 'Live start'],
    lines: [
      ['kalle', 'KRAA! Extrablatt! KRAA! Das große Update auf der Grand Line ist da!', 'KRAA! Extra! KRAA! The big update on the Grand Line is here!', '!', 'shake'],
      ['nami', 'Moment. Die Rangliste fängt bei null an? Auch MEIN Platz?!', 'Wait. The leaderboard starts at zero? MY spot too?!', '💢', 'zoom'],
      ['robin', 'Es begann an einem Herbstabend. Ein junger Kapitän namens Felix wollte ein gemütliches Abenteuer bauen.', 'It began on an autumn evening. A young captain named Felix wanted to build a cozy adventure.', '', 'dramatic'],
      ['robin', 'Erst ein Schiff aus Pixeln. Dann eine Crew. Dann Inseln, Schätze und ziemlich viele Bugs.', 'First a ship made of pixels. Then a crew. Then islands, treasure and quite a lot of bugs.'],
      ['nami', 'Und dann kamen die Testpiraten. Tausende Fahrten. Danke euch!', 'And then came the test pirates. Thousands of voyages. Thank you!', '♥', 'sparkle'],
      ['franky', 'Neuer Rumpf, neue Segel, neue Ausrüstung. Alles SUUUPER poliert! Mit Skillbaum und Bordkanone!', 'New hull, new sails, new gear. Everything SUUUPER polished! With a skill tree and a deck cannon!', '✨', 'sparkle'],
      ['zorro', 'Rangliste auf null. Alle an derselben Startlinie. So mag ich das.', 'Leaderboard at zero. Everyone at the same starting line. That is how I like it.'],
      ['self', 'Also… alle zusammen an derselben Startlinie?', 'So… everyone together at the same starting line?', '?'],
      ['ruffy', 'GENAU! Wer zuerst die tollste Beute hat, kriegt … Respekt! Und danach essen wir alle zusammen!', 'EXACTLY! Whoever gets the best loot first gets… respect! And then we all eat together!', '🍖', 'jump'],
      ['ruffy', 'LEINEN LOS! AUF DIE GRAND LINE!', 'CAST OFF! TO THE GRAND LINE!', '!', 'flash']
    ] }
];
