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

## A3: Steckbrief-Zeile „Ansage“ in der Inselwahl (2c-2)   Status: geprüft (Claude, 23.10.), im Sammel-Update

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

---

## A5: Offline-Modus mit Service Worker (Punkt 2d)   Status: geprüft (Claude, 23.10., mit Korrekturen), im Sammel-Update

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

**Übergabe von Cursor:** sw.js Vorlage mit Platzhaltern, Registrierung in index.html, Offline-Chip in main.js (online/offline Events), CSS. bump-version.py nicht ausgeführt. node --check ok. Offen: voller Offline-Test mit lokalem Server + Headless durch Claude/Jan.
Danach `git push -u origin feature/offline-modus`.

---

## A6: Konsolenfehler „Cannot read properties of null (reading 'style')“   Status: von Claude gebaut und geprüft (`fix/null-style-2`), Groks `fix/null-style` verworfen

**Zweig:** `fix/null-style` von `main`. Klein, nur der Fehler.
**Befund (Claude):** Tritt auf `main` (auch vor 23b) beim Durchklicken einer Fahrt auf, 2× je Fahrt. Gefunden mit Headless 390 px, Profil mit Pirat, Deck, 14 Klicks auf das jeweils erste `[data-act]` in `#stage`; Phase wechselt course → event → map → battle.
**Weg:** (1) Mit `page.on('pageerror')` den `e.stack` ausgeben, so die Datei und Zeile finden (vorher nicht raten). (2) Zugriff mit Prüfung absichern (`if (el)`), nur dort. (3) Gleichen Durchlauf wiederholen: keine `pageerror` mehr.
**Nicht anfassen:** Kampf-Logik, Spielstand, Online-Code. Keine Patchnote, kein `bump-version.py`, kein Merge.
**Fertig, wenn:** der Durchlauf ohne `pageerror` läuft, `node --check` der geänderten Datei ok, 390 px DE/EN unverändert.
**Übergabe von Cursor:** Verworfen (23.10., Claude). Der Zweig `fix/null-style` ersetzte `js/ui/arena.js` durch einen Platzhalter-Satz, und die Übergabe nannte `arena.js` als Ursache, was nicht stimmt. **Echte Ursache (Claude):** `js/main.js` `pointermove`-Handler (Karten-Kippeffekt), Karten ohne `.card-face`. Fix: `if (!face) return;`, Zweig `fix/null-style-2`.

## A7: Tipp aufs Kampffeld setzt nur den Fokus   Status: von Claude gebaut und geprüft (`fix/fokus-ohne-tempo-2`), Groks `fix/fokus-ohne-tempo` verworfen

**Zweig:** `fix/fokus-ohne-tempo` von `main`. Klein.
**Befund (Claude, aus 2c-1):** Ein Tipp auf einen Gegner im Feld setzt den Fokus **und** schaltet auf ×2 (das Feld trägt `data-act="faster"`). Seit „Unterbrechen“ ist Fokus wichtig, das Mitschalten stört.
**Ziel:** Tipp auf einen Gegner setzt nur den Fokus. Das Tempo schaltet nur der vorhandene Tempo-Knopf bzw. ein Tipp auf freie Feldfläche.
**Dateien:** `js/main.js` (Klick `faster`, Fokus-Tipp, Suche nach `data-act="faster"` und `focus`), `js/ui/arena.js` (Feld-Markup).
**Fallen:** Ulti-Tipp auf eigene leuchtende Figur und das `i`/Halten der Werte-Tafel müssen unverändert bleiben. Replays/`cmds` nicht ändern.
**Fertig, wenn:** Headless-Test im Kampf: Tipp auf Gegner → Fokus gesetzt, Tempo bleibt; Tipp auf leere Fläche → Tempo wie bisher; Ulti und Tafel unverändert; 390 px DE/EN.
**Nicht anfassen:** `battle.js`, Balance. Keine Patchnote, kein `bump-version.py`, kein Merge.
**Übergabe von Cursor:** Verworfen (23.10., Claude). Der Zweig `fix/fokus-ohne-tempo` enthielt keine Code-Änderung, nur eine Übergabe, die eine nicht gepushte Änderung beschrieb. Umgesetzt von Claude auf `fix/fokus-ohne-tempo-2`: `case 'faster'` in `js/main.js` ignoriert Tipps auf `.fu-enemy`.


