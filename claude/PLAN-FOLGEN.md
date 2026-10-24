# Plan: Entscheidungen mit Folgen, eine Welt zum Erkunden

Stand 23.10.2026. **Nur Plan, nichts gebaut.** Leitbild für alles, was als Nächstes kommt. Entstanden in einer Klick-Runde mit Jan (18. Chat). Jeder spätere Bau-Chat liest zuerst diese Datei und prüft: Bringt das, was ich baue, Folgen und Erkunden ins Spiel?

## 1. Leitbild (Jan, 23.10.)
- **Klicken ist okay, aber jeder Klick braucht Folgen.** Heute fühlt sich alles wie Point-and-Click an: Hafen, Fahrt, Kampf, Einstieg. Das Problem ist nicht das Klicken, sondern dass eine Wahl kaum etwas auslöst.
- **Gefühl am Anfang: Du erkundest eine Welt.** Nicht Menüs, nicht Listen, sondern Orte, die man entdeckt und an die man zurückkommt.
- Per Klick entschieden:
  - **Alle vier Folgen-Arten** sind gewollt: Die Welt merkt sich etwas, Ruf bei Fraktionen, Vorräte und Kurs, Crew mit Gefühlen.
  - **Erkunden = Seekarte mit Nebel über viele Fahrten**: Entdecktes bleibt aufgedeckt, mit Geheimnissen und Orten zum Wiederkommen.
  - **Folgen wirken kurz und lang**: Kleines sofort in der Fahrt, Großes bleibt in der Welt.
  - **Folgen werden angekündigt und später erinnert**: „Das wird man sich merken …“, später „Du hast uns damals geholfen!“

## 2. Warum es sich heute folgenlos anfühlt (geprüft im Code)
- **Ereignisse wirken fast nur sofort.** Jede Wahl in `js/data/events.js` (rund 20 Ereignisse) und den Crew-Zwischen-Events (`events2.js` bis `events5.js`) hat ein `outcome` wie `berry`, `heal`, `hurt`, `xp`, `relic` oder ein Glücksspiel.
- **Ausnahme, und ein gutes Vorbild:** die **zehn Folgen** (`GL.data.crewEpisodes`, `events3.js`/`events4.js`) mit drei Teilen pro Insel. Eine Wahl setzt ein `flag`, das Ende hängt davon ab. Das wirkt aber nur **innerhalb einer Insel**, nach der Fahrt ist es vergessen (Details: `claude/PLAN-WELT-MERKT.md`).
- **Es gibt kein Gedächtnis der Welt über Fahrten hinweg.** Das Profil kennt keine Merk-Liste für Orte, Fraktionen, Bekannte oder Taten.
- **Bausteine fürs Erinnern gibt es schon, nur verstreut:**
  - **Seekarte der Gerüchte** (`js/data/seekarte.js`, `js/engine/seekarte.js`, `js/ui/seekarte.js`, Profilfeld `profile.sk`): eigene Karte pro Meer, der Nebel lichtet sich **dauerhaft**, Hinweise führen zu Landgang-Orten. Liegt heute als Fenster im Hauptquartier, getrennt von der eigentlichen Fahrt.
  - **Vertrautheit** je Figur (`profile.squadXp`, `GL.meta.squadBonus`) und **gemeinsame Momente** (`js/data/moments.js`), die damit freigeschaltet werden.
  - **Crew-Leben** (`js/data/crewlife.js`): Lieblingsessen, Sprüche am Steg, Sätze nach Sieg und Niederlage, inklusive „an welchem Boss zuletzt gescheitert“. Das ist schon eine kleine Erinnerung.
  - **Story-Szenen** (`js/ui/story.js`) mit Bühne, Sprechblasen und Stimmen. Damit lassen sich Erinnerungen zeigen.
  - Achtung Namensgleichheit: **`js/data/factions.js` sind die Banden-Synergien im Kampf**, kein Ruf. Ruf wäre etwas Neues daneben (siehe 4B).

## 3. Das Fundament: ein Gedächtnis der Welt
Alles Weitere hängt an einem Baustein, deshalb kommt er zuerst.
- **Ein neues Profilfeld `profile.world`** (Weltgedächtnis), Standard `{}` für alte Stände, keine Migration nötig. Inhalt: kleine Merkzeichen, z. B. `{ orte: { 'orange-town': { geholfen: 1 } }, ruf: { kronwacht: -2 }, taten: ['zirkus-befreit'] }`.
- **Replay-Sicherheit:** Die Fahrt liest das Gedächtnis nur **beim Ablegen** und legt eine Kopie in `run.start` ab (so wie die Wahl-Boni `run.start.fboni`). Was während der Fahrt passiert, wird erst **nach** `finishRun` ins Profil geschrieben (so wie die Fahrtziel-Prämie). Damit bleiben Replays gleich.
- **Cloud-Sync:** Das Feld muss in den Abgleich „welcher Stand gilt?“ (`GL.cloudSync`) aufgenommen werden. Zusammenführen: pro Eintrag den höheren Stand nehmen, nichts löschen.
- **Logbuch** (steht im Gesamtplan unter „Fehlt noch“): eine Seite im Kapitän-Bereich, in der jede gemerkte Folge als Zeile steht („Orange Town: Du hast den Zirkus vertrieben. Die Leute grüßen dich.“). Das Logbuch macht das Gedächtnis sichtbar und ist der Ort für „angekündigt und später erinnert“.
- Gebaut wird das auf **Opus** (Spielstand, Cloud-Sync, Replays).

