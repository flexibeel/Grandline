// Englisch: Großer Neustart (Countdown, Einladung, Veteranen-Titel, Erste Fahrt)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, {
  '🔒 Noch freizuspielen': '🔒 Still to unlock', 'Noch freizuspielen': 'Still to unlock', '▲ Bonus': '▲ Bonus',
  'Beute-Atlas': 'Loot atlas', 'Jeder Boss hütet ein Fundstück': 'Every boss guards a keepsake', '✓ gefunden': '✓ found', '✦ legendär': '✦ legendary', '? noch nie gesehen': '? never seen',
  '🔧 Feinschliff': '🔧 Fine-tuning', 'Alle Pfade voll. Weitere Punkte machen kleine Dinge etwas besser.': 'All paths full. More points make small things a bit better.',
  '+1 % Berry je Punkt': '+1 % berry per point', '+1 % Gold pro Sieg je Punkt': '+1 % gold per win per point', '+1 Leben für jede Figur je Punkt': '+1 health for every member per point',
  '🎁 Fundstück': '🎁 Keepsake', '🎯 Fundstück': '🎯 Keepsake',
  'Smokers Jitte': "Smoker's Jitte", 'Arlongs Kiribachi': "Arlong's Kiribachi", 'Crocodiles Sandring': "Crocodile's Sand Ring", 'Enels Trommelamulett': "Enel's Drum Amulet", 'Hodys Haifischweste': "Hody's Shark Vest",
  'Vanders Zielkompass': "Vander's Target Compass", 'Luccis Taubenhalstuch': "Lucci's Pigeon Scarf", 'Kakus Stierhorn-Klinge': "Kaku's Bull-Horn Blade", 'Morias Schattenkette': "Moria's Shadow Chain", 'Kumas Bibelmantel': "Kuma's Bible Coat",
  'Das Ziel: Auf jeder Insel wartet ein Bösewicht. Besieg ihn, dann geht es weiter. Mehr musst du fürs Erste nicht wissen.': 'The goal: every island has a villain. Beat them and sail on. That is all you need to know for now.',
  'Kämpfen tut die Crew von allein. Du suchst nur aus, wer mitfährt. Man nennt das Führungsstärke.': 'Your crew fights on its own. You just pick who comes along. They call it leadership.',
  'Schätze machen deine Crew bis zum Ende des Runs stärker. Nimm einen, der zu deinen Leuten passt. Alle auf einmal geht nicht, ich habe gefragt.': 'Treasures make your crew stronger until the run ends. Take one that suits your people. All at once is not allowed, I asked.',
  'segeln gerade': 'are sailing right now', 'segelt gerade': 'is sailing right now',
  'Schläger': 'Thug',
  'Normale Gegner, normale Beute': 'Normal foes, normal loot', 'Gegner stärker': 'Stronger foes', 'Mehr Gold pro Sieg': 'More gold per win', 'Mehr Kopfgeld': 'More bounty', 'Bösewicht lässt oft einen Extra-Schatz fallen': 'The villain often drops an extra treasure',
  'Übungskampf: Ab 1100 zählt die Marine nicht mehr für die Liga.': 'Practice bout: above 1100 the Marines no longer count for the league.',
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
  'Neuer Anlauf, neues Glück. Dein alter Stand ist auf diesem Gerät gesichert.': 'New run at it, new luck. Your old save is backed up on this device.',
  'Sicher? Nochmal tippen': 'Sure? Tap again'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^⛵ Seit dem Live-Start: Bestwerte und Zähler starten bei null, es zählen nur Fahrten ab dem 18\.10\., 18 Uhr\. (.*)$/, (m, a) => '⛵ Since the live start: best scores and counters start at zero, only voyages from Oct 18, 6 pm count. ' + (GL.i18n && GL.i18n.t ? GL.i18n.t(a) : a)]
]);
Object.assign(GL.data.en, { '⏸ Pause': '⏸ Pause', '⚓ Willkommen zurück': '⚓ Welcome back', 'Dein Run hat hier auf dich gewartet.': 'Your run waited right here for you.' });
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Ganze Crew heilt sich am Ende jeder Runde um (\d+)\.$/, 'The whole crew heals $1 at the end of every round.']
]);
Object.assign(GL.data.en, { '📬 Postfach': '📬 Mailbox', 'Post abholen': 'Check mail', '🍾 Schaue nach …': '🍾 Checking …', 'Keine neue Post. Das Meer ist ruhig.': 'No new mail. The sea is quiet.',
  'Noch keine Flaschenpost. Verschicken geht so: Stammcrew → Figur antippen → Teil aus der Truhe wählen → „🍾 Flaschenpost“. Beim Freund kommt sie an, sobald er das Spiel öffnet, und landet in seiner Truhe.': 'No bottles yet. To send one: home crew → tap a member → pick an item from the chest → “🍾 Message in a bottle”. Your friend gets it as soon as they open the game, straight into their chest.' });
