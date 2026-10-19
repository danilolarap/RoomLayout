// js/inspector.js - Panel Lateral de Inspección y Edición de Muebles

function selectFurniture(meshGroup) {
    selectedMesh = meshGroup;
    const content = document.getElementById("inspector-content");
    if (!content) return;

    if (!selectedMesh) {
        content.innerHTML = `<p class="text-slate-400 italic">Ningún objeto seleccionado.</p>`;
        return;
    }

    const d = selectedMesh.userData || {};
    const nameStr = d.name ? (d.name[window.currentLang] || d.name.es) : (d.isDoor ? "Puerta de Acceso" : "Mueble");

    content.innerHTML = `
        <div class="space-y-3">
            <div class="font-bold text-amber-900 dark:text-amber-400 text-sm border-b border-amber-200 dark:border-slate-800 pb-1">
                ${nameStr}
            </div>

            <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div><span class="text-slate-400">Ancho:</span> <strong>${d.w || 1} m</strong></div>
                <div><span class="text-slate-400">Largo:</span> <strong>${d.l || 1} m</strong></div>
            </div>

            <!-- Controles de Rotación -->
            <div>
                <label class="block text-[10px] text-slate-400 font-bold uppercase mb-1">Rotación (Girar 90°)</label>
                <div class="flex gap-2">
                    <button onclick="window.rotateSelected(-Math.PI / 2)" class="flex-1 bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold py-1 rounded-lg border border-amber-300/60 dark:border-slate-700 transition">
                        <i class="fa-solid fa-rotate-left"></i> -90°
                    </button>
                    <button onclick="window.rotateSelected(Math.PI / 2)" class="flex-1 bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold py-1 rounded-lg border border-amber-300/60 dark:border-slate-700 transition">
                        <i class="fa-solid fa-rotate-right"></i> +90°
                    </button>
                </div>
            </div>

            ${d.isDoor ? '' : `
                <button onclick="window.deleteSelected()" class="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-trash-can"></i> Eliminar Objeto
                </button>
            `}
        </div>
    `;
}

window.rotateSelected = function(angle) {
    if (!selectedMesh) return;
    selectedMesh.rotation.y += angle;
    if (!selectedMesh.userData) selectedMesh.userData = {};
    selectedMesh.userData.rotationY = selectedMesh.rotation.y;

    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
};

window.deleteSelected = function() {
    if (!selectedMesh || selectedMesh.userData?.isDoor) return;

    if (scene) {
        scene.remove(selectedMesh);
    }

    const idx = activeItems.indexOf(selectedMesh);
    if (idx !== -1) {
        activeItems.splice(idx, 1);
    }

    selectFurniture(null);

    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
};