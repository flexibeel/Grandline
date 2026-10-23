# Hafen Schritt 1: Skizze (Idee 2, nur Umordnen)

Stand 23.10., nichts gebaut. Freigegeben ist nur Schritt 1. Schritt 2 (Exkursion als Fahrttyp) und Schritt 3 (Pirat als wählbare Figur) sind spätere Richtung, hier bewusst nicht drin.

## 1. Zielbild
Wer den Hafen öffnet, sieht oben weiter die Steg-Szene mit „Leinen los!“ und darunter statt 12 kleiner Holzschilder **vier große Gebäude**: Kontor, Taverne, Dock, Auftragstafel. Ein Tipp öffnet das Gebäude, oben schaltet man zwischen seinen Räumen um (wie heute bei Crew/Hafen-Gruppe). Alles darin gibt es schon, es wohnt nur ordentlicher; der eigene Pirat bleibt Kapitän, Spielstand und Run bleiben gleich.

## 2. Wireframes (390 px)
```
Frischer Spieler (0 Runs)          Viel Fortschritt
+--------------------------------+ +--------------------------------+
|[Pirat] Tester     | 0 Taler    | |[Pirat] Jan  Rang 9 | 48.210    |
+--------------------------------+ +--------------------------------+
| ~ Steg-Szene, Crew, Schiff ~   | | ~ Steg-Szene ~  An Bord: [][]  |
| [====== Leinen los! ======]    | | [====== Leinen los! ======]    |
| Nächstes Ziel: Axt-Hand  >     | | Nächstes Ziel: ...  >          |
+--------------------------------+ +--------------------------------+
| IM HAFEN                       | | IM HAFEN                       |
| +------------+ +------------+  | | +------------+ +------------+  |
| | [Schiff]   | | [Zettel]   |  | | | [Schiff] * | | [Zettel] * |  |
| | Dock       | | Auftrags-  |  | | | Dock       | | Tafel      |  |
| | Ablegen    | | tafel      |  | | | Werft·Skil | | 2 abholen! |  |
| |            | | 3 offen    |  | | | Endlos·Tag | | Raid-Ziel  |  |
| +------------+ +------------+  | | +------------+ +------------+  |
| +------------+ +------------+  | | +------------+ +------------+  |
| | ░ Kontor ░ | | ░Taverne ░ |  | | | [Truhe] *  | | [Wirtin]   |  |
| | ░ zu  🔒 ░ | | ░ zu  🔒 ░ |  | | | Kontor     | | Taverne    |  |
| | ░░░░░░░░░░ | | ░░░░░░░░░░ |  | | | 🟧 340 voll| | Gerücht:...|  |
| +------------+ +------------+  | | +------------+ +------------+  |
| Logbuch / Hafengerücht         | | Ab Rang 10: ...  [====---]     |
+--------------------------------+ +--------------------------------+
| Hafen | Tafel | Kapitän        | |Hafen| Tafel |Taverne |Kapitän |
+--------------------------------+ +--------------------------------+
Gebäude offen (z. B. Kontor) → Raum-Kopf mit Umschalter:
| ‹ Hafen   [Truhe] Kontor   48.210  ✕ |
| [Kontor][Lager][Kammer][Schmiede]    |   (nur offene Räume, wie roomHead heute)
```
Gesperrt = Gebäude mit geschlossenen Fensterläden, nur „zu“, **ohne** Rang-Hinweis (Neulings-Modus zeigt unter 6 Runs keine Vorschau, `featureNextLine`).

## 3. Heute → Neu
| Heute (Raum-id / Kachel) | Wo heute | Neu |
|---|---|---|
| Leinen los, Deck (Crew aufstellen), An Bord, Kopfgeld-Stufe | Steg-Szene | **bleibt** oben (gehört zum Dock) |
| Nächstes Ziel (`worldmap.goalCard`) | Szene | **bleibt** oben |
| `werft`, `gemuet` (Skills), `haendler` (Proviant) | Kacheln, Gruppe „hafen“ | **Dock** |
| Endlos, Tageskarte (`actionDock`) | Szene | **Dock** (Knöpfe im Dock-Kopf) |
| `kontor` (+ Figurenreise/Dojo darin), `lager` (+ Vitrine), `kammer`, `schmiede` | Kacheln, Gruppen „hafen“/„crew“ | **Kontor** |
| `stammcrew`, `rangliste` (Duelle, Freunde-Karten) | Kacheln + Tab „Crew“/„Rangliste“ | **Taverne** |
| Hafengerücht (`harborNews`) | unten | Untertitel der Taverne-Kachel, Logbuch **bleibt** unten |
| `auftraege`, `gemeinschaft` (Welt-Boss), Raid-Jagd, Landgang/Seekarte (`actionDock`) | Kacheln + Szene | **Auftragstafel** |
| `profil` (Kapitänsbuch) | Kachel + Tab | **bleibt** Tab „Kapitän“, Kachel entfällt |
| Taverne im Run (`recruit`, Hafentaverne) | Run | **bleibt** unverändert (Anheuern im Hafen = Schritt 2) |
Neu nur als Hülle: die vier Gebäude-Kacheln und die Gruppen-Zuordnung. Kein neuer Raum, keine neue Aktion.

