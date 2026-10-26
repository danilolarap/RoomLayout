window.RoomLayoutFurnitureDetails = window.RoomLayoutFurnitureDetails || {};

window.RoomLayoutFurnitureDetails.architecture = function({ group, w, h, l, id }) {
    if (id === "reloj_pared") {
        for (let mark = 0; mark < 12; mark++) {
            const angle = (mark / 12) * Math.PI * 2;
            const major = mark % 3 === 0;
            const tick = new THREE.Mesh(
                new THREE.BoxGeometry(major ? 0.018 : 0.01, major ? 0.045 : 0.026, 0.008),
                Materials.goldMetal
            );
            tick.position.set(Math.sin(angle) * w * 0.36, h / 2 + Math.cos(angle) * h * 0.36, 0.027);
            group.add(tick);
        }
    }

    if (id === "reloj_mesa") {
        const crownButton = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 6), Materials.goldMetal);
        crownButton.position.set(0, h + 0.012, 0);
        group.add(crownButton);
        const minuteAccent = new THREE.Mesh(new THREE.BoxGeometry(w * 0.08, 0.012, 0.012), Materials.amberFabric);
        minuteAccent.position.set(0, h * 0.22, l / 2 + 0.012);
        group.add(minuteAccent);
    }

    if (id === "ventana_cuadrada") {
        const mullionMaterial = Materials.whiteFrame;
        const verticalBar = new THREE.Mesh(new THREE.BoxGeometry(0.025, h * 0.84, 0.025), mullionMaterial);
        verticalBar.position.set(0, h / 2, 0.022);
        group.add(verticalBar);
        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.84, 0.025, 0.025), mullionMaterial);
        crossbar.position.set(0, h * 0.52, 0.022);
        group.add(crossbar);
    }

    if (id === "ventana_rect") {
        [-1, 1].forEach(side => {
            const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.022, h * 0.82, 0.024), Materials.whiteFrame);
            mullion.position.set(side * w * 0.24, h / 2, 0.021);
            group.add(mullion);
        });
        const transom = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.022, 0.024), Materials.whiteFrame);
        transom.position.set(0, h * 0.68, 0.021);
        group.add(transom);
    }

    if (id === "ventana_circular") {
        const spokeGeometry = new THREE.BoxGeometry(w * 0.82, 0.022, 0.025);
        const horizontalSpoke = new THREE.Mesh(spokeGeometry, Materials.whiteFrame);
        horizontalSpoke.position.set(0, h / 2, 0.022);
        group.add(horizontalSpoke);
        const verticalSpoke = new THREE.Mesh(spokeGeometry, Materials.whiteFrame);
        verticalSpoke.rotation.z = Math.PI / 2;
        verticalSpoke.position.set(0, h / 2, 0.022);
        group.add(verticalSpoke);
    }

    if (id === "ventana_esquina") {
        const backCrossbar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.025, 0.03), Materials.whiteFrame);
        backCrossbar.position.set(0, h * 0.58, -l / 2);
        group.add(backCrossbar);
        const sideCrossbar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.025, l * 0.9), Materials.whiteFrame);
        sideCrossbar.position.set(-w / 2, h * 0.58, 0);
        group.add(sideCrossbar);
    }
};
