# Altes ausmisten: Liste mit Vorschlag je System

Stand 29.10.2026, nur Liste, nichts gebaut, kein Spielcode geändert. Auftrag: Felix per Klick (29.10., 8:47), siehe `claude/PLAN-NEUGEWICHT.md` Abschnitt 6 „Altes ausmisten“. Das ändert Abschnitt 5 dort („einfrieren, nichts löschen“): Jetzt wird geprüft, und Seelenloses darf raus.
Grundlage: der Code auf `feature/neuausrichtung` (Basis `4a8e55b`), nur gelesen. Der Fahrplan-Eintrag (`claude/FAHRPLAN.md`) kommt vom anderen Chat und ist hier nicht angefasst.

## 1. So gehen wir vor
- **Jedes „raus“ bestätigt Felix einzeln per Klick, nie still.** Erst danach gibt es einen Bauauftrag, jeder auf eigenem Zweig. Die Antworten stehen in Abschnitt 5.
- **Maßstab** (aus PLAN-NEUGEWICHT, Regel gegen das KI-Gefühl): Ein System bleibt, wenn man es **spürt** (Moment, Zahl, Bild), wenn es eine **eigene Idee** hat oder wenn es dem Kreislauf **Beute → stärker → Spieler gegen Spieler** dient. „Man sieht nie, warum man stärker wurde“ ist der Hauptgrund für ein Raus.
- **Auslauf-Regeln** (gelten für jedes Raus, damit Spielstände nicht kaputtgehen):
  1. **Felder bleiben im Profil.** Nichts im Spielstand löschen, `migrate` und Cloud-Merge kennen sie weiter. Ein gelöschtes Feld kostet echten Fortschritt, ein totes Feld kostet nichts.
  2. **Wirkung läuft per Schalter aus.** Neue Fahrten laufen ohne den Bonus, über ein Versions-Flag in `run.start` (wie `ramp` und `herz`). Alte Runs und Replays tragen ihren gespeicherten `run.start` mit und rechnen unverändert weiter.
  3. **Guthaben wird erstattet**, einmalig, mit Marke im Profil (damit nie doppelt). Verhältnis wird beim Bauen mit der Bot-Messung festgelegt, hier steht nur die Richtung.
  4. **Freischaltungen und Kosmetik bleiben.** Was Spieler über das System bekommen haben (Rahmen, Flaggen, Titel, Pets), bleibt dauerhaft freigeschaltet.
  5. **Zufallszüge nie verschieben.** Wo eine Funktion pro Aufruf eine Zahl aus dem Seed zieht (`rollTrophy`, `dropItem`, Blind im Kampf), zieht sie weiter, nur das Ergebnis wird ignoriert.
  6. **Rangliste:** Felder sind dort optional. Alte Einträge bleiben als totes JSON, nur die Anzeige verschwindet.
  7. **Ausgleich:** Fallen Boni in Fahrten weg, werden Fahrten etwas härter. Die Tageskarte läuft schon ohne Werft, Skills, Artefakte und Ausrüstung und ist deshalb der Maßstab. Bei Bedarf Basiswerte pauschal anheben („einbacken“), per Bot messen.
  8. **Aufräumen:** entfernte Dateien aus `tools/bundles.json` nehmen, dann `bump-version.py`. Neue Texte sind nicht nötig, nur Texte anpassen, die auf Entferntes zeigen.

## 2. Übersicht

