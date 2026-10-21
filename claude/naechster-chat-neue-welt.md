# Übergabe für den nächsten Chat: Neue Welt

Stand: 21.10.2026, live ist **21v „Werft“** (`main`). Regeln stehen in `CLAUDE.md` (erst fragen, dann bauen; eigener Zweig; live nur nach „schalte live“).

## Was es gibt
- `neu/index.html`: Rahmen, lädt die Welt und die Kämpfe als iframe und reicht Nachrichten weiter (`postMessage`, `t:'kampf'`, `t:'ende'`).
- `neu/welt.html`: offene See in 3D (three.js). Spielstand in `localStorage` unter `gl.neu.v1` (`S`: hp, gold an Bord, bank im Hafen, up = Werft-Stufen).
- `neu/seekampf.html`: fahrender Seekampf. Liest `hp`, `max`, `kan`, `bhp`, `name`, `look` aus der URL.
- `neu/landgang.html`: Kampf an Land. Kennt die Werft-Upgrades noch nicht.

## Werft (21v)
- Knopf „⚒ Werft“, wenn das Schiff am Heimathafen liegt. Bezahlt wird nur mit `S.bank`.
- Rumpf +20 max. Leben pro Stufe (`maxHp()`), Kanonen +10 % Schaden im Seekampf (`km` im Kampfzustand), Segel +8 % Tempo.
- 3 Stufen je Upgrade, Preise 150 / 300 / 500. Pixelbilder 16×16 als Zeichen-Raster in `WUP` (welt.html).

## Nächste To-dos (Felix wählt)
1. **Upgrades sichtbar am Schiff:** größeres Segel, mehr Kanonen, Flicken am Rumpf.
2. **Rumpf auch im Landgang** wirken lassen.
3. **Mehr Gold-Ziele:** 4. Stufe oder Kosmetik (z. B. Flagge), falls Gold zu schnell nutzlos wird.

Die große Ideenliste ist das Dokument **„Grand Line: Ideenwerkstatt“** (Claude Docs, bei Felix). Offen unter „Ja, machen wir“: Piratin fertig (`feature/piratin`), Look-Inventur, Kampfszenen lebendiger, Kämpfer-Auswahl entschlacken, Performance. Die Liste „Erledigt“ dort endet bei 21o und könnte nachgetragen werden.

## Hinweise
- Repo ist umgezogen nach `flexibeel/Grandline` (alte Adresse leitet weiter).
- Klon ist flach: vor dem Zusammenführen `git fetch --depth=200 origin main`.
- Live-Gang: Eintrag in `js/data/patchnotes.js`, dann `python3 tools/bump-version.py` (braucht `npm i -g terser lightningcss-cli`). `tools/__pycache__` nicht mitcommitten.
- Test sparsam: ein Playwright-Lauf. Spielstand per `add_init_script` vor dem Laden setzen, sonst überschreibt die Seite ihn beim Neuladen.
