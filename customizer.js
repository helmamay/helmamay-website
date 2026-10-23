// Helmamay Studios — shared customization options and preview behavior.
// Edit these lists to update every artwork page. Page HTML remains a no-JS fallback.
(function () {
  'use strict';
  const options = {
    printSizes: ['8 × 10 inches', '16 × 20 inches', '24 × 30 inches', 'Custom size — discuss availability'],
    printMediums: ['Fine-art paper', 'Gallery-wrapped canvas', 'Canvas with floating frame', 'Unstretched canvas'],
    canvasSideColors: ['White', 'Black'],
    matColors: ['White', 'Ivory', 'No mat'],
    frameFinishes: ['Natural wood', 'Black', 'White'],
    frameColors: {'Natural wood': '#9c744d', Black: '#252525', White: '#f4f2ed'},
    matPreviewColors: {White: '#fffef8', Ivory: '#e9dfc9', 'No mat': 'transparent'}
  };
  let updatePreview = function () {};
  window.HelmamayCustomizer = Object.assign(options, {updatePreview: () => updatePreview()});

  function init() {
    const form = document.querySelector('form[action*="formspree.io"]');
    if (!form || form.dataset.customizerReady) return;
    const byIds = (...ids) => ids.map(id => document.getElementById(id)).find(Boolean);
    const frame = byIds('preview-frame', 'frame-preview', 'framePreview', 'frame');
    const mat = byIds('preview-mat', 'mat-preview', 'matPreview', 'mat');
    const frameChoice = byIds('frame-choice', 'frame-finish', 'frameFinish');
    const matChoice = byIds('mat-choice', 'matting', 'matChoice');
    const size = byIds('print-size', 'printSize');
    if (!frame || !mat || !frameChoice || !matChoice || !size) return;
    form.dataset.customizerReady = 'true';

    // Keep existing submission field names and legacy values intact.
    function populate(select, labels) {
      const old = Array.from(select.options);
      const selected = select.selectedIndex;
      const normalize = text => text.toLowerCase().replace(' x ', ' × ');
      select.replaceChildren(...labels.map((label, index) => {
        const previous = old.find(item => normalize(item.textContent) === normalize(label)) ||
          (label.startsWith('Custom size') ? old.find(item => item.textContent.startsWith('Custom size')) : null);
        const option = new Option(label, previous ? previous.value : label, index === selected, index === selected);
        return option;
      }));
    }
    populate(size, options.printSizes);
    populate(frameChoice, options.frameFinishes);
    populate(matChoice, options.matColors);

    function addSelect(id, name, label, after) {
      let select = document.getElementById(id);
      if (select) return select;
      const field = document.createElement('div');
      field.className = 'field';
      const caption = document.createElement('label');
      caption.htmlFor = id;
      caption.textContent = label;
      select = document.createElement('select');
      select.id = id;
      select.name = name;
      select.setAttribute('form', form.id);
      field.append(caption, select);
      const container = after.closest('.field');
      (container || after).after(field);
      return select;
    }
    const medium = addSelect('print-medium', 'print_medium', 'Print medium', size);
    const sides = addSelect('canvas-sides', 'canvas_side_color', 'Canvas side color', medium);
    populate(medium, options.printMediums);
    populate(sides, options.canvasSideColors);
    const field = select => select.closest('.field');
    function available(select, enabled) {
      select.disabled = !enabled;
      if (field(select)) field(select).style.display = enabled ? '' : 'none';
      else {
        select.hidden = !enabled;
        const label = document.querySelector('label[for="' + select.id + '"]');
        if (label) label.hidden = !enabled;
      }
    }
    updatePreview = function () {
      const paper = medium.value === 'Fine-art paper';
      const gallery = medium.value === 'Gallery-wrapped canvas';
      const floating = medium.value === 'Canvas with floating frame';
      available(sides, gallery);
      available(matChoice, paper);
      available(frameChoice, paper || floating);
      const finish = frameChoice.selectedOptions[0].textContent;
      const matting = matChoice.selectedOptions[0].textContent;
      frame.style.background = options.frameColors[finish] || options.frameColors['Natural wood'];
      frame.style.padding = paper || floating ? '' : '0';
      frame.style.border = gallery ? '6px solid ' + (sides.value === 'Black' ? '#222222' : '#ffffff') : '';
      mat.classList.toggle('none', !paper || matting === 'No mat');
      mat.style.padding = paper && matting !== 'No mat' ? '' : '0';
      mat.style.background = paper ? options.matPreviewColors[matting] : 'transparent';
    };
    [size, medium, sides, frameChoice, matChoice].forEach(select => select.addEventListener('change', updatePreview));
    // Reset fires before the browser restores the default selected options.
    form.addEventListener('reset', () => setTimeout(updatePreview, 0));
    updatePreview();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
