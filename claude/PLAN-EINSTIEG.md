# Plan: Die ersten 10 Minuten

Stand 23.10.2026. **Nur Plan, nichts gebaut.** Jan (18. Chat, per Klick): Der Einstieg kommt als Nächstes, dort wirkt das Spiel am meisten wie Point-and-Click. Maßstab ist das Leitbild in `claude/PLAN-FOLGEN.md`: **Klicks mit Folgen, eine Welt zum Erkunden.**

## 1. Heute, Minute für Minute (Durchlauf als neuer Spieler, 390 px, Deutsch, 23.10.)
| Minute | Was man sieht | Wirkt wie |
|---|---|---|
| 0 | Titel mit Schiff-Bild und **8 Knöpfen** (Neues Spiel, Rangliste, Sammelalbum, Anleitung, Anmelden, Neuigkeiten, Neu laden, Streamer-Modus) | App-Menü |
| 0,5 | **Formular** „Erstelle deinen Piraten“: Name, Farbfelder für Haare, Haut, Oberteil, Hose, Werte ❤ 33 ⚔ 8 ➤ 5 | Konto anlegen |
| 1 | **Willkommens-Text** in mehreren Seiten: „Crew sammeln, Inseln erobern, den Boss umhauen. Eine Fahrt dauert etwa 20 Minuten. Scheitern gehört dazu.“ | Anleitung lesen |
| 1,5 | **Story-Szene** am Steg, Bühne mit Figuren und Stimmen: „HE! DU! Willst du in meine Crew?“ (Kapitel „Ein Neuer an Bord“, Story „Das Rezept vom Ende der Welt“) | **Spiel** (stark!) |
| 2 | **Deck „Crew aufstellen“**: Chips Kämpfer 3/4, Kraft 2/4, Sturmmöwen 3/6, Klinge 1/2, Kampfwert 23/45, Vorne/Hinten, Filter, Fahrtziel | Tabellenkalkulation |
| 2,5 | Kurswahl: Karte „Meer 1 von 3: Ostmeer“, darüber Coach-Hinweis | Spiel, aber erklärt |
| 3 | Erste Folge (Flaschenpost) wird direkt als Ergebnis-Text abgehakt | Popup |
| 3,5 | **Taverne** als erster Ort: drei Figuren mit Werten, Preisen, Synergie-Chips, „Neu würfeln“, Gold | Shop-Menü |
| 4+ | Karte anklicken, Kämpfe ansehen, Beute wählen | Point-and-Click |

**Befund:**
- Das Stärkste, die Story-Szene, kommt erst **nach** Formular und Anleitung.
- Bis Minute 4 trifft man nur **Zahlen-Entscheidungen** (Farbe, Kampfwert, Kaufen). Keine Wahl hat eine Folge in der Welt, und es gibt nichts zu entdecken.
- Die Hafen-Systeme werden schon schrittweise freigeschaltet (`js/data/features.js`, `runs`/`lvl`), die Systeme **in der Fahrt** aber nicht: Deck, Kampfwert, Synergie-Chips, Taverne und Fahrtziel sind ab Minute 2 alle da.
- Textfehler: `islands.js` sagt beim Ostmeer „das ruhigste der **vier** Meere“, die Kurswahl zeigt „Meer 1 von **3**“ (und der Weltbau plant fünf). Bei Weltbau-Welle A mit beheben.

## 2. Zielbild: zeigen statt erklären, die Welt zuerst
Drei Regeln für den Einstieg:
1. **Die Welt kommt vor dem Menü.** Erst Szene und Meer, dann Formulare.
2. **Pro Minute ein neues Ding.** Systeme kommen, wenn man sie braucht, nicht vorher.
3. **Die erste Wahl hat eine Folge**, und man sieht sie noch in der ersten Fahrt.

