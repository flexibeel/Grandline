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

## 6. Storyboard (24.10., Bild-Board)
Board **„Storyboard: Die ersten 10 Minuten“** (Design-Artefakt in Jans Account: claude.ai/artifact/EhmtQtBqcPNeZXKKXdjNR8): 13 Handy-Bildschirme (390 × 844) in drei Reihen, Figuren mit `GL.sprites.render` aus dem Spiel gezeichnet (Rafe, Soren, Nela, Lasse, Santo, Pipo, Bunko, Korken Look D, dein Pirat), unter jedem Bild ein Zettel mit der Folge oder Entdeckung. Die Knöpfe sind verlinkt, im Abspielen kann man den Ablauf durchklicken.
1. **Ankommen (Min 0 bis 1,5):** Titel als Szene mit einem Knopf · Rafe fragt am Steg, drei Antworten mit Siegel · Nela fragt nach dem Hut (4 Hüte, 5 Farben, Vorschau auf der Bühne) · Name in der Sprechblase, „Anheuern“.
2. **Erste Fahrt (Min 2 bis 5):** Seekarte im Nebel (ein Gerücht angetippt, zwei weitere als „?“, Fahrtziel-Zeile) · Ablegen mit fester Crew aus vier · Flaschenpost Teil 1 mit Siegel · Taverne „Zur Rostigen Möwe“ mit drei Figuren ohne Chips · Kampf: Ansage, Balken 9/15 %, „Fokus auf ihn!“, „Unterbrochen!“.
3. **Folgen sehen (Min 6 bis 10):** Korken mit drei winzigen Matrosen (Kuchen-Zweig, der andere Zweig als Hinweis) · Insel-Wahl am Zirkus (Zelt abbauen, Artisten anheuern, Kasse mitnehmen) · Fest im Hafen mit aufgedeckter Karte, Herz-Markierung und Kapitel 2 · Hafen mit Dock und Taverne offen, Kontor und Auftragstafel mit Fensterläden, Tab-Leiste Hafen · Tafel · Taverne · Kapitän.

**Funde beim Zeichnen (für die Bau-Phase):**
- **Bunko (Orangenhafen) hat keine Signatur-Ansage.** `bossSigs` gibt es nur für 14 Bosse ab Ruß/Hairo. Für den Lernmoment in Minute 4 braucht der erste Bösewicht eine eigene, leichte Ansage (Vorschlag „Konfetti-Kanone“), sonst muss die erste Insel eine andere sein.
- **Korken braucht die Größen-Option** (winzige Figuren), schon in `PLAN-WELT-MERKT.md` vermerkt. Auf dem Board einfach kleiner gezeichnet.
- **Wortwahl `mood`:** `run.mood` ist schon belegt (Meer-Stimmung wie „goldrausch“, „flaute“). Crew-Gefühle (Säule 4D) brauchen einen anderen Namen.
- Die Taverne in Fahrt 1 zeigt drei Figuren mit kurzem Satz statt Werten. Preise bleiben (Gold ist schon in Fahrt 1 da).

**Felix' Klick-Runde (24.10., 20. Chat):** Alle drei Reihen **abgenickt wie gezeichnet**. Bunko bekommt eine **eigene leichte Signatur-Ansage** (Vorschlag „Konfetti-Kanone“), die erste Insel bleibt Orangenhafen. Das Board selbst war aus Felix' Account nicht lesbar (liegt bei Jan), abgestimmt wurde nach der Beschreibung oben.

## 7. Taverne: nur wer dir schon begegnet ist (Felix, 24.10.)
**Problem (Felix):** Beim Run-Start sitzen in der Taverne Leute, die man nie freigeschaltet oder getroffen hat. Grund im Code: `shopOffers` (`js/engine/run.js` ~Z. 190) zieht aus `availableCrew`, also allen Figuren ohne `locked` (rund 19 Grundfiguren) plus den freigeschalteten. Die Grundfiguren hat man nie kennengelernt.

**Entschieden (Felix per Klick):**
- **In der Taverne sitzt nur, wen du kennst.** Neue Figuren lernt man **unterwegs** kennen (auf Inseln, in den Folgen, als Bekannte aus `PLAN-WELT-MERKT.md`, durch Freischaltungen), erst danach tauchen sie in der Taverne auf. Passt zum Leitbild „Welt erkunden“.
- **Startrunde in Fahrt 1: die feste Crew aus vier plus zwei Gäste**, die man in der ersten Taverne trifft (die zwei sind damit ab dann bekannt).

**Für die Bau-Phase (Vorschlag, Opus):**
- Neues Profilfeld `profile.kennt` (Liste von Figuren-IDs), Standard: **alle, die schon einmal in deiner Crew waren** (Schlüssel aus `profile.squadXp`) plus die Startrunde. So verliert kein bestehender Spieler eine Figur, keine Migration nötig.
- `availableCrew` filtert zusätzlich auf `kennt`. `locked`/`unlocks.js` bleiben, eine Freischaltung setzt die Figur gleich mit auf `kennt`.
- „Kennenlernen“ als Merkzeichen im Weltgedächtnis (F0): Begegnung auf einer Insel oder in einer Folge → nach `finishRun` auf `kennt`. In der Fahrt nur gelesen (Kopie in `run.start`), replay-sicher.
- Damit die Taverne nicht leer läuft: Kennt man weniger Figuren als Plätze, füllt eine Begegnung den Rest auf („Neu im Hafen“, einmalig), danach ist sie bekannt.
- Wechselwirkung: Banden-/Stil-Gewichtung (`factionWeight`, `typeWeight`) und Vertrauter (`run.buddy`) bleiben unverändert, sie arbeiten dann auf der kleineren Liste. Mit `tools/balance.html` prüfen, ob Banden-Boni bei kleiner Liste noch erreichbar sind.