## 4. Was berührt würde
- `js/ui/render.js`: `ROOMS` (nur Zuordnung), `ROOM_GROUPS` (aus crew/hafen werden kontor/taverne/dock/tafel), neues `AREAS` + `areaOpen(profile, id)` = „irgendein Raum der Gruppe offen“ (Dock/Tafel immer). `hubTiles` → 2×2 Gebäude, `roomHead` (Umschalter, Dock-/Tafel-Knöpfe), `crewRoom`/`groupOf`, `tabAlert` (Punkt pro Gebäude), Tab-Leiste im Render-Teil (~Z. 5423), `hq()` nur Reihenfolge (actionDock wandert).
- `js/main.js`: `hq-tab`/`hq-home` nur, falls ein Gebäude-Klick einen Raum wählt (`ui.crewLast` → pro Gebäude merken, nur `ui`, nicht Profil).
- `css/style.css`: Gebäude-Kacheln, gesperrter Zustand, Querformat-Regel ~Z. 8896 (erzwingt 4 Spalten).
- `js/ui/i18n.js`: neue Wörter (Dock, Auftragstafel, Taverne, „zu“), `js/world/neutral.js` gegenprüfen.
- **Nicht angefasst:** `run.js`/Run-Ablauf, `meta.js`-Regeln (`featureOpen`, `features.js`), Profil/Spielstand und Cloud-Merge, `online.js`, Kampf, Kontor-Engine, Seekarte/Landgang-Logik, `deck.js`.

## 5. Risiken, Fallen, Prüfliste
- **`featureOpen` gibt bei unbekannter id `true`**: Gebäude-ids nie durch `featureOpen` schicken und **nicht** in `features.js` eintragen, sonst Pop-up-Flut über `featuresNew`/`featureCheck`.
- **Sprungziele bleiben Raum-ids**: Freischalt-Pop-ups und „Erste Funde“ öffnen `f.tab` (main.js ~Z. 440). Raum-ids nicht umbenennen, dann landet man automatisch im richtigen Gebäude.
- **`hq()` fällt auf `profil` zurück**, wenn ein Raum zu ist; das muss so bleiben.
- **Tab-Leiste**: heute 5 Plätze, filtert nach `featureOpen`; Crew-Knopf hängt an `ROOM_GROUPS.crew`. Umbau der Gruppen bricht das, wenn nicht mitgezogen.
- **Frischer Spieler**: `werft` ist bei 0 Runs extra versteckt (`fresh`), Dock muss trotzdem sinnvoll aussehen. Coach (Nami) läuft nur im Run, Story/Gruß-Pop-ups (`featureCheck`) unberührt lassen.
- **Streamer-Modus**: Taverne zeigt Rangliste/Freunde, Namen-Ausblenden (`body.streamer`) muss weiter greifen. **Vorschau** im Run (`peek`) zeigt `hq()` mit, dort keine Gebäude.
- **Querformat/Desktop**: 2×2 darf nicht zu riesig werden, ab ~900 px 4 nebeneinander.
- Prüfliste: 390 px ohne waagerechtes Scrollen · DE/EN · Hell/Dunkel · `?welt=neutral` (Taler, Namen) · frischer Spieler, mittel (Kontor offen), voll · Pop-up „Zum Raum“ landet richtig · Esc/‹ Hafen · roter Punkt am richtigen Gebäude.

## 6. Häppchen
1. `feature/hafen-gebaeude` A: `AREAS`, Gruppen neu, `hubTiles` als 4 Gebäude, `roomHead`-Umschalter. **M, Opus.**
2. B: Tab-Leiste (Hafen · Tafel · Taverne · Kapitän), `crewRoom`/`tabAlert` pro Gebäude. **S–M, Opus** (Fallen oben).
3. C: CSS gesperrt/Querformat, Texte DE/EN, neutral-Check. **S, Grok nach Muster** (Claude prüft).
4. D: kleine Pixel-Schilder für die vier Gebäude (Truhe, Wirtin, Schiff, Zettel gibt es schon; eigenes Schild nur wenn Felix will). **S, Opus/Felix.**

## 7. Fragen an Felix
1. **Gesperrte Gebäude für Neulinge?** (a) Zeigen, aber mit Fensterläden und nur „zu“ *(empfohlen)* · (b) Ganz ausblenden, bis offen · (c) Zeigen mit „Ab Rang X“.
2. **Tab-Leiste unten?** (a) Hafen · Tafel · Taverne · Kapitän *(empfohlen)* · (b) Bleibt wie heute (Hafen · Aufträge · Crew · Rangliste · Kapitän) · (c) Nur Hafen · Kapitän.
3. **Wohin mit Endlos und Tageskarte?** (a) Ins Dock (Fahrtarten) *(empfohlen)* · (b) Auf die Auftragstafel · (c) Bleiben in der Steg-Szene.
4. **Schmiede?** (a) Ins Kontor (Beute) *(empfohlen)* · (b) In die Taverne zur Stammcrew.

**Antworten (23.10., Felix/Jan per Klick, alle wie empfohlen):** 1. Gesperrte Gebäude zeigen, mit Fensterläden und nur „zu“ · 2. Tab-Leiste Hafen · Tafel · Taverne · Kapitän · 3. Endlos und Tageskarte ins Dock · 4. Schmiede ins Kontor. Damit ist Schritt 1 freigegeben, Bauen mit Opus, Zweig `feature/hafen-gebaeude`, Häppchen A zuerst.
