// Paredes editables, independientes del mobiliario y del piso de la habitación.
let roomWalls = [];
let wallsInitialized = false;
let wallEditing = false;
const wallThickness = 0.04;
const wallControlClass = "w-full bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-700 dark:text-slate-200";

function wallRoomSize() {
    return {
        width: parseFloat(document.getElementById("room-width")?.value) || 4,
        length: parseFloat(document.getElementById("room-length")?.value) || 3.5
    };
}

function constrainWall(wall, width, length) {
    const d = wall.userData;
    const c = Math.abs(Math.cos(wall.rotation.y));
    const s = Math.abs(Math.sin(wall.rotation.y));
    const maxLength = Math.min(c > 1e-6 ? (width - s * wallThickness) / c : Infinity,
        s > 1e-6 ? (length - c * wallThickness) / s : Infinity);
    d.length = Math.max(0.25, Math.min(d.length, maxLength));
    const halfX = (c * d.length + s * wallThickness) / 2;
    const halfZ = (s * d.length + c * wallThickness) / 2;
    wall.position.x = THREE.MathUtils.clamp(wall.position.x, -width / 2 + halfX, width / 2 - halfX);
    wall.position.z = THREE.MathUtils.clamp(wall.position.z, -length / 2 + halfZ, length / 2 - halfZ);
}

function applyWallLayout(wall, width, length) {
    const d = wall.userData;
    if (d.placement !== "free") {
        const alongX = d.placement === "back" || d.placement === "front";
        d.length = alongX ? width : length;
        wall.rotation.y = alongX ? 0 : Math.PI / 2;
        wall.position.set(alongX ? 0 : (d.placement === "left" ? -1 : 1) * (width / 2 - wallThickness / 2), 0,
            alongX ? (d.placement === "back" ? -1 : 1) * (length / 2 - wallThickness / 2) : 0);
    }
    constrainWall(wall, width, length);
    const surface = wall.children[0];
    surface.scale.set(d.length, d.height, wallThickness);
    surface.position.y = d.height / 2;
    const outline = wall.children[1];
    outline.scale.copy(surface.scale);
    outline.position.copy(surface.position);
    updateSmartWallOpacity();
}

function createRoomWall(data = {}) {
    const size = wallRoomSize();
    const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const wall = new THREE.Group();
    wall.userData = {
        isWall: true,
        wallId: typeof data.wallId === "string" ? data.wallId : THREE.MathUtils.generateUUID(),
        edgeStart: THREE.MathUtils.clamp(finite(data.edgeStart, -0.5), -0.5, 0.49),
        edgeEnd: THREE.MathUtils.clamp(finite(data.edgeEnd, 0.5), -0.49, 0.5),
        placement: ["back", "front", "left", "right"].includes(data.placement) ? data.placement : "free",
        length: Math.max(0.25, finite(data.length, Math.min(2, size.width))),
        height: THREE.MathUtils.clamp(finite(data.height, 2.2), 0.25, 4)
    };
    if (wall.userData.edgeEnd <= wall.userData.edgeStart) {
        wall.userData.edgeStart = -0.5;
        wall.userData.edgeEnd = 0.5;
    }
    wall.position.set(finite(data.x, 0), 0, finite(data.z, 0));
    wall.rotation.y = finite(data.rotationY, 0);
    const surface = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({
        color: 0xf1f5f9, transparent: true, opacity: 0.25, side: THREE.FrontSide, depthWrite: false
    }));
    wall.add(surface);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
        new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9, depthTest: false }));
    outline.visible = false;
    wall.add(outline);
    roomWalls.push(wall);
    scene.add(wall);
    applyWallLayout(wall, size.width, size.length);
    return wall;
}

function syncRoomWalls(width, length) {
    if (!wallsInitialized) {
        wallsInitialized = true;
        createRoomWall({ placement: "back" });
        createRoomWall({ placement: "left" });
    }
    roomWalls.forEach(wall => applyWallLayout(wall, width, length));
    renderWallTools();
    if (selectedMesh?.userData.isWall) selectFurniture(selectedMesh);
}

function updateWallOpacity() {
    if (!camera) return;
    roomWalls.forEach(wall => {
        const d = wall.userData;
        const nx = Math.sin(wall.rotation.y), nz = Math.cos(wall.rotation.y);
        const sign = d.placement === "back" || d.placement === "left" ? -1
            : d.placement === "front" || d.placement === "right" ? 1
            : (wall.position.x * nx + wall.position.z * nz < 0 ? -1 : 1);
        const cameraSide = ((camera.position.x - wall.position.x) * nx + (camera.position.z - wall.position.z) * nz) * sign;
        wall.children[0].material.opacity = cameraSide < 0 ? 0.15 : 0.6;
    });
}

function getRoomWallsData() {
    return roomWalls.map(wall => ({
        wallId: wall.userData.wallId, edgeStart: wall.userData.edgeStart, edgeEnd: wall.userData.edgeEnd,
        placement: wall.userData.placement, length: wall.userData.length, height: wall.userData.height,
        x: wall.position.x, z: wall.position.z, rotationY: wall.rotation.y
    }));
}

function disposeRoomWall(wall) {
    scene.remove(wall);
    wall.traverse(child => { child.geometry?.dispose(); child.material?.dispose(); });
}

