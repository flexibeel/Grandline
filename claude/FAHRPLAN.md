# Fahrplan: Stand, Warteschlange, Übergabe

**Jeder neue Chat liest zuerst diese Datei** (und `CLAUDE.md`), nicht den ganzen Code.
**Am Ende jedes Chats** wird sie aktualisiert und mitgepusht: Was ist fertig, was liegt auf welchem Zweig, was kommt als Nächstes.
Felix und Jan arbeiten mit verschiedenen Claude-Accounts. Diese Datei ist das gemeinsame Gedächtnis, deshalb gehört hier alles rein, was der nächste Chat wissen muss.

Stand: 23.10.2026 (23a live: ruhigere Meldungen; Grok ist an GitHub angebunden, A1 von ihm gebaut)

## Wer macht was
- **Felix:** entscheidet, was gebaut wird und was live geht („schalte live“), Kunst und Look.
- **Jan:** _(bitte ergänzen)_
- **Claude:** setzt um, immer auf eigenem Zweig, pflegt diese Datei. Plant und prüft die Arbeit von Cursor (siehe unten).
- **Cursor (Grok), ab Jans Einrichtung:** baut klar umrissene Aufträge aus „Bauaufträge für Cursor“ auf eigenem Zweig, Regeln in `AGENTS.md`. Geht nie selbst live.

## Grundsatz-Entscheidung (21.10.)
- **Weitergebaut wird das 2D-Pixel-Spiel** (`index.html`, `js/`). Das 3D-System „Neue Welt“ (`neu/`) ist seit 22f entfernt und archiviert (`archiv/neue-welt`), `/neu/` leitet nur noch aufs Spiel um.
- **Gespielt und gebaut wird in der eigenen (neutralen) Welt**, damit das Spiel veröffentlicht werden kann (`config.world: 'neutral'`, Namen in `js/world/neutral.js`). Neue Namen, Titel und Texte immer mit einem Eintrag in `neutral.js` absichern. Prüfen: `index.html?welt=neutral`, oder alle neuen Texte per Skript durch die Ersetzungsliste schicken. Keine Markennamen im Spiel sichtbar lassen.
- Alte Zweige, die `neu/...` ändern, sind 3D-Arbeit und werden **nicht** weitergeführt. Ideen daraus werden bei Bedarf im 2D-Spiel neu gebaut.

## Live
- `main` = **23a „Ruhigere Meldungen“** (`fix/freischalt-meldungen`, Punkt 2b, von Grok gebaut, von Claude geprüft: Toasts einzeln und in Reihenfolge, warten auf Story/Gruß/Fenster, Dauer nach Textlänge). Davor 22s **„Die Inselwahl als Wisch-Karten“** (thegreatline.de, `feature/inselwahl-bilder`, Spielgefühl Teil 1). Davor 22r **„Neustart für alle“**: jedes Gerät außer NoNas löscht einmal Spielstand und Anmeldung, Infoscreen (`keep` = `0e7333bc`). Davor 22q „Durchblick im Kampf“: Kampf-Durchblick Teil A, Werte-Tafel im Kampf (i oder Halten, Werte mit Herkunft, Zustände, Ulti, Zusammenspiel, was noch fehlt, der Kampf wartet). Davor 22p „Deine Form, dein Bonus“: Figurenreise Teil 2, Wahl-Boni (bei jeder Form 1 von 2 Boni: Leben, Angriff oder Tempo, im Dojo jederzeit kostenlos umstellbar). Davor 22o „Neue Looks für die Strohhüte“: die 12 Form-Looks der übrigen 6 Strohhüte (nur Optik). Davor 22n „Die Taverne am Hafen“: Crew-Start Teil 2, im Deck-Start genau eine Taverne pro Insel-Karte, bleibt bei voller Crew stehen. Davor 22m „Das Deck“ (Crew vor dem Ablegen auf dem Schiff aufstellen, Kampfwert-Budget 45 plus Rang, keine Crew-Bremse mehr) und 22l „Die Figurenreise“ (Stil-Dojo im Kontor, Erinnerungsstücke, Story-Formen für die Strohhüte). Seit 22.10. außerdem die Fahrplan-Notizen (`feature/fahrplan-notizen`: Wahl-Boni abgestimmt, Kampf-Durchblick, Neustart-Idee, nur Fahrplan), der Kampf-Durchblick-Vorschlag (`feature/kampf-durchblick-vorschlag`: erst Werte-Tafel, dann größeres Feld mit Fahrtband, nur Fahrplan) und in `CLAUDE.md`: Modellwahl (Sonnet/Opus) und Entscheidungen als Klick-Fragen (nur Arbeitsregeln, Spiel unverändert). Davor 22k Schiffs-Upgrades sichtbar, 22j Endlos-Tiefe, 22i Kontor Teil 1, 22h Kampf-Update.

## Wartet auf „schalte live“
_(nichts)_
  - Dateien: `js/ui/render.js` (Phase `course`), neu `js/ui/inselwahl.js` (Verhalten: Mitte erkennen, Antippen, Szene, steht im `tail`-Bündel-Marker, landet beim Bündeln automatisch in `tools/bundles.json`), `css/style.css` (Block „22s“ am Ende), `i18n.js` (1 Text). Gewählt wird weiter über `data-act="pick"`, Spiellogik unverändert. Taste 1–9 wählt sofort (mit Szene). „Weniger Bewegung“ am Gerät: keine Animationen, keine Szene.
  - Geprüft per Headless-Browser 390 px, Deutsch und Englisch: Einflug, Wischen ändert Knopf und Punkte, Antippen klappt auf, Szene läuft und Run geht weiter, Taste 2, „weniger Bewegung“. Bündel per `node --check` in einer Testkopie gebaut (im Zweig ist `js/build/` unverändert, das macht `bump-version.py` beim Live-Gang).
  - Offen/klein: In der Kopfzeile wird der Ort am Handy bei vielen Chips gekürzt („Ostmeer · Ku…“), die Überschrift darunter nennt Meer und Insel aber ohnehin.

