// Crew-Sprüche im Kampf (JUICE): ganz selten eine kleine Sprechblase.
// Anlässe: ko (ein Freund fällt, {n} = sein Name), close (knapper Sieg), boss (Boss besiegt), party (erster Meeres-Boss im Leben).
// Höchstens eine Blase pro Kampf, danach zwei Kämpfe Ruhe, nie bei schnellem Tempo.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.crewQuips = {
  ruffy: {
    ko: [['{n}! Steh auf, es gibt gleich Fleisch!', '{n}! Get up, there\'s meat soon!'], ['Hey! Das war MEIN Freund!', 'Hey! That was MY friend!']],
    close: [['Knapp. Aber satt werd ich trotzdem.', 'Close. Still hungry though.'], ['Hahaha! Fast tot! Nochmal?', 'Hahaha! Nearly dead! Again?']],
    boss: [['Geschafft! Wer hat Hunger?', 'Done! Who\'s hungry?'], ['Der war zäher als Tiefseeriesen-Steak.', 'Tougher than Deep Giant steak.']],
    party: [['Wir sind jetzt richtig berühmt! Gibt\'s dafür Fleisch?', 'We\'re properly famous now! Does that come with meat?']]
  },
  zorro: {
    ko: [['{n}. Ruh dich aus. Ich mach das.', '{n}. Rest. I\'ve got this.'], ['Tch. Wer hat dir das erlaubt?', 'Tch. Who said you could do that?']],
    close: [['Ein Kratzer. Zwei. Egal.', 'A scratch. Two. Whatever.'], ['Ich hab nur kurz die Augen zugemacht.', 'I only closed my eyes for a second.']],
    boss: [['Erledigt. Wo geht\'s hier zum Schiff?', 'Done. Which way is the ship?'], ['Nicht schlecht. Für einen Anfang.', 'Not bad. For a start.']],
    party: [['Feiert ruhig. Ich mach ein Nickerchen. Im Stehen.', 'Go ahead and celebrate. I\'ll nap. Standing up.']]
  },
  nami: {
    ko: [['{n}! Du schuldest mir noch Geld, also steh auf!', '{n}! You still owe me money, so get up!'], ['Das kommt auf die Rechnung.', 'That\'s going on the bill.']],
    close: [['Das war knapp. Das kostet extra.', 'That was close. That costs extra.'], ['Nie wieder. Bis zum nächsten Mal.', 'Never again. Until next time.']],
    boss: [['Und jetzt: Kassensturz!', 'And now: counting the loot!'], ['Hat der Boss eigentlich Taschen?', 'Does the boss have pockets?']],
    party: [['Erster Boss! Ich hab schon ausgerechnet, was das wert ist. Viel.', 'First boss! I\'ve already worked out what it\'s worth. A lot.']]
  },
  lysop: {
    ko: [['{n}!! Ich räche dich! Gleich! Nach dem Zittern!', '{n}!! I\'ll avenge you! Soon! After the shaking!'], ['Das war geplant. Glaub ich.', 'That was planned. I think.']],
    close: [['Meine Knie haben gewonnen. Knapp.', 'My knees won. Barely.'], ['Das erzähle ich später heldenhafter.', 'I\'ll tell this more heroically later.']],
    boss: [['Achttausend Mann hätten das nicht geschafft!', 'Eight thousand men couldn\'t have done it!'], ['Ich hatte nie Angst. Fast nie.', 'I was never scared. Almost never.']],
    party: [['Davon erzähle ich meinen Enkeln. Mit mehr Drachen.', 'I\'ll tell my grandkids about this. With more dragons.']]
  },
  sanji: {
    ko: [['{n}! Ich koch dir was. Halt durch.', '{n}! I\'ll cook you something. Hang in there.'], ['Niemand verletzt meine Crew. Außer mir.', 'Nobody hurts my crew. Except me.']],
    close: [['Fast angebrannt. Aber serviert.', 'Nearly burnt. But served.'], ['Zigarette. Jetzt.', 'Cigarette. Now.']],
    boss: [['Das Menü heute: Sieg, mit Beilage.', 'Today\'s menu: victory, with a side.'], ['Gut durch. So mag ich das.', 'Well done. Just how I like it.']],
    party: [['Heute Abend koche ich. Alle essen. Auch der Moosschädel.', 'I\'m cooking tonight. Everyone eats. Even the moss-head.']]
  },
  chopper: {
    ko: [['{n}! Ich bin gleich da! Arzt! Ich bin der Arzt!', '{n}! Coming! Doctor! I\'m the doctor!'], ['Nicht bewegen! Ich hab Pflaster!', 'Don\'t move! I have plasters!']],
    close: [['Alle bitte heute früh ins Bett.', 'Everyone to bed early tonight, please.'], ['Ich brauche mehr Verbandszeug.', 'I need more bandages.']],
    boss: [['Ich freu mich gar nicht, du Idiot!', 'I\'m not happy at all, you jerk!'], ['Der Boss braucht jetzt auch einen Arzt.', 'The boss needs a doctor now too.']],
    party: [['Ein Boss! Ich freu mich überhaupt nicht! Hehe!', 'A boss! I\'m not happy about it at all! Hehe!']]
  },
  robin: {
    ko: [['{n} ruht nur. Hoffentlich.', '{n} is only resting. Hopefully.'], ['Wie unhöflich von denen.', 'How rude of them.']],
    close: [['Interessant. Wir hätten sterben können.', 'Interesting. We could have died.'], ['Knapp. Das schreibe ich auf.', 'Close. I\'ll make a note.']],
    boss: [['Ein Kapitel weniger in seiner Geschichte.', 'One less chapter in his story.'], ['Er fiel sehr historisch.', 'He fell very historically.']],
    party: [['Der erste Eintrag in unserem Geschichtsbuch. Mit Fußnoten.', 'The first entry in our history book. With footnotes.']]
  },
  franky: {
    ko: [['{n}! Nicht SUPER! Gar nicht SUPER!', '{n}! Not SUPER! Not SUPER at all!'], ['Das reparier ich. Mit Cola.', 'I\'ll fix that. With cola.']],
    close: [['Knapp! Aber SUPER knapp!', 'Close! But SUPER close!'], ['Nachher wird nachgebessert.', 'Repairs later.']],
    boss: [['SUUUPER!', 'SUUUPER!'], ['Gebaut für so was!', 'Built for this!']],
    party: [['Das ist so SUPER, ich glaube, ich weine. Nein. Doch.', 'This is so SUPER, I think I\'m crying. No. Yes.']]
  },
  brook: {
    ko: [['{n}! Sterben ist nicht so toll, glaub mir.', '{n}! Dying isn\'t great, trust me.'], ['Mir gefriert das Blut. Hab keins.', 'My blood runs cold. I have none.']],
    close: [['Mir ist das Herz in die Hose gerutscht. Hab keins. Yohoho!', 'My heart sank. I have none. Yohohoho!'], ['Knochenarbeit!', 'Bone-breaking work!']],
    boss: [['Yohohoho! Ein Lied für den Sieg!', 'Yohohoho! A song for victory!'], ['Mir fällt ein Stein vom Herzen. Ich hab nur Rippen.', 'A weight off my heart. I only have ribs.']],
    party: [['Ein Siegeslied! Ich spiele es zwölfmal. Mindestens.', 'A victory song! I\'ll play it twelve times. At least.']]
  },
  vivi: {
    ko: [['{n}! Ich lasse niemanden zurück!', '{n}! I leave no one behind!'], ['Bitte halte durch!', 'Please hold on!']],
    close: [['Das war knapper als die Wüste trocken ist.', 'That was closer than the desert is dry.']],
    boss: [['Für alle, die zu Hause warten!', 'For everyone waiting at home!']],
    party: [['Ein Boss gefallen. Alabasta wäre stolz.', 'A boss has fallen. Alabasta would be proud.']]
  },
  ace: {
    ko: [['{n}! Das zahl ich dir heim!', '{n}! I\'ll pay them back for that!'], ['Jetzt wird\'s mir warm.', 'Now I\'m getting warm.']],
    close: [['Knapp. Ich bin trotzdem nicht eingeschlafen.', 'Close. I didn\'t even fall asleep.']],
    boss: [['Feuer aus. Seins jedenfalls.', 'Fire\'s out. His, anyway.']],
    party: [['Erster Boss! Das muss ich meinem kleinen Bruder erzählen.', 'First boss! I have to tell my little brother.']]
  },
  law: {
    ko: [['{n}. Ich operiere später. Bleib liegen.', '{n}. I\'ll operate later. Stay down.']],
    close: [['Medizinisch gesehen: zu knapp.', 'Medically speaking: too close.']],
    boss: [['Room geschlossen.', 'Room closed.']],
    party: [['Wir feiern. Kurz. Dann wird geplant.', 'We celebrate. Briefly. Then we plan.']]
  },
  jinbei: {
    ko: [['{n}! Ich stehe für dich ein.', '{n}! I\'ll stand for you.']],
    close: [['Ruhige See ist nie umsonst.', 'Calm seas are never free.']],
    boss: [['Ein ehrlicher Sieg.', 'An honest victory.']],
    party: [['Ein guter Tag für diese Crew. Ich bin stolz, an Bord zu sein.', 'A good day for this crew. Proud to be aboard.']]
  },
  koby: {
    ko: [['{n}! Ich werde stärker, versprochen!', '{n}! I\'ll get stronger, I promise!']],
    close: [['Ich hab überlebt! Ich hab ÜBERLEBT!', 'I survived! I SURVIVED!']],
    boss: [['Das melde ich… niemandem. Gute Idee.', 'I\'ll report this to… no one. Good idea.']],
    party: [['Wenn das meine Ausbilder sehen könnten. Besser nicht.', 'If my instructors could see this. Better not.']]
  },
  buggy: {
    ko: [['{n}! Du feiger Hund, wer hält jetzt meinen Umhang?', '{n}! Coward, who holds my cape now?']],
    close: [['Alles nach Plan! Meinem genialen Plan!', 'All according to plan! My brilliant plan!']],
    boss: [['Wer hat gewonnen? ICH! Und ihr ein bisschen.', 'Who won? ME! And you a little.']],
    party: [['Applaus! Für mich! Ihr dürft mitklatschen.', 'Applause! For me! You may clap along.']]
  },
  bonclay: {
    ko: [['{n}! Freundschaft stirbt nie, nur du gerade kurz!', '{n}! Friendship never dies, only you, briefly!']],
    close: [['Das war ein Tanz am Abgrund! En garde!', 'That was a dance on the edge! En garde!']],
    boss: [['Ballett des Sieges!', 'Ballet of victory!']],
    party: [['Freunde! Wir tanzen! Ich bestehe darauf!', 'Friends! We dance! I insist!']]
  },
  smoker: {
    ko: [['{n}. Tch. Steh auf.', '{n}. Tch. Get up.']],
    close: [['Zu knapp. Ich brauch zwei Zigarren.', 'Too close. I need two cigars.']],
    boss: [['Einer weniger. Die Akte wird dünner.', 'One down. The file gets thinner.']],
    party: [['Feiert. Ich steh daneben und rauche.', 'Celebrate. I\'ll stand here and smoke.']]
  }
};