| # | System | Spürbar im Spiel | Vorschlag | Klick-Frage |
|---|---|---|---|---|
| 1 | Werft | mittel (Schiff, Kampfkraft-Quelle) | **behalten** | nein |
| 2 | Gemütlichkeit (Skilltree) | kaum (unsichtbare %) | **raus** | ja (Nr. 1) |
| 3 | Formen / Wahl-Boni | ja (Look, Titel, Aufstieg) | **behalten** | nein |
| 4 | Meisterschaft | überwiegend Optik | **zusammenlegen** mit Formen, Gold-Kampfwirkung **raus** | ja (Nr. 2) |
| 5 | Schatzkammer | mittel | **zusammenlegen** in Stammcrew-Ausrüstung, eigene Wirkung **raus** | ja (Nr. 3) |
| 6 | Schmiede | ja, wer sie nutzt | **zusammenlegen** in Stammcrew-Ausrüstung, Run-Items **raus** | ja (Nr. 4) |
| 7 | Landgang | ja | **behalten** | nein |
| 8 | Dungeon-Liga | nur im Landgang | **raus** (Liga, Marken, Laden) | ja (Nr. 5) |
| 9 | Offene See | nein, tot | **raus** | ja (Nr. 6) |
| 10 | Seekarte | als Umweg | **raus** | ja (Nr. 7) |
| 11 | Pets | ja (Optik, Album) | **behalten** | nein |
| 12 | Crew-Gefühle | Bild und Spruch ja, Regel kaum | **behalten** | nein |
| 13 | Weltgedächtnis | fast nicht | **zusammenlegen** mit Folgen, tote Teile **raus** | ja (Nr. 8) |
| 14 | Folgen | ja (Mehrteiler) | **behalten** | nein |
| 15 | Kampf-Zustände | sieben ja, drei kaum | **zusammenlegen**, Frost/Schock/Blind **raus** | ja (Nr. 9) |

Neun Klick-Fragen, eine je Raus. Alles, was nur „behalten“ heißt, braucht keine Entscheidung (Felix kann es trotzdem kippen).

## 3. Die 15 Systeme

### 3.1 Werft: behalten
- **Tut:** 9 Ausbauten gegen Berry, je 1 bis 5 Stufen (`js/data/upgrades.js`): Crew-Leben, -Angriff, -Tempo, Rast-Heilung, +1 Auswahl, Beute-Glück, +XP, +Berry am Run-Ende, Lagerplätze.
- **Spürbar:** mittel. Das Schiff bekommt sichtbare Pixel-Teile, und seit 29a zeigt die Kampfkraft „Werft“ als eigene Quelle. Die Zahlen selbst sind klein.
- **Besonderheit:** Das einzige der „+x %“-Systeme, das in die Stammcrew fließt und damit in Kampfkraft, Duelle, Rangliste, Landgang und Gemeinschafts-Fahrt (`meta.js` `squadRefs`). Genau deshalb bleibt es: Ohne Werft würde sich die Kampfkraft verschieben.
- **Später prüfen (kein Raus jetzt):** die reinen Wirtschafts-Stufen (Berry, XP, Lagerplätze), wenn „Der Hafen wächst“ drankommt.
- **Spielstände:** keine Änderung (`profile.upgrades`). `shipparts.js` ist nur Optik und gehört nicht dazu.

### 3.2 Gemütlichkeit (Skilltree): raus
- **Tut:** Skillpunkte aus vier Quellen (je Rang, je 6 Fahrten, je 3 Landgänge, je 5 Vertraut-Stufen) plus Käufe im Marken-Laden. Drei Pfade (Schiff, Zusammenhalt, Abenteuer) mit je 5 Knoten, 9 Talente, danach „Feinschliff“ mit 6 Stufenleisten (Schaden bis +25 %, Zähigkeit bis +30 % usw.). Umskillen kostenlos (`js/data/skilltree.js`, Raum in `render.js`).
- **Spürbar:** kaum. Die Wirkung in der Fahrt ist unsichtbar (kleine Prozente, Berry). Einziger Moment ist die Kanone zu Kampfbeginn. Wirkt nur auf Fahrten, nicht in Duell, Kampfkraft oder Rangliste.
- **Warum raus:** Es ist die reinste Form von „+x %, man sieht nie, warum“, und es hat die meisten Verknüpfungen für den wenigsten Spielwert.
- **Spielstände:** `profile.skills`, `polish`, `dlSkill` bleiben als tote Felder. Skillpunkte sind berechnet, nicht gespeichert, also nichts zu erstatten. Wirkung läuft über `run.start.skills` (bleibt lesbar für alte Runs), neue Fahrten ohne. Der Marken-Laden-Posten „Skillpunkt“ entfällt, gekaufte Skillpunkte gehen als Marken zurück (Preis war 40 + 20 je bisher gekauft). Feature-Eintrag `gemuet`, Raum und Hinweis „✦ n frei“ auf der Weltkarte entfallen. Ausgleich nach Regel 7.
- **Hängt dran:** Dungeon-Liga-Laden (3.8), Skillpunkt-Quelle Landgang (3.7).