Object.assign(GL.data.en, { 'SUUUPER, du bist da! Hier baust du Schiff und Crew gemütlicher aus. Punkte kommen nebenbei: pro Rang, durch Fahrten, Landgänge und Vertrautheit. Tipp auf einen hellen Knoten, dann „Lernen ✦“. Gilt für jede kommende Fahrt, Umskillen kostet nix.': 'SUUUPER, you made it! This is where you make ship and crew cozier. Points come along the way: per rank, from voyages, shore leaves and bonds. Tap a bright node, then “Learn ✦”. Counts for every voyage to come, respec is free.' });
Object.assign(GL.data.en, {
  'Bis zum Ende der Insel:': 'Until the island ends:', 'Bis zum Ende der Insel': 'Until the island ends',
  'Kämpfer': 'Fighter', '⚔ Kämpfer': '⚔ Fighter',
  'Deine Crew ist wieder voll geheilt. Als Belohnung wird': 'Your crew is fully healed again. As a reward,', 'eine Figur deiner Wahl': 'one crew member of your choice', 'stärker, bis zum Ende dieses Runs.': 'gets stronger until the end of this run.',
  'Tipp: Am meisten bringt es deinem stärksten Angreifer oder der Figur, die vorne viel einsteckt.': 'Tip: it pays off most on your strongest attacker or whoever takes the most hits up front.',
  'Insel-Twist dieser Etappe': 'Island twist of this stage'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Kämpfer (\d+)$/, 'Fighter $1'],
  [/^Rang (\d+)( · Vertraut (\d+))? → \+(\d+) Leben, \+(\d+) Angriff(?:, \+(\d+) Tempo)?$/, (m, r, b, bv, hp, atk, spd) => `Rank ${r}${bv ? ' · Bond ' + bv : ''} → +${hp} HP, +${atk} attack${spd ? ', +' + spd + ' speed' : ''}`],
  [/^Rank (\d+)( · Vertraut (\d+))? → \+(\d+) Leben, \+(\d+) Angriff(?:, \+(\d+) Tempo)?$/, (m, r, b, bv, hp, atk, spd) => `Rank ${r}${bv ? ' · Bond ' + bv : ''} → +${hp} HP, +${atk} attack${spd ? ', +' + spd + ' speed' : ''}`]
]);
// Hotfix-Runde 2
Object.assign(GL.data.en, {
  'Ersten Maat wählen': 'Choose your first mate',
  'Kapitän bist du selbst. Dein Maat bleibt den ganzen Run.': 'You are the captain. Your mate stays for the whole run.',
  'Kapitän bist du selbst, dein Maat bleibt den ganzen Run.': 'you are the captain, your mate stays for the whole run.',
  'Ersten Maat wählen.': 'Choose your first mate.'
});
Object.assign(GL.data.en, { 'Kurs setzen': 'Set course', 'Automatisch verteilen': 'Distribute automatically' });
Object.assign(GL.data.en, { 'Deine Crew ist gerade gesund': 'Your crew is healthy right now' });