**Offen für Felix (von Hand, Supabase-SQL-Editor):** `tools/neustart-2026-10-22.sql` **Teil 2** (löscht alle Konten, die vor Teil 1 angelegt wurden, außer NoNa, nicht rückgängig) **sofort nach dem Live-Gang**, am nächsten Tag **Teil 3** (Nachlauf Rangliste). Teil 1 ist gelaufen, `keep_id` = `0e7333bc`.

Neustart für alle (22r, Punkt 1c) ist live (`feature/neustart`), Jan am 22.10. per Klick: Felix hat zugestimmt, **alles inkl. Logins** löschen, **ohne Sicherung**, nur das **neueste Konto von NoNa** bleibt, **sofort**. Rückmeldungen (Pinnwand) bleiben.
  - Spiel: `js/ui/save.js` (IIFE `neustart`, läuft vor allem anderen): einmal pro Gerät (Marke `grandline.neustart` = `n1`) alle Schlüssel `grandline.*`, `gl.*` und `sb-*` (Anmeldung) löschen, Einstellungen (Theme, Sprache, Ton, Musik, Streamer, Welt, Story-Auto) bleiben. Gerät mit `grandline.uid`, das mit `keep` beginnt, bleibt heil. Mit `keep: ''` ist alles aus. Infoscreen `GL.season.restartPop` (`season.js`), gezeigt in `main.js`, nur wer vorher einen Spielstand hatte. Rangliste trägt `ns: 'n1'` (`online.js`), daran erkennt Teil 3 alte Reste. Stellschraube: `GL.config.neustart` in `config.js`.
  - Gebündelt per `bump-version.py`, Bündel per `node --check` geprüft, `keep` steckt im Bündel.
  - Nicht rückgängig zu machen, keine Sicherung. Wer vorher den Spielercode nicht hatte, ist weg. Das ist so gewollt.

