# Plan 4D: Crew mit Gefühlen

Stand 24.10.2026. **Nur Plan, nichts gebaut. Von Felix freigegeben (24.10., 20. Chat) mit zwei Änderungen: erschöpft milder, Streit seltener.** Säule 4D aus dem Leitbild (`claude/PLAN-FOLGEN.md`), zwei Klick-Runden mit Jan (19. Chat), alle acht Antworten wie empfohlen. Grundregel aus dem Leitbild: **Pause und Versöhnung, nie Verlust.** Eine Figur verlässt die Crew nie.

## 1. Was es schon gibt (geprüft im Code)
- **Vertrautheit je Figur** `profile.squadXp`, Stufen über `GL.meta.squadBonus` (`js/engine/meta.js` ~Z. 431), wächst nach jeder Fahrt über `runBond`.
- **Vertrautheit je Paar** `profile.pairXp` (`GL.meta.pairGain`, `pairKey`, ~Z. 486). Wächst schon heute für alle, die zusammen segeln. Das ist die Grundlage für Freundschaften.
- **Gemeinsame Momente** `js/data/moments.js`: kleine Szenen mit Sprechblasen, freigeschaltet über Vertrautheit (Stufe 3, 6, 10).
- **Crew-Leben** `js/data/crewlife.js`: Lieblingsessen, Sprüche am Steg, Sätze nach Sieg und Niederlage.
- **Story-Bühne** `js/ui/story.js`: Szenen mit Figuren, Sprechblasen und Antwort-Wahl. Damit lässt sich das Gespräch am Steg bauen.
- **Achtung, Name belegt:** `run.mood` ist die Meer-Stimmung („goldrausch“, „flaute“, `config.moods`). Crew-Gefühle bekommen deshalb einen eigenen Namen: **`run.herz`**.

## 2. Entscheidungen (24.10., Jan per Klick)
| Frage | Antwort |
|---|---|
| Auslöser | **Wenige klare Auslöser**, keine Flut |
| Anzeige | **Gesicht und Spruch**, keine Zahl |
| Wirkung im Kampf | **Klein, aber spürbar** |
| Was bleibt nach der Fahrt | **Erinnerungen und Paare**, die Stimmung selbst gilt nur in der Fahrt |
| Gefühle | **Drei: froh, erschöpft, verstimmt**, dazu „normal“ |
| **Felix (24.10.): erschöpft** | **milder: −20 % Leben im nächsten Kampf** statt aussetzen |
| **Felix (24.10.): Streit** | **seltener**: nicht jede Fahrt, höchstens jede zweite bis dritte |
| Versöhnung | **Gespräch am Steg** mit Antwort-Wahl |
| Streit zwischen Figuren | **Ja, selten, du schlichtest** |
| Start | **Ab Fahrt 2 mit kurzer Szene**, in Fahrt 1 nur ein Hauch |

## 3. Die drei Gefühle
| Gefühl | Wie es entsteht (Auslöser) | Wirkung in der Fahrt | Wie es endet |
|---|---|---|---|
| **froh** | Lieblingsessen bei der Rast, beste Figur im Bosskampf, eine Ereignis-Wahl zu ihren Gunsten | **+1 Tempo** (Startwert, mit `tools/balance.html` messen), Freudenspruch beim nächsten Kampf | nach 2 Kämpfen wieder normal |
| **erschöpft** | **zweimal K.o. ohne Rast dazwischen** | **−20 % Leben im nächsten Kampf** (kämpft mit, sieht müde aus; Felix 24.10., statt aussetzen) | nach dem nächsten Kampf oder bei Rast |
| **verstimmt** | eine Ereignis-Wahl gegen sie, ein Streit, bei dem du die andere Seite nimmst | **kein Duo-Schub und kein Duo-Spruch** mit ihr, sonst volle Werte | Ende der Fahrt, aber dann bleibt die **Bitte um ein Gespräch** am Steg |

