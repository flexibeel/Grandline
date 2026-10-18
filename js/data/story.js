// Story „Das Rezept vom Ende der Welt": kleine Szenen mit Sprechblasen, die nach und nach freischalten.
//   when(p)  = Bedingung am Profil (ab wann die Szene kommt), need = kurzer Hinweis, wann sie kommt
//   bg       = Bühne: hafen, nacht, schiff, insel, kueche
//   lines    = [Sprecher, Deutsch, Englisch, Emote?]  Sprecher: 'self' (du), Crew-ID oder 'kalle' (Zeitungsmöwe)
//   Emotes: ! ? ♥ 💦 ♪ 💢 ✨ 🍖 …
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
        ['ruffy', 'Ey! Du da! Du siehst aus, als hättest du Hunger. Willst du in meine Crew?', 'Hey! You there! You look hungry. Wanna join my crew?', '!'],
        ['self', 'Ähm… ich wollte eigentlich nur nach dem Weg fragen.', 'Uhm… I actually just wanted to ask for directions.', '💦'],
        ['nami', 'Sag einfach ja. Er fragt sonst noch 200 Mal. Ich hab mitgezählt.', 'Just say yes. Otherwise he asks 200 more times. I counted.'],
        ['zorro', 'Hmpf. Noch einer. Hauptsache, er kann rudern.', 'Hmph. Another one. As long as they can row.'],
        ['ruffy', 'Shishishi! Abgemacht! Ab jetzt bist du Kapitän in Ausbildung. Main-Character-Energy!', 'Shishishi! Deal! From now on you are captain-in-training. Main character energy!', '✨'],
        ['self', 'Und was heißt das genau?', 'And what exactly does that mean?', '?'],
        ['nami', 'Dass du die Arbeit machst und er den Ruhm kriegt. Willkommen.', 'That you do the work and he gets the fame. Welcome.'],
        ['ruffy', 'Und jetzt: Leinen los! Irgendwo da draußen gibt es das beste Fleisch der Welt…', 'And now: cast off! Somewhere out there is the best meat in the world…', '🍖']
      ] },
    { id: 'c2', no: 2, bg: 'schiff', when: p => runs(p) >= 1,
      title: ['Die Seite aus der Flasche', 'The page in the bottle'], need: ['Nach deiner ersten Fahrt', 'After your first voyage'],
      lines: [
        ['ruffy', 'GUCKT MAL! Eine Flasche! Mit Papier drin! Kann man das essen?', 'LOOK! A bottle! With paper inside! Can you eat it?', '!'],
        ['sanji', 'Gib her, bevor du es isst. … Diese Handschrift. Das ist eine Seite aus einem Kochbuch.', 'Give it here before you eat it. … This handwriting. It is a page from a cookbook.'],
        ['self', 'Da steht: „Das Ur-Fleisch. Wer es isst, wird nie wieder hungrig.“', 'It says: “The Primal Meat. Whoever eats it will never be hungry again.”'],
        ['ruffy', 'NIE WIEDER HUNGRIG?! Das ist das Gruseligste, was ich je gehört hab. Ich will es trotzdem.', 'NEVER HUNGRY AGAIN?! That is the scariest thing I have ever heard. I still want it.', '😱'],
        ['nami', 'Wenn das echt ist, ist das Millionen wert. Ich sag nur: Gewinnbeteiligung.', 'If this is real, it is worth millions. I am just saying: profit share.', '💰'],
        ['self', 'Unten steht noch: „Sammle alle sieben Seiten.“', 'At the bottom: “Collect all seven pages.”'],
        ['zorro', 'Sieben? Klingt nach Hausaufgaben.', 'Seven? Sounds like homework.', '💢'],
        ['ruffy', 'Dann sammeln wir halt! Easy! … Was ist eine Seite?', 'Then we collect them! Easy! … What is a page?', '?']
      ] },
    { id: 'c3', no: 3, bg: 'insel', when: p => runs(p) >= 3,
      title: ['Die Insel, die weglief', 'The island that ran away'], need: ['Nach 3 Fahrten', 'After 3 voyages'],
      lines: [
        ['nami', 'Zorro. Wo warst du? Wir haben drei Stunden gesucht.', 'Zoro. Where were you? We searched for three hours.', '💢'],
        ['zorro', 'Ich hab mich nicht verlaufen. Die Insel ist weggelaufen.', 'I did not get lost. The island ran away.'],
        ['nami', 'Die Insel. Ist. Weggelaufen.', 'The island. Ran. Away.'],
        ['self', 'Lowkey glaub ich ihm das sogar.', 'Lowkey, I kind of believe him.', '💦'],
        ['lysop', 'Ich hab mal eine Insel gefangen, die weglaufen wollte. Mit bloßen Händen!', 'I once caught an island that tried to run away. With my bare hands!', '✨'],
        ['nami', 'Cap.', 'Cap.'],
        ['lysop', 'N-no cap! … Okay, ein bisschen cap.', 'N-no cap! … Okay, a little cap.', '💦'],
        ['zorro', 'Egal. Hier, lag im Gebüsch. Sieht aus wie eure komische Seite.', 'Whatever. Here, this was in the bushes. Looks like your weird page.'],
        ['ruffy', 'SEITE ZWEI! Zorro, du Legende!', 'PAGE TWO! Zoro, you legend!', '♥']
      ] },
    { id: 'c4', no: 4, bg: 'kueche', when: p => bosses(p) >= 1,
      title: ['Bossfight-Vibes', 'Boss fight vibes'], need: ['Nach deinem ersten besiegten Bösewicht', 'After your first defeated villain'],
      lines: [
        ['sanji', 'Siegesessen! Heute gibt es Drei-Gänge-Menü. Für Ruffy: Drei-Gänge-Fleisch.', 'Victory dinner! Three courses tonight. For Luffy: three courses of meat.', '♪'],
        ['ruffy', 'Sanji, ich liebe dich. Platonisch. Und wegen dem Fleisch.', 'Sanji, I love you. Platonically. And because of the meat.', '♥'],
        ['chopper', 'Der Bösewicht hatte das hier in der Tasche! Seite drei!', 'The villain had this in his pocket! Page three!', '!'],
        ['self', 'Da steht: „…nur wer nicht allein isst, findet den Weg.“', 'It says: “…only those who never eat alone will find the way.”'],
        ['robin', 'Interessant. Das klingt weniger nach einem Rezept und mehr nach einem Rätsel.', 'Interesting. That sounds less like a recipe and more like a riddle.'],
        ['chopper', 'Ihr seid alle so klug! Ich bin gar nicht beeindruckt! Hehe!', 'You are all so smart! I am not impressed at all! Hehe!', '✨'],
        ['self', 'Du bist voll süß, Chopper.', 'You are so cute, Chopper.'],
        ['chopper', 'Sag das nicht, du Idiot! … Du darfst es aber nochmal sagen.', 'Don’t say that, you jerk! … You can say it again though.', '♥']
      ] },
    { id: 'c5', no: 5, bg: 'hafen', when: p => GL.meta && GL.meta.squadUnlocked && GL.meta.squadUnlocked(p),
      title: ['Ein Zuhause im Hafen', 'A home in the harbor'], need: ['Wenn deine Stammcrew freigeschaltet ist', 'When your home crew unlocks'],
      lines: [
        ['franky', 'SUUUPER! Ich hab euch ein Hafenhaus gebaut! Mit Cola-Brunnen!', 'SUUUPER! I built you a harbor house! With a cola fountain!', '✨'],
        ['nami', 'Und wer hat das bezahlt?', 'And who paid for it?', '💢'],
        ['franky', '…Ow. Nächste Frage!', '…Ow. Next question!', '💦'],
        ['robin', 'Ein Ort, an den man zurückkehrt. Das ist mehr wert als Gold.', 'A place you come back to. That is worth more than gold.', '♥'],
        ['nami', 'Nichts ist mehr wert als Gold. … Aber okay, es ist gemütlich.', 'Nothing is worth more than gold. … But okay, it is cozy.'],
        ['self', 'Hinter dem Bild hängt was. Seite vier!', 'Something is behind the painting. Page four!', '!'],
        ['ruffy', 'Dieses Haus hat Rizz. Wir bleiben hier. Also, zwischen den Abenteuern.', 'This house has rizz. We are staying. I mean, between adventures.', '♪']
      ] },
    { id: 'c6', no: 6, bg: 'nacht', when: p => landgang(p) >= 1 || runs(p) >= 8,
      title: ['Ein Lied für Seite fünf', 'A song for page five'], need: ['Nach deinem ersten Landgang (oder 8 Fahrten)', 'After your first shore leave (or 8 voyages)'],
      lines: [
        ['brook', 'Yohoho! Ich habe am Strand Noten gefunden. Darf ich Ihnen etwas vorspielen?', 'Yohoho! I found sheet music on the beach. May I play something for you?', '♪'],
        ['self', 'Warte… das ist Seite fünf! Das Rezept ist ein Lied?', 'Wait… that is page five! The recipe is a song?', '?'],
        ['sanji', 'Ein Gericht braucht Rhythmus. Das sag ich schon immer.', 'A dish needs rhythm. I have always said so.'],
        ['ruffy', 'Fleisch mit Musik. Das ist der Vibe.', 'Meat with music. That is the vibe.', '🍖'],
        ['brook', 'Mir kommen die Tränen. Obwohl ich keine Augen habe. Yohohoho!', 'Tears are coming. Even though I have no eyes. Yohohoho!', '💦'],
        ['zorro', '…Spiel einfach. Aber leise. Ich penn gleich.', '…Just play. But quietly. I am about to nap.']
      ] },
    { id: 'c7', no: 7, bg: 'insel', when: p => wins(p) >= 1,
      title: ['Am Ende der Grand Line', 'At the end of the Grand Line'], need: ['Nach deinem ersten ganzen Sieg', 'After your first full victory'],
      lines: [
        ['ruffy', 'WIR HABEN ES GESCHAFFT! Wo ist das Fleisch?!', 'WE MADE IT! Where is the meat?!', '!'],
        ['robin', 'Die letzten Seiten lagen im Schatzraum. Sechs und sieben. Ich lese vor.', 'The last pages were in the treasure room. Six and seven. I will read.'],
        ['robin', '„Das Ur-Fleisch ist kein Fleisch. Es ist das Essen, das man mit seiner Crew teilt.“', '“The Primal Meat is not meat. It is the meal you share with your crew.”', '✨'],
        ['ruffy', '…Also KEIN Fleisch?', '…So NO meat?', '😱'],
        ['sanji', 'Doch. Auch Fleisch. Ich koch heute alles.', 'Yes. Also meat. I am cooking everything tonight.', '♪'],
        ['ruffy', 'PUH. Ich dachte schon.', 'PHEW. I was worried.', '💦'],
        ['nami', 'Und das Geld?', 'And the money?', '💢'],
        ['zorro', 'Hmpf. War trotzdem ne gute Fahrt.', 'Hmph. Still a good voyage.'],
        ['self', 'Und jetzt?', 'And now?', '?'],
        ['ruffy', 'Jetzt fahren wir nochmal! Weil mit euch ist es einfach am schönsten. Shishishi!', 'Now we sail again! Because with you guys it is just the best. Shishishi!', '♥']
      ] },
    { id: 'c8', no: 8, bg: 'hafen', when: p => wins(p) >= 2 || rank(p) >= 10,
      title: ['Post von der Zeitungsmöwe', 'Mail from the News Coo'], need: ['Nach 2 Siegen oder Rang 11', 'After 2 victories or rank 11'],
      lines: [
        ['kalle', 'Kraa! Eilmeldung! Kraa!', 'Kraa! Breaking news! Kraa!', '!'],
        ['nami', '„Fake-Strohhüte auf allen Märkten. Das Original? Laut Händler: ausverkauft.“', '“Fake straw hats on every market. The original? According to the seller: sold out.”'],
        ['ruffy', 'FAKE-STROHHÜTE?! Das ist Betrug! Das ist… das ist…', 'FAKE STRAW HATS?! That is fraud! That is… that is…', '💢'],
        ['nami', '…Business. Ehrlich gesagt: Respekt.', '…business. Honestly: respect.'],
        ['lysop', 'Ich hab den Händler gesehen. Er hatte eine Augenklappe. Und drei Beine. Oder zwei.', 'I saw the seller. He had an eye patch. And three legs. Or two.', '💦'],
        ['self', 'Klingt nach dem nächsten Abenteuer.', 'Sounds like the next adventure.', '✨'],
        ['ruffy', 'Fortsetzung folgt! … Was heißt das? Gibt es da Essen?', 'To be continued! … What does that mean? Is there food?', '?']
      ] }
  ];
})();