// Für alle anderen: je nach Rolle
GL.data.crewQuipsRole = {
  brecher: {
    ko: [['{n}! Hinter mich, alle!', '{n}! Everyone behind me!'], ['Den nächsten Schlag nehme ich.', 'I\'ll take the next hit.']],
    close: [['Ich hab alles abgefangen. Fast alles.', 'I caught everything. Almost everything.']],
    boss: [['Der stand im Weg. Jetzt nicht mehr.', 'He was in the way. Not anymore.']],
    party: [['Ein Boss! Ich hab jeden Schlag gespürt. Lohnt sich trotzdem.', 'A boss! I felt every hit. Worth it anyway.']]
  },
  kaempfer: {
    ko: [['{n}! Das bezahlen die.', '{n}! They\'ll pay for that.'], ['Ich mach für zwei weiter.', 'I\'ll fight for two.']],
    close: [['Knapp. Ich nenne es Taktik.', 'Close. I call it tactics.']],
    boss: [['Und Schluss.', 'And done.']],
    party: [['Unser erster Boss. Ich hätte gern ein Andenken. Sein Hut vielleicht.', 'Our first boss. I\'d like a souvenir. His hat, maybe.']]
  },
  helfer: {
    ko: [['{n}! Ich bin da, gleich!', '{n}! I\'m coming!'], ['Nicht schon wieder.', 'Not again.']],
    close: [['Alle heil. So halbwegs.', 'Everyone\'s fine. Roughly.']],
    boss: [['Ich verbinde jetzt alle. Auch den Boss?', 'Bandaging everyone now. The boss too?']],
    party: [['Erster Boss! Ich habe Tee gekocht. Für alle. Er ist kalt.', 'First boss! I made tea. For everyone. It\'s cold.']]
  }
};

