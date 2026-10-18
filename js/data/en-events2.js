// Englisch: Zwischen-Events (die Szenen bringen ihr Englisch selbst mit, hier nur die Ergebnis-Zeilen)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.en = Object.assign(GL.data.en || {}, { 'Unterwegs': 'On the way' });
GL.i18nExtraP = (GL.i18nExtraP || []).concat([
  [/^Ganze Crew \+(\d+) Angriff$/, 'Whole crew +$1 attack'],
  [/^Ganze Crew \+(\d+) Leben$/, 'Whole crew +$1 HP'],
  [/^Ganze Crew \+(\d+) Tempo$/, 'Whole crew +$1 speed'],
  [/^Ganze Crew \+(\d+) % Krit-Chance$/, 'Whole crew +$1% crit chance']
]);
