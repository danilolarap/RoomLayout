// js/scene.js - Escena 3D, Cámaras, Luces y Transparencia Inteligente

let scene, camera, renderer, controls;
let roomMesh, sunLight, sunVisual;
let activeItems = [];
let selectedMesh = null;
let footprintGroup = null;
let footprintSource = null;

let isDragging = false;
let draggedObject = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const planeIntersection = new THREE.Vector3();
const dragOffset = new THREE.Vector3();

let isSimulating = false;
let animationFrameId = null;

function initScene() {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    scene = new THREE.Scene();
    // The panoramic environment is rendered separately from editable room objects.
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4.8, 4.8, 6.4);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.addEventListener("change", updateSmartWallOpacity);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.bias = -0.00015;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    sunVisual = new THREE.Group();
    const sunHalo = new THREE.Mesh(
        new THREE.SphereGeometry(0.52, 32, 24),
        new THREE.MeshBasicMaterial({
            color: 0xffb52e,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false
        })
    );
    const sunCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0xffe58a, toneMapped: false })
    );
    sunVisual.add(sunHalo, sunCore);
    sunCore.userData.moonTexture = createMoonTexture();
    sunVisual.renderOrder = 1;
    scene.add(sunVisual);
    updateCelestialMode(document.documentElement.classList.contains("dark"));

    updateRoomDimensions(4.0, 3.5);
    updateSunPosition(15.5);

    addDefaultDoor(4.0, 3.5);

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("pointerup", onPointerUp);

    window.addEventListener("resize", onWindowResize);

    animate();
}

function createMoonTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e6edf3";
    ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 38; i++) {
        const x = (i * 137.51) % 512;
        const y = 25 + (i * 73.3) % 206;
        const radius = 5 + i % 15;
        const gradient = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, radius);
        gradient.addColorStop(0, "#aabac960");
        gradient.addColorStop(.75, "#bcc9d650");
        gradient.addColorStop(1, "#d8e2eb00");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

function updateCelestialMode(isDark) {
    if (!sunVisual || !sunLight) return;
    const [halo, core] = sunVisual.children;
    core.material.color.setHex(isDark ? 0xd4ddea : 0xffe58a);
    core.material.map = isDark ? core.userData.moonTexture : null;
    core.material.needsUpdate = true;
    halo.material.color.setHex(isDark ? 0xc5dcff : 0xffb52e);
    halo.material.opacity = isDark ? 0.08 : 0.2;
    sunVisual.userData.celestialMode = isDark ? "moon" : "sun";
    sunLight.color.setHex(isDark ? 0xd6e5ff : 0xfffbde);
    sunLight.intensity = isDark ? 1.05 : 1.4;
    const icon = document.getElementById("simulation-light-icon");
    if (icon) icon.className = `fa-solid ${isDark ? "fa-moon text-slate-400" : "fa-sun text-amber-500"} text-sm`;
    const legend = document.getElementById("leg-sun");
    if (legend) legend.textContent = window.currentLang === "en"
        ? (isDark ? "Direct Moonlight" : "Direct Sunlight")
        : (isDark ? "Luz Lunar Directa" : "Luz Solar Directa");
}

function updateRoomTheme(isDark = document.documentElement.classList.contains("dark")) {
    if (!roomMesh) return;
    roomMesh.children.forEach(child => {
        if (child.name === "room-floor" || child.name === "room-underside") {
            child.material.color.setHex(isDark ? 0x1e293b : 0xfffbeb);
        } else if (child.name === "room-grid") {
            const colors = child.geometry.getAttribute("color");
            const center = new THREE.Color(isDark ? 0xf59e0b : 0xd97706);
            const lines = new THREE.Color(isDark ? 0x64748b : 0xd6c7a1);
            const divisions = child.userData.divisions;
            for (let i = 0; i <= divisions; i++) {
                const color = i === divisions / 2 ? center : lines;
                for (let j = 0; j < 4; j++) colors.setXYZ(i * 4 + j, color.r, color.g, color.b);
            }
            colors.needsUpdate = true;
        }
    });
}

