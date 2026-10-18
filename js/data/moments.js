// Gemeinsame Momente: kleine Szenen mit Sprechblasen, die mit der Vertrautheit freigeschaltet werden.
//   lvl = nötige Vertrautheit, lines = [Sprecher, Text]. Sprecher: 'it' = die Figur selbst, 'self' = du
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.moments = {
  ruffy: [
    { lvl: 3, title: 'Das letzte Stück Fleisch', lines: [['it', 'Du, hast du das letzte Stück Fleisch gegessen?'], ['self', 'Nein. Du warst das. Vor fünf Minuten.'], ['it', 'Oh. Shishishi! Dann hol ich uns neues!']] },
    { lvl: 6, title: 'Der Strohhut', lines: [['it', 'Weißt du, warum mir der Hut so wichtig ist?'], ['self', 'Ein Versprechen, oder?'], ['it', 'Genau. Und du bist jetzt auch Teil davon.']] },
    { lvl: 10, title: 'König der Piraten', lines: [['it', 'Wenn ich König der Piraten bin…'], ['self', '…gibt es jeden Tag ein Festmahl?'], ['it', 'Shishishi! Und du sitzt direkt neben mir!']] }
  ],
  zorro: [
    { lvl: 3, title: 'Verlaufen', lines: [['it', 'Wer hat das Schiff umgestellt?'], ['self', 'Niemand. Du bist im falschen Hafen.'], ['it', '…Hmpf. Zeig mir den Weg. Aber sag es keinem.']] },
    { lvl: 6, title: 'Training um Mitternacht', lines: [['self', 'Du trainierst immer noch?'], ['it', 'Ich habe ein Versprechen zu halten.'], ['it', 'Setz dich. Du kannst Gewichte zählen.']] },
    { lvl: 10, title: 'Rücken frei', lines: [['it', 'Solange ich da bin, kommt keiner an dich ran.'], ['self', 'Danke, Zorro.'], ['it', 'Hmpf. Sag nicht danke. Gib mir Sake.']] }
  ],
  nami: [
    { lvl: 3, title: 'Die Rechnung', lines: [['it', 'Hier, deine Rechnung.'], ['self', 'Wofür?!'], ['it', 'Für die Karte, die uns gerettet hat. Zinsen kommen dazu.']] },
    { lvl: 6, title: 'Mandarinen', lines: [['it', 'Willst du eine? Aus Kokos. Die besten der Welt.'], ['self', 'Kostet die was?'], ['it', 'Für dich heute nicht. Nur heute!']] },
    { lvl: 10, title: 'Die Weltkarte', lines: [['it', 'Ich zeichne eine Karte der ganzen Welt.'], ['it', 'Und unsere Fahrten kommen alle drauf.'], ['self', 'Dann zeichne viel Meer ein.']] }
  ],
  lysop: [
    { lvl: 3, title: 'Achttausend Mann', lines: [['it', 'Hab ich dir erzählt, wie ich achttausend Mann besiegt hab?'], ['self', 'Dreimal heute.'], ['it', 'Diesmal waren es neuntausend!']] },
    { lvl: 6, title: 'Mut', lines: [['it', 'Manchmal hab ich Angst.'], ['self', 'Und trotzdem bist du immer da.'], ['it', 'Weil ihr da seid. Das ist… das wahre Kapitän-Lysop-Geheimnis.']] },
    { lvl: 10, title: 'Krieger des Meeres', lines: [['it', 'Eines Tages werde ich ein echter Krieger des Meeres.'], ['self', 'Für mich bist du das schon.'], ['it', 'H-hör auf, ich weine nicht! Das ist Meerwasser!']] }
  ],
  sanji: [
    { lvl: 3, title: 'Nachtisch', lines: [['it', 'Probier das. Neues Rezept.'], ['self', 'Wow. Was ist das?'], ['it', 'Ein Geheimnis. Und jetzt raus aus meiner Küche.']] },
    { lvl: 6, title: 'Niemand hungert', lines: [['it', 'Auf meinem Schiff hungert niemand. Niemals.'], ['self', 'Auch nicht die Gegner?'], ['it', 'Auch die nicht. Erst essen, dann treten.']] },
    { lvl: 10, title: 'All Blue', lines: [['it', 'Irgendwo gibt es ein Meer mit allen Fischen der Welt.'], ['self', 'Das All Blue.'], ['it', 'Wenn wir es finden, koche ich dir das beste Essen deines Lebens.']] }
  ],
  chopper: [
    { lvl: 3, title: 'Die Untersuchung', lines: [['it', 'Halt still, ich hör dein Herz ab.'], ['self', 'Und?'], ['it', 'Gesund! Das freut mich gar nicht! Hehe!']] },
    { lvl: 6, title: 'Kirschblüten', lines: [['it', 'Auf Drumm gab es Kirschblüten im Schnee.'], ['self', 'Wollen wir sie mal zusammen ansehen?'], ['it', 'J-ja! Also… wenn du willst. Hehe.']] },
    { lvl: 10, title: 'Allheilmittel', lines: [['it', 'Ich will ein Arzt werden, der alles heilen kann.'], ['self', 'Du hast meine Laune schon geheilt.'], ['it', 'Du Idiot, sowas macht mich nicht glücklich! Hehehe!']] }
  ],
  robin: [
    { lvl: 3, title: 'Ein Buch', lines: [['it', 'Ich habe ein Buch über diese Insel gefunden.'], ['self', 'Spannend?'], ['it', 'Sehr. Am Ende sterben alle. Fufu.']] },
    { lvl: 6, title: 'Zuhause', lines: [['it', 'Ich habe lange keinen Ort gehabt, an den ich gehöre.'], ['self', 'Jetzt hast du einen.'], ['it', 'Ja. Ich glaube, ja.']] },
    { lvl: 10, title: 'Die wahre Geschichte', lines: [['it', 'Wenn ich die wahre Geschichte finde…'], ['self', '…erzählst du sie mir zuerst?'], ['it', 'Dir zuerst. Versprochen.']] }
  ],
  franky: [
    { lvl: 3, title: 'Neues Gerät', lines: [['it', 'Schau mal! Ein Cola-Kanonen-Fön!'], ['self', 'Wofür braucht man den?'], ['it', 'Für SUUUPER Frisuren, Baby!']] },
    { lvl: 6, title: 'Ein Schiff mit Seele', lines: [['it', 'Ein Schiff hat eine Seele. Wie eine Crew.'], ['self', 'Dann hat unseres eine große.'], ['it', 'Ow! Ich weine nicht! Das ist Öl!']] },
    { lvl: 10, title: 'Der Traum', lines: [['it', 'Ich wollte ein Schiff bauen, das ans Ende der Welt fährt.'], ['self', 'Und? Fährt es?'], ['it', 'Mit dir an Bord? SUUUPER weit!']] }
  ],
  brook: [
    { lvl: 3, title: 'Ein Witz', lines: [['it', 'Ich bin so dünn, ich bin nur Haut und Knochen!'], ['it', 'Nur ohne Haut! Yohohoho!'], ['self', '…Der war gut.']] },
    { lvl: 6, title: 'Binks’ Sake', lines: [['it', 'Darf ich Ihnen ein Lied spielen?'], ['self', 'Gern.'], ['it', 'Yohoho… Dies ist ein Lied für alle, die auf uns warten.']] },
    { lvl: 10, title: 'Nicht mehr allein', lines: [['it', 'Fünfzig Jahre war ich allein auf dem Meer.'], ['self', 'Jetzt nie wieder.'], ['it', 'Mir kommen die Tränen. Obwohl ich keine Augen habe. Yohoho…']] }
  ]
};
// Für alle anderen: nach Rolle
GL.data.momentsRole = {
  kaempfer: [
    { lvl: 3, title: 'Ein Kräftemessen', lines: [['it', 'Lust auf ein kleines Kräftemessen?'], ['self', 'Nur wenn du mich gewinnen lässt.'], ['it', 'Ha! Niemals.']] },
    { lvl: 6, title: 'Narben', lines: [['it', 'Jede Narbe erzählt eine Geschichte.'], ['self', 'Und diese hier?'], ['it', 'Die ist von unserer letzten Fahrt. Eine gute Geschichte.']] },
    { lvl: 10, title: 'Seite an Seite', lines: [['it', 'Mit dir kämpfe ich gern Seite an Seite.'], ['self', 'Und ich mit dir.']] }
  ],
  helfer: [
    { lvl: 3, title: 'Tee', lines: [['it', 'Ich hab Tee gemacht. Für alle.'], ['self', 'Riecht gut.'], ['it', 'Mit Kräutern von der letzten Insel.']] },
    { lvl: 6, title: 'Ein Verband', lines: [['it', 'Halt still, das ist nur ein Kratzer.'], ['self', 'Danke, dass du immer aufpasst.'], ['it', 'Dafür bin ich doch da.']] },
    { lvl: 10, title: 'Familie', lines: [['it', 'Weißt du, diese Crew fühlt sich an wie Familie.'], ['self', 'Sie ist eine.']] }
  ],
  brecher: [
    { lvl: 3, title: 'Der Fels', lines: [['it', 'Bleib hinter mir.'], ['self', 'Immer.'], ['it', 'Gut. Dann passiert dir nichts.']] },
    { lvl: 6, title: 'Ein Schild', lines: [['it', 'Ich halte gern Schläge aus. Für euch.'], ['self', 'Das merken wir. Danke.']] },
    { lvl: 10, title: 'Unerschütterlich', lines: [['it', 'Solange ich stehe, steht die Crew.'], ['self', 'Und du stehst immer.']] }
  ]
};
GL.data.momentsOf = (id, role) => GL.data.moments[id] || GL.data.momentsRole[role] || GL.data.momentsRole.kaempfer;
