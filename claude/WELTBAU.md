# Weltbau: Das eigene Piratenuniversum (Entwurf)

Stand 23.10.2026. Entwurf von Claude (Sonnet) für **Felix zum Lesen und Ergänzen**, gehört zu Idee 1 (Fahrplan Punkt 9). Alles hier ist **Vorschlag**, nichts ist gebaut. Zweck: Die Wellen A bis C (Inseln, Gegner, Figuren) bekommen ein gemeinsames Fundament, damit ein Universum entsteht und nicht nur umbenannt wird. Bestehende Namen aus `js/world/neutral.js` (Ostmeer, Sturmmöwen, Kronrat, Taler …) bleiben die Grundlage.

## 1. Die Welt in drei Sätzen
Die **Große Linie** ist eine Strömung, die einmal um die ganze Welt läuft und alles mitnimmt, was nicht festgebunden ist: Schiffe, Inseln, Gerüchte. Wer ihr folgt, trifft Orte, die beim nächsten Mal anders aussehen, weil die Strömung sie neu mischt (das ist der Grund, warum jede Fahrt anders ist). Am Ende der Linie liegt der **Große Schatz**, über den jeder etwas anderes erzählt, und die **Krone** will ihn finden, bevor es jemand anderes tut.

## 2. Ton
Locker, witzig, gemütlich (Cozy Pixel). Schurken sind schräg statt grausam, Gefahr ist spielerisch. Kurze Sätze, pro Beschreibung ein Augenzwinkern, keine Gewaltdetails, keine Anspielungen auf reale Marken oder Personen.

## 3. Die fünf Meere (Reihenfolge und ids bleiben)
| Meer | Idee | Stimmung | Erkennungszeichen |
|---|---|---|---|
| Ostmeer | Fischerorte, Zoll, kleine Gauner | gemütlich, schelmisch | alles ist klein, jeder kennt jeden |
| Wilde See | Sand, Wolkeninseln, Dschungel | heiß, windig | das Wetter ist eine eigene Figur |
| Gerichtsinsel | Amtssitz der Krone, Türme, Akten | streng, trocken-komisch | für alles gibt es ein Formular |
| Gruselmeer | Nebel, Spuk, Pilzwälder | gruselig-niedlich | die Geister sind höflich |
| Spiegel-Archipel | Blasenwald, Markt aller Meere | bunt, laut | alle Banden an einem Ort |

## 4. Fraktionen (heute 12, Vorschlag: 8 Kerne)
**Sturmmöwen** (die Spielerbande), **Kronwacht** (Ordnungsmacht), **Schattenkorps** (Geheimdienst der Krone), **Barock-Bund** (Intrigen), **Flossenvolk** (Tiefsee und Haifisch-Bande), **Zirkus der Narren** (Chaos mit Schminke), **Die zwei Flotten** (die großen Rivalen auf See), **Freibeuter der Krone** (bezahlte Piraten). Die übrigen heutigen Banden werden Einzelfiguren oder gehen in einer dieser auf. Synergie-Stufen und Werte bleiben, nur Name und Geschichte ändern sich.

## 5. Namensschema
- **Figuren:** ein Vorname mit 1 bis 2 Silben, deutsch klingend, bei Bedarf ein Beiname, der verrät, was sie tun („Kalina, die Schreiberin“). Klangfarbe nach Meer: Ostmeer weich (Nela, Lasse), Wilde See sonnig-hart (Sahir, Tonar), Gerichtsinsel streng (Kalina, Blaun).
- **Orte:** höchstens zwei Wörter, Bausteine (Hafen, Bucht, Kap, Spitze, Turm, Tor, Gasse) plus Eigenschaft (Salz-, Nebel-, Messing-). Das Meer gibt den Baustein-Vorrat vor.
- **Bosse und Schurken:** Name plus Spitzname. Signatur-Angriffe heißen wie ein Ereignis („Sägezahn-Sturm“, „Weißer Rauch“).
- **Verboten:** alles, was wie ein bekannter Name klingt oder daraus abgewandelt ist (auch Anagramme, auch ins Englische übersetzt), und Silhouetten bekannter Figuren. Prüfung: Liste per Skript, dann liest Felix.

