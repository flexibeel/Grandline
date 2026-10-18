// Freunde: öffentlicher Freundescode (aus der Online-ID, NICHT der geheime Spielercode),
// Freundesliste, Einladungslink mit QR-Code und Dankeschön fürs Einladen.
//   Wer über deinen Link kommt und seinen ersten Run beendet, zählt als eingeladen.
//   Du bekommst dafür ein legendäres Ausrüstungsteil und exklusive Profil-Teile, dein Freund ein Willkommensgeschenk.
window.GL = window.GL || {};

(function () {
  const A = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const REF_KEY = 'grandline.ref';
  function code(uid) {
    if (!uid) return '';
    let h = 2166136261;
    const s = String(uid);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    let out = '', x = h;
    for (let i = 0; i < 6; i++) { out += A[x % A.length]; x = Math.floor(x / A.length) ^ (i * 7919 + (h >>> (i * 3))); x = Math.abs(x); }
    return out.slice(0, 3) + '-' + out.slice(3);
  }
  const norm = c => String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0');
  const fmt = c => { const n = norm(c); return n.slice(0, 3) + '-' + n.slice(3, 6); };
  const state = () => (GL.online ? GL.online.state() : { rows: [] });
  const mine = () => code(state().uid);
  const rows = () => state().rows || [];
  const rowOf = c => rows().find(r => norm(code(r.id)) === norm(c)) || null;
  function link() { return location.origin + location.pathname + '?ref=' + norm(mine()); }

  // ?ref=XXXXXX aus dem Link merken (bis ein Profil existiert)
  function captureRef() {
    try {
      const m = /[?&]ref=([0-9A-Za-z-]{6,8})/.exec(location.search);
      if (!m) return;
      localStorage.setItem(REF_KEY, norm(m[1]));
      GL.inviteLanding = norm(m[1]);   // für das Einladungs-Fenster beim Öffnen
      const u = new URL(location.href); u.searchParams.delete('ref'); history.replaceState(null, '', u.pathname + (u.search || ''));
    } catch (e) { /* egal */ }
  }
  // Neues Profil über einen Einladungslink: Einlader merken, als Freund eintragen, Willkommensgeschenk
  function applyRef(profile) {
    let ref = null;
    try { ref = localStorage.getItem(REF_KEY); } catch (e) {}
    if (!ref || profile.refBy || (profile.stats && profile.stats.runs > 3)) return false;
    if (norm(ref) === norm(mine())) return false;
    profile.refBy = norm(ref);
    add(profile, ref);
    profile.berry = (profile.berry || 0) + 150;
    try { localStorage.removeItem(REF_KEY); } catch (e) {}
    return true;
  }
  function add(profile, c) {
    const n = norm(c);
    if (n.length !== 6 || n === norm(mine())) return false;
    profile.friends = profile.friends || [];
    if (profile.friends.includes(n)) return false;
    profile.friends.push(n);
    return true;
  }
  function remove(profile, c) { profile.friends = (profile.friends || []).filter(x => x !== norm(c)); }
  // Eingeladene Freunde finden (haben deinen Code als refBy und mindestens einen Run beendet) und belohnen
  function checkInvites(profile) {
    const me = norm(mine());
    if (!me) return [];
    const fresh = [];
    profile.invites = profile.invites || [];
    rows().forEach(r => {
      if (norm(r.refBy) !== me || !(r.runs >= 1)) return;
      const c = norm(code(r.id));
      if (profile.invites.includes(c)) return;
      profile.invites.push(c);
      add(profile, c);
      if (GL.cgear) {
        const it = GL.cgear.roll({ r: 3, name: 'Freundschaft', seaName: 'Einladung: ' + (r.name || 'Freund'), sea: 2 });
        GL.cgear.bag(profile).push(it);
        fresh.push({ name: r.name || 'Ein Freund', item: it });
      } else fresh.push({ name: r.name || 'Ein Freund' });
    });
    return fresh;
  }
  // Freunde, die gerade online gekommen sind (Lebenszeichen der letzten 4 Minuten). Beim ersten Aufruf nur merken
  let onSeen = null;
  function cameOnline(profile) {
    const on = new Set();
    (profile.friends || []).forEach(c => { const r = rowOf(c); const t = r && Date.parse(r.updated); if (r && isFinite(t) && Date.now() - t < 240000) on.add(c + '|' + (r.name || 'Ein Freund')); });
    const fresh = onSeen ? [...on].filter(x => !onSeen.has(x)).map(x => x.split('|').slice(1).join('|')) : [];
    onSeen = on;
    return fresh;
  }
  // QR-Code: Bibliothek erst laden, wenn das Fenster aufgeht
  let qrLib = null;
  function qr(text) {
    if (!qrLib) {
      qrLib = new Promise((res, rej) => {
        if (window.qrcode) return res(window.qrcode);
        const urls = ['https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'];
        const tryLoad = k => {
          if (k >= urls.length) { qrLib = null; return rej(new Error('qr')); }
          const s = document.createElement('script');
          s.src = urls[k]; s.onload = () => res(window.qrcode); s.onerror = () => tryLoad(k + 1);
          document.head.appendChild(s);
        };
        tryLoad(0);
      });
    }
    return qrLib.then(q => {
      const o = q(0, 'M'); o.addData(text); o.make();
      const n = o.getModuleCount(); let r = '';
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (o.isDark(y, x)) r += `M${x} ${y}h1v1h-1z`;
      return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" aria-label="QR-Code"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${r}" fill="#2a1a10"/></svg>`;
    });
  }
  GL.friends = { code, mine, link, rowOf, captureRef, applyRef, add, remove, checkInvites, cameOnline, qr, norm, fmt };
  captureRef();
})();
