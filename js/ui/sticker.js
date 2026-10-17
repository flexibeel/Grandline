// Profil als Sticker: 512×512-Bild mit transparentem Rand, wie WhatsApp-Sticker.
// Kopieren (Zwischenablage), Teilen oder Speichern. Alles im Browser, nichts wird hochgeladen.
window.GL = window.GL || {};

(function () {
  const S = 512;
  function svgImg(svg, w, h) {
    const src = svg.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src); });
  }
  // Pixel-Rechteck mit abgestuften Ecken (wie die Rahmen im Spiel)
  function pxRect(c, x, y, w, h, r, fill) {
    c.fillStyle = fill;
    c.fillRect(x + r, y, w - 2 * r, h); c.fillRect(x, y + r, w, h - 2 * r);
    c.fillRect(x + r / 2, y + r / 2, w - r, h - r);
  }
  async function make(info) {
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    try { await document.fonts.load('600 48px "Pixelify Sans"'); } catch (e) {}
    // Weißer Sticker-Rand, dunkle Kante, warme Karte
    pxRect(c, 10, 10, S - 20, S - 20, 28, '#ffffff');
    pxRect(c, 26, 26, S - 52, S - 52, 22, '#2a1a10');
    pxRect(c, 34, 34, S - 68, S - 68, 18, '#fbefd6');
    // Hintergrund: Himmel und Meer
    pxRect(c, 50, 50, S - 100, 300, 12, '#bfe3f2');
    c.fillStyle = '#4f9ccf'; c.fillRect(50, 280, S - 100, 70);
    c.fillStyle = '#7fbfe0'; for (let x = 60; x < S - 60; x += 48) c.fillRect(x, 288, 24, 6);
    c.fillStyle = '#fff3b0'; c.fillRect(370, 80, 56, 56); c.fillStyle = '#ffe680'; c.fillRect(378, 88, 40, 40);
    // Figur groß und pixelscharf
    const fig = await svgImg(info.svg, 12, 14);
    c.drawImage(fig, 156, 92, 200, 233);
    // Namensband
    pxRect(c, 50, 362, S - 100, 104, 10, '#8a5a32');
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(58, 366, S - 116, 6);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    let fs = 50; c.font = `600 ${fs}px "Pixelify Sans", monospace`;
    while (c.measureText(info.name).width > S - 140 && fs > 24) { fs -= 2; c.font = `600 ${fs}px "Pixelify Sans", monospace`; }
    c.fillStyle = '#2a1a10'; c.fillText(info.name, S / 2 + 3, 404 + 3);
    c.fillStyle = '#fff6e0'; c.fillText(info.name, S / 2, 404);
    c.font = '500 22px "Pixelify Sans", monospace'; c.fillStyle = '#f2d24a';
    c.fillText(info.sub || '', S / 2, 445);
    // Kleines Spiel-Logo oben links
    c.font = '600 22px "Pixelify Sans", monospace'; c.textAlign = 'left';
    pxRect(c, 62, 62, 150, 36, 6, '#2a1a10'); c.fillStyle = '#fff6e0'; c.fillText('GRAND LINE', 74, 81);
    return new Promise(res => cv.toBlob(b => res(b), 'image/png'));
  }
  async function copy(blob) {
    if (navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); return true; }
    return false;
  }
  async function share(blob, name) {
    const file = new File([blob], (name || 'grandline') + '-sticker.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Grand Line Sticker' }); return true; }
    return false;
  }
  function download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (name || 'grandline') + '-sticker.png';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  GL.sticker = { make, copy, share, download };
})();
