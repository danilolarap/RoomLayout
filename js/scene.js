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

// Generador de texturas sintéticas procedimentales (Canvas HTML5)
const TextureFactory = {
    smoothWood: (baseHex = "#c084fc", grainHex = "#9333ea") => {
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext("2d");

        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, baseHex);
        grad.addColorStop(1, grainHex);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = "rgba(0,0,0,0.04)";
        for (let i = 0; i < 200; i++) {
            ctx.fillRect(0, Math.random() * 512, 512, Math.random() * 2 + 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    fabric: (baseHex = "#2563eb") => {
        const canvas = document.createElement("canvas");
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        for (let x = 0; x < 256; x += 4) ctx.fillRect(x, 0, 2, 256);
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        for (let y = 0; y < 256; y += 4) ctx.fillRect(0, y, 256, 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    parquetFloor: () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;

        for (let y = 0; y <= 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
};

// Materiales globales de la aplicación
const Materials = {
    oakWood: new THREE.MeshStandardMaterial({ map: TextureFactory.smoothWood("#d97706", "#b45309"), roughness: 0.4 }),
    darkNogal: new THREE.MeshStandardMaterial({ map: TextureFactory.smoothWood("#451a03", "#270e02"), roughness: 0.5 }),
    cherryWood: new THREE.MeshStandardMaterial({ map: TextureFactory.smoothWood("#9a3412", "#7c2d12"), roughness: 0.4 }),
    whiteSheet: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#f8fafc"), roughness: 0.9 }),
    blueFabric: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#2563eb"), roughness: 0.8 }),
    emeraldFabric: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#059669"), roughness: 0.8 }),
    amberFabric: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#d97706"), roughness: 0.8 }),
    blackLeather: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.2 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.8 }),
    chromeMetal: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.1, metalness: 0.95 }),
    goldMetal: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 }),
    tvScreen: new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.1, metalness: 0.9 }),
    glassWindow: new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, roughness: 0.1, side: THREE.DoubleSide }),
    whiteFrame: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 }),
    darkPlastic: new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4 })
};

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