function loadRoomWalls(data) {
    setWallEditing(false);
    roomWalls.forEach(disposeRoomWall);
    roomWalls = [];
    wallsInitialized = true;
    // Los proyectos anteriores conservan sus dos paredes originales; [] permite un cuarto sin paredes.
    const walls = Array.isArray(data) ? data : [{ placement: "back" }, { placement: "left" }];
    walls.forEach(createRoomWall);
    renderWallTools();
}

function setWallEditing(enabled) {
    onPointerUp();
    wallEditing = Boolean(enabled);
    selectFurniture(null);
    renderWallTools();
}

function renderWallTools() {
    const isEn = window.currentLang === "en";
    const toggle = document.getElementById("edit-walls");
    if (!toggle) return;
    toggle.textContent = wallEditing ? (isEn ? "Finish editing walls" : "Terminar edición de paredes") : (isEn ? "Edit walls" : "Editar paredes");
    toggle.setAttribute("aria-pressed", String(wallEditing));
    document.getElementById("add-wall").textContent = isEn ? "+ Add wall" : "+ Agregar pared";
    document.getElementById("wall-help").textContent = isEn ? "Choose a wall here or in the scene. Drag it and adjust it in the inspector." : "Elige una pared aquí o en la escena. Arrástrala y ajústala en el inspector.";
    const panel = document.getElementById("wall-tools");
    panel.hidden = !wallEditing;
    const list = document.getElementById("wall-list");
    list.replaceChildren();
    roomWalls.forEach((wall, i) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `${wallControlClass} text-left`;
        button.textContent = `${isEn ? "Wall" : "Pared"} ${i + 1} · ${wall.userData.length.toFixed(2)} m`;
        button.setAttribute("aria-pressed", String(selectedMesh === wall));
        button.onclick = () => selectFurniture(wall);
        list.appendChild(button);
        wall.children[1].visible = selectedMesh === wall && wallEditing;
    });
}

function addRoomWall() {
    if (!wallEditing) setWallEditing(true);
    selectFurniture(createRoomWall());
}

function renderWallInspector(wall, content) {
    const isEn = window.currentLang === "en";
    const d = wall.userData;
    const field = (key, label, value, min, max, step) => `<label class="block text-xs text-slate-600 dark:text-slate-300">${label}
        <input class="${wallControlClass} mt-1" type="number" value="${value}" min="${min}" max="${max}" step="${step}" onchange="window.updateSelectedWall('${key}', this.value)"></label>`;
    const size = wallRoomSize();
    const placements = isEn ? [["free", "Free position"], ["back", "Back edge"], ["front", "Front edge"], ["left", "Left edge"], ["right", "Right edge"]]
        : [["free", "Posición libre"], ["back", "Borde posterior"], ["front", "Borde frontal"], ["left", "Borde izquierdo"], ["right", "Borde derecho"]];
    content.innerHTML = `<div class="space-y-3">
        <h3 class="font-bold text-amber-900 dark:text-amber-400">${isEn ? "Wall" : "Pared"} ${roomWalls.indexOf(wall) + 1}</h3>
        <label class="block text-xs">${isEn ? "Placement" : "Disposición"}
            <select class="${wallControlClass} mt-1" onchange="window.updateSelectedWall('placement', this.value)">${placements.map(([value, label]) => `<option value="${value}" ${d.placement === value ? "selected" : ""}>${label}</option>`).join("")}</select>
        </label>
        <div class="grid grid-cols-2 gap-2">
            ${field("length", isEn ? "Length (m)" : "Longitud (m)", d.length.toFixed(2), 0.25, Math.hypot(size.width, size.length).toFixed(2), 0.05)}
            ${field("height", isEn ? "Height (m)" : "Altura (m)", d.height.toFixed(2), 0.25, 4, 0.05)}
            ${field("x", "X (m)", wall.position.x.toFixed(2), -size.width / 2, size.width / 2, 0.05)}
            ${field("z", "Z (m)", wall.position.z.toFixed(2), -size.length / 2, size.length / 2, 0.05)}
        </div>
        ${field("angle", isEn ? "Angle (°)" : "Ángulo (°)", (THREE.MathUtils.radToDeg(wall.rotation.y) % 360).toFixed(1), -360, 360, 15)}
        <p class="text-[10px] text-slate-500 dark:text-slate-400">${isEn ? "Edge walls follow the room size. Changing length, position or angle switches to free placement. Transparency follows the camera." : "Las paredes de borde se adaptan al tamaño del cuarto. Cambiar longitud, posición o ángulo activa la posición libre. La transparencia se adapta a la cámara."}</p>
        <button type="button" onclick="window.deleteSelected()" class="w-full text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 rounded-lg p-2">${isEn ? "Delete wall" : "Eliminar pared"}</button>
    </div>`;
}

function updateSelectedWall(key, value) {
    const wall = selectedMesh;
    if (!wall?.userData.isWall) return;
    const d = wall.userData;
    if (key === "placement") {
        if (!["free", "back", "front", "left", "right"].includes(value)) return;
        d.placement = value;
    } else {
        const number = Number(value);
        if (!Number.isFinite(number) || !["length", "height", "x", "z", "angle"].includes(key)) return;
        if (key !== "height") d.placement = "free";
        if (key === "length") d.length = Math.max(0.25, number);
        if (key === "height") d.height = THREE.MathUtils.clamp(number, 0.25, 4);
        if (key === "x" || key === "z") wall.position[key] = number;
        if (key === "angle") wall.rotation.y = THREE.MathUtils.degToRad(number % 360);
    }
    const size = wallRoomSize();
    applyWallLayout(wall, size.width, size.length);
    selectFurniture(wall);
}