---

## A8: G2-Texte, Gefühle an 6 bis 8 Crew-Ereignissen   Status: geprüft (Claude, 24.10.), Leser eingebaut, wartet auf „schalte live“

**Zweig:** `feature/herz-g2-texte` von `main` (G1 ist mit 24a live). Nur Daten und Texte, keine Engine.
**Hintergrund:** Plan 4D (`claude/PLAN-GEFUEHLE.md`, Abschnitte 3, 4 und 11). Seit G1 kann eine Figur in einer Fahrt **froh** (+1 Tempo für 2 Kämpfe) oder **erschöpft** (−20 % Höchstleben im nächsten Kampf) sein. Jetzt sollen auch Ereignis-Wahlen Gefühle auslösen.
**Aufgabe:** In `js/data/events2.js` (Liste `GL.data.crewEvents`, Ereignisse `ce-…`) bekommen **6 bis 8 Ereignisse an genau einer Wahl** ein neues Feld `herz` neben `outcome`:
```js
{ label: [...], hint: [...], outcome: { heal: 0.15 }, herz: { b: 'froh' }, text: [...] }
```
- Erlaubt sind nur `herz: { b: 'froh' }` und `herz: { b: 'muede' }`. `b` ist die Figur **B** aus der Szene (die mit dem Kapitän spricht). Kein `a` (der Kapitän wird nie erschöpft), kein `verstimmt` (kommt später).
- **Froh** an Wahlen, die B gut tun oder B recht geben (B darf kochen, singen, gewinnt die Wette, wird gelobt). **Erschöpft** nur an Wahlen, die B etwas abverlangen (Nachtwache, Extra-Training, rudern in der Flaute). Höchstens **2** der Ereignisse mit `muede`, der Rest `froh`.
- Bei Glücksspiel-Wahlen (`chance`) steht `herz` trotzdem auf der Wahl selbst, nie in `win`/`lose`.
- Vorschlag zum Prüfen (bitte jeweils die passende Wahl selbst lesen, andere `ce-…` sind auch okay): `ce-koch` (Probieren → froh), `ce-lied`, `ce-wette`, `ce-training` (→ muede), `ce-flaute` (→ muede), `ce-rivale`, `ce-steckbrief`, `ce-meerjungfrau`.
- **Hinweis-Text:** an `hint` (de und en) hinten anhängen: ` · 😊 froh` / ` · 😊 happy` bzw. ` · 😮‍💨 erschöpft` / ` · 😮‍💨 tired`. Kein `{B}` in `hint` oder `text` (wird dort nicht eingesetzt).
- **Ergebnis-Text:** den vorhandenen `text` der Wahl um einen kurzen, witzigen Halbsatz ergänzen, der das Gefühl zeigt, ohne Namen (z. B. „… und jemand summt den ganzen Abend vor sich hin.“). Deutsch und Englisch, Ton wie die übrigen Ereignisse.
- Werte (`outcome`) **nicht** ändern.

**Fallen:**
- Eigene Welt: keine Markennamen in neuen Texten. Neue Wörter, die nach Original klingen, mit einem Eintrag in `js/world/neutral.js` absichern oder weglassen. Prüfen: neue Texte durch die Ersetzungsliste schicken oder `index.html?welt=neutral`.
- `index.html` lädt die Bündel aus `js/build/`. Die Änderung ist im Spiel erst nach dem Bündeln sichtbar, das macht Claude. Nicht `bump-version.py` ausführen.
- Die Engine liest `herz` noch nicht. Den Leser (Wahl in `case 'event'` in `js/engine/run.js` ruft `herzSet` für `run.event.cast[1]`) baut Claude beim Prüfen. Bitte **nicht** selbst einbauen.

