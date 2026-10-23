// Helmamay Studios — Shared Artwork Customizer
// This file will manage customization options across artwork pages.

(function () {
  "use strict";

  const customizationOptions = {
    printMediums: [
      "Fine-art paper",
      "Gallery-wrapped canvas",
      "Canvas with floating frame",
      "Unstretched canvas"
    ],
    canvasSideColors: [
      "White",
      "Black"
    ],
    matColors: [
      "White",
      "Ivory",
      "No mat"
    ],
    frameFinishes: [
      "Natural wood",
      "Black",
      "White"
    ]
  };
function updateCanvasOptions() {
  const printMedium = document.getElementById("print-medium");
  const canvasSides = document.getElementById("canvas-sides");

  if (!printMedium || !canvasSides) return;

  const isGalleryCanvas =
    printMedium.value === "Gallery-wrapped canvas";

  canvasSides.closest(".field").style.display =
    isGalleryCanvas ? "" : "none";

  canvasSides.disabled = !isGalleryCanvas;
  const previewFrame = document.getElementById("preview-frame");

if (previewFrame) {
  previewFrame.style.padding = isGalleryCanvas ? "0" : "";

  previewFrame.style.border = isGalleryCanvas
    ? "6px solid " + (canvasSides.value === "Black" ? "#222222" : "#ffffff")
    : "";
}
} document.addEventListener("DOMContentLoaded", function () {
  const printMedium = document.getElementById("print-medium");

  if (printMedium) {
    printMedium.addEventListener("change", updateCanvasOptions);
    updateCanvasOptions();
    const canvasSides = document.getElementById("canvas-sides");

if (canvasSides) {
  canvasSides.addEventListener("change", updateCanvasOptions);
}
  }
});
  window.HelmamayCustomizer = customizationOptions;
})();