Kampf-Durchblick Teil A, die Werte-Tafel (22q) ist live (`feature/kampf-durchblick-tafel`) (Punkt 1b, Felix' Okay über Jan, 22.10.). Im Kampf hat jede Figur (Crew und Gegner) ein kleines **i** neben dem Namen, außerdem öffnet **Halten** (450 ms) auf Karte oder Figur im Feld die Tafel. Antippen bleibt Ulti bzw. Fokusziel. **Solange die Tafel offen ist, wartet der Kampf**, danach läuft er weiter.
  - Inhalt Crew: Leben (aktuell), Angriff, Tempo je mit Herkunft als Chips (Grundwert, Hafen, **Story-Form**, **Wahl-Bonus**, Meisterschaft, Synergien, Ausrüstung, Rest „Level, Training & Würfelglück“), dazu Krit/Krit-Schaden/Rüstung/Schutz/Ausweichen/Schaden falls vorhanden, Zustände mit Erklärung, Fähigkeit, Ulti mit Ladung („Bereit! Antippen zum Zünden“), **Zusammenspiel** (aktive Stil-/Rollen-/Banden-Stufen, Duos, Stil-Kombos, Team-Fähigkeit) und **Fehlt noch** (nächste Stufe, fehlender Duo-Partner, Kombo-Gegenstück, Team-Fähigkeit), höchstens 4 Zeilen. Gegner: Leben/Angriff/Tempo, Zustände, Fähigkeit, Ulti, „Plant“-Symbole.
  - Dateien: `js/ui/arena.js` (i-Knopf in `fighter()`, `GL.arena.card`, Hilfen `together`, `liveBits`), `js/main.js` (`unitCard`, Halten in `holdCard`, Pause über `anim.hold` in `stepAnim`, Klick `unit-card`, i zündet keine Ulti), `js/ui/stats.js` (`baseLines` zeigt Form/Wahl-Bonus/Meisterschaft getrennt, wirkt auch im Steckbrief), `js/engine/forms.js` (`boost` schreibt nur zur Anzeige `m.fsrc` = Anteil Form/Wahl-Bonus, ändert keine Werte, Replays unberührt), CSS-Block „KAMPF-DURCHBLICK“ am Ende von `style.css`.
  - Eigene Welt: Duo-/Kombo-/Team-Texte sind in den Daten nicht ersetzt, die Tafel schickt sie vor und nach dem Übersetzen durch `GL.world.tr`. Fund dabei: Im Englischen holt `GL.i18n.t` sonst Original-Namen zurück. Duo-Texte bleiben im Englischen deshalb deutsch (sicher, aber nicht schön). Prüfen, ob das an anderen Stellen im Spiel genauso passiert.
  - Geprüft per Headless-Browser auf Handy-Breite (390 px), Deutsch und Englisch: Halten öffnet ohne Fokusziel, Kampf steht und läuft danach weiter, i ohne Ulti, ein ✕, keine Markennamen in der Tafel. Werte bekommen erst Story-Form/Wahl-Bonus angezeigt, wenn die Figur im neuen Stand angeheuert wurde (laufende Runs zeigen sie unter „Level, Training & Würfelglück“).
  - Gebündelt per `bump-version.py`, Bündel per `node --check` geprüft.

Figurenreise Teil 2, Wahl-Boni (22p) ist live (`feature/figurenreise-boni`, Punkt 1a). Bei jeder erreichten Form wählt man 1 von 2 Boni: ❤ +5 % Leben, ⚔ +5 % Angriff oder 💨 +1 Tempo, obendrauf zu den festen +10 %. Gebündelt per `bump-version.py`, Bündel per `node --check` geprüft.
  - `js/data/forms.js`: `formConf.boni` (hp 0.05, atk 0.05, spd 1) und je Form `boni: [..2..]`, passend zur Figur (z. B. Gear Second Angriff/Tempo, Chopper Leben/Tempo bzw. Leben/Angriff, Brook Tempo).
  - `js/engine/forms.js`: `profile.forms.pick = { id: ['hp', 'atk'] }`, Funktionen `boniOf`, `picks`, `choose`, `open`, `openAll`, `startBoni`. `boost` rechnet die Boni mit ein (Angriff mindestens +1 je Angriffs-Bonus).
  - Run: neues Feld `run.start.fboni = { id: 'ha' }` (h/a/s je Form, `-` offen), Übergabe in `main.js` (`sail`), geprüft in `run.js`. Alte Replays ohne das Feld laufen ohne Boni, also Replay-sicher. Tagesfahrt/Wettfahrt wie bisher ohne Formen.
  - `js/ui/dojo.js` + `main.js` (Klick `fr-pick`): Auf jeder Figurenkarte im Kontor eine Zeile je Form mit 2 Knöpfen, gewählter leuchtet, offene Wahl blinkt grün („Bonus wählen“). Im Aufstiegs-Moment direkt die Wahl, oder „Später wählen“. Umstellen jederzeit kostenlos. CSS-Block „Wahl-Boni“ hinter `.fr-upbtn`.
  - Geprüft: Engine per Node (falsche Wahl abgelehnt, Umstellen, Werte mit/ohne Boni, Tempo), Karten und Aufstiegsfenster per Headless-Browser auf Handy-Breite, neutrale Namen greifen.
  - Im Kampf sichtbar über die Werte-Tafel (1b Teil A, `feature/kampf-durchblick-tafel`).

Figurenreise Teil 2, Schritt 1 (22o) ist live (`feature/figurenreise-looks`): **Looks der übrigen 6 Strohhüte** (Lysop, Sanji, Chopper, Robin, Franky, Brook, je 2 Formen). Nur Optik, keine Werte geändert. Gebündelt per `bump-version.py`, Bündel per `node --check` geprüft, alle Form-Accessoires sind in `FORM_ACC` vorhanden (max. 4 pro Form).
  - `js/ui/sprites.js`: 24 neue Form-Accessoires in `FORM_ACC` (langnase, gurt, maske, umhang, straehne, hemd, zigarette, feuerbein, kreuz, arzttasche, geweih, fell, haarband, buch, extraarme, blueten, sonnenbrille, metallarm, brustplatte, werkzeug, augenhoehlen, rippen, geige, noten), neue Farbbuchstaben M (Metall), L (hell), A (Bernstein), I (Blütenrosa), Hilfsfunktion `rowOf`. Pro Form höchstens 4 Accessoires (`safeLook`).
  - `js/data/forms.js`: die `look`-Einträge der 12 Formen, Sogeking mit grünem Hemd, Monster Point mit dunklerer Haut.
  - `js/world/neutral.js`: neue Einträge für Schwarzbein/Black Leg, Seelenkönig/Soul King, Monster-Punkt, Drum, Yohoho. Alle Form-Texte der 9 Strohhüte einmal durch die Ersetzungsliste geschickt, nichts Markenhaftes mehr drin.
  - Vorschau-Skript liegt nicht im Repo (lief lokal): `GL.sprites.render` je Form in ein SVG-Blatt, dann mit cairosvg zu PNG.

Crew-Start Teil 2 (22n) ist live (`feature/crew-taverne`): **Taverne genau einmal pro Insel-Karte** (nur Deck-Runs, Tagesfahrt/Wettfahrt/alte Starts unverändert).
  - `nodeTypes` (`js/engine/run.js`): bei `run.deck` keine Taverne mehr im Zufallstopf, auch die Insel-Eigenheit „Taverne“ (`bias: ['recruit']`) entfällt. Markttag und Marktfest (Twist, „mehr Tavernen“) legen weiter welche drauf.
  - `genChart`: setzt nach Raid und Offener See genau eine feste Taverne in Reihe 1 bis 3 (ersetzt Kampf, Frucht oder Rast, nie den einzigen Kampf der allerersten Reihe). Hat die Karte durch Markttag/Marktfest schon eine, bleibt es dabei.
  - `genOptions`: Beim Deck-Start wird die Taverne bei voller Crew **nicht** mehr zum Kampf. Das war der wichtigste Fund: Mit dem Deck ist die Crew meist schon voll, die Taverne fiel vorher fast immer weg. Tauschen, Entlassen und Zusammenlegen gehen auch ohne freien Platz.
  - `tools/balance.html`: spielt jetzt den Deck-Start (Auswahl Deck/Klassisch, Haken „Taverne gezielt ansteuern“), kennt Kurswahl und Ereignisse und zeigt Taverne-Besuche und Käufe. Vorher blieb es an der Kurswahl hängen.
  - **Balance-Messung** (3000 Runs, gleiche Seeds, einfacher Bot, Untergrenze): gezielter Bot gewinnt vorher 62,1 %, nachher 65,7 %, Taverne besucht 1,9 → 3,7 pro Run, Zusammenlegen 0,23 → 0,52. Blinder Zufallsbot vorher 54,5 %, nachher 47,8 % (trifft die einzelne Taverne nur selten). Echte Spieler liegen dazwischen, also kein Wert angefasst. Etwas härter: East Blue (gezielt 1,4 → 3,6 % Ausfälle). Zum Nachjustieren bei Bedarf: `config.deck.foeComp`, `config.shop.startGold`.

Crew-Start „Das Deck“ (22m) ist live (`feature/crew-deck`, Gesamtplan-Tafel „Crew-Start: das Deck“). Ersetzt die Maat-Wahl: bis zu 6 Figuren auf dem Schiff, eigener Pirat gratis und immer Kapitän, Budget 45 (+1 je 2 Piratenränge, höchstens 60), Gegner im ersten Meer passend zur Crew-Größe, letzte Aufstellung in `profile.lastDeck`.
  - Dateien: `js/ui/deck.js` (neu, Bildschirm + Klicks), `GL.run.kw/deckBudget/deckPool` und Aktion `{ type: 'deck', ids }` in `js/engine/run.js`, Stellschrauben in `config.deck` (Budget, Kampfwert-Spanne, feste Werte, `foeComp`), CSS-Block „CREW-START“ am Ende von `style.css`.
  - Kampfwert ist für alle Nicht-Strohhüte aus Leben/Angriff/Tempo berechnet (2 bis 11). Ausreißer zum Nachjustieren in `config.deck.kwFix`: Rob Lucci 3, Law 4, Tashigi 2, Chopper wäre 2 (fest auf 7 gesetzt).
  - Tagesfahrt und Wettfahrt bleiben beim alten Start (kein eigener Pirat bzw. fester Kapitän).

Figurenreise Teil 1 (22l) ist live. Dateien: `js/data/forms.js`, `js/engine/forms.js`, `js/ui/dojo.js`, Accessoires `FORM_ACC` in `sprites.js`, neutrale Namen in `js/world/neutral.js`. Look-Details bisher nur für Ruffy, Zorro, Nami, die anderen 6 haben Titel und Werte.

## Bauaufträge für Cursor
Claude schreibt hier Aufträge, Cursor (Grok) baut sie, Claude prüft den Zweig im nächsten Chat, dann „schalte live“ durch Felix. Regeln für Cursor: `AGENTS.md`.
Gut für Cursor: Inhalte nach bestehendem Muster, Texte und Übersetzungen, kleine Fixes, klar umrissene Punkte. Bei Claude bleiben: Vorschläge und Skizzen, Kampfsystem-Umbauten, Spielstände/Supabase, Prüfen vor dem Live-Gang.

Vorlage (Claude füllt aus):
```
### A<Nr>: <Titel>   Status: offen | gebaut, wartet auf Prüfung | geprüft | live
Zweig: feature/... oder fix/...
Ziel: <1 bis 2 Sätze, was der Spieler danach erlebt>
Dateien: <welche Dateien, wo ungefähr>
Weg: <Schritte>
Fallen: <was man leicht kaputt macht>
Fertig, wenn: <prüfbare Punkte, inkl. Handy-Breite DE/EN>
Nicht anfassen: <was ausdrücklich nicht dazugehört>
Übergabe von Cursor: <3 bis 5 Zeilen>
```

### A1: Pop-ups und Freischalt-Meldungen sauber hintereinander (Punkt 2b)   Status: offen
Ausgangszweig: `feature/inselwahl-bilder` (dort liegen `AGENTS.md` und dieser Auftrag, ist noch nicht auf `main`). Neuer Zweig: `fix/freischalt-meldungen`.
Ziel: Wer in den Hafen kommt, sieht Meldungen (Neu freigeschaltet, Story-Kapitel, Neuigkeiten, Willkommen, Gruß der Crew, Rang-Aufstieg, Toasts) **einzeln, in sinnvoller Reihenfolge, je einmal** und ohne dass etwas hängen bleibt oder sich überdeckt. Seit dem Neustart (22r) sind alle wieder frische Spieler, da kommt viel auf einmal.
Erst fragen: **Jan sitzt neben dir.** Lass dir zuerst 1 bis 3 konkrete Fälle beschreiben, was falsch läuft (doppelt? falsche Reihenfolge? Fenster bleibt hängen? zu viel auf einmal?). Die gehen vor.
Dateien: `js/main.js` `featureCheck()` (ab Zeile ~176, die Warteschlange der Hafen-Pop-ups) und wo es aufgerufen wird; `js/engine/meta.js` `featuresNew()`/`featureSeen()` (~Zeile 373); `js/ui/render.js` Pop-up `fpop` (Suche nach `fpop-kicker`, ~Zeile 4745); Toasts per Suche nach `function toast`.
Weg: (1) Jans Fälle nachstellen: frischer Spieler (Speicher leeren, Pirat anlegen, 1 bis 2 Fahrten) und ein Spieler mit Fortschritt. (2) Notieren, welche Meldungen in welcher Reihenfolge kommen. (3) Nur die Ursachen der beschriebenen Fehler beheben (z. B. fehlendes `seen`-Merken, zwei Wege zeigen dasselbe, Prüfung auf offenes Fenster fehlt).
Fallen: `featureCheck()` hat viele Bedingungen, die sich gegenseitig ausschließen sollen (`old`, `ui.storyPending`, `GL.story.active()`, `GL.greet.active()`). Nicht umbauen, nur gezielt ergänzen. `profile` wird gespeichert: neue Felder nur, wenn nötig, mit Standardwert für alte Stände. Nichts an Freischalt-Regeln oder Balance ändern.
Fertig, wenn: Jans Fälle treten nicht mehr auf; frischer Spieler sieht beim ersten Hafenbesuch höchstens ein Fenster gleichzeitig; nach Neuladen kommt nichts doppelt; DE und EN auf 390 px geprüft; Konsole ohne Fehler.
Nicht anfassen: Story-Inhalte, Neuigkeiten-Texte, Supabase/Online-Code, Kampf.
Übergabe von Cursor: _(hier eintragen)_

## Gesamtplan gegen Spiel (Abgleich 22.10.)
Bauplan ist die Design-Fläche **„Grand Line: Gesamtplan“** (claude.ai/artifact/1dispKg6D9ikrHzthLXdN4, 22 Tafeln, mit Jans Dungeons). Stand im Code:
- **Gebaut:** Ultis per Klick (0, +30, ×1,6), Heiler unter 50 %, Fokus/Verteidigen, Frost/Schock/Blind + 4 Reaktionen, Kontor Teil 1 (Bernstein, Entladen, Wertsachen, Raritäten, eigene Vitrine), Endless-Gegner-Zusätze, Schiffs-Upgrades sichtbar. Inseln bis Sabaody, 65 Figuren, 3 Kampfstile.
- **Schon da, aber anders als im Plan (darauf aufbauen, nicht doppeln):** Meisterschaft je Figur (`engine/mastery.js`, ≈ Figurenreise), Piratenrang + Heat-Kopfgeld (≈ Spieler-Kopfgeld), Crew-Ausrüstung 3 Plätze (`crewgear`), Landgänge + Seekarte (≈ Dungeons), Raid-Jagd mit Vitrine, Duos, Stil-Kombos, Team-Fähigkeiten, Skilltree.
- **Fehlt noch:** ~~Erinnerungsstücke/Story-Formen/Stil-Dojos~~ (Teil 1 auf `feature/figurenreise`), 6er-Crew mit Kampfwert-Budget + Story-Drops (Plan-Schritt 4), Erinnerungsstücke/Story-Formen/Stil-Dojos, Trainingsrollen (Ulti-Stufen), Kopfgeld-Stufen als Freischalt-Faden, Endless aus Biomen + Wetter + wachsende Inseln + Woche, Saphir/Rubin + Raid-Minispiele, Kombüse/Vorräte, Handelsfahrten, Wanderhändler, 5 Kampfstile, 6 Seltenheiten + Taverne + Marken, Waffen an Figuren, Ulti-Team-Kombos, Schiffe aus 4 Teilen mit Bonus, Logbuch, Boss-Steckbrief, Figuren bis Marineford.

## Dateikarte
Die Ordnerliste in `README.md` (Abschnitt „Ordner“) ist die Karte, wo was liegt. Erst dort nachsehen, dann gezielt öffnen. Pixel-Regeln für Kunst: Tag `archiv/gamedesigner` bzw. Zweig `feature/gamedesigner` (`.claude/agents/gamedesigner.md`).

## Offene Zweige und Aufräumen (Felix' Okay vom 22.10. liegt vor)
Claude-Sitzungen dürfen keine Zweige löschen und keine Tags pushen (Proxy sperrt das). Deshalb einmal von Hand, am PC im Repo-Ordner (Git Bash/Terminal):

```
git fetch origin
# 1) Offene Arbeit als Archiv-Markierung sichern (nichts geht verloren)
for b in feature/fahrender-kampf-entwurf feature/gamedesigner feature/kaperfahrt feature/konter-tippen feature/sichtbarkeit feature/uebergabe feature/upgrades-am-schiff fix/seekampf-pc; do git tag "archiv/${b#*/}" "origin/$b"; done
git push origin --tags
# 2) Löschen: die 8 gesicherten + 38 Zweige, die schon komplett in main stecken
git push origin --delete feature/fahrender-kampf-entwurf feature/gamedesigner feature/kaperfahrt feature/konter-tippen feature/sichtbarkeit feature/uebergabe feature/upgrades-am-schiff fix/seekampf-pc
git push origin --delete feature/beta-rangliste feature/dungeon-suche feature/eigene-welt feature/endless-tiefe feature/erste-minuten feature/fahrplan feature/fernkampf-crew feature/gegner-werte feature/hp-planken feature/inhalt feature/kampf-look feature/kampf-update feature/kampfbuehne feature/kampftiefe feature/klar-schiff feature/konten-sync feature/kontor feature/ladescreen feature/neue-welt feature/neue-welt-2 feature/neue-welt-hilfe feature/offene-see feature/pirat-sichern feature/seekampf-spannung feature/spielmacher-szene feature/startnachricht feature/stats feature/ultis-per-klick feature/upgrades-seekampf feature/werft feature/werft-nahansicht fix/buendeln fix/fadennetz-tippen fix/iphone-schrift-tempo fix/ohne-3d fix/rangliste-cloud fix/ruhige-see release/22j
```
Ohne Terminal: Auf GitHub unter „Branches“ die 38 Zweige aus Schritt 2 per Mülleimer löschen (die sind sicher in `main`), die 8 offenen einfach stehen lassen.

Danach bleiben: `main`, `archiv/neue-welt` (3D-Archiv), `feature/piratin` (steht noch auf der Wunschliste) und offene Arbeitszweige.
Wiederherstellen eines Archivs: `git push origin archiv/<name>:refs/heads/feature/<name>`.

## Warteschlange (Felix wählt die Reihenfolge)
Felix (22.10.): Jetzt Inhalt aus dem Gesamtplan ins Spiel. Kampfstile Variante A (5 Stile) ist abgesegnet.
1. Figurenreise Teil 2, Rest: Wahl-Boni (Felix/Jan 22.10.: bei jeder Form 1 von 2 Boni zur Wahl, im Dojo-Bildschirm), eigene Fähigkeit pro Form, Nebenfiguren. Looks der 6 Strohhüte sind live (22o)
1a. ✓ live als 22p (siehe oben). **Wahl-Boni, abgestimmt (Jan, 22.10., per Klick):** je Form 2 Werte-Boni aus Leben/Angriff/Tempo, passend zur Figur. Obendrauf zum festen +10 % (etwa +5 % bzw. +1 Tempo). Gewählt beim Aufstieg im Dojo, schon aufgestiegene Figuren wählen nachträglich, jederzeit kostenlos umstellbar. Betrifft `forms.js` (Daten + Engine), `dojo.js`, `run.js` (Übergabe über `run.start.forms`), `neutral.js`. Zweig `feature/figurenreise-boni`, Opus empfohlen (mehrere Dateien + Spielstand-Feld). Noch nichts gebaut.
1b. **Kampf-Durchblick (Jan, 22.10.), Teil A ✓ live als 22q, Teil B (Kampffeld) ans Ende der Warteschlange gestellt (Punkt 8):** Im Kampf ist unklar, welche Werte eine Figur gerade hat, was skaliert und was miteinander harmoniert (Stil-Kombos, Duos, Team-Fähigkeiten). Vorschlag zuerst, z. B. Werte-Tafel beim Antippen einer Figur. Auch als Tafel im Gesamtplan-Artefakt festhalten (liegt in Felix' Account, von hier evtl. nicht schreibbar). Hängt mit den Wahl-Boni zusammen: ohne sichtbare Werte lässt sich die Wahl schwer beurteilen. **Dazu (Jan, 22.10., per Sprache diktiert, „Fight“ vermutlich gemeint):** Den Kampfbildschirm mit den Figuren größer machen und mehr darin zeigen, Jan findet ihn schick und will darauf aufbauen. Grafisch besser einordnen, auch passend zur Seefahrt (Schiff schippert, findet einen Schatz). Erst Vorschlag mit Skizze, dann Okay von Felix. Wenn „Screen vom File“ etwas anderes meint, bei Jan nachfragen.
   **Vorschlag mit Skizze, von Jan per Klick abgestimmt (22.10., 9. Chat), Felix' Okay liegt vor (10. Chat). Teil A gebaut auf `feature/kampf-durchblick-tafel` (siehe „Wartet“), Teil B noch nicht:**
   - **Reihenfolge:** erst **A: Werte-Tafel**, danach **B: größeres Kampffeld mit Fahrtband**. Jan meint mit „Screen vom File“ den Kampfbildschirm.
   - **A: Tafel** pro Figur: Name/Stil, Leben/Angriff/Tempo mit Herkunft der Aufschläge (Form +10 %, Wahl-Bonus, Ausrüstung, Meisterschaft), Zustände, Ulti-Ladung, aktive Duos/Stil-Kombos/Team-Fähigkeiten und was noch fehlt. **Auslöser: Halten oder kleines ⓘ an der Figur**, denn Antippen zündet die Ulti (leuchtende Figur) und ein Tipp aufs Feld schaltet das Tempo (`data-act="faster"`).
   - **B: Feld** heute fest 300 px (`.field`), Figuren 64×75 px (`fieldUnit`, `arena.js`). Geplant: ~60 % der Höhe, Figuren ~1,5× größer, Kämpfer-Karten schrumpfen zur Leiste, schmales Fahrtband oben (Schiff schippert, Insel/Schatz am Horizont).
   - Betrifft `js/ui/arena.js`, `render.js`, `css/style.css`; Bauen mit Opus. Neue Texte in `neutral.js`. Die Tafel im Gesamtplan-Artefakt (Felix' Account) von hier evtl. nicht schreibbar.
1c. ✓ live als 22r, **Neustart für alte Spieler (Jan, 22.10., Idee), `feature/neustart`, SQL Teil 2 und 3 liegen bei Felix (siehe „Wartet“):** Wer schon gespielt hat, spürt das neue Spielerlebnis kaum. Jans Wahl: alle Konten zurücksetzen, alle melden sich neu an, dazu ein kleiner Infoscreen. Ergänzend gedacht: Tester-Belohnung für die erste Woche (z. B. Gründer-Zeichen). Sanftere Alternativen: Tester-Zeichen ohne Reset oder freiwilliger Neustart mit gesichertem Altstand. **Wichtig:** Das löscht Spielstände (Supabase). Nach `CLAUDE.md` nur mit ausdrücklicher Zusage von Felix, nie von allein (Zusage lag vor, „Schalte live“ am 22.10.).
2. Spielgefühl: Felix findet, es fühlt sich noch wie ein „spielbares Forum“ an (viel Text, Listen, Knöpfe). Vor dem App-Start einmal gezielt angehen, erst Vorschlag
   - Bestandsaufnahme (Jan, 22.10., 390 px): Titel und Hafen wirken schon wie ein Spiel. Am meisten Forum: die Inselwahl (lange Textkarten, gebaut auf `feature/inselwahl-bilder`), der Kapitän-Reiter (~2500 px Verwaltung: Spielercode, Spielstände, Konto untereinander) und „Crew aufstellen“ (viele Chips und Filter). Kampf und Aufträge-Reiter noch nicht angeschaut.
2a. **Warum gehe ich in diesen Run? (Jan, 22.10.)** Vor dem Ablegen soll klar sein: Ich fahre los, weil … (Ziel dieser Fahrt, Belohnung, was ich freischalte, welche Figur weiterkommt). Hängt an den Tafeln „Einstieg & Neustart“, „Was wohin fließt“ und „Figurenreise & Kopfgeld“ im Gesamtplan (dort als orangene Notiz rechts neben „Endgame-Tiefe“ vermerkt). Jans Wunsch als nächster großer Punkt nach der Inselwahl. Erst Vorschlag mit Skizze, dann bauen.
2c. **Kampf mit Tiefe (Jan, 22.10., wichtig):** Kämpfe fühlen sich gleich an (starten, bam bam bam, nächste Runde). Nichts spricht dagegen, vorzuspulen oder zu überspringen. Ziel: Man will hinschauen und eingreifen.
   - **Bosse mit Signatur-Attacken:** jeder Boss 1 bis 2 eigene Angriffe mit Ansage, z. B. **Fesseln** (eine Figur aus der Crew setzt aus, bis man sie befreit oder ein Konter greift), Flächenschlag, Rüstung brechen, Beschwören. Mit Vorwarnung, damit man reagieren kann (Ulti, Fokus, Heiler).
   - **Animationen und Waffen:** Bosse und eigene Figuren mit sichtbaren Waffen und eigenen Angriffs-Animationen statt gleicher Treffer-Effekte.
   - **Boni müssen spürbar sein:** Wahl-Boni, Formen, Ausrüstung, Duos, Stil-Kombos sollen im Kampf sichtbar etwas ändern (Zahl, Effekt, Moment), nicht nur in der Werte-Tafel.
   - **Nicht vorberechnet wirken:** Heute rechnet `GL.battle.simulate` den Kampf und `arena.js` spielt ihn ab, Eingriffe (Ulti, Fokus) gehen als `cmds` ein. Prüfen, ob Entscheidungen im Kampf genug Gewicht haben und ob mehr echte Momente zum Eingreifen nötig sind.
   - Hängt zusammen mit: Gesamtplan-Tafeln „Kampf: selbst eingreifen“, „4 · Waffen & Animationen“, „Zustände & Reaktionen“, „1 · Ultis“, Punkt 7 („Kampfszenen lebendiger“) und Punkt 8 (größeres Kampffeld). Erst Vorschlag mit Skizze, dann in Häppchen bauen (Kampfsystem = Claude/Opus, neue Animationen und Waffen-Looks nach festem Muster auch Cursor).
2b. ✓ live als 23a (Toast-Warteschlange). Rest bei Bedarf: Reihenfolge der Hafen-Fenster in `featureCheck()` (nicht angefasst). **Bug: Meldungen zu neuen Freischaltungen** wirken teils fehlerhaft (Jan, 22.10.). Genaue Fälle noch sammeln (doppelt? falscher Zeitpunkt? bleibt hängen?), dann gezielt prüfen.
3. Nächstes Gesamtplan-Paket: Story-Drops (6er-Crew mit Kampfwert steckt im Deck), Kopfgeld als roter Faden, Endless aus Biomen oder 5 Kampfstile
4. Bug prüfen: `masters` (Meisterschaft Gold, +15 % Fähigkeit) wird in `main.js` beim Run-Start nicht übergeben, der Bonus greift wohl nie. Fix verschiebt Balance, daher erst mit Felix
5. Rumpf-Upgrade auch im Landgang
6. Mehr Gold-Ziele (4. Stufe oder Kosmetik wie eine Flagge)
7. Aus der Ideenwerkstatt („Ja, machen wir“): Piratin fertig, Look-Inventur, Kampfszenen lebendiger, Kämpfer-Auswahl entschlacken, Performance
8. **Kampf-Durchblick Teil B, größeres Kampffeld mit Fahrtband** (Jan, 22.10.: nichts komplett Neues jetzt, hinten anhängen). Skizze und Maße stehen bei Punkt 1b (Feld ~60 % der Höhe, Figuren ~1,5×, Kämpfer-Karten als Leiste, Fahrtband oben). Die Skizze liegt nur im 11. Chat vor, bei Bedarf neu zeichnen. Noch nichts gebaut, vor dem Bauen Felix' Okay zur Skizze, Opus.

Die große Ideenliste ist das Claude-Doc **„Grand Line: Ideenwerkstatt“** im Account von Felix. Von anderen Accounts aus ist es nicht lesbar. Was dort beschlossen wird, kommt als Punkt in diese Warteschlange.

## Letzte Übergabe
_Hier schreibt der letzte Chat in 3 bis 5 Zeilen, wo er aufgehört hat._
- 23.10. (Jan, 14. Chat, Teil 2): Grok (Cursor) ist an GitHub angebunden (Test `cursor/verbindungstest` bestätigt, Autor „Grok“). A1 (Toast-Warteschlange F1 bis F5) von Grok auf `fix/freischalt-meldungen` gebaut (`1ff9a0a`), von Claude per Diff und Simulations-Test geprüft, live als 23a (Patchnote, `bump-version.py`, `node --check`, ff nach `main`). Ablauf Claude plant, Grok baut, Claude prüft und schaltet live funktioniert. Nächstes Thema: Jan/Felix wählen aus der Warteschlange (2a Run-Motivation, 2c Kampf mit Tiefe, erst Vorschlag).
- 23.10. (Jan, 14. Chat): `feature/inselwahl-bilder` live als 22s (Patchnote, `bump-version.py`, Bündel per `node --check` geprüft, ff nach `main`). A1 (Hafen-Meldungen, Punkt 2b) noch offen: Jan nennt als Fall „mehrere gleichzeitig“. Zweig `fix/freischalt-meldungen` existiert (enthält nur `claude/BAUAUFTRAEGE.md` mit Toast-Fällen F1 bis F4, aus dem Code gelesen, nicht im Spiel bestätigt). Grok hat bisher nichts gepusht, Anbindung wird eingerichtet.
- 22.10. (Jan, 13. Chat): 22r live bestätigt (thegreatline.de = `2026-10-22r`). Spielgefühl angegangen: Bestandsaufnahme per Screenshots, dann `feature/inselwahl-bilder` gebaut (Opus), wartet auf „schalte live“. Neu in der Warteschlange: 2a Run-Motivation, 2b Freischalt-Meldungen, 2c Kampf mit Tiefe. Neu: `AGENTS.md` und Abschnitt „Bauaufträge für Cursor“ (Claude plant, Grok baut, Claude prüft). Der Gesamtplan (claude.ai/artifact/1dispKg6D9ikrHzthLXdN4) ist von Jans Account aus beschreibbar, dort steht eine Notiz zu 2a/2b.
- 22.10. (Jan, 12. Chat): `feature/neustart` live als 22r (`keep` = `0e7333bc`, Patchnote, `bump-version.py`, Bündel per `node --check` geprüft, ff nach `main`). **Felix muss jetzt SQL Teil 2 ausführen**, morgen Teil 3. Nächstes Thema: Felix und Jan wählen aus der Warteschlange.
- 22.10. (Jan, 11. Chat, Teil 3): Neustart für alle (1c) auf Opus vorbereitet: `feature/neustart` (enthält auch die Fahrplan-Änderung zu Teil B). Wartet auf Felix: SQL Teil 1, dann `keep_id` an Claude, dann live, dann Teil 2. Nichts gelöscht.
- 22.10. (Jan, 11. Chat, Teil 2): Skizze zu Teil B gezeigt, Jan will nichts komplett Neues jetzt. Teil B steht als Punkt 8 am Ende der Warteschlange. Nächstes Thema: Felix/Jan wählen aus der Warteschlange.
- 22.10. (Jan, 11. Chat): `feature/kampf-durchblick-tafel` live als 22q (Patchnote, `bump-version.py`, Bündel per `node --check` geprüft, ff nach `main`). Teil B später (Punkt 8).
- 22.10. (Jan, 10. Chat, Teil 2): Felix' Okay per Klick bestätigt, **Werte-Tafel (1b Teil A) auf Opus gebaut**: `feature/kampf-durchblick-tafel`, wartet auf „schalte live“. Baut auf der vorhandenen Steckbrief-Aufschlüsselung (`stats.js`) auf, rechnet nichts doppelt. Nächstes Thema: 1b Teil B, größeres Kampffeld mit Fahrtband, erst Skizze.
- 22.10. (Jan, 10. Chat): `feature/kampf-durchblick-vorschlag` live (nur Fahrplan, ff nach `main`, ohne Patchnote/Versionssprung). Nächstes Thema: 1b Teil A, Werte-Tafel (Halten oder ⓘ), wird gebaut, sobald Felix' Okay zum Vorschlag vorliegt.
- 22.10. (Jan, 9. Chat): `feature/figurenreise-boni` live als 22p (Patchnote, `bump-version.py`, Bündel per `node --check` geprüft, ff nach `main`). Kampf-Durchblick (Punkt 1b): Vorschlag mit Skizze gemacht und von Jan per Klick abgestimmt (erst Werte-Tafel per Halten/ⓘ, dann größeres Feld mit Fahrtband), steht auf `feature/kampf-durchblick-vorschlag` (nur Fahrplan). Wartet auf Felix' Okay, dann bauen (Opus).
- 22.10. (Jan, 9. Chat): `feature/fahrplan-notizen` live (nur Fahrplan, ff nach `main`, ohne Patchnote/Versionssprung wie bei der Modellwahl). Wahl-Boni (1a) auf Opus gebaut: `feature/figurenreise-boni`, wartet auf „schalte live“. Danach: Rest von Punkt 1 (eigene Fähigkeit pro Form) oder 1b Kampf-Durchblick, erst Vorschlag.
- 22.10. (Jan, 8. Chat): `feature/figurenreise-looks` live als 22o (Patchnote, `bump-version.py` mit terser/lightningcss, Bündel per `node --check` geprüft, ff nach `main`). Nächstes Thema: Figurenreise Teil 2, Wahl-Boni (bei jeder Form 1 von 2 Boni zur Wahl, im Dojo-Bildschirm). Erst kurz vorschlagen, noch nichts gebaut.
- 22.10. (Jan, 7. Chat, Teil 2): Figurenreise Teil 2 auf Klick-Antwort „nur die Looks“ gebaut: `feature/figurenreise-looks`, 12 Looks per Vorschau-Blatt geprüft, neutrale Namen ergänzt. Wartet auf „schalte live“. Danach als Nächstes die Wahl-Boni (1 von 2 pro Form), erst kurz vorschlagen. Jan-Hinweis: immer in der eigenen Welt arbeiten, keine Markennamen sichtbar.
- 22.10. (Jan, 7. Chat): `feature/crew-taverne` live als 22n (Patchnote, `bump-version.py`, Bündel per `node --check` geprüft, ff nach `main`). Nächstes Thema: Figurenreise Teil 2. Erst Vorschlag per Klick-Fragen, noch nichts gebaut.
- 22.10. (Jan, 6. Chat, Teil 2): `feature/crew-deck` live als 22m. Taverne einmal pro Insel-Karte auf `feature/crew-taverne` gebaut und gemessen (Details oben unter „Wartet“), wartet auf „schalte live“. Entscheidungen per Klick: genau eine Taverne pro Karte, Markttag/Marktfest bleiben als Ausnahme. Headless-Messung läuft nur lokal (Scratchpad), im Repo gibt es `tools/balance.html`.
- 22.10. (Jan, 6. Chat): `feature/crew-deck` live als 22m (Patchnote, `bump-version.py`, Bündel gebaut, per `node --check` geprüft). Nächstes Thema: Crew-Start Teil 2 (Taverne nur einmal pro Insel, dann Balance mit `tools/balance.html`). Noch nicht begonnen, erst kurz vorschlagen.
- 22.10. (Jan, 5. Chat): `feature/modellwahl` live (nur `CLAUDE.md`). Crew-Start „Das Deck“ auf `feature/crew-deck` gebaut, Engine (Budget, Replay, Gegner-Ausgleich) und Bildschirm im Browser geprüft, auch Handy-Breite. Entscheidungen per Klick: Look ja, Budget 45 +1 je 2 Ränge bis 60, Pirat gratis, Kampfwert berechnet, Gegner passend zur Crew-Größe, Taverne-Umbau als eigener Schritt.
- 22.10. (Jan, 4. Chat): Beratung zu Engines (Ergebnis: kein Wechsel, Web-Stack passt; bei Bedarf Piskel/LibreSprite für Sprite-Sheets, PixiJS nur für die Arena, Tiled für handgebaute Karten) und zu Kosten. Regel zur Modellwahl auf `feature/modellwahl`, wartet auf Felix' Okay.
- 22.10. (Jan, 3. Chat): 22k live. Gesamtplan-Fläche gegen den Code abgeglichen (Abschnitt oben). Figurenreise Teil 1 auf `feature/figurenreise` gebaut und im Browser durchgespielt (Dojo, Aufstieg, Werte, neutrale Namen). Live läuft die neutrale Welt (`config.world`), neue Begriffe also immer in `neutral.js` eintragen.
- 22.10. (Jan, 2. Chat): `release/22j` live. `feature/upgrades-am-schiff` war 3D und ist tot. Schiffs-Upgrades im 2D-Spiel gebaut auf `feature/schiff-upgrades-sichtbar`: `GL.sprites.ship` liest `GL.sprites.myUpg` (= `profile.upgrades`), nur fürs eigene Schiff; fremde Schiffe nur mit `look.upg`. Vorschau aller Stufen geprüft. Aufräumen der Zweige muss Felix von Hand machen (Befehle oben).
- 22.10. (Jan): Fahrplan und Startnachricht-Regel angelegt (siehe `CLAUDE.md`). Nichts am Spiel geändert. Nächster Chat: `release/22j` live, dann Upgrades sichtbar am Schiff.
