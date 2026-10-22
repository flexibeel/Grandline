# Grand Line: Arbeitsregeln für Claude

Kostenloses Fanprojekt von Felix (flexibeel) und Freunden. Es gibt kein Geld damit, wer etwas geben will, spendet ans Tierheim. Felix bezahlt Claude selbst, deshalb gilt: sparsam und gezielt arbeiten.

## Vorgehen
- **Erst fragen, dann bauen.** Bei neuen Ideen zuerst kurz vorschlagen (was, wo, wie groß) und eine Zusage abwarten. Erst designen und abstimmen, dann programmieren.
- **Fragen zum Anklicken.** Entscheidungen als Auswahl-Fragen stellen (Fragen-Werkzeug mit Antwortknöpfen), nicht als Liste im Text. Die empfohlene Antwort steht zuerst.
- **Klein anfangen.** Lieber eine Sache fertig machen als fünf anfangen. Keine großen Umbauten oder Neu-Designs ohne ausdrückliches Okay.
- **Nicht überladen.** Die Ideen-Liste ist eine Ideensammlung, kein Bauplan. Nur umsetzen, was ausdrücklich gewünscht ist.
- **Sparsam testen.** Ein gezielter Test statt vieler Durchläufe. Keine unnötig großen Ausgaben.

## Neuer Chat
- Zuerst `claude/FAHRPLAN.md` lesen (Stand, offene Zweige, Warteschlange). Code nur gezielt öffnen, nicht das ganze Projekt durchsuchen.
- Am Ende des Chats `claude/FAHRPLAN.md` aktualisieren (Live-Stand, Zweige, „Letzte Übergabe“) und mitpushen.
- Ist ein Thema fertig, als letzte Nachricht eine **Startnachricht für den nächsten Chat** als Codeblock ausgeben, genau in dieser Form (zum Rauskopieren für Felix und Jan):
  ```
  Arbeite im Repo flexibeel/Grandline, lies claude/FAHRPLAN.md.
  1. Schalte live: <Zweig> (<in einem Satz, was drin ist>)
  2. Nächstes Thema: <Punkt aus der Warteschlange>
  ```
- Steht „Schalte live“ in der Startnachricht, gilt das als Felix' Zusage für genau diesen Zweig: Patchnotes, `bump-version.py`, nach `main`, Fahrplan nachziehen. Danach mit dem nächsten Thema beginnen (erst kurz vorschlagen, dann bauen).

## Git und Live-Gang
- Jede Änderung auf einem eigenen Zweig (`feature/...` oder `fix/...`), nie direkt auf `main`.
- `main` ist live (GitHub Pages, thegreatline.de). Auf `main` nur nach ausdrücklichem „schalte live“ von Felix.
- Vor jedem Live-Gang: Eintrag in `js/data/patchnotes.js`, dann `python3 tools/bump-version.py` (sonst laden Browser die alte Version).
- `bump-version.py` bündelt dabei alle Skripte nach `js/build/` und verkleinert die CSS (`css/style.min.css`). Bearbeitet werden weiter die Einzeldateien. Neue Skripte zwischen die BUNDLE-Marker in `index.html` schreiben, sie landen automatisch in `tools/bundles.json`. Zum Verkleinern braucht es `npm i -g terser lightningcss-cli`.
- Mehrere kleine Commits pro Zweig sind gut. Zusammengeführt wird erst, wenn alles fertig und abgesegnet ist.

## Datenbank (Supabase-Projekt „Grandline“)
- Nur lesen ist okay. Schema-Änderungen, Migrationen, SQL-Skripte aus `tools/` und Datenlöschungen nur nach ausdrücklicher Zusage.
- Spielstände anderer Spieler nie ändern. Keine persönlichen Daten in Antworten wiedergeben.

## Modellwahl (spart Geld)
- **Sonnet:** Planen, Vorschläge, Texte und Übersetzungen, Patchnotes, Fahrplan, neue Inhalte nach bestehendem Muster, kleine Fixes, der Live-Gang nach festem Ablauf.
- **Opus:** Bauen über mehrere Dateien, knifflige Bugs, Kampfsystem, Supabase und Spielstände, Pixel-Art.
- Claude sagt von sich aus Bescheid, wenn ein Wechsel sinnvoll ist: „Jetzt bitte auf Opus umschalten“ bzw. „Das schafft auch Sonnet“.

## Stil
- Cozy Pixel-Look, Texte locker und witzig, Deutsch und Englisch (`[de, en]`).
- Kunst ist Felix wichtig: Lieber durchdacht und erkennbar als schnell generiert.
