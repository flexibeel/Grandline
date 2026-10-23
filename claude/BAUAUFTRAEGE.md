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

## A3: Texte-Prüfung: eigene Welt und Englisch (Punkt 7b)   Status: geprüft (Claude), wartet auf Sammel-Update

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
Prüfskript (lokal, nicht im Repo): vorher ca. 80+ verdächtige Strings (viele IDs/false positives), nach 47 neuen Einträgen in neutral.js deutlich weniger sichtbare Original-Namen. Ergänzt: 47 Namen/Orte/Früchte (Marco→Marko, Whitebeard→Weißbart, Mihawk→Falkenauge, Shanks→Rotbart, Hancock→Schlangenprinzessin, Thriller Bark→Geisterschiff, Gum-Gum-Frucht→Gummi-Frucht u. a.). Offen: viele Ultis/Abilities-Namen, kleinere Inselorte, einige Events. Fund zu GL.i18n.t: fällt auf den Originaltext zurück, wenn kein Wörterbucheintrag existiert; wenn neutral.js den Namen nicht ersetzt hat, bleibt der Markenname auch im Englischen sichtbar. node --check auf neutral.js ok.

---

## A3b: Namensvorschläge für die Beinahe-Namen (nur Vorschläge, kein Code)   Status: erledigt (Claude schrieb die Vorschläge neu, Jan wählte „Alle A“, in `neutral.js` eingetragen)

**Zweig:** `feature/texte-pruefung` (dort weiterarbeiten, letzter Commit von Claude `eaab889`, vorher `git pull`).
**Hintergrund:** A3 hat 47 Namen ergänzt, davon sind etwa 15 nur umgeschrieben und noch als Vorlage erkennbar. Claude hat `Killer`, `Dragon` (trifft Allerweltswörter) und die Dubletten `Koala`, `Vista`, `Drake` aus `neutral.js` entfernt. Jan will die Namen selbst aussuchen.
**Aufgabe:** Lege die Datei `claude/NAMENSVORSCHLAEGE.md` an. Für **jeden** dieser Einträge aus `neutral.js` **zwei klar eigene Namen** im Cozy-Ton (locker, kurz, gut aussprechbar, nicht als Vorlage erkennbar, keine Schreibvariante des Originals): Marco→Marko, Cabaji→Cabo, Mohji→Moji, Bonney→Bonny, Hawkins→Hawks, Yasopp→Jasopp, Alvida→Alva, Ivankov→Iva, Hody Jones→Hody, Ben Beckman→Ben, Lucky Roo→Lucky, Eustass Kid→Kid, Gecko Moria→Moria, Dr. Hogback→Hogback, Sabo→Sabo der Flamme, Wano→Wano-Land. Dazu fehlende Figuren, die du dabei findest, mit Vorschlag. Format je Zeile: `Original | heute | Vorschlag A | Vorschlag B | Warum (ein Satz, Typ der Figur: Name sollte zur Rolle passen)`.
**Nicht tun:** `neutral.js` oder anderen Code ändern. Nur diese eine Markdown-Datei. Jan wählt, danach trägt Claude oder du die Wahl ein.
**Abnahme:** Datei existiert, alle genannten Einträge haben zwei Vorschläge, kein Vorschlag ist eine Schreibvariante oder ein Wort der Vorlage.
**Abschluss:** Commit, `git push origin feature/texte-pruefung`, Beweis mit `git ls-remote origin feature/texte-pruefung`.

---

## A3c: Attacken-Namen eigene Welt (Ultis, Fähigkeiten, Boss-Signaturen)   Status: offen

**Zweig:** `feature/texte-pruefung` (dort weiterarbeiten, `git pull` zuerst). Regeln: `AGENTS.md`. Ausgang: A3 und A3b sind geprüft und eingetragen.
**Ziel:** Im Kampf sind keine Attacken- und Fruchtnamen aus der Vorlage mehr sichtbar. Das ist das Sichtbarste, was noch übrig ist (Ulti-Banner, Boss-Ansagen, Werte-Tafel).
**Datei:** nur `js/world/neutral.js`, im Block „Ergänzungen A3“ (neuer Unterblock „Ergänzungen A3c“ unten anhängen). Keine anderen Dateien.

