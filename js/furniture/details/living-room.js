window.RoomLayoutFurnitureDetails = window.RoomLayoutFurnitureDetails || {};

window.RoomLayoutFurnitureDetails.livingRoom = function({ group, w, h, l, id }) {
    if (id === "mueble_tv_grande") {
        [-1, 0, 1].forEach(slot => {
            const drawer = new THREE.Mesh(new THREE.BoxGeometry(w * 0.24, h * 0.22, 0.018), Materials.cherryWood);
            drawer.position.set(slot * w * 0.29, h * 0.39, l / 2 + 0.012);
            group.add(drawer);
            const pull = new THREE.Mesh(new THREE.BoxGeometry(w * 0.07, 0.012, 0.012), Materials.goldMetal);
            pull.position.set(slot * w * 0.29, h * 0.4, l / 2 + 0.025);
            group.add(pull);
        });
    }

    if (id === "mueble_tv") {
        for (let slat = 0; slat < 4; slat++) {
            const grille = new THREE.Mesh(new THREE.BoxGeometry(w * 0.36, 0.012, 0.014), Materials.goldMetal);
            grille.position.set(0, h * (0.25 + slat * 0.1), l / 2 + 0.012);
            group.add(grille);
        }
    }

    if (id === "sofa_1p") {
        const accentPillow = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, h * 0.2, l * 0.18), Materials.amberFabric);
        accentPillow.position.set(w * 0.23, h * 0.57, -l * 0.29);
        accentPillow.rotation.z = -0.12;
        group.add(accentPillow);
        const piping = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, 0.012, 0.012), Materials.amberFabric);
        piping.position.set(0, h * 0.42, l * 0.37);
        group.add(piping);
    }

    if (id === "sofa_2p") {
        [-1, 1].forEach(side => {
            const accentPillow = new THREE.Mesh(new THREE.BoxGeometry(w * 0.19, h * 0.18, l * 0.16), Materials.amberFabric);
            accentPillow.position.set(side * w * 0.29, h * 0.57, -l * 0.29);
            accentPillow.rotation.z = side * -0.1;
            group.add(accentPillow);
        });
        const centerSeam = new THREE.Mesh(new THREE.BoxGeometry(0.012, h * 0.18, 0.012), Materials.darkNogal);
        centerSeam.position.set(0, h * 0.3, l * 0.39);
        group.add(centerSeam);
    }
};
