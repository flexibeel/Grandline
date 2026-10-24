// Crew-Leben: kleine Persönlichkeit für jede Figur außerhalb der Kämpfe.
//   food = Lieblingsessen (Steckbrief), hafen = Sprüche am Steg, win/lose = nach einem Run
//   ({boss} = Boss, an dem es zuletzt gescheitert ist, {isl} = Insel)
// Figuren ohne eigenen Eintrag bekommen Sätze nach Rolle (GL.data.crewLifeRole).
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.crewLife = {
  self:    { food: 'Was der Smutje gerade kocht', hafen: ['Bereit, wenn du es bist, Crew.', 'Heute fühlt sich nach Abenteuer an.', 'Noch einen Kaffee, dann legen wir ab.', 'Ich habe die Karte gelesen. Sie war verkehrt herum. Wir fahren trotzdem.'], win: ['Das war unser Run. Ich bin stolz auf euch.'], lose: ['Nächstes Mal schaffen wir {boss}.'] },
  ruffy:   { food: 'Fleisch. Viel Fleisch.', hafen: ['Wann gibt es Essen?', 'Shishishi! Ich will aufs Meer!', 'Wer zuerst am Mast ist!', 'Ich hab von einer Insel aus Fleisch geträumt.', 'Ich hab das Frühstück schon gegessen. Und deins. Tut mir nicht leid.', 'Wenn wir verlieren, gewinnen wir halt beim nächsten Mal. Einfach.'], win: ['Shishishi! Und jetzt ein Festmahl!'], lose: ['{boss}? Den hau ich beim nächsten Mal um!', 'Egal. Morgen wieder!'] },
  zorro:   { food: 'Reisbällchen und Sake', hafen: ['Weckt mich, wenn wir ablegen.', 'Wo geht es zum Bug? Egal.', 'Zzz…', 'Ich trainiere. Stört nicht.', 'Der Hafen ist links. Sagt Nami. Ich glaube ihr nicht.'], win: ['Hmpf. War okay.'], lose: ['{boss}… das nächste Mal schneide ich ihn.'] },
  nami:    { food: 'Mandarinen aus Kokos', hafen: ['Der Wind steht gut. Los, los!', 'Wer hat schon wieder Schulden bei mir?', 'Ich zeichne heute eine neue Karte.', 'Berry zählen beruhigt mich.', 'Lächeln kostet nichts. Alles andere schon.'], win: ['Und die Beute teilen wir… gerecht. Also mir mehr.'], lose: ['{boss} schuldet mir jetzt was. Viel.'] },
  lysop:   { food: 'Fisch, gegrillt', hafen: ['Ich hab heute Nacht achttausend Tiefseeriesen besiegt!', 'Mein Bein juckt. Das ist die Ablegen-ist-gefährlich-Krankheit.', 'Neue Munition fertig!', 'Ich hab heute schon zwei Mal den Mut verloren und drei Mal wiedergefunden.'], win: ['Habt ihr gesehen, wie ich das gerettet hab?'], lose: ['{boss} hatte nur Glück. Wirklich!'] },
  sanji:   { food: 'Er kocht lieber für andere', hafen: ['Frühstück ist fertig, ihr Raufbolde.', 'Nami-Mäuschen, ein Fruchtcocktail?', 'Wer an den Kühlschrank geht, kriegt einen Tritt.', 'Wer Essen verschwendet, schwimmt nach Hause.'], win: ['Heute koche ich ein Siegermenü.'], lose: ['{boss}… und das vor den Damen. Unverzeihlich.'] },
  chopper: { food: 'Zuckerwatte', hafen: ['Ich hab neue Medizin gemischt!', 'Ein Kompliment macht mich nicht glücklich, du Idiot! Hehe.', 'Alle gesund? Dann ist gut.', 'Ich bin kein Waschbär. Ich sag’s nur, falls jemand fragt.'], win: ['Keiner verletzt? Das freut mich gar nicht! Hehe.'], lose: ['Ich verbinde alle. Dann versuchen wir es nochmal.'] },
  robin:   { food: 'Sandwiches und Kaffee', hafen: ['Ich lese noch ein Kapitel.', 'Was für ein ruhiger Morgen.', 'Diese Insel hat bestimmt eine Geschichte.', 'Hier ist es so friedlich. Fast verdächtig.'], win: ['Ein schöner Tag für die Geschichtsbücher.'], lose: ['Wir haben viel über {boss} gelernt.'] },
  franky:  { food: 'Cola, Baby!', hafen: ['SUUUPER Wetter heute!', 'Ich hab das Schiff wieder verbessert.', 'Cola-Tank voll. Bereit!', 'Ich hab das Schiff verbessert. Es hat jetzt einen Knopf. Drück ihn nicht.'], win: ['Das war SUUUPER!'], lose: ['Kein Problem, ich bau uns was Besseres.'] },
  brook:   { food: 'Milch. Gut für die Knochen.', hafen: ['Yohoho! Ein Morgenlied?', 'Darf ich Ihre Unterwäsche… nein? Schade.', 'Mein Herz klopft vor Freude. Ich habe keins! Yohoho!', 'Ich habe heute Morgen in den Spiegel geschaut. Er hat zuerst gelacht. Yohoho!'], win: ['Ein Lied für diesen Sieg! Yohoho!'], lose: ['Auch Niederlagen sind ein Lied wert.'] },
  vivi:    { food: 'Tee aus Alabasta', hafen: ['Danke, dass ich dabei sein darf.', 'Karoo möchte auch mitkommen.'], win: ['Wir sind ein wunderbares Team!'], lose: ['Gebt nicht auf. Ich glaube an euch.'] },
  ace:     { food: 'Alles, was brennt. Und Fleisch.', hafen: ['Pass auf meinen kleinen Bruder auf, ja?', 'Zzz… oh, eingeschlafen.'], win: ['Heiß, oder?'], lose: ['Kopf hoch. Feuer brennt weiter.'] },
  law:     { food: 'Onigiri. Kein Brot.', hafen: ['Wir legen ab, wenn ich es sage.', 'Das war nicht der Plan.'], win: ['Wie berechnet.'], lose: ['Gegen {boss} brauchen wir einen besseren Plan.'] },
  jinbei:  { food: 'Gebratener Fisch', hafen: ['Das Meer ist heute freundlich.', 'Ich halte das Ruder.'], win: ['Ein ehrlicher Sieg.'], lose: ['Ruhig. Wir lernen daraus.'] },
  koby:    { food: 'Alles, was Garp nicht isst', hafen: ['Ich trainiere jeden Tag!', 'Eines Tages werde ich Admiral!'], win: ['Ich bin ein Stück stärker geworden!'], lose: ['Ich gebe nicht auf!'] },
  garp:    { food: 'Reiskekse', hafen: ['Bwahaha! Wer will Kekse?', 'Zzz… Was? Ich hab nicht geschlafen.'], win: ['Faust der Liebe für alle!'], lose: ['{boss} kriegt beim nächsten Mal eine Kopfnuss.'] },
  buggy:   { food: 'Was immer am teuersten ist', hafen: ['Ich, der große Pomp, beehre euch!', 'Wer hat meine Nase angestarrt?!'], win: ['Natürlich! Mein Plan!'], lose: ['Das war nicht meine Schuld!'] },
  sabo:    { food: 'Alles, was Ruffy übrig lässt', hafen: ['Für die Freiheit!', 'Grüße von Koala.'], win: ['Sauber gemacht.'], lose: ['Wir kommen wieder.'] },
  hancock: { food: 'Nur was Ruffy mag', hafen: ['Ich bin nur wegen Ruffy hier.', 'Schönheit verzeiht alles.'], win: ['Natürlich. Ich bin schön.'], lose: ['Das verzeihe ich {boss} nie.'] },
  perona:  { food: 'Süßigkeiten', hafen: ['Ist hier irgendwas Süßes?', 'Horohoho!'], win: ['Horohoho! Süß!'], lose: ['Negativ… so negativ.'] },
  mihawk:  { food: 'Rotwein', hafen: ['…', 'Langweilig.'], win: ['Akzeptabel.'], lose: ['Schwach.'] },
  whitebeard: { food: 'Sake', hafen: ['Gurarara! Meine Kinder!', 'Das Meer ruft.'], win: ['Gurarara!'], lose: ['Kein Grund zur Sorge, Kinder.'] },
  kid:     { food: 'Was schnell geht', hafen: ['Aus dem Weg.', 'Wann geht es endlich los?'], win: ['Ha! Zu leicht.'], lose: ['Beim nächsten Mal mach ich {boss} platt.'] },
  enel:    { food: 'Äpfel', hafen: ['Ein Gott wartet nicht gern.', 'Yahahaha!'], win: ['Yahahaha! Natürlich.'], lose: ['Unmöglich.'] },
  smoker:  { food: 'Zwei Zigarren zum Frühstück', hafen: ['Keine Dummheiten heute.', 'Tch.'], win: ['Hm. Gut.'], lose: ['Tch. Nochmal.'] },
  crocodile: { food: 'Nichts mit Sand', hafen: ['Beeilt euch.', 'Kukuku.'], win: ['Kukuku. Wie erwartet.'], lose: ['Erbärmlich.'] }
};
GL.data.crewLifeRole = {
  kaempfer: { food: 'Großes Steak', hafen: ['Ich bin bereit.', 'Endlich wieder kämpfen!', 'Wer will trainieren?'], win: ['Das hat Spaß gemacht!'], lose: ['Nächstes Mal schaffen wir {boss}.'] },
  helfer:   { food: 'Suppe mit Kräutern', hafen: ['Habt ihr alle gegessen?', 'Ich hab Verbände eingepackt.', 'Bleibt zusammen, ja?'], win: ['Alle heil zurück. Schön.'], lose: ['Erst ausruhen, dann nochmal.'] },
  brecher:  { food: 'Doppelte Portion von allem', hafen: ['Ich geh wieder vorne.', 'Hinter mich, alle.'], win: ['Steht noch alles.'], lose: ['{boss} hat hart zugeschlagen. Ich halte mehr aus.'] }
};
// Sätze einer Figur holen (mit Rolle als Ersatz)
GL.data.lifeOf = (id, role) => GL.data.crewLife[id] || GL.data.crewLifeRole[role] || GL.data.crewLifeRole.kaempfer;
