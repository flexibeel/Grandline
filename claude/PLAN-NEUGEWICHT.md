# Grandline neu gewichten: Beute, Wirtschaft, Spieler gegen Spieler

Stand 29.10.2026 (57. Chat, Sonnet, ohne Bauen). Auslöser: Felix' Urteil zu Test 2b (`claude/PLAN-MOSO.md`, „Urteil zu Test 2b“) und Warteschlange Punkt 0 im Fahrplan. Quelle für den Abgleich: Design-Fläche „Grand Line: Gesamtplan“ (26 Tafeln, Stand 22.10.) gegen den Code auf `feature/neuausrichtung` (Basis `main` 25h).

## 1. Was Felix zieht
- **Beute, die Werte steigen lässt**, und **gegen echte Spieler** (wie Shakes & Fidget).
- **Aufbau-/Wirtschafts-Sim** reizt ihn.
- **Die Kämpfe in Grandline nicht:** unklar, was zählt, fühlen sich gleich an.

## 2. Gesamtplan gegen Spiel: geplant, aber kaum gebaut

**Kontor / Wirtschaft**
- Gebaut: nur Bernstein (Stufe 1–20 gegen Berry, `js/engine/kontor.js`). Bernstein hat genau zwei Verwendungen: Stil-Dojo (20) und Landgang auffrischen (20).
- Nicht im Code: Saphir und Rubin (nur als Kosmetik-Namen), Saphir-Raids, Rubin-Jagd mit 3 Phasen, Handelsfahrten (Crew segelt offline), Marktpreis des Tages, Wanderhändler, Handelspartner mit Ruf, Kombüse mit Vorräten (die „Kombüse“ im Spiel ist eine Werft-Stufe für Rast-Heilung), Schiffe aus 4 Teilen mit Bonus (Schiffsteile sind nur Optik), Logbuch.

**Hafen**
- Gebaut: vier Gebäude (Dock, Auftragstafel, Kontor, Taverne) als Ordnung, kein neuer Inhalt.
- Fehlt: Beute baut den Hafen aus (Idee 2 von Jan, Schritte 2 und 3), nichts wächst sichtbar. Häppchen D (Pixel-Schilder) offen.

**Beute / Ausrüstung** (`js/data/crewgear.js`)
- Gebaut: 11 Grundteile, 4 Seltenheiten, 7 Zusatzwerte nur als Zahlen (+1 bis +3 Angriff, +4 bis +10 Leben, …), 10 Boss-Fundstücke, 8 Raid-Trophäen mit Spezialfähigkeit, Würfeln neu (Meersplitter), Zerlegen.
- Geplant (Tafel „Ausrüstung mit Effekten“): ~30 Grundteile, Effekt-Zusatzwerte (Blutung, Brand, Gift, Konter, Lebensraub, Dornen, Start-Schild, Ulti bei Krit, Rache), eigene Effekte für Top-Teile, 6 Seltenheiten, Fundstücke für alle neuen Bosse. Set-Boni sind ausdrücklich nur Vorschlag.
- Fehlt: Anheuer-Taverne mit Kopfgeld-Marken und Ziehung (Gacha-Animation). Es gibt nur Dungeon-Marken im Marken-Laden der Dungeon-Liga.
- Raritäten (Kontor): 1 zu 250, nur Schmuck in der eigenen Vitrine; andere Spieler sehen die Vitrine nur teilweise (Visitenkarte, bis zu drei Stücke).

**Spieler gegen Spieler**
- Gebaut: Stammcrew-Duelle gegen gespeicherte Crews (`js/engine/squad.js`, `js/main.js`), Liga über Crew-Rating, Taktik Sturm/List/Mauer, Kommandos im Duell, Verteidigungs-Meldungen (`duel_events`), Gemeinschafts-Fahrt (Welt-Boss mit Freunden, `js/ui/coop.js`), Dungeon-Liga, Tages-Rangliste.
- **Fund 1:** `squad.js` `prep()` zählt die Ausrüstung im Duell nur zur **Hälfte** („So entscheidet eher die Aufstellung als die Schatzkammer“). Beute zählt gegen Spieler also absichtlich wenig.
- **Fund 2:** Ein Duell-Sieg bringt nur Rating und Crew-Erfahrung (`squadRate`, `squadGainXp`), **keine Beute**.
- Beides ist das Gegenteil des Kreislaufs „Beute → stärker → gegen Spieler → neue Beute“.
- Fehlt aus dem Plan: Vitrine für alle sichtbar (braucht Server), Wochen-Bestenliste der Rubin-Jagd, Saison-/Wochen-Titel.

