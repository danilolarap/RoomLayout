// main.js - Punto de Entrada de la Aplicación

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar la escena 3D de Three.js
    if (typeof initScene === "function") {
        initScene();
    }

    // 2. Renderizar el catálogo de muebles
    if (typeof renderCatalog === "function") {
        renderCatalog();
    }

    // 3. Configurar eventos de la interfaz (botones, sliders, idiomas)
    if (typeof initUI === "function") {
        initUI();
    }

    // 4. Calcular métricas iniciales del área libre/ocupada
    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
});