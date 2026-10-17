// Namensfilter: sperrt beleidigende, menschenverachtende und rechtsextreme Namen.
// Prüft auch Schreibweisen mit Zahlen statt Buchstaben (n1gg…), Leerzeichen/Punkte dazwischen und Codes wie 88.
// GL.nameCheck(name) -> { ok: true } oder { ok: false, msg }
window.GL = window.GL || {};

(function () {
  // Kommen sie irgendwo im Namen vor (auch zusammengeschrieben), ist der Name gesperrt.
  const PARTS = [
    // rassistisch / menschenverachtend
    'nigg', 'nigga', 'neger', 'negro', 'kanake', 'kanacke', 'kanak', 'zigeun', 'untermensch', 'kike', 'chink', 'gook',
    'wetback', 'judensau', 'drecksjud', 'saujud', 'auslaenderraus', 'auslanderraus', 'whitepower', 'whitepride', 'wpww',
    'rassenkrieg', 'herrenrasse', 'bimbo', 'kameltreiber', 'polacke', 'schlitzaug', 'mohrenkopf',
    // NS / rechtsextrem
    'hitler', 'nazi', 'siegheil', 'heilhitler', 'nsdap', 'holocaust', 'auschwitz', 'gaskammer', 'reichsadler',
    'drittesreich', 'fuehrer', 'fuhrer', 'swastika', 'hakenkreuz', 'kukluxklan', 'kkk', 'blutundehre', 'bloodandhonour',
    'bloodandhonor', 'combat18', 'endsieg', 'volksverraet', 'reichsbuerger', 'isis', 'jihad', 'dschihad',
    // frauenfeindlich / sexualisiert
    'hure', 'hurensohn', 'schlampe', 'fotze', 'nutte', 'whore', 'slut', 'bitch', 'cunt', 'milf', 'porno', 'pornhub',
    'vergewalt', 'rapist', 'pedophil', 'paedophil', 'paedo', 'kinderf', 'kinderschaend', 'penis', 'vagina', 'pimmel',
    'schwanzlutsch', 'blowjob', 'wichs', 'fick', 'fuck', 'motherf', 'sexsklav', 'tittie', 'titten', 'boobs', 'lolicon',
    // queerfeindlich
    'faggot', 'fagot', 'schwuchtel', 'tranny', 'transe', 'kampflesb',
    // ableistisch
    'spast', 'spasti', 'behindert', 'retard', 'mongoloid', 'kruppel', 'krueppel', 'missgeburt', 'vollidiot',
    // beleidigend
    'arschloch', 'arschgesicht', 'wixer', 'wichser', 'opfer', 'drecksau', 'scheiss', 'shit', 'asshole', 'dickhead',
    'bastard', 'kotzbrocken', 'hundesohn', 'pisser', 'lappen', 'spacko', 'idiot', 'dumm', 'stupid',
    // Missbrauch der Rangliste
    'admin', 'moderator'
  ];
  // Nur als ganzes Wort gesperrt (sonst würden harmlose Namen hängen bleiben)
  const WORDS = ['ss', 'sa', 'hj', 'nsu', 'afd', 'spic', 'paki', 'fag', 'homo', 'mohr', 'jude', 'juden', 'heil', 'reich',
                 'arsch', 'sau', 'kz', 'npd', 'sex', 'nackt', 'tod', 'kill', 'rape', 'mongo', 'pedo'];
  // Zahlencodes (rechtsextrem): als eigene Zahl im Namen gesperrt
  const NUMBERS = ['14', '18', '28', '88', '1488', '8814', '1418', '168', '311', '198', '2488'];
  const LEET = { '0': 'o', '1': 'i', '!': 'i', '|': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '8': 'b', '9': 'g', '6': 'g', '2': 'z' };
  const ALLOWED = /^[\p{L}\p{N} ._\-'!?]+$/u;

  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function deleet(s) { return s.replace(/[0-9!|@$]/g, c => LEET[c] || c); }
  // doppelte Buchstaben zusammenziehen (niiigg -> nig) für einen zweiten Durchgang
  const squeeze = s => s.replace(/(.)\1+/g, '$1');

  function check(name) {
    const raw = String(name || '').trim();
    if (raw.length < 2) return { ok: false, msg: 'Der Name braucht mindestens 2 Zeichen.' };
    if (!ALLOWED.test(raw)) return { ok: false, msg: 'Bitte nur Buchstaben, Zahlen, Leerzeichen und . - _ verwenden. Keine Symbole oder Emojis.' };
    const n = norm(raw);
    const digits = n.match(/\d+/g) || [];
    if (digits.some(d => NUMBERS.includes(d) || /1488|88$|^88/.test(d))) return { ok: false, msg: 'Diese Zahl ist als Code bekannt und nicht erlaubt. Bitte eine andere wählen.' };
    const plain = n.replace(/[^a-z0-9]+/g, ' ').trim();
    const words = plain.split(' ').concat(deleet(plain).split(' '));
    const compactA = plain.replace(/ /g, '');
    const compactB = deleet(n).replace(/[^a-z]+/g, '');
    const forms = [compactA, compactB, squeeze(compactA), squeeze(compactB)];
    const sq = s => squeeze(s);
    const hit = PARTS.find(p => forms.some(f => f.includes(p) || (sq(p).length >= 4 && f.includes(sq(p))))) || WORDS.find(w => words.includes(w) || compactA === w || compactB === w);
    if (hit) return { ok: false, msg: 'Dieser Name ist nicht erlaubt. Bitte wähle einen freundlichen Piratennamen.' };
    return { ok: true };
  }

  GL.nameCheck = check;
  // Für die Anzeige fremder Namen: gesperrte Namen werden ersetzt
  GL.safeName = name => (check(name).ok ? name : 'Pirat');
})();
