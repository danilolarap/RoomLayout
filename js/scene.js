let scene, camera, renderer, controls;
let roomMesh, sunLight;
let activeItems = [];
let selectedMesh = null;

// Lógica de Drag & Drop por Raycast
let isDragging = false;
let draggedObject = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
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

    // Controles de Cámara
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Habitación e Iluminación
    updateRoomDimensions(4.0, 3.5);
    updateSunPosition(15.5);

    // Eventos
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

// Generador de Muebles Detallados Estilizados
function createDetailedFurniture(item) {
    const group = new THREE.Group();

    const mainMat = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.4 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1 });

    const w = item.w, h = item.h, l = item.l;

    if (item.id.includes("cama")) {
        // Base / Bastidor de madera
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.3, l), woodMat);
        base.position.y = h * 0.15;
        group.add(base);

        // Cabecera
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(w, h * 1.1, 0.1), woodMat);
        headboard.position.set(0, h * 0.55, -l / 2 + 0.05);
        group.add(headboard);

        // Colchón
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.45, l * 0.9), whiteMat);
        mattress.position.set(0, h * 0.5, 0.05);
        group.add(mattress);

        // Cobija / Sábana
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, h * 0.47, l * 0.6), mainMat);
        blanket.position.set(0, h * 0.51, l * 0.18);
        group.add(blanket);

        // Almohadas (1 o 2 según el tamaño)
        const pillowCount = w >= 1.5 ? 2 : 1;
        const pillowW = (w * 0.8) / pillowCount;
        for (let i = 0; i < pillowCount; i++) {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(pillowW * 0.9, h * 0.12, l * 0.22), whiteMat);
            const posX = pillowCount === 2 ? (-w * 0.22 + i * (w * 0.44)) : 0;
            pillow.position.set(posX, h * 0.78, -l * 0.28);
            group.add(pillow);
        }

    } else if (item.id.includes("mueble_tv")) {
        // Mueble Base
        const tvStand = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.6, l), woodMat);
        tvStand.position.y = h * 0.3;
        group.add(tvStand);

        // Pantalla TV
        const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.9, 0.06), screenMat);
        tvScreen.position.set(0, h * 0.3 + h * 0.45 + 0.05, 0);
        group.add(tvScreen);

        // Marco / Bisel
        const tvBorder = new THREE.Mesh(new THREE.BoxGeometry(w * 0.87, h * 0.93, 0.04), darkMat);
        tvBorder.position.set(0, h * 0.3 + h * 0.45 + 0.05, -0.01);
        group.add(tvBorder);

        // Base / Soporte TV
        const tvBase = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, h * 0.05, l * 0.4), darkMat);
        tvBase.position.set(0, h * 0.6 + 0.025, 0);
        group.add(tvBase);

    } else if (item.id.includes("rack_mancuernas")) {
        // Estructura Metálica del Rack
        const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.7, l * 0.6), darkMat);
        rackFrame.position.y = h * 0.35;
        group.add(rackFrame);

        // Mancuernas en las baldas
        const dumbbellCount = 4;
        const spacing = w / dumbbellCount;
        for (let i = 0; i < dumbbellCount; i++) {
            const dbGroup = new THREE.Group();
            // Barra
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, l * 0.4), metalMat);
            bar.rotation.x = Math.PI / 2;
            dbGroup.add(bar);
            // Discos
            const plateLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04), darkMat);
            plateLeft.rotation.x = Math.PI / 2;
            plateLeft.position.z = -l * 0.12;
            dbGroup.add(plateLeft);

            const plateRight = plateLeft.clone();
            plateRight.position.z = l * 0.12;
            dbGroup.add(plateRight);

            dbGroup.position.set(-w / 2 + spacing * i + spacing / 2, h * 0.72, 0);
            group.add(dbGroup);
        }

    } else if (item.id.includes("escritorio")) {
        // Tablero Superior
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, l), mainMat);
        top.position.y = h - 0.025;
        group.add(top);

        // Patas
        const legGeo = new THREE.BoxGeometry(0.06, h - 0.05, 0.06);
        const legOffsets = [
            [-w / 2 + 0.05, -l / 2 + 0.05],
            [w / 2 - 0.05, -l / 2 + 0.05],
            [-w / 2 + 0.05, l / 2 - 0.05],
            [w / 2 - 0.05, l / 2 - 0.05]
        ];
        legOffsets.forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(x, (h - 0.05) / 2, z);
            group.add(leg);
        });

        // Laptop / Monitor decorativo
        const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.015, 0.25), metalMat);
        laptopBase.position.set(0, h + 0.007, 0);
        group.add(laptopBase);

        const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.015), darkMat);
        laptopScreen.position.set(0, h + 0.11, -0.1);
        laptopScreen.rotation.x = -0.2;
        group.add(laptopScreen);

    } else if (item.id.includes("silla") || item.id.includes("puf")) {
        // Asiento
        const seat = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, h * 0.15, l * 0.9), mainMat);
        seat.position.y = h * 0.45;
        group.add(seat);

        // Respaldo
        const back = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, h * 0.5, l * 0.15), mainMat);
        back.position.set(0, h * 0.72, -l * 0.38);
        group.add(back);

        // Pata central o ruedas
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h * 0.45), metalMat);
        base.position.y = h * 0.225;
        group.add(base);

    } else {
        // Elemento Genérico (Caja con borde superior redondeado estilizado)
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.9, l), mainMat);
        body.position.y = h * 0.45;
        group.add(body);

        const topDetail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, h * 0.1, l * 0.95), whiteMat);
        topDetail.position.y = h * 0.95;
        group.add(topDetail);
    }

    // Aplicar sombras a todos los componentes hijos
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

// --- DRAG AND DROP CON MOUSE ---
function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onPointerDown(event) {
    updateMousePosition(event);
    raycaster.setFromCamera(mouse, camera);