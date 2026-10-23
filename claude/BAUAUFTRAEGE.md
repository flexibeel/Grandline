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

## A3: Steckbrief-Zeile „Ansage“ in der Inselwahl (2c-2)   Status: gebaut, wartet auf Prüfung

**Zweig:** `feature/steckbrief-ansage` existiert schon (dieser Auftrag liegt darauf). Dort weiterarbeiten, nicht neu abzweigen. Der Zweig baut auf `feature/kampf-unterbrechen` (2c-1) auf, nicht auf `main`: Nur dort gibt es `GL.config.sig.breakPct`, und nur dort stimmt der Satz „Unterbrechen“ mit dem Spiel überein.
**Ziel:** Wer auf der Inselwahl-Karte eines Bösewichts oder Meeres-Bosses die Details aufklappt, sieht vor dem Kampf: Dieser Gegner hat eine **Ansage** (Signatur-Angriff), so heißt sie, das macht sie, und so unterbricht man sie: **Fokus auf ihn und mindestens 15 % Schaden, bevor sie losgeht.**
**Umfang:** klein, reine Anzeige. Regeln für dich: `AGENTS.md`. Erst `CLAUDE.md` lesen, dann nur die unten genannten Stellen öffnen.

**Dateien und Stellen** (Zeilen gelten für diesen Zweig, grob):
- `js/ui/render.js`, Phase `case 'course'` (ab ca. Zeile 1968). Die Karte wird **hier** gebaut, nicht in `js/ui/inselwahl.js` (das ist nur das Wisch- und Antipp-Verhalten, dort nichts ändern). Im Karten-Template steht in `<span class="isl-more-in co-body">` (ca. Zeile 2004 bis 2013) am Ende `${crackHint(foe).html}`. Die neue Zeile kommt **direkt dahinter**, also nur im aufgeklappten Teil, nicht auf die Vorderseite.
- Neue Hilfsfunktion `sigHint(foe)` direkt unter `crackHint` (ca. Zeile 1647), gleiche Bauart.
- Daten: `GL.data.bossSigs[foe.id]` (`js/data/enemies.js`, ab Zeile 173) mit `name`, `en`, `t`, `tEn`. Es gibt 14 Einträge (smoker, arlong, crocodile, enel, rob-lucci, kaku, hody, vander, moria, kuma, kizaru, doflamingo, teach, shanks). Alle anderen Gegner haben **keine** Ansage.
- Prozentzahl: `Math.round(GL.config.sig.breakPct * 100)` (derzeit 15). **Nie fest als 15 schreiben**, damit die Anzeige mit der Stellschraube mitgeht.
- `css/style.css`: ein kleiner Block am Ende der Datei „A3 ANSAGE“. Vorbild für die Optik ist `.crack` (ca. Zeile 7418, in der Inselwahl `.co2 .crack`, ca. Zeile 7777): gleiche Größe und Rundung, aber eigene Farbe, damit man Ansage und „So knackst du ihn“ auseinanderhält.

**Weg:**
1. `sigHint(foe)`: Gibt es `bossSigs[foe.id]` nicht, liefert die Funktion `''` (dann **keine** Zeile und **keine** Lücke). Sonst ein `<span class="sig-hint">` mit drei Teilen: Kopf „✦ Ansage: <Name>“, der Kurztext der Signatur, und der Satz zum Unterbrechen.
2. Sprache wie in `intentText` in `js/ui/arena.js` (ca. Zeile 70): `const en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en'`, dann `S.en`/`S.tEn` bzw. `S.name`/`S.t`. Namen und Texte mit `esc(...)` ausgeben.
3. Texte (so oder sehr nah dran, Ton locker):
   - Kopf DE: `✦ Ansage: ${S.name}` · EN: `✦ Signature move: ${S.en}`
   - Unterbrechen DE: `Unterbrechen: Fokus auf ihn und mindestens ${p} % Schaden, bevor sie losgeht.` · EN: `Interrupt: focus him and deal at least ${p} % damage before it goes off.`
4. In das Karten-Template einhängen, CSS-Block anlegen, fertig. Das Wort „Fokus“ heißt im Spiel schon so (Kampf-Befehl), nichts Neues erfinden.

**Fallen:**
- `feature/fahrtbrief` (A2) ändert dieselbe Phase `course` in `render.js`. Halte den Eingriff dort **winzig** (eine Zeile im Template plus die neue Funktion an anderer Stelle), damit das spätere Zusammenführen ohne Konflikt klappt.
- Nicht über Booleans wie `ch === 1` einschränken: Bösewichte (Insel 1) und Meeres-Bosse (Insel 2) können beide eine Ansage haben, entscheidend ist nur, ob `bossSigs[foe.id]` existiert.
- Eigene Welt: Die Signatur-Namen laufen schon durch `js/world/neutral.js`, aber **prüfen**, nicht annehmen (z. B. „Rokuogan“, „Königshaki“, „Vogelkäfig“ dürfen nirgends sichtbar bleiben). Skript: für alle 14 Einträge Name, `en`, `t`, `tEn` durch die Ersetzungsliste schicken und Treffer melden. Fehlt etwas, Eintrag in `neutral.js` ergänzen.
- Hell- und Dunkel-Theme beide ansehen (Farben nur über die vorhandenen CSS-Variablen oder mit eigener Dunkel-Regel, wie bei `.crack`).
- Handy 390 px: Text bricht um, kein seitliches Scrollen, die Karte klappt weiter sauber auf und zu (Höhe der aufgeklappten Karte ändert sich nur um die neue Zeile).

**Fertig, wenn:**
1. Karte eines Gegners **mit** Ansage (einer der 14 Einträge, Beispiel in einem Testlauf per Skript suchen: welche Insel hat einen davon als Bösewicht oder Boss): Details aufklappen zeigt die Ansage-Zeile mit Name, Kurztext und Unterbrech-Satz, in Deutsch und Englisch.
2. Karte eines Gegners **ohne** Ansage: unverändert, keine leere Zeile.
3. Die Prozentzahl im Satz stimmt mit `GL.config.sig.breakPct` überein (Test: Wert kurz auf 0,2 setzen, Anzeige zeigt 20, danach zurück auf 0,15).
4. Mit `?welt=neutral` kein Markenname in der Zeile, für alle 14 Signaturen per Skript geprüft.
5. 390 px, Hell und Dunkel, DE und EN, kein Überlauf, Konsole ohne neue Fehler.
6. `node --check js/ui/render.js` läuft durch.

**Nicht anfassen:** Kampfsystem (`js/engine/battle.js`), Kampfanzeige (`js/ui/arena.js`, `js/main.js`), `js/data/config.js`, `js/data/enemies.js` (Daten nur lesen), `js/ui/inselwahl.js`, die Kartenvorderseite. Kein Eintrag in `patchnotes.js`, kein `bump-version.py`, kein Merge nach `main`, nichts live (Jan sammelt für ein größeres Update, Claude schaltet beim Live-Gang).

**Übergabe von Cursor:** Steckbrief-Zeile „Ansage“ gebaut. Neue Funktion sigHint(foe) in render.js (nach crackHint), eingehängt nur in der Inselwahl-Karte (isl-more-in, nach crackHint). Zeigt Name, Kurztext und Unterbrechen-Satz mit dynamischem breakPct. CSS-Block „A3 ANSAGE“ am Ende von style.css. node --check ok. Offen: voller Browser-Test auf 390 px DE/EN/neutral durch Claude.
Danach `git push -u origin feature/steckbrief-ansage`.
