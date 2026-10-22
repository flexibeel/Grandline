# Fahrplan: Stand, Warteschlange, Übergabe

**Jeder neue Chat liest zuerst diese Datei** (und `CLAUDE.md`), nicht den ganzen Code.
**Am Ende jedes Chats** wird sie aktualisiert und mitgepusht: Was ist fertig, was liegt auf welchem Zweig, was kommt als Nächstes.
Felix und Jan arbeiten mit verschiedenen Claude-Accounts. Diese Datei ist das gemeinsame Gedächtnis, deshalb gehört hier alles rein, was der nächste Chat wissen muss.

Stand: 22.10.2026 (nachmittags)

## Wer macht was
- **Felix:** entscheidet, was gebaut wird und was live geht („schalte live“), Kunst und Look.
- **Jan:** _(bitte ergänzen)_
- **Claude:** setzt um, immer auf eigenem Zweig, pflegt diese Datei.

## Grundsatz-Entscheidung (21.10.)
- **Weitergebaut wird das 2D-Pixel-Spiel** (`index.html`, `js/`). Das 3D-System „Neue Welt“ (`neu/`) ist seit 22f entfernt und archiviert (`archiv/neue-welt`), `/neu/` leitet nur noch aufs Spiel um.
- Alte Zweige, die `neu/...` ändern, sind 3D-Arbeit und werden **nicht** weitergeführt. Ideen daraus werden bei Bedarf im 2D-Spiel neu gebaut.

## Live
- `main` = **22l „Die Figurenreise“** (thegreatline.de): Stil-Dojo im Kontor, Erinnerungsstücke, Story-Formen für die Strohhüte. Davor 22k Schiffs-Upgrades sichtbar, 22j Endlos-Tiefe, 22i Kontor Teil 1, 22h Kampf-Update.

## Wartet auf „schalte live“
_(nichts)_

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
1. **In Arbeit: Spielgefühl + Crew-Start.** Felix: fühlt sich wie ein „spielbares Forum“ an. Jan (22.10.): Start komplett umbauen, man stellt vor dem Ablegen seine Crew zusammen (Gesamtplan-Tafeln „6er-Crew & Animationen“ und „Story-Drops mit Kampfwert“: 6 aus allen Freigeschalteten, Kampfwert-Budget 45, Crew-Bremse weg, Taverne nur 1× pro Insel). Vorschlag im Chat gemacht (Crew-Start als Schiffsdeck-Szene = Pilot für den neuen Look, danach Hafen als Ort, dann weniger Text im Run), Jan hat entschieden (22.10.): Deck zuerst · Taverne 1× pro Insel mit Tauschen + Zusammenlegen · alter Kapitän-Start wird direkt ersetzt (kein Schalter) · Entwurfs-Tafel „Crew-Start: das Deck“ liegt im Gesamtplan (unten rechts, neben „Zustände“). Nach Felix' Okay zum Look wird gebaut (mit Opus). Offen auf der Tafel: Budget 45 und später höher mit Rang? Kostet der eigene Pirat Kampfwert? Zweig `feature/spielgefuehl`.
2. Figurenreise Teil 2: Looks der übrigen 6 Strohhüte, Wahl-Boni, eigene Fähigkeit pro Form, Nebenfiguren
3. Nächstes Gesamtplan-Paket: Story-Drops (6er-Crew steckt in Punkt 1), Kopfgeld als roter Faden, Endless aus Biomen oder 5 Kampfstile
4. Bug prüfen: `masters` (Meisterschaft Gold, +15 % Fähigkeit) wird in `main.js` beim Run-Start nicht übergeben, der Bonus greift wohl nie. Fix verschiebt Balance, daher erst mit Felix
5. Rumpf-Upgrade auch im Landgang
6. Mehr Gold-Ziele (4. Stufe oder Kosmetik wie eine Flagge)
7. Aus der Ideenwerkstatt („Ja, machen wir“): Piratin fertig, Look-Inventur, Kampfszenen lebendiger, Kämpfer-Auswahl entschlacken, Performance

Die große Ideenliste ist das Claude-Doc **„Grand Line: Ideenwerkstatt“** im Account von Felix. Von anderen Accounts aus ist es nicht lesbar. Was dort beschlossen wird, kommt als Punkt in diese Warteschlange.

## Letzte Übergabe
_Hier schreibt der letzte Chat in 3 bis 5 Zeilen, wo er aufgehört hat._
- 22.10. (Jan, 4. Chat): 22l Figurenreise live. Vorschlag Spielgefühl + Crew-Start gemacht, Jan hat per Klick-Fragen entschieden, Entwurfs-Tafel „Crew-Start: das Deck“ gezeichnet. Am Spiel noch nichts gebaut. Heute: Kapitän aus 3 (+ eigener Pirat), Crew wächst über die Taverne (`config.crewRamp`, `shop`, Zusammenlegen). Stammcrew (`meta.js`, 4 Plätze) gibt es schon für Duelle.
- 22.10. (Jan, 3. Chat): 22k live. Gesamtplan-Fläche gegen den Code abgeglichen (Abschnitt oben). Figurenreise Teil 1 auf `feature/figurenreise` gebaut und im Browser durchgespielt (Dojo, Aufstieg, Werte, neutrale Namen). Live läuft die neutrale Welt (`config.world`), neue Begriffe also immer in `neutral.js` eintragen.
- 22.10. (Jan, 2. Chat): `release/22j` live. `feature/upgrades-am-schiff` war 3D und ist tot. Schiffs-Upgrades im 2D-Spiel gebaut auf `feature/schiff-upgrades-sichtbar`: `GL.sprites.ship` liest `GL.sprites.myUpg` (= `profile.upgrades`), nur fürs eigene Schiff; fremde Schiffe nur mit `look.upg`. Vorschau aller Stufen geprüft. Aufräumen der Zweige muss Felix von Hand machen (Befehle oben).
- 22.10. (Jan): Fahrplan und Startnachricht-Regel angelegt (siehe `CLAUDE.md`). Nichts am Spiel geändert. Nächster Chat: `release/22j` live, dann Upgrades sichtbar am Schiff.
