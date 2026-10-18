// Englisch: Folgen und neue Zwischen-Events (Szenen bringen ihr Englisch selbst mit, hier nur Ergebnis-Zeilen und Chip)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, { 'Folge': 'Episode' });
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Bis zum Ende der Insel: Ganze Crew ([+-]\d+) Angriff$/, 'Until the island ends: whole crew $1 attack'],
  [/^Bis zum Ende der Insel: Ganze Crew ([+-]\d+) Leben$/, 'Until the island ends: whole crew $1 HP'],
  [/^Bis zum Ende der Insel: Ganze Crew ([+-]\d+) Tempo$/, 'Until the island ends: whole crew $1 speed']
]);