**Sonst nicht gebaut:** Endgame-Wege A/B und Banden als Aufstellungs-Rätsel, Trainingsrollen (Ulti-Stufen), 5 Kampfstile (es sind 3), Figuren bis Marineford.

## 3. Ehrliche Einschätzung (Claude)

**Passt zum Kreislauf:**
- Ausrüstung mit spürbaren Effekten und Seltenheiten, an der Figur sichtbar.
- Duelle, in denen Beute zählt und ein Sieg Beute bringt.
- Kontor als echte Wirtschaft (Handelsfahrten offline, Markt, Ausbau).
- Eine sichtbare **Kampfkraft-Zahl** mit Herkunft („was hat mich stärker gemacht“).

**Doppelt oder ohne Zug für diesen Kreislauf:**
- **Sechs Systeme mit „+x % Werte“:** Werft, Gemütlichkeit (Skilltree), Formen + Wahl-Boni, Meisterschaft, Schatzkammer (Artefakte), Stammcrew-Ausrüstung. Man sieht nie, warum man stärker wurde. Das ist die Wurzel von „unklar, was zählt“.
- **Zwei Ausrüstungssysteme** (Run-Ausrüstung über die Schmiede und Stammcrew-Ausrüstung).
- **Kampf-Regelwerk:** Zustände, vier Reaktionen, Unterbrechen-Balken, Fokus, Heiler-Regel, Ulti-Regeln. Viel Regel, wenig Spürbares.
- **Nebenmodi:** Landgang, Dungeon-Liga mit Marken-Laden, Offene See, Seekarte, Pets.
- **Erzählung** (Crew-Gefühle, Weltgedächtnis, Folgen): schön, aber nicht der Kreislauf.

## 4. Entscheidung (Felix, per Klick, 29.10.)
Alle drei wie empfohlen:
1. **Richtung: „Beute zählt im Duell“.** Ausrüstung mit Effekten und mehr Seltenheiten, sichtbar an der Figur; Duell-Halbierung fällt weg (oder wird durch Gegner ähnlicher Stärke ersetzt); Sieg bringt Beute; eine Kampfkraft-Zahl.
2. **Kämpfe: automatisch und klarer.** Kampf läuft von allein, eine kurze Zusammenfassung nennt, was den Ausschlag gab. Eingreifen bleibt optional.
3. **Aufräumen: einfrieren.** Nichts mehr ausbauen, nichts löschen. Neue Beute und neues Geld laufen nur durch den Kreislauf.

Zurückgestellt (nicht verworfen): Richtung „Der Hafen wächst“ (Wirtschafts-Sim) kommt danach, hängt an Punkt 1 (Beute muss erst etwas wert sein).

## 5. Einfrieren heißt konkret (seit 29.10., 8:47: dazu „Altes ausmisten“, siehe Abschnitt 6 unten)
Keine neuen Inhalte und keine neuen Regeln in: Werft, Gemütlichkeit, Formen/Wahl-Boni, Meisterschaft, Schatzkammer, Schmiede, Landgang, Dungeon-Liga, Offene See, Seekarte, Pets, Crew-Gefühle, Weltgedächtnis, Folgen, Kampf-Zustände. Fehler werden weiter behoben. Fertige, aber nicht live geschaltete Zweige bleiben liegen (`feature/zuhause-schaufenster` 9f A, `feature/kampfton-einbau` 9e C), bis Felix etwas anderes sagt.

