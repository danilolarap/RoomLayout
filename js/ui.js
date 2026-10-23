// js/ui.js - Manejo de la Interfaz General, Idiomas, Exportación PNG y Proyectos

window.currentLang = "es";
window.currentProjectId = null;

const i18n = {
    es: {
        subtitle: "Simulador de Circulación e Incidencia Solar",
        room: "SALA:",
        roomWidth: "Ancho",
        roomLength: "Largo",
        hour: "HORA:",
        btnRender: "Render PNG",
        btnSave: "Guardar",
        btnProjects: "Mis Diseños",
        guestDemo: "Invitado Demo",
        themeLight: "Modo Claro",
        themeDark: "Modo Oscuro",
        simulate: "SIMULAR",
        catalog: "CATÁLOGO MOBILIARIO",
        searchPlaceholder: "Buscar muebles...",
        viewTop: "PLANTA (TOP)",
        inspector: "INSPECTOR",
        subInspector: "Haz clic en un objeto o en la puerta para moverla.",
        inspectorEmpty: "Ningún objeto seleccionado.",
        metrics: "MÉTRICAS DE ESPACIO",
        occupied: "OCUPADA",
        free: "LIBRE",
        diagTitle: "ASISTENTE IA",
        btnAnalyze: "ANALIZAR",
        lblAiScore: "Puntaje Eficiencia:",
        diagOk: "Distribución óptima sin conflictos.",
        freeFlow: "Flujo Libre",
        collision: "Colisión / Bloqueo",
        sunLight: "Luz Solar Directa"
    },
    en: {
        subtitle: "Circulation & Solar Impact Simulator",
        room: "ROOM:",
        roomWidth: "Width",
        roomLength: "Length",
        hour: "TIME:",
        btnRender: "PNG Render",
        btnSave: "Save",
        btnProjects: "My Projects",
        guestDemo: "Guest Demo",
        themeLight: "Light Mode",
        themeDark: "Dark Mode",
        simulate: "SIMULATE",
        catalog: "FURNITURE CATALOG",
        searchPlaceholder: "Search furniture...",
        viewTop: "TOP VIEW",
        inspector: "INSPECTOR",
        subInspector: "Click on an object or the door to move it.",
        inspectorEmpty: "No object selected.",
        metrics: "SPACE METRICS",
        occupied: "OCCUPIED",
        free: "FREE",
        diagTitle: "AI ASSISTANT",
        btnAnalyze: "ANALYZE",
        lblAiScore: "Efficiency Score:",
        diagOk: "Optimal layout with no conflicts.",
        freeFlow: "Free Flow",
        collision: "Collision / Block",
        sunLight: "Direct Sunlight"
    }
};

window.stepRoomDimension = function(inputId, step) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let val = (parseFloat(input.value) || 0) + step;
    const min = parseFloat(input.min) || 2.0;
    const max = parseFloat(input.max) || 15.0;

    val = Math.max(min, Math.min(max, val));
    input.value = val.toFixed(1);

    const inputW = document.getElementById("room-width");
    const inputL = document.getElementById("room-length");

    const w = parseFloat(inputW.value) || 4.0;
    const l = parseFloat(inputL.value) || 3.5;

    if (typeof updateRoomDimensions === "function") {
        updateRoomDimensions(w, l);
    }
    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
};

function initExportPNG() {
    const btnExportPng = document.getElementById("btn-export-png");
    if (btnExportPng) {
        btnExportPng.onclick = () => {
            if (typeof renderer === "undefined" || !renderer) return;

            renderer.render(scene, camera);
            const dataURL = renderer.domElement.toDataURL("image/png");

            const link = document.createElement("a");
            link.download = `room_layout_render_${Date.now()}.png`;
            link.href = dataURL;
            link.click();
        };
    }
}

