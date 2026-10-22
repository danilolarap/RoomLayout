// js/ui.js - Manejo de la Interfaz General, Idiomas, Exportación PNG y Proyectos

window.currentLang = "es";
window.currentProjectId = null;

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
        diagTitle: "ASISTENTE IA",
        diagOk: "Distribución óptima sin conflictos.",
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
        diagTitle: "AI ASSISTANT",
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

// Función de Exportación PNG Render HQ
function initExportPNG() {
    const btnExportPng = document.getElementById("btn-export-png");
    if (btnExportPng) {
        btnExportPng.onclick = () => {
            if (typeof renderer === "undefined" || !renderer) return;

            // Renderizar la escena en el canvas antes de capturar
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
            const user = AuthService.getCurrentUser();
            if (!user) {
                alert("Por favor inicia sesión para guardar tus proyectos.");
                document.getElementById("auth-modal")?.classList.remove("hidden");
                return;
            }

            const name = prompt("Nombre de tu diseño:", "Mi Habitación 3D");
            if (!name) return;

            try {
                const sceneData = window.getSceneData();
                window.currentProjectId = await ProjectService.saveProject(name, sceneData.room, sceneData.items, window.currentProjectId);
                alert("¡Proyecto guardado exitosamente en tu base de datos local!");
            } catch (err) {
                alert("Error al guardar el proyecto: " + err.message);
            }
        };
    }

    if (btnMyProjects) {
        btnMyProjects.onclick = async () => {
            const user = AuthService.getCurrentUser();
            if (!user) {
                alert("Por favor inicia sesión para ver tus diseños guardados.");
                document.getElementById("auth-modal")?.classList.remove("hidden");
                return;
            }
            await renderProjectsList();
            modalProjects.classList.remove("hidden");
        };
    }

    if (btnCloseProjects) {
        btnCloseProjects.onclick = () => modalProjects.classList.add("hidden");
    }

    if (btnExportJson) {
        btnExportJson.onclick = () => {
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
                    window.loadSceneData(parsedData);
                    modalProjects.classList.add("hidden");
                    alert("¡Diseño importado correctamente!");
                } catch (err) {
                    alert("Error al leer el archivo JSON.");
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
        const projects = await ProjectService.getUserProjects();
        if (projects.length === 0) {
            container.innerHTML = `<p class="text-slate-400 italic text-xs text-center py-4">No tienes diseños guardados aún.</p>`;
            return;
        }

        container.innerHTML = "";
        projects.forEach(p => {
            const item = document.createElement("div");
            item.className = "bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs";
            
            const dateStr = new Date(p.updatedAt).toLocaleDateString();

            item.innerHTML = `
                <div>
                    <h4 class="font-bold text-amber-900 dark:text-amber-300 text-sm">${p.name}</h4>
                    <p class="text-[10px] text-slate-500">${p.room.width}m × ${p.room.length}m | ${p.items.length} objetos | ${dateStr}</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="window.loadProject(${p.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition shadow-xs">
                        Cargar
                    </button>
                    <button onclick="window.deleteProject(${p.id})" class="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 rounded-lg transition shadow-xs">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (err) {
        container.innerHTML = `<p class="text-red-500 text-xs text-center py-4">Error al cargar la lista.</p>`;
    }
}

window.loadProject = async function(id) {
    try {
        const project = await ProjectService.getProjectById(id);
        if (project) {
            window.loadSceneData({ room: project.room, items: project.items });
            window.currentProjectId = project.id;
            document.getElementById("projects-modal").classList.add("hidden");
        }
    } catch (err) {
        alert("No se pudo cargar el proyecto.");
    }
};

window.deleteProject = async function(id) {
    if (confirm("¿Estás seguro de eliminar este diseño?")) {
        await ProjectService.deleteProject(id);
        await renderProjectsList();
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
    if (typeof window.initAuthModal === "function") {
        window.initAuthModal();
    }
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
            document.getElementById("lang-label").innerText = window.currentLang.toUpperCase();
            updateLanguageTexts();
            if (typeof renderCatalog === "function") renderCatalog();
            if (typeof selectFurniture === "function") selectFurniture(selectedMesh);
        });
    }

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const isDark = document.documentElement.classList.toggle("dark");
            document.getElementById("theme-label").innerText = isDark ? i18n[window.currentLang].themeDark : i18n[window.currentLang].themeLight;
            document.getElementById("theme-icon").className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
            
            const lblModalTheme = document.getElementById("lbl-modal-theme");
            if (lblModalTheme) lblModalTheme.innerText = isDark ? "Modo Oscuro" : "Modo Claro";

            if (scene) {
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
            document.getElementById("time-display").innerText = `${formattedHours}:${formattedMins}`;
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