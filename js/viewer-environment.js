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
        const pine = (size = 1, snow = false) => {
            part("trunk", "bark", 0, .45 * size, 0, .12 * size, .9 * size, .12 * size);
            for (let j = 0; j < 3; j++) {
                const y = (.85 + j * .52) * size, r = (.72 - j * .15) * size;
                part("cone", j % 2 ? "leafLight" : "leaf", 0, y, 0, r, 1.22 * size, r);
                if (snow) part("cone", "snow", 0, y + .24 * size, 0, r * .69, .77 * size, r * .69);
            }
        };
        const broadleaf = (size = 1, blossom = false) => {
            part("trunk", "bark", 0, size * .9, 0, .12 * size, 1.8 * size, .12 * size, 0, 0, -.05);
            for (let j = 0; j < 5; j++) {
                const a = j * 2.4;
                part("ball", blossom ? (j % 2 ? "petal" : "petalLight") : (j % 2 ? "leaf" : "leafLight"), Math.sin(a) * .45 * size, (1.75 + j % 2 * .24) * size, Math.cos(a) * .45 * size, .68 * size, .56 * size, .64 * size, 0, a);
            }
        };
        const boulder = (x, z, scale = .5) => part("rock", "stone", x, scale * .27, z, scale, scale * .4, scale * .7, .15, x + z);
        const fence = (size = 1, crooked = false) => {
            for (const x of [-1.4, 0, 1.4]) part("box", "wood", x * size, .47 * size, 0, .1 * size, .94 * size, .12 * size, 0, 0, crooked ? x * .06 : 0);
            for (const y of [.36, .73]) part("box", "wood", 0, y * size, 0, 3 * size, .1 * size, .08 * size, 0, 0, crooked ? -.06 : 0);
        };
        const cottage = (size = 1, snowy = false) => {
            part("box", "house", 0, .7 * size, 0, 1.9 * size, 1.4 * size, 1.45 * size);
            for (const sign of [-1, 1]) part("box", snowy ? "snow" : "roof", sign * .52 * size, 1.57 * size, 0, 1.26 * size, .17 * size, 1.85 * size, 0, 0, sign * .58);
            part("box", "bark", 0, .44 * size, .733 * size, .4 * size, .88 * size, .025);
            for (const x of [-.61, .61]) part("box", "light", x * size, .84 * size, .734 * size, .33 * size, .38 * size, .025);
            part("box", "stone", .56 * size, 1.78 * size, -.25 * size, .22 * size, .74 * size, .24 * size);
        };
        const lantern = (x = 0, z = 0) => {
            part("trunk", "wood", x, .58, z, .045, 1.16, .045);
            part("box", "light", x, 1.16, z, .18, .25, .18);
            part("cone", "roof", x, 1.34, z, .19, .13, .19);
        };
    }
})();