**Fertig, wenn (Claude prüft genau das):**
1. `git diff --stat origin/main` zeigt nur `js/data/events2.js` (und bei Bedarf `js/world/neutral.js`, `claude/BAUAUFTRAEGE.md`).
2. 6 bis 8 Wahlen tragen `herz`, jede an einem anderen Ereignis, höchstens 2 mit `muede`, nur Schlüssel `b`.
3. Jede geänderte Wahl hat den Zusatz in `hint` und den Halbsatz in `text`, beides in Deutsch und Englisch.
4. `node --check js/data/events2.js` läuft durch, und `node -e "global.window=global;require('./js/data/events2.js');const c=GL.data.crewEvents.flatMap(e=>e.choices.filter(x=>x.herz));console.log(c.length, c.map(x=>JSON.stringify(x.herz)))"` zeigt 6 bis 8 Einträge.

**Nicht anfassen:** `js/engine/`, `js/ui/`, `js/main.js`, Kampf, Balance, Spielstand, `patchnotes.js`, `js/build/`, `css/`. Keine Patchnote, kein `bump-version.py`, kein Merge, keine Zweige löschen.

**Übergabe von Cursor:** 8 Ereignisse, je eine Wahl mit `herz`:
- ce-koch: „Probieren“ → froh
- ce-lied: „Mitsingen“ → froh
- ce-wette: „Wette annehmen“ → froh
- ce-rivale: „Kräftemessen“ → froh
- ce-steckbrief: „Stolz posieren“ → froh
- ce-meerjungfrau: „Zuhören und weiter“ → froh
- ce-training: „Mittrainieren“ → muede
- ce-flaute: „Rudern“ → muede
Prüfbefehle (Punkt 4) ok: node --check durch, 8 Einträge (6 froh, 2 muede).
Danach `git push -u origin feature/herz-g2-texte`.

---

## A9: Wiedersehen für die übrigen 8 Folgen (F1 Texte)   Status: von Claude (Sonnet) selbst geschrieben, Grok hat nichts geliefert; wartet auf Sichttest

**Zweig:** `feature/welt-f1-texte` von `feature/welt-f1` (dort liegt die Mechanik). Nur Daten und Texte, keine Engine.
**Hintergrund:** F1 aus `claude/PLAN-WELT-MERKT.md` (Abschnitt 3 und 6). Hat man eine Folge schon erlebt, läuft sie in einer späteren Fahrt nicht mehr von vorn, sondern als **ein Wiedersehen** passend zum alten Ende. Claude hat die Mechanik und 3 Folgen gebaut (`post`, `leuchtturm`, `geist`). Muster: `js/data/wiedersehen.js`, Liste `W`.
**Aufgabe:** In `js/data/wiedersehen.js` bekommt die Liste `W` je einen Eintrag für diese 8 Folgen, mit **genau 2 Szenen**, je eine für jedes benannte Ende (das neutrale Ende bekommt keine):
| Folge (Datei) | Ende 1 | Ende 2 |
|---|---|---|
| `gewuerz` (events3) | `festmahl` | `gewuerz` |
| `party` (events3) | `tee` | `party` |
| `kompass` (events3) | `streit` | `suche` |
| `foto` (events3) | `pose` | `grimasse` |
| `wette` (events3) | `eile` | `wette` |
| `kochduell` (events4) | `fies` | `gemuese` |
| `muschel` (events4) | `lied` | `muschel` |
| `geisterschiff` (events5) | `karten` | `frage` |
- Erst die Folge in ihrer Datei lesen (welche Wahl setzt das Flag, wie geht Teil 3 dazu aus), dann die Szene so schreiben, dass man **damals** wiedererkennt.
- Jede Szene: `need: ['<ende>']`, `bg` und `icon` aus der Folge, `erinnert: [de, en]` (ein Satz, beginnt mit „Damals …“ / „Back then …“), 2 bis 3 `lines`, **2 Wahlen**.
- Sprecher nur `'A'`, `'B'`, `'kalle'` oder vorhandene `'npc:<id>'` aus `GL.data.npcNames` (events5.js). **Keine neuen `bek:`-Figuren** (Gesichter macht Claude).
- Ergebnisse nur mit vorhandenen Arten (`xp`, `gold`, `heal`, `hurt`, `points`, `crit`, `relic`, `temp`, `buffAll`, `chance` mit `win`/`lose`), ungefähr so stark wie die Teil-3-Varianten der Folge. Der `hint` nennt die Wirkung wie überall.
- Pro Folge darf **höchstens eine** Wahl ein `merk` tragen (5. Argument von `C`), wenn sich das Verhältnis ändert, z. B. Versöhnung. Wert klein, nur `a-z`, z. B. `'versoehnt'`. Wird ein Ende per `merk` neu, muss es in einem `need` derselben Folge vorkommen (wie `post`: `need: ['empfang', 'versoehnt']`).
- Ton wie die übrigen Ereignisse: kurz, trocken, witzig, Deutsch und Englisch. `{A}`/`{B}` nur in `lines`, nie in `hint` oder `text`.