// 4D Crew mit Gefühlen (G1): ein Satz, wenn sich ein Gefühl ändert. Nach Rolle, der eigene Pirat eigen.
// essen = Lieblingsessen bei der Rast, boss = beste Figur im Bosskampf, muede = zweimal K.o. ohne Rast.
GL.data.herzQuips = {
  self: {
    froh: [['Ich hab ein gutes Gefühl bei diesem Kampf!', 'I have a good feeling about this fight!'], ['Heute segelt sich alles leichter.', 'Everything sails easier today.']],
    boss: [['Habt ihr das gesehen?! Euer Kapitän!', 'Did you see that?! Your captain!'], ['Den nehm ich ins Logbuch. Mit Ausrufezeichen.', 'That goes in the log. With an exclamation mark.']]
  },
  kaempfer: {
    froh: [['Heute bin ich nicht zu bremsen!', 'Nothing\'s stopping me today!'], ['Ich fühl mich leicht wie eine Möwe.', 'I feel light as a gull.']],
    essen: [['Mein Lieblingsessen! Jetzt geht\'s los!', 'My favourite food! Let\'s go!'], ['Mit vollem Bauch kämpft sich\'s schneller.', 'A full belly fights faster.']],
    boss: [['Habt ihr das gesehen?!', 'Did you see that?!'], ['Den hab ich ganz allein… fast allein.', 'I did that all by myself… almost.']],
    muede: [['Zwei Schläge zu viel. Ich bin platt.', 'Two hits too many. I\'m beat.'], ['Nur kurz die Augen zu… nein, Kampf. Okay.', 'Just resting my eyes… no, fight. Okay.']]
  },
  helfer: {
    froh: [['Was für ein schöner Tag zum Kämpfen!', 'What a lovely day for a fight!'], ['Ich summe. Merkt ihr das?', 'I\'m humming. Can you tell?']],
    essen: [['Der Smutje hat an mich gedacht. Wie lieb!', 'The cook remembered me. How sweet!'], ['Ich hab extra Nachschlag. Für die Nerven.', 'I had seconds. For the nerves.']],
    boss: [['Habt ihr das gesehen?! Ich auch nicht, ging so schnell!', 'Did you see that?! Me neither, too fast!'], ['Heute verbinde ich mal nicht, heute haue ich.', 'No bandaging today. Today I hit.']],
    muede: [['Ich brauch selbst mal einen Verband.', 'I could use a bandage myself.'], ['Bitte bald eine Rast…', 'A rest soon, please…']]
  },
  brecher: {
    froh: [['Heute geh ich vorne. Und zwar schnell.', 'Front line today. Fast.'], ['Gute Laune macht die Fäuste leicht.', 'Good mood, light fists.']],
    essen: [['Doppelte Portion. Jetzt halte ich alles aus.', 'Double portion. Now I can take anything.'], ['Satt und glücklich. Wer will zuerst?', 'Full and happy. Who\'s first?']],
    boss: [['Habt ihr das gesehen? Der steht nicht mehr.', 'Did you see that? He\'s not getting up.'], ['Hinter mir war es sicher. Vor mir nicht.', 'Safe behind me. Not in front.']],
    muede: [['Ich halte noch. Gerade so.', 'Still standing. Barely.'], ['Meine Knochen sagen: Rast.', 'My bones say: rest.']]
  },
  // Erste Begegnung mit dem System (einmal pro Spieler): ein anderer aus der Crew erklärt es
  intro: {
    muede: ['{n} hat zweimal einen Schlag kassiert und pfeift aus dem letzten Loch.', '{n} took two big hits and is running on fumes.'],
    froh: ['{n} strahlt ja richtig. Gute Laune macht schneller!', '{n} is beaming. Good mood makes you faster!']
  },
  tag: {
    froh: ['Froh: +1 Tempo', 'Happy: +1 speed'],
    muede: ['Erschöpft: −20 % Leben', 'Exhausted: −20 % HP']
  }
};

