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

// Generador sintético de texturas procedimentales mediante Canvas HTML5
const ProceduralTextures = {
    // Textura de veta de madera
    wood: (baseHex = "#d97706", lineHex = "#b45309") => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = lineHex;
        for (let i = 0; i < 500; i++) {
            const y = Math.random() * 512;
            const h = Math.random() * 2 + 0.5;
            ctx.globalAlpha = Math.random() * 0.15 + 0.05;
            ctx.fillRect(0, y, 512, h);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    // Textura de tela para ropa de cama y sofás
    fabric: (baseHex = "#3b82f6", patternHex = "#1d4ed8") => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = patternHex;
        ctx.globalAlpha = 0.08;
        for (let x = 0; x < 256; x += 4) {
            ctx.fillRect(x, 0, 2, 256);
        }
        for (let y = 0; y < 256; y += 4) {
            ctx.fillRect(0, y, 256, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    // Textura de suelo de parquet / listones de madera
    parquet: () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(0, 0, 512, 512);

        const plankHeight = 64;
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 3;

        for (let y = 0; y <= 512; y += plankHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();

            // Vetas suaves de listón
            ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
            for (let i = 0; i < 15; i++) {
                ctx.fillRect(0, y + Math.random() * plankHeight, 512, Math.random() * 3 + 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
};

// Materiales detallados preconfigurados
const TextureMaterials = {
    oakWood: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.wood("#d97706", "#92400e"),
        roughness: 0.5,
        metalness: 0.05
    }),
    darkWood: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.wood("#78350f", "#451a03"),
        roughness: 0.6,
        metalness: 0.05
    }),
    whiteFabric: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.fabric("#f8fafc", "#e2e8f0"),
        roughness: 0.95
    }),
    amberFabric: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.fabric("#f59e0b", "#d97706"),
        roughness: 0.85
    }),
    blueFabric: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.fabric("#2563eb", "#1d4ed8"),
        roughness: 0.85
    }),
    blackMetal: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.8
    }),
    goldMetal: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.9
    }),
    glassTv: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.9
    })
};

// Inicialización de la escena 3D
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

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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

// Actualizar dimensiones del cuarto con piso texturizado
function updateRoomDimensions(width, length) {
    if (roomMesh) scene.remove(roomMesh);

    const group = new THREE.Group();

    // Suelo con piso de madera texturizada
    const floorTexture = ProceduralTextures.parquet();
    floorTexture.repeat.set(width, length);

    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floorMat = new THREE.MeshStandardMaterial({ 
        map: floorTexture, 
        roughness: 0.6, 
        metalness: 0.1, 
        side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Rejilla de guía
    const grid = new THREE.GridHelper(Math.max(width, length), Math.max(width, length) * 10, 0xf59e0b, 0x94a3b8);
    grid.position.y = 0.01;
    group.add(grid);

    // Paredes transparentes estilo cristal
    const wallMat = new THREE.MeshStandardMaterial({ 
        color: 0xf1f5f9, 
        transparent: true, 
        opacity: 0.22, 
        side: THREE.DoubleSide, 
        roughness: 0.1 
    });
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

// Agregar puerta con textura de madera y manija metálica
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

    // Hoja de la puerta con textura de madera roble
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.88, 2.0, 0.08), TextureMaterials.oakWood);
    doorLeaf.position.y = 1.0;
    group.add(doorLeaf);

    // Perilla / Manija dorada
    const handleMat = TextureMaterials.goldMetal;
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), handleMat);
    handle.position.set(0.35, 1.0, 0.06);
    group.add(handle);

    // Arco de barrido / apertura en piso
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

// Posicionar luz solar
function updateSunPosition(hour) {
    if (!sunLight) return;
    const angle = ((hour - 6) / 12) * Math.PI;
    const radius = 10;
    sunLight.position.x = Math.cos(angle) * radius;
    sunLight.position.y = Math.sin(angle) * radius;
    sunLight.position.z = 5;
}

