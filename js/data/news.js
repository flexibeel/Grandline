// Neuigkeiten zum Durchwischen (wie bei Steam, nur gemütlich). Erscheint einmal pro großem Update.
//   art: { crew: 'id' } | { self: true } | { ship: true } | { emoji: '…' } | { fa: 'flag' }
//   Texte als [Deutsch, Englisch]
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.news = {
  v: '2026-10-19b',
  slides: [
    { art: { fa: 'flag' }, tone: 'gold',
      kicker: ['Großes Update', 'Big update'], title: ['Grand Line hat sich rausgeputzt', 'Grand Line got a makeover'],
      text: ['Neue Story, neue Crew-Ansicht, neuer Look. Wisch kurz durch, was alles neu ist.', 'New story, new crew screen, new look. Swipe through what is new.'] },
    { art: { crew: 'ruffy' }, tone: 'sea',
      kicker: ['Neu', 'New'], title: ['Story: Das Rezept vom Ende der Welt', 'Story: The Recipe from the End of the World'],
      text: ['8 kleine Filmszenen mit deiner Crew. Witzig, kurz, mit Stimmen. Mit jedem Meilenstein kommt ein Kapitel. Alle im Kapitänsbuch unter „📖 Story“.', '8 little movie scenes with your crew. Funny, short, with voices. Each milestone unlocks a chapter. All in the captain’s log under “📖 Story”.'] },
    { art: { self: true }, tone: 'warm',
      kicker: ['Neu', 'New'], title: ['Dein Pirat, dein Style', 'Your pirate, your style'],
      text: ['Der Profil-Editor ist neu: große Vorschau, Reiter für Aussehen, Kampf, Stil, Titel, Flagge und Schiff. Gesperrtes zeigt, wie du es bekommst.', 'The profile editor is new: big preview, tabs for look, combat, style, title, flag and ship. Locked items show how to get them.'] },
    { art: { crew: 'zorro' }, tone: 'wood',
      kicker: ['Stammcrew', 'Home crew'], title: ['Karten ziehen, Crew ankleiden', 'Drag cards, dress your crew'],
      text: ['Deine Stammcrew steht als Karten auf dem Deck. Ziehen zum Aufstellen, antippen zum Ankleiden. Gleiche Figuren in der Taverne werden zu ★★ und ★★★.', 'Your home crew stands on deck as cards. Drag to line up, tap to dress up. Duplicate crew in the tavern merge into ★★ and ★★★.'] },
    { art: { crew: 'rob-lucci' }, tone: 'night',
      kicker: ['Kampf', 'Battle'], title: ['Team-Balken & Schnell-Kampf', 'Team bar & quick fights'],
      text: ['Volle Bande? Dann lädt jede Ulti den Team-Balken bis zur Bandenattacke. Klare Kämpfe kannst du mit ⏩ überspringen, Tempo in vier festen Stufen.', 'Full gang? Every ulti charges the team bar until the gang attack fires. Clear wins can be skipped with ⏩, speed in four fixed steps.'] },
    { art: { emoji: '🍾' }, tone: 'sea',
      kicker: ['Freunde', 'Friends'], title: ['Flaschenpost', 'Message in a bottle'],
      text: ['Doppelte Ausrüstung? Schick sie per Flaschenpost an Freunde. Sie kommt beim nächsten Öffnen an.', 'Spare gear? Send it to friends by bottle. It arrives the next time they open the game.'] },
    { art: { ship: true }, tone: 'map',
      kicker: ['Auf See', 'At sea'], title: ['Schatzkarte & Reiseleiste', 'Treasure map & voyage bar'],
      text: ['Die Route im Run ist jetzt eine kompakte Schatzkarte, oben zeigt dein Schiff auf einem Tau, wo du gerade bist.', 'The route is now a compact treasure map, and up top your ship shows where you are on a rope.'] }
  ]
};