// Construcción de Objetos 3D Complejos
function createDetailedFurniture(item) {
    const group = new THREE.Group();
    const w = item.w || 1, h = item.h || 0.5, l = item.l || 1;
    const id = item.id || "";

    if (id === "cama_king" || id === "cama_queen" || id === "cama_sencilla") {
        const matWood = id === "cama_king" ? Materials.darkNogal : (id === "cama_queen" ? Materials.oakWood : Materials.cherryWood);
        const matFabric = id === "cama_king" ? Materials.blueFabric : (id === "cama_queen" ? Materials.emeraldFabric : Materials.amberFabric);

        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.25, l), matWood);
        base.position.y = h * 0.125;
        group.add(base);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(w, h * 1.1, 0.08), matWood);
        headboard.position.set(0, h * 0.55, -l / 2 + 0.04);
        group.add(headboard);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.38, l * 0.88), Materials.whiteSheet);
        mattress.position.set(0, h * 0.44, 0.04);
        group.add(mattress);

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, h * 0.4, l * 0.58), matFabric);
        blanket.position.set(0, h * 0.45, l * 0.18);
        group.add(blanket);

        const pillows = id === "cama_sencilla" ? 1 : 2;
        for (let i = 0; i < pillows; i++) {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(w * (pillows === 1 ? 0.7 : 0.38), h * 0.12, l * 0.2), Materials.whiteSheet);
            const posX = pillows === 1 ? 0 : (-w * 0.22 + i * (w * 0.44));
            pillow.position.set(posX, h * 0.68, -l * 0.26);
            group.add(pillow);
        }

    } else if (id.includes("armario")) {
        const numDoors = id === "armario_4p" ? 4 : (id === "armario_3p" ? 3 : 2);
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.oakWood);
        body.position.y = h / 2;
        group.add(body);

        const doorW = (w * 0.96) / numDoors;
        for (let i = 0; i < numDoors; i++) {
            const posX = -w * 0.48 + doorW / 2 + i * doorW;
            const door = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.96, h * 0.94, 0.02), Materials.darkNogal);
            door.position.set(posX, h / 2, l / 2 + 0.01);
            group.add(door);

            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12), Materials.chromeMetal);
            const hOffset = (i % 2 === 0) ? doorW * 0.35 : -doorW * 0.35;
            handle.position.set(posX + hOffset, h / 2, l / 2 + 0.03);
            group.add(handle);
        }

    } else if (id === "mesa_noche") {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.85, l), Materials.oakWood);
        body.position.y = (h * 0.85) / 2;
        group.add(body);

        const drawerFront = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.35, 0.02), Materials.cherryWood);
        drawerFront.position.set(0, h * 0.5, l / 2 + 0.01);
        group.add(drawerFront);

        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 12), Materials.goldMetal);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, h * 0.5, l / 2 + 0.03);
        group.add(handle);

    } else if (id === "escritorio_recto" || id === "escritorio_l") {
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, id === "escritorio_l" ? l * 0.5 : l), Materials.oakWood);
        top.position.set(0, h - 0.025, id === "escritorio_l" ? -l * 0.25 : 0);
        group.add(top);

        if (id === "escritorio_l") {
            const sideTop = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 0.05, l * 0.5), Materials.oakWood);
            sideTop.position.set(-w * 0.3, h - 0.025, l * 0.25);
            group.add(sideTop);
        }

        const legGeo = new THREE.BoxGeometry(0.04, h - 0.05, 0.04);
        const legOffsets = id === "escritorio_l" ? [
            [w / 2 - 0.04, (h - 0.05) / 2, -l / 2 + 0.04],
            [w / 2 - 0.04, (h - 0.05) / 2, 0],
            [-w / 2 + 0.04, (h - 0.05) / 2, -l / 2 + 0.04],
            [-w / 2 + 0.04, (h - 0.05) / 2, l / 2 - 0.04],
            [-w * 0.1, (h - 0.05) / 2, l / 2 - 0.04]
        ] : [
            [-w / 2 + 0.05, (h - 0.05) / 2, -l / 2 + 0.05],
            [w / 2 - 0.05, (h - 0.05) / 2, -l / 2 + 0.05],
            [-w / 2 + 0.05, (h - 0.05) / 2, l / 2 - 0.05],
            [w / 2 - 0.05, (h - 0.05) / 2, l / 2 - 0.05]
        ];

        legOffsets.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, Materials.blackMetal);
            leg.position.set(...pos);
            group.add(leg);
        });

    } else if (id === "silla_ergonomica") {
        const baseCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), Materials.blackMetal);
        baseCenter.position.y = 0.1;
        group.add(baseCenter);

        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.04), Materials.blackMetal);
            leg.position.set(Math.cos(angle) * 0.14, 0.08, Math.sin(angle) * 0.14);
            leg.rotation.y = -angle;
            group.add(leg);

            const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), Materials.blackMetal);
            wheel.position.set(Math.cos(angle) * 0.26, 0.025, Math.sin(angle) * 0.26);
            group.add(wheel);
        }

        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12), Materials.chromeMetal);
        piston.position.y = 0.28;
        group.add(piston);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.08, l * 0.8), Materials.blackLeather);
        seat.position.y = 0.48;
        group.add(seat);

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, h * 0.55, 0.05), Materials.blackLeather);
        backrest.position.set(0, 0.8, -l * 0.35);
        group.add(backrest);

    } else if (id.includes("mueble_tv")) {
        const tvWidth = id.includes("grande") ? 1.6 : 1.2;
        const tvHeight = id.includes("grande") ? 0.95 : 0.75;

        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.8, l), Materials.darkNogal);
        cabinet.position.y = (h * 0.8) / 2;
        group.add(cabinet);

        const tvStandBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.25), Materials.blackMetal);
        tvStandBase.position.set(0, h * 0.81, 0);
        group.add(tvStandBase);

        const tvPole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.04), Materials.blackMetal);
        tvPole.position.set(0, h * 0.8 + 0.1, 0);
        group.add(tvPole);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(tvWidth, tvHeight, 0.03), Materials.tvScreen);
        screen.position.set(0, h * 0.8 + 0.1 + (tvHeight / 2), 0);
        group.add(screen);

        const bezel = new THREE.Mesh(new THREE.BoxGeometry(tvWidth + 0.03, tvHeight + 0.03, 0.01), Materials.blackMetal);
        bezel.position.set(0, h * 0.8 + 0.1 + (tvHeight / 2), -0.01);
        group.add(bezel);

    } else if (id.includes("sofa")) {
        const isTwoSeater = id === "sofa_2p";
        const cushionCount = isTwoSeater ? 2 : 1;
        const cushionWidth = (w * 0.8) / cushionCount;

        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.2, l), Materials.darkNogal);
        base.position.y = h * 0.1;
        group.add(base);

        for (let i = 0; i < cushionCount; i++) {
            const posX = isTwoSeater ? (-w * 0.2 + i * (w * 0.4)) : 0;
            const cushion = new THREE.Mesh(new THREE.BoxGeometry(cushionWidth * 0.95, h * 0.25, l * 0.75), Materials.blueFabric);
            cushion.position.set(posX, h * 0.28, 0.02);
            group.add(cushion);
        }

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.55, l * 0.22), Materials.blueFabric);
        backrest.position.set(0, h * 0.55, -l * 0.35);
        group.add(backrest);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, h * 0.45, l), Materials.blueFabric);
        armL.position.set(-w * 0.44, h * 0.38, 0);
        group.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, h * 0.45, l), Materials.blueFabric);
        armR.position.set(w * 0.44, h * 0.38, 0);
        group.add(armR);

    } else if (id === "rack_mancuernas") {
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, l * 0.9), Materials.blackMetal);
        frameL.position.set(-w * 0.45, h / 2, 0);
        group.add(frameL);

        const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, l * 0.9), Materials.blackMetal);
        frameR.position.set(w * 0.45, h / 2, 0);
        group.add(frameR);

        for (let level = 0; level < 2; level++) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.03, 0.08), Materials.blackMetal);
            const posY = h * 0.35 + level * (h * 0.4);
            rail.position.set(0, posY, 0);
            group.add(rail);

            for (let d = 0; d < 3; d++) {
                const posX = -w * 0.3 + d * (w * 0.3);
                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 12), Materials.chromeMetal);
                handle.rotation.z = Math.PI / 2;
                handle.position.set(posX, posY + 0.04, 0);
                group.add(handle);

                const weightL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), Materials.blackMetal);
                weightL.rotation.z = Math.PI / 2;
                weightL.position.set(posX - 0.08, posY + 0.04, 0);
                group.add(weightL);

                const weightR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), Materials.blackMetal);
                weightR.rotation.z = Math.PI / 2;
                weightR.position.set(posX + 0.08, posY + 0.04, 0);
                group.add(weightR);
            }
        }

    } else if (id === "banco_plano") {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, l), Materials.blackLeather);
        pad.position.y = h - 0.04;
        group.add(pad);

        const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h - 0.08, 12), Materials.blackMetal);
        legL.position.set(-w * 0.4, (h - 0.08) / 2, 0);
        group.add(legL);

        const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h - 0.08, 12), Materials.blackMetal);
        legR.position.set(w * 0.4, (h - 0.08) / 2, 0);
        group.add(legR);

        const baseBarL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, l * 0.9), Materials.blackMetal);
        baseBarL.position.set(-w * 0.4, 0.015, 0);
        group.add(baseBarL);

        const baseBarR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, l * 0.9), Materials.blackMetal);
        baseBarR.position.set(w * 0.4, 0.015, 0);
        group.add(baseBarR);

    } else if (id === "laptop") {
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.015, l), Materials.chromeMetal);
        base.position.y = 0.0075;
        group.add(base);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(w, l * 0.9, 0.01), Materials.blackMetal);
        screen.rotation.x = -Math.PI / 3;
        screen.position.set(0, l * 0.35, -l * 0.4);
        group.add(screen);

    } else if (id === "pc_torre") {
        const caseBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.blackMetal);
        caseBody.position.y = h / 2;
        group.add(caseBody);

        const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(0.01, h * 0.9, l * 0.85), Materials.glassWindow);
        glassPanel.position.set(w / 2 + 0.005, h / 2, 0);
        group.add(glassPanel);

    } else if (id === "monitor") {
        const standBase = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.2, w * 0.2, 0.015, 16), Materials.blackMetal);
        standBase.position.y = 0.0075;
        group.add(standBase);

        const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, h * 0.4, 12), Materials.chromeMetal);
        standPole.position.y = h * 0.2;
        group.add(standPole);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.65, 0.03), Materials.tvScreen);
        screen.position.y = h * 0.6;
        group.add(screen);

    } else if (id === "mouse") {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(w, 0.005, l), Materials.darkPlastic);
        pad.position.y = 0.0025;
        group.add(pad);

        const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.1), Materials.blackMetal);
        mouseBody.position.set(0, 0.015, 0);
        group.add(mouseBody);

    } else if (id === "caminadora") {
        const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, l), Materials.blackMetal);
        deck.position.y = 0.06;
        group.add(deck);

        const belt = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.01, l * 0.8), Materials.darkPlastic);
        belt.position.set(0, 0.125, 0);
        group.add(belt);

        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 12), Materials.blackMetal);
        postL.position.set(-w * 0.4, h / 2, -l * 0.35);
        postL.rotation.x = 0.2;
        group.add(postL);

        const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 12), Materials.blackMetal);
        postR.position.set(w * 0.4, h / 2, -l * 0.35);
        postR.rotation.x = 0.2;
        group.add(postR);

        const consoleBar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.3), Materials.darkPlastic);
        consoleBar.position.set(0, h * 0.9, -l * 0.25);
        group.add(consoleBar);

    } else if (id === "barra_pared") {
        const wallPlate = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), Materials.blackMetal);
        wallPlate.position.y = h / 2;
        group.add(wallPlate);

        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, w * 1.1, 16), Materials.chromeMetal);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, h * 0.8, l * 0.8);
        group.add(bar);

        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, l, 12), Materials.blackMetal);
        armL.rotation.x = Math.PI / 2;
        armL.position.set(-w * 0.35, h * 0.8, l / 2);
        group.add(armL);

        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, l, 12), Materials.blackMetal);
        armR.rotation.x = Math.PI / 2;
        armR.position.set(w * 0.35, h * 0.8, l / 2);
        group.add(armR);

    } else if (id.includes("ventana")) {
        const frameMat = Materials.whiteFrame;
        const glassMat = Materials.glassWindow;
        const frameThick = 0.05;

        if (id === "ventana_circular") {
            const outerRing = new THREE.Mesh(new THREE.TorusGeometry(w / 2, 0.04, 16, 32), frameMat);
            outerRing.position.y = h / 2;
            group.add(outerRing);

            const glass = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 - 0.02, w / 2 - 0.02, 0.02, 32), glassMat);
            glass.rotation.x = Math.PI / 2;
            glass.position.y = h / 2;
            group.add(glass);

        } else if (id === "ventana_esquina") {
            const glass1 = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), glassMat);
            glass1.position.set(0, h / 2, -l / 2);
            group.add(glass1);

            const glass2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, h, l), glassMat);
            glass2.position.set(-w / 2, h / 2, 0);
            group.add(glass2);

            const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), frameMat);
            post.position.set(-w / 2, h / 2, -l / 2);
            group.add(post);

        } else {
            const frameTop = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, 0.06), frameMat);
            frameTop.position.y = h - frameThick / 2;
            group.add(frameTop);

            const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, 0.06), frameMat);
            frameBottom.position.y = frameThick / 2;
            group.add(frameBottom);

            const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, 0.06), frameMat);
            frameLeft.position.set(-w / 2 + frameThick / 2, h / 2, 0);
            group.add(frameLeft);

            const frameRight = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, 0.06), frameMat);
            frameRight.position.set(w / 2 - frameThick / 2, h / 2, 0);
            group.add(frameRight);

            const glass = new THREE.Mesh(new THREE.BoxGeometry(w - frameThick * 2, h - frameThick * 2, 0.015), glassMat);
            glass.position.y = h / 2;
            group.add(glass);
        }

    } else if (id === "reloj_pared") {
        const frame = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.04, 32), Materials.whiteFrame);
        frame.rotation.x = Math.PI / 2;
        frame.position.y = h / 2;
        group.add(frame);

        const handH = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.01), Materials.blackMetal);
        handH.position.set(0, h / 2 + 0.03, 0.025);
        group.add(handH);

        const handM = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.01), Materials.blackMetal);
        handM.position.set(0.03, h / 2, 0.025);
        handM.rotation.z = Math.PI / 3;
        group.add(handM);

    } else if (id === "reloj_mesa") {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.emeraldFabric);
        body.position.y = h / 2;
        group.add(body);

        const display = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.7, 0.01), Materials.tvScreen);
        display.position.set(0, h / 2, l / 2 + 0.005);
        group.add(display);

    } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.oakWood);
        body.position.y = h / 2;
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
    
    // Asignar elevación inicial Y moderada según tipo de objeto
    let initialY = 0;
    const id = item.id || "";
    if (id === "laptop" || id === "pc_torre" || id === "monitor" || id === "mouse" || id === "reloj_mesa") {
        initialY = 0.75; // Altura estándar para descansar sobre una mesa
    } else if (id.includes("ventana") || id === "reloj_pared" || id === "barra_pared") {
        initialY = 1.0; // Altura moderada de pared
    }

    furnitureGroup.position.set(0, initialY, 0);
    furnitureGroup.userData = { ...item, rotationY: 0 };

    scene.add(furnitureGroup);
    activeItems.push(furnitureGroup);
    if (typeof selectFurniture === "function") selectFurniture(furnitureGroup);
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