Regeln, damit es nie nervt:
- **Höchstens eine erschöpfte Figur gleichzeitig.** Der eigene Pirat (`self`) wird nie erschöpft oder verstimmt, er ist der Kapitän.
- Gefühle **überschreiben sich**: Ein neues Gefühl ersetzt das alte. Keine Stapel.
- **Paare:** Haben zwei Figuren hohe Paar-Vertrautheit (`pairXp`) und sind **beide froh**, gibt es einen Duo-Spruch und einen kleinen Schub (Vorschlag: beide +5 % Angriff in diesem Kampf). Das macht Freundschaften im Kampf sichtbar, ohne neue Systeme.

## 4. Auslöser im Detail (wenige, klar)
1. **K.o.** im Kampf zählt mit, **Rast** setzt den Zähler zurück (`run.js`, Rast-Knoten `restHeal`).
2. **Lieblingsessen:** Bei einer Rast kocht der Smutje manchmal das Lieblingsessen einer Figur (aus `crewlife.js`, `food`). Die Figur wird froh. Kein neuer Knoten nötig.
3. **Beste Figur im Bosskampf:** wer den meisten Schaden gemacht hat, wird froh („Habt ihr das gesehen?!“).
4. **Ereignis-Wahlen:** Ausgewählte Ereignisse bekommen ein Feld **`herz`** neben `outcome` (wie `merk` aus 4A), z. B. `{ herz: { froh: 'nami' } }` oder „die Figur, die du schickst, wird erschöpft“. Start mit **6 bis 8 Ereignissen**, Texte Sonnet.
5. **Streit (selten, Felix 24.10.: höchstens jede zweite bis dritte Fahrt, z. B. frühestens zwei Fahrten nach dem letzten Streit, gemerkt in `profile.world`):** ein neues Crew-Zwischen-Ereignis „Zwei streiten“ (Muster `events2.js` bis `events5.js`): Zwei Figuren aus der Crew sind uneins (wer kocht, wer steuert, wer den Schatz trägt). Drei Antworten:
   - Figur A recht geben: A froh, B verstimmt.
   - Figur B recht geben: B froh, A verstimmt.
   - **Schlichten:** kostet etwas (eine Runde Gold für alle oder die nächste Rast heilt weniger), beide bleiben normal, die Paar-Vertrautheit wächst ein Stück.

## 5. Anzeige: Gesicht und Spruch
- **Gesicht:** Jede Figur zeigt ihr Gefühl im Gesicht. Auf den heutigen 12 × 14 Figuren reichen 1 bis 2 Pixel (Augen halb zu = erschöpft, Augenbraue schräg = verstimmt, Mund-Pixel = froh). Mit den geplanten 24 × 30 Figuren (`claude/PLAN-PIXEL.md`, „Gefühle im Gesicht“) wird es deutlicher. **Ein Vorschau-Board mit drei Figuren × drei Gefühlen** kommt vor dem Bauen (Felix entscheidet).
- **Spruch:** Wechselt das Gefühl, sagt die Figur einen Satz (kurze Sprechblase im Kampffeld oder auf der Karte). Pro Figur je Gefühl 2 bis 3 Sätze, neue Einträge in `crewlife.js` (`froh`, `muede`, `sauer`), Figuren ohne Eintrag nach Rolle (`crewLifeRole`).
- **Keine Zahl, keine Leiste.** In der Werte-Tafel (22q) steht nur eine Zeile, z. B. „Froh: +1 Tempo“, damit die Wirkung nachlesbar ist.

## 6. Nach der Fahrt: Erinnerungen und Paare
- Die Stimmung selbst endet mit der Fahrt (nur `run.herz`).
- **Bleibt im Weltgedächtnis** (`profile.world`, F0 aus `PLAN-FOLGEN.md`), Vorschlag `profile.world.crew = { nami: { reden: 1, zuletzt: 'streit-steuer' } }`:
  - **Bitte um ein Gespräch:** Wer verstimmt heimkommt, steht am Steg mit einer Sprechblase „Können wir reden?“. Bis dahin pausieren nur ihre **gemeinsamen Momente** (Vertrautheit wächst trotzdem weiter, sie kämpft normal mit).
  - **Gespräch am Steg:** kleine Szene auf der Story-Bühne mit drei Antworten. Eine passt zur Figur (Nela will ernst genommen werden, Rafe will einfach Essen, Soren will in Ruhe gelassen werden), eine geht immer („Tut mir leid“), eine macht es schlimmer (dann noch einmal reden). Danach: Versöhnt, Zeile im Logbuch.
  - **Paare:** Schlichten und gemeinsame Siege lassen `pairXp` wachsen (gibt es schon). Neu nur: ein **Paar-Moment** bei hoher Paar-Vertrautheit (wie `moments.js`, aber für zwei Figuren), Texte Sonnet.
