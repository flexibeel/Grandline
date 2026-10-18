// Team-Fähigkeiten: Ist eine Bande voll (höchste Stufe), lädt jede Ulti ihrer Seite den Team-Balken.
// Nach `need` Ultis zündet die Team-Fähigkeit (kann im selben Kampf erneut laden).
//   fx wie bei Ultis: strike (mult, target all/front/weakest, pierce), status (key, rounds, target), heal (pct, target all)
window.GL = window.GL || {};
GL.data = GL.data || {};
GL.data.teamNeed = 3;
GL.data.teamMoves = {
  strohhut:    { name: 'Strohhut-Sturm',      text: 'Alle Gegner getroffen, die Crew heilt 12 %',               fx: [{ do: 'strike', mult: 1.0, target: 'all' }, { do: 'heal', pct: 0.12, target: 'all' }] },
  marine:      { name: 'Buster Call',         text: 'Schwerer Beschuss auf alle Gegner',                         fx: [{ do: 'strike', mult: 1.3, target: 'all' }] },
  cp9:         { name: 'Rokuogan',            text: 'Ein vernichtender Schlag auf den Vordersten, er ist betäubt', fx: [{ do: 'strike', mult: 2.4, target: 'front', pierce: true }, { do: 'status', key: 'stun', rounds: 1, target: 'hit' }] },
  weissbart:   { name: 'Für die Familie',     text: 'Die Crew heilt 22 % und bekommt Mut',                       fx: [{ do: 'heal', pct: 0.22, target: 'all' }, { do: 'status', key: 'brave', rounds: 3, target: 'allies' }] },
  samurai:     { name: 'Sieben Klingen',      text: 'Trifft den Schwächsten hart und alle anderen leicht',       fx: [{ do: 'strike', mult: 2.2, target: 'weakest' }, { do: 'strike', mult: 0.5, target: 'all' }] },
  baroque:     { name: 'Geheimauftrag',       text: 'Alle Gegner geschwächt, die Crew +2 Angriff',               fx: [{ do: 'status', key: 'weak', rounds: 3, target: 'all' }, { do: 'atk', value: 2, target: 'allies' }] },
  buggy:       { name: 'Buggy-Kanone',        text: 'Großer Knall auf alle Gegner, sie erschrecken',             fx: [{ do: 'strike', mult: 0.9, target: 'all' }, { do: 'status', key: 'fear', rounds: 2, target: 'all' }] },
  fischmensch: { name: 'Fischmenschen-Karate', text: 'Harter Stoß auf den Vordersten, alle Gegner bluten',      fx: [{ do: 'strike', mult: 1.8, target: 'front' }, { do: 'status', key: 'bleed', rounds: 3, value: 3, target: 'all' }] },
  revolution:  { name: 'Revolutionswind',     text: 'Sturm über alle Gegner, sie sind geschwächt',               fx: [{ do: 'strike', mult: 0.9, target: 'all' }, { do: 'status', key: 'weak', rounds: 2, target: 'all' }] },
  rothaar:     { name: 'Königs-Haki',         text: 'Alle Gegner erstarren vor Furcht, die Crew bekommt Mut',    fx: [{ do: 'status', key: 'fear', rounds: 2, target: 'all' }, { do: 'status', key: 'brave', rounds: 2, target: 'allies' }] },
  supernova:   { name: 'Neue Ära',            text: 'Alle Gegner getroffen, alle brennen',                       fx: [{ do: 'strike', mult: 1.0, target: 'all' }, { do: 'status', key: 'burning', rounds: 3, value: 3, target: 'all' }] },
  thriller:    { name: 'Schattenarmee',       text: 'Alle Gegner vergiftet, die Crew heilt 15 %',                fx: [{ do: 'status', key: 'poison', rounds: 3, value: 3, target: 'all' }, { do: 'heal', pct: 0.15, target: 'all' }] }
};
