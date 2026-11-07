window.currentProjectId = null;
window.currentProjectName = "";

function projectFileError(error) {
    const messages = {
        extension: ["Selecciona un archivo .roomlayout descargado de RoomLayout.", "Select a .roomlayout file downloaded from RoomLayout."],
        size: ["El archivo supera el límite de 10 MB.", "The file exceeds the 10 MB limit."],
        version: ["Este archivo requiere una versión más reciente de RoomLayout.", "This file requires a newer version of RoomLayout."],
        integrity: ["El archivo está dañado o fue modificado. Usa una copia original.", "The file is damaged or modified. Use an original copy."],
        crypto: ["Abre RoomLayout mediante HTTPS o localhost para guardar y verificar archivos.", "Open RoomLayout over HTTPS or localhost to save and verify files."]
    };
    return (messages[error.message] || ["Archivo RoomLayout inválido o incompatible.", "Invalid or incompatible RoomLayout file."])[window.currentLang === "en" ? 1 : 0];
}

function initProjectsUI() {
    const btnSave = document.getElementById("btn-save-project");
    const btnMyProjects = document.getElementById("btn-my-projects");
    const modalProjects = document.getElementById("projects-modal");
    const btnCloseProjects = document.getElementById("btn-close-projects-modal");
    const btnExport = document.getElementById("btn-export-project");
    const fileImport = document.getElementById("file-import-project");

    async function saveFile(button) {
        const en = window.currentLang === "en";
        const name = prompt(en ? "Name of your layout:" : "Nombre de tu diseño:", window.currentProjectName || (en ? "My 3D Room" : "Mi habitación 3D"))?.trim();
        if (!name) return;
        button.disabled = true;
        try {
            const sceneData = window.getSceneData();
            const blob = await RoomLayoutFile.encode(name, sceneData);
            RoomLayoutFile.download(blob, name);
            window.currentProjectName = name;
            // Guests can download too; local storage failure does not block the file.
            if (typeof ProjectService !== "undefined" && typeof AuthService !== "undefined" && AuthService.getCurrentUser()) {
                try {
                    window.currentProjectId = await ProjectService.saveProject(name, sceneData.room, sceneData.items, window.currentProjectId);
                } catch (error) {
                    alert(en ? "File download started. The local copy could not be saved." : "Descarga del archivo iniciada. No se pudo guardar la copia local.");
                }
            }
        } catch (error) {
            alert(projectFileError(error));
        } finally {
            button.disabled = false;
        }
    }

    if (btnSave) btnSave.onclick = () => saveFile(btnSave);
    if (btnExport) btnExport.onclick = () => saveFile(btnExport);
    if (btnMyProjects) {
        btnMyProjects.onclick = async () => {
            await renderProjectsList();
            if (modalProjects) modalProjects.classList.remove("hidden");
        };
    }
    if (btnCloseProjects) btnCloseProjects.onclick = () => modalProjects?.classList.add("hidden");
    if (fileImport) {
        fileImport.onchange = async () => {
            const file = fileImport.files[0];
            if (!file) return;
            fileImport.disabled = true;
            try {
                const project = await RoomLayoutFile.decode(file);
                // Validate the complete file before changing the current scene.
                window.loadSceneData(project.scene);
                window.currentProjectId = null;
                window.currentProjectName = project.name;
                modalProjects?.classList.add("hidden");
                alert(window.currentLang === "en" ? "Layout opened successfully!" : "¡Diseño abierto correctamente!");
            } catch (error) {
                alert(projectFileError(error));
            } finally {
                fileImport.value = "";
                fileImport.disabled = false;
            }
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
            window.currentProjectName = project.name;
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
