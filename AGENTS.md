# Grand Line: Regeln für Cursor (Grok) und andere Coding-Agenten

Du baust mit an **The Great Line** (thegreatline.de), einem kostenlosen Pixel-Roguelike von Felix (flexibeel) und Jan. Es gibt kein Geld damit.
Die Arbeit ist aufgeteilt: **Claude plant und prüft, du baust.** Felix und Jan entscheiden.

## Zuerst lesen, in dieser Reihenfolge
1. `claude/FAHRPLAN.md`: Stand, was live ist, was wartet, Warteschlange. Dein Auftrag steht dort im Abschnitt **„Bauaufträge für Cursor“**.
2. `CLAUDE.md`: die Arbeitsregeln. Sie gelten für dich genauso (außer dem Abschnitt „Modellwahl“).
3. `README.md`, Abschnitt „Ordner“: die Karte, wo was liegt. Dann nur die Dateien öffnen, die der Auftrag nennt. Nicht das ganze Projekt durchsuchen.

## Ablauf für einen Bauauftrag
1. Nimm genau **einen** Auftrag mit Status „offen“ aus „Bauaufträge für Cursor“. Steht keiner da: nichts bauen, Jan Bescheid sagen.
2. Neuer Zweig von `main`, Name steht im Auftrag (`feature/...` oder `fix/...`). **Nie direkt auf `main` arbeiten oder pushen.**
3. Bauen, was im Auftrag steht, nicht mehr. Ideen, die dir unterwegs kommen, schreibst du in deine Übergabe, du baust sie nicht.
4. Selbst prüfen (siehe unten), dann committen und den Zweig pushen.
5. Im Fahrplan: Status des Auftrags auf **„gebaut, wartet auf Prüfung“**, dazu 3 bis 5 Zeilen Übergabe (was gebaut, welche Dateien, wie geprüft, was offen ist). Mitpushen.
6. Fertig. Claude prüft den Zweig im nächsten Chat, erst danach sagt Felix „schalte live“.

**Live gehen machst du nicht.** Kein Merge nach `main`, kein `tools/bump-version.py`, keine Einträge in `js/data/patchnotes.js`, außer der Auftrag sagt ausdrücklich etwas anderes.

## Was du nie tust
- Nichts an der Datenbank (Supabase): keine SQL-Skripte aus `tools/` ausführen, keine Schema-Änderungen, keine Spielstände anderer ändern oder löschen.
- Keine Dateien in `js/build/` und kein `css/style.min.css` von Hand ändern. Die entstehen beim Live-Gang.
- Keine Zweige löschen, keine Tags, kein Force-Push.
- Keine Markennamen ins Spiel. Gespielt wird in der eigenen Welt (`config.world: 'neutral'`). Neue Namen und Titel immer mit einem Eintrag in `js/world/neutral.js` absichern.
- Keine großen Umbauten oder Neu-Designs, die nicht im Auftrag stehen.

## Wie der Code tickt (Stolperfallen)
- **Bearbeitet werden die Einzeldateien** in `js/` und `css/style.css`. `index.html` lädt die Bündel aus `js/build/`. Zum Testen also vorher bündeln: `python3 -c "import sys; sys.path.insert(0,'tools'); import bundle; bundle.build('test')"`, danach die Änderungen in `js/build/`, `css/style.min.css`, `index.html` und `tools/bundles.json` **wieder verwerfen**, bevor du committest (`git checkout -- js/build css/style.min.css index.html tools/bundles.json`). Ausnahme: Hast du ein neues Skript angelegt, bleibt dessen `<script>`-Zeile zwischen den BUNDLE-Markern in `index.html` stehen.
- **Neue Skripte** als `<script src="js/...">` zwischen die passenden BUNDLE-Marker in `index.html` schreiben, dann landen sie automatisch im Bündel.
- **CSS ist groß und geschichtet** (über 10.000 Zeilen, viele spätere Regeln überschreiben frühere). Neue Regeln **ans Ende** von `css/style.css` in einen Block mit Überschrift-Kommentar. Achtung: `#stage .opt` und `#stage > *` setzen eine Einblend-Animation mit ID-Stärke. Eigene Animationen auf Karten brauchen deshalb `#stage ...` im Selektor.
- **Bühne:** `render.js` baut den Hauptbereich `#stage` neu auf, sobald sich das HTML ändert (`ui.lastStage`). Was du per JavaScript im DOM änderst, ist beim nächsten Neuaufbau weg.
- **Knöpfe** laufen über `data-act="..."` und den großen Klick-Verteiler in `js/main.js`. Spiellogik nie in der Oberfläche nachbauen, sondern über die Engine (`js/engine/`).
- **Kampf:** `GL.battle.simulate` (`js/engine/battle.js`) rechnet, `js/ui/arena.js` spielt ab. Eingriffe der Spieler (Ulti, Fokus) gehen als `cmds` in die Rechnung ein.
- **Sprache:** Texte sind Deutsch. Englisch kommt über das Wörterbuch in `js/ui/i18n.js` (bzw. `js/data/en*.js`): neuen deutschen Text als Schlüssel mit englischer Übersetzung eintragen. Ton: locker und witzig, Cozy-Pixel-Look.
- **Ein Element, das gerade geklickt wird, ignoriert ein zweites `element.click()`** im selben Ereignis. Nachträgliches Klicken mit `setTimeout(..., 0)`.

## Selbst prüfen (gezielt, nicht hundert Durchläufe)
- `node --check` auf jede geänderte JS-Datei und auf die gebauten Bündel.
- Spiel lokal starten (`python3 -m http.server` im Repo-Ordner, dann `index.html?welt=neutral`) und genau den geänderten Bildschirm auf **Handy-Breite (390 px)** ansehen, auf Deutsch und Englisch. Konsole ohne Fehler.
- Wo Bewegung dazukommt: auch mit „weniger Bewegung“ (`prefers-reduced-motion`) prüfen.

## Commits
Kurze deutsche Commit-Nachricht, was sich ändert. Mehrere kleine Commits pro Zweig sind gut.
