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
    const isDark = document.documentElement.classList.contains("dark");
    scene.background = new THREE.Color(isDark ? 0x0f172a : 0xfef3c7);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 6, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
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
        new THREE.SphereGeometry(0.52, 16, 12),
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
        new THREE.SphereGeometry(0.32, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffe58a, toneMapped: false })
    );
    sunVisual.add(sunHalo, sunCore);
    sunVisual.renderOrder = 1;
    scene.add(sunVisual);

    updateRoomDimensions(4.0, 3.5);
    updateSunPosition(15.5);

    addDefaultDoor(4.0, 3.5);

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);

    window.addEventListener("resize", onWindowResize);

    animate();
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
    const floorMat = new THREE.MeshStandardMaterial({
        color: document.documentElement.classList.contains("dark") ? 0x1e293b : 0xfffbeb,
        roughness: 0.82,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    const gridSize = Math.ceil(Math.max(width, length) / 0.25) * 0.25;
    const grid = new THREE.GridHelper(gridSize, Math.round(gridSize / 0.25), 0xd97706, 0xd6c7a1);
    grid.position.y = 0.012;
    grid.material.transparent = true;
    grid.material.opacity = 0.42;
    group.add(grid);

    footprintGroup = new THREE.Group();
    footprintGroup.position.y = 0.018;
    footprintGroup.visible = false;
    group.add(footprintGroup);

    const wallHeight = 2.2;
    const wallClearance = 0.005;

    // Paredes inteligentes con transparencia dinámica
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width + wallClearance * 2, wallHeight), backWallMat);
    backWall.position.set(0, wallHeight / 2, -length / 2 - wallClearance);
    backWall.userData = { isWall: true, axis: "z", dir: -1 };
    group.add(backWall);

    const leftWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(length + wallClearance * 2, wallHeight), leftWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-width / 2 - wallClearance, wallHeight / 2, 0);
    leftWall.userData = { isWall: true, axis: "x", dir: -1 };
    group.add(leftWall);

    roomMesh = group;
    scene.add(roomMesh);
    if (selectedMesh) updateFurnitureFootprint(selectedMesh);
}

function updateFurnitureFootprint(item) {
    if (!footprintGroup || !item || item.userData?.isDoor) {
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
    if (!roomMesh || !camera) return;

    roomMesh.children.forEach(child => {
        if (child.userData && child.userData.isWall) {
            const axis = child.userData.axis;
            const camPosOnAxis = camera.position[axis];
            // Si la cámara está en el lado opuesto de la pared, la hace casi invisible
            if ((child.userData.dir < 0 && camPosOnAxis > 0) || (child.userData.dir > 0 && camPosOnAxis < 0)) {
                child.material.opacity = 0.15;
            } else {
                child.material.opacity = 0.6;
            }
        }
    });
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

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.88, 2.0, 0.08), Materials.oakWood);
    doorLeaf.position.y = 1.0;
    group.add(doorLeaf);

    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), Materials.goldMetal);
    handle.position.set(0.35, 1.0, 0.06);
    group.add(handle);

    const doorSweepGeo = new THREE.RingGeometry(0.05, 0.88, 16, 1, 0, Math.PI / 2);
    const doorSweepMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const doorSweep = new THREE.Mesh(doorSweepGeo, doorSweepMat);
    doorSweep.rotation.x = -Math.PI / 2;
    doorSweep.position.set(-0.44, 0.02, 0);
    group.add(doorSweep);

    group.position.set(rw / 2 - 0.45, 0, rl / 2 - 0.45);
    group.userData = { ...doorItem, isDoor: true, rotationY: 0 };

    scene.add(group);
    activeItems.push(group);
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
        camera.position.set(0, 10, 0.001);
        controls.target.set(0, 0, 0);
    } else {
        camera.position.set(6, 6, 8);
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
        room: { width: roomW, length: roomL, sunTime: sunTime },
        items: itemsData
    };
};

window.loadSceneData = function(data) {
    if (!data || !data.room) return;

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
    updateSunPosition(sunTime);

    if (Array.isArray(data.items)) {
        data.items.forEach(itemData => {
            if (itemData.isDoor) {
                addDefaultDoor(roomW, roomL);
                const doorGroup = activeItems[activeItems.length - 1];
                if (doorGroup && itemData.position) {
                    doorGroup.position.set(itemData.position.x, itemData.position.y || 0, itemData.position.z);
                }
            } else {
                const furnitureGroup = createDetailedFurniture(itemData);
                if (itemData.position) {
                    furnitureGroup.position.set(itemData.position.x, itemData.position.y || 0, itemData.position.z);
                }
                furnitureGroup.userData = { ...itemData, rotationY: itemData.rotationY || 0 };
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

    const intersects = raycaster.intersectObjects(activeItems, true);

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

            const gridSize = 0.05;
            let snapX = Math.round(targetPos.x / gridSize) * gridSize;
            let snapZ = Math.round(targetPos.z / gridSize) * gridSize;

            const rw = (parseFloat(document.getElementById("room-width").value) || 4) / 2;
            const rl = (parseFloat(document.getElementById("room-length").value) || 3.5) / 2;

            const bbox = new THREE.Box3().setFromObject(draggedObject);

            const minAllowedX = -rw + (draggedObject.position.x - bbox.min.x);
            const maxAllowedX = rw - (bbox.max.x - draggedObject.position.x);

            const minAllowedZ = -rl + (draggedObject.position.z - bbox.min.z);
            const maxAllowedZ = rl - (bbox.max.z - draggedObject.position.z);

            snapX = Math.max(minAllowedX, Math.min(maxAllowedX, snapX));
            snapZ = Math.max(minAllowedZ, Math.min(maxAllowedZ, snapZ));

            if (snapX === draggedObject.position.x && snapZ === draggedObject.position.z) return;

            draggedObject.position.x = snapX;
            draggedObject.position.z = snapZ;
            updateFurnitureFootprint(draggedObject);

            if (typeof selectFurniture === "function") selectFurniture(draggedObject);
            if (typeof window.updateMetrics === "function") window.updateMetrics();
        }
    }
}

function onPointerUp() {
    if (isDragging) {
        isDragging = false;
        draggedObject = null;
        controls.enabled = true;
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
    if (renderer && scene && camera) renderer.render(scene, camera);
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
