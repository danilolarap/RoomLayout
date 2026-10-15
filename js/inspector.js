// Seleccionar elemento
function selectFurniture(meshGroup) {
    selectedMesh = meshGroup;
    const container = document.getElementById("inspector-content");
    const currentLang = window.currentLang || "es";
    if (!container) return;

    if (!meshGroup) {
        const emptyText = currentLang === "es" 
            ? "Haz clic en un objeto o en la puerta para moverlo." 
            : "Click on an object or the door to move it.";
        container.innerHTML = `<p class="text-slate-500 dark:text-slate-400 italic">${emptyText}</p>`;
        return;
    }

    const data = meshGroup.userData || {};
    const nameObj = data.name || { es: "Mueble", en: "Furniture" };
    const displayName = typeof nameObj === "object" ? (nameObj[currentLang] || nameObj.es) : nameObj;

    const lblWidth = currentLang === "es" ? "Ancho" : "Width";
    const lblLength = currentLang === "es" ? "Largo" : "Length";
    const lblRotate = currentLang === "es" ? "Rotar 45°" : "Rotate 45°";

    container.innerHTML = `
        <div class="bg-amber-50/80 dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700/80 space-y-2">
            <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
                <span class="flex items-center gap-1.5"><i class="fa-solid ${data.icon || 'fa-cube'} text-amber-500"></i> ${displayName}</span>
                ${!data.isDoor ? `<button onclick="window.deleteSelected()" class="text-red-500 hover:text-red-600 p-1"><i class="fa-solid fa-trash"></i></button>` : ''}
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>Pos X: <strong>${meshGroup.position.x.toFixed(2)}m</strong></div>
                <div>Pos Z: <strong>${meshGroup.position.z.toFixed(2)}m</strong></div>
                <div>${lblWidth}: <strong>${data.w || 1}m</strong></div>
                <div>${lblLength}: <strong>${data.l || 1}m</strong></div>
            </div>

            ${!data.isDoor ? `
            <div class="pt-1 flex gap-2">
                <button onclick="window.rotateSelected(45)" class="flex-1 bg-amber-200/60 dark:bg-slate-800 hover:bg-amber-300 dark:hover:bg-slate-700 text-amber-900 dark:text-slate-200 font-bold py-1 rounded-lg transition text-[11px]">
                    ${lblRotate} <i class="fa-solid fa-rotate-right ml-1"></i>
                </button>
            </div>` : ''}
        </div>
    `;
}

// Rotar objeto seleccionado
window.rotateSelected = function(deg = 45) {
    if (!selectedMesh || selectedMesh.userData.isDoor) return;
    selectedMesh.rotation.y += (deg * Math.PI) / 180;
    selectedMesh.userData.rotationY = selectedMesh.rotation.y;
    selectFurniture(selectedMesh);
};

// Eliminar objeto seleccionado
window.deleteSelected = function() {
    if (!selectedMesh || selectedMesh.userData.isDoor) return;
    scene.remove(selectedMesh);
    activeItems = activeItems.filter(item => item !== selectedMesh);
    selectFurniture(null);
    if (typeof window.updateMetrics === "function") window.updateMetrics();
};

// Actualizar métricas
window.updateMetrics = function() {
    const rw = parseFloat(document.getElementById("room-width").value) || 4;
    const rl = parseFloat(document.getElementById("room-length").value) || 3.5;
    const totalArea = rw * rl;

    let occupiedArea = 0;

    activeItems.forEach(item => {
        if (!item.userData.isDoor) {
            const w = item.userData.w || 1;
            const l = item.userData.l || 1;
            occupiedArea += w * l;
        }
    });

    const freeArea = Math.max(0, totalArea - occupiedArea);

    const occEl = document.getElementById("metric-occupied");
    const freeEl = document.getElementById("metric-free");

    if (occEl) occEl.innerText = `${occupiedArea.toFixed(1)} m²`;
    if (freeEl) freeEl.innerText = `${freeArea.toFixed(1)} m²`;
};