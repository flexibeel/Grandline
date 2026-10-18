// Crew-Sprüche im Kampf (JUICE): ganz selten eine kleine Sprechblase.
// Anlässe: ko (ein Freund fällt, {n} = sein Name), close (knapper Sieg), boss (Boss besiegt), party (erster Meeres-Boss im Leben).
// Höchstens eine Blase pro Kampf, danach zwei Kämpfe Ruhe, nie bei schnellem Tempo.
window.GL = window.GL || {};
GL.data = GL.data || {};

GL.data.crewQuips = {
  ruffy: {
    ko: [['{n}! Steh auf, es gibt gleich Fleisch!', '{n}! Get up, there\'s meat soon!'], ['Hey! Das war MEIN Freund!', 'Hey! That was MY friend!']],
    close: [['Knapp. Aber satt werd ich trotzdem.', 'Close. Still hungry though.'], ['Hahaha! Fast tot! Nochmal?', 'Hahaha! Nearly dead! Again?']],
    boss: [['Geschafft! Wer hat Hunger?', 'Done! Who\'s hungry?'], ['Der war zäher als Seekönig-Steak.', 'Tougher than Sea King steak.']],
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
    speed(v) { st.speed = v || 2; },
    line: lineFor
  };
})();
