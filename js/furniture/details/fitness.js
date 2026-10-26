window.RoomLayoutFurnitureDetails = window.RoomLayoutFurnitureDetails || {};

window.RoomLayoutFurnitureDetails.fitness = function({ group, w, h, l, id }) {
    if (id === "caminadora") {
        for (let mark = -1; mark <= 1; mark++) {
            const beltMark = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, l * 0.62), Materials.chromeMetal);
            beltMark.position.set(mark * w * 0.22, 0.133, 0);
            group.add(beltMark);
        }
        const consoleDisplay = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, 0.055, 0.012), Materials.glassWindow);
        consoleDisplay.position.set(0, h * 0.9, -l * 0.25 + 0.16);
        group.add(consoleDisplay);
    }

    if (id === "barra_pared") {
        [-1, 1].forEach(side => {
            const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.029, 0.16, 6), Materials.darkPlastic);
            grip.rotation.z = Math.PI / 2;
            grip.position.set(side * w * 0.37, h * 0.8, l * 0.8);
            group.add(grip);
        });
        const centerSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, w * 0.28, 6), Materials.goldMetal);
        centerSleeve.rotation.z = Math.PI / 2;
        centerSleeve.position.set(0, h * 0.8, l * 0.8);
        group.add(centerSleeve);
    }

    if (id === "rack_mancuernas") {
        const endCapGeometry = new THREE.CylinderGeometry(0.065, 0.065, 0.045, 6);
        for (let level = 0; level < 2; level++) {
            const posY = h * 0.39 + level * (h * 0.4);
            for (let d = 0; d < 3; d++) {
                const posX = -w * 0.3 + d * (w * 0.3);
                const endCap = new THREE.Mesh(endCapGeometry, Materials.amberFabric);
                endCap.rotation.z = Math.PI / 2;
                endCap.position.set(posX + 0.105, posY + 0.04, 0);
                group.add(endCap);
            }
        }
    }

    if (id === "banco_plano") {
        [-1, 1].forEach(side => {
            const seam = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, 0.008, 0.012), Materials.chromeMetal);
            seam.position.set(side * w * 0.08, h + 0.002, 0);
            group.add(seam);
        });
        const sideBadge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.012), Materials.amberFabric);
        sideBadge.position.set(w * 0.48, h * 0.78, l * 0.25);
        group.add(sideBadge);
    }

    if (id === "mat_yoga") {
        const mat = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.darkPlastic);
        mat.position.y = h / 2;
        group.add(mat);

        const rolledEnd = new THREE.Mesh(new THREE.CylinderGeometry(h / 2, h / 2, w, 8), Materials.darkPlastic);
        rolledEnd.rotation.z = Math.PI / 2;
        rolledEnd.position.set(0, h, -l * 0.46);
        group.add(rolledEnd);
    }
};