function initProjectsUI() {
    const btnSave = document.getElementById("btn-save-project");
    const btnMyProjects = document.getElementById("btn-my-projects");
    const modalProjects = document.getElementById("projects-modal");
    const btnCloseProjects = document.getElementById("btn-close-projects-modal");
    const btnExportJson = document.getElementById("btn-export-json");
    const fileImportJson = document.getElementById("file-import-json");

    if (btnSave) {
        btnSave.onclick = async () => {
            const promptMsg = window.currentLang === "en" ? "Name of your layout:" : "Nombre de tu diseño:";
            const name = prompt(promptMsg, "My 3D Room");
            if (!name) return;

            try {
                const sceneData = window.getSceneData();
                if (typeof ProjectService !== "undefined") {
                    window.currentProjectId = await ProjectService.saveProject(name, sceneData.room, sceneData.items, window.currentProjectId);
                    alert(window.currentLang === "en" ? "Project saved successfully!" : "¡Proyecto guardado exitosamente en tu base de datos local!");
                } else {
                    alert(window.currentLang === "en" ? "Project prepared locally!" : "¡Proyecto preparado localmente!");
                }
            } catch (err) {
                alert("Error: " + err.message);
            }
        };
    }

    if (btnMyProjects) {
        btnMyProjects.onclick = async () => {
            await renderProjectsList();
            if (modalProjects) modalProjects.classList.remove("hidden");
        };
    }

    if (btnCloseProjects) {
        btnCloseProjects.onclick = () => {
            if (modalProjects) modalProjects.classList.add("hidden");
        };
    }

    if (btnExportJson) {
        btnExportJson.onclick = () => {
            if (typeof window.getSceneData !== "function") return;
            const data = window.getSceneData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `room_layout_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    if (fileImportJson) {
        fileImportJson.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    if (typeof window.loadSceneData === "function") {
                        window.loadSceneData(parsedData);
                    }
                    if (modalProjects) modalProjects.classList.add("hidden");
                    alert(window.currentLang === "en" ? "Layout imported successfully!" : "¡Diseño importado correctamente!");
                } catch (err) {
                    alert(window.currentLang === "en" ? "Error reading JSON file." : "Error al leer el archivo JSON.");
                }
            };
            reader.readAsText(file);
        };
    }
}

async function renderProjectsList() {
    const container = document.getElementById("projects-list-container");
    if (!container) return;

    try {
        if (typeof ProjectService === "undefined") {
            container.innerHTML = `<p class="text-slate-400 italic text-xs text-center py-4">Local database active.</p>`;
            return;
        }

        const projects = await ProjectService.getUserProjects();
        if (projects.length === 0) {
            const noProjectsMsg = window.currentLang === "en" ? "You don't have saved layouts yet." : "No tienes diseños guardados aún.";
            container.innerHTML = `<p class="text-slate-400 italic text-xs text-center py-4">${noProjectsMsg}</p>`;
            return;
        }

        container.innerHTML = "";
        projects.forEach(p => {
            const item = document.createElement("div");
            item.className = "bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs";
            
            const dateStr = new Date(p.updatedAt).toLocaleDateString();
            const loadTxt = window.currentLang === "en" ? "Load" : "Cargar";

            item.innerHTML = `
                <div>
                    <h4 class="font-bold text-amber-900 dark:text-amber-300 text-sm">${p.name}</h4>
                    <p class="text-[10px] text-slate-500">${p.room.width}m × ${p.room.length}m | ${p.items.length} ${window.currentLang === "en" ? "items" : "objetos"} | ${dateStr}</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="window.loadProject(${p.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition shadow-xs">
                        ${loadTxt}
                    </button>
                    <button onclick="window.deleteProject(${p.id})" class="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 rounded-lg transition shadow-xs">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (err) {
        container.innerHTML = `<p class="text-red-500 text-xs text-center py-4">Error loading list.</p>`;
    }
}

window.loadProject = async function(id) {
    try {
        if (typeof ProjectService === "undefined") return;
        const project = await ProjectService.getProjectById(id);
        if (project) {
            if (typeof window.loadSceneData === "function") {
                window.loadSceneData({ room: project.room, items: project.items });
            }
            window.currentProjectId = project.id;
            const modal = document.getElementById("projects-modal");
            if (modal) modal.classList.add("hidden");
        }
    } catch (err) {
        alert(window.currentLang === "en" ? "Could not load project." : "No se pudo cargar el proyecto.");
    }
};

window.deleteProject = async function(id) {
    const confirmMsg = window.currentLang === "en" ? "Are you sure you want to delete this layout?" : "¿Estás seguro de eliminar este diseño?";
    if (confirm(confirmMsg)) {
        if (typeof ProjectService !== "undefined") {
            await ProjectService.deleteProject(id);
            await renderProjectsList();
        }
    }
};

window.runAIDiagnostic = function() {
    if (typeof window.AIEngine === "undefined") return;

    const analysis = window.AIEngine.analyzeScene();
    const diagBox = document.getElementById("diagnostic-box");
    const scoreBadge = document.getElementById("ai-score-badge");

    if (scoreBadge) {
        scoreBadge.innerText = `${analysis.score} / 100`;
        if (analysis.score >= 80) {
            scoreBadge.className = "text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-xs";
        } else if (analysis.score >= 50) {
            scoreBadge.className = "text-xs font-black px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs";
        } else {
            scoreBadge.className = "text-xs font-black px-2 py-0.5 rounded-md bg-red-500 text-white shadow-xs";
        }
    }

    if (!diagBox) return;
    diagBox.innerHTML = "";

    if (analysis.conflicts.length === 0 && analysis.suggestions.length === 0) {
        diagBox.className = "flex-1 bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 p-2.5 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 space-y-2";
        diagBox.innerHTML = `<div class="flex items-center gap-1.5 font-bold"><i class="fa-solid fa-circle-check"></i> <span>${i18n[window.currentLang].diagOk}</span></div>`;
        return;
    }

    diagBox.className = "flex-1 bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 p-2.5 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 space-y-2 max-h-48 overflow-y-auto custom-scrollbar";

    analysis.conflicts.forEach(msg => {
        const item = document.createElement("div");
        item.className = "flex items-start gap-1.5 text-red-600 dark:text-red-400 font-medium";
        item.innerHTML = `<i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0"></i> <span>${msg}</span>`;
        diagBox.appendChild(item);
    });

    analysis.suggestions.forEach(msg => {
        const item = document.createElement("div");
        item.className = "flex items-start gap-1.5 text-amber-700 dark:text-amber-300 font-medium";
        item.innerHTML = `<i class="fa-solid fa-lightbulb mt-0.5 shrink-0"></i> <span>${msg}</span>`;
        diagBox.appendChild(item);
    });
};

function initUI() {
    initProjectsUI();
    initExportPNG();

    const btnAi = document.getElementById("btn-analyze-ai");
    if (btnAi) {
        btnAi.addEventListener("click", () => {
            window.runAIDiagnostic();
        });
    }

    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
        langBtn.addEventListener("click", () => {
            window.currentLang = window.currentLang === "es" ? "en" : "es";
            const langLabel = document.getElementById("lang-label");
            if (langLabel) langLabel.innerText = window.currentLang.toUpperCase();
            updateLanguageTexts();
            if (typeof renderCatalog === "function") renderCatalog();
            if (typeof selectFurniture === "function" && typeof selectedMesh !== "undefined") selectFurniture(selectedMesh);
            if (typeof window.runAIDiagnostic === "function") window.runAIDiagnostic();
        });
    }

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const isDark = document.documentElement.classList.toggle("dark");
            const themeLabel = document.getElementById("theme-label");
            const themeIcon = document.getElementById("theme-icon");
            
            if (themeLabel) themeLabel.innerText = isDark ? i18n[window.currentLang].themeDark : i18n[window.currentLang].themeLight;
            if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";

            if (typeof scene !== "undefined" && scene) {
                scene.background = new THREE.Color(isDark ? 0x0f172a : 0xfef3c7);
            }
        });
    }

    const btnIso = document.getElementById("view-iso");
    const btnTop = document.getElementById("view-top");

    if (btnIso && btnTop) {
        btnIso.addEventListener("click", () => {
            btnIso.className = "bg-amber-500 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-md hover:bg-amber-600 transition";
            btnTop.className = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-300 dark:border-slate-700 font-bold px-3 py-1 rounded-lg text-xs shadow-xs hover:bg-amber-100 dark:hover:bg-slate-700 transition";
            if (typeof window.setCameraView === "function") window.setCameraView("iso");
        });

        btnTop.addEventListener("click", () => {
            btnTop.className = "bg-amber-500 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-md hover:bg-amber-600 transition";
            btnIso.className = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-amber-300 dark:border-slate-700 font-bold px-3 py-1 rounded-lg text-xs shadow-xs hover:bg-amber-100 dark:hover:bg-slate-700 transition";
            if (typeof window.setCameraView === "function") window.setCameraView("top");
        });
    }

    const btnSimulate = document.getElementById("btn-simulate");
    if (btnSimulate) {
        btnSimulate.addEventListener("click", () => {
            if (typeof window.startSunSimulation === "function") {
                window.startSunSimulation();
            }
        });
    }

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

    const sunSlider = document.getElementById("sun-time");
    if (sunSlider) {
        sunSlider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            const hours = Math.floor(val);
            const mins = Math.round((val % 1) * 60);
            const formattedMins = mins < 10 ? `0${mins}` : mins;
            const formattedHours = hours < 10 ? `0${hours}` : hours;
            const display = document.getElementById("time-display");
            if (display) display.innerText = `${formattedHours}:${formattedMins}`;
            if (typeof updateSunPosition === "function") {
                updateSunPosition(val);
            }
        });
    }

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
    setTxt("lbl-room-width", t.roomWidth);
    setTxt("lbl-room-length", t.roomLength);
    setTxt("lbl-hour", t.hour);
    setTxt("txt-btn-render", t.btnRender);
    setTxt("txt-btn-save", t.btnSave);
    setTxt("txt-btn-projects", t.btnProjects);

    const userDisplay = document.getElementById("user-display-name");
    if (userDisplay && (userDisplay.innerText === "Invitado Demo" || userDisplay.innerText === "Guest Demo")) {
        userDisplay.innerText = t.guestDemo;
    }

    const isDark = document.documentElement.classList.contains("dark");
    setTxt("theme-label", isDark ? t.themeDark : t.themeLight);

    setTxt("txt-simulate", t.simulate);
    setTxt("title-catalog", t.catalog);
    setTxt("txt-view-top", t.viewTop);
    setTxt("title-inspector", t.inspector);
    setTxt("sub-inspector", t.subInspector);
    setTxt("inspector-empty", t.inspectorEmpty);
    setTxt("title-metrics", t.metrics);
    setTxt("lbl-occupied", t.occupied);
    setTxt("lbl-free", t.free);
    setTxt("title-diag", t.diagTitle);
    setTxt("txt-btn-analyze", t.btnAnalyze);
    setTxt("lbl-ai-score", t.lblAiScore);
    setTxt("diag-ok", t.diagOk);
    setTxt("leg-free", t.freeFlow);
    setTxt("leg-collision", t.collision);
    setTxt("leg-sun", t.sunLight);

    const searchInput = document.getElementById("search-catalog");
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
}