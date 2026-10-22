# Fahrplan: Stand, Warteschlange, Übergabe

**Jeder neue Chat liest zuerst diese Datei** (und `CLAUDE.md`), nicht den ganzen Code.
**Am Ende jedes Chats** wird sie aktualisiert und mitgepusht: Was ist fertig, was liegt auf welchem Zweig, was kommt als Nächstes.
Felix und Jan arbeiten mit verschiedenen Claude-Accounts. Diese Datei ist das gemeinsame Gedächtnis, deshalb gehört hier alles rein, was der nächste Chat wissen muss.

Stand: 22.10.2026 (nachmittags, nach 22p und Kampf-Durchblick-Vorschlag)

## Wer macht was
- **Felix:** entscheidet, was gebaut wird und was live geht („schalte live“), Kunst und Look.
- **Jan:** _(bitte ergänzen)_
- **Claude:** setzt um, immer auf eigenem Zweig, pflegt diese Datei.

## Grundsatz-Entscheidung (21.10.)
- **Weitergebaut wird das 2D-Pixel-Spiel** (`index.html`, `js/`). Das 3D-System „Neue Welt“ (`neu/`) ist seit 22f entfernt und archiviert (`archiv/neue-welt`), `/neu/` leitet nur noch aufs Spiel um.
- **Gespielt und gebaut wird in der eigenen (neutralen) Welt**, damit das Spiel veröffentlicht werden kann (`config.world: 'neutral'`, Namen in `js/world/neutral.js`). Neue Namen, Titel und Texte immer mit einem Eintrag in `neutral.js` absichern. Prüfen: `index.html?welt=neutral`, oder alle neuen Texte per Skript durch die Ersetzungsliste schicken. Keine Markennamen im Spiel sichtbar lassen.
- Alte Zweige, die `neu/...` ändern, sind 3D-Arbeit und werden **nicht** weitergeführt. Ideen daraus werden bei Bedarf im 2D-Spiel neu gebaut.

## Live
- `main` = **22p „Deine Form, dein Bonus“** (thegreatline.de): Figurenreise Teil 2, Wahl-Boni (bei jeder Form 1 von 2 Boni: Leben, Angriff oder Tempo, im Dojo jederzeit kostenlos umstellbar). Davor 22o „Neue Looks für die Strohhüte“: die 12 Form-Looks der übrigen 6 Strohhüte (nur Optik). Davor 22n „Die Taverne am Hafen“: Crew-Start Teil 2, im Deck-Start genau eine Taverne pro Insel-Karte, bleibt bei voller Crew stehen. Davor 22m „Das Deck“ (Crew vor dem Ablegen auf dem Schiff aufstellen, Kampfwert-Budget 45 plus Rang, keine Crew-Bremse mehr) und 22l „Die Figurenreise“ (Stil-Dojo im Kontor, Erinnerungsstücke, Story-Formen für die Strohhüte). Seit 22.10. außerdem die Fahrplan-Notizen (`feature/fahrplan-notizen`: Wahl-Boni abgestimmt, Kampf-Durchblick, Neustart-Idee, nur Fahrplan), der Kampf-Durchblick-Vorschlag (`feature/kampf-durchblick-vorschlag`: erst Werte-Tafel, dann größeres Feld mit Fahrtband, nur Fahrplan) und in `CLAUDE.md`: Modellwahl (Sonnet/Opus) und Entscheidungen als Klick-Fragen (nur Arbeitsregeln, Spiel unverändert). Davor 22k Schiffs-Upgrades sichtbar, 22j Endlos-Tiefe, 22i Kontor Teil 1, 22h Kampf-Update.

## Wartet auf „schalte live“
_(nichts)_

