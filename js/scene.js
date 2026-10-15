// Variables globales de Three.js
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

// Inicializacion de la escena 3D
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.3);
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

// Actualizar dimensiones del cuarto
function updateRoomDimensions(width, length) {
    if (roomMesh) scene.remove(roomMesh);

    const group = new THREE.Group();

    // Suelo
    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x475569, side: THREE.DoubleSide, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Rejilla de apoyo
    const grid = new THREE.GridHelper(Math.max(width, length), Math.max(width, length) * 10, 0xf59e0b, 0x64748b);
    grid.position.y = 0.01;
    group.add(grid);

    // Paredes transparentes
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
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

// Agregar puerta por defecto
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

    // Hoja de la puerta
    const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.08), doorLeafMat);
    doorLeaf.position.y = 1.0;
    group.add(doorLeaf);

    // Arco de apertura
    const doorSweepGeo = new THREE.RingGeometry(0.05, 0.9, 16, 1, 0, Math.PI / 2);
    const doorSweepMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const doorSweep = new THREE.Mesh(doorSweepGeo, doorSweepMat);
    doorSweep.rotation.x = -Math.PI / 2;
    doorSweep.position.set(-0.45, 0.02, 0);
    group.add(doorSweep);

    group.position.set(rw / 2 - 0.45, 0, rl / 2 - 0.45);
    group.userData = { ...doorItem, isDoor: true, rotationY: 0 };

    scene.add(group);
    activeItems.push(group);
}

// Posicionar luz solar
function updateSunPosition(hour) {
    if (!sunLight) return;
    const angle = ((hour - 6) / 12) * Math.PI;
    const radius = 10;
    sunLight.position.x = Math.cos(angle) * radius;
    sunLight.position.y = Math.sin(angle) * radius;
    sunLight.position.z = 5;
}

// Crear objeto 3D detallado
function createDetailedFurniture(item) {
    const group = new THREE.Group();
    const w = item.w || 1, h = item.h || 0.5, l = item.l || 1;

    const mainMat = new THREE.MeshStandardMaterial({ color: item.color || 0xd97706, roughness: 0.5 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });
    const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfffbe1, roughness: 0.9 });

    const id = item.id || "";

    if (id.includes("cama")) {
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.25, l), woodDarkMat);
        base.position.y = h * 0.125;
        group.add(base);

        const head = new THREE.Mesh(new THREE.BoxGeometry(w, h * 1.1, 0.1), woodMat);
        head.position.set(0, h * 0.55, -l / 2 + 0.05);
        group.add(head);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.4, l * 0.88), whiteMat);
        mattress.position.set(0, h * 0.45, 0.04);
        group.add(mattress);

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, h * 0.42, l * 0.6), mainMat);
        blanket.position.set(0, h * 0.46, l * 0.18);
        group.add(blanket);

        const count = w >= 1.5 ? 2 : 1;
        const pWidth = (w * 0.8) / count;
        for (let i = 0; i < count; i++) {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(pWidth * 0.9, h * 0.12, l * 0.2), whiteMat);
            const posX = count === 2 ? (-w * 0.22 + i * (w * 0.44)) : 0;
            pillow.position.set(posX, h * 0.7, -l * 0.28);
            group.add(pillow);
        }
    } else if (id.includes("mesa_noche")) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), woodMat);
        body.position.y = h / 2;
        group.add(body);
    } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.9, l), mainMat);
        body.position.y = h * 0.45;
        group.add(body);
    }

    group.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return group;
}

// Agregar mueble a la escena
window.addFurnitureToScene = function(item) {
    const furnitureGroup = createDetailedFurniture(item);
    furnitureGroup.position.set(0, 0, 0);
    furnitureGroup.userData = { ...item, rotationY: 0 };

    scene.add(furnitureGroup);
    activeItems.push(furnitureGroup);
    if (typeof selectFurniture === "function") selectFurniture(furnitureGroup);
    if (typeof window.updateMetrics === "function") window.updateMetrics();
};

// Mouse posicion
function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// Evento click / toque
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

// Evento arrastrar
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

// Evento soltar
function onPointerUp() {
    if (isDragging) {
        isDragging = false;
        draggedObject = null;
        controls.enabled = true;
    }
}

// Bucle de renderizado
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

// Ajuste responsive
function onWindowResize() {
    const container = document.getElementById("canvas-container");
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}