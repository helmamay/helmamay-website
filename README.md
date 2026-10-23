# helmamay-website
Official website for Helmamay Studios

## Shared artwork customization

All 16 artwork pages linked from the gallery use `customizer.js`, including Calyce.
To change the available sizes, media, side colors, mats, or frame finishes, edit
only the `options` object at the top of that file. Add a matching preview color
in `frameColors` or `matPreviewColors` when adding a finish or mat.

The shared script populates the existing controls and adds print-medium and
canvas-side controls where needed. Existing page HTML stays as a fallback.
Artwork images, galleries, page CSS, contact fields, hidden artwork/subject
fields, Formspree destination, and page-specific submission behavior are retained.
Existing field names and option values are preserved for quote compatibility.

- Fine-art paper: frame finish and matting.
- Gallery-wrapped canvas: solid white or black sides; no mat or separate frame.
- Canvas with floating frame: frame finish; no mat.
- Unstretched canvas: no mat, separate frame, or wrapped-side selection.

Inapplicable controls are hidden and disabled, so they are omitted from quotes.
Changing back to paper restores frame and mat selections. Previews illustrate
finishes only; they do not simulate physical print size or change the artwork.
Quote submission stays in each page's existing handler; the shared code handles
options, preview updates, and synchronization after a form reset.

## Test

With Node.js installed:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/customizer.cjs
```

The Chromium suite tests every gallery-linked artwork page: all four media,
applicable quote fields, frame/mat changes, required fields, server and network
failures, retries, successful submissions, and resets. All Formspree requests are
intercepted: no test inquiries are delivered. Actual Formspree delivery and email
notification require a separate live end-to-end check.

Before rollout, Pomona was tested first. Its previous shared script did not
update the frame or mat selection; the shared preview implementation repairs it.
The existing quote form passed intercepted submission checks before and after.
Desktop/mobile previews were inspected for Pomona, Aglaia, Gaia, and Nerio.

## Framing guide and finish requests

The shared script inserts a collapsed Print & framing guide on every artwork
page. Its nine clickable, keyboard-accessible finish swatches mirror the frame
select and never submit the quote form. Wood grain and metallic gradients are
illustrations; they do not modify the artwork image or represent physical samples.
Ornate gold adds a simple decorative edge cue rather than simulating an actual
carved frame. It is available for paper-framing requests only, not canvas floaters.

New finishes are requests subject to local framer confirmation. The guide explains
paper, gallery wrap, floating frames, unstretched canvas, matting, outside dimensions,
and local pickup/delivery. No stock availability, exact materials, or prices are
promised. Finish lists, preview appearances, guide content, and styles are maintained
in customizer.js. Actual local-framer availability remains unverified.

The tests also cover all nine swatches, selection and quote-field synchronization,
keyboard activation, non-submission by swatch buttons, media restrictions, reset,
and preservation of the existing submission flow. A real inbox-delivery test is
separate and requires approval of its exact message and destination.

Canvas-preview layout regression: run `node tests/preview-layout.cjs`. This loads
real artwork assets and verifies that preview containers fit their images at
1200px, 390px, and 320px viewport widths for all 16 pages and all canvas media.
The shared `.custom-layout` image sizing avoids a spare colored strip caused by
cyclic percentage sizing; source artwork and page HTML are unchanged.
