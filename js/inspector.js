function selectFurniture(group) {
    if (selectedMesh) {
        selectedMesh.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissive.setHex(0x000000);
            }
        });
    }

    selectedMesh = group;
    const container = document.getElementById("inspector-content");

    if (!group) {
        container.innerHTML = `<p class="text-slate-400 italic">Haz clic en un objeto para seleccionarlo o arrastrarlo.</p>`;
        return;
    }

    group.traverse(child => {
        if (child.isMesh && child.material && child.material.emissive) {
            child.material.emissive.setHex(0x1e293b);
        }
    });

    const data = group.userData;
    const posX = group.position.x.toFixed(2);
    const posZ = group.position.z.toFixed(2);

    container.innerHTML = `
        <div class="space-y-2 text-xs">
            <div class="font-bold text-amber-400 flex justify-between items-center">
                <span>${data.name}</span>
                <span class="text-[10px] bg-blue-600/30 border border-blue-500/40 px-2 py-0.5 rounded text-blue-300">SELECCIONADO</span>
            </div>
            <div class="bg-slate-900/60 p-2 rounded border border-slate-700/50 space-y-1">
                <div class="flex justify-between text-slate-400">
                    <span>Medidas:</span>
                    <strong class="text-slate-200">${data.w}m × ${data.l}m × ${data.h}m</strong>
                </div>
                <div class="flex justify-between text-slate-400">
                    <span>Posición:</span>
                    <strong class="text-emerald-400">X: ${posX}m | Z: ${posZ}m</strong>
                </div>
                <div class="flex justify-between text-slate-400">
                    <span>Rotación:</span>
                    <strong class="text-slate-200">${data.rotationY}°</strong>
                </div>
            </div>

            <div class="flex items-center justify-between gap-2 pt-1">
                <button onclick="rotateSelected(45)" class="flex-1 bg-slate-700 hover:bg-slate-600 p-2 rounded text-white font-medium flex items-center justify-center gap-1">
                    <i class="fa-solid fa-rotate-right text-amber-400"></i> Rotar 45°
                </button>
                <button onclick="deleteSelected()" class="bg-red-600/80 hover:bg-red-600 p-2 rounded text-white font-medium flex items-center justify-center gap-1">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    checkCollisions();
}

window.rotateSelected = function(deg) {
    if (!selectedMesh) return;
    selectedMesh.rotation.y += (deg * Math.PI) / 180;
    selectedMesh.userData.rotationY = (selectedMesh.userData.rotationY + deg) % 360;

    const temp = selectedMesh.userData.w;
    selectedMesh.userData.w = selectedMesh.userData.l;
    selectedMesh.userData.l = temp;

    selectFurniture(selectedMesh);
    window.updateMetrics();
};

window.deleteSelected = function() {
    if (!selectedMesh) return;
    scene.remove(selectedMesh);
    activeItems = activeItems.filter(i => i !== selectedMesh);
    selectFurniture(null);
    window.updateMetrics();
};

window.updateMetrics = function() {
    const rw = parseFloat(document.getElementById("room-width").value) || 4;
    const rl = parseFloat(document.getElementById("room-length").value) || 3.5;
    const totalArea = rw * rl;

    let occupiedArea = 0;
    activeItems.forEach(item => {
        occupiedArea += item.userData.w * item.userData.l;
    });

    const freeArea = Math.max(0, totalArea - occupiedArea);

    document.getElementById("metric-occupied").innerText = `${occupiedArea.toFixed(1)} m²`;
    document.getElementById("metric-free").innerText = `${freeArea.toFixed(1)} m²`;

    checkCollisions();
};

function checkCollisions() {
    const list = document.getElementById("diagnostics-list");
    if (!list) return;

    let collisions = [];

    for (let i = 0; i < activeItems.length; i++) {
        for (let j = i + 1; j < activeItems.length; j++) {
            const a = activeItems[i];
            const b = activeItems[j];

            const dx = Math.abs(a.position.x - b.position.x);
            const dz = Math.abs(a.position.z - b.position.z);

            const minX = (a.userData.w + b.userData.w) / 2;
            const minZ = (a.userData.l + b.userData.l) / 2;

            if (dx < minX && dz < minZ) {
                collisions.push(`Superposición entre <strong>${a.userData.name}</strong> y <strong>${b.userData.name}</strong>.`);
            }
        }
    }

    if (collisions.length === 0) {
        list.innerHTML = `
            <div class="p-2 bg-emerald-950/40 border border-emerald-800/50 rounded text-emerald-300 text-[11px]">
                <i class="fa-solid fa-check-circle mr-1"></i> Sin conflictos detectados.
            </div>`;
    } else {
        list.innerHTML = collisions.map(c => `
            <div class="p-2 bg-red-950/40 border border-red-800/50 rounded text-red-300 text-[11px]">
                <i class="fa-solid fa-triangle-exclamation mr-1"></i> ${c}
            </div>`).join("");
    }
}