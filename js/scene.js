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

function initScene() {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    updateRoomDimensions(4.0, 3.5);
    updateSunPosition(15.5);

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

    const grid = new THREE.GridHelper(Math.max(width, length), Math.max(width, length) * 10, 0x64748b, 0x475569);
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

function createDetailedFurniture(item) {
    const group = new THREE.Group();
    const mainMat = new THREE.MeshStandardMaterial({ color: item.color || 0x3b82f6 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });

    const w = item.w || 1, h = item.h || 0.5, l = item.l || 1;

    if (item.id && item.id.includes("cama")) {
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.3, l), woodMat);
        base.position.y = h * 0.15;
        group.add(base);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.45, l * 0.9), whiteMat);
        mattress.position.set(0, h * 0.5, 0.05);
        group.add(mattress);

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, h * 0.47, l * 0.6), mainMat);
        blanket.position.set(0, h * 0.51, l * 0.18);
        group.add(blanket);

        const pillowCount = w >= 1.5 ? 2 : 1;
        const pillowW = (w * 0.8) / pillowCount;
        for (let i = 0; i < pillowCount; i++) {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(pillowW * 0.9, h * 0.12, l * 0.2), whiteMat);
            const posX = pillowCount === 2 ? (-w * 0.22 + i * (w * 0.44)) : 0;
            pillow.position.set(posX, h * 0.75, -l * 0.28);
            group.add(pillow);
        }
    } else if (item.id && item.id.includes("mueble_tv")) {
        const tvStand = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.6, l), woodMat);
        tvStand.position.y = h * 0.3;
        group.add(tvStand);

        const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.8, 0.05), darkMat);
        tvScreen.position.set(0, h * 0.3 + h * 0.4 + 0.05, 0);
        group.add(tvScreen);
    } else if (item.id && item.id.includes("rack_mancuernas")) {
        const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.7, l * 0.6), darkMat);
        rackFrame.position.y = h * 0.35;
        group.add(rackFrame);
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

window.addFurnitureToScene = function(item) {
    const furnitureGroup = createDetailedFurniture(item);
    furnitureGroup.position.set(0, 0, 0);
    furnitureGroup.userData = { ...item, rotationY: 0 };

    scene.add(furnitureGroup);
    activeItems.push(furnitureGroup);
    selectFurniture(furnitureGroup);
    window.updateMetrics();
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

            const halfW = (draggedObject.userData.w || 1) / 2;
            const halfL = (draggedObject.userData.l || 1) / 2;

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