// Englisch: Visitenkarte und Segelkumpane
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  '♥ Segelkumpan': '♥ Sailing buddy',
  'Ihr seid zusammen unterwegs. Entfernen geht in deiner Freundesliste.': 'You sail together. You can remove them in your friends list.',
  'Als Segelkumpan anheuern': 'Hire as sailing buddy',
  'Bestwert': 'Best score', 'Siege': 'Wins', 'Runs': 'Runs', 'Härtester Treffer': 'Hardest hit', 'K.o.s': 'K.O.s',
  'Mio. ฿ Kopfgeld': 'M ฿ bounty', 'Landgänge gemeistert': 'Shore leaves cleared', 'Meere geschafft': 'Seas completed', 'Kapitäne frei': 'Captains unlocked',
  '✦ Vitrine': '✦ Showcase', '✦ Artefakte': '✦ Artifacts', '✦ Seltene Funde': '✦ Rare finds',
  'Neuer Segelkumpan': 'New sailing buddy', 'Leinen los!': 'Cast off!', '♥ Freundesliste': '♥ Friends list',
  'Post vom Hafen': 'Harbor mail', 'Zurück anheuern? Dann seid ihr gegenseitig in der Freundesliste.': 'Hire them back? Then you are in each other’s friends list.',
  '⚓ Zurück anheuern': '⚓ Hire back', '♥ Schon dabei': '♥ Already aboard', 'Später': 'Later', '⚓ Zurück angeheuert': '⚓ Hired back', 'du': 'you', 'ohne Ausrüstung': 'no gear'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^(.+) landet in deiner Freundesliste und bekommt Bescheid$/, '$1 joins your friends list and gets notified'],
  [/^🏝 ([\d.]+) Landgänge$/, '🏝 $1 shore leaves'],
  [/^(\d+) (Ort|Orte)$/, (m, n) => n + (n === '1' ? ' place' : ' places')],
  [/^Ahoi! (.+) ist jetzt dein Segelkumpan\.$/, 'Ahoy! $1 is now your sailing buddy.'],
  [/^Ihr seht euch in der Freundesliste, wer gerade online ist, und könnt euch Flaschenpost schicken\. (.+) bekommt Bescheid und kann dich zurück anheuern\.$/, 'You see each other in the friends list, who is online, and can send each other bottles. $1 gets notified and can hire you back.'],
  [/^(.+) hat dich als Segelkumpan angeheuert!$/, '$1 hired you as a sailing buddy!'],
  [/^(\d+) Piraten haben dich als Segelkumpan angeheuert!$/, '$1 pirates hired you as a sailing buddy!'],
  [/^(.+) ist jetzt dein Segelkumpan\.$/, '$1 is now your sailing buddy.']
]);
