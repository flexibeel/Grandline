// Neuigkeiten zum Durchwischen (wie bei Steam, nur gemütlich). Erscheint einmal pro großem Update.
//   art: { crew: 'id' } | { self: true } | { ship: true } | { emoji: '…' } | { fa: 'flag' }
//   Texte als [Deutsch, Englisch]
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.news = {
  v: '2026-10-20a',
  slides: [
    { art: { fa: 'flag' }, tone: 'gold',
      kicker: ['Großes Update', 'Big update'], title: ['Ein neues Spielsystem', 'A new game system'],
      text: ['Skillbaum, neue Inseln, neue Gegner, Insel-Twists, neue Items. Die Rangliste startet bei null, es zählen nur Fahrten ab dem 18.10., 18 Uhr. Dein Fortschritt bleibt, versprochen. Nami hat nachgezählt.', 'Skill tree, new islands, new enemies, island twists, new items. The leaderboard starts at zero, only voyages from Oct 18, 6 pm count. Your progress stays, promise. Nami counted.'] },
    { art: { crew: ['ruffy', 'zorro', 'chopper'] }, tone: 'night',
      kicker: ['Kampf', 'Battle'], title: ['Finde deinen Stil', 'Find your style'],
      text: ['💥 Wucht (Kraft) knackt Bosse, ⚔ Schwertkunst (Klinge) lebt von Krits, 💨 Tempo (Technik) weicht aus, 💚 Lazarett (Helfer) heilt dich durch lange Kämpfe. Je mehr vom selben Stil, desto stärker. Jeder Boss zeigt dir: „So knackst du ihn“.', '💥 Might (Power) cracks bosses, ⚔ Swordplay (Blade) lives on crits, 💨 Tempo (Technique) dodges, 💚 Infirmary (Helpers) heals you through long fights. The more of one style, the stronger. Every boss shows you: “How to crack him”.'] },
    { art: { emoji: '🔥' }, tone: 'night',
      kicker: ['Teufelsfrüchte', 'Devil fruits'], title: ['Früchte mit Familie', 'Fruits with family'],
      text: ['🔥 Logia, 🌀 Paramecia, 🐾 Zoan: Sammle zwei oder drei aus einer Familie und sie werden richtig gemein. Jede Frucht hat dazu ihre Eigenheit, vom Brand bis zum Phönix, der einmal wieder aufsteht.', '🔥 Logia, 🌀 Paramecia, 🐾 Zoan: collect two or three of one family and they get properly mean. Every fruit also has its quirk, from burning to a phoenix that rises once more.'] },
    { art: { crew: ['ruffy', 'lysop', 'sanji'] }, tone: 'sea',
      kicker: ['Unterwegs', 'On the way'], title: ['Die Crew redet mit', 'The crew has opinions'],
      text: ['16 kleine Szenen auf der Route: eine fremde Frucht am Strand, ein Händler mit Haken, eine Kronwacht-Kontrolle. Du entscheidest, die Crew kommentiert.', '16 little scenes on the route: a strange fruit on the beach, a merchant with a catch, a marine checkpoint. You decide, the crew comments.'] },
    { art: { emoji: '🔱' }, tone: 'gold',
      kicker: ['Gemeinschaft', 'Together'], title: ['Welt-Boss der Woche', 'World boss of the week'],
      text: ['Bis zu vier Stammcrews gegen einen Riesen: du und deine Segelkumpane. Landgänge haben jetzt Expeditionen und zeigen vorher ehrlich, ob ihr eine Chance habt.', 'Up to four home crews against a giant: you and your sailing buddies. Shore leaves now have expeditions and tell you honestly beforehand whether you stand a chance.'] },
    { art: { ship: true }, tone: 'wood',
      kicker: ['Neu im Hafen', 'New in the harbor'], title: ['Skillbaum „Gemütlichkeit“', 'Skill tree “Coziness”'],
      text: ['Skillpunkte kommen nebenbei: pro Rang, alle 6 Fahrten, alle 3 Landgänge, für Vertrautheit. Bau dein Schiff aus (Hängematten, Herd, Krähennest, Bordkanone) und schalte Talente für die Strohhüte frei. Umskillen kostet nichts. Nicht mal Nami verlangt dafür Geld.', 'Skill points come along the way: per rank, every 6 voyages, every 3 shore leaves, for bonds. Build out your ship (hammocks, stove, crow’s nest, deck cannon) and unlock talents for the Straw Hats. Respec is free. Not even Nami charges for it.'] },
    { art: { crew: ['jango', 'gin', 'pearl'] }, tone: 'night',
      kicker: ['Auf See', 'At sea'], title: ['Neue Inseln, neue Gegner', 'New islands, new enemies'],
      text: ['Gecko-Klippen und Eisenbucht im East Blue, Zwillingskap am Eingang zur Grand Line. Pit, Knüppel-Kuno, Topfdeckel-Tom, Herr Donnerstag und Agent Nudel jagen dich, Leibwachen, Raufbolde und Rudelführer kämpfen klüger.', 'Gecko Cliffs and Iron Bay in the East Blue, Twin Cape at the entrance to the Grand Line. Pit, Cudgel Kuno, Potlid Tom, Mister Thursday and Agent Noodle hunt you, bodyguards, brawlers and pack leaders fight smarter.'] },
    { art: { emoji: '🎲' }, tone: 'sea',
      kicker: ['Jede Fahrt anders', 'Every voyage different'], title: ['Insel-Twists', 'Island twists'],
      text: ['Fast jede Insel hat eine Sonderregel: Markttag, Steckbrief-Woche, Schatzinsel, Kronwacht-Razzia, Stille Bucht oder Sturmflut. Oben als Chip neben der Laune der See.', 'Almost every island has a special rule: market day, wanted week, treasure island, Crown Guard raid, quiet bay or storm surge. Shown as a chip next to the sea’s mood.'] },
    { art: { self: true }, tone: 'warm',
      kicker: ['Dein Pirat', 'Your pirate'], title: ['Eigene Frucht, eigene Bande', 'Your own fruit, your own crew'],
      text: ['Im Profil unter „Kampf“: Zieh eine schon gegessene Teufelsfrucht auf deinen Piraten. Und gib deiner Bande einen Namen, er steht auf deiner Karte und in der Rangliste.', 'In your profile under “Combat”: drag a devil fruit you have eaten onto your pirate. And name your crew, it shows on your card and in the leaderboard.'] },
    { art: { crew: ['zorro', 'sanji'], stars: true }, tone: 'wood',
      kicker: ['Stammcrew', 'Home crew'], title: ['Bessere Ausrüstung auf einen Blick', 'Better gear at a glance'],
      text: ['Grüne Pfeile zeigen, wo in der Truhe etwas Besseres liegt. Tipp auf den grünen Platz, das stärkste Teil steht dann ganz oben.', 'Green arrows show where something better is waiting in the chest. Tap the green slot and the strongest piece is right on top.'] },
    { art: { emoji: '🍖' }, tone: 'gold',
      kicker: ['Beute', 'Loot'], title: ['Neue Items', 'New items'],
      text: ['Fleischkeule am Knochen, Rumble-Ball-Dose, Strohsandalen, Kochschürze, Mandarinen-Kiste, Sunny-Löwenkopf, Kochmesser und Perlenkette. Ruffy hat die Fleischkeule schon zweimal gegessen. Sie ist trotzdem noch da.', 'Meat on the bone, rumble ball tin, straw sandals, cooking apron, tangerine crate, Sunny lion head, chef’s knife and pearl necklace. Luffy has eaten the meat twice already. It is still there somehow.'] },
    { art: { crew: ['ruffy', 'nami'] }, tone: 'map',
      kicker: ['Mit dem Daumen', 'Thumb-friendly'], title: ['Große Auswahl-Karten', 'Big choice cards'],
      text: ['Routen, Training, Schätze und Früchte wählst du jetzt mit großen Karten im Daumenbereich. Gebaut für Sofa, Bus und andere Orte, an denen man eigentlich etwas anderes tun sollte.', 'Routes, training, treasures and fruits are now picked with big cards in thumb reach. Built for the couch, the bus and other places where you should really be doing something else.'] },
    { art: { crew: ['ruffy', 'lysop'] }, tone: 'warm',
      kicker: ['Freunde', 'Friends'], title: ['Kumpels einladen', 'Invite buddies'],
      text: ['Einladungslink mit QR-Code im Live-Fenster. Wer ihn öffnet, wird dein Segelkumpan und bekommt 150 Berry. Wer am Startabend segelt, bekommt die Flagge „Erste Fahrt“.', 'Invite link with QR code in the live window. Whoever opens it becomes your sailing buddy and gets 150 Berry. Sail on launch night for the “Maiden Voyage” flag.'] }
  ]
};
