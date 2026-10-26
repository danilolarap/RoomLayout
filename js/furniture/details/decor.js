window.RoomLayoutFurnitureDetails = window.RoomLayoutFurnitureDetails || {};

window.RoomLayoutFurnitureDetails.decor = function({ group, w, h, l, id }) {
    if (id === "lampara_pie") {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.045, 6), Materials.blackMetal);
        base.position.y = 0.0225;
        group.add(base);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, h * 0.78, 6), Materials.goldMetal);
        stem.position.y = 0.045 + h * 0.39;
        group.add(stem);

        const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.18, h * 0.14, 6), Materials.amberFabric);
        shade.position.y = h * 0.88;
        group.add(shade);

        const diffuser = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.018, 6), Materials.whiteSheet);
        diffuser.position.y = h * 0.81;
        group.add(diffuser);

        const shadeRim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 4, 6), Materials.goldMetal);
        shadeRim.rotation.x = Math.PI / 2;
        shadeRim.position.y = h * 0.81;
        group.add(shadeRim);
    }

    if (id === "espejo_cuerpo") {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, l * 0.7), Materials.darkNogal);
        frame.position.y = h / 2;
        group.add(frame);

        const mirrorFace = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, h * 0.91, 0.008), Materials.glassWindow);
        mirrorFace.position.set(0, h * 0.52, l * 0.36);
        group.add(mirrorFace);

        const innerBezel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, h * 0.94, 0.006), Materials.goldMetal);
        innerBezel.position.set(0, h * 0.52, l * 0.345);
        group.add(innerBezel);

        mirrorFace.position.z = l * 0.36 + 0.006;

        const topAccent = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.025, 0.012), Materials.goldMetal);
        topAccent.position.set(0, h * 0.96, l * 0.39);
        group.add(topAccent);

        [-1, 1].forEach(side => {
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.07), Materials.darkNogal);
            foot.position.set(side * w * 0.34, 0.06, 0);
            group.add(foot);
        });
    }

    if (id === "planta_interior") {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.34, w * 0.25, 0.27, 6), Materials.cherryWood);
        pot.position.y = 0.135;
        group.add(pot);

        const soil = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.32, w * 0.32, 0.018, 6), Materials.darkNogal);
        soil.position.y = 0.273;
        group.add(soil);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.38, 5), Materials.oakWood);
        stem.position.y = 0.46;
        group.add(stem);

        const leafGeometry = new THREE.IcosahedronGeometry(0.15, 0);
        [[0, 0.72, 0], [-0.1, 0.62, 0.04], [0.1, 0.64, -0.03], [0, 0.58, -0.11]].forEach((position, index) => {
            const leaf = new THREE.Mesh(leafGeometry, Materials.emeraldFabric);
            leaf.scale.set(1, 0.72, 0.82);
            leaf.position.set(...position);
            group.add(leaf);
        });

        [[-0.08, 0.56, 0.03], [0.08, 0.58, -0.04]].forEach(([x, y, z]) => {
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.014, 0.22, 5), Materials.oakWood);
            branch.position.set(x / 2, y, z / 2);
            branch.rotation.z = x < 0 ? -0.48 : 0.48;
            group.add(branch);
        });

        const potBand = new THREE.Mesh(new THREE.TorusGeometry(w * 0.32, 0.012, 4, 6), Materials.goldMetal);
        potBand.position.y = 0.25;
        group.add(potBand);
    }

    if (id === "alfombra") {
        const rug = new THREE.Mesh(new THREE.BoxGeometry(w, 0.018, l), Materials.amberFabric);
        rug.position.y = 0.009;
        group.add(rug);

        [-1, 1].forEach(side => {
            const border = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.006, 0.018), Materials.goldMetal);
            border.position.set(0, 0.02, side * l * 0.46);
            group.add(border);
        });

        for (let stripe = -1; stripe <= 1; stripe++) {
            const motif = new THREE.Mesh(new THREE.BoxGeometry(w * 0.42, 0.006, 0.012), Materials.cherryWood);
            motif.position.set(stripe * w * 0.22, 0.02, 0);
            motif.rotation.y = Math.PI / 4;
            group.add(motif);
        }

        for (let fringe = -3; fringe <= 3; fringe++) {
            const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 0.055), Materials.amberFabric);
            tassel.position.set(fringe * w * 0.12, 0.009, -l * 0.51);
            group.add(tassel);
        }
    }

    if (id === "cesto_ropa") {
        const basket = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.4, w * 0.32, h * 0.78, 8, 1, true), Materials.oakWood);
        basket.position.y = h * 0.43;
        group.add(basket);

        for (let band = 0; band < 3; band++) {
            const weaveBand = new THREE.Mesh(new THREE.TorusGeometry(w * (0.34 + band * 0.025), 0.009, 4, 8), Materials.darkNogal);
            weaveBand.position.y = h * (0.2 + band * 0.2);
            group.add(weaveBand);
        }

        for (let slat = 0; slat < 8; slat++) {
            const angle = (slat / 8) * Math.PI * 2;
            const weave = new THREE.Mesh(new THREE.BoxGeometry(0.012, h * 0.62, 0.012), Materials.cherryWood);
            weave.position.set(Math.cos(angle) * w * 0.34, h * 0.43, Math.sin(angle) * l * 0.34);
            weave.rotation.y = -angle;
            group.add(weave);
        }

        const rim = new THREE.Mesh(new THREE.TorusGeometry(w * 0.4, 0.018, 4, 8), Materials.darkNogal);
        rim.position.y = h * 0.82;
        group.add(rim);

        const towel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.46, h * 0.12, l * 0.32), Materials.whiteSheet);
        towel.position.set(0, h * 0.84, 0);
        group.add(towel);
    }

    if (id === "cortinas") {
        const curtainPanelGeometry = new THREE.BoxGeometry(w * 0.44, h * 0.94, l * 0.42);
        [-1, 1].forEach(side => {
            const panel = new THREE.Mesh(curtainPanelGeometry, Materials.amberFabric);
            panel.position.set(side * w * 0.27, h / 2, 0);
            group.add(panel);

            for (let pleat = -1; pleat <= 1; pleat++) {
                const fold = new THREE.Mesh(new THREE.BoxGeometry(0.016, h * 0.88, 0.01), Materials.emeraldFabric);
                fold.position.set(side * w * 0.27 + pleat * w * 0.12, h / 2, l * 0.22);
                group.add(fold);
            }

            const tieback = new THREE.Mesh(new THREE.BoxGeometry(w * 0.42, 0.025, l * 0.5), Materials.darkNogal);
            tieback.position.set(side * w * 0.27, h * 0.54, l * 0.16);
            group.add(tieback);
        });

        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, w * 0.94, 6), Materials.darkNogal);
        rod.rotation.z = Math.PI / 2;
        rod.position.set(0, h * 0.98, 0);
        group.add(rod);

        [-1, 1].forEach(side => {
            const finial = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), Materials.goldMetal);
            finial.position.set(side * w * 0.47, h * 0.98, 0);
            group.add(finial);
        });
    }

    if (id === "lampara_mesa") {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.4, w * 0.46, 0.035, 6), Materials.darkNogal);
        base.position.y = 0.0175;
        group.add(base);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, h * 0.48, 6), Materials.goldMetal);
        stem.position.y = h * 0.3;
        group.add(stem);

        const shade = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.22, w * 0.46, h * 0.34, 6), Materials.amberFabric);
        shade.position.y = h * 0.78;
        group.add(shade);

        const diffuser = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.2, w * 0.4, 0.014, 6), Materials.whiteSheet);
        diffuser.position.y = h * 0.61;
        group.add(diffuser);

        const shadeTrim = new THREE.Mesh(new THREE.TorusGeometry(w * 0.43, 0.009, 4, 6), Materials.goldMetal);
        shadeTrim.rotation.x = Math.PI / 2;
        shadeTrim.position.y = h * 0.61;
        group.add(shadeTrim);
    }
};
