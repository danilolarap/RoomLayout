window.currentLang = "es";

const I18N_DICTIONARY = {
    es: {
        subtitle: "Simulador de Circulación e Incidencia Solar",
        room: "SALA:",
        width: "Ancho",
        length: "Largo",
        time: "HORA",
        window: "VENTANA:",
        themeLight: "Modo Claro",
        themeDark: "Modo Oscuro",
        simulate: "SIMULAR",
        catalogTitle: "Catálogo Mobiliario",
        catalogSearchPlaceholder: "Buscar muebles...",
        topView: "PLANTA (TOP)",
        freeFlow: "Flujo Libre",
        collision: "Colisión / Bloqueo",
        sunlight: "Luz Solar Directa",
        cursor: "Cursor",
        active: "Activo",
        inspectorTitle: "Inspector",
        metricsTitle: "Métricas de Espacio",
        occupied: "OCUPADA",
        free: "LIBRE",
        diagnosticsTitle: "Diagnóstico",
        noConflicts: "Sin conflictos detectados."
    },
    en: {
        subtitle: "Circulation & Solar Incidence Simulator",
        room: "ROOM:",
        width: "Width",
        length: "Length",
        time: "TIME",
        window: "WINDOW:",
        themeLight: "Light Mode",
        themeDark: "Dark Mode",
        simulate: "SIMULATE",
        catalogTitle: "Furniture Catalog",
        catalogSearchPlaceholder: "Search furniture...",
        topView: "TOP VIEW",
        freeFlow: "Free Flow",
        collision: "Collision / Blocked",
        sunlight: "Direct Sunlight",
        cursor: "Cursor",
        active: "Active",
        inspectorTitle: "Inspector",
        metricsTitle: "Space Metrics",
        occupied: "OCCUPIED",
        free: "FREE",
        diagnosticsTitle: "Diagnostics",
        noConflicts: "No conflicts detected."
    }
};

function applyLanguage(lang) {
    window.currentLang = lang;
    const dict = I18N_DICTIONARY[lang];

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    setText("lbl-subtitle", dict.subtitle);
    setText("lbl-room", dict.room);
    setText("lbl-width", dict.width);
    setText("lbl-length", dict.length);
    setText("lbl-time", dict.time);
    setText("lbl-window", dict.window);
    setText("lbl-simulate", dict.simulate);
    setText("lbl-catalog-title", dict.catalogTitle);
    setText("lbl-top-view", dict.topView);
    setText("lbl-free-flow", dict.freeFlow);
    setText("lbl-collision", dict.collision);
    setText("lbl-sunlight", dict.sunlight);
    setText("lbl-cursor", dict.cursor);
    setText("lbl-active", dict.active);
    setText("lbl-inspector-title", dict.inspectorTitle);
    setText("lbl-metrics-title", dict.metricsTitle);
    setText("lbl-occupied", dict.occupied);
    setText("lbl-free", dict.free);
    setText("lbl-diagnostics-title", dict.diagnosticsTitle);
    setText("lbl-no-conflicts", dict.noConflicts);

    const searchInput = document.getElementById("catalog-search");
    if (searchInput) searchInput.placeholder = dict.catalogSearchPlaceholder;

    const isDark = document.documentElement.classList.contains("dark");
    setText("theme-text", isDark ? dict.themeDark : dict.themeLight);

    if (typeof renderCatalog === "function") renderCatalog();
    if (typeof selectFurniture === "function") selectFurniture(selectedMesh);
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof initScene === "function") initScene();
    if (typeof renderCatalog === "function") renderCatalog();

    const langToggleBtn = document.getElementById("lang-toggle");
    const langText = document.getElementById("lang-text");

    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const newLang = window.currentLang === "es" ? "en" : "es";
            if (langText) langText.innerText = newLang.toUpperCase();
            applyLanguage(newLang);
        });
    }

    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    const htmlEl = document.documentElement;

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isDark = htmlEl.classList.contains("dark");
            const dict = I18N_DICTIONARY[window.currentLang];

            if (isDark) {
                htmlEl.classList.remove("dark");
                if (themeIcon) themeIcon.className = "fa-solid fa-sun text-amber-500";
                if (themeText) themeText.innerText = dict.themeLight;
                if (typeof scene !== "undefined" && scene) scene.background = new THREE.Color(0xfef3c7);
            } else {
                htmlEl.classList.add("dark");
                if (themeIcon) themeIcon.className = "fa-solid fa-moon text-amber-400";
                if (themeText) themeText.innerText = dict.themeDark;
                if (typeof scene !== "undefined" && scene) scene.background = new THREE.Color(0x0f172a);
            }
        });
    }

    const searchInput = document.getElementById("catalog-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            if (typeof renderCatalog === "function") renderCatalog(e.target.value);
        });
    }

    const roomW = document.getElementById("room-width");
    const roomL = document.getElementById("room-length");

    if (roomW && roomL) {
        const handleRoomChange = () => {
            const w = parseFloat(roomW.value) || 4;
            const l = parseFloat(roomL.value) || 3.5;
            if (typeof updateRoomDimensions === "function") updateRoomDimensions(w, l);
            if (typeof window.updateMetrics === "function") window.updateMetrics();
        };

        roomW.addEventListener("change", handleRoomChange);
        roomL.addEventListener("change", handleRoomChange);
    }

    const timeSlider = document.getElementById("time-slider");
    const timeDisplay = document.getElementById("time-display");

    if (timeSlider && timeDisplay) {
        timeSlider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            const hours = Math.floor(val);
            const mins = (val % 1) === 0 ? "00" : "30";
            timeDisplay.innerText = `${hours}:${mins}`;
            if (typeof updateSunPosition === "function") updateSunPosition(val);
        });
    }

    const btnIso = document.getElementById("btn-view-iso");
    const btnTop = document.getElementById("btn-view-top");

    if (btnIso) {
        btnIso.addEventListener("click", () => {
            if (typeof camera !== "undefined" && typeof controls !== "undefined") {
                camera.position.set(6, 6, 8);
                controls.target.set(0, 0, 0);
            }
        });
    }

    if (btnTop) {
        btnTop.addEventListener("click", () => {
            if (typeof camera !== "undefined" && typeof controls !== "undefined") {
                camera.position.set(0, 10, 0.01);
                controls.target.set(0, 0, 0);
            }
        });
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
            if (typeof selectedMesh !== "undefined" && selectedMesh && typeof window.deleteSelected === "function") {
                window.deleteSelected();
            }
        }
        if (e.key === "r" || e.key === "R") {
            if (typeof selectedMesh !== "undefined" && selectedMesh && typeof window.rotateSelected === "function") {
                window.rotateSelected(45);
            }
        }
    });
});