// Steuerung: Budget pro Kampf, Ruhepause danach, kein Spruch bei schnellem Tempo
(function () {
  const st = { used: true, speed: 2, rest: 0, run: null };
  const en = () => GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function lineFor(id, role, kind) {
    const Q = GL.data.crewQuips[id], R = GL.data.crewQuipsRole[role] || GL.data.crewQuipsRole.kaempfer;
    const list = (Q && Q[kind]) || R[kind];
    return list && list.length ? pick(list)[en() ? 1 : 0] : '';
  }
  function nameOf(u) {
    if (!u) return '';
    if (u.id === 'self') return (GL.ui && GL.ui.profile && GL.ui.profile.nickname) || u.name || (en() ? 'Captain' : 'Kapitän');
    const d = GL.data.crew.find(c => c.id === u.id); return d ? d.name : (u.name || '');
  }
  function roleOf(u) { const d = u && GL.data.crew.find(c => c.id === u.id); return (d && d.role) || (u && u.role) || 'kaempfer'; }
  function alive(exclude) {
    return [...document.querySelectorAll('#field .fu-crew:not(.ko)')].map(x => Number(x.dataset.i)).filter(i => i !== exclude && st.run && st.run.crew[i] && st.run.crew[i].id !== 'self');
  }
  const duoMemo = { seed: null, said: {} };
  function fire(kind, i, n) {
    if (st.used || st.speed >= 3) return false;
    const u = st.run && st.run.crew[i];
    if (!u) return false;
    const t = lineFor(u.id, roleOf(u), kind).replace('{n}', n || '');
    if (!t || !GL.arena || !GL.arena.say) return false;
    if (GL.arena.say('crew', i, t)) { st.used = true; st.rest = 2; return true; }
    return false;
  }
  GL.quips = {
    // Vor jedem Kampf: neues Budget, außer in der Ruhepause
    start(run, speed) {
      st.run = run; st.speed = speed || 2;
      if (st.rest > 0) { st.rest--; st.used = true; } else st.used = false;
      if (run && run.battle && run.battle.kind === 'duel') st.used = true;   // Duelle bleiben stumm
    },
    // Eine eigene Figur geht K.O.: ein Freund reagiert (nur jedes zweite Mal, damit es selten bleibt)
    ko(i) {
      if (st.used || st.speed >= 3 || Math.random() < 0.5) return;
      const fallen = st.run && st.run.crew[i];
      const others = alive(i);
      if (!fallen || !others.length) return;
      const who = pick(others);
      setTimeout(() => fire('ko', who, nameOf(fallen)), 450);
    },
    // Kampfende (nur wenn er ganz abgespielt wurde): knapper Sieg oder Boss besiegt
    end(run, crewHp) {
      if (st.used || st.speed >= 3 || !run || !run.battle || !run.battle.win) return;
      const b = run.battle;
      const max = run.crew.reduce((s, u) => s + (u.max || 0), 0), now = (crewHp || []).reduce((s, h) => s + Math.max(0, h || 0), 0);
      const kind = b.kind === 'boss' ? 'boss' : max && now / max < 0.15 ? 'close' : null;
      if (!kind) return;
      const up = alive(-1);
      if (!up.length) return;
      const mate = up.find(i => run.crew[i].id === run.mate);
      setTimeout(() => fire(kind, mate != null ? mate : pick(up)), 350);
    },
    // Großes Update: Duo-Wortwechsel zu Kampfbeginn (ab und zu, jedes Duo einmal pro Run)
    duo(run) {
      if (st.used || st.speed >= 3 || !run || !run.battle || run.battle.kind === 'duel' || !GL.effects || !GL.effects.duos) return;
      const Q = GL.data.duoQuips || {};
      if (duoMemo.seed !== run.seed) { duoMemo.seed = run.seed; duoMemo.said = {}; }
      const list = GL.effects.duos(run.crew).map(d => d.a + '+' + d.b).filter(k => Q[k] && !duoMemo.said[k]);
      if (!list.length || Math.random() > 0.35) return;
      const key = pick(list), conv = pick(Q[key]);
      const en = GL.i18n && GL.i18n.lang && GL.i18n.lang() === 'en';
      const idx = id => run.crew.findIndex(u => u.id === id && u.hp > 0);
      if (conv.some(l => idx(l[0]) < 0)) return;
      duoMemo.said[key] = true; st.used = true;
      conv.forEach((l, k) => setTimeout(() => { if (GL.arena && GL.arena.say) GL.arena.say('crew', idx(l[0]), en ? l[2] : l[1], 1700); }, 900 + k * 1600));
    },
    // 4D: Gefühl hat sich seit dem letzten Kampf geändert (run.battle.herzNeu). Abzeichen über der Figur, ein Satz.
    // intro = noch nie gesehen: ein anderer aus der Crew erklärt es (auch bei schnellem Tempo). Gibt 'intro' zurück, wenn erklärt.
    herz(run, intro) {
      const b = run && run.battle, H = GL.data.herzQuips;
      if (!b || !H || b.kind === 'duel' || !b.herz || !(b.herzNeu || []).length) return false;
      const k = en() ? 1 : 0;
      const now = b.herzNeu.filter(x => b.herz[x.id] === x.g).map(x => ({ x, i: run.crew.findIndex((u, i) => u.id === x.id && (b.crewStart || [])[i] > 0) })).filter(o => o.i >= 0);
      if (!now.length) return false;
      now.forEach((o, n) => setTimeout(() => { if (GL.arena && GL.arena.float && H.tag[o.x.g]) GL.arena.float('crew', o.i, H.tag[o.x.g][k], o.x.g === 'froh' ? 'buff' : 'debuff'); }, 1300 + n * 500));
      const main = now.find(o => o.x.g === 'muede') || now[now.length - 1];
      const u = run.crew[main.i];
      st.used = true;
      if (intro && H.intro[main.x.g]) {
        setTimeout(() => {
          const others = alive(main.i), mate = others.find(i => run.crew[i].id === 'nami');   // am liebsten erklärt es die Navigatorin
          const by = mate != null ? mate : others.length ? others[0] : main.i;
          if (GL.arena && GL.arena.say) GL.arena.say('crew', by, H.intro[main.x.g][k].replace('{n}', nameOf(u)), 3400);
        }, 1700);
        return 'intro';
      }
      if (st.speed >= 3) return false;
      const R = u.id === 'self' ? H.self : (H[roleOf(u)] || H.kaempfer);
      const list = R[main.x.why] || R[main.x.g] || (H.kaempfer[main.x.why] || H.kaempfer[main.x.g]);
      if (list && list.length) setTimeout(() => { if (GL.arena && GL.arena.say) GL.arena.say('crew', main.i, pick(list)[k], 2400); }, 1700);
      return true;
    },
    speed(v) { st.speed = v || 2; },
    line: lineFor
  };
})();
