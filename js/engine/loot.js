// Beute mit Seltenheit: Schätze und Teufelsfrüchte bekommen beim Finden
// eine Seltenheit, die ihre Werte skaliert (config.rarities).
// Ein Wert kann auch eine Liste mit 4 festen Zahlen sein (eine pro Seltenheit).
// Werte-Namen, die mit p beginnen, sind Anteile und werden als Prozent angezeigt.
window.GL = window.GL || {};

(function () {
  const isPct = key => key[0] === 'p';

  function scale(key, v, q) {
    if (isPct(key)) return Math.max(0.05, Math.round(v * q * 20) / 20);
    return Math.max(1, Math.round(v * q));
  }

  function format(key, v) {
    return isPct(key) ? Math.round(v * 100) + ' %' : String(v);
  }

  // Ersetzt Werte-Namen ('a', 'p', ...) in mods/flags/effect durch die Zahlen
  function fill(obj, vals) {
    if (Array.isArray(obj)) return obj.map(x => fill(x, vals));
    if (obj && typeof obj === 'object') {
      const out = {};
      Object.keys(obj).forEach(k => {
        const v = obj[k];
        out[k] = (typeof v === 'string' && k !== 'scope' && k !== 'type' && k !== 'stat' && v in vals) ? vals[v] : fill(v, vals);
      });
      return out;
    }
    return obj;
  }

  GL.loot = {
    // Würfelt eine Seltenheit (Index in config.rarities)
    rollRarity(run, elite) {
      const list = GL.config.rarities;
      // Schatzkarten oder Glücksmünze: Chance auf Kopfgeldjäger-Glück
      if (!elite && run.luck > 0) elite = run.luck >= 1 || GL.rng.float(run) < run.luck;
      const total = list.reduce((s, r) => s + (elite ? r.wElite : r.w), 0);
      let x = GL.rng.float(run) * total;
      for (let i = 0; i < list.length; i++) {
        x -= elite ? list[i].wElite : list[i].w;
        if (x < 0) return i;
      }
      return 0;
    },

    // Fertiger Gegenstand mit echten Zahlen. r = Seltenheit (-1 = keine)
    make(def, r) {
      const scaled = def.vals && r >= 0;
      const q = scaled ? GL.config.rarities[r].q : 1;
      const vals = {};
      Object.keys(def.vals || {}).forEach(k => {
        const v = def.vals[k];
        // Liste = fester Wert pro Seltenheit [Gewöhnlich, Selten, Episch, Legendär]
        if (Array.isArray(v)) vals[k] = v[scaled ? r : 1];
        else vals[k] = scaled ? scale(k, v, q) : v;
      });
      const text = (def.text || '').replace(/\{(\w+)\}/g, (_, k) => (k in vals ? format(k, vals[k]) : '?'));
      return {
        id: def.id, name: def.name, text,
        rarity: scaled ? r : -1,
        mods: def.mods ? fill(def.mods, vals) : undefined,
        flags: def.flags ? fill(def.flags, vals) : undefined,
        effect: def.effect ? fill(def.effect, vals) : undefined,
        awakened: !!def.awakened
      };
    },

    relic(entry) {
      return GL.loot.make(GL.data.relics.find(x => x.id === entry.id), entry.r);
    },

    fruit(entry) {
      return GL.loot.make(GL.data.fruits.find(x => x.id === entry.id), entry.r);
    },

    rarityName(r) {
      return r >= 0 ? GL.config.rarities[r].name : '';
    }
  };
})();
