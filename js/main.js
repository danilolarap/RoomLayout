// js/main.js - Punto de Entrada Principal de la Aplicación

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar la escena 3D de Three.js
    if (typeof initScene === "function") {
        initScene();
    } else {
        console.error("Error: initScene no está definida. Revisa js/scene.js");
    }

    // 2. Renderizar el catálogo de muebles
    if (typeof renderCatalog === "function") {
        renderCatalog();
    }

    // 3. Inicializar eventos de la interfaz e idioma
    if (typeof initUI === "function") {
        initUI();
    }

    // 4. Calcular métricas iniciales y ejecutar diagnóstico IA inicial
    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
});