// js/main.js - Punto de Entrada Principal e Interacciones de Teclado

document.addEventListener("DOMContentLoaded", () => {
    if (typeof initScene === "function") initScene();
    window.ViewerBackground?.init({ scene });
    if (typeof renderCatalog === "function") renderCatalog();
    if (typeof initUI === "function") initUI();

    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }

    // Atajos de Teclado para Elevar/Bajar Objetos (+0.20m / -0.20m)
    document.addEventListener("keydown", (e) => {
        if (document.getElementById("background-gallery")?.open) return;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

        if (typeof selectedMesh !== "undefined" && selectedMesh) {
            if (e.key === "PageUp" || (e.shiftKey && e.key === "ArrowUp")) {
                e.preventDefault();
                if (typeof window.stepElevation === "function") window.stepElevation(0.20);
            } else if (e.key === "PageDown" || (e.shiftKey && e.key === "ArrowDown")) {
                e.preventDefault();
                if (typeof window.stepElevation === "function") window.stepElevation(-0.20);
            } else if (e.key === "Delete" || e.key === "Backspace") {
                if (typeof window.deleteSelected === "function") window.deleteSelected();
            }
        }
    });
});
