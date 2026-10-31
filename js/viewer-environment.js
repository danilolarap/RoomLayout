// Finite scenery at the room's world origin. Excluded from editable/saved items.
(() => {
    "use strict";
    const compactness = .8;
    let roomScene, environment, width = 4, length = 3.5, activeTheme;
    let previewRenderer;

    function build(theme, roomWidth, roomLength) {
        const root = new THREE.Group();
        root.name = "viewer-environment";
        root.userData.isEnvironment = true;
        const geometries = {
            box: new THREE.BoxGeometry(1, 1, 1),
            ball: new THREE.IcosahedronGeometry(1, 1),
            rock: new THREE.DodecahedronGeometry(1, 0),
            cone: new THREE.ConeGeometry(1, 1, 7),
            trunk: new THREE.CylinderGeometry(.75, 1, 1, 7),
            disk: new THREE.CylinderGeometry(1, 1, 1, 12),
            crystal: new THREE.ConeGeometry(1, 1, 5),
            plane: new THREE.PlaneGeometry(1, 1)
        };
        const materials = new Map(), buckets = new Map();
        const groundTile = document.createElement("canvas");
        groundTile.width = groundTile.height = 256;
        const tile = groundTile.getContext("2d");
        tile.fillStyle = "#ffffff"; tile.fillRect(0, 0, 256, 256);
        tile.strokeStyle = "#6f78652b"; tile.fillStyle = "#77816a24";
        for (let i = 0; i < 100; i++) {
            const x = (i * 97.17) % 256, y = (i * 59.39) % 256;
            if (["calm", "forest", "sakura", "fantasy"].includes(theme)) {
                tile.beginPath(); tile.moveTo(x - 2, y); tile.lineTo(x, y + 3); tile.lineTo(x + 1, y - 2); tile.stroke();
            } else {
                tile.beginPath(); tile.ellipse(x, y, 1 + i % 2, .7, .3, 0, Math.PI * 2); tile.fill();
            }
        }
        const groundTexture = new THREE.CanvasTexture(groundTile);
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(100, 100);
        const material = key => {
            if (!materials.has(key)) materials.set(key, key === "light"
                ? new THREE.MeshBasicMaterial({ color: 0xffdb9c, toneMapped: false })
                : new THREE.MeshStandardMaterial({ roughness: key === "water" ? .38 : 1, metalness: 0, flatShading: true }));
            return materials.get(key);
        };
        const transform = new THREE.Object3D(), origin = new THREE.Vector3();
        let angle = 0;
        const at = (x, z, rotation, draw) => {
            origin.set(x, 0, z); angle = rotation; draw(); origin.set(0, 0, 0); angle = 0;
        };
        function part(shape, tint, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
            const key = `${shape}:${tint}`;
            if (!buckets.has(key)) buckets.set(key, { geometry: geometries[shape], material: material(tint), matrices: [] });
            transform.position.set(origin.x + x * Math.cos(angle) + z * Math.sin(angle), y, origin.z - x * Math.sin(angle) + z * Math.cos(angle));
            transform.rotation.set(rx, ry + angle, rz);
            transform.scale.set(sx, sy, sz); transform.updateMatrix();
            buckets.get(key).matrices.push(transform.matrix.clone());
        }
    }
})();
