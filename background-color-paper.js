// Background preview for artwork on white paper. Original image files remain unchanged.
(function () {
  'use strict';
  const panel = document.getElementById('background-controls');
  if (!panel) return;
  const form = panel.closest('form');
  const toggle = document.getElementById('background-custom');
  const picker = document.getElementById('background-picker');
  const hex = document.getElementById('background-hex');
  const reference = document.getElementById('background-reference');
  const hidden = document.getElementById('background-value');
  const status = document.getElementById('background-status');
  const images = Array.from(document.querySelectorAll('img[data-color-preview]'));
  const originals = images.map(img => img.getAttribute('src'));
  const swatches = Array.from(panel.querySelectorAll('[data-background-color]'));
  let transparentImage = null;
  let color = '#D7DCD2';
  function update() {
    const active = toggle.checked && transparentImage;
    hidden.value = active ? color : 'Original white background';
    picker.disabled = hex.disabled = reference.disabled = !active;
    picker.value = color; hex.value = color;
    images.forEach((img, i) => {
      img.src = active ? transparentImage : originals[i];
      img.style.backgroundColor = active ? color : '';
    });
    swatches.forEach(btn => btn.setAttribute('aria-pressed', String(active && btn.dataset.backgroundColor.toUpperCase() === color)));
  }
  function choose(next) {
    if (!/^#[0-9a-f]{6}$/i.test(next)) return;
    color = next.toUpperCase();
    toggle.checked = true;
    hex.setCustomValidity('');
    update();
  }
  toggle.addEventListener('change', update);
  picker.addEventListener('input', () => choose(picker.value));
  hex.addEventListener('input', () => {
    const v = hex.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) choose(v);
    else hex.setCustomValidity('Enter a six-digit HEX color.');
  });
  swatches.forEach(btn => btn.addEventListener('click', () => choose(btn.dataset.backgroundColor)));
  document.getElementById('background-reset').addEventListener('click', () => {toggle.checked = false; update();});
  form.addEventListener('reset', () => setTimeout(() => {color = '#D7DCD2'; update();}, 0));
  async function prepare() {
    try {
      const source = new Image();
      source.src = originals[0];
      await source.decode();
      const scale = Math.min(1, 1100 / Math.max(source.naturalWidth, source.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
      const ctx = canvas.getContext('2d', {willReadFrequently: true});
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = pixels.data, width = canvas.width, height = canvas.height;
      const count = width * height;
      const visited = new Uint8Array(count);
      const queue = new Int32Array(count);
      let head = 0, tail = 0;
      // Only remove nearly-white pixels connected to the outside of the drawing.
      // Interior white shapes, ink, and colored artwork are not recolored.
      function isPaper(i) {
        const k = i * 4;
        const r = data[k], g = data[k + 1], b = data[k + 2];
        return r >= 240 && g >= 240 && b >= 240 && Math.max(r,g,b)-Math.min(r,g,b) < 16;
      }
      function add(i) {
        if (visited[i] || !isPaper(i)) return;
        visited[i] = 1; queue[tail++] = i;
      }
      for (let x = 0; x < width; x++) {add(x); add((height - 1) * width + x);}
      for (let y = 0; y < height; y++) {add(y * width); add(y * width + width - 1);}
      while (head < tail) {
        const i = queue[head++], x = i % width;
        if (x) add(i - 1);
        if (x + 1 < width) add(i + 1);
        if (i >= width) add(i - width);
        if (i + width < count) add(i + width);
      }
      if (tail < count * 0.03) throw new Error('No suitable white background detected');
      for (let i = 0; i < count; i++) if (visited[i]) data[i * 4 + 3] = 0;
      ctx.putImageData(pixels, 0, 0);
      transparentImage = canvas.toDataURL('image/png');
      panel.disabled = false;
      update();
      status.textContent = 'Choose a suggested background or select your own color.';
    } catch (error) {
      status.textContent = 'Preview unavailable. You can describe your preferred background color in Project Details.';
    }
  }
  prepare();
})();