### 3.3 Formen / Wahl-Boni: behalten
- **Tut:** Pro Strohhut-Figur Erinnerungsstücke (Stil-Dojo gegen Bernstein, Drops aus dem Landgang), daraus 2 Formen: +10 % Leben und Angriff, neuer Look, Titel. Bei jeder Form 1 von 2 Wahl-Boni (+5 % Leben, +5 % Angriff oder +1 Tempo), jederzeit kostenlos umstellbar (`forms.js` in `data` und `engine`, `dojo.js`).
- **Spürbar:** ja. Aufstiegs-Moment, die Figur sieht anders aus, Titel, Chips in der Werte-Tafel. Die Zahlen sind klein, aber es gibt Bild, Moment und eine echte Entscheidung.
- **Vorschlag:** behalten, hier wächst die „Figurenreise“, Meisterschaft zieht dazu (3.4).
- **Spielstände:** keine Änderung (`profile.forms`, `run.start.forms`, `run.start.fboni`).

### 3.4 Meisterschaft: zusammenlegen mit Formen, Gold-Kampfwirkung raus
- **Tut:** Pro Figur sammeln Fahrten EP (`profile.mastery`). Bronze 100, Silber 300, Gold 700, Meister 1500: Rahmen-Akzent, zweites Outfit, bei Gold Fähigkeit +15 % bzw. +1 Angriff, bei Meister ein Titel (`js/engine/mastery.js`, 57 Zeilen).
- **Spürbar:** überwiegend Optik (Medaille, Rahmen, Zweit-Outfit, Meisterschafts-Buch). Die Gold-Wirkung im Kampf ist unsichtbar.
- **Doppelt:** Zwei Fortschrittsleisten pro Figur (Meisterschafts-EP und Formen-Stücke), zwei Anzeigen für denselben Gedanken „diese Figur wird durch Spielen besonders“.
- **Vorschlag:** Zusammenlegen zu **einer Figurenreise**. Die EP-Leiste bleibt als Weg zu Rahmen, Zweit-Outfit und Titel, in derselben Ansicht wie die Formen. **Raus:** nur die Gold-Kampfwirkung.
- **Spielstände:** `profile.mastery`, `masters`, `outfitOff` bleiben. `run.start.masters` bleibt für alte Runs lesbar, neue Fahrten rechnen `masterPower` nicht mehr. Kosmetik-Titel, die an `masters` hängen (u. a. „Lehrmeister“, `cosmetics.js`), bleiben freigeschaltet. Nach Regel 4 nichts verlieren.

### 3.5 Schatzkammer (Artefakte): zusammenlegen in Stammcrew-Ausrüstung, eigene Wirkung raus
- **Tut:** 11 Artefakte aus Insel-Bossen (35 %), Raids (100 %) und Kopfgeld-Zielen (20 %). Jeder Fund steigert die Stufe (bis 5). Ausgerüstet (1 Platz plus 1 je 5 Ränge, höchstens 5) wirken sie in der Fahrt: Kampfwerte, Berry, Start-Leben, Start-Ladung, Boss-Abzug (`js/data/artifacts.js`, Raum „Schatzkammer“).
- **Spürbar:** mittel. Drop-Pop-up, Raum, Profilkarte. Die Wirkung sieht man nur in der Werte-Tafel. Nur Fahrt.
- **Doppelt:** Dieselben Bosse und Raids lassen schon Stammcrew-Ausrüstung fallen (10 Boss-Fundstücke und 8 Raid-Trophäen in `crewgear.js`). Zwei Beute-Systeme vom selben Boss, und nur eines davon zählt im Duell.
- **Vorschlag:** Zusammenlegen mit Häppchen 4 „Ausrüstung mit Effekten“. Die 11 Artefakte sind eine gute Ideenvorlage für Effekt-Teile. **Raus:** Artefakte als eigener Raum mit eigener Fahrt-Wirkung.
- **Spielstände:** `profile.vault` (Funde) und `artLoadout` einmal umrechnen in Stammcrew-Ausrüstung bzw. Meersplitter (Regel 3). Kosmetik-Rahmen „Schatzkammer“ (`artifacts: 6`) bleibt freigeschaltet. `rollTrophy` zieht weiter seine Zufallszahl (Regel 5). Rangliste: `vaultTop` und `artifacts` sind optional. `js/data/relics.js` (Run-Schätze) ist ein anderes System und bleibt.
- **Reihenfolge:** erst mit Häppchen 4, nicht vorher.

