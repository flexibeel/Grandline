// Englisch: Großer Neustart (Countdown, Einladung, Veteranen-Titel, Erste Fahrt)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  'Veteran der Testfahrt': 'Test Voyage Veteran', 'Erstsegler': 'First Sailor', 'Erste Fahrt': 'Maiden Voyage',
  'Vor dem großen Neustart gesegelt': 'Sailed before the big relaunch', 'Am Startabend (18./19.10.) gesegelt': 'Sailed on launch night (Oct 18/19)',
  '⛵ Flagge „Erste Fahrt“': '⛵ “Maiden Voyage” flag',
  'Du bist am Startabend gesegelt. Flagge und Titel „Erstsegler“ liegen im Profil.': 'You sailed on launch night. The flag and the title “First Sailor” are in your profile.',
  'Einladung samt Link. Einfach in WhatsApp & Co. einfügen.': 'Invite with link. Just paste it into WhatsApp & co.',
  'QR-Code gerade nicht verfügbar': 'QR code not available right now'
});
Object.assign(GL.data.en, {
  '🎁 Dankeschön für die Testfahrt': '🎁 Thanks for the test voyage',
  'Du bist weit gekommen: 2 epische Ausrüstungsteile liegen für deine Crew in der Truhe.': 'You made it far: 2 epic gear pieces for your crew are waiting in the chest.',
  'Dank für die Testfahrt': 'Thanks for the test voyage', 'Testfahrt': 'Test voyage'
});
Object.assign(GL.data.en, {
  '⛵ Frischer Start': '⛵ Fresh start',
  'Neue Saison, neues Glück. Dein alter Stand ist auf diesem Gerät gesichert.': 'New season, new luck. Your old save is backed up on this device.',
  'Sicher? Nochmal tippen': 'Sure? Tap again'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^⛵ Saison 1: Bestwerte und Zähler starten bei null, es zählen nur Fahrten ab dem 18\.10\., 18 Uhr\. (.*)$/, (m, a) => '⛵ Season 1: best scores and counters start at zero, only voyages from Oct 18, 6 pm count. ' + (GL.i18n && GL.i18n.t ? GL.i18n.t(a) : a)]
]);
Object.assign(GL.data.en, { '⏸ Pause': '⏸ Pause', '⚓ Willkommen zurück': '⚓ Welcome back', 'Dein Run hat hier auf dich gewartet.': 'Your run waited right here for you.' });
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Ganze Crew heilt sich am Ende jeder Runde um (\d+)\.$/, 'The whole crew heals $1 at the end of every round.']
]);
