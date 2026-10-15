// js/scene.js - Administrador Principal de la Escena 3D, Iluminación y Cámara

let scene, camera, renderer, controls;
let roomMesh, sunLight;
let activeItems = [];
let selectedMesh = null;

let isDragging = false;
let draggedObject = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const planeIntersection = new THREE.Vector3();
const dragOffset = new THREE.Vector3();

// Control de simulación solar cinematográfica
let isSimulating = false;

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

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

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
    if (roomMesh) scene.remove(roomMesh);

    const group = new THREE.Group();

    const floorTexture = TextureFactory.parquetFloor();
    floorTexture.repeat.set(width, length);

    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.5, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    const grid = new THREE.GridHelper(Math.max(width, length), Math.max(width, length) * 10, 0xf59e0b, 0x94a3b8);
    grid.position.y = 0.01;
    group.add(grid);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const wallHeight = 2.2;

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, wallHeight), wallMat);
    backWall.position.set(0, wallHeight / 2, -length / 2);
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(length, wallHeight), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-width / 2, wallHeight / 2, 0);
    group.add(leftWall);

    roomMesh = group;
    scene.add(roomMesh);
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
    const radius = 10;
    sunLight.position.x = Math.cos(angle) * radius;
    sunLight.position.y = Math.sin(angle) * radius;
    sunLight.position.z = 5;
}

// Cambiar entre Vista Isométrica 3D y Planta (TOP)
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

// Simulación Cinematográfica del paso del sol (06:00 a 18:00)
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
    } else if (id.includes("ventana") || id === "reloj_pared" || id === "barra_pared") {
        initialY = 1.0;
    }

    furnitureGroup.position.set(0, initialY, 0);
    furnitureGroup.userData = { ...item, rotationY: 0 };

    scene.add(furnitureGroup);
    activeItems.push(furnitureGroup);
    if (typeof selectFurniture === "function") selectFurniture(furnitureGroup);
    if (typeof window.updateMetrics === "function") window.updateMetrics();
};

// Cálculo y actualización de métricas del espacio y llamada al motor de IA
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

    // Disparar diagnóstico automático con IA
    if (typeof window.runAIDiagnostic === "function") {
        window.runAIDiagnostic();
    }
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

            draggedObject.position.x = snapX;
            draggedObject.position.z = snapZ;

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
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById("canvas-container");
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}