function updateRoomDimensions(width, length) {
    if (roomMesh) {
        roomMesh.traverse(child => {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) child.material.forEach(material => material.dispose());
            else child.material?.dispose();
        });
        scene.remove(roomMesh);
    }

    const group = new THREE.Group();

    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorColor = document.documentElement.classList.contains("dark") ? 0x1e293b : 0xfffbeb;
    const floorMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.82,
        side: THREE.FrontSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.name = "room-floor";
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // La cara inferior es decorativa y no recibe sombras para evitar shadow acne al orbitar bajo el piso.
    const floorUnderside = new THREE.Mesh(
        new THREE.PlaneGeometry(width, length),
        new THREE.MeshBasicMaterial({ color: floorColor, side: THREE.BackSide })
    );
    floorUnderside.rotation.x = -Math.PI / 2;
    floorUnderside.name = "room-underside";
    floorUnderside.position.y = -0.002;
    floorUnderside.receiveShadow = false;
    floorUnderside.castShadow = false;
    group.add(floorUnderside);

    const gridSize = Math.ceil(Math.max(width, length) / 0.25) * 0.25;
    const grid = new THREE.GridHelper(gridSize, Math.round(gridSize / 0.25), 0xd97706, 0xd6c7a1);
    grid.name = "room-grid";
    grid.userData.divisions = Math.round(gridSize / 0.25);
    grid.position.y = 0.012;
    grid.material.transparent = true;
    grid.material.opacity = 0.42;
    group.add(grid);

    footprintGroup = new THREE.Group();
    footprintSource = null;
    footprintGroup.position.y = 0.018;
    footprintGroup.visible = false;
    group.add(footprintGroup);

    roomMesh = group;
    updateRoomTheme();
    scene.add(roomMesh);
    syncRoomWalls(width, length);
    window.ViewerBackground?.resizeRoom(width, length);
    if (selectedMesh) updateFurnitureFootprint(selectedMesh);
}

function updateFurnitureFootprint(item) {
    if (!footprintGroup || !item || item.userData?.isDoor || item.userData?.isWall) {
        if (footprintGroup) footprintGroup.visible = false;
        footprintSource = null;
        return;
    }

    const width = Math.max(0.05, Number(item.userData?.w) || 1);
    const length = Math.max(0.05, Number(item.userData?.l) || 1);
    const gridSize = 0.25;
    const columns = Math.max(1, Math.ceil(width / gridSize));
    const rows = Math.max(1, Math.ceil(length / gridSize));

    if (footprintSource !== item) {
        while (footprintGroup.children.length) {
            const child = footprintGroup.children[0];
            footprintGroup.remove(child);
            child.geometry?.dispose();
            if (Array.isArray(child.material)) child.material.forEach(material => material.dispose());
            else child.material?.dispose();
        }

        const cellWidth = width / columns;
        const cellLength = length / rows;
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.20,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const cellGeometry = new THREE.PlaneGeometry(cellWidth * 0.88, cellLength * 0.88);
        const cellCount = columns * rows;
        const cells = new THREE.InstancedMesh(cellGeometry, fillMaterial, cellCount);
        const cellTransform = new THREE.Object3D();
        let cellIndex = 0;
        for (let column = 0; column < columns; column++) {
            for (let row = 0; row < rows; row++) {
                cellTransform.position.set(
                    -width / 2 + cellWidth * (column + 0.5),
                    0,
                    -length / 2 + cellLength * (row + 0.5)
                );
                cellTransform.rotation.set(-Math.PI / 2, 0, 0);
                cellTransform.updateMatrix();
                cells.setMatrixAt(cellIndex++, cellTransform.matrix);
            }
        }
        cells.instanceMatrix.needsUpdate = true;
        footprintGroup.add(cells);

        const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(width, 0.001, length)),
            new THREE.LineBasicMaterial({ color: 0xb45309, transparent: true, opacity: 0.9 })
        );
        outline.position.y = 0.001;
        footprintGroup.add(outline);
        footprintSource = item;
    }

    footprintGroup.position.x = item.position.x;
    footprintGroup.position.z = item.position.z;
    footprintGroup.rotation.y = item.rotation.y;
    footprintGroup.visible = true;
}

function updateSmartWallOpacity() {
    updateWallOpacity();
}

