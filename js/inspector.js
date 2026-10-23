// js/inspector.js - Panel Lateral de Inspección y Edición de Muebles con Personalización de Color (Soporte Bilingüe ES/EN)

function selectFurniture(meshGroup) {
    selectedMesh = meshGroup;
    const content = document.getElementById("inspector-content");
    if (!content) return;

    const lang = window.currentLang || "es";
    const isEn = lang === "en";

    if (!selectedMesh) {
        content.innerHTML = `<p id="inspector-empty" class="text-slate-400 italic">${isEn ? "No object selected." : "Ningún objeto seleccionado."}</p>`;
        return;
    }

    const d = selectedMesh.userData || {};

    let nameStr = isEn ? "Furniture Item" : "Mueble";
    if (d.name) {
        if (typeof d.name === "object") {
            nameStr = d.name[lang] || d.name.es || d.name.en || nameStr;
        } else if (typeof d.name === "string") {
            nameStr = d.name;
        }
    } else if (d.isDoor) {
        nameStr = isEn ? "Access Door" : "Puerta de Acceso";
    }

    const currentY = selectedMesh.position.y;

    // Obtener el color HEX actual del objeto
    let currentColorHex = "#2563eb"; // Valor por defecto
    selectedMesh.traverse(child => {
        if (child.isMesh && child.material && child.material.color) {
            currentColorHex = "#" + child.material.color.getHexString();
        }
    });

    const lblWidth = isEn ? "Width:" : "Ancho:";
    const lblLength = isEn ? "Length:" : "Largo:";
    const lblColor = isEn ? "COLOR / FINISH" : "COLOR / ACABADO";
    const lblHeight = isEn ? "HEIGHT (FLOOR Y)" : "ALTURA (PISO Y)";
    const lblResetHeight = isEn ? "Reset to Floor" : "Resetear al Suelo";
    const lblRotation = isEn ? "ROTATION (TURN 90°)" : "ROTACIÓN (GIRAR 90°)";
    const lblDelete = isEn ? "Delete Object" : "Eliminar Objeto";

    content.innerHTML = `
        <div class="space-y-3">
            <div class="font-bold text-amber-900 dark:text-amber-400 text-sm border-b border-amber-200 dark:border-slate-800 pb-1">
                ${nameStr}
            </div>

            <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div><span class="text-slate-400">${lblWidth}</span> <strong>${d.w || 1} m</strong></div>
                <div><span class="text-slate-400">${lblLength}</span> <strong>${d.l || 1} m</strong></div>
            </div>

            <!-- Personalización de Color / Material -->
            <div>
                <label class="block text-[10px] text-slate-400 font-bold uppercase mb-1">${lblColor}</label>
                <div class="flex items-center gap-2 bg-amber-50/80 dark:bg-slate-800 p-1.5 rounded-xl border border-amber-200/80 dark:border-slate-700">
                    <input type="color" id="picker-color" value="${currentColorHex}" onchange="window.changeSelectedColor(this.value)" class="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent">
                    <span class="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-bold" id="lbl-color-hex">${currentColorHex.toUpperCase()}</span>
                </div>
            </div>

            <!-- Controles de Altura / Elevación (Pasos de 20 cm) -->
            <div>
                <div class="flex justify-between items-center mb-1">
                    <label class="block text-[10px] text-slate-400 font-bold uppercase">${lblHeight}</label>
                    <span class="text-[11px] font-extrabold text-amber-900 dark:text-amber-300">${currentY.toFixed(2)} m</span>
                </div>
                <div class="flex gap-1.5">
                    <button onclick="window.stepElevation(-0.20)" class="flex-1 bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold py-1 rounded-lg border border-amber-300/60 dark:border-slate-700 transition active:scale-95 text-xs">
                        <i class="fa-solid fa-arrow-down"></i> -0.20m
                    </button>
                    <button onclick="window.stepElevation(0.20)" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 rounded-lg transition active:scale-95 text-xs">
                        <i class="fa-solid fa-arrow-up"></i> +0.20m
                    </button>
                    <button onclick="window.resetElevation()" title="${lblResetHeight}" class="bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-300/60 dark:border-slate-700 transition active:scale-95 text-xs">
                        <i class="fa-solid fa-arrows-to-dot"></i>
                    </button>
                </div>
            </div>

            <!-- Controles de Rotación -->
            <div>
                <label class="block text-[10px] text-slate-400 font-bold uppercase mb-1">${lblRotation}</label>
                <div class="flex gap-2">
                    <button onclick="window.rotateSelected(-Math.PI / 2)" class="flex-1 bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold py-1 rounded-lg border border-amber-300/60 dark:border-slate-700 transition active:scale-95 text-xs">
                        <i class="fa-solid fa-rotate-left"></i> -90°
                    </button>
                    <button onclick="window.rotateSelected(Math.PI / 2)" class="flex-1 bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold py-1 rounded-lg border border-amber-300/60 dark:border-slate-700 transition active:scale-95 text-xs">
                        <i class="fa-solid fa-rotate-right"></i> +90°
                    </button>
                </div>
            </div>

            ${d.isDoor ? '' : `
                <button onclick="window.deleteSelected()" class="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 transition flex items-center justify-center gap-1.5 text-xs mt-2">
                    <i class="fa-solid fa-trash-can"></i> ${lblDelete}
                </button>
            `}
        </div>
    `;
}

window.changeSelectedColor = function(hexColor) {
    if (!selectedMesh) return;

    selectedMesh.traverse(child => {
        if (child.isMesh && child.material) {
            // No cambiar el color a vidrios de pantalla ni espejos
            if (typeof Materials !== "undefined" && child.material !== Materials.tvScreen && child.material !== Materials.glassWindow) {
                child.material = child.material.clone();
                child.material.color.set(hexColor);
            }
        }
    });

    if (!selectedMesh.userData) selectedMesh.userData = {};
    selectedMesh.userData.customColor = hexColor;

    const lbl = document.getElementById("lbl-color-hex");
    if (lbl) lbl.innerText = hexColor.toUpperCase();
};

window.stepElevation = function(deltaY) {
    if (!selectedMesh) return;

    let newY = selectedMesh.position.y + deltaY;
    newY = Math.round(newY * 100) / 100;
    newY = Math.max(0, Math.min(3.0, newY));

    selectedMesh.position.y = newY;

    if (!selectedMesh.userData) selectedMesh.userData = {};
    selectedMesh.userData.positionY = newY;

    selectFurniture(selectedMesh);

    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
};

window.resetElevation = function() {
    if (!selectedMesh) return;
    selectedMesh.position.y = 0;
    if (!selectedMesh.userData) selectedMesh.userData = {};
    selectedMesh.userData.positionY = 0;

    selectFurniture(selectedMesh);

    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
};

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

    if (typeof scene !== "undefined" && scene) {
        scene.remove(selectedMesh);
    }

    if (typeof activeItems !== "undefined") {
        const idx = activeItems.indexOf(selectedMesh);
        if (idx !== -1) {
            activeItems.splice(idx, 1);
        }
    }

    selectFurniture(null);

    if (typeof window.updateMetrics === "function") {
        window.updateMetrics();
    }
};