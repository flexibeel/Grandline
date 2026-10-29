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

## 5. Einfrieren heißt konkret
Keine neuen Inhalte und keine neuen Regeln in: Werft, Gemütlichkeit, Formen/Wahl-Boni, Meisterschaft, Schatzkammer, Schmiede, Landgang, Dungeon-Liga, Offene See, Seekarte, Pets, Crew-Gefühle, Weltgedächtnis, Folgen, Kampf-Zustände. Fehler werden weiter behoben. Fertige, aber nicht live geschaltete Zweige bleiben liegen (`feature/zuhause-schaufenster` 9f A, `feature/kampfton-einbau` 9e C), bis Felix etwas anderes sagt.

## 6. Vorschlag für die Häppchen (noch nichts bestätigt, vor dem Bauen kurz per Klick)
1. **Kampfkraft-Zahl mit Herkunft** (Anzeige, kein Spielstand-Feld, Sonnet/Opus): Summe aus Leben, Angriff, Tempo je Figur, aufgeschlüsselt in Grundwert, Form, Ausrüstung, Werft usw. Die Werte-Tafel im Kampf (22q) kennt die Herkunft schon, daran anknüpfen. Macht die Duelle vergleichbar.
2. **Duell-Ausgleich neu** (`squad.js`, Opus, Balance messen): Halbierung raus, dafür Gegnerwahl nach Kampfkraft-Band, damit Neulinge nicht gegen volle Vitrinen antreten. Messung per Bot wie bei Ulti und Taverne (vorher/nachher).
3. **Duell-Beute** (Opus): Sieg bringt Ausrüstung oder Meersplitter, Stärke der Beute nach Liga. Keine Energie, keine Bezahl-Abkürzung, kein Tageslimit-Zwang.
4. **Ausrüstung mit Effekten** (Opus): Effekt-Zusatzwerte aus den vorhandenen Zuständen (Brand, Gift, Blutung, Lebensraub, Dornen), 6 Seltenheiten, mehr Grundteile, Waffe an der Figur sichtbar (Kampf-Update, Baustein 4).
5. **Auto-Kampf mit Zusammenfassung** (Opus, Kampfsystem): Ereignisse des Kampfes zu „Was gab den Ausschlag“ aufbereiten (Kampfkraft-Vorsprung, Ausrüstungs-Effekt, Tempo, Ulti). Replay-sicher, keine neuen Würfel.

## 7. Regeln, die gelten bleiben
- Fair: keine Bezahl-Abkürzungen, keine künstliche Energie.
- Kontor erzeugt nie Kopfgeld-Marken oder Kampfkraft (Gesamtplan, „Was wohin fließt“). Gilt weiter, bis Felix es ändert; Punkt 3 oben nutzt deshalb Duell-Beute, nicht das Kontor.
- Raritäten bleiben rein kosmetisch.
- Replay-sicher, neue Texte DE/EN, neue Namen in `js/world/neutral.js` absichern.
