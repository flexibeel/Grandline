// Neuigkeiten im Spiel. Neueste zuerst. v = Versionskennung (auch in version.json eintragen!)
window.GL = window.GL || {};
GL.patchNotes = [
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
