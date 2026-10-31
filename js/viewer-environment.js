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
    }
})();