## 4. Die vier Säulen der Folgen
Jede Säule nutzt dasselbe Gedächtnis, wirkt kurz (in der Fahrt) und lang (in der Welt) und folgt demselben Muster: **ankündigen, merken, erinnern**.

### 4A. Die Welt merkt sich das (Orte)
- **Idee:** Was du an einem Ort tust, verändert ihn beim nächsten Besuch.
- **Beispiel:** Du hilfst in Orange Town gegen den Zirkus statt die Kasse mitzunehmen. Kurz: weniger Berry jetzt. Lang: Beim nächsten Besuch ist der Laden dort billiger, eine Figur aus dem Ort bietet sich in der Taverne an, ein Ereignis „Die Leute erkennen dich“ taucht auf.
- **Baut auf:** Ereignisse (`events.js`) bekommen neben `outcome` ein **`merk`**-Feld. Inseln (`islands.js`) und Ereignisse lesen `run.start.world` und bieten andere Wahlen oder Texte an.

### 4B. Ruf bei Fraktionen
- **Idee:** Die Fraktionen aus dem Weltbau (Kronwacht, Schattenkorps, Flossenvolk, Zirkus der Narren …) reagieren auf deine Taten.
- **Beispiel:** Du lässt einen Kronwacht-Gefangenen frei. Kurz: ein Kampf weniger. Lang: Die Kronwacht wird misstrauisch (mehr Patrouillen auf der Karte), dafür grüßt dich das Flossenvolk (eine neue Figur, ein Geheimweg auf der Seekarte).
- **Baut auf:** Ruf als kleine Zahl pro Fraktion in `profile.world.ruf` (etwa −3 bis +3, mit Namen wie „gesucht“, „geduldet“, „Freund“). Wirkt auf Kartentopf (`nodeTypes`), Gegnerauswahl und Taverne. Nicht verwechseln mit den Banden-Synergien.
- **Hängt am Weltbau:** Die Fraktionen dort sind genau die Träger des Rufs. Erst wenn die Namen feststehen (Weltbau-Welle B), lohnt sich die Säule.

### 4C. Vorräte und Kurs
- **Idee:** Die Route wird eine echte Abwägung. Lange, sichere Wege kosten Proviant, kurze sind gefährlicher.
- **Beispiel:** Auf der Inselkarte zeigt jeder Weg, was er kostet (🍖 2) und was droht. Ist der Proviant leer, wird die Crew schwächer, bis man rastet oder einkauft.
- **Baut auf:** „Kombüse/Vorräte“ steht im Gesamtplan unter „Fehlt noch“. Proviant gilt nur **in der Fahrt** (kein Profilfeld), deshalb risikoärmer als die anderen Säulen. Lang wirkt nur, was man auf der Seekarte entdeckt (z. B. eine Proviant-Bucht, die bleibt).
- **Balance:** Muss mit `tools/balance.html` gemessen werden, sonst wird jede Fahrt zäher.

### 4D. Crew mit Gefühlen
- **Idee:** Figuren sind nicht nur Werte. Sie werden verletzt, mögen sich, streiten und erinnern sich.
- **Beispiel:** Du schickst Nela zweimal in den Sturm. Kurz: Sie ist „erschöpft“ und setzt einen Kampf aus. Lang: Sie und Lasse wachsen zusammen (neuer gemeinsamer Moment), oder sie ist sauer und will in der Taverne neu verhandelt werden.
- **Baut auf:** Vertrautheit (`profile.squadXp`), gemeinsame Momente (`moments.js`), Crew-Leben (`crewlife.js`) und Duos. Neu wäre nur eine kleine Stimmung pro Figur und Fahrt (nur `run`) plus Erinnerungen im Gedächtnis.
- **Detailplan:** `claude/PLAN-GEFUEHLE.md` (24.10.).
- **Vorsicht:** Eine Figur darf nie für immer verloren gehen. Höchstens Pause oder Bitte um Versöhnung, kein Dauerverlust (Spieler hängen an ihren Figuren).