- **Logbuch** (in der Seekarte, Entscheidung aus `PLAN-FOLGEN.md` Abschnitt 9): „Nela und Soren haben sich über das Steuer gestritten. Du hast geschlichtet.“

## 7. Start ab Fahrt 2
- **Fahrt 1:** nur ein Hauch. Die Antwort am Steg (Storyboard Minute 0,5) kommt als Spruch zurück, z. B. Santo backt dir in Fahrt 2 doch noch Kuchen. Keine Gefühle-Regeln.
- **Fahrt 2:** Nach dem ersten Auslöser eine kurze Szene: Nela merkt, dass Rafe müde ist („Der hat zweimal einen Schlag kassiert. Der pfeift aus dem letzten Loch.“). Das erklärt das System einmal, danach läuft es still.
- Freischaltung über `features.js` (neuer Eintrag, `runs: 1`), damit Rückkehrer es auch sofort mit der Szene bekommen.

## 8. Technik und Sicherheit (für die Bau-Phase)
- **Replay-sicher:** `run.herz` ändert sich nur in der Engine (`run.js`) aus Ereignissen, die schon im Seed und in den Wahlen stecken (K.o., Rast, Bossende, Ereignis-Wahl). Ein Kampf liest die Gefühle **beim Start** als Eingabe (wie Wahl-Boni `run.start.fboni`), `GL.battle.simulate` bleibt deterministisch. Duelle und PvP (`kind === 'duel'`) bleiben ohne Gefühle.
- **Spielstand:** In der Fahrt nur `run.herz` (kein Profilfeld). Nach `finishRun` schreibt das Spiel die Bitten um ein Gespräch und Logbuch-Zeilen ins Weltgedächtnis (F0). Alte Stände: `{}` als Standard, keine Migration. Cloud-Sync wie bei F0.
- **Balance:** +1 Tempo und +5 % Angriff mit `tools/balance.html` messen (Siegquote vorher/nachher). Erschöpft (−20 % Leben) ebenfalls messen.
- Neue Texte zweisprachig `[de, en]`, Namen über `neutral.js` prüfen (`?welt=neutral`).

## 9. Reihenfolge (Plan von Felix freigegeben 24.10., Bauen erst nach eigenem Okay)
| Schritt | Inhalt | Wer | Hängt an |
|---|---|---|---|
| G0 | Vorschau-Board: drei Figuren × drei Gefühle im Gesicht | Opus (Pixel) | PLAN-PIXEL-Entscheidung |
| G1 | `run.herz` in der Engine: Auslöser K.o./Rast/Boss/Lieblingsessen, Wirkung froh/erschöpft, Gesicht und Spruch im Kampffeld | Opus | nichts (läuft auch ohne F0) |
| G2 | `herz`-Feld an 6 bis 8 Ereignissen, Ereignis „Zwei streiten“ mit Schlichten | Sonnet (Texte), Opus (Engine) | G1 |
| G3 | Bitte um ein Gespräch, Szene am Steg, Logbuch-Zeile, Paar-Momente | Opus + Sonnet | G1, F0 |

**Bündelung:** G1 kann allein live gehen (spürt man sofort im Kampf). G2 und G3 passen in das Sammel-Update „Eine Welt, die sich erinnert“ (Hafen Schritt 1, F0, F1).

## 10. Noch offen
- Welche 6 bis 8 Ereignisse bekommen ein `herz`-Feld (Vorschlag kommt mit G2).
- Gesichter: Board G0 hängt an der Pixelgröße (12 × 14 heute oder 24 × 30 aus `PLAN-PIXEL.md`).
