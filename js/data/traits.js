// Eigenschaften: jedes neue Crewmitglied bekommt zufällig eine (wie Wesen bei Pokémon).
//   base = Änderung der Grundwerte beim Beitritt (hp, atk, spd)
//   mods = Werte im Kampf, gelten nur für diese Figur (Aufbau wie in types.js, ohne scope)
//   xpMult = Faktor auf gesammelte Erfahrung
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.traits = [
  { id: 'mutig',     name: 'Mutig',      text: '+2 Angriff, -1 Tempo',          base: { atk: 2, spd: -1 } },
  { id: 'zaeh',      name: 'Zäh',        text: '+8 Leben',                      base: { hp: 8 } },
  { id: 'flink',     name: 'Flink',      text: '+2 Tempo',                      base: { spd: 2 } },
  { id: 'glueck',    name: 'Glückspilz', text: '+12 % Krit-Chance',             mods: { crit: 0.12 } },
  { id: 'eisern',    name: 'Eisern',     text: 'Erleidet 1 weniger Schaden',    mods: { armor: 1 } },
  { id: 'wild',      name: 'Wild',       text: '+20 % Schaden, -4 Leben',       base: { hp: -4 }, mods: { dmgPct: 0.2 } },
  { id: 'geschickt', name: 'Geschickt',  text: '+12 % Ausweichen',              mods: { dodge: 0.12 } },
  { id: 'ehrgeizig', name: 'Ehrgeizig',  text: '+50 % Erfahrung',               xpMult: 1.5 },
  { id: 'zaehlebig', name: 'Selbstheiler', text: 'Heilt 2 Leben pro Runde',     mods: { regen: 2 } },
  { id: 'jaeger',    name: 'Kopfgeldjäger', text: '+30 % Schaden gegen Bosse',  mods: { bossPct: 0.3 } }
];