### Vorschlag, Minute für Minute
| Minute | Neu | Folge oder Entdeckung |
|---|---|---|
| 0 | **Titel als lebende Szene**: Hafen im Morgenlicht, Schiff schaukelt, ein großer Knopf „Neues Spiel“. Alles andere hinter ☰. | Stimmung statt Menü |
| 0,5 | **Gleich die Story-Szene.** Rafe: „HE! DU! Willst du in meine Crew?“ Du **antwortest per Wahl** (z. B. „Ja!“, „Nur wenn es Kuchen gibt“, „Wo geht's zum Bäcker?“). | **Erste Folge:** Die Crew erinnert sich an deine Antwort (Spruch später an Bord, Weltgedächtnis F0). |
| 1 | **Name im Gespräch**: „Und wie heißt du?“ Eingabe direkt in der Sprechblase. Aussehen zufällig, ändern später beim Kapitän („Spiegel“). | Kein Formular |
| 1,5 | **Die Seekarte mit Nebel** öffnet sich: Ostmeer fast ganz verhüllt, drei Gerüchte als Punkte im Nebel. **Kurs setzen = einen Punkt im Nebel antippen.** | **Erkunden:** Was man ansteuert, wird aufgedeckt und bleibt. |
| 2 | Ablegen **ohne Deck-Bildschirm**: Die erste Crew steht fest (4 Figuren), die Kampfwert-Rechnung bleibt verborgen. | Ein Klick weniger, eine Frage weniger |
| 3 | Erste Insel, erste Folge (Flaschenpost) als kleine Szene mit Siegel **„⚓ Das wird man sich merken“**. | Wahl mit Ankündigung |
| 4 | **Erster Kampf mit einem Eingriff**: Der Bösewicht sagt seine Attacke an, Nela ruft „Fokus auf ihn!“, man tippt, „Unterbrochen!“. | Kampf zum Mitmachen (Unterbrechen gibt es schon) |
| 6 | Teil 3 der Flaschenpost: Kapitän Korken kommt, je nach Wahl mit Kuchen oder Kanone. | **Die Folge greift noch in derselben Fahrt.** |
| 7 | Bösewicht besiegt, **erste Insel-Wahl**: befreien oder plündern (Plan 4A, Teil B). | Der Ort merkt es sich |
| 8 | Zurück im Hafen: Die **Seekarte zeigt, was du aufgedeckt hast**, dazu die Markierung am befreiten Ort (Logbuch). Story Kapitel 2 („Die Flaschenpost“, erste Rezeptseite) setzt den Haken für die nächste Fahrt. | Fortschritt **sichtbar in der Welt**, nicht nur als Zahl |
| 9 | Hafen mit zwei offenen Gebäuden (Dock, Taverne), die anderen mit Fensterläden (Hafen-Skizze). | Neugier: Was ist hinter den Läden? |

### Was später kommt (Freischaltung in der Fahrt, neu)
| System | Heute ab | Vorschlag ab |
|---|---|---|
| Deck „Crew aufstellen“ mit Kampfwert | Fahrt 1 | Fahrt 2 (erst die Aufstellung, Kampfwert ab Fahrt 3) |
| Synergie-Chips (Stil, Rolle, Bande) | Fahrt 1 | wenn die erste Synergie wirklich greift, mit kurzer Szene |
| Taverne als Ort auf der Karte | Fahrt 1 (fest in Reihe 1 bis 3) | Fahrt 2 |
| Fahrtziel im Deck | Fahrt 1 | Fahrt 2 |
| Willkommens-Text / Anleitung | sofort | nur auf Wunsch (☰ → Anleitung) |

## 3. Die große Frage: Wie lang ist die erste Fahrt?
Heute dauert eine Fahrt etwa 20 Minuten (drei Meere, je zwei Inseln). Damit der Bogen „entdecken, entscheiden, Folge sehen, heimkommen“ in **10 Minuten** klappt, gäbe es zwei Wege:
- **(a) Die erste Fahrt ist kürzer**: nur die erste Insel bis zu ihrem Bösewicht, dann Heimkehr mit Fest. Danach normale Fahrten.
- **(b) Die erste Fahrt bleibt voll**, der Bogen liegt in der ersten Insel, und man segelt einfach weiter.

## 4. Berührt (für die spätere Bau-Phase)
- Titel (`render.js` Titelbereich), Profil-Formular (`render.js` ~Z. 4340), Willkommen/Anleitung (`intro`, `render.js` ~Z. 5328), Story-Start (`js/ui/story.js`, `js/data/story.js` Kapitel 1), Seekarte (`js/ui/seekarte.js`, `js/engine/seekarte.js`), Deck (`js/ui/deck.js`), Taverne fest in Reihe 1 bis 3 (`genChart` in `run.js`), Coach (Nami/Nela), Freischaltungen (`features.js`, neue Einträge für Fahrt-Systeme), Weltgedächtnis (F0).
- Risiko: Der Einstieg ist der Teil, den jeder neue Spieler sieht. Unbedingt mit frischem Spieler, Rückkehrer und „Neustart für alle“-Spieler prüfen. Alte Stände dürfen nichts verlieren (wer Deck schon kennt, behält es).

## 5. Entscheidungen der Klick-Runde (23.10., Jan)
1. **Die erste Fahrt geht nur bis zum ersten Bösewicht** (rund 8 Minuten), dann Heimkehr mit Fest. Ab Fahrt 2 normale Fahrten. Abschnitt 3 ist damit entschieden: Weg (a).
2. **Der Pirat wird mitten in der Szene gestaltet** (nicht wie empfohlen „Aussehen später“): Die Crew steht am Steg und schaut dich an, Rafe fragt nach deinem Namen, Nela mustert dich („Mit dem Hut willst du zur See?“), und du wählst **im Gespräch** Hut und Farbe als Antwort-Knöpfe mit kleiner Vorschau deiner Figur auf der Bühne. Die Werte (❤ ⚔ ➤) sind dabei nicht zu sehen. Ausführlich gestalten bleibt beim Kapitän möglich.
3. **Ja: Schon in der ersten Fahrt setzt man den Kurs auf der Seekarte mit Nebel**, indem man ein Gerücht im Nebel antippt. Die Wisch-Karten der Inselwahl (22s) kommen danach, wenn man mehrere Inseln kennt, oder werden zur Detailansicht eines Gerüchts.
4. **Später kommen nur: Deck mit Kampfwert und die Synergie-Chips.** **Taverne und Fahrtziel bleiben ab Fahrt 1.**
   - **Folge für das Fahrtziel:** Es wird heute auf dem Deck gewählt (`deck.js`, `briefHtml`). Fällt das Deck in Fahrt 1 weg, zieht die Wahl des Fahrtziels **auf die Seekarte**, neben „Kurs setzen“ (bei der ersten Fahrt eine einzige Zeile, z. B. „🎯 Finde den ersten Bösewicht“).
   - **Taverne in Fahrt 1:** bleibt fest in Reihe 1 bis 3. Da die erste Fahrt kürzer ist, kommt sie dann sicher vor dem Bösewicht. Für Neulinge die Ansicht vereinfachen: ohne Synergie-Chips (die kommen ja später).

### Angepasste Minuten-Tabelle (nach den Antworten)
| Minute | Was passiert |
|---|---|
| 0 | Titel als lebende Szene, ein Knopf „Neues Spiel“ |
| 0,5 bis 1,5 | Story am Steg: Rafe fragt, du antwortest per Wahl (erste Folge), **gestaltest im Gespräch Hut und Farbe**, nennst deinen Namen |
| 2 | Seekarte im Nebel: Gerücht antippen = Kurs, darunter das Fahrtziel in einer Zeile |
| 2,5 | Ablegen ohne Deck, feste erste Crew |
| 3 | Flaschenpost Teil 1 mit Siegel „⚓ Das wird man sich merken“ |
| 3,5 | Taverne, vereinfacht (ohne Synergie-Chips) |
| 4 bis 5 | Kampf mit einem Eingriff: Fokus, „Unterbrochen!“ |
| 6 | Kapitän Korken kommt (Kuchen oder Kanone) |
| 7 | Bösewicht, danach die erste Insel-Wahl (befreien oder plündern) |
| 8 | **Heimkehr mit Fest**: Seekarte zeigt Aufgedecktes und den befreiten Ort, Story Kapitel 2 (erste Rezeptseite) |
| 9 bis 10 | Hafen mit Dock und Taverne offen, die anderen Gebäude mit Fensterläden |

Nächster Schritt in der Planung: ein **Storyboard** dieser 10 Minuten als Bild-Board (wie das Board der Bekannten), damit Felix den Ablauf sieht und abnicken kann.