function addDefaultDoor(rw, rl) {
    const doorItem = {
        id: "puerta_movil",
        name: { es: "Puerta de Acceso", en: "Access Door" },
        w: 0.9,
        l: 0.9,
        h: 2.0,
        color: 0xf59e0b,
        icon: "fa-door-open"
    };

    const group = new THREE.Group();

    const assembly = new THREE.Group();
    assembly.name = "door-assembly";
    group.add(assembly);
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.88, 2.0, 0.08), Materials.oakWood);
    doorLeaf.name = "door-leaf";
    doorLeaf.position.y = 1.0;
    assembly.add(doorLeaf);

    const handleGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    [-1, 1].forEach(side => {
        const handle = new THREE.Mesh(handleGeometry, Materials.goldMetal);
        handle.name = side > 0 ? "door-handle-front" : "door-handle-back";
        handle.position.set(0.35, 1.0, side * 0.07);
        assembly.add(handle);
    });

    const doorSweepGeo = new THREE.RingGeometry(0.05, 0.88, 16, 1, 0, Math.PI / 2);
    const doorSweepMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const doorSweep = new THREE.Mesh(doorSweepGeo, doorSweepMat);
    doorSweep.userData.diagnosticIgnore = true;
    doorSweep.rotation.x = -Math.PI / 2;
    doorSweep.position.set(-0.44, 0.02, 0);
    assembly.add(doorSweep);

    group.position.set(rw / 2 - 0.44, 0, rl / 2 - 0.04);
    group.userData = { ...doorItem, isDoor: true, rotationY: 0, doorHinge: "left", doorOpening: "inward" };
    updateDoorOpening(group);

    scene.add(group);
    activeItems.push(group);
    placeNewItem(group);
}

function updateDoorOpening(door) {
    if (!door?.userData.isDoor) return;
    const assembly = door.getObjectByName("door-assembly");
    if (!assembly) return;
    // El lado interior apunta hacia el centro del cuarto, incluso tras girar la puerta.
    const towardCenter = -door.position.x * Math.sin(door.rotation.y) - door.position.z * Math.cos(door.rotation.y);
    const attachment = door.userData.wallAttachment;
    const wall = attachment && roomWalls.find(candidate => candidate.userData.wallId === attachment.wallId);
    const inwardProjection = wall ? attachment.side * Math.cos(door.rotation.y - wall.rotation.y) : 0;
    const inwardSign = Math.abs(inwardProjection) > 1e-6 ? Math.sign(inwardProjection) : towardCenter > 0 ? 1 : -1;
    assembly.scale.x = inwardSign * (door.userData.doorHinge === "right" ? -1 : 1);
    assembly.scale.z = -inwardSign * (door.userData.doorOpening === "outward" ? -1 : 1);
}

function updateSunPosition(hour) {
    if (!sunLight) return;
    const angle = ((hour - 6) / 12) * Math.PI;
    const radius = 7;
    sunLight.position.x = Math.cos(angle) * radius;
    sunLight.position.y = 1.8 + Math.sin(angle) * 5.2;
    sunLight.position.z = 3.5;
    if (sunVisual) sunVisual.position.copy(sunLight.position);
}

window.setCameraView = function(viewType) {
    if (!camera || !controls) return;

    if (viewType === "top") {
        camera.position.set(0, 8, 0.001);
        controls.target.set(0, 0, 0);
    } else {
        camera.position.set(4.8, 4.8, 6.4);
        controls.target.set(0, 0, 0);
    }
    controls.update();
};

window.startSunSimulation = function() {
    if (isSimulating) return;
    isSimulating = true;

    const sunSlider = document.getElementById("sun-time");
    const timeDisplay = document.getElementById("time-display");
    const btnSimulate = document.getElementById("btn-simulate");

    let currentHour = 6.0;
    if (btnSimulate) {
        btnSimulate.disabled = true;
        btnSimulate.classList.add("opacity-50", "cursor-not-allowed");
    }

    const interval = setInterval(() => {
        currentHour += 0.1;
        if (currentHour > 18.0) {
            currentHour = 18.0;
            clearInterval(interval);
            isSimulating = false;
            if (btnSimulate) {
                btnSimulate.disabled = false;
                btnSimulate.classList.remove("opacity-50", "cursor-not-allowed");
            }
        }

        if (sunSlider) sunSlider.value = currentHour;
        
        const hours = Math.floor(currentHour);
        const mins = Math.round((currentHour % 1) * 60);
        const formattedMins = mins < 10 ? `0${mins}` : mins;
        const formattedHours = hours < 10 ? `0${hours}` : hours;

        if (timeDisplay) timeDisplay.innerText = `${formattedHours}:${formattedMins}`;

        updateSunPosition(currentHour);
    }, 40);
};

