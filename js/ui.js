// ui.js - Manejo de la Interfaz de Usuario e Idiomas

window.currentLang = "es";

const i18n = {
    es: {
        subtitle: "Simulador de Circulación e Incidencia Solar",
        room: "SALA:",
        hour: "HORA:",
        themeLight: "Modo Claro",
        themeDark: "Modo Oscuro",
        simulate: "SIMULAR",
        catalog: "CATÁLOGO MOBILIARIO",
        searchPlaceholder: "Buscar muebles...",
        inspector: "INSPECTOR",
        subInspector: "Haz clic en un objeto o en la puerta para moverla.",
        metrics: "MÉTRICAS DE ESPACIO",
        occupied: "OCUPADA",
        free: "LIBRE",
        diagTitle: "DIAGNÓSTICO",
        diagOk: "Sin conflictos detectados.",
        freeFlow: "Flujo Libre",
        collision: "Colisión / Bloqueo",
        sunLight: "Luz Solar Directa"
    },
    en: {
        subtitle: "Circulation & Solar Impact Simulator",
        room: "ROOM:",
        hour: "TIME:",
        themeLight: "Light Mode",
        themeDark: "Dark Mode",
        simulate: "SIMULATE",
        catalog: "FURNITURE CATALOG",
        searchPlaceholder: "Search furniture...",
        inspector: "INSPECTOR",
        subInspector: "Click on an object or the door to move it.",
        metrics: "SPACE METRICS",
        occupied: "OCCUPIED",
        free: "FREE",
        diagTitle: "DIAGNOSTIC",
        diagOk: "No conflicts detected.",
        freeFlow: "Free Flow",
        collision: "Collision / Block",
        sunLight: "Direct Sunlight"
    }
};

function initUI() {
    // Cambio de Idioma
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
        langBtn.addEventListener("click", () => {
            window.currentLang = window.currentLang === "es" ? "en" : "es";
            document.getElementById("lang-label").innerText = window.currentLang.toUpperCase();
            updateLanguageTexts();
            if (typeof renderCatalog === "function") renderCatalog();
            if (typeof selectFurniture === "function") selectFurniture(selectedMesh);
        });
    }

    // Modo Oscuro / Claro
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const isDark = document.documentElement.classList.toggle("dark");
            document.getElementById("theme-label").innerText = isDark ? i18n[window.currentLang].themeDark : i18n[window.currentLang].themeLight;
            document.getElementById("theme-icon").className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
            
            if (scene) {
                scene.background = new THREE.Color(isDark ? 0x0f172a : 0xfef3c7);
            }
        });
    }

    // Actualización de dimensiones del cuarto
    const inputW = document.getElementById("room-width");
    const inputL = document.getElementById("room-length");

    const updateRoom = () => {
        const w = parseFloat(inputW.value) || 4.0;
        const l = parseFloat(inputL.value) || 3.5;
        if (typeof updateRoomDimensions === "function") {
            updateRoomDimensions(w, l);
        }
        if (typeof window.updateMetrics === "function") {
            window.updateMetrics();
        }
    };

    if (inputW) inputW.addEventListener("change", updateRoom);
    if (inputL) inputL.addEventListener("change", updateRoom);

    // Control solar
    const sunSlider = document.getElementById("sun-time");
    if (sunSlider) {
        sunSlider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            const hours = Math.floor(val);
            const mins = (val % 1) === 0 ? "00" : "30";
            document.getElementById("time-display").innerText = `${hours}:${mins}`;
            if (typeof updateSunPosition === "function") {
                updateSunPosition(val);
            }
        });
    }

    // Buscador del catálogo
    const searchInput = document.getElementById("search-catalog");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            if (typeof renderCatalog === "function") {
                renderCatalog(e.target.value);
            }
        });
    }
}

function updateLanguageTexts() {
    const t = i18n[window.currentLang];
    const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    };

    setTxt("txt-subtitle", t.subtitle);
    setTxt("lbl-room", t.room);
    setTxt("lbl-hour", t.hour);
    setTxt("txt-simulate", t.simulate);
    setTxt("title-catalog", t.catalog);
    setTxt("title-inspector", t.inspector);
    setTxt("sub-inspector", t.subInspector);
    setTxt("title-metrics", t.metrics);
    setTxt("lbl-occupied", t.occupied);
    setTxt("lbl-free", t.free);
    setTxt("title-diag", t.diagTitle);
    setTxt("diag-ok", t.diagOk);
    setTxt("leg-free", t.freeFlow);
    setTxt("leg-collision", t.collision);
    setTxt("leg-sun", t.sunLight);

    const searchInput = document.getElementById("search-catalog");
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
}