## 5. Erkunden: die Seekarte wird die Karte der Welt
- **Heute:** Die Seekarte der Gerüchte ist ein Nebenfenster im Hauptquartier für Landgänge.
- **Vorschlag:** Sie wird zum **Herz des Erkundens**. Jede Fahrt deckt dort etwas auf: die Inseln, die man besucht hat, Orte aus Gerüchten, Spuren der Fraktionen. Was man entdeckt hat, bleibt, mit Markierungen für Folgen (Herz = Ort mag dich, Siegel = Kronwacht sucht dich).
- **Bezug zum Hafen:** Im neuen Hafen (Skizze `claude/HAFEN-SKIZZE.md`) gehört sie ins **Dock**, dort wo man ablegt. Wer im Dock die Karte öffnet, sieht, was er schon kennt, und wählt danach sein Ziel.
- **Bezug zum Weltbau:** Die fünf Meere bekommen dort ihr Gesicht, die Strömung, die Inseln neu mischt, erklärt, warum sich Orte trotzdem verändern.
- **Bezug zu Endless:** Die Meer-Regeln aus `claude/ENDLESS-SKIZZE.md` werden auf der Karte sichtbar.

## 6. Ankündigen und Erinnern (gemeinsames Muster für alle Säulen)
1. **Ankündigen** an der Wahl selbst: kleines Siegel „⚓ Das wird man sich merken“ (und im Hinweis, was sich ungefähr ändert, ohne Zahlen).
2. **Merken** nach der Fahrt: eine Zeile im Fahrtende-Bildschirm („Orange Town wird sich daran erinnern“) und im Logbuch.
3. **Erinnern** später: Wenn eine Folge greift, sagt das Spiel es ausdrücklich, als Sprechblase oder kurze Story-Szene („Ihr seid doch die, die uns damals geholfen habt!“). Ohne diesen Moment merkt niemand, dass es eine Folge war.

## 7. Reihenfolge (Planung, Bauen erst nach eigenem Okay)
| Schritt | Inhalt | Wer | Hängt an |
|---|---|---|---|
| F0 | Weltgedächtnis `profile.world`, Kopie in `run.start`, Cloud-Sync, Logbuch-Seite | Opus | nichts |
| F1 | 8 bis 10 bestehende Ereignisse bekommen `merk` und eine Rückkehr-Variante, Siegel und Erinnerungs-Sprechblase | Sonnet (Texte), Opus (Anzeige) | F0 |
| F2 | Seekarte ins Dock, Fahrten decken sie auf, Folgen-Markierungen | Opus | F0, Hafen Schritt 1 |
| F3 | Crew-Stimmung pro Fahrt, Erinnerungen der Figuren | Opus | F0 |
| F4 | Ruf bei Fraktionen | Opus | F0, Weltbau Welle B |
| F5 | Vorräte und Kurs | Opus + Messung | Karte (`genChart`) |

**Bündelung:** Hafen Schritt 1, F0 und F1 passen gut in ein gemeinsames Sammel-Update „Eine Welt, die sich erinnert“. Dann erlebt man sofort: Ich habe ein Zuhause, und meine Wahl kommt zurück.

## 8. Looks per Vorschau-Board (Jan, 23.10.)
Entscheidungen über Aussehen (Mütze, Begleiter, Farbe, Accessoire) laufen über **Vorschau-Boards**: Claude zeichnet mit der Sprite-Engine des Spiels (`GL.sprites.render`) pro Figur 3 bis 4 Varianten auf ein Blatt, zeigt es als Artefakt, Jan und Felix klicken die beste. So sieht die Vorschau genau wie im Spiel aus. Die Entscheidung kommt danach in den passenden Plan.

## 9. Entscheidungen der zweiten Klick-Runde (23.10., Jan, alle wie empfohlen)
1. **Zuerst im Detail geplant wird 4A „Die Welt merkt sich das“**, eigener Plan: `claude/PLAN-WELT-MERKT.md`.
2. **Das Logbuch steckt in der Seekarte**, keine eigene Seite. Jede Folge steht als Markierung an dem Ort, wo sie passiert ist; Antippen zeigt die Zeile. Für F0 heißt das: Die Seekarte (heute im Hauptquartier, später im Dock) bekommt die Logbuch-Markierungen, auch bevor sie umzieht.
3. **Ruf zeigt einen Stufennamen, keine Zahl** („Gesucht“, „Geduldet“, „Freund“ …) plus die Reaktionen der Welt. Intern bleibt es eine kleine Zahl.
4. **Crew-Gefühle: Pause und Versöhnung, nie Verlust.** Eine Figur kann aussetzen oder reden wollen, verlässt die Crew aber nie.

Noch offen: wie viele und welche Ereignisse in F1 zurückkommen (wird in `PLAN-WELT-MERKT.md` vorgeschlagen).
