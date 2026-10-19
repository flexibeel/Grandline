// Test für den Cloud-Abgleich (GL.cloudSync.decide in js/ui/save.js). Aufruf: node tools/sync-test.js
global.window = global;
const GL = require('../js/ui/save.js');
const S = GL.cloudSync;
let fail = 0;
const eq = (name, got, want) => { if (got !== want) { fail++; console.log('FEHLER', name, '→', got, 'erwartet', want); } else console.log('ok   ', name, '→', got); };

const H = 3600e3, now = Date.now();
const prof = (xp, runs, at, extra) => Object.assign({ version: 1, nickname: 'Felix', rankXp: xp, stats: { runs, wins: 0 }, savedAt: at, chest: [] }, extra || {});
const fresh = at => ({ version: 1, nickname: '', rankXp: 0, stats: { runs: 0 }, savedAt: at });

// 1) Kein Cloud-Stand: hochladen
eq('nur lokal', S.decide(prof(500, 20, now), null), 'push');
eq('ganz neu, nichts online', S.decide(fresh(now), null), 'none');
// 2) Zweites Gerät / Browser geleert: lokal leer, Cloud hat Fortschritt
eq('neues Gerät, leer', S.decide(fresh(now), prof(800, 30, now - H)), 'pull');
eq('neues Gerät, Name gewählt aber 0 EP', S.decide(prof(0, 0, now), prof(800, 30, now - H)), 'pull');
// 3) Gleicher Inhalt
eq('gleich', S.decide(prof(500, 20, now), prof(500, 20, now - H)), 'same');
// 4) Mit Basis (letzter Abgleich bekannt)
const A = prof(500, 20, now - 2 * H), B = prof(560, 22, now - H), C = prof(620, 25, now);
eq('nur hier weiter', S.decide(C, A, { base: { sig: S.sig(A) } }), 'push');
eq('nur Cloud weiter', S.decide(A, C, { base: { sig: S.sig(A) } }), 'pull');
// 5) Ohne Basis: neuer gewinnt, solange der ältere nicht klar weiter ist
eq('Cloud neuer, ähnlich weit', S.decide(B, C), 'pull');
eq('lokal neuer, ähnlich weit', S.decide(C, B), 'push');
// 6) DER Schutzfall: Cloud ist neuer, aber viel weniger Fortschritt → fragen statt überschreiben
eq('Cloud neuer aber leerer', S.decide(prof(3000, 120, now - H), prof(200, 5, now)), 'ask');
eq('lokal neuer aber Cloud weiter', S.decide(prof(200, 5, now), prof(3000, 120, now - H)), 'ask');
// 7) Beide geändert seit Basis
eq('beide geändert, Cloud neuer+ähnlich', S.decide(B, C, { base: { sig: S.sig(A) } }), 'pull');
eq('beide geändert, Cloud neuer aber leerer', S.decide(prof(3000, 120, now - H), prof(600, 21, now), { base: { sig: S.sig(A) } }), 'ask');
// 8) Basis = lokal, Cloud neuer aber deutlich zurück (z. B. altes Handy hat überschrieben) → fragen
eq('nur Cloud geändert, aber Rückschritt', S.decide(prof(3000, 120, now - H), prof(100, 2, now), { base: { sig: S.sig(prof(3000, 120, now - H)) } }), 'ask');
// 9) Konto gewechselt (gerade angemeldet): nie still hochladen
eq('angemeldet, lokal Gast ähnlich', S.decide(prof(100, 3, now), prof(120, 4, now - H), { switched: true }), 'pull');
eq('angemeldet, lokal Gast viel weiter', S.decide(prof(3000, 120, now), prof(100, 2, now - H), { switched: true }), 'ask');
// 10) Auf anderem Gerät zurückgesetzt
eq('Cloud wiped, lokal Fortschritt, neuer', S.decide(prof(3000, 120, now - H), { wiped: true, savedAt: now }), 'ask');
eq('Cloud wiped, lokal leer', S.decide(prof(0, 0, now - H), { wiped: true, savedAt: now }), 'push');
eq('Cloud wiped, Basis = lokal', S.decide(prof(3000, 120, now - H), { wiped: true, savedAt: now }, { base: { sig: S.sig(prof(3000, 120, now - H)) } }), 'ask');
// 11) Fingerabdruck: Reihenfolge der Schlüssel und savedAt/_runJ egal
eq('sig stabil', S.sig({ a: 1, b: { c: 2, d: [1, 2] }, savedAt: 1 }) === S.sig({ b: { d: [1, 2], c: 2 }, a: 1, savedAt: 9, _runJ: 'x' }), true);
eq('sig erkennt Änderung', S.sig({ a: 1 }) === S.sig({ a: 2 }), false);
// 12) Gleicher Zeitstempel: der Weitere gewinnt
eq('gleiche Zeit, Cloud weiter', S.decide(prof(100, 2, now), prof(3000, 100, now)), 'pull');
eq('gleiche Zeit, lokal weiter', S.decide(prof(3000, 100, now), prof(100, 2, now)), 'push');

console.log(fail ? `\n${fail} Fehler` : '\nAlle Tests bestanden');
process.exit(fail ? 1 : 0);