// Crear muebles 3D altamente detallados y texturizados
function createDetailedFurniture(item) {
    const group = new THREE.Group();
    const w = item.w || 1, h = item.h || 0.5, l = item.l || 1;
    const id = item.id || "";

    if (id.includes("cama")) {
        // Cama: Base de madera, cabecero, colchón de tela blanca, cobija texturizada y almohadas
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.25, l), TextureMaterials.darkWood);
        base.position.y = h * 0.125;
        group.add(base);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(w, h * 1.1, 0.08), TextureMaterials.oakWood);
        headboard.position.set(0, h * 0.55, -l / 2 + 0.04);
        group.add(headboard);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.38, l * 0.88), TextureMaterials.whiteFabric);
        mattress.position.set(0, h * 0.44, 0.04);
        group.add(mattress);

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, h * 0.4, l * 0.58), TextureMaterials.amberFabric);
        blanket.position.set(0, h * 0.45, l * 0.18);
        group.add(blanket);

        const pillowCount = w >= 1.5 ? 2 : 1;
        const pWidth = (w * 0.8) / pillowCount;
        for (let i = 0; i < pillowCount; i++) {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(pWidth * 0.88, h * 0.12, l * 0.22), TextureMaterials.whiteFabric);
            const posX = pillowCount === 2 ? (-w * 0.22 + i * (w * 0.44)) : 0;
            pillow.position.set(posX, h * 0.68, -l * 0.26);
            group.add(pillow);
        }

    } else if (id.includes("mesa_noche")) {
        // Mesa de noche: Cuerpo de madera, cajón detallado y tirador dorado
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.9, l), TextureMaterials.oakWood);
        body.position.y = h * 0.45;
        group.add(body);

        const handle = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), TextureMaterials.goldMetal);
        handle.position.set(0, h * 0.5, l / 2 + 0.01);
        group.add(handle);

    } else if (id.includes("escritorio")) {
        // Escritorio: Tablero de madera roble con patas de metal negro
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, l), TextureMaterials.oakWood);
        top.position.y = h - 0.025;
        group.add(top);

        const legGeo = new THREE.BoxGeometry(0.05, h - 0.05, 0.05);
        const offsets = [
            [-w / 2 + 0.05, (h - 0.05) / 2, -l / 2 + 0.05],
            [w / 2 - 0.05, (h - 0.05) / 2, -l / 2 + 0.05],
            [-w / 2 + 0.05, (h - 0.05) / 2, l / 2 - 0.05],
            [w / 2 - 0.05, (h - 0.05) / 2, l / 2 - 0.05]
        ];

        offsets.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, TextureMaterials.blackMetal);
            leg.position.set(...pos);
            group.add(leg);
        });

    } else if (id.includes("sofa")) {
        // Sofá: Asiento, respaldo y reposabrazos con textura de tela azul
        const seat = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.35, l * 0.8), TextureMaterials.blueFabric);
        seat.position.set(0, h * 0.2, 0);
        group.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.7, l * 0.25), TextureMaterials.blueFabric);
        back.position.set(0, h * 0.55, -l * 0.375);
        group.add(back);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, h * 0.5, l), TextureMaterials.blueFabric);
        armL.position.set(-w * 0.425, h * 0.35, 0);
        group.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, h * 0.5, l), TextureMaterials.blueFabric);
        armR.position.set(w * 0.425, h * 0.35, 0);
        group.add(armR);

    } else if (id.includes("mueble_tv")) {
        // Mueble de TV con pantalla de cristal reflectante integrada
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), TextureMaterials.darkWood);
        cabinet.position.y = h / 2;
        group.add(cabinet);

        const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 1.4, 0.04), TextureMaterials.glassTv);
        tvScreen.position.set(0, h + (h * 0.7), 0);
        group.add(tvScreen);

    } else {
        // Mobiliario genérico estructurado en madera
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), TextureMaterials.oakWood);
        body.position.y = h / 2;
        group.add(body);
    }

    // Proyección de sombras realista para todas las partes
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

// Obtener posición del puntero
function updateMousePosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// Evento al presionar
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

// Evento al arrastrar
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

// Evento al soltar
function onPointerUp() {
    if (isDragging) {
        isDragging = false;
        draggedObject = null;
        controls.enabled = true;
    }
}

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

// Ajuste responsivo de la ventana
function onWindowResize() {
    const container = document.getElementById("canvas-container");
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}