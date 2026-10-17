// Freischaltungen im Hauptquartier: Neue Spieler sehen erst wenig, mit jedem Piratenrang (Level) kommt etwas dazu.
//   lvl   = ab diesem Level (Rang 1 = Level 1)
//   or    = alternativ freigeschaltet, wenn diese Bedingung schon erfüllt ist (profile => bool)
//   tab   = HQ-Reiter, den die Freischaltung öffnet
//   art   = kleines Bild im Pop-up (siehe featureArt in render.js)
//   steps = zwei, drei kurze Sätze „So geht's“
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.features = [
  { id: 'quests',    lvl: 2, name: 'Aufträge',       art: 'scroll', text: 'Kleine Aufgaben für zwischendurch. Jeden Tag kommen neue.',
    steps: ['Steht oben im Hauptquartier', 'Erledigt sich nebenbei beim Spielen', 'Abholen bringt Berry und Rang-EP'] },
  { id: 'schmiede',  lvl: 2, tab: 'schmiede', name: 'Die Schmiede', art: 'anvil', text: 'Ausrüstung aus deinen Runs landet hier. Du kannst sie verbessern und mit auf See nehmen.',
    steps: ['Ausrüstung findest du in Runs', 'Mit Berry eine Stufe höher schmieden', 'Antippen = beim nächsten Run dabei'] },
  { id: 'lager',     lvl: 3, tab: 'lager', name: 'Das Lager', art: 'crate', text: 'Proviant und Hilfsmittel, die jeden Run etwas leichter machen.',
    steps: ['Beim Händler kaufen', 'Im Lager einpacken', 'Wirkt ab dem nächsten Run'] },
  { id: 'haendler',  lvl: 3, tab: 'haendler', name: 'Der Händler', art: 'stall', text: 'Hier gibst du Berry für Proviant und Hilfsmittel aus.',
    steps: ['Berry gibt es für jeden Run', 'Gekauftes liegt im Lager'] },
  { id: 'kammer',    lvl: 4, tab: 'kammer', name: 'Die Schatzkammer', art: 'chest', text: 'Artefakte von Bossen und Raids. Jedes wird stärker, je öfter du es findest.',
    steps: ['Bosse lassen manchmal Artefakte fallen', 'Bis zu drei kommen mit auf See'],
    or: p => (p.artifacts && Object.keys(p.artifacts).length > 0) || Object.keys(p.vault || {}).length > 0 },
  { id: 'daily',     lvl: 4, name: 'Tageskarte', art: 'scroll', text: 'Jeden Tag eine Karte, für alle gleich. Ohne Ausbauten, nur Können und Glück. Ein Versuch pro Tag.',
    steps: ['Unter „Leinen los“ starten', 'Alle spielen dieselbe Route', 'Punkte landen in der Tages-Rangliste'] },
  { id: 'rangliste', lvl: 5, tab: 'rangliste', name: 'Die Rangliste', art: 'podium', text: 'Ab jetzt stehst du sichtbar neben den anderen Piraten. Tipp auf einen Namen, um seine Karte zu sehen.',
    steps: ['Jeder Run zählt für deinen Rang', 'Tipp auf Spieler für ihre Visitenkarte'] },
  { id: 'jagd',      lvl: 6, tab: 'lager', name: 'Raid-Jagd', art: 'chest', text: 'Wähle vor dem Ablegen einen Raid-Boss als Ziel. Jeder hat zwei seltene Beutestücke für deine Vitrine.',
    steps: ['Ziel unter „Leinen los“ wählen', 'Ab dem zweiten Meer wartet der Raid', 'Beute landet in der Vitrine im Lager'] },
  { id: 'route',     lvl: 8, name: 'Neue Route: Thriller Bark', art: 'flag', text: 'Im dritten Meer kannst du jetzt zwischen zwei Routen wählen: Enies Lobby oder Thriller Bark mit neuen Bossen.',
    steps: ['Beim Kurs setzen im dritten Meer', 'Eine Insel aus jeder Route steht zur Wahl', 'Neue Gegner, neues Kopfgeld'] },
  { id: 'stammcrew', lvl: 10, tab: 'stammcrew', name: 'Deine Stammcrew', art: 'flag', text: 'Deine feste Crew für Duelle gegen andere Spieler. Sie wächst mit jedem Duell.',
    steps: ['Vier Figuren fest aufstellen', 'Gegner ähnlicher Stärke herausfordern', 'Siege bringen Liga-Punkte'],
    or: p => p.stats && p.stats.wins > 0 }
];
