let scene, camera, renderer, controls;
let roomMesh, sunLight;
let activeItems = [];
let selectedMesh = null;

// Lógica de Drag & Drop por Raycast
let isDragging = false;
let draggedObject = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Plano XZ al nivel del piso
const planeIntersection = new THREE.Vector3();
const dragOffset = new THREE.Vector3();

function initScene() {
    const container = document.getElementById("canvas-container");
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // Cámara
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 6, 8);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controles de Rotación de Cámara
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Renderizar Suelo e Iluminación Inicial
    updateRoomDimensions(4.0, 3.5);
    updateSunPosition(15.5);

    // Event Listeners para Mouse y Drag
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
    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    const grid = new THREE.GridHelper(Math.max(width, length), Math.max(width, length) * 20, 0x64748b, 0x475569);
    grid.position.y = 0.01;
    group.add(grid);

    roomMesh = group;
    scene.add(roomMesh);
}

function updateSunPosition(hour) {
    const angle = ((hour - 6) / 12) * Math.PI;
    const radius = 10;

    sunLight.position.x = Math.cos(angle) * radius;
    sunLight.position.y = Math.sin(angle) * radius;
    sunLight.position.z = 5;
}

window.addFurnitureToScene = function(item) {
    const geo = new THREE.BoxGeometry(item.w, item.h, item.l);
    const mat = new THREE.MeshStandardMaterial({ color: item.color });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.set(0, item.h / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.userData = { ...item, rotationY: 0 };

    scene.add(mesh);
    activeItems.push(mesh);
    selectFurniture(mesh);
    window.updateMetrics();
};

// --- DRAG AND DROP CON MOUSE ---
function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerDown(event) {
    updateMousePosition(event);
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(activeItems, false);

    if (intersects.length > 0) {
        isDragging = true;
        draggedObject = intersects[0].object;
        controls.enabled = false; // Desactivar cámara mientras se arrastra

        selectFurniture(draggedObject);

        if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
            dragOffset.copy(draggedObject.position).sub(planeIntersection);
        }
    } else {
        selectFurniture(null);
    }
}

function onPointerMove(event) {
    updateMousePosition(event);
    raycaster.setFromCamera(mouse, camera);

    // Actualizar coordenadas en UI
    if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
        const posX = document.getElementById("cursor-pos");
        if (posX) posX.innerText = `X: ${planeIntersection.x.toFixed(2)}m | Z: ${planeIntersection.z.toFixed(2)}m`;
    }

    if (isDragging && draggedObject) {
        if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
            const targetPos = planeIntersection.clone().add(dragOffset);

            // Snap a Cuadrícula de 0.05m
            const gridSize = 0.05;
            let snapX = Math.round(targetPos.x / gridSize) * gridSize;
            let snapZ = Math.round(targetPos.z / gridSize) * gridSize;

            // Restricción dentro de límites de habitación
            const rw = (parseFloat(document.getElementById("room-width").value) || 4) / 2;
            const rl = (parseFloat(document.getElementById("room-length").value) || 3.5) / 2;

            const halfW = draggedObject.userData.w / 2;
            const halfL = draggedObject.userData.l / 2;

            snapX = Math.max(-rw + halfW, Math.min(rw - halfW, snapX));
            snapZ = Math.max(-rl + halfL, Math.min(rl - halfL, snapZ));

            draggedObject.position.x = snapX;
            draggedObject.position.z = snapZ;

            selectFurniture(draggedObject);
            window.updateMetrics();
        }
    }
}

function onPointerUp() {
    if (isDragging) {
        isDragging = false;
        draggedObject = null;
        controls.enabled = true; // Reactivar cámara
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById("canvas-container");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}