## 6. Look-Regeln (Kunst bleibt Felix)
Pro Figur ein Markenzeichen (Hut, Farbe oder Gegenstand), höchstens 4 Accessoires (Regel `safeLook`). Pixel-Regeln stehen im Tag `archiv/gamedesigner`. Jede Fraktion bekommt eine Leitfarbe, damit man sie im Kampf sofort erkennt (Vorschlag: Sturmmöwen Blau-Weiß, Kronwacht Messing-Rot, Schattenkorps Nachtviolett, Flossenvolk Türkis).

## 7. Wellen (nach Felix' Okay, jede Welle live spielbar)
1. **A, Inseln und Meere:** Namen, Texte, Bösewicht-Orte (`islands.js`, Geschichten). Niedrigstes Risiko, sieht man sofort.
2. **B, Gegner und Bosse:** `enemies.js`, `hunted.js`, `bossSigs`, Fähigkeiten-Namen.
3. **C, die 65 Figuren:** Namen, Looks, Formen, Duos. Der große Teil und Felix' Kunst, pro Insel-Gruppe ein Paket (Opus).
4. Erst danach `neutral.js` abbauen (`config.world` und `?welt=` entfallen). ids bleiben immer gleich, Spielstände bleiben gültig.

## 8. Offene Fragen an Felix
1. Passt der Ton, und passt die Strömung, die Inseln neu mischt, als Grundidee?
2. Sollen die Stammfiguren (Sturmmöwen, 9 Köpfe) zuerst ersetzt werden oder zuletzt, weil man an ihnen hängt?
3. Soll die Krone am Ende selbst ein Gegner werden (Gerichtsinsel als Wendepunkt), oder bleibt sie nur Kulisse?
4. Tempo: eine Welle pro Update, oder mehrere im Sammel-Update?

**Antworten (23.10., Felix/Jan per Klick):** 1. Ton und Strömungs-Grundidee passen so · 2. Die Stammfiguren (Sturmmöwen, 9 Köpfe) werden **zuletzt** ersetzt · 3. Die Krone wird am Ende **selbst Gegner** (Gerichtsinsel als Wendepunkt) · 4. Tempo: **mehrere Wellen im Sammel-Update** (nicht eine pro Update, abweichend von der Empfehlung). Damit sind die Wellen A bis C freigegeben, **noch nichts gebaut**, Start mit Welle A (Inseln und Meere).

**Ergänzung (23.10., Jan per Klick):** Welle C (die 65 Figuren) entsteht gleich im **neuen Raster 24 × 30** mit Umrisslinie, Blinzeln, Atmen, Gefühlen im Gesicht und Angriffsposen. Details: `claude/PLAN-PIXEL.md`.

**Stand Welle A (24.10., Felix/Jan per Klick):** gebaut auf `feature/weltbau-a`. Zuordnung: Ostmeer, Wilde See (Nebenroute **Tiefsee**, Heimat des Flossenvolks), Gerichtsinsel (Nebenroute **Gruselmeer**), der **Spiegel-Archipel** ist die große Insel am Ende des Gruselmeers. Prüfskript: `tools/weltbau-check.py`.

**Stand Welle B (24.10., Felix/Jan per Klick):** gebaut auf `feature/weltbau-b` nach `claude/WELTBAU-B.md` (von Felix abgesegnet). Prüfskript Liste B: 0 Funde. Namen überall neu, Raid-Bosse gehören zur Krone, Fußvolk mit dabei.

**Stand Welle C (24.10., Felix per Klick):** In vier Paketen: **C1** Namensliste `claude/WELTBAU-C.md` zum Lesen (Namen der 56 Figuren ohne die 9 Sturmmöwen, Fähigkeiten, Ultis, Team-Aktionen, Duos, Kombos, Fraktionen), **C2** Namen einbauen (nur Texte, ids bleiben), **C3** Pixel-Probe 24 × 30 an 3 Figuren als Board, **C4** Looks pro Fraktion, Sturmmöwen zuletzt. Entschieden: **Start mit C1**, **alle 56 in einer Liste**, **12 Banden werden zu den 8 Fraktionen** aus Abschnitt 4 (Synergie-Stufen und Werte bleiben, nur Name und Geschichte). Noch nichts gebaut.
