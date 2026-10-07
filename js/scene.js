let scene, camera, renderer, controls;
let roomMesh, sunLight;
let activeItems = [];
let selectedMesh = null;

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

    // Controles
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfffbde, 1.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Suelo / Grid
    updateRoomDimensions(4.0, 3.5);
    updateSunPosition(15.5);

    // Resize listener
    window.addEventListener("resize", onWindowResize);

    // Loop
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

    const grid = new THREE.GridHelper(Math.max(width, length), 10, 0x64748b, 0x475569);
    grid.position.y = 0.01;
    group.add(grid);

    roomMesh = group;
    scene.add(roomMesh);
}

function updateSunPosition(hour) {
    // Convierte hora (6 a 18) en ángulo de sol
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