## 6. Vorschlag für die Häppchen (noch nichts bestätigt, vor dem Bauen kurz per Klick)
1. **Kampfkraft-Zahl mit Herkunft** (Anzeige, kein Spielstand-Feld, Sonnet/Opus): Summe aus Leben, Angriff, Tempo je Figur, aufgeschlüsselt in Grundwert, Form, Ausrüstung, Werft usw. Die Werte-Tafel im Kampf (22q) kennt die Herkunft schon, daran anknüpfen. Macht die Duelle vergleichbar.
2. **Duell-Ausgleich neu** (`squad.js`, Opus, Balance messen): Halbierung raus, dafür Gegnerwahl nach Kampfkraft-Band, damit Neulinge nicht gegen volle Vitrinen antreten. Messung per Bot wie bei Ulti und Taverne (vorher/nachher).
3. **Duell-Beute** (Opus): Sieg bringt Ausrüstung oder Meersplitter, Stärke der Beute nach Liga. Keine Energie, keine Bezahl-Abkürzung, kein Tageslimit-Zwang.
4. **Ausrüstung mit Effekten** (Opus, dazu die Taverne als Ausrüstungs-Halt, siehe unten): Effekt-Zusatzwerte aus den vorhandenen Zuständen (Brand, Gift, Blutung, Lebensraub, Dornen), 6 Seltenheiten, mehr Grundteile, Waffe an der Figur sichtbar (Kampf-Update, Baustein 4).
5. **Auto-Kampf mit Zusammenfassung** (Opus, Kampfsystem): Ereignisse des Kampfes zu „Was gab den Ausschlag“ aufbereiten (Kampfkraft-Vorsprung, Ausrüstungs-Effekt, Tempo, Ulti). Replay-sicher, keine neuen Würfel.

### Stand Häppchen 1 (29.10., 58. Chat, Opus): gebaut auf `feature/kampfkraft`, nicht live
- Felix per Klick: Grundlage ist die vorhandene „⚔ Stärke“ (`GL.meta.squadPower`, gleiche Formel, steuert schon die Gegnersuche), sie heißt jetzt **Kampfkraft**. Zu sehen in der Stammcrew (antippen: vier Quellen Figuren / Stufe & Vertrautheit / Werft / Ausrüstung, je Figur aufklappbar) und im Fenster „Gegner gefunden“ (Vergleich nach Quellen, größter Vorsprung oder Rückstand). Die Duell-Halbierung wird **nicht** angezeigt, sie fällt mit Häppchen 2 weg.
- Fund: In der Stammcrew zählen nur Figur, Stufe/Vertrautheit, Werft und Ausrüstung. Formen, Wahl-Boni, Meisterschaft und Schatzkammer wirken nur auf Fahrt. Für den Kreislauf „Beute → stärker → Duell“ heißt das: Im Duell ist Ausrüstung schon heute der einzige Hebel, den man selbst sammelt, und genau der wird halbiert.
- Technik: `GL.meta.unitPower`, `GL.meta.powerParts` (auch für fremde Crews ohne Profil), `kkPop`/`kkCompare` in `render.js`. Häppchen 2 kann das Kampfkraft-Band direkt aus `squadPower` nehmen.

Häppchen 1 ist seit **29a „Woher kommt die Kraft?“** live (59. Chat).

