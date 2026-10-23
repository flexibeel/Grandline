# Bauaufträge (Claude plant, Cursor/Grok baut, Claude prüft)

Ablauf: Claude schreibt den Auftrag hierher, Grok baut ihn auf dem genannten Zweig, Jan trägt zwischen beiden. Danach prüft Claude den Diff gegen die Abnahme-Liste und schaltet auf Jans „Schalte live“ live.
Grok: Erst `CLAUDE.md` lesen, dann nur die unten genannten Dateien öffnen. Nur bauen, was im Auftrag steht.

---

## A1: Freischalt-Meldungen im Hafen und im Run (`fix/freischalt-meldungen`)

**Zweig:** `fix/freischalt-meldungen` existiert schon (dieser Auftrag liegt darauf). Dort weiterarbeiten, nicht neu von `main` abzweigen.
**Umfang:** klein, nur `js/main.js`, höchstens eine Zeile CSS. Regeln für dich: `AGENTS.md`. Keine neuen Texte, deshalb nichts in `neutral.js`.
**Stand der Fälle:** aus dem Code gelesen (Stand `main` = 22r), nicht im Spiel nachgespielt. Erst jeden Fall kurz bestätigen (Code oder Headless-Test), dann fixen. Stimmt ein Fall nicht, im Abschluss schreiben, nicht umbauen.
**Darstellung:** bleibt der kleine Toast wie bisher (Jan, 22.10.). Keine neuen Fenster.

### Fälle

**F1: Reihenfolge dreht sich.**
`toastNow` (ca. Zeile 473 in `js/main.js`) holt Meldungen mit `toastQ.shift()` von vorn. Ist dann gerade ein Fenster (`#fpop`) offen oder schon der Platz belegt, geht die Meldung per `toastQ.push(html)` wieder ans Ende. Die Warteschlange rotiert, spätere Meldungen überholen frühere.
Fix: Eine Meldung, die wegen Fenster oder belegtem Platz warten muss, wird wieder vorne eingereiht (`unshift`), wenn sie aus der Warteschlange kam. Neue Meldungen bleiben hinten (`push`). Am einfachsten: `toastNow(html, fromQueue)` mit Flag.

**F2: Meldungen gehen still verloren.**
Beide Stellen mit `if (toastQ.length < 12)` werfen alles weg, was darüber hinausgeht. Am Run-Ende kommen gerne mehr (Profil-Teile, Kapitel, Sammelbuch, Figur).
Fix: Limit auf 30 anheben. Gleiche Meldung (gleicher HTML-Text) nicht doppelt einreihen.

**F3: „Liste gibt es am Run-Ende“ stimmt im Hafen nicht.**
`flushRewards` zeigt bei mehreren Belohnungen „🎁 +N Profil-Belohnungen, die Liste gibt es am Run-Ende“. Gespeichert wird die Liste aber nur `if (run)`. Im Hafen (ohne Run, z. B. nach Sammelbuch oder Kosmetik-Freischaltung) steht der Satz da, und die Liste existiert nirgends.
Fix: Ohne Run die gebündelten Meldungen nicht zusammenfassen, sondern einzeln nacheinander zeigen (sie laufen dann durch die Warteschlange, F1/F2 sorgen für Ordnung). Im Run bleibt alles wie bisher.

**F4: Zu kurz zum Lesen.**
Jeder Toast steht fest 3,4 s (`setTimeout(... 3400)`). Die wichtigste Meldung „Freigeschaltet: Figur“ hat zwei Zeilen Text.
Fix: Dauer nach Textlänge: 3,4 s plus 40 ms je Zeichen des sichtbaren Textes (`t.textContent.length`), höchstens 6 s. Entfernen-Zeitpunkt (heute 3900) entsprechend 500 ms später.

**F5: Mehrere gleichzeitig im Hafen (Jans Fall, 23.10.).**
Im Hafen (ohne Run) dürfen heute bis zu 2 Toasts gleichzeitig stehen (`inRun() ? 1 : 2` in `toastNow`), und sie können zusätzlich zu Hafen-Fenstern wie Story, Gruß oder Neuigkeiten erscheinen. Jan: „mehrere gleichzeitig“.
Fix: Überall höchstens **1** Toast gleichzeitig (`inRun() ? 1 : 2` wird zu `1`). Die Fenster-Reihenfolge in `featureCheck()` bleibt unangetastet. Zusätzlich prüfen: Läuft gerade ein Story- oder Gruß-Fenster (`GL.story.active()`, `GL.greet.active()`, Element `#story`), wartet der Toast wie bei `#fpop` in der Warteschlange. Dafür die Prüfung in `toastNow` und `waitPop` um diese Bedingung erweitern.

