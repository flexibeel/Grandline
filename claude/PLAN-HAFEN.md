# Der Hafen wächst: Skizze

Stand 29.10.2026, **nichts gebaut**, nur Skizze. Zweig `feature/hafen-skizze` (von `feature/neuausrichtung`). **Alle offenen Punkte per Klick entschieden (60. Chat, Abschnitt 6)**, Eintrag im `FAHRPLAN.md` (Warteschlange Punkt 0 und Planungs-Tabelle).

Gelesen: `FAHRPLAN.md` (Jans Idee 2), `PLAN-NEUGEWICHT.md`, `HAFEN-SKIZZE.md` (Schritt 1), Design-Fläche „Grand Line: Gesamtplan“ (Tafeln Kontor, Was wohin fließt, So passt alles zusammen, Seltenheiten & Taverne; die Fläche wurde nur gelesen), Code `js/engine/kontor.js`, `crewgear.js`, `meta.js`, `js/data/roles.js`.

## 1. Entscheidung (Felix, 29.10.)

Grundlage, per Klick am Morgen:
- Der Hafen wird eine **kleine Pixel-Siedlung im Stil von Banished, aber ohne Hunger, Sterben, Jahreszeiten**.
- **Die Crew lebt sichtbar dort.** Gebäude kosten Beute.
- **Exkursionen, beides:** selbst fahren (Runs bringen Baumaterial und Ausrüstung) und Trupps offline losschicken (Grundmaterial).

Vier Klick-Runden danach (alle Antworten von Felix, 29.10.):

| Frage | Antwort |
|---|---|
| Größe | **Mittel, 12–15 Häuser** |
| Platzierung | **Frei im Raster**, wie Banished |
| Die vier Hafen-Gebäude von Schritt 1 | **Siedlung ersetzt das Menü ganz** |
| Neue Häuser (zuerst gedacht) | **Wohnhäuser der Crew, Trupp-Steg, Werkstatt** |
| Baustoffe | **Vorhandene Stoffe nutzen** (Grundmaterial = Bernstein, Baumaterial = Meersplitter) |
| Was ein Haus kostet | **Material plus zerlegte Ausrüstung** |
| Trupp losschicken | **Ein Auftrag je Trupp, Ziel wählbar** |
| Wer im Trupp zählt | **Die Rolle** |
| Bernstein: Kontor und Trupps | **Kontor wird zum Trupp-Haus** (stündliche Rate fällt weg) |
| Meersplitter: Würfeln und Bauen | **Eine Quelle, eine Entscheidung** |
| Werkstatt | **Darf stärker machen: Effekte aufwerten** |
| Trupp unterwegs | **Unterwegs ist unterwegs**, nicht im Deck |
| Erstes Häppchen | **Beides in einem kleinen Schnitt** |
| Reihenfolge | **Nach Ausrüstung mit Effekten** |
| Blickwinkel | **Mischung:** Häuser schräg, Figuren seitlich/vorn |
| Werft und Gemütlichkeit | **Werden Haus-Stufen** |

Wo das gegen meine Empfehlung ging (kleiner, feste Bauplätze, Menü bleibt, nur Kopfzahl-Trupps), steht die Folge unten in Abschnitt 5. Es bleibt bei deiner Wahl.

## 2. Abgleich

### Jans Idee 2 (Fahrplan, „Vom eigenen Piraten zum eigenen Hafen“)
- **Schritt 1** (Hafen ordnen: vier Gebäude Kontor, Taverne, Dock, Auftragstafel) ist live seit 24c. Die Siedlung ist sein Ausbau: aus den vier Kacheln werden Häuser auf einem Bild.
- **Schritt 2** (Exkursion als eigener Fahrttyp: Auftrag von der Tafel, Team aus Taverne-Angeboten, Beute ins Kontor) ist **nicht** das, was du willst. Dein „selbst fahren“ bleibt der heutige Run, nur dass er Baumaterial heimbringt. Deine Trupps sind etwas Neues daneben (offline).
- **Schritt 3** (Pirat wählbar statt Pflicht-Kapitän, der riskante Teil) bleibt draußen. Der eigene Pirat bleibt Kapitän.