### 3.6 Schmiede: zusammenlegen in Stammcrew-Ausrüstung, Run-Items raus
- **Tut:** Drei Dinge laufen unter diesem Namen, nur das erste ist die Schmiede:
  1. **Schmiede:** 14 Run-Items (`js/data/items.js`), fallen in Fahrten (Elite 60 %, Boss 100 %, Truhe 30 %), liegen in der Truhe, mit Berry bis Stufe 5 schmieden, verschmelzen, einschmelzen, kommen per `itemLoadout` mit.
  2. **Lager und Händler** (`gear.js`): 11 Verbrauchsgüter gegen Berry. Nicht Teil dieser Liste, bleibt.
  3. **Stammcrew-Ausrüstung** (`crewgear.js`): die Beute des Kreislaufs, wirkt im Duell.
- **Spürbar:** ja für Spieler, die sie nutzen (Raum, Zeile am Run-Ende, Steckbrief). Wirkt nur in der Fahrt, auf der Rangliste nur vier Teile als Visitenkarte.
- **Doppelt:** Das sind die „zwei Ausrüstungssysteme“ aus PLAN-NEUGEWICHT Abschnitt 3.
- **Vorschlag:** Zusammenlegen. Die Stammcrew-Ausrüstung ist die Zukunft (Duell-Beute, Effekte, Seltenheiten), der Schmiede-Raum wird der Platz dafür (zusammen mit Häppchen 4). **Raus:** Run-Items als eigene Beute-Sorte.
- **Spielstände:** `profile.chest` umrechnen mit der vorhandenen Einschmelz-Formel (`8 · (Seltenheit + 1) + 10 · Stufe`, `meta.js`) in Berry bzw. Meersplitter. `itemLoadout` und `gone` bleiben. `GL.data.items` und seine Reihenfolge nicht ändern, `dropItem` zieht weiter seine Zufallszahl (Regel 5), `run.start.items` bleibt lesbar.
- **Reihenfolge:** mit Häppchen 4.

### 3.7 Landgang: behalten
- **Tut:** 8 Orte mit Szenen, Türen, Relikten, Raum-Launen und Boss-Kampf der Stammcrew, mit eigener Story und Crew-Sprüchen. Belohnung: Berry, Meersplitter, **Stammcrew-Ausrüstung**, Fundstück, Proviant, Vertrautheit, Formen-Stücke. Freigeschaltet ab 3 Fahrten und Rang 3.
- **Spürbar:** ja, ein echter Modus mit Crew-Sprüchen. Er ist die einzige Beute-Quelle neben der Fahrt und passt zum Kreislauf, später kommt die Duell-Beute dazu.
- **Vorschlag:** behalten. Raus gehen die Dinge **um ihn herum**: Seekarte-Pflichtweg (3.10) und Dungeon-Liga (3.8). Die Bernstein-Verwendung „Auffrischen“ bleibt.
- **Spielstände:** keine Änderung (`profile.dungeons`, `dgFinds`, `counts.landgang`). Wichtig: Skillpunkte, Story-Kapitel c6 und die Seekarte lesen `profile.dungeons`, das Feld nie verändern.

