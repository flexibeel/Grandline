// Englisch für den Profil-Editor (Tabs, Abschnitte)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  'Aussehen': 'Looks', 'Kampf': 'Combat', 'Stil': 'Style', 'Titel & Flagge': 'Title & flag', 'Schiff': 'Ship', 'Konto': 'Account',
  'Farben': 'Colors', 'Hut': 'Hat', 'Extras': 'Extras', 'Hintergrund': 'Background', 'Rahmen': 'Frame', 'Animation': 'Animation',
  'Titel': 'Title', 'Flagge': 'Flag', 'Abzeichen': 'Badge', 'Kampfstil': 'Fighting style', 'Rolle': 'Role', 'Piratenname': 'Pirate name',
  'Dein Pirat': 'Your pirate', 'Erstelle deinen Piraten': 'Create your pirate', 'Hutfarbe': 'Hat color', 'Oberteil': 'Top', 'Hose': 'Pants', 'Haare': 'Hair', 'Haut': 'Skin', 'Bart': 'Beard', 'Nase': 'Nose',
  'Dein Pirat ist als Kapitän spielbar und wird mit jedem Piratenrang stärker.': 'Your pirate can be played as captain and gets stronger with every pirate rank.',
  'stark gegen Technik': 'strong vs Tech', 'stark gegen Kraft': 'strong vs Power', 'stark gegen Klinge': 'strong vs Blade',
  // Eigene Teufelsfrucht & Bande
  'Teufelsfrucht': 'Devil fruit', 'Bande': 'Crew', 'Noch keine Frucht': 'No fruit yet', 'Zieh eine Frucht auf den Platz oder tipp sie an.': 'Drag a fruit onto the slot or tap it.',
  'Iss im Run eine Teufelsfrucht. Danach kannst du sie hier deinem Piraten geben.': 'Eat a devil fruit during a run. Then you can give it to your pirate here.',
  'Wirkt, wenn dein Pirat Kapitän ist: wie eine gegessene Frucht am Start. Stufe Gewöhnlich, ab Rang 8 Selten. Erwachte Früchte und die Heil-Frucht gehen nicht.': 'Works when your pirate is captain: like a fruit eaten at the start. Common tier, Rare from rank 8. Awakened fruits and the Heal Fruit don’t work.',
  'Deine Bande': 'Your crew', 'Noch ohne Namen': 'No name yet', 'Taufen': 'Name it', 'Bandenname': 'Crew name', 'z. B. Mandarinen-Piraten': 'e.g. Tangerine Pirates',
  'Der Name steht auf deiner Kapitänskarte, im Steckbrief und auf deiner Spielerkarte in der Rangliste. Er gilt nur für deine eigene Crew.': 'The name shows on your captain card, the wanted poster and your player card on the leaderboard. It is just for your own crew.',
  'Bandenname entfernt': 'Crew name removed', '🏴‍☠️ Bande getauft': '🏴‍☠️ Crew named', 'Frucht ablegen': 'Remove fruit', 'Fruchtplatz': 'Fruit slot',
  'Dieser Name geht leider nicht.': 'Sorry, that name doesn’t work.'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Ihr seid jetzt die „(.+)“\.$/, 'You are now the “$1”.'],
  [/^(.+) ausgerüstet$/, (m, n) => (GL.data.en[n] || n) + ' equipped'],
  [/^(.+)\. Wirkt, wenn dein Pirat Kapitän ist\.$/, (m, t) => (GL.i18n && GL.i18n.t ? GL.i18n.t(t) : t) + '. Works when your pirate is captain.']
]);