### Was ersetzt wird, was nicht
- **Ersetzen:** japanische und englische Original-Attacken und Fruchtnamen, also alles, was nach Vorlage klingt. Beispiele aus der Liste unten: `Kokuto: Yoru`, `Yasakani no Magatama`, `Kamusari`, `Slave Arrow`, `Death Wink`, `Okama Kenpo`, `Nose Fancy Cannon`, `Gura-Gura-Schlag`, `Gura-Gura-Beben`, `Mato-Mato-Hagel`, `Mato-Mato-Frucht`, `Mero-Mero-Frucht`, `Sube-Sube-Frucht`, `Ton-Ton-Frucht`, `Nikyu-Nikyu`, `Toge-Toge`, `Spring-Spring`, `Baku-Baku-Kanone`, `Takoyaki-Punch`, `Gyojin-Karate`, `Yakuzame`, `Muggy Ball`, `Nuki Ashi`, `Daisenso`, `Kurouzu`, `Kamazo`, `Punk Gibson`, `Age Twister`, `Ghost Rap`, `Seimei Kikan`, `Golden Away`, `Brick Bat`, `Jugon`, `Shigure`, `Ice Time`, `Massacre Soldier`, `Negative Hollows`, `Senbonzuke`, `Radikal Beam`, `Diable Jambe`, `Thunderbolt Tempo`, `Cien Fleur: Clutch`, `Clutch`, `Santoryu: Oni Giri`, `Gum-Gum-Gatling`, `Krokobiss`, `Mr`-Attacken wie `Atlas-Klinge` nur, wenn sie nach Vorlage klingen.
- **Bleibt:** gewöhnliche deutsche Wörter (`Wolfsrudel`, `Augenschuss`, `Weißer Rauch`, `Festmahl`, `Notoperation`, `Eisenkeule` …). Im Zweifel bleiben lassen und im Bericht nennen.
- **Eine Ersetzung gilt überall** (der Schlüssel ist der ganze Originaltext). `Fadenkäfig` und `Donnergott` kommen als Ulti, Fähigkeit und Signatur vor, ein Eintrag reicht. Nie Allerweltswörter als Schlüssel nehmen (Lehre aus `Killer` und `Dragon`).

### Stil
Lockerer deutscher Attackenname, 1 bis 3 Wörter, passt zur Figur und zu ihrem neuen Namen aus `neutral.js` (Mihawk heißt jetzt Falkenauge, Whitebeard Weißbart, Sabo Silvo, Doflamingo siehe Datei). Cozy-Ton, mit Augenzwinkern erlaubt, keine Schreibvarianten des Originals, keine Wörter der Vorlage. Früchte: Muster `…-Frucht` wie die schon vorhandenen (`Gummi-Frucht`, `Sand-Frucht`).

### Ermittlung der Liste
Alles, was `GL.world.tr` heute unverändert lässt, steht in dieser Prüfung (Node-Skript lädt `ultis.js`, `abilities.js`, `enemies.js` und `neutral.js`, schickt jeden `name` und jeden `bossSigs`-Namen durch `tr`). Baue es dir nach und prüfe damit vorher und nachher.
Ultis (54 von 72 unersetzt), Fähigkeiten (86 von 107), Signaturen (13). Gesamtliste siehe unten, du siehst nur die markenhaften an:
`Gum-Gum-Gatling`, `Santoryu: Oni Giri`, `Thunderbolt Tempo`, `Diable Jambe`, `Cien Fleur: Clutch`, `Radikal Beam`, `Shigure`, `Golden Away`, `Seimei Kikan`, `Okama Kenpo`, `Nose Fancy Cannon`, `Gura-Gura-Schlag`, `Kokuto: Yoru`, `Slave Arrow`, `Kamusari`, `Yasakani no Magatama`, `Yakuzame`, `Mato-Mato-Hagel`, `Brick Bat`, `Ursus Shock`, `Kurouzu`, `Muggy Ball`, `Nuki Ashi`, `Daisenso`, `Takoyaki-Punch`, `Baku-Baku-Kanone`, `Death Wink`, `Gyojin-Karate`, `Ice Time`, `Jugon`, `Punk Gibson`, `Kamazo`, `Age Twister`, `Ghost Rap`, `Tonkatsu`, `Karate-Welle`, `Mero-Mero-Frucht`, `Sube-Sube-Frucht`, `Ton-Ton-Frucht`, `Mato-Mato-Frucht`, `Nikyu-Nikyu`, `Toge-Toge`, `Spring-Spring`, `Gura-Gura-Beben`, `Massacre Soldier`, `Negative Hollows`, `Senbonzuke`, `Krokobiss`, `Hormon-Frucht`, `Alters-Frucht`, `Magnet-Frucht`, `Drachenklaue`, `Ursus-Schock`, `Vogelkäfig`, `Lichtgeschwindigkeit`, `Schattenraub`, `Energie-Steroide`, `Wüstensarg`, `Sägezahn-Sturm`.
Höchstens **60 Einträge**. Was offen bleibt, im Bericht nennen.

### Abnahme (Claude prüft danach genau das)
1. Diff berührt nur `js/world/neutral.js` (und die Übergabe-Zeile in `claude/BAUAUFTRAEGE.md`), nichts gelöscht, bestehende Einträge unverändert.
2. `node --check js/world/neutral.js` ok, keine doppelten Schlüssel, kein Schlüssel ist ein Allerweltswort.
3. Claude lässt das Prüfskript laufen: keine markenhaften Namen in der obigen Liste mehr unersetzt, Stichproben von Texten wie den Ulti-Beschreibungen („Santoryu: Oni Giri“ steht auch in `text`).
4. Neue Namen passen zum Stil, keine Schreibvarianten des Originals.

### Abschluss von Grok
Kurz: wie viele Einträge, was bewusst bleibt, was offen ist. Dann `git push origin feature/texte-pruefung` und Beweis mit `git ls-remote origin feature/texte-pruefung`.