### 3.8 Dungeon-Liga: raus
- **Tut:** Bestwerte je Ort, Stufe und Tiefe ergeben Liga-Punkte, 6 Ligen von Planke bis Legende. Jeder gewonnene Landgang gibt Marken. Im Marken-Laden (11 Artikel) gibt es Karten-Hintergründe, Rahmen, 2 Pets, 2 Flaggen und Skillpunkte (`js/ui/dliga.js`, 150 Zeilen).
- **Spürbar:** nur im Landgang-Kontext (Chip, Ergebnisbox). Sonst eine Rangliste-Kategorie und ein Chip auf Visitenkarten. Es ist eine **zweite Liga** neben dem Duell-Rating, und beides gleichzeitig trägt der Kreislauf nicht.
- **Vorschlag:** raus: Liga-Punkte, Marken, Marken-Laden. **Bleibt:** alles, was Spieler schon gekauft haben (Kosmetik, Flaggen, Pets).
- **Spielstände:** `dlBest`, `dlRating`, `dlMarksTotal`, `dlOwned` bleiben als tote Felder bzw. Besitz. `dlMarks` (Guthaben) wird erstattet, Richtung Meersplitter (Regel 3). Die `dl_`-Freischaltungen (`cosmetics.js`, `shipparts.js`) dürfen nicht verschwinden. Rangliste: Kategorie aus `LB_CATS`/`MAIN` nehmen, Text „Rang gibt es jetzt in der Dungeon-Liga“ (`render.js`) anpassen. Keine Migration in Supabase nötig, die Felder sind optional (`online.js`).
- **Hängt dran:** Gemütlichkeit (Skillpunkt-Posten, 3.2). Die zwei Laden-Pets sind danach nirgends mehr erwerbbar, dann anders vergeben (z. B. als Album-Belohnung), offen.

### 3.9 Offene See: raus
- **Tut:** Ein Routenknoten wird zur kleinen 6×4-Seekarte mit Funden, Stürmen und Gold (`js/engine/opensea.js`, `js/ui/opensea.js`, `js/data/opensea.js`, zusammen etwa 500 Zeilen).
- **Spürbar:** nein, tot. `chance: 0` seit 21.10. (Patchnote 2026-10-21g), taucht nicht mehr als Routen-Wahl auf.
- **Vorschlag:** raus, die Dateien löschen. Das ist der sauberste Fall der ganzen Liste.
- **Spielstände:** kein Profilfeld. Betroffen sind nur `run.sea` und `run.phase = 'sea'` in alten, laufenden Runs sowie Replay-Aktionen `{type:'sea'}`. Notausgang: Phase `sea` auf `map` setzen. Die `'sea'`-Zweige in `run.js` bleiben als Notausgang oder werden dazu umgebaut. Dateien aus `tools/bundles.json`.

### 3.10 Seekarte: raus
- **Tut:** Eigene 8×9-Karte im Hauptquartier. Pro Fahrt 6 Proviant, der Nebel lichtet sich dauerhaft, Treibgut, Ereignisse und Gerüchte, und die Landgang-Orte werden gefunden, wenn man daneben anhält (`js/engine/seekarte.js`, `js/ui/seekarte.js`, `js/data/seekarte.js`, etwa 700 Zeilen).
- **Spürbar:** als **Umweg**. „Landgang“ öffnet zuerst die Seekarte, die Orte-Liste ist einen Tipp entfernt. Neulinge starten mit leerer Karte, Altspieler haben alles „gefunden“.
- **Vorschlag:** raus als eigenes Spiel. Landgang-Orte werden direkt gewählt, freigeschaltet wie bisher nach Insel-Fortschritt. Hinweis: `PLAN-FOLGEN.md` plant die Seekarte später als Welt-Karte mit Logbuch-Markierungen. Diese Planung würde neu gedacht.
- **Spielstände:** `profile.sk` bleibt als totes Feld (der Merge in `meta.js` kann es ignorieren). `GL.seekarte.allowed` (`dungeon.js`) auf „immer erlaubt“ stellen, danach ist die Karte überflüssig. Berry und Meersplitter aus Funden liegen schon im Profil, nichts zu erstatten. Nicht verwechseln: `worldmap.js` und `livemap.js` gehören nicht dazu.

### 3.11 Pets: behalten
- **Tut:** 21 Tiere. 16 als Inselbeute (45 % pro Sieg über Bösewicht oder Boss), 3 als Album-Belohnung, 2 im Marken-Laden. Reine Optik, kein Einfluss auf Kämpfe. Das Tier tanzt im Hafen auf dem Schiff.
- **Spürbar:** ja (Fund-Pop-up, Album, Hafen). Ein Sammelspaß ohne Zahlen-System, also genau das, was Seele hat.
- **Vorschlag:** behalten.
- **Spielstände:** keine Änderung (`profile.pets`, `cos.pet`). Nur die Frage der zwei Laden-Pets (siehe 3.8).

