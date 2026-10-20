// Duo-Wortwechsel (großes Update): Stehen beide Figuren eines Duos in der Crew, sagen sie zu Kampfbeginn
// ab und zu zwei kurze Sätze. Höchstens einmal pro Kampf, jedes Duo höchstens einmal pro Run (Logik in crewquips.js).
// Schlüssel: 'a+b' wie in duos.js. Zeilen: [wer spricht (id), deutscher Satz, englischer Satz]
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.duoQuips = {
  'ruffy+zorro': [
    [['ruffy', 'Links oder rechts?', 'Left or right?'], ['zorro', 'Geradeaus.', 'Straight ahead.']],
    [['zorro', 'Wer hat das Schiff umgeparkt?', 'Who moved the ship?'], ['ruffy', 'Niemand. Du stehst falsch rum.', 'Nobody. You are facing the wrong way.']]
  ],
  'zorro+sanji': [
    [['sanji', 'Wetten, ich hab mehr erledigt?', 'Bet I take out more?'], ['zorro', 'Zähl erst mal bis zwei.', 'Count to two first.']],
    [['zorro', 'Mach Platz, Kochlöffel.', 'Make room, spoon boy.'], ['sanji', 'Nach dir, Moosbirne.', 'After you, moss head.']]
  ],
  'nami+lysop': [
    [['lysop', 'Ich hab plötzlich Kampf-Allergie.', 'I suddenly have a fighting allergy.'], ['nami', 'Ich auch. Wir kämpfen trotzdem.', 'Me too. We are fighting anyway.']],
    [['nami', 'Plan B?', 'Plan B?'], ['lysop', 'Weglaufen. Mit Stil.', 'Run away. With style.']]
  ],
  'sanji+nami': [
    [['sanji', 'Für dich kämpfe ich doppelt!', 'For you I fight twice as hard!'], ['nami', 'Dann zahl ich dir die halbe Heuer.', 'Then I will pay you half the wage.']],
    [['nami', 'Nach dem Kampf will ich Kuchen.', 'After this I want cake.'], ['sanji', 'Steht schon im Ofen!', 'Already in the oven!']]
  ],
  'ruffy+ace': [
    [['ace', 'Iss mir nicht wieder alles weg.', 'Do not eat all my food again.'], ['ruffy', 'Versprochen. Fast.', 'Promise. Almost.']]
  ],
  'robin+franky': [
    [['franky', 'Heute ist ein SUPER Tag!', 'Today is a SUPER day!'], ['robin', 'Das sagst du jeden Tag.', 'You say that every day.']]
  ],
  'chopper+brook': [
    [['brook', 'Ich hab Lampenfieber. Obwohl ich keine Lampe hab.', 'I have stage fright. And no stage.'], ['chopper', 'Ich mach dir einen Tee danach!', 'I will make you tea afterwards!']]
  ],
  'jinbei+ruffy': [
    [['jinbei', 'Ruhig bleiben, Käpt’n.', 'Stay calm, captain.'], ['ruffy', 'Bin ich! Ganz ruhig! Los geht’s!', 'I am! Totally calm! Let’s go!']]
  ],
  'law+ruffy': [
    [['law', 'Das ist ein Bündnis, keine Freundschaft.', 'This is an alliance, not a friendship.'], ['ruffy', 'Klar, Freund!', 'Sure thing, friend!']]
  ],
  'garp+koby': [
    [['garp', 'Zwanzig Liegestütze nach dem Kampf.', 'Twenty push-ups after this.'], ['koby', 'Nur zwanzig? Danke!', 'Only twenty? Thank you!']]
  ],
  'smoker+tashigi': [
    [['tashigi', 'Wo ist meine Brille?', 'Where are my glasses?'], ['smoker', 'Auf deinem Kopf.', 'On your head.']]
  ]
};
