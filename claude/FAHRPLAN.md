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
- `main` = **22k „Das Schiff wächst mit“** (thegreatline.de): Werft-Stufen sichtbar am Schiff. Davor 22h Kampf-Update, 22i Kontor Teil 1, 22j Endlos-Tiefe.

## Wartet auf „schalte live“
- _(nichts)_

## Gesamtplan gegen Spiel (Abgleich 22.10.)
Bauplan ist die Design-Fläche **„Grand Line: Gesamtplan“** (claude.ai/artifact/1dispKg6D9ikrHzthLXdN4, 22 Tafeln, mit Jans Dungeons). Stand im Code:
- **Gebaut:** Ultis per Klick (0, +30, ×1,6), Heiler unter 50 %, Fokus/Verteidigen, Frost/Schock/Blind + 4 Reaktionen, Kontor Teil 1 (Bernstein, Entladen, Wertsachen, Raritäten, eigene Vitrine), Endless-Gegner-Zusätze, Schiffs-Upgrades sichtbar. Inseln bis Sabaody, 65 Figuren, 3 Kampfstile.
- **Schon da, aber anders als im Plan (darauf aufbauen, nicht doppeln):** Meisterschaft je Figur (`engine/mastery.js`, ≈ Figurenreise), Piratenrang + Heat-Kopfgeld (≈ Spieler-Kopfgeld), Crew-Ausrüstung 3 Plätze (`crewgear`), Landgänge + Seekarte (≈ Dungeons), Raid-Jagd mit Vitrine, Duos, Stil-Kombos, Team-Fähigkeiten, Skilltree.
- **Fehlt noch:** 6er-Crew mit Kampfwert-Budget + Story-Drops (Plan-Schritt 4), Erinnerungsstücke/Story-Formen/Stil-Dojos, Trainingsrollen (Ulti-Stufen), Kopfgeld-Stufen als Freischalt-Faden, Endless aus Biomen + Wetter + wachsende Inseln + Woche, Saphir/Rubin + Raid-Minispiele, Kombüse/Vorräte, Handelsfahrten, Wanderhändler, 5 Kampfstile, 6 Seltenheiten + Taverne + Marken, Waffen an Figuren, Ulti-Team-Kombos, Schiffe aus 4 Teilen mit Bonus, Logbuch, Boss-Steckbrief, Figuren bis Marineford.

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
1. Rumpf-Upgrade auch im Landgang
2. Mehr Gold-Ziele (4. Stufe oder Kosmetik wie eine Flagge)
3. Aus der Ideenwerkstatt („Ja, machen wir“): Piratin fertig, Look-Inventur, Kampfszenen lebendiger, Kämpfer-Auswahl entschlacken, Performance

Die große Ideenliste ist das Claude-Doc **„Grand Line: Ideenwerkstatt“** im Account von Felix. Von anderen Accounts aus ist es nicht lesbar. Was dort beschlossen wird, kommt als Punkt in diese Warteschlange.

## Letzte Übergabe
_Hier schreibt der letzte Chat in 3 bis 5 Zeilen, wo er aufgehört hat._
- 22.10. (Jan, 3. Chat): 22k live. Gesamtplan-Fläche gegen den Code abgeglichen (Abschnitt oben). Felix will jetzt Inhalt aus dem Plan ins Spiel statt Kleinkram; Rumpf im Landgang rückt nach hinten. Nächstes Paket wird gerade abgestimmt.
- 22.10. (Jan, 2. Chat): `release/22j` live. `feature/upgrades-am-schiff` war 3D und ist tot. Schiffs-Upgrades im 2D-Spiel gebaut auf `feature/schiff-upgrades-sichtbar`: `GL.sprites.ship` liest `GL.sprites.myUpg` (= `profile.upgrades`), nur fürs eigene Schiff; fremde Schiffe nur mit `look.upg`. Vorschau aller Stufen geprüft. Aufräumen der Zweige muss Felix von Hand machen (Befehle oben).
- 22.10. (Jan): Fahrplan und Startnachricht-Regel angelegt (siehe `CLAUDE.md`). Nichts am Spiel geändert. Nächster Chat: `release/22j` live, dann Upgrades sichtbar am Schiff.