### 3.12 Crew-Gefühle: behalten
- **Tut:** Pro Figur „froh“ (+1 Tempo für 2 Kämpfe; Auslöser Lieblingsessen bei der Rast, bester Schaden im Bosskampf, 3 Wahlen) oder „erschöpft“ (−20 % Höchstleben im nächsten Kampf nach 2× K.o. ohne Rast; nie der Kapitän, höchstens eine Figur). Verstimmt, Streit und Steg-Gespräch sind noch nicht gebaut.
- **Spürbar:** Bild und Spruch ja (Gesicht, Abzeichen, Sprüche, Chips). Die Regel dahinter kaum: laut `PLAN-GEFUEHLE.md` liegt die Siegquote im Rauschen (±1,5 Punkte).
- **Vorschlag:** behalten, weil Gesicht und Sprüche Seele haben. Die Regel ist jederzeit ohne Replay-Bruch abschaltbar (über `run.start.herz`), falls sie stört.
- **Spielstände:** nur `profile.seenHerz`, sonst alles in der Fahrt.

### 3.13 Weltgedächtnis: zusammenlegen mit Folgen, tote Teile raus
- **Tut:** `profile.world = { bekannte, orte, ruf, taten }` (`js/engine/gedaechtnis.js`, 77 Zeilen). Geschrieben wird nur `bekannte`, und zwar am Ende einer Folge. `orte`, `ruf` und `taten` haben keinen Schreiber, `profile.lastMerk` hat keinen Leser. Es gibt kein Logbuch und keine Anzeige.
- **Spürbar:** fast nicht. Nur das Siegel „Das merkt sich die Welt“ an Folgen-Wahlen und die Erinnerungsblase beim Wiedersehen.
- **Vorschlag:** Zusammenlegen mit den Folgen (3.14) zu einer kleinen „Folgen merken sich“-Liste. **Raus:** die toten Teile `orte`, `ruf`, `taten` und `lastMerk`.
- **Spielstände:** kein Risiko. `clean` verwirft Unbekanntes, die toten Felder fallen beim nächsten Speichern von selbst weg. `bekannte` und `run.start.world` bleiben wie heute.

### 3.14 Folgen: behalten
- **Tut:** In rund 40 % der Insel-Kapitel startet ein Mehrteiler (3 Teile, Wahlen setzen Flags, Teil 3 hat Varianten). Dazu das Wiedersehen: 11 Folgen, 23 Szenen, 4 Bekannte. Maximal eines pro Fahrt.
- **Spürbar:** der Mehrteiler ja (Szene, Sprechblasen, Wahlen). Das Wiedersehen ist selten, wie selten, ist nicht gemessen.
- **Vorschlag:** behalten. Eigene Idee, Texte mit Witz, das ist das Gegenteil von „aus der Liste aufgefüllt“.
- **Spielstände:** nur in der Fahrt (`run.epi`, `run.epSeen`), im Profil nur `world.bekannte`.

### 3.15 Kampf-Zustände: zusammenlegen, Frost, Schock und Blind raus
- **Tut:** 10 Zustände (`js/data/abilities.js`): Furcht, Betäubt, Blutung, Gift, Brand, Geschwächt, Mut, Frost, Schock, Blind. Drumherum ein Regelwerk: 4 Reaktionen, Unterbrechen-Balken, Fokus, Heiler-Regel, Ulti-Regeln.
- **Spürbar:** Sieben Zustände haben Chip, Pixel-Effekt und viele Quellen. **Frost, Schock, Blind** haben nur Chip und jeweils 1 bis 2 Quellen (Ultis von Aokiji, Nami und Enel, Kizaru), keinen Pixel-Effekt. Ihre Reaktionen (Zersplittern, Dampf) sind selten.
- **Vorschlag:** Frost, Schock und Blind raus samt den Reaktionen Zersplittern und Dampf. Die vier betroffenen Ultis bekommen vorhandene Zustände (Zuordnung schlägt der Bauauftrag vor). Blutung, Gift und Brand bleiben (gleicher Tick, aber eigene Bilder, und sie tragen die Reaktion Explosion). Fokus, Heiler-Regel, Unterbrechen-Balken und Ulti-Regeln bleiben, die fasst „Kämpfe offen“ ohnehin an.
- **Spielstände:** keine Profilfelder (nur `settings.autoUlt`). **Aber:** Das ändert Kampfausgänge und damit alte Replays und Ranglisten-Replays. Deshalb nur mit eigenem Versions-Flag (`run.start.kampf`, wie `ramp` und `herz`). Blind zieht nur bei aktivem Blind eine Zufallszahl, der Zufallsstrom verschiebt sich also nur in Kämpfen mit Blind (Regel 5).
- **Reihenfolge:** erst nach „Kämpfe offen“, beide fassen `battle.js` an.

