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

## A5: Offline-Modus mit Service Worker (Punkt 2d)   Status: offen

**Zweig:** `feature/offline-modus` (von `main`, dieser Auftrag liegt schon darauf). Dort weiterarbeiten, nicht neu abzweigen.
**Entscheidung Jan, 23.10. (per Klick):** Grok baut, Claude prüft. Umfang: offline spielbar **plus kleiner Offline-Chip**.
**Ziel:** Jan (und alle anderen) können das Spiel im Flugzeug oder Zug spielen. Wer die Seite einmal mit Netz geöffnet hat, kann sie später ohne Netz starten und eine ganze Fahrt spielen. Zurück im Netz gleicht der vorhandene Cloud-Sync (`GL.cloudSync`, `GL.online.resync`) von selbst ab. Rangliste, Konto und Duelle scheitern ohne Netz **still**, nichts blockiert.
**Regeln für dich:** `AGENTS.md`, erst `CLAUDE.md`. Keine Patchnote, kein `bump-version.py`-Lauf, kein Merge, nichts live (das Sammel-Update macht Claude).

**Dateien:**
- Neu: `sw.js` im Hauptordner (gleiche Ebene wie `index.html`, sonst reicht der Geltungsbereich nicht).
- `index.html`: ein kleines Skript zum Anmelden des Service Workers, **nach** den Spiel-Bündeln, nur wenn `'serviceWorker' in navigator` und die Seite über https oder localhost läuft. Fehler abfangen, still bleiben.
- `tools/bump-version.py`: schreibt beim Live-Gang Version und Dateiliste in `sw.js` (siehe Weg 3). **Das Skript nur erweitern, nicht ausführen.**
- Offline-Chip: `js/main.js` (Ereignisse `online`/`offline`) und ein Block „A5 OFFLINE“ am Ende von `css/style.css`. Texte direkt im Code zweisprachig wie in `deck.js`, eigene Welt prüfen.

**Weg:**
1. **`sw.js`** mit einer Zeile `const V = '__VERSION__';` und `const FILES = [/*__FILES__*/];` (Platzhalter, die `bump-version.py` füllt; im Zweig bleiben die Platzhalter stehen, `sw.js` muss trotzdem laufen: bei Platzhalter einfach nur `./` und `index.html` merken).
   - `install`: Cache `gl-` + `V` anlegen, `FILES` hineinlegen (`cache.addAll`, Fehler einzelner Dateien dürfen die Installation **nicht** abbrechen, also einzeln mit `Promise.allSettled`). `self.skipWaiting()`.
   - `activate`: alle Caches mit anderem Namen als `gl-` + `V` löschen, dann `clients.claim()`.
   - `fetch` (nur GET, nur http/https):
     - `version.json`: **immer** Netz, nie aus dem Cache (der Versions-Check in `main.js` `backToApp` verlässt sich darauf). Ohne Netz einfach durchfallen lassen (Fehler), der Check schluckt das.
     - Navigationen (`index.html`, `./`): **netz-zuerst**, bei Fehler die gemerkte `index.html`. Frische Antwort wieder im Cache ablegen.
     - Eigene Dateien mit `?v=` (Bündel, CSS) und Bilder: **cache-zuerst**, sonst Netz und merken.
     - Fremd (jsDelivr für Supabase, Google Fonts `fonts.googleapis.com` und `fonts.gstatic.com`): **stale-while-revalidate** (aus dem Cache liefern, im Hintergrund auffrischen). Schlägt beides fehl, normaler Netzfehler, **nicht** den Service Worker abstürzen lassen.
     - Alles andere (Supabase-Projekt-Adresse für Konto, Rangliste, Duelle, Realtime): **nicht anfassen**, nicht abfangen, nicht cachen (kein `respondWith`).