// END: Kopfgeld-Leiter und Meisterschaft
Object.assign(GL.data.en, {
  'Kopfgeld-Leiter': 'Bounty ladder', 'Wie hoch traust du dich?': 'How high do you dare?', 'Zurück an Deck': 'Back on deck',
  'Gewinne auf deiner höchsten Stufe, dann wartet die nächste Sprosse. Jede Stufe legt eine Regel drauf und zahlt Berry. Die Marine führt Buch.': 'Win on your highest level and the next rung awaits. Every level adds a rule and pays Berry. The Marines keep records.',
  'Meisterschaft': 'Mastery', 'Zähes Pack': 'Tough Crowd', 'Gegner heilen sich jede Runde ein wenig.': 'Enemies heal a little every round.',
  'Nachschub ohne Ende': 'Endless Reinforcements', 'Gegnerwellen bringen einen Gegner mehr, Gegner +8 % Angriff.': 'Enemy waves bring one more foe, enemies +8 % attack.',
  'Teure Häfen': 'Pricey Harbors', 'Die Taverne verlangt 25 % mehr.': 'The tavern charges 25 % more.',
  'Gepanzerte Marine': 'Armored Marines', 'Gegner haben 1 Rüstung.': 'Enemies have 1 armor.',
  'Mageres Kopfgeld': 'Lean Bounties', 'Siege bringen 20 % weniger Gold.': 'Wins pay 20 % less gold.',
  'Scharfe Klingen': 'Sharp Blades', 'Gegner treffen öfter kritisch.': 'Enemies crit more often.',
  'Kaiserliches Gefolge': 'Imperial Retinue', 'Bosse: ein Begleiter mehr und 20 % mehr Leben.': 'Bosses: one more escort and 20 % more health.',
  'Ausgedörrt': 'Parched', 'Heilung nach Siegen noch einmal geringer.': 'Healing after wins drops even further.',
  'Flinke Gegner': 'Nimble Foes', 'Gegner +1 Tempo.': 'Enemies +1 speed.',
  'Stählerne Haut': 'Steel Skin', 'Gegner +1 Rüstung, +5 % Angriff und heilen sich mehr.': 'Enemies +1 armor, +5 % attack and heal more.',
  'Sturmsaison': 'Storm Season', 'Gegner +20 % Leben und +12 % Angriff.': 'Enemies +20 % health and +12 % attack.',
  'Ende der Welt': 'End of the World', 'Alle Gegner +20 % Leben, Bosse +25 % Leben und Angriff, noch mehr Nachschub.': 'All enemies +20 % health, bosses +25 % health and attack, even more reinforcements.',
  'Kupferbeschlag': 'Copper Trim', 'Glühender Steckbrief': 'Glowing Wanted Poster', 'Klingenrand': 'Blade Edge', 'Sturmglas': 'Storm Glass',
  'Gesucht': 'Wanted', 'Seebär': 'Old Salt', 'Yonko-Anwärter': 'Emperor Hopeful', 'Schrecken der zehnten Sprosse': 'Terror of the Tenth Rung',
  'Zahlt keine Hafengebühr': 'Pays No Harbor Fees', 'Geizhals der Grand Line': 'Miser of the Grand Line', 'Kaiserjäger': 'Emperor Hunter',
  'Wüstenläufer': 'Desert Walker', 'Sturmreiter': 'Storm Rider', 'Am Ende der Welt gewesen': 'Been to the End of the World',
  'Lehrmeister': 'Mentor', 'Meister von Fünf': 'Master of Five', 'Großmeister der Bande': 'Grandmaster of the Crew',
  'Strickleiter': 'Rope Ladder', 'Zähes Herz': 'Tough Heart', 'Ankerkette': 'Anchor Chain', 'Vier Kronen': 'Four Crowns', 'Schwarze Sonne': 'Black Sun',
  'Meister-Figuren': 'master characters', 'Silber': 'Silver', 'Meister': 'Master'
});
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Figuren sammeln Meisterschaft, wenn sie im Run dabei sind\. Bronze: Rahmen · Silber: zweites Outfit · Gold: Fähigkeit \+15 % · Meister: Titel\.$/, 'Characters gain mastery by joining runs. Bronze: frame · Silver: second outfit · Gold: ability +15 % · Master: title.'],
  [/^Bronze: Rahmen · Silber: zweites Outfit · Gold: Fähigkeit \+15 % · Meister: Titel\.$/, 'Bronze: frame · Silver: second outfit · Gold: ability +15 % · Master: title.'],
  [/^(Silber|Gold|Meister|Bronze)( · .+)?$/, (m, t, rest) => ({ Silber: 'Silver', Meister: 'Master', Gold: 'Gold', Bronze: 'Bronze' })[t] + (rest || '').replace(' · zweites Outfit', ' · second outfit').replace(' · Fähigkeit +15 %', ' · ability +15 %')],
  [/^(.+) ist jetzt Meister\. Es hat sich nichts verändert, aber alle grüßen anders\.$/, '$1 is a master now. Nothing has changed, but everyone greets differently.'],
  [/^(.+) hat ausgelernt\. Behauptet (.+)\.$/, '$1 has nothing left to learn. Says $2.'],
  [/^Meister (.+)\. Die Möwen nicken anerkennend\.$/, 'Master $1. The gulls nod approvingly.'],
  [/^(.+) ist Meister\. Das Abzeichen glänzt mehr als nötig\.$/, '$1 is a master. The badge shines more than necessary.'],
  [/^Stufe (\d+)$/, 'Level $1']
]);
