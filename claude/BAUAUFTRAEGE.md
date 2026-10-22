# Bauaufträge (Claude plant, Cursor/Grok baut, Claude prüft)

Ablauf: Claude schreibt den Auftrag hierher, Grok baut ihn auf dem genannten Zweig, Jan trägt zwischen beiden. Danach prüft Claude den Diff gegen die Abnahme-Liste und schaltet auf Jans „Schalte live“ live.
Grok: Erst `CLAUDE.md` lesen, dann nur die unten genannten Dateien öffnen. Nur bauen, was im Auftrag steht.

---

## A1: Freischalt-Meldungen im Hafen und im Run (`fix/freischalt-meldungen`)

**Zweig:** `fix/freischalt-meldungen` existiert schon (dieser Auftrag liegt darauf). Dort weiterarbeiten, nicht neu von `main` abzweigen.
**Umfang:** klein, nur `js/main.js`, höchstens eine Zeile CSS. Keine neuen Texte, deshalb nichts in `neutral.js`.
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

### Abnahme (Claude prüft danach genau das)
1. Diff berührt nur `js/main.js` (und höchstens `css/style.css`), keine Texte, keine Daten, kein Supabase.
2. F1: Test mit 3 Meldungen A, B, C bei offenem Fenster: nach dem Schließen kommen sie als A, B, C.
3. F2: 20 Meldungen hintereinander, alle erscheinen irgendwann, keine doppelt.
4. F3: Im Hafen zwei Profil-Belohnungen gleichzeitig: beide erscheinen einzeln, kein Satz mit „Run-Ende“. Im Run unverändert gebündelt, Liste am Run-Ende da.
5. F4: Kurzer Toast bleibt ca. 3,4 s, langer höchstens 6 s.
6. `node --check js/main.js` läuft durch. Kein Eintrag in `patchnotes.js`, kein `bump-version.py`, kein Merge nach `main` (macht Claude beim Live-Gang).

### Abschluss von Grok
Kurz: welche Fälle bestätigt, welche nicht, welche Zeilen geändert, wie getestet. Dann `git push -u origin fix/freischalt-meldungen`.