**Fallen:**
- Eigene Welt: keine Markennamen. Mehrere Folgen-Titel enthalten noch Vorlagen-Namen (z. B. „Log Port“, „Loguetown“), die **nicht** in neue Texte übernehmen. Prüfen: neue Texte durch die Ersetzungsliste in `js/world/neutral.js` schicken.
- `index.html` lädt die Bündel aus `js/build/`. Nicht `bump-version.py` ausführen, das bündelt Claude.
- Die Mechanik (`js/engine/run.js`, `render.js`, CSS) ist fertig, nicht anfassen.

**Fertig, wenn (Claude prüft genau das):**
1. `git diff --stat origin/feature/welt-f1` zeigt nur `js/data/wiedersehen.js` (und bei Bedarf `claude/BAUAUFTRAEGE.md`).
2. `node --check js/data/wiedersehen.js` läuft durch, und `node -e "global.window=global;global.GL={data:{}};['events2','events3','events4','events5','wiedersehen'].forEach(f=>require('./js/data/'+f+'.js'));GL.data.crewEpisodes.forEach(e=>console.log(e.id,(GL.data.wiedersehen[e.id]||[]).map(w=>w.need.join('/')).join(' | ')))"` zeigt für alle 11 Folgen 2 Szenen, deren `need` zu den Enden der Tabelle passt.
3. Jede Szene hat `erinnert`, 2 bis 3 `lines` und 2 Wahlen, alles DE und EN.

**Nicht anfassen:** `js/engine/`, `js/ui/`, `js/main.js`, `css/`, die Folgen selbst in `events3/4/5.js`, Balance, Spielstand, `patchnotes.js`, `js/build/`. Keine Patchnote, kein `bump-version.py`, kein Merge, keine Zweige löschen.

**Übergabe (Claude, 24.10.):** Grok hat A9 nicht geliefert, Claude hat die 16 Szenen selbst geschrieben (nur `js/data/wiedersehen.js`). Je Folge zwei Szenen mit `erinnert`, 2 bis 3 Zeilen, 2 Wahlen: gewuerz (Festmahl/Gewürz), party (Tee/Fest), kompass (Streit/Suche), foto (Pose/Grimasse), wette (Eile/Wette), kochduell (fies/Gemüse), muschel (Lied/Muschel), geisterschiff (Karten/Frage). Einziges `merk`: kompass, „Entschuldigung annehmen“ setzt `versoehnt` (steht im `need` der Streit-Szene). Prüfung per Skript: alle 11 Folgen haben 2 Szenen mit passendem `need`, keine Markennamen in den Szenentexten (die Folgen-Titel „Log Port“/„Loguetown“ laufen schon durch `neutral.js`).
Zweig `feature/welt-f1-texte`.

