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
    }
})();
