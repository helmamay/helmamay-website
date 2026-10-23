// Helmamay Studios — shared customization options and preview behavior.
// Edit these lists to update every artwork page. Page HTML remains a no-JS fallback.
(function () {
  'use strict';
  const options = {
    printSizes: ['8 × 10 inches', '16 × 20 inches', '24 × 30 inches', 'Custom size — discuss availability'],
    printMediums: ['Fine-art paper', 'Gallery-wrapped canvas', 'Canvas with floating frame', 'Unstretched canvas'],
    canvasSideColors: ['White', 'Black'],
    matColors: ['White', 'Ivory', 'No mat'],
    frameFinishes: ['Natural wood', 'Black', 'White', 'Walnut', 'Dark wood', 'Brass', 'Chrome', 'Gold', 'Ornate gold'],
    frameColors: {'Natural wood': '#9c744d', Black: '#252525', White: '#f4f2ed'},
    framePreviewBackgrounds: {
      Walnut: 'repeating-linear-gradient(92deg, #62422d 0px, #785339 5px, #68462f 9px)',
      'Dark wood': 'repeating-linear-gradient(92deg, #342a24 0px, #48372c 5px, #382c25 9px)',
      Brass: 'linear-gradient(115deg, #8c713d, #c5ab6a 35%, #ac8d4c 65%, #d3bd83)',
      Chrome: 'linear-gradient(115deg, #8b9297, #edf0f2 30%, #a2a9ae 55%, #dce1e5)',
      Gold: 'linear-gradient(115deg, #9b762c, #ddc17a 35%, #bd984a 65%, #e4cc8e)',
      'Ornate gold': 'linear-gradient(115deg, #8b682b, #d6b66c 30%, #a7803b 60%, #dfc17e)'
    },
    paperOnlyFinishes: ['Ornate gold'],
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
    // Shared guide and styles keep all artwork pages in sync.
    if (!document.getElementById('helmamay-guide-styles')) {
      const style = document.createElement('style');
      style.id = 'helmamay-guide-styles';
      style.textContent = `
        /* A definite width avoids spare frame space from cyclic percentage sizing. */
        .customize .custom-layout .mat img{width:260px;max-width:100%}
        .helmamay-guide{max-width:820px;margin:26px auto 32px;border:1px solid #d8d0c3;background:#f6f2ea;text-align:left}
        .helmamay-guide summary{padding:17px 20px;cursor:pointer;font:18px Georgia,serif;color:#292724}
        .helmamay-guide-body{padding:0 20px 22px;color:#5d5851;font:15px/1.6 Georgia,serif}
        .helmamay-guide-body h3{font:21px Georgia,serif;color:#292724;margin:24px 0 12px}
        .helmamay-guide-body dl{margin:0}.helmamay-guide-body dt{font-weight:bold;color:#292724;margin-top:14px}
        .helmamay-guide-body dd{margin:4px 0 0}.helmamay-guide-body p{margin:12px 0;line-height:1.6}
        .helmamay-finish-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
        .helmamay-finish-grid button{display:flex;align-items:center;gap:10px;margin:0;padding:10px;border:1px solid #bcb5aa;background:#fffefa;color:#292724;font:14px Georgia,serif;text-align:left;cursor:pointer;min-height:54px;letter-spacing:normal;width:100%}
        .helmamay-finish-grid button[aria-pressed="true"]{outline:2px solid #5d5141;outline-offset:1px}
        .helmamay-finish-grid button:focus-visible{outline:3px solid #395d72;outline-offset:2px}
        .helmamay-finish-grid button:disabled{opacity:.5;cursor:default}
        .helmamay-finish-chip{display:block;flex:0 0 28px;width:28px;height:28px;border:1px solid #938775}
        .helmamay-finish-note{font-size:13px;line-height:1.5;color:#6b655e;margin:8px 0 0}
        .helmamay-ornate-preview{outline:1px solid #b08b45;outline-offset:-5px}
        @media(max-width:500px){.helmamay-finish-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `;
      document.head.append(style);
    }
    const guide = document.createElement('details');
    guide.className = 'helmamay-guide';
    guide.innerHTML = `
      <summary>Print &amp; framing guide</summary>
      <div class="helmamay-guide-body">
        <p>Choose a print medium, then explore the framing options for your project. Each piece is quoted individually.</p>
        <dl>
          <dt>Fine-art paper</dt><dd>A paper print for framing, with a white or ivory mat, or no mat. Final paper, glazing, frame profile, and dimensions are confirmed with your quote.</dd>
          <dt>Gallery-wrapped canvas</dt><dd>Canvas stretched around a support with solid white or black sides. No paper mat or separate frame is included in this selection.</dd>
          <dt>Canvas with floating frame</dt><dd>Stretched canvas surrounded by a frame with a small visible gap. No mat. The actual gap, depth, and frame profile are confirmed with your quote.</dd>
          <dt>Unstretched canvas</dt><dd>A canvas print supplied without stretcher bars or a frame. Tell us your finishing plans in the project details.</dd>
        </dl>
        <h3>Explore frame finishes</h3>
        <p>Tap an illustrative swatch to change the preview. Frame finishes apply to paper and floating-framed canvas; ornate gold is a paper-framing request.</p>
        <div class="helmamay-finish-grid" role="group" aria-label="Illustrative frame finishes"></div>
        <p>These are digital illustrations, not physical frame samples. Wood grain, metal sheen, decorative detail, color, and proportions may differ. Expanded finishes are requests subject to local framer availability; we confirm the exact materials, profile, and price before an order.</p>
        <h3>Matting &amp; sizing</h3>
        <p>Matting applies to paper prints. A mat adds space around the image and increases the overall framed dimensions. Print size describes the artwork size; include your target outside dimensions or custom size in the project details.</p>
        <p>Need help choosing? Include your room colors, project requirements, and preferred finish with your quote request. Local pickup or local delivery only; shipping is not offered.</p>
      </div>`;
    const section = form.closest('.customize');
    const intro = section && section.querySelector(':scope > p');
    if (intro) intro.after(guide);
    else if (section) section.prepend(guide);
    const swatches = [];
    for (const finish of options.frameFinishes) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Preview ' + finish + ' frame');
      const chip = document.createElement('span');
      chip.className = 'helmamay-finish-chip';
      chip.setAttribute('aria-hidden', 'true');
      chip.style.background = options.framePreviewBackgrounds[finish] || options.frameColors[finish];
      button.append(chip, document.createTextNode(finish));
      button.addEventListener('click', () => {
        frameChoice.selectedIndex = options.frameFinishes.indexOf(finish);
        frameChoice.dispatchEvent(new Event('change', {bubbles:true}));
      });
      guide.querySelector('.helmamay-finish-grid').append(button);
      swatches.push({finish, button});
    }
    const finishNote = document.createElement('p');
    finishNote.id = 'helmamay-finish-note';
    finishNote.className = 'helmamay-finish-note';
    finishNote.textContent = 'Finishes are illustrative requests. Exact profile, materials, availability, and pricing are confirmed with your quote.';
    frameChoice.after(finishNote);
    frameChoice.setAttribute('aria-describedby', [frameChoice.getAttribute('aria-describedby'), finishNote.id].filter(Boolean).join(' '));
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
      Array.from(frameChoice.options).forEach(option => {
        option.disabled = !paper && options.paperOnlyFinishes.includes(option.textContent);
      });
      if (frameChoice.selectedOptions[0].disabled) frameChoice.selectedIndex = 0;
      const finish = frameChoice.selectedOptions[0].textContent;
      finishNote.hidden = !paper && !floating;
      swatches.forEach(item => {
        item.button.disabled = (!paper && !floating) || (!paper && options.paperOnlyFinishes.includes(item.finish));
        item.button.setAttribute('aria-pressed', String(item.finish === finish && !item.button.disabled));
      });
      frame.classList.toggle('helmamay-ornate-preview', paper && finish === 'Ornate gold');
      const matting = matChoice.selectedOptions[0].textContent;
      frame.style.background = options.framePreviewBackgrounds[finish] || options.frameColors[finish] || options.frameColors['Natural wood'];
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
