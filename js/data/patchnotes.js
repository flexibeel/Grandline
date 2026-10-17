// Neuigkeiten im Spiel. Neueste zuerst. v = Versionskennung (auch in version.json eintragen!)
window.GL = window.GL || {};
GL.patchNotes = [
  { v: '2026-10-17zd', date: '17.10.', title: 'Mehr Leben im Kampf, Auswahl als Fenster', items: [
    'Ultis zeigen eigene Pixel-Effekte: Faust bei Kraft, Klingenhieb bei Klinge, Blitz bei Technik, bei Flächen-Ultis eine Welle über alle Gegner',
    'Zustände sieht man auf dem Feld: Flammen, Blutstropfen, Sterne, Totenkopf, Schild, Heil-Funken',
    'Taverne, Früchte, Schätze und Ereignisse öffnen als Fenster über dem Run: alles auf einen Blick, kein Scrollen',
    'Symbole antippen erklärt kurz, was sie bedeuten',
    'Startbildschirm: statt Spielerzahl an der Rangliste zeigt ein kleines Schild, wer gerade auf See und heute an Bord war' ] },
  { v: '2026-10-17zc', date: '17.10.', title: 'Banden-Wappen und neue Symbole', items: [
    'Jede Bande hat ein eigenes Pixel-Wappen (Strohhut, Marine, CP9, Weißbart, Samurai, Baroque Works), dazu Symbole für Kampfstil und Rolle',
    'Taverne: Wappen und Symbole auf jedem Angebot, „+ Bonus“ zeigt, wenn eine Figur einen Bonus freischaltet',
    'Vergleichspfeile erst, wenn das Schiff voll ist. Vorher ist jede Figur ein Gewinn',
    'Boni-Leiste links mit den neuen Symbolen, Links oben als kleine Holzknöpfe',
    'In der Rangliste erscheinst du erst nach deinem ersten abgeschlossenen Run' ] },
  { v: '2026-10-17zb', date: '17.10.', title: 'Stammcrew vergleichen', items: [
    'Alle Figuren in der Stammcrew-Auswahl zeigen Leben, Angriff und Tempo, mit Pixel-Pfeilen im Vergleich zu deiner schwächsten aufgestellten Figur',
    'Duell-Vorschau: Platz gegen Platz, deine Figur neben der gegnerischen, jeweils mit Pfeilen, wer stärker ist',
    'Fenster liegen jetzt immer über der unteren Leiste' ] },
  { v: '2026-10-17za', date: '17.10.', title: 'Runder, räumlicher, schneller', items: [
    'Pixel-Rahmen mit rund gezeichneten Ecken, Knöpfe mit Tiefe, die sich beim Antippen eindrücken',
    'Fenster gleiten sanft herein',
    'Vier Tempostufen bis „Turbo“, gut sichtbar am Knopf und oben rechts im Kampfbild',
    'Lange Kämpfe werden ab Runde 4 und 7 von selbst flotter',
    'Endlos-Rangliste jetzt direkt in der Hauptauswahl der Rangliste',
    'Neue feste Leiste unten im Hauptquartier: Hafen, Aufträge, Crew, Rangliste, Kapitän mit einem Tipp erreichbar' ] },
  { v: '2026-10-17y', date: '17.10.', title: 'Pixel-Look und neue Taverne', items: [
    'Holzrahmen im Pixel-Stil statt runder Ecken: Hauptquartier, Schilder, Fenster, Spielfläche',
    'Taverne kompakt: Angebote als Kästchen nebeneinander, Antippen zeigt Details und „Anheuern“, deine Crew direkt darunter',
    'Pixel-Pfeile vergleichen jedes Angebot mit deiner schwächsten Figur (grün besser, rot schlechter, zwei Pfeile = deutlich)',
    'Entlassen direkt an der Figur, die schwächste ist rot umrahmt',
    'Am PC stehen die Boni nur noch links in der Leiste, nicht doppelt unter der Crew' ] },
  { v: '2026-10-17w', date: '17.10.', title: 'Gemütlicher Hafen', items: [
    'Neuer Hintergrund: Himmel, Meer und ein Holzsteg statt leerem Beige. Fenster und Hauptquartier wie Pergament mit Holzrahmen',
    'Alles auf einen Blick: unter „Leinen los“ stehen Endlos-Fahrt, Tageskarte und Raid-Ziel als Schilder nebeneinander',
    'Aufträge sind jetzt ein eigener Raum im Hafen, mit Hinweis, wenn etwas abzuholen ist' ] },
  { v: '2026-10-17v', date: '17.10.', title: 'Neues Hauptquartier: der Hafen', items: [
    'Alle Räume als Holzschilder direkt unter „Leinen los“: Stammcrew, Rangliste, Werft, Schmiede und mehr',
    'Ein Raum füllt die Seite, oben „‹ Hafen“ zum Zurückgehen und kleine Sprungknöpfe zu den anderen Räumen',
    'Tageskarte und Endlos-Fahrt stehen gesammelt unter „Besondere Fahrten“',
    'Gegnersuche wechselt die Gegner ab, statt immer denselben zu zeigen' ] },
  { v: '2026-10-17u', date: '17.10.', title: 'Fehler behoben: Begegnung auf See', items: [
    'Der Kampf gegen die Crew eines Mitspielers startet jetzt richtig',
    'Begegnungen bekommen einen eigenen Auftritt mit dem Namen des Spielers' ] },
  { v: '2026-10-17t', date: '17.10.', title: 'Duelle zügiger', items: [
    '„Gegner suchen“ zeigt zuerst eine Karte: Crew, Ausrüstung, Stärke beider Seiten und deine Siegchance',
    'Angreifen oder anderen Gegner suchen. Nach dem Kampf geht es direkt zum nächsten',
    'Duelle lassen sich schneller abspielen statt überspringen',
    'Endlos-Fahrt zählt nicht für Freischaltungen: neue Kapitäne gibt es nur auf den normalen Routen',
    'Neu: 🔹 Meersplitter aus der Endlos-Fahrt (tiefere Meere geben mehr). Damit würfelst du die Zusatzwerte deiner Ausrüstung neu' ] },
  { v: '2026-10-17r', date: '17.10.', title: 'Dein eigenes Schiff', items: [
    'Im Profil kannst du jetzt dein Schiff anpassen: Segel, Rumpf, Flagge und Galionsfigur',
    'Neue Teile schaltest du mit Rängen, Siegen, Raids und Funden frei',
    'Dein Schiff segelt im Hauptquartier, auf der Seekarte und im Startbild' ] },
  { v: '2026-10-17q', date: '17.10.', title: 'Endlos-Fahrt als eigener Modus', items: [
    'Neu im Hauptquartier: Endlos-Fahrt. Wähle ein Meer, dessen Boss du besiegt hast, und segle es Runde um Runde, immer härter',
    'Freigeschaltet mit dem ersten besiegten Meeres-Boss und Rang 4. Tiefere Meere zählen mehr',
    'Zwischen den Runden legst du im Hafen an: Crew umstellen, entlassen, anheuern',
    'Endlos-Rangliste: tiefstes Meer und meiste Runden zählen',
    'Ausrüstung per Hand auf die Figuren ziehen, passende Plätze leuchten grün',
    'Werft und Stammcrew zeigen mit einem Punkt, wenn sich dort etwas lohnt (leistbarer Ausbau, neue Beute)' ] },
  { v: '2026-10-17o', date: '17.10.', title: 'Begegnung auf See', items: [
    'Manchmal kreuzt statt eines normalen Kampfes die Stammcrew eines echten Mitspielers deinen Kurs, auf dein Level angepasst',
    'Sieg gegen einen Mitspieler bringt Extra-Gold',
    'Ausrüstung: Waffen, Kleidung, Schmuck und Trophäen klar beschriftet und sortiert' ] },
  { v: '2026-10-17n', date: '17.10.', title: 'Trophäen und Zwischenhafen', items: [
    'Raid-Beute aus der Vitrine ist jetzt auch eine Trophäe für deine Stammcrew: eigene Spezialfähigkeit plus zufällige Werte',
    'Endlos-Modus: Vor jeder neuen Runde legst du im Zwischenhafen an. Crew umstellen, entlassen, neu anheuern',
    'Endlos-Rangliste zählt jetzt geschaffte Runden',
    'Update-Hinweis kommt auch mitten im Run, mit den wichtigsten Neuerungen. Dein Run bleibt gespeichert',
    'Weniger, dafür spannendere Auswahl: drei Kapitäne zum Start (plus dein Pirat), drei Angebote in der Taverne, Neu würfeln billiger',
    '3-Sterne-Figuren sind häufiger und stärker, epische und legendäre Beute leuchtet deutlich',
    'Das Kampfbild bleibt nach dem Sieg gleich groß, nichts springt mehr' ] },
  { v: '2026-10-17l', date: '17.10.', title: 'Ausrüstung für deine Stammcrew', items: [
    'Bosse und Raids lassen Waffen, Kleidung und Schmuck fallen, mit zufälligen Werten und vier Seltenheiten',
    'Jede Figur der Stammcrew hat drei Plätze. Legendäre Teile tragen den Namen des Bosses',
    'Jedes Teil merkt sich, wo und wann du es gefunden hast. Auf der Karte deiner Freunde antippen und ansehen',
    'Stammcrew schon ab Rang 5. Im Endlos-Modus fällt öfter und bessere Beute',
    'Neue Version? Das Spiel fragt jetzt, ob du neu laden möchtest, statt es einfach zu tun' ] },
  { v: '2026-10-17k', date: '17.10.', title: 'Bosse mit drei Phasen, Kampfwetter, Tempo statt Überspringen', items: [
    'Bosskämpfe dauern länger, je weiter du kommst. Bosse weichen manchmal aus und kontern sofort',
    'Drei Phasen: ab 60 % wird der Boss wütend, ab 25 % kommt die Endphase mit voller Ulti und kurzem Durchatmen',
    'Kampfwetter: Manche Kämpfe haben Nebel, Rückenwind, Vollmond, Hitzewelle … jeder Kampf fühlt sich anders an',
    'Überspringen ist weg. Stattdessen drei Tempostufen (gemütlich, zügig, schnell), die sich das Spiel merkt',
    'Erste Funde erklären sich kurz selbst: Raid-Beute, epische Ausrüstung, Artefakte',
    'Bosse im Kostüm: Crocodile als Krokodil, Arlong als Hai, Lucci mit Leopardenohren und mehr',
    'Willkommen zurück: Nach einer Pause zeigt eine kleine Karte, was neu ist' ] },
  { v: '2026-10-17i', date: '17.10.', title: 'Bosskämpfe als Ereignis', items: [
    'Bosse treten mit eigenem Auftritt an: Kinobalken, Name, Kopfgeld',
    'Boss-Leiste oben im Kampf. Bei halbem Leben wird der Boss wütend: stärker, schneller, rot leuchtend',
    'Letzter Wille: Wird es knapp, rafft sich deine Crew einmal auf (Ulti-Leisten laden, Mut für alle)',
    'Der letzte Treffer bekommt ein großes K.O., große Treffer zeigen größere Zahlen',
    'Neue Treffer-Effekte im Pixel-Stil, Bosse sind größer, Crocodile kommt im Krokodil-Kostüm',
    'Rangliste und Liga aktualisieren sich jetzt laufend, nicht erst nach einem Run' ] },
  { v: '2026-10-17h', date: '17.10.', title: 'Ultis mit Überraschung', items: [
    'Ultis sind nicht mehr immer gleich: Schaden schwankt, kann kritisch treffen und wird mit jeder weiteren Ulti im Kampf stärker',
    'Manchmal gelingt eine Ulti „Perfekt“ (alles stärker, Zustände halten länger) oder bringt einen Bonus passend zum Kampfstil',
    'Nach einem Sieg schrumpft das Kampfbild: Level-Aufstiege und Weiter-Knopf ohne Scrollen sichtbar',
    '„Neu“-Markierung für Gegner, die du noch nie besiegt hast, und Inseln, auf denen du noch nie warst',
    'Tageskarte schon nach dem ersten Run, besser erklärt und hervorgehoben, solange sie heute noch offen ist',
    'Neuer Knopf ↻ zum Neuladen der Seite (wie F5, auch in der Handy-App)',
    'Tipp-Abzeichen auf Schatzkarten wird nicht mehr abgeschnitten' ] },
  { v: '2026-10-17g', date: '17.10.', title: 'Neue Figurenkarten', items: [
    'Figuren sehen jetzt aus wie echte Sammelkarten: Bild mit Podest, Bandenfarbe, Werte als kleine Abzeichen',
    'Drei-Sterne-Karten glänzen ganz leicht',
    'Nach dem Kopfgeld: klar erklärt, was die Belohnung bringt, mit Werten vorher und nachher' ] },
  { v: '2026-10-17e', date: '17.10.', title: 'Endlos-Modus', items: [
    'Nach dem Sieg weitersegeln: jede Endlos-Runde stärkere Gegner, auch die Bosse',
    'Neue Rangliste „Endlos“: wer kommt am weitesten?' ] },
  { v: '2026-10-17d', date: '17.10.', title: 'Wettfahrt teilen', items: [
    'Wettfahrt: Code mit kurzer Erklärung, Teilen-Knopf und Link für den Kumpel',
    'Wer den Link öffnet, kann die Herausforderung direkt annehmen',
    'Rangliste zeigt die weiteste Fahrt mit Kapitel, z. B. Paradies · Alabasta' ] },
  { v: '2026-10-17c', date: '17.10.', title: 'Schöner, schneller, mit einer Hand', items: [
    'Kampf mit Tiefe: plastische Pixel-Figuren, die atmen, Ulti-Spotlight und Boss-Auftritt',
    'Ruhigere Figurenkarten mit weniger Text, auf dem Handy kompakter',
    'Wichtige Knöpfe kleben unten im Daumenbereich, einhändig spielbar',
    'Rangliste schon ab Rang 2, frühe Ränge gehen schneller',
    'Rangliste zeigt die Reise jedes Spielers und wer gerade auf See ist',
    'Spielstand gleicht sich jetzt auch ab, wenn du die App wieder öffnest' ] },
  { v: '2026-10-17b', date: '17.10.', title: 'Tageskarte und neue Route', items: [
    'Tageskarte: jeden Tag dieselbe Route für alle, Rangliste mit Teams, Belohnung am Folgetag',
    'Neue Route ab Rang 8: Thriller Bark mit Moria, Kuma und vier neuen Bösewichten',
    'Neuer Raid: Blackbeard mit Finsternis-Frucht und zwei Beutestücken',
    'Wettfahrt mit Freunden: Code teilen, gleiche Route, wer holt mehr Punkte?',
    'Stammcrew-Verteidigung: Meldung, wenn jemand deine Crew herausfordert',
    'Bis zu drei Spielstände pro Gerät, Feedback mit Sternen' ] },
  { v: '2026-10-17a', date: '17.10.', title: 'Raid-Jagd und Freischaltungen', items: [
    'Raid-Jagd: Boss als Ziel wählen, epische und legendäre Beute für die Vitrine',
    'Neues startet schlank, mehr schaltet sich mit dem Rang frei',
    'Besondere Gegner (Sanitäter, Schildträger …) und 21 Duo-Boni',
    'Spielercode-Login, Streamer-Modus, Namensfilter, Datenschutz-Seite' ] }
];
GL.version = GL.patchNotes[0].v;