### Stand Häppchen 2 (29.10., 59. Chat, Opus): gebaut auf `feature/duell-ausgleich` (von `main` 29a), nicht live
- Felix per Klick (alle wie empfohlen): Band **±25 %**, ist niemand im Band → **Übungscrew** der Kronwacht genau auf deiner Kampfkraft, **nur die Ausrüstungs-Halbierung fällt weg**, der Zusammenhalt-Deckel (+5 Stufen) bleibt.
- Technik: `squad.js` `prep()` ohne Halbierung (Zusatzwerte nur noch gegen negative Fremddaten abgesichert), neu `GL.squad.inBand(rows, mine, rating)` und `GL.squad.trainer(lvl, n, mine, rnd)` (Übungscrew streckt Leben/Angriff jetzt nach oben **und** unten, nie unter die Hälfte; vorher 90 % und nur nach oben). Stellschrauben `GL.config.duel = { band: 0.25, trainer: 1 }`. `main.js` `squad-match` nutzt beides. Im Fenster „Gegner gefunden“ steht bei der Übungscrew ein Satz, warum (DE/EN).
- **Echte Lage (Rangliste, nur gelesen):** 39 Stammcrews in zwei Haufen, 22 um 330 Kampfkraft (fast ohne Ausrüstung) und 15 um 1.800–2.600. Dazwischen fast niemand. Ausrüstung macht oben samt Zusatzwerten **rund zwei Drittel** der Kampfkraft aus.
- **Messung** (vorher/nachher, gleiche Würfel, 20 verschiedene echte Crews, je 40 Kämpfe gegen die ersten drei Gegner der Suche, im Browser mit dem echten Kampfsystem; Skript lag nur im Scratchpad):
  - Wer allein in seiner Gegend ist, wird nicht mehr verheizt: Die Crew mit 1.063 traf vorher 530/439 (100 %) und 1.638 (30 %), jetzt die Übungscrew (35/88/65 %). Die stärkste Crew (2.603) trifft nur noch die 2.468er statt zweimal 1.946 (100 %).
  - Beute zählt spürbar mehr: unten gewinnt eine Crew mit Ausrüstung gegen dieselbe ohne 68–90 % → 78–100 %.
  - Gegner im Schnitt 9 % → 7 % von der eigenen Kampfkraft entfernt.
- **Wichtiger Fund, nicht angefasst:** Auch bei fast gleicher Kampfkraft ist ein Duell **fast schon vorher entschieden**. Rund 70 % der Paarungen liegen unter 25 % oder über 75 % Siegchance, vorher wie nachher (zum Beispiel 307 gegen 309: 98 % / 0 % je nach Gegner). Das Kampfsystem würfelt im Duell wenig, kleine Vorteile (Kampfstil, Rolle, Taktik) kippen das Ergebnis ganz. Die Kampfkraft sagt den Sieger also nur grob voraus. Kandidat für ein eigenes Häppchen: **Kampfkraft eichen** (Gewichte der Formel an echten Kampfausgängen ausrichten) oder mehr Glück im Duell. Gehört zu „Kämpfe: unklar, was zählt“.
- Offen: Patchnote und `bump-version.py` beim Live-Gang (nächste Kennung `2026-10-29b`). Am Handy „Gegner suchen“ antippen.

### Taverne mitten in der Fahrt (Felix, 29.10., 8:35)
Felix: „Brauch man die Taverne zwischen den Kämpfen? Ist es nicht besser, wenn man die Crew am Anfang hat, die man sich aussucht, und mit den Items verbessert?“ Claude: Ja, seit dem Deck (22m) sucht man die Crew am Start aus, die Taverne ist ein zweites Crew-System neben der Beute. Haken: Dort passieren auch **Zusammenlegen** (Figuren stärker machen) und das **Taler-Ausgeben**, beides braucht einen neuen Platz. Felix per Klick: **mit Häppchen 4 angehen**, Taverne wird zu einem Ausrüstungs-Halt (kaufen/verbessern), Zusammenlegen zieht um. Vorher kurz vorschlagen.

### Kämpfe nicht vorherbestimmt, kein KI-Gefühl (Felix, 29.10., 8:47, per Klick)
Felix: „Es soll sich nicht vorprogrammiert anfühlen, wie die Kämpfe sind. Es gibt so viele kack KI-Games, das möchte ich nicht, dass meins auch so wird.“ Was für ihn ein KI-Game ausmacht (alle vier gewählt): **alles fühlt sich gleich an**, **generische Grafik**, **zu viele Systeme ohne Seele**, **Texte wirken generiert**.

**Leitsatz:** Kampfkraft legt die Chancen fest, **Momente entscheiden** den Kampf. Gleich starke Crews sollen bei etwa 40–60 % liegen, Überraschungen müssen möglich sein, und man versteht hinterher, warum.

