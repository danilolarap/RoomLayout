window.RoomLayoutFurnitureDetails = window.RoomLayoutFurnitureDetails || {};

window.RoomLayoutFurnitureDetails.bedroomStorage = function({ group, w, h, l, id }) {
    if (id === "cama_king") {
        const footRunner = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.025, l * 0.1), Materials.amberFabric);
        footRunner.position.set(0, h * 0.67, l * 0.39);
        group.add(footRunner);
    }

    if (id === "cama_queen") {
        const headboardStud = new THREE.SphereGeometry(0.025, 6, 5);
        [-1, 1].forEach(side => {
            const stud = new THREE.Mesh(headboardStud, Materials.goldMetal);
            stud.position.set(side * w * 0.32, h * 0.88, -l / 2 + 0.09);
            group.add(stud);
        });
    }

    if (id === "cama_sencilla") {
        const foldedThrow = new THREE.Mesh(new THREE.BoxGeometry(w * 0.68, h * 0.025, l * 0.12), Materials.amberFabric);
        foldedThrow.position.set(0, h * 0.67, l * 0.37);
        group.add(foldedThrow);
    }

    if (id === "mesa_noche") {
        const footGeometry = new THREE.CylinderGeometry(0.025, 0.035, 0.07, 5);
        [-1, 1].forEach(xSide => [-1, 1].forEach(zSide => {
            const foot = new THREE.Mesh(footGeometry, Materials.goldMetal);
            foot.position.set(xSide * w * 0.4, 0.035, zSide * l * 0.4);
            group.add(foot);
        }));
    }

    if (id === "armario_doble") {
        const mirror = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.62, 0.008), Materials.chromeMetal);
        mirror.position.set(-w * 0.22, h * 0.54, l / 2 + 0.025);
        group.add(mirror);
    }

    if (id === "armario_3p") {
        const centerInlay = new THREE.Mesh(new THREE.BoxGeometry(w * 0.012, h * 0.84, 0.008), Materials.goldMetal);
        centerInlay.position.set(0, h / 2, l / 2 + 0.025);
        centerInlay.userData.noShadow = true;
        group.add(centerInlay);
    }

    if (id === "comoda") {
        const carcass = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.86, l), Materials.oakWood);
        carcass.position.y = h * 0.43;
        group.add(carcass);

        const top = new THREE.Mesh(new THREE.BoxGeometry(w * 1.04, h * 0.06, l * 1.04), Materials.darkNogal);
        top.position.y = h * 0.89;
        group.add(top);

        for (let drawerIndex = 0; drawerIndex < 3; drawerIndex++) {
            const drawerY = h * (0.18 + drawerIndex * 0.23);
            const drawer = new THREE.Mesh(new THREE.BoxGeometry(w * 0.84, h * 0.17, 0.018), Materials.cherryWood);
            drawer.position.set(0, drawerY, l / 2 + 0.01);
            group.add(drawer);

            const pull = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), Materials.goldMetal);
            pull.position.set(0, drawerY, l / 2 + 0.025);
            group.add(pull);

            const drawerSeam = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.012, 0.01), Materials.darkNogal);
            drawerSeam.position.set(0, drawerY - h * 0.1, l / 2 + 0.021);
            group.add(drawerSeam);
        }

        [-1, 1].forEach(xSide => [-1, 1].forEach(zSide => {
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.055), Materials.darkNogal);
            foot.position.set(xSide * w * 0.42, 0.04, zSide * l * 0.38);
            group.add(foot);
        }));
    }

    if (id === "librero") {
        const sidePanelGeometry = new THREE.BoxGeometry(0.045, h, l);
        [-1, 1].forEach(side => {
            const panel = new THREE.Mesh(sidePanelGeometry, Materials.darkNogal);
            panel.position.set(side * (w / 2 - 0.0225), h / 2, 0);
            group.add(panel);
        });

        const backPanel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.96, 0.018), Materials.cherryWood);
        backPanel.position.set(0, h / 2, -l / 2 + 0.009);
        group.add(backPanel);

        for (let shelfIndex = 0; shelfIndex <= 4; shelfIndex++) {
            const shelfY = h * (0.08 + shelfIndex * 0.18);
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.035, l * 0.98), Materials.oakWood);
            shelf.position.set(0, shelfY, 0);
            group.add(shelf);

            const shelfEdge = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.012, 0.018), Materials.cherryWood);
            shelfEdge.position.set(0, shelfY + 0.018, l / 2 - 0.018);
            group.add(shelfEdge);

            if (shelfIndex < 4) {
                for (let bookIndex = 0; bookIndex < 3; bookIndex++) {
                    const bookWidth = w * 0.13;
                    const bookHeight = h * (0.09 + (bookIndex % 2) * 0.025);
                    const book = new THREE.Mesh(
                        new THREE.BoxGeometry(bookWidth, bookHeight, l * 0.62),
                        [Materials.blueFabric, Materials.amberFabric, Materials.emeraldFabric][bookIndex]
                    );
                    book.position.set(-w * 0.3 + bookIndex * w * 0.16, shelfY + bookHeight / 2 + 0.02, l * 0.08);
                    group.add(book);
                }
            }
        }
    }

    if (id === "zapatero") {
        [-1, 1].forEach(side => {
            const support = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, l), Materials.darkNogal);
            support.position.set(side * (w / 2 - 0.02), h / 2, 0);
            group.add(support);
        });

        for (let shelfIndex = 0; shelfIndex < 3; shelfIndex++) {
            const shelfY = h * (0.12 + shelfIndex * 0.31);
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.035, l), Materials.oakWood);
            shelf.position.set(0, shelfY, 0);
            group.add(shelf);

            for (let shoeIndex = 0; shoeIndex < 3; shoeIndex++) {
                const shoe = new THREE.Mesh(new THREE.BoxGeometry(w * 0.18, 0.07, l * 0.34), Materials.blackLeather);
                shoe.position.set(-w * 0.29 + shoeIndex * w * 0.29, shelfY + 0.055, l * 0.08);
                shoe.rotation.y = shoeIndex % 2 ? 0.08 : -0.08;
                group.add(shoe);
            }
        }

        const topShelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, l), Materials.darkNogal);
        topShelf.position.y = h - 0.02;
        group.add(topShelf);

        [-1, 1].forEach(side => {
            const cornerCap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.055), Materials.goldMetal);
            cornerCap.position.set(side * (w / 2 - 0.025), h - 0.025, l / 2 - 0.025);
            group.add(cornerCap);
        });
    }
};
