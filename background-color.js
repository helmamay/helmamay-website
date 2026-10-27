// Optional, artwork-specific background preview. Source artwork is never overwritten.
(function () {
  'use strict';
  const panel = document.getElementById('background-controls');
  const form = panel && panel.closest('form');
  if (!form || !panel) return;
  const enabled = document.getElementById('background-custom');
  const picker = document.getElementById('background-picker');
  const hex = document.getElementById('background-hex');
  const reference = document.getElementById('background-reference');
  const value = document.getElementById('background-value');
  const message = document.getElementById('background-status');
  const swatches = Array.from(panel.querySelectorAll('[data-background-color]'));
  const targets = Array.from(document.querySelectorAll('img[data-color-preview]'));
  const originals = targets.map(img => img.getAttribute('src'));
  let cutout = null;
  let selected = '#3F86B8';
  function render() {
    const custom = enabled.checked && !!cutout;
    value.value = custom ? selected : 'Original white background';
    picker.disabled = hex.disabled = reference.disabled = !custom;
    picker.value = selected;
    hex.value = selected;
    hex.setCustomValidity('');
    targets.forEach((img, i) => {
      img.src = custom ? cutout : originals[i];
      img.style.backgroundColor = custom ? selected : '';
    });
    swatches.forEach(button => button.setAttribute('aria-pressed', String(custom && button.dataset.backgroundColor === selected)));
  }
  function choose(color) {
    if (!/^#[0-9a-f]{6}$/i.test(color)) return;
    selected = color.toUpperCase();
    enabled.checked = true;
    render();
  }
  picker.addEventListener('input', () => choose(picker.value));
  hex.addEventListener('input', () => {
    const candidate = hex.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(candidate)) choose(candidate);
    else hex.setCustomValidity('Enter a six-digit HEX color, such as #3F86B8.');
  });
  enabled.addEventListener('change', render);
  swatches.forEach(button => button.addEventListener('click', () => choose(button.dataset.backgroundColor)));
  document.getElementById('background-reset').addEventListener('click', () => { enabled.checked = false; render(); });
  form.addEventListener('reset', () => setTimeout(() => { selected = '#3F86B8'; render(); }, 0));
  async function prepare() {
    try {
      const response = await fetch(panel.dataset.mask);
      if (!response.ok) throw new Error('Mask unavailable');
      const mask = await response.json();
      const image = new Image();
      image.src = originals[0];
      await image.decode();
      if (image.naturalWidth !== (mask.sourceWidth || mask.width) || image.naturalHeight !== (mask.sourceHeight || mask.height)) throw new Error('Source dimensions changed');
      const canvas = document.createElement('canvas');
      canvas.width = mask.width; canvas.height = mask.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.drawImage(image, 0, 0, mask.width, mask.height);
      const pixels = context.getImageData(0, 0, mask.width, mask.height);
      for (const [start, length] of mask.runs) {
        if (!Number.isInteger(start) || !Number.isInteger(length) || start < 0 || length < 1 || start + length > mask.width * mask.height) throw new Error('Invalid mask');
        for (let i = start; i < start + length; i++) pixels.data[i * 4 + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
      cutout = canvas.toDataURL('image/png');
      panel.disabled = false;
      render();
      message.textContent = 'Choose a swatch or enter your own color.';
    } catch (error) {
      enabled.checked = false;
      value.value = 'Original white background';
      message.textContent = 'Color preview is unavailable right now. Please describe your background color request in Project details.';
    }
  }
  prepare();
})();