window.addFurnitureToScene = function(item) {
    if (wallEditing) setWallEditing(false);
    const furnitureGroup = createDetailedFurniture(item);
    
    let initialY = 0;
    const id = item.id || "";
    if (id === "laptop" || id === "pc_torre" || id === "monitor" || id === "mouse" || id === "reloj_mesa") {
        initialY = 0.75;
    } else if (id === "cortinas") {
        initialY = 0.4;
    } else if (id.includes("ventana") || id === "reloj_pared" || id === "barra_pared") {
        initialY = 1.0;
    }

    furnitureGroup.position.set(0, initialY, 0);
    furnitureGroup.userData = { ...item, rotationY: 0 };

    scene.add(furnitureGroup);
    activeItems.push(furnitureGroup);
    if (!placeNewItem(furnitureGroup)) {
        scene.remove(furnitureGroup);
        activeItems.pop();
        furnitureGroup.traverse(child => child.geometry?.dispose());
        selectFurniture(null);
        const content = document.getElementById("inspector-content");
        if (content) content.textContent = window.currentLang === "en"
            ? "This object does not fit between the walls. Move a wall or enlarge the room."
            : "Este objeto no cabe entre las paredes. Mueve una pared o amplía la sala.";
        return;
    }
    if (typeof selectFurniture === "function") selectFurniture(furnitureGroup);
    updateFurnitureFootprint(furnitureGroup);
    if (typeof window.updateMetrics === "function") window.updateMetrics();
};

window.updateMetrics = function() {
    let occupied = 0;
    activeItems.forEach(item => {
        const d = item.userData || {};
        if (!d.isDoor) occupied += (d.w || 1) * (d.l || 1);
    });

    const rw = parseFloat(document.getElementById("room-width")?.value) || 4;
    const rl = parseFloat(document.getElementById("room-length")?.value) || 3.5;
    const totalArea = rw * rl;

    const occEl = document.getElementById("metric-occupied");
    const freeEl = document.getElementById("metric-free");

    if (occEl) occEl.innerText = `${occupied.toFixed(1)} m²`;
    if (freeEl) freeEl.innerText = `${Math.max(0, totalArea - occupied).toFixed(1)} m²`;

    if (typeof window.runAIDiagnostic === "function") {
        window.runAIDiagnostic();
    }
};

window.refreshFurnitureFootprint = function(item = selectedMesh) {
    if (footprintSource !== item) footprintSource = null;
    updateFurnitureFootprint(item);
};

window.getSceneData = function() {
    const roomW = parseFloat(document.getElementById("room-width")?.value) || 4.0;
    const roomL = parseFloat(document.getElementById("room-length")?.value) || 3.5;
    const sunTime = parseFloat(document.getElementById("sun-time")?.value) || 15.5;

    const itemsData = activeItems.map(group => {
        const d = group.userData || {};
        return {
            id: d.id,
            name: d.name,
            w: d.w,
            l: d.l,
            h: d.h,
            color: d.color,
            icon: d.icon,
            isDoor: d.isDoor || false,
            ...(d.isDoor ? { doorHinge: d.doorHinge, doorOpening: d.doorOpening } : {}),
            ...(d.wallAttachment ? { wallAttachment: { ...d.wallAttachment } } : {}),
            customColor: d.customColor || null,
            position: { 
                x: group.position.x, 
                y: Math.round(group.position.y * 100) / 100, 
                z: group.position.z 
            },
            rotationY: d.rotationY || 0
        };
    });

    return {
        room: { width: roomW, length: roomL, sunTime: sunTime, walls: getRoomWallsData() },
        items: itemsData
    };
};

window.loadSceneData = function(data) {
    if (!data || !data.room) return;

    setWallEditing(false);
    activeItems.forEach(group => scene.remove(group));
    activeItems = [];
    if (typeof selectFurniture === "function") selectFurniture(null);

    const roomW = data.room.width || 4.0;
    const roomL = data.room.length || 3.5;
    const sunTime = data.room.sunTime || 15.5;

    document.getElementById("room-width").value = roomW;
    document.getElementById("room-length").value = roomL;
    document.getElementById("sun-time").value = sunTime;

    const hours = Math.floor(sunTime);
    const mins = Math.round((sunTime % 1) * 60);
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    document.getElementById("time-display").innerText = `${formattedHours}:${formattedMins}`;

    updateRoomDimensions(roomW, roomL);
    loadRoomWalls(data.room.walls);
    updateSunPosition(sunTime);

    if (Array.isArray(data.items)) {
        data.items.forEach(itemData => {
            if (itemData.isDoor) {
                addDefaultDoor(roomW, roomL);
                const doorGroup = activeItems[activeItems.length - 1];
                if (doorGroup && itemData.position) {
                    doorGroup.position.set(itemData.position.x, itemData.position.y || 0, itemData.position.z);
                }
                doorGroup.rotation.y = itemData.rotationY || 0;
                doorGroup.userData.rotationY = doorGroup.rotation.y;
                doorGroup.userData.doorHinge = itemData.doorHinge === "right" ? "right" : "left";
                doorGroup.userData.doorOpening = itemData.doorOpening === "outward" ? "outward" : "inward";
                doorGroup.userData.wallAttachment = readWallAttachment(itemData.wallAttachment);
                updateDoorOpening(doorGroup);
                if (itemData.customColor && typeof window.changeSelectedColor === "function") {
                    selectFurniture(doorGroup);
                    window.changeSelectedColor(itemData.customColor);
                }
            } else {
                const furnitureGroup = createDetailedFurniture(itemData);
                if (itemData.position) {
                    furnitureGroup.position.set(itemData.position.x, itemData.position.y || 0, itemData.position.z);
                }
                furnitureGroup.userData = { ...itemData, rotationY: itemData.rotationY || 0 };
                furnitureGroup.userData.wallAttachment = readWallAttachment(itemData.wallAttachment);
                furnitureGroup.rotation.y = itemData.rotationY || 0;

                if (itemData.customColor && typeof window.changeSelectedColor === "function") {
                    selectFurniture(furnitureGroup);
                    window.changeSelectedColor(itemData.customColor);
                }

                scene.add(furnitureGroup);
                activeItems.push(furnitureGroup);
            }
        });
    }

    syncWallAttachedItems();
    if (typeof window.updateMetrics === "function") window.updateMetrics();
};