2. **Dateiliste (`FILES`)**: `./`, `index.html`, `css/style.min.css?v=<V>`, `js/build/core.min.js?v=<V>`, `js/build/en.min.js?v=<V>`, `js/build/tail.min.js?v=<V>`, `manifest.webmanifest`, `legal.html`, alle `img/*.png`. Die genauen `?v=`-URLs müssen **zeichengleich** zu denen in `index.html` sein (sonst trifft der Cache nicht). Die Schrift-CSS und das Supabase-Skript legt der Service Worker beim ersten Laden selbst ab (Punkt „Fremd“), nicht in `FILES`.
3. **`tools/bump-version.py`**: nach dem Bündeln `sw.js` öffnen, `__VERSION__` durch die Version ersetzen und `/*__FILES__*/` durch die Liste aus Punkt 2 (am besten aus `index.html` per Suche nach `src="js/build/…"` und `href="css/style.min.css…"` gelesen, nicht von Hand). Läuft das Skript **ohne** `sw.js` im Ordner, still überspringen. Platzhalter nur ersetzen, wenn sie noch da sind (nicht bei jedem Lauf doppelt anhängen: Vorlage `sw.js` bleibt im Zweig mit Platzhaltern, im Live-Stand stehen die echten Werte, deshalb Regex auf `const V = '...'` und die Liste zwischen Markern `/*FILES*/ … /*END*/`).
4. **Offline-Chip**: Beim Start und bei `window` `offline`/`online` prüfen (`navigator.onLine`). Offline: ein **kleiner Chip** in der Kopfzeile oder am Rand („📴 Offline“ / „Offline“, Hinweis beim Antippen als `title`: „Ohne Netz: Rangliste, Konto und Duelle pausieren, dein Stand wird lokal gespeichert“). Wieder online: Chip weg, und einmal ein leiser Toast „Wieder online, Stand wird abgeglichen“, dann übernimmt der vorhandene `resync` (nichts selbst anstoßen, `online.js` Zeile ~953 hört schon auf `online`). Nicht in der Kampf- oder Run-Hektik: Chip darf nichts verdecken, höchstens kleines Symbol am Handy (390 px).
5. **Nicht blockieren**: Prüfe, dass ohne Netz weder ein Ladebildschirm hängen bleibt noch ein Fenster aufgeht, das nicht schließt (Start, Hafen, Fahrt starten, Fahrt beenden, Speichern). Wo `GL.online` im Offline-Fall hängt oder Fehler wirft, **nur melden** in der Übergabe, nicht umbauen.

**Fallen:**
- **Alter Zwischenspeicher nach einem Update:** Die Version steckt im Cache-Namen. Ändert sich `V`, ist `sw.js` byte-verschieden, der Browser installiert den neuen, `activate` löscht die alten Caches. Nie `V` fest eintragen oder `sw.js` selbst aus dem Cache liefern: Der Browser holt `sw.js` ohnehin am Netz, aber ein Cache davor würde Updates für immer verhindern.
- **GitHub Pages:** Die Seite läuft unter einer eigenen Domain (`CNAME`), Wurzel `/`. Pfade im Service Worker trotzdem **relativ** (`./`, `index.html`), damit es auch lokal oder in einem Unterordner läuft.
- **Opaque Antworten** (fremde Dateien ohne CORS) dürfen gemerkt werden, aber nur `status` 200 oder `type === 'opaque'` eintragen, keine Fehlerseiten.
- **iPhone/Safari:** Eine App vom Home-Bildschirm hat einen **eigenen** Speicher getrennt von Safari. Das ist Sache der Spieler, steht aber in der Übergabe als Hinweis für die Patchnote.
- `index.html` lädt die Bündel mit `document.write` für Englisch (`en.min.js`). Auch diese Datei muss in `FILES` stehen.
- Service Worker laufen nicht über `file://`. Zum Testen: `python3 -m http.server` im Ordner, dann `http://localhost:8000`.

**Fertig, wenn (Claude prüft genau das):**
1. Diff berührt nur `sw.js` (neu), `index.html` (ein Anmelde-Skript), `tools/bump-version.py`, `js/main.js`, `css/style.css`, `claude/…`. Keine Texte in Daten, kein Supabase-Code, keine Dateien in `js/build/`.
2. Test per lokalem Server und Headless-Browser (oder Chrome): Seite einmal online laden, Service Worker aktiv, Cache enthält alle Dateien aus `FILES`. Dann **Netz aus** (Headless: `context.set_offline(True)` bzw. DevTools „Offline“), Seite neu laden: Spiel lädt, Hafen sichtbar, eine Fahrt lässt sich starten, Konsole ohne neue Fehler außer erwarteten Netzfehlern der Online-Funktionen.
3. Offline-Chip erscheint beim Wechsel auf offline, verschwindet beim Wechsel auf online, Toast kommt einmal. DE und EN, 390 px, Hell und Dunkel, nichts verdeckt.
4. Versionssprung simuliert: `V` ändern, neu laden, alter Cache ist weg, neuer da. `version.json` kommt immer frisch (im Offline-Test: Fehler, Spiel läuft trotzdem).
5. `node --check sw.js` und `node --check js/main.js` laufen durch. `python3 -c "import ast;ast.parse(open('tools/bump-version.py').read())"` läuft durch. `bump-version.py` selbst **nicht** im Zweig ausführen, aber trocken prüfen: eine **Kopie** des Ordners in `/tmp`, dort ausführen, `sw.js` hat danach Version und Liste, `index.html`-URLs und `FILES` stimmen zeichengleich.
6. `sw.js` im Zweig bleibt eine funktionierende Vorlage (Platzhalter), Test aus 2 lief mit den echten Werten aus der Kopie.

**Nicht anfassen:** Supabase/Online-Code (`js/ui/online.js`, nur lesen), Spielstand-Format (`save.js`), Kampf, Daten, `patchnotes.js`, `js/build/`, `css/style.min.css`, Zweige löschen.

**Übergabe von Cursor:** _(hier eintragen: was gebaut, welche Zeilen, wie getestet, Funde, offene Hänger ohne Netz)_
Danach `git push -u origin feature/offline-modus`.
