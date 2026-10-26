window.currentProjectId = null;

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
            const localDatabaseMsg = window.currentLang === "en" ? "Local database active." : "Base de datos local activa.";
            container.innerHTML = `<p class="text-slate-400 italic text-xs text-center py-4">${localDatabaseMsg}</p>`;
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
        const errorMsg = window.currentLang === "en" ? "Error loading list." : "Error al cargar la lista.";
        container.innerHTML = `<p class="text-red-500 text-xs text-center py-4">${errorMsg}</p>`;
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
