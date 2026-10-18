// Neuigkeiten zum Durchwischen (wie bei Steam, nur gemütlich). Erscheint einmal pro großem Update.
//   art: { crew: 'id' } | { self: true } | { ship: true } | { emoji: '…' } | { fa: 'flag' }
//   Texte als [Deutsch, Englisch]
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.news = {
  v: '2026-10-20a',
  slides: [
    { art: { fa: 'flag' }, tone: 'gold',
      kicker: ['Saison 1', 'Season 1'], title: ['Ein neues Spielsystem', 'A new game system'],
      text: ['Skillbaum, neue Inseln, neue Gegner, Insel-Twists, neue Items. Die Rangliste startet bei null: Es zählen nur Fahrten ab dem 18.10., 18 Uhr. Dein Fortschritt bleibt.', 'Skill tree, new islands, new enemies, island twists, new items. The leaderboard starts at zero: only voyages from Oct 18, 6 pm count. Your progress stays.'] },
    { art: { ship: true }, tone: 'wood',
      kicker: ['Neu im Hafen', 'New in the harbor'], title: ['Skillbaum „Gemütlichkeit“', 'Skill tree “Coziness”'],
      text: ['Skillpunkte kommen nebenbei: pro Rang, alle 6 Fahrten, alle 3 Landgänge, für Vertrautheit. Bau dein Schiff aus (Hängematten, Herd, Krähennest, Bordkanone) und schalte Talente für die Strohhüte frei. Umskillen kostet nichts.', 'Skill points come along the way: per rank, every 6 voyages, every 3 shore leaves, for bonds. Build out your ship (hammocks, stove, crow’s nest, deck cannon) and unlock talents for the Straw Hats. Respec is free.'] },
    { art: { crew: ['jango', 'gin', 'pearl'] }, tone: 'night',
      kicker: ['Auf See', 'At sea'], title: ['Neue Inseln, neue Gegner', 'New islands, new enemies'],
      text: ['Gecko-Klippen und Eisenbucht im East Blue, Zwillingskap am Eingang zur Grand Line. Jango, Dämon Gin, Pearl, Mr. 4 und Wanze jagen dich, Leibwachen, Raufbolde und Rudelführer kämpfen klüger.', 'Gecko Cliffs and Iron Bay in the East Blue, Twin Cape at the entrance to the Grand Line. Jango, Gin, Pearl, Mr. 4 and Wanze hunt you, bodyguards, brawlers and pack leaders fight smarter.'] },
    { art: { emoji: '🎲' }, tone: 'sea',
      kicker: ['Jede Fahrt anders', 'Every voyage different'], title: ['Insel-Twists', 'Island twists'],
      text: ['Fast jede Insel hat eine Sonderregel: Markttag, Steckbrief-Woche, Schatzinsel, Marine-Razzia, Stille Bucht oder Sturmflut. Oben als Chip neben der Laune der See.', 'Almost every island has a special rule: market day, wanted week, treasure island, marine raid, quiet bay or storm surge. Shown as a chip next to the sea’s mood.'] },
    { art: { self: true }, tone: 'warm',
      kicker: ['Dein Pirat', 'Your pirate'], title: ['Eigene Frucht, eigene Bande', 'Your own fruit, your own crew'],
      text: ['Im Profil unter „Kampf“: Zieh eine schon gegessene Teufelsfrucht auf deinen Piraten. Und gib deiner Bande einen Namen, er steht auf deiner Karte und in der Rangliste.', 'In your profile under “Combat”: drag a devil fruit you have eaten onto your pirate. And name your crew, it shows on your card and in the leaderboard.'] },
    { art: { crew: ['zorro', 'sanji'], stars: true }, tone: 'wood',
      kicker: ['Stammcrew', 'Home crew'], title: ['Bestes anlegen mit einem Tipp', 'Equip the best in one tap'],
      text: ['Grüne Pfeile zeigen, wo in der Truhe etwas Besseres liegt. „Bestes anlegen“ rüstet eine Figur aus, „Alle ausrüsten“ die ganze Stammcrew.', 'Green arrows show where something better is waiting in the chest. “Equip best” gears up one crew member, “Equip all” the whole home crew.'] },
    { art: { emoji: '🍖' }, tone: 'gold',
      kicker: ['Beute', 'Loot'], title: ['Neue Items', 'New items'],
      text: ['Fleischkeule am Knochen, Rumble-Ball-Dose, Strohsandalen, Kochschürze, Mandarinen-Kiste, Sunny-Löwenkopf, Kochmesser und Perlenkette.', 'Meat on the bone, rumble ball tin, straw sandals, cooking apron, tangerine crate, Sunny lion head, chef’s knife and pearl necklace.'] },
    { art: { crew: ['ruffy', 'nami'] }, tone: 'map',
      kicker: ['Mit dem Daumen', 'Thumb-friendly'], title: ['Große Auswahl-Karten', 'Big choice cards'],
      text: ['Routen, Training, Schätze und Früchte wählst du jetzt mit großen Karten im Daumenbereich. Perfekt fürs Sofa.', 'Routes, training, treasures and fruits are now picked with big cards in thumb reach. Perfect for the couch.'] },
    { art: { crew: ['ruffy', 'lysop'] }, tone: 'warm',
      kicker: ['Freunde', 'Friends'], title: ['Kumpels einladen', 'Invite buddies'],
      text: ['Einladungslink mit QR-Code im Live-Fenster. Wer ihn öffnet, wird dein Segelkumpan und bekommt 150 Berry. Wer am Startabend segelt, bekommt die Flagge „Erste Fahrt“.', 'Invite link with QR code in the live window. Whoever opens it becomes your sailing buddy and gets 150 Berry. Sail on launch night for the “Maiden Voyage” flag.'] }
  ]
};