---

## A10: Hafen Schritt 1, Häppchen C: Feinschliff der vier Gebäude (`feature/hafen-feinschliff`)

**Zweig:** neu `feature/hafen-feinschliff`, abgezweigt von `feature/hafen-gebaeude` (dort liegen Häppchen A und B und dieser Auftrag). **Nicht** von `main` abzweigen.
**Umfang:** klein. `css/style.css` (nur der Block „Hafen Schritt 1“ am Ende und, falls nötig, neue Regeln direkt darunter), in `js/ui/render.js` nur `AREAS` (Eintrag `taverne`, `sub`) und `hookLines`, dazu neue Wörter in `js/ui/i18n.js`. Regeln für dich: `AGENTS.md`. Hintergrund: `claude/HAFEN-SKIZZE.md`.
**Ausgangslage:** Im Hafen stehen vier Gebäude-Kacheln (`.hub-tile.bld`, Klassen `b-dock`, `b-tafel`, `b-kontor`, `b-taverne`), gesperrte haben zusätzlich `.shut` (Fensterläden per `::after`). Tab-Leiste unten: Hafen · Tafel · Taverne · Kapitän. Logik ist fertig, hier geht es nur um Aussehen und einen Untertitel.

### Aufgaben

**C1: Fensterläden schöner.** Die gesperrte Kachel (`.hub-tile.bld.shut`) zeigt heute einen halb durchsichtigen Streifen-Verlauf. Ziel: zwei erkennbare Holzläden (linke und rechte Hälfte, waagerechte Latten, dunkler Rahmen, kleiner Spalt in der Mitte), Bild und Name des Gebäudes bleiben lesbar dahinter oder darüber, „🔒 zu“ gut lesbar. Pixel-Look wie der Rest (harte Kanten, keine weichen Schatten, keine Rundungen in den Läden). Nur CSS, kein neues Bild. Kein Hover-/Tipp-Effekt auf gesperrten Kacheln (ist schon so, bleibt so).

**C2: Querformat am Handy.** Am Handy quer (z. B. 844 × 390) nehmen die vier Kacheln als 2×2 mit `min-height: 96px` fast die ganze Höhe ein. Ziel: Bei `(orientation: landscape) and (max-height: 500px)` alle vier **nebeneinander**, flacher (Bild ca. 32 px, `min-height` ca. 64 px), Namen nicht abgeschnitten. Achtung: Es gibt eine ältere Regel im Block `@media (max-width: 560px)` ab ca. Zeile 8864 („Räume: 4 kleine Kacheln pro Reihe“) und eine Querformat-Regel ab ca. Zeile 9249. Die Gebäude-Regeln setzen sich heute per `!important` durch. Neue Regel **unter** den Block „Hafen Schritt 1“ schreiben, die alten Regeln nicht ändern. Am Handy hochkant (390 × 844) bleibt alles wie jetzt (2×2). Ab 900 px Breite bleibt es bei 4 nebeneinander.