function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerDown(event) {
    updateMousePosition(event);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(wallEditing ? roomWalls.map(wall => wall.children[0]) : activeItems, true);

    if (intersects.length > 0) {
        let rootGroup = intersects[0].object;
        while (rootGroup.parent && rootGroup.parent !== scene) {
            rootGroup = rootGroup.parent;
        }

        isDragging = true;
        draggedObject = rootGroup;
        controls.enabled = false;

        if (typeof selectFurniture === "function") selectFurniture(draggedObject);
        updateFurnitureFootprint(draggedObject);

        if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
            dragOffset.copy(draggedObject.position).sub(planeIntersection);
        }
    } else {
        if (typeof selectFurniture === "function") selectFurniture(null);
    }
}

function onPointerMove(event) {
    updateMousePosition(event);
    raycaster.setFromCamera(mouse, camera);

    if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
        const posX = document.getElementById("cursor-pos");
        if (posX) posX.innerText = `X: ${planeIntersection.x.toFixed(2)}m | Z: ${planeIntersection.z.toFixed(2)}m`;
    }

    if (isDragging && draggedObject) {
        if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
            const targetPos = planeIntersection.clone().add(dragOffset);

            if (draggedObject.userData.isWall) {
                const size = wallRoomSize();
                draggedObject.userData.placement = "free";
                draggedObject.position.x = Math.round(targetPos.x / 0.05) * 0.05;
                draggedObject.position.z = Math.round(targetPos.z / 0.05) * 0.05;
                constrainWall(draggedObject, size.width, size.length);
                syncWallAttachedItems();
                updateSmartWallOpacity();
                selectFurniture(draggedObject);
                return;
            }

            targetPos.x = Math.round(targetPos.x / 0.05) * 0.05;
            targetPos.z = Math.round(targetPos.z / 0.05) * 0.05;
            moveItemWithWalls(draggedObject, targetPos);
            updateFurnitureFootprint(draggedObject);

            if (typeof selectFurniture === "function") selectFurniture(draggedObject);
            if (typeof window.updateMetrics === "function") window.updateMetrics();
        }
    }
}

function onPointerUp() {
    if (isDragging) {
        const item = draggedObject;
        isDragging = false;
        draggedObject = null;
        controls.enabled = true;
        if (item?.userData.isWall) finishWallMove(item);
        if (selectedMesh) updateFurnitureFootprint(selectedMesh);
    }
}

function animate() {
    if (document.hidden) {
        animationFrameId = null;
        return;
    }

    animationFrameId = requestAnimationFrame(animate);
    if (controls) controls.update();
    renderViewer();
}

function renderViewer() {
    if (!renderer || !scene || !camera) return;
    const autoClear = renderer.autoClear;
    try {
        if (window.ViewerBackground?.render(renderer, camera)) renderer.autoClear = false;
        renderer.render(scene, camera);
    } finally {
        renderer.autoClear = autoClear;
    }
}

document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !animationFrameId) animate();
});

function onWindowResize() {
    const container = document.getElementById("canvas-container");
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.initScene = initScene;
window.updateRoomDimensions = updateRoomDimensions;
window.updateSunPosition = updateSunPosition;
