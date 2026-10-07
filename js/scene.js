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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.3);
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
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide, roughness: 0.8 });
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

// Generador de Geometría Detallada Especifica por Ítem
function createDetailedFurniture(item) {
    const group = new THREE.Group();
    const w = item.w || 1, h = item.h || 0.5, l = item.l || 1;

    // Materiales Estilizados
    const mainMat = new THREE.MeshStandardMaterial({ color: item.color || 0x3b82f6, roughness: 0.5 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: item.color || 0x059669, roughness: 0.9 });

    const id = item.id || "";

    if (id.includes("cama")) {
        // Bastidor
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.25, l), woodDarkMat);
        base.position.y = h * 0.125;
        group.add(base);

        // Cabecera
        const head = new THREE.Mesh(new THREE.BoxGeometry(w, h * 1.1, 0.1), woodMat);
        head.position.set(0, h * 0.55, -l / 2 + 0.05);
        group.add(head);

        // Colchón
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.4, l * 0.88), whiteMat);
        mattress.position.set(0, h * 0.45, 0.04);
        group.add(mattress);

        // Edredón
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, h * 0.42, l * 0.6), mainMat);
        blanket.position.set(0, h * 0.46, l * 0.18);
        group.add(blanket);

        // Almohadas
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

        const drawer = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.35, 0.02), woodDarkMat);
        drawer.position.set(0, h * 0.6, l / 2 + 0.01);
        group.add(drawer);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, 0.03, 0.03), metalMat);
        handle.position.set(0, h * 0.6, l / 2 + 0.03);
        group.add(handle);

    } else if (id.includes("armario")) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), woodDarkMat);
        body.position.y = h / 2;
        group.add(body);

        const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(w * 0.48, h * 0.94, 0.02), woodMat);
        doorLeft.position.set(-w * 0.24, h / 2, l / 2 + 0.01);
        group.add(doorLeft);

        const doorRight = new THREE.Mesh(new THREE.BoxGeometry(w * 0.48, h * 0.94, 0.02), woodMat);
        doorRight.position.set(w * 0.24, h / 2, l / 2 + 0.01);
        group.add(doorRight);

        const handleL = new THREE.Mesh(new THREE.BoxGeometry(0.02, h * 0.2, 0.03), metalMat);
        handleL.position.set(-0.04, h * 0.5, l / 2 + 0.03);
        group.add(handleL);

        const handleR = new THREE.Mesh(new THREE.BoxGeometry(0.02, h * 0.2, 0.03), metalMat);
        handleR.position.set(0.04, h * 0.5, l / 2 + 0.03);
        group.add(handleR);

    } else if (id.includes("escritorio")) {
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, l), woodMat);
        top.position.y = h - 0.02;
        group.add(top);

        const legGeo = new THREE.BoxGeometry(0.05, h - 0.04, 0.05);
        const offsets = [
            [-w / 2 + 0.05, -l / 2 + 0.05],
            [w / 2 - 0.05, -l / 2 + 0.05],
            [-w / 2 + 0.05, l / 2 - 0.05],
            [w / 2 - 0.05, l / 2 - 0.05]
        ];
        offsets.forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(x, (h - 0.04) / 2, z);
            group.add(leg);
        });

        // Laptop 3D encima
        const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.22), metalMat);
        laptopBase.position.set(0, h, 0);
        group.add(laptopBase);

        const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.01), darkMat);
        laptopScreen.position.set(0, h + 0.1, -0.09);
        laptopScreen.rotation.x = -0.2;
        group.add(laptopScreen);

    } else if (id.includes("silla")) {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, h * 0.1, l * 0.8), cushionMat);
        seat.position.y = h * 0.45;
        group.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, h * 0.45, l * 0.1), cushionMat);
        back.position.set(0, h * 0.7, -l * 0.35);
        group.add(back);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h * 0.4), metalMat);
        pole.position.y = h * 0.2;
        group.add(pole);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.35, w * 0.35, 0.03), darkMat);
        base.position.y = 0.015;
        group.add(base);

    } else if (id.includes("mueble_tv")) {
        const stand = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.5, l), woodDarkMat);
        stand.position.y = h * 0.25;
        group.add(stand);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.85, 0.04), darkMat);
        screen.position.set(0, h * 0.5 + h * 0.42, 0);
        group.add(screen);

        const tvBase = new THREE.Mesh(new THREE.BoxGeometry(w * 0.25, 0.03, l * 0.3), metalMat);
        tvBase.position.set(0, h * 0.5 + 0.015, 0);
        group.add(tvBase);

    } else if (id.includes("sofa")) {
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.35, l), cushionMat);
        base.position.y = h * 0.175;
        group.add(base);

        const back = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.55, l * 0.25), cushionMat);
        back.position.set(0, h * 0.55, -l * 0.375);
        group.add(back);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, h * 0.45, l), cushionMat);
        armL.position.set(-w * 0.425, h * 0.4, 0);
        group.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, h * 0.45, l), cushionMat);
        armR.position.set(w * 0.425, h * 0.4, 0);
        group.add(armR);

    } else if (id.includes("rack_mancuernas")) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.7, l * 0.5), darkMat);
        frame.position.y = h * 0.35;
        group.add(frame);

        for (let i = -1; i <= 1; i += 2) {
            const dbBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, l * 0.4), metalMat);
            dbBar.rotation.x = Math.PI / 2;
            dbBar.position.set(i * w * 0.25, h * 0.72, 0);
            group.add(dbBar);

            const plate1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04), mainMat);
            plate1.rotation.x = Math.PI / 2;
            plate1.position.set(i * w * 0.25, h * 0.72, -l * 0.12);
            group.add(plate1);

            const plate2 = plate1.clone();
            plate2.position.set(i * w * 0.25, h * 0.72, l * 0.12);
            group.add(plate2);
        }

    } else if (id.includes("banco_plano")) {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.15, l), darkMat);
        pad.position.y = h - h * 0.075;
        group.add(pad);

        const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, h - 0.15, l * 0.8), metalMat);
        leg1.position.set(-w * 0.35, (h - 0.15) / 2, 0);
        group.add(leg1);

        const leg2 = leg1.clone();
        leg2.position.set(w * 0.35, (h - 0.15) / 2, 0);
        group.add(leg2);

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