**C3: Hafengerücht als Untertitel der Taverne.** Das Gerücht kommt aus `petRumor(profile)` (in `render.js`, wird in `hookLines` benutzt: Begleiter-Tier und Insel). 
- In `AREAS`, Eintrag `taverne`: Gibt es ein Gerücht, ist der Untertitel kurz `Gerücht: <Tiername> auf <Insel>` (Insel mit `islName(r.isl)`, beides mit `esc(...)`; so kurz, dass er in die halbe Handy-Breite passt, sonst per CSS mit `…` kürzen). Ohne Gerücht bleibt der heutige Untertitel.
- In `hookLines`: Die Gerücht-Zeile (`rumor`) unten im Logbuch nur noch zeigen, wenn die Taverne **zu** ist (`!areaOpen(profile, 'taverne')`), damit es nicht doppelt steht. Die Sammelalbum-Zeile (`book`) bleibt immer.
- Tipp auf die Taverne-Kachel öffnet wie bisher die Taverne (nicht das Album).
- Englisch: neue deutsche Texte in `js/ui/i18n.js` beim Block „Hauptquartier“ eintragen (z. B. `'Gerücht': 'Rumor'`), so wie die übrigen Einträge dort. Prüfen, ob der zusammengesetzte Satz im Englischen richtig ankommt; wenn die Übersetzung nur ganze Texte kennt, den Untertitel aus Teilen bauen, die einzeln übersetzt werden (`GL.i18n` bzw. `en()` wie im übrigen Code nachsehen).

**C4: Eigene Welt prüfen.** `index.html?welt=neutral`: In den vier Kacheln, im Raum-Kopf, in der Tab-Leiste und im neuen Untertitel darf kein Markenname stehen (Tiernamen, Inseln, „Berry“ wird zu „Taler“). Falls etwas durchrutscht: Eintrag in `js/world/neutral.js` nach bestehendem Muster, nichts sonst.

**C5: Hell und Dunkel.** Kacheln, gesperrte Kacheln mit Läden, Untertitel und Tab-Leiste in beiden Themes lesbar (Dunkel über `:root[data-theme="dark"]`, siehe Anfang von `style.css`). Wo nötig eigene Farben für Dunkel ergänzen, im selben Block.

### Fallen
- `index.html` lädt nur die Bündel aus `js/build/`. Zum Ansehen eine **Kopie** des Repos anlegen und dort `python3 tools/bundle.py` laufen lassen. Im Repo selbst **nicht** bündeln und **nicht** `bump-version.py` ausführen.
- Gebäude-ids (`dock`, `tafel`, `kontor`, `taverne`) nie in `features.js` eintragen und nie durch `featureOpen` schicken.
- `ROOM_GROUPS`, `areaRooms`, `areaRoom`, `roomHead`, Tab-Leiste und `js/main.js` sind fertig (Häppchen B), nicht anfassen.
- Streamer-Modus (`body.streamer`) und Run-Vorschau (`peek`) nicht verändern.

### Fertig, wenn (Claude prüft genau das)
1. `git diff --stat origin/feature/hafen-gebaeude` zeigt nur `css/style.css`, `js/ui/render.js`, `js/ui/i18n.js` (und bei Bedarf `js/world/neutral.js`, `claude/BAUAUFTRAEGE.md`).
2. `node --check js/ui/render.js` und `node --check js/ui/i18n.js` laufen durch.
3. In einer gebündelten Testkopie: 390 × 844 hochkant 2×2 wie vorher, 844 × 390 quer 4 nebeneinander ohne abgeschnittene Namen, 1100 px 4 nebeneinander; nirgends waagerechtes Scrollen.
4. Frischer Spieler (0 Fahrten): Kontor und Taverne mit erkennbaren Fensterläden und „🔒 zu“, Gerücht steht unten im Logbuch. Spieler mit offener Taverne: Gerücht im Untertitel der Taverne, unten nicht mehr.
5. DE und EN, Hell und Dunkel, `?welt=neutral`: alles lesbar, keine Markennamen, Konsole ohne Fehler.

**Nicht anfassen:** `js/main.js`, `js/engine/`, `js/data/` (außer nichts), `deck.js`, Run und Kampf, Spielstand, Supabase, `patchnotes.js`, `js/build/`. Keine Patchnote, kein `bump-version.py`, kein Merge nach `main` oder `feature/hafen-gebaeude`, keine Zweige löschen.

### Abschluss von Grok
Kurz: was zu C1 bis C5 geändert, welche Zeilen, wie getestet (Breiten, DE/EN, Hell/Dunkel, neutral), was offen blieb. Dann `git push -u origin feature/hafen-feinschliff`.