### Gesamtplan
- **Handelsfahrten** (Tafel Kontor: „Maats segeln 4–12 h, Rolle zählt, Ertrag Steine und Vorräte“) sind dein Trupp. Gebaut ist davon nichts. Ich nehme von dort die **Dauer 4–12 h** und „Rolle zählt“.
- **Saphir, Rubin, Marktpreis, Wanderhändler, Handelspartner, Kombüse mit Vorräten, Schiff aus vier Teilen** (Tafel Kontor, Was wohin fließt): bleiben **draußen**. Sie würden aus der Siedlung ein Warenlager machen. Wer sie später will, braucht eine eigene Idee und ein Okay.
- **Regel „Jede Ware hat einen Zweck, eine Quelle, ein Ziel, eine Bremse“** (Was wohin fließt): ist erfüllt, weil es **keine neue Währung** gibt. Bernstein und Meersplitter haben schon Zwecke. Neu ist nur, dass sie auch Häuser bauen.
- **Regel „Kontor erzeugt nie Kampfkraft“** (Gesamtplan, `PLAN-NEUGEWICHT.md` Abschnitt 7): fällt für **die Werkstatt** (Effekte aufwerten). Das ist eine Ausnahme von dir. Das Kontor-Haus selbst erzeugt weiter keine Kampfkraft.
- **Regel „Warten bringt Steine, Spielen bringt Marken und Fortschritt“:** Trupps sind „Warten bringt Material“. Marken (Dungeon-Marken) und Kampfkraft kommen weiter nur aus Runs und Duellen. Trupps bringen keine Marken.

### Funde im Code, die die Skizze ändern
- **Rollen gibt es nur drei:** Kämpfer (34 Figuren), Brecher (17), Helfer (14), `js/data/roles.js`. Navigator, Kanonier, Koch aus dem Gesamtplan sind im Spiel **nicht** vorhanden. „Rolle zählt“ geht also nur mit diesen dreien. Siehe Abschnitt 3 (Ziele wollen eine Rolle).
- **Stammcrew hat 4 Plätze** (`GL.meta.squadSize`). Das Deck hat 6 (Budget 45). „Die Crew lebt dort“ muss sich auf mehr Figuren beziehen als die Stammcrew, sonst ist die Siedlung leer. Offen, siehe 6.
- **Bernstein hat heute zwei Zwecke:** Stil-Dojo (20) und Landgang auffrischen (20). Beide bleiben. Kommt Bernstein jetzt nur aus Trupps, wird er knapper.
- **Meersplitter** kommen aus Runs (je Meer-Tiefe), aus Zerlegen und der Tagesgabe. Sie würfeln heute Zusatzwerte neu. Das konkurriert jetzt mit dem Bauen, gewollt (eine Quelle, eine Entscheidung).
- **Zerlegen** liefert heute Taler, Meersplitter und Proviant (`crewgear.js`). „Haus kostet zerlegte Ausrüstung“ heißt: Teile aus dem Lager werden dafür **verbaut** (zerlegt), ohne Rückgabe.

## 3. Die Skizze

### Das Bild
```
Schräg gebaute Häuser, Figuren seitlich/vorn davor, frei platzierbar im Raster

         ┌── Werkstatt ──┐      Taverne
      ╱╲ │               │     ╱╲
     ╱__╲│     ·  ·      │    ╱__╲        Wohnhaus  Wohnhaus
   Kontor/Trupp-Haus  ·  ·  Auftragstafel   ╱╲        ╱╲
  ═══╤═══   Weg        Dock               ╱__╲      ╱__╲
     │ Steg ─────── ~~~~ Meer ~~~~
   (Trupps legen hier ab und an)

Oben: Taler · Bernstein · Meersplitter        Unten: [Bauen] [Trupp] [Kapitän]
```
Das ist nur die Anordnung. Echte Bilder sind Opus-Arbeit nach einer Pixel-Probe (Häppchen A).

### Häuser (Ziel 12–15, gedacht sind erst 8–9)
Von deiner Liste und dem Bestand. Jedes Haus braucht seine **eigene Idee**, nichts wird aufgefüllt (Regel gegen das KI-Gefühl). Die Zahlen darunter sind Platzhalter, kein Balancing.

