// Seleccionar elemento e inspeccionar propiedades
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
    const lblHeightY = currentLang === "es" ? "Altura / Elevación" : "Height / Elevation";
    const lblRotate = currentLang === "es" ? "Rotar 45°" : "Rotate 45°";
    const lblDelete = currentLang === "es" ? "Eliminar Objeto" : "Delete Object";

    const currentY = meshGroup.position.y || 0;

    container.innerHTML = `
        <div class="bg-amber-50/80 dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-slate-700/80 space-y-3">
            <div class="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 text-sm">
                <span class="flex items-center gap-2"><i class="fa-solid ${data.icon || 'fa-cube'} text-amber-500 text-base"></i> ${displayName}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg border border-amber-100 dark:border-slate-700/50">
                <div>Pos X: <strong class="text-slate-900 dark:text-white">${meshGroup.position.x.toFixed(2)}m</strong></div>
                <div>Pos Z: <strong class="text-slate-900 dark:text-white">${meshGroup.position.z.toFixed(2)}m</strong></div>
                <div>${lblWidth}: <strong class="text-slate-900 dark:text-white">${data.w || 1}m</strong></div>
                <div>${lblLength}: <strong class="text-slate-900 dark:text-white">${data.l || 1}m</strong></div>
            </div>

            <!-- Ajuste de Altura con Botones de +- 20cm -->
            <div class="bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-lg border border-amber-100 dark:border-slate-700/50 space-y-2">
                <div class="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span>${lblHeightY}:</span>
                    <strong id="val-posY" class="text-amber-600 dark:text-amber-400 font-bold">${currentY.toFixed(2)} m</strong>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="window.changeSelectedHeight(-0.20)" class="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-1.5 px-2 rounded-lg transition text-xs flex items-center justify-center gap-1 active:scale-95">
                        <i class="fa-solid fa-arrow-down text-amber-600"></i> -20 cm
                    </button>
                    <button onclick="window.changeSelectedHeight(0.20)" class="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-2 rounded-lg transition text-xs flex items-center justify-center gap-1 active:scale-95 shadow-xs">
                        <i class="fa-solid fa-arrow-up"></i> +20 cm
                    </button>
                </div>
            </div>

            <!-- Botones de Acción -->
            <div class="space-y-2 pt-1">
                <button onclick="window.rotateSelected(45)" class="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs">
                    <i class="fa-solid fa-rotate-right text-sm"></i> ${lblRotate}
                </button>

                ${!data.isDoor ? `
                <button onclick="window.deleteSelected()" class="w-full bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 dark:border-red-900/50 active:scale-[0.98] font-bold py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs">
                    <i class="fa-solid fa-trash-can text-sm"></i> ${lblDelete}
                </button>` : ''}
            </div>
        </div>
    `;
}

// Función global para variar la altura en pasos de 20 cm
window.changeSelectedHeight = function(deltaY) {
    if (!selectedMesh) return;
    let newY = (selectedMesh.position.y || 0) + deltaY;
    
    // Evitar que baje por debajo del piso
    if (newY < 0) newY = 0;
    // Límite superior máximo de pared
    if (newY > 2.5) newY = 2.5;

    selectedMesh.position.y = parseFloat(newY.toFixed(2));

    const valDisplay = document.getElementById("val-posY");
    if (valDisplay) valDisplay.innerText = `${selectedMesh.position.y.toFixed(2)} m`;
};

window.rotateSelected = function(deg = 45) {
    if (!selectedMesh) return;
    selectedMesh.rotation.y += (deg * Math.PI) / 180;
    selectedMesh.userData.rotationY = selectedMesh.rotation.y;
    selectFurniture(selectedMesh);
};

window.deleteSelected = function() {
    if (!selectedMesh || selectedMesh.userData.isDoor) return;
    scene.remove(selectedMesh);
    activeItems = activeItems.filter(item => item !== selectedMesh);
    selectFurniture(null);
    if (typeof window.updateMetrics === "function") window.updateMetrics();
};

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