Figurenreise Teil 2, Wahl-Boni (22p) ist live (`feature/figurenreise-boni`, Punkt 1a). Bei jeder erreichten Form wählt man 1 von 2 Boni: ❤ +5 % Leben, ⚔ +5 % Angriff oder 💨 +1 Tempo, obendrauf zu den festen +10 %. Gebündelt per `bump-version.py`, Bündel per `node --check` geprüft.
  - `js/data/forms.js`: `formConf.boni` (hp 0.05, atk 0.05, spd 1) und je Form `boni: [..2..]`, passend zur Figur (z. B. Gear Second Angriff/Tempo, Chopper Leben/Tempo bzw. Leben/Angriff, Brook Tempo).
  - `js/engine/forms.js`: `profile.forms.pick = { id: ['hp', 'atk'] }`, Funktionen `boniOf`, `picks`, `choose`, `open`, `openAll`, `startBoni`. `boost` rechnet die Boni mit ein (Angriff mindestens +1 je Angriffs-Bonus).
  - Run: neues Feld `run.start.fboni = { id: 'ha' }` (h/a/s je Form, `-` offen), Übergabe in `main.js` (`sail`), geprüft in `run.js`. Alte Replays ohne das Feld laufen ohne Boni, also Replay-sicher. Tagesfahrt/Wettfahrt wie bisher ohne Formen.
  - `js/ui/dojo.js` + `main.js` (Klick `fr-pick`): Auf jeder Figurenkarte im Kontor eine Zeile je Form mit 2 Knöpfen, gewählter leuchtet, offene Wahl blinkt grün („Bonus wählen“). Im Aufstiegs-Moment direkt die Wahl, oder „Später wählen“. Umstellen jederzeit kostenlos. CSS-Block „Wahl-Boni“ hinter `.fr-upbtn`.
  - Geprüft: Engine per Node (falsche Wahl abgelehnt, Umstellen, Werte mit/ohne Boni, Tempo), Karten und Aufstiegsfenster per Headless-Browser auf Handy-Breite, neutrale Namen greifen.
  - Offen: Ob die Boni im Kampf sichtbar sein sollen, hängt an 1b (Kampf-Durchblick).

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
1b. **Kampf-Durchblick (Jan, 22.10.):** Im Kampf ist unklar, welche Werte eine Figur gerade hat, was skaliert und was miteinander harmoniert (Stil-Kombos, Duos, Team-Fähigkeiten). Vorschlag zuerst, z. B. Werte-Tafel beim Antippen einer Figur. Auch als Tafel im Gesamtplan-Artefakt festhalten (liegt in Felix' Account, von hier evtl. nicht schreibbar). Hängt mit den Wahl-Boni zusammen: ohne sichtbare Werte lässt sich die Wahl schwer beurteilen. **Dazu (Jan, 22.10., per Sprache diktiert, „Fight“ vermutlich gemeint):** Den Kampfbildschirm mit den Figuren größer machen und mehr darin zeigen, Jan findet ihn schick und will darauf aufbauen. Grafisch besser einordnen, auch passend zur Seefahrt (Schiff schippert, findet einen Schatz). Erst Vorschlag mit Skizze, dann Okay von Felix. Wenn „Screen vom File“ etwas anderes meint, bei Jan nachfragen.
   **Vorschlag mit Skizze, von Jan per Klick abgestimmt (22.10., 9. Chat), wartet auf Felix' Okay, nichts gebaut:**
   - **Reihenfolge:** erst **A: Werte-Tafel**, danach **B: größeres Kampffeld mit Fahrtband**. Jan meint mit „Screen vom File“ den Kampfbildschirm.
   - **A: Tafel** pro Figur: Name/Stil, Leben/Angriff/Tempo mit Herkunft der Aufschläge (Form +10 %, Wahl-Bonus, Ausrüstung, Meisterschaft), Zustände, Ulti-Ladung, aktive Duos/Stil-Kombos/Team-Fähigkeiten und was noch fehlt. **Auslöser: Halten oder kleines ⓘ an der Figur**, denn Antippen zündet die Ulti (leuchtende Figur) und ein Tipp aufs Feld schaltet das Tempo (`data-act="faster"`).
   - **B: Feld** heute fest 300 px (`.field`), Figuren 64×75 px (`fieldUnit`, `arena.js`). Geplant: ~60 % der Höhe, Figuren ~1,5× größer, Kämpfer-Karten schrumpfen zur Leiste, schmales Fahrtband oben (Schiff schippert, Insel/Schatz am Horizont).
   - Betrifft `js/ui/arena.js`, `render.js`, `css/style.css`; Bauen mit Opus. Neue Texte in `neutral.js`. Die Tafel im Gesamtplan-Artefakt (Felix' Account) von hier evtl. nicht schreibbar.
1c. **Neustart für alte Spieler (Jan, 22.10., Idee):** Wer schon gespielt hat, spürt das neue Spielerlebnis kaum. Jans Wahl: alle Konten zurücksetzen, alle melden sich neu an, dazu ein kleiner Infoscreen. Ergänzend gedacht: Tester-Belohnung für die erste Woche (z. B. Gründer-Zeichen). Sanftere Alternativen: Tester-Zeichen ohne Reset oder freiwilliger Neustart mit gesichertem Altstand. **Wichtig:** Das löscht Spielstände (Supabase). Nach `CLAUDE.md` nur mit ausdrücklicher Zusage von Felix, nie von allein. Vorher klären: Stichtag, Sicherung der Altstände, Rangliste, Text des Infoscreens. Nicht ausgeführt.
2. Spielgefühl: Felix findet, es fühlt sich noch wie ein „spielbares Forum“ an (viel Text, Listen, Knöpfe). Vor dem App-Start einmal gezielt angehen, erst Vorschlag
3. Nächstes Gesamtplan-Paket: Story-Drops (6er-Crew mit Kampfwert steckt im Deck), Kopfgeld als roter Faden, Endless aus Biomen oder 5 Kampfstile
4. Bug prüfen: `masters` (Meisterschaft Gold, +15 % Fähigkeit) wird in `main.js` beim Run-Start nicht übergeben, der Bonus greift wohl nie. Fix verschiebt Balance, daher erst mit Felix
5. Rumpf-Upgrade auch im Landgang
6. Mehr Gold-Ziele (4. Stufe oder Kosmetik wie eine Flagge)
7. Aus der Ideenwerkstatt („Ja, machen wir“): Piratin fertig, Look-Inventur, Kampfszenen lebendiger, Kämpfer-Auswahl entschlacken, Performance

Die große Ideenliste ist das Claude-Doc **„Grand Line: Ideenwerkstatt“** im Account von Felix. Von anderen Accounts aus ist es nicht lesbar. Was dort beschlossen wird, kommt als Punkt in diese Warteschlange.

## Letzte Übergabe
_Hier schreibt der letzte Chat in 3 bis 5 Zeilen, wo er aufgehört hat._
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