| Haus | Woher | Was es tut | Offen |
|---|---|---|---|
| Kontor / Trupp-Haus | Bestand | Räume Dojo, Lager, Vitrine, Schmiede bleiben. **Neu:** die Stufe 1–20 bestimmt Lagergröße und Trupp-Plätze statt der stündlichen Rate | Lesart, siehe 6 |
| Taverne | Bestand | Stammcrew, Rangliste, Freunde (wie heute) | |
| Dock | Bestand | Schiff, Upgrades, Endlos, Tageskarte. **Werft und Gemütlichkeit** werden Stufen hier (Haus-Stufen) | Migration, siehe 5 |
| Auftragstafel | Bestand | Raids, Bosse, Gemeinschaft, Landgang, Seekarte | |
| Trupp-Steg | Teil des Kontor-Hauses | Hier legen Trupps ab, hier landen ihre Funde, bis du sie abholst | entschieden: kein eigenes Haus (6.1) |
| Wohnhaus (mehrere) | neu | Hier wohnt die Crew sichtbar, jedes Haus gibt Betten | entschieden: Mitgefahrene, so viele wie Betten (6.2) |
| Werkstatt | neu | Effekte der Ausrüstung aufwerten (nach „Ausrüstung mit Effekten“) | was genau, wie teuer |
| weitere 3–6 | offen | **bewusst leer.** Nur wer eine eigene Idee hat (Felix, Jan, klar begründet), bekommt hier ein Haus | |

### Der Kreislauf
```
     RUN (selbst fahren)                        TRUPP (offline)
  bringt Ausrüstung + Meersplitter          bringt Bernstein (Grundmaterial)
          │                                          │
          ▼                                          ▼
  Ausrüstung ──zerlegen──► Meersplitter      Lager am Steg (Grenze, wie Kontor heute)
          │                       │                    │
          │ (ausgerüstet:         │                    │
          │  zählt im Duell)      ▼                    ▼
          │                  HAUS BAUEN = Meersplitter + Bernstein + zerlegte Ausrüstung
          │                            │
          └───────────────────► Werkstatt: Effekte aufwerten ──► Ausrüstung stärker
                                                                       │
                                                                       ▼
                                                            Duell, Run: Beute zählt
```
- **Runs** liefern weiter Meersplitter und Ausrüstung. Neu ist nur, dass beides auch Häuser trägt.
- **Trupps** liefern das Grundmaterial. Es wartet am Steg, bis du es abholst, mit Lager-Grenze (wie heute das Kontor, `capHours`).
- **Ein Haus kostet** Baumaterial (Meersplitter) und Grundmaterial (Bernstein) und **ein bis drei zerlegte Ausrüstungsteile**. Welche Seltenheit und wie viele, ist Platzhalter. Verbaut werden **nur Teile aus dem Lager**, nie ausgerüstete.
- **Das ist die spürbare Entscheidung:** Ein gutes Teil zerlegen und ein Haus bauen oder anziehen und im Duell nutzen. Die Werkstatt schließt den Kreis, weil sie dasselbe Teil später aufwertet.

### Trupps
- **Ein Auftrag je Trupp, Ziel wählbar.** Jedes Ziel ist ein eigener Ort mit eigener Dauer (4–12 h), eigenem Ertrag, **eigener Wunsch-Rolle** (Kämpfer, Brecher oder Helfer). Das ist unser „Rolle zählt“ mit nur drei Rollen: Ziel A will einen Brecher, Ziel B einen Helfer. Passt die Rolle, wird es schneller oder ergiebiger.
- **Ziele werden frei erfunden, nicht piratig** (`PLAN-NEUGEWICHT.md` Abschnitt 8), jedes mit einem eigenen Satz und Witz. **Platzhalter**, noch nicht festgelegt: Möwenkolonie sammeln, ein altes Wrack abklopfen, bei der Kronwacht aushelfen. Wer die echten Ziele schreibt, entscheidet Felix, nicht eine Liste.
- **Kein Sterben, kein Hunger.** Risiko ist nur Zeit: Wer unterwegs ist, fehlt im Deck und in der Stammcrew. Kommt zurück, immer.
- **Offline-Zeit läuft über die Geräteuhr** wie beim Kontor heute (Schummeln per Handyuhr möglich, hier egal, weil nur Material und kein Bestenlisten-Wert).

### Crew sichtbar
Figuren laufen auf Wegen zwischen den Häusern, sitzen vor der Taverne, **legen am Steg ab, wenn ein Trupp startet, kommen zurück, wenn er fertig ist**. Beim Bauen stehen sie am Bauplatz. Das ist die ganze Lebendigkeit ohne Hunger und Sterben. Mehr nicht, solange keine eigene Idee dazukommt.