**Richtung per Klick: B + C + D** (nicht A „nur mehr Glück“):
- **B · Wendepunkte:** 2–3 sichtbare Momente pro Kampf, in denen es kippen kann (Ideen: Ulti-Duell, „letzter Mann steht“ mit Aufbäumen, Kapitänsruf). Man sieht sie kommen.
- **C · Vorher entscheiden zählt:** Taktik und Aufstellung gegen genau diesen Gegner bringen deutlich mehr als heute (+6 % bei Sturm/List/Mauer).
- **D · Ehrliche Zusammenfassung:** „Gewonnen, weil …“ mit dem Moment, der es gedreht hat (deckt sich mit Häppchen 5).
- Nächster Schritt: **Skizze** (welche Wendepunkte genau, wie stark Taktik wirkt, Ziel der Messung), Felix klickt ab, dann bauen (Opus). Replay-sicher, Würfel nur aus dem Kampf-Seed.

**Neue feste Regel „Gegen das KI-Gefühl“** (gilt für alles Neue):
- Lieber wenig, dafür von Hand durchdacht. Jedes neue Teil, jede Regel braucht eine eigene Idee (von Felix, Jan oder klar begründet), nicht „aus einer Liste aufgefüllt“.
- Texte kurz, mit eigenem Witz, keine glatten Allzweck-Sätze.
- Grafik mit erkennbarer Pixel-Handschrift, nicht austauschbar.
- Jedes System muss im Spiel spürbar sein (Moment, Zahl, Bild), sonst kommt es nicht rein.

**Altes ausmisten (Felix per Klick, ändert Abschnitt 5 „einfrieren, nichts löschen“):** Bestehende Systeme werden geprüft, Seelenloses kommt raus. Vorgehen: erst eine Liste mit Vorschlag je System (behalten / zusammenlegen / raus) und was mit Spielständen passiert, **jedes Raus einzeln per Klick**, nie still. Spielstände dürfen dabei nicht kaputtgehen (Werte, die wegfallen, sauber auslaufen lassen).

## 7. Regeln, die gelten bleiben
- Fair: keine Bezahl-Abkürzungen, keine künstliche Energie.
- Kontor erzeugt nie Kopfgeld-Marken oder Kampfkraft (Gesamtplan, „Was wohin fließt“). Gilt weiter, bis Felix es ändert; Punkt 3 oben nutzt deshalb Duell-Beute, nicht das Kontor.
- Raritäten bleiben rein kosmetisch.
- Replay-sicher, neue Texte DE/EN, neue Namen in `js/world/neutral.js` absichern.

## 8. Welt-Freiheit (Felix, 29.10., 8:13, im Gespräch)
Die Welt muss **nicht „die Piratenwelt“** sein, eine eigene erfundene Welt ist ausdrücklich okay. Das gibt bei Beute, Grafik und Design mehr Freiheit. **Nicht alles umbauen.**
- **Regel für alles Neue** (Häppchen 1 bis 5): Beute, Effekte, Teile, Namen und Grafik werden **frei erfunden gedacht**, nicht automatisch mit Piraten-Vokabular (kein Säbel/Entermesser/Kopfgeld-Reflex). Zum Beispiel Teile und Effekte, die zur eigenen Welt passen (Sturmmöwen, Kronwacht, Flossenvolk aus Weltbau A bis C), oder ganz neue Kategorien.
- **Bestehendes bleibt:** Schiff, Hafen, Kopfgeld, Crew und die 65 Figuren werden jetzt nicht umgebaut. Das Gerüst darf piratig bleiben, solange das Neue nicht daran klebt.
- **Nebeneffekt, der Arbeit spart:** Was von Anfang an in der eigenen Welt geschrieben wird, braucht **keinen Eintrag in `js/world/neutral.js`** und keine zweite Fassung (Gesamtplan-Grundsatz „Zwei Welten verdoppeln jeden Inhalt“). Es sinkt auch das Rechte-Risiko.
- **Offen, später per Klick:** Soll das Gerüst (Schiff, Hafen, Kopfgeld) langfristig auch aus dem Piraten-Look heraus? Das wäre ein eigener, großer Plan (Weltbau D), nicht Teil dieser Häppchen.