### Abnahme (Claude prüft danach genau das)
1. Diff berührt nur `js/main.js` (und höchstens `css/style.css`), keine Texte, keine Daten, kein Supabase.
2. F1: Test mit 3 Meldungen A, B, C bei offenem Fenster: nach dem Schließen kommen sie als A, B, C.
3. F2: 20 Meldungen hintereinander, alle erscheinen irgendwann, keine doppelt.
4. F3: Im Hafen zwei Profil-Belohnungen gleichzeitig: beide erscheinen einzeln, kein Satz mit „Run-Ende“. Im Run unverändert gebündelt, Liste am Run-Ende da.
5. F5: Im Hafen nie zwei Toasts gleichzeitig, und kein Toast über Story- oder Gruß-Fenster. Er kommt danach.
6. F4: Kurzer Toast bleibt ca. 3,4 s, langer höchstens 6 s.
7. `node --check js/main.js` läuft durch. Kein Eintrag in `patchnotes.js`, kein `bump-version.py`, kein Merge nach `main` (macht Claude beim Live-Gang).

### Abschluss von Grok
Kurz: welche Fälle bestätigt, welche nicht, welche Zeilen geändert, wie getestet. Dann `git push -u origin fix/freischalt-meldungen`.

---

## A3: Texte-Prüfung: eigene Welt und Englisch (Punkt 7b)   Status: offen

**Zweig:** `feature/texte-pruefung` (von `main`, existiert schon mit diesem Auftrag, dort weiterarbeiten). Regeln: `AGENTS.md`.
**Ziel:** Im Spiel ist **kein Original-Name aus der Vorlage** sichtbar (Figuren, Attacken, Orte, Früchte, Schiffe, Titel), weder auf Deutsch noch auf Englisch, und im Englischen steht möglichst **kein deutscher Text** auf den Hauptbildschirmen. Entscheidung Jan, 23.10. Vorbereitung für die Veröffentlichung (`config.world: 'neutral'`).
**Dateien:** `js/world/neutral.js` (Ersetzungsliste, hier kommen fehlende Einträge hin), `js/ui/i18n.js` und `js/data/en*.js` (Englisch). Zu prüfende Daten: `js/data/*.js`, besonders `crew.js`, `ultis.js`, `abilities.js`, `enemies.js` (auch `bossSigs`), `islands.js`, `fruits.js`, `shipparts.js`, `story.js`, `events*.js`, `cosmetics.js`, `badges.js`.

### Weg
1. **Prüfskript** (Node, liegt **nicht** im Repo): lädt die Daten und `neutral.js`, schickt jeden sichtbaren Namen und Text (Felder `name`, `text`, `t`, `desc`, `title`, Listen `[de, en]`) durch `GL.world.tr` und listet alles, was danach noch wie ein Original-Name aussieht. Du kennst die Vorlage, nutze dein Wissen für die Suche. Vorher und nachher zählen.
2. **Eigene Welt:** Fehlende Namen in `neutral.js` ergänzen, im bestehenden Muster (Original → neuer Name, Deutsch und Englisch, falls das Muster beides hat). Neue Namen passen zum lockeren Cozy-Ton und klingen nicht selbst wie ein Markenname.
3. **Englisch:** Mit `index.html?welt=neutral` auf Englisch die Bildschirme Titel, Hafen, Kontor, Inselwahl, Deck, Kampf, Run-Ende auf Handy-Breite (390 px) ansehen. Deutsche Reste auflisten und, wo ein Wörterbucheintrag fehlt, die englische Übersetzung nachtragen (Muster der vorhandenen Einträge, Ton locker und witzig). Aus dem Fund unter 22q: `GL.i18n.t` holt im Englischen teils Original-Namen zurück. Findest du die Ursache, **nur melden**, nicht umbauen.
4. Höchstens **60 Einträge** pro Durchgang, im Bericht auflisten, was noch offen ist.

### Fallen
Nur Texte und Namen ändern, **keine Logik**, keine IDs (`id:`-Werte, Datenschlüssel) umbenennen (bricht Spielstände und Replays). Bestehende Einträge nicht ändern, nur ergänzen. Dateien bleiben gültiges JS (`node --check`). Platzhalter wie `{n}` unverändert lassen.

### Abnahme (Claude prüft danach genau das)
1. Diff berührt nur `js/world/neutral.js`, `js/ui/i18n.js`, `js/data/en*.js` (und `claude/FAHRPLAN.md` für die Übergabe), keine IDs geändert, nichts gelöscht.
2. Prüfskript meldet keine Original-Namen mehr oder nennt eine Rest-Liste mit Grund. Stichproben von Claude im Browser auf 390 px.
3. In Englisch auf den genannten Bildschirmen höchstens vereinzelt deutsche Reste, aufgelistet.
4. `node --check` auf `neutral.js`, `i18n.js` und jede geänderte `en*.js`. Konsole ohne Fehler. Kein Spielverhalten geändert.
5. Kein Patchnote, kein `bump-version.py`, kein Merge nach `main`.

### Abschluss von Grok
Kurz: vorher/nachher-Zahlen, wie viele Einträge ergänzt, was offen bleibt, Fund zu `GL.i18n.t`. Dann `git push -u origin feature/texte-pruefung`.