## 4. Technik in Kürze (nur Hinweise, nichts gebaut)
- **Neues Spielstand-Feld**, etwa `profile.hafen = { houses: [{ k, x, y, lvl }], trupps: [{ ziel, figs, t0, dauer }] }`. Muss in den Cloud-Merge (`meta.js` ~Z. 177). Regel zum Zusammenführen: Häuser nach Stufe, Trupps nach Startzeit. **Run, Replay und Duell bleiben unberührt**, nur Profil.
- **Kontor-Stand wandert:** `profile.kontor.lvl` bleibt, die stündliche Rate (`K.rate`) fällt weg. Bis zum Umstellen aufgelaufenes Bernstein wird einmal gutgeschrieben, **nichts verfällt**.
- **Werft/Gemütlichkeit:** `profile.upgrades` und die Skill-Stufen bleiben als Werte erhalten, nur die Oberfläche zieht ins Dock-Haus. Werte dürfen nicht ändern.
- **Menü ersetzt:** Die Raum-ids (`werft`, `kontor`, `lager`, …) **nicht umbenennen**. Freischalt-Pop-ups und „Erste Funde“ springen darauf (`f.tab`). Haus-ids nie durch `featureOpen` schicken, sonst Pop-up-Flut (alle Fallen in `HAFEN-SKIZZE.md` Abschnitt 5, gelten weiter).
- **Raster am Handy:** Platzieren per Antippen und Ziehen, Zellen aus Zahlen, Prüfung auf Überlappung. Ein Fehler hier sieht man sofort.
- **Texte DE/EN.** Neu Erfundenes braucht keinen `neutral.js`-Eintrag (Plan-Abschnitt 8).

