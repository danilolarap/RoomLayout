function selectFurniture(mesh) {
    selectedMesh = mesh;
    const container = document.getElementById("inspector-content");
    const data = mesh.userData;

    container.innerHTML = `
        <div class="space-y-2 text-xs">
            <div class="font-bold text-amber-400">${data.name}</div>
            <div class="flex justify-between">
                <span>Dimensiones:</span>
                <span>${data.w}m × ${data.l}m × ${data.h}m</span>
            </div>
            <div class="flex items-center justify-between gap-2 mt-2">
                <button onclick="rotateSelected(45)" class="flex-1 bg-slate-700 hover:bg-slate-600 p-1.5 rounded"><i class="fa-solid fa-rotate-right"></i> Rotar 45°</button>
                <button onclick="deleteSelected()" class="bg-red-600/80 hover:bg-red-600 p-1.5 rounded text-white"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;
}

window.rotateSelected = function(deg) {
    if (!selectedMesh) return;
    selectedMesh.rotation.y += (deg * Math.PI) / 180;
    selectedMesh.userData.rotationY += deg;
};

window.deleteSelected = function() {
    if (!selectedMesh) return;
    scene.remove(selectedMesh);
    activeItems = activeItems.filter(i => i !== selectedMesh);
    selectedMesh = null;
    document.getElementById("inspector-content").innerHTML = `<p class="text-slate-400 italic">Selecciona un elemento.</p>`;
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
};