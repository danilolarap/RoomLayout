window.RoomLayoutFurnitureDetails = window.RoomLayoutFurnitureDetails || {};

window.RoomLayoutFurnitureDetails.workspace = function({ group, w, h, l, id }) {
    if (id === "escritorio_l") {
        const drawerUnit = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.26, l * 0.24), Materials.darkNogal);
        drawerUnit.position.set(w * 0.29, h * 0.61, -l * 0.25);
        group.add(drawerUnit);
        const drawerPull = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, 0.018, 0.012), Materials.goldMetal);
        drawerPull.position.set(w * 0.29, h * 0.64, -l * 0.25 + l * 0.12);
        group.add(drawerPull);
    }

    if (id === "escritorio_recto") {
        const drawerUnit = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, h * 0.22, l * 0.55), Materials.darkNogal);
        drawerUnit.position.set(-w * 0.22, h * 0.63, 0);
        group.add(drawerUnit);
        const drawerPull = new THREE.Mesh(new THREE.BoxGeometry(w * 0.16, 0.018, 0.012), Materials.goldMetal);
        drawerPull.position.set(-w * 0.22, h * 0.66, l * 0.28);
        group.add(drawerPull);
    }

    if (id === "silla_ergonomica") {
        const lumbarPad = new THREE.Mesh(new THREE.BoxGeometry(w * 0.52, h * 0.12, 0.065), Materials.blueFabric);
        lumbarPad.position.set(0, 0.79, -l * 0.32);
        group.add(lumbarPad);
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, l * 0.42), Materials.blackMetal);
            arm.position.set(side * w * 0.38, 0.58, -l * 0.04);
            group.add(arm);
        });
    }

    if (id === "laptop") {
        const keyGeometry = new THREE.BoxGeometry(w * 0.11, 0.008, l * 0.055);
        for (let row = 0; row < 2; row++) {
            for (let column = 0; column < 4; column++) {
                const key = new THREE.Mesh(keyGeometry, Materials.blackMetal);
                key.position.set(-w * 0.3 + column * w * 0.2, 0.018, l * 0.06 + row * l * 0.09);
                group.add(key);
            }
        }
        const trackpad = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, 0.004, l * 0.14), Materials.chromeMetal);
        trackpad.position.set(0, 0.018, l * 0.24);
        group.add(trackpad);
    }

    if (id === "pc_torre") {
        const fanRadius = Math.min(h, l) * 0.145;
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(fanRadius * 0.16, fanRadius * 0.04);
        bladeShape.lineTo(fanRadius * 0.62, fanRadius * 0.08);
        bladeShape.lineTo(fanRadius * 0.54, fanRadius * 0.24);
        bladeShape.lineTo(fanRadius * 0.24, fanRadius * 0.34);
        bladeShape.closePath();
        const bladeGeometry = new THREE.ShapeGeometry(bladeShape);

        [-l * 0.245, l * 0.245].forEach(offsetZ => {
            const fanAssembly = new THREE.Group();
            fanAssembly.rotation.y = Math.PI / 2;
            fanAssembly.position.set(w / 2 + 0.015, h * 0.56, offsetZ);

            const outerRim = new THREE.Mesh(
                new THREE.TorusGeometry(fanRadius, 0.006, 4, 8),
                Materials.blackMetal
            );
            outerRim.userData.noShadow = true;
            fanAssembly.add(outerRim);

            const lightRing = new THREE.Mesh(
                new THREE.TorusGeometry(fanRadius * 0.78, 0.003, 4, 8),
                Materials.skyAccent
            );
            lightRing.position.z = 0.002;
            lightRing.userData.noShadow = true;
            fanAssembly.add(lightRing);

            for (let bladeIndex = 0; bladeIndex < 5; bladeIndex++) {
                const blade = new THREE.Mesh(bladeGeometry, Materials.skyAccent);
                blade.rotation.z = (bladeIndex * Math.PI * 2) / 5;
                blade.position.z = 0.004;
                blade.userData.noShadow = true;
                fanAssembly.add(blade);
            }

            const hub = new THREE.Mesh(
                new THREE.CylinderGeometry(fanRadius * 0.2, fanRadius * 0.2, 0.01, 6),
                Materials.goldMetal
            );
            hub.rotation.x = Math.PI / 2;
            hub.position.z = 0.006;
            hub.userData.noShadow = true;
            fanAssembly.add(hub);
            group.add(fanAssembly);
        });

        const powerButton = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 8), Materials.goldMetal);
        powerButton.rotation.x = Math.PI / 2;
        powerButton.position.set(w * 0.28, h * 0.84, l / 2 + 0.012);
        powerButton.userData.noShadow = true;
        group.add(powerButton);
    }

    if (id === "monitor") {
        const webcam = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), Materials.chromeMetal);
        webcam.position.set(0, h * 0.925, 0.018);
        group.add(webcam);
        const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 4), Materials.emeraldFabric);
        statusLight.position.set(w * 0.44, h * 0.29, 0.018);
        group.add(statusLight);
    }

    if (id === "mouse") {
        const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.018, 0.035), Materials.chromeMetal);
        wheel.position.set(0, 0.029, -l * 0.12);
        group.add(wheel);
        const buttonSeam = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.013, 0.06), Materials.darkPlastic);
        buttonSeam.position.set(0, 0.027, -0.025);
        group.add(buttonSeam);
    }
};