## 5. Folgen deiner Wahl (wo sie größer sind als meine Empfehlung)
- **12–15 Häuser:** gedacht sind erst 8–9. Der Rest bleibt leer, bis jemand eine Idee hat. Lieber ein halbes Dorf mit Seele als ein volles ohne.
- **Frei im Raster:** deutlich mehr Technik und Fehlerquellen als feste Bauplätze. Dazu braucht jedes Haus Größe und Zellen. Vorschlag für das Häppchen: erst mit **wenigen Zellen und festen Wegen**, Frei-Platzieren im Schnitt als Kern, nicht als Zusatz.
- **Menü ganz ersetzen:** der größte Umbau (Tab-Leiste, Pop-up-Sprünge, Kapitänsbuch). Deshalb nicht im ersten Schnitt, sondern als eigenes Häppchen C (siehe 7). Dein „ganz“ bleibt das Ziel.
- **Mischung im Blickwinkel:** Figuren sind 24×30 und nur vorn/seitlich gezeichnet. Wenn sie sich auf einem schrägen Boden bewegen, wirkt Laufen nach „oben“ im Bild schnell falsch. **Pixel-Probe vor dem Bau** (wie die 24×30-Probe).
- **Werft und Gemütlichkeit als Haus-Stufen:** weniger Systeme, aber Migration und Balance. Vor dem Bauen die Liste „Altes ausmisten“, jedes „Raus“ einzeln per Klick (Felix' Regel, `PLAN-NEUGEWICHT.md` Abschnitt 6). Das hier ist **kein Raus**, die Werte bleiben, nur der Ort wechselt.
- **Werkstatt macht stärker:** bricht „Hafen erzeugt nie Kampfkraft“. Damit hängt die Werkstatt an „Ausrüstung mit Effekten“ (PLAN-NEUGEWICHT Häppchen 4). Ohne Effekte gibt es nichts aufzuwerten, deshalb deine Reihenfolge „nach Effekten“.
- **Zerlegen als Preis:** Ausrüstung, die im Duell zählt, wird zugleich Bauteil. Gewollt (Entscheidung), aber die Preise dürfen Duelle nicht aushöhlen. Messen wie bei Häppchen 2.
- **Trupp unterwegs fehlt im Deck:** Wer die Stammcrew verschickt, hat im Duell weniger Auswahl. **Duell-Crews sind gespeicherte Stände anderer Spieler**, die bleiben, wie sie sind. Für dich selbst als Verteidiger offen, siehe 6.

## 6. Entschieden (Felix per Klick, 29.10., 60. Chat)

| Frage | Antwort | Folge für den Bau |
|---|---|---|
| 1. Kontor und Steg | **Ein Haus** (wie empfohlen) | Der Steg ist der Anlegeplatz des Kontor-Hauses, die Kontor-Stufe ist die Trupp-Stufe (Trupp-Plätze, Lager am Steg). Kein eigenes Steg-Haus, kein zweites Stufen-System. |
| 2. Wer wohnt dort | **Mitgefahrene, so viele wie Betten** (wie empfohlen) | Eine Figur zieht ein, sobald sie einmal auf einer Fahrt dabei war. Wohnhäuser geben Betten, wer keins hat, gilt als „auf See“ und ist nicht im Bild. Bauen lohnt also sichtbar. Braucht eine Merkliste „schon mitgefahren“ im Profil (Herleitung aus vorhandenen Daten prüfen, bevor ein Feld dazukommt). |
| 3. Kosten eines Hauses | **Je Haus eigener Mix** (wie empfohlen) | Jedes Haus hat seinen eigenen Preis aus Meersplittern, Bernstein und zerlegten Teilen, z. B. Wohnhaus vor allem Bernstein, Werkstatt vor allem zerlegte Ausrüstung. Zahlen weiter Platzhalter. |
| 4. Verteidiger-Crew | **Schnappschuss zählt voll** (wie empfohlen) | Trupps schwächen dich beim Verteidigen nicht. Duell-Code bleibt unberührt. |
| 5. Kapitänsbuch | **Fester Knopf unten** (wie empfohlen) | Untere Leiste: [Bauen] [Trupp] [Kapitän]. Kein Kapitänshaus. |
| 6. Lebendigkeit | **Plus Tageszeit** (gegen Empfehlung „nur das Nötige“) | Wege, Ablegen, Bauen **und** Licht nach Geräteuhr (Morgen, Tag, Abend, Nacht mit Laternen). Kein Wetter. Folge: je Haus und Figur ein Farbsatz mehr oder eine Licht-Ebene darüber. **Gehört in die Pixel-Probe A**: ein Haus in zwei Tageszeiten, damit Felix sieht, ob Ebene oder eigene Farben. |

Damit ist die Skizze komplett. Nächster Schritt bleibt laut Abschnitt 7: erst nach PLAN-NEUGEWICHT Häppchen 3 und 4, dann **Häppchen A (Pixel-Probe)**.

## 7. Häppchen (Vorschlag, Reihenfolge nach deiner Wahl)

**Voraussetzung:** PLAN-NEUGEWICHT Häppchen 3 (Duell-Beute) und 4 (Ausrüstung mit Effekten, dazu die Taverne als Ausrüstungs-Halt). Vorher hat Zerlegen und die Werkstatt kein Gewicht.

| Häppchen | Inhalt | Größe | Modell |
|---|---|---|---|
| **A · Pixel-Probe** | Mischung testen: ein schräges Haus, 3 Figuren, Laufen, Tiefe, **dasselbe Haus in zwei Tageszeiten** (6.6). Nur Probe, Spiel unverändert. Du urteilst per Klick, bevor etwas gebaut wird | S | Opus |
| **B · Kleiner Schnitt** (dein „beides in einem“) | Raster-Bild mit **zwei Häusern** (Kontor/Trupp-Haus mit Steg, ein Wohnhaus mit Betten), ein Trupp mit **einem** Ziel, die zwei Stoffe als Zähler, ein Haus bauen mit Kosten. Menü bleibt vorerst daneben | M–L | Opus |
| **C · Menü ersetzen** | Taverne, Dock, Tafel als Häuser, Tab-Leiste und Pop-up-Sprünge anpassen, Kapitänsbuch | L | Opus |
| **D · Werkstatt und Haus-Stufen** | Werkstatt (Effekte aufwerten), Werft und Gemütlichkeit als Stufen, Migration, Liste „Altes ausmisten“ | M–L | Opus |
| **E · Ziele und Texte** | Die echten Trupp-Ziele, Hausnamen, DE/EN. **Ideen von Felix oder Jan**, kein Auffüllen | S–M | Sonnet nach Vorlage |

Jedes Häppchen auf eigenem Zweig, live nur nach „schalte live“. Vor B und C kurz per Klick bestätigen.

## 8. Regeln, die hier gelten
- **Gegen das KI-Gefühl** (`PLAN-NEUGEWICHT.md` Abschnitt 6): wenig, von Hand durchdacht; Texte kurz mit eigenem Witz; Pixel-Handschrift; jedes System spürbar (Moment, Zahl, Bild). Diese Skizze füllt deshalb **keine** Häuser und keine Ziele auf.
- **Fair:** keine Bezahl-Abkürzungen, keine künstliche Energie, kein Tageslimit-Zwang.
- **Eingefroren** bleibt alles Übrige (Schmiede-Ausbau, Landgang, Dungeon-Liga, Pets, Seekarte, Gefühle, Folgen). Nur Werft und Gemütlichkeit ziehen um, ohne dass sich Werte ändern.
- **Replay-sicher, DE/EN.** Neu Erfundenes braucht keinen `neutral.js`-Eintrag.
- **Raritäten** bleiben rein kosmetisch.
- **Beute muss erst etwas wert sein** (`PLAN-NEUGEWICHT.md`, Zurückgestellt): Darum baut die Siedlung erst nach Duell-Beute und Effekten.