## 4. Abhängigkeiten und Reihenfolge
Vorschlag, jeder Punkt ein eigener Bauauftrag auf eigenem Zweig (Opus für Engine und Spielstand, Sonnet für reine Anzeige):
1. **Ohne Spielstand-Risiko zuerst:** Offene See (3.9), tote Gedächtnis-Felder (3.13).
2. **Kette Landgang, Seekarte, Liga:** erst Seekarte (3.10), dann Dungeon-Liga mit Marken-Laden (3.8, Marken erstatten, `dl_`-Freischaltungen bleiben).
3. **Gemütlichkeit (3.2)** nach der Liga, weil der Marken-Laden Skillpunkte verkauft.
4. **Figurenreise (3.3 und 3.4):** Meisterschaft in die Formen-Ansicht ziehen, Gold-Kampfwirkung ausschalten.
5. **Mit Häppchen 4:** Schatzkammer (3.5) und Run-Items der Schmiede (3.6) in die Stammcrew-Ausrüstung.
6. **Nach „Kämpfe offen“:** Kampf-Zustände (3.15).

Gilt für alles: Antwort „raus“ heißt nur „darf raus“. Gebaut wird erst, wenn Felix den Bauauftrag freigibt, und jeder Schritt ist einzeln live-schaltbar.

## 5. Klick-Entscheidungen (Felix, 29.10.)
Antworten werden nach der Klick-Runde hier eingetragen.

| Nr. | Raus | Vorschlag | Antwort |
|---|---|---|---|
| 1 | Gemütlichkeit (Skilltree, Feinschliff, Marken-Skillpunkte) | raus | offen |
| 2 | Meisterschaft: Gold-Kampfwirkung | raus, Rest in Formen | offen |
| 3 | Schatzkammer: Artefakte als eigenes System | raus, Ideen in Ausrüstung | offen |
| 4 | Schmiede: Run-Items als eigene Beute-Sorte | raus, in Ausrüstung | offen |
| 5 | Dungeon-Liga mit Marken-Laden | raus | offen |
| 6 | Offene See | raus (löschen) | offen |
| 7 | Seekarte | raus (Landgang direkt) | offen |
| 8 | Weltgedächtnis: tote Felder | raus | offen |
| 9 | Kampf-Zustände: Frost, Schock, Blind | raus | offen |

## 6. Unklar oder nicht geprüft
- **Werden Replays je nachgespielt?** Im Repo ruft nichts `GL.run.replay` auf. `online.js` lädt `{seed, start, actions}` hoch, ob Supabase oder ein Werkzeug sie prüft, ist unklar. Bis das geklärt ist, gilt Regel 2 (alte `run.start`-Felder lesbar lassen).
- **Wie viele Spieler nutzen was?** Es gibt keine Telemetrie. Aus der Rangliste kennt man 39 Stammcrews, mehr nicht. „Spürbar“ oben ist eine Einschätzung aus dem Code, nicht aus Zahlen.
- **Supabase** wurde nicht gelesen, nur der Code. Es gibt laut Code keine eigene Spalte oder Tabelle für Liga, Seekarte oder Gedächtnis, alles liegt im Profil-JSON (`saves.data`, `scores.data`).
- Umfang der Form-Pixelteile in `sprites.js` und die Zahl der englischen Texte je System sind nicht gezählt.
- Die Umrechnungs-Verhältnisse (Marken, Funde, Items in Meersplitter oder Berry) sind bewusst offen und kommen mit der Bot-Messung beim Bauen.
