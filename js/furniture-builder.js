// Construcción de Objetos 3D Complejos
function createDetailedFurniture(item) {
    const group = new THREE.Group();
    const w = item.w || 1, h = item.h || 0.5, l = item.l || 1;
    const id = item.id || "";

    if (id === "cama_king" || id === "cama_queen" || id === "cama_sencilla") {
        const matWood = id === "cama_king" ? Materials.darkNogal : (id === "cama_queen" ? Materials.oakWood : Materials.cherryWood);
        const matFabric = id === "cama_king" ? Materials.blueFabric : (id === "cama_queen" ? Materials.emeraldFabric : Materials.redFabric);

        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.25, l), matWood);
        base.position.y = h * 0.125;
        group.add(base);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(w, h * 1.1, 0.08), matWood);
        headboard.position.set(0, h * 0.55, -l / 2 + 0.04);
        group.add(headboard);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.38, l * 0.88), Materials.whiteSheet);
        mattress.position.set(0, h * 0.44, 0.04);
        group.add(mattress);

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, h * 0.4, l * 0.58), matFabric);
        blanket.position.set(0, h * 0.45, l * 0.18);
        group.add(blanket);

        const pillows = id === "cama_sencilla" ? 1 : 2;
        for (let i = 0; i < pillows; i++) {
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(w * (pillows === 1 ? 0.7 : 0.38), h * 0.12, l * 0.2), Materials.whiteSheet);
            const posX = pillows === 1 ? 0 : (-w * 0.22 + i * (w * 0.44));
            pillow.position.set(posX, h * 0.68, -l * 0.26);
            group.add(pillow);
        }

    } else if (id.includes("armario")) {
        const numDoors = id === "armario_4p" ? 4 : (id === "armario_3p" ? 3 : 2);
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.oakWood);
        body.position.y = h / 2;
        group.add(body);

        const doorW = (w * 0.96) / numDoors;
        for (let i = 0; i < numDoors; i++) {
            const posX = -w * 0.48 + doorW / 2 + i * doorW;
            const door = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.96, h * 0.94, 0.02), Materials.darkNogal);
            door.position.set(posX, h / 2, l / 2 + 0.01);
            group.add(door);

            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12), Materials.chromeMetal);
            const hOffset = (i % 2 === 0) ? doorW * 0.35 : -doorW * 0.35;
            handle.position.set(posX + hOffset, h / 2, l / 2 + 0.03);
            group.add(handle);
        }

    } else if (id === "mesa_noche") {
        const topThickness = 0.03;
        const bodyHeight = h - topThickness;

        const body = new THREE.Mesh(new THREE.BoxGeometry(w, bodyHeight, l), Materials.oakWood);
        body.position.y = bodyHeight / 2;
        group.add(body);

        const topBoard = new THREE.Mesh(new THREE.BoxGeometry(w * 1.04, topThickness, l * 1.04), Materials.oakWood);
        topBoard.position.y = bodyHeight + topThickness / 2;
        group.add(topBoard);

        const drawerFront = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, bodyHeight * 0.45, 0.02), Materials.cherryWood);
        drawerFront.position.set(0, bodyHeight * 0.6, l / 2 + 0.01);
        group.add(drawerFront);

        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 12), Materials.goldMetal);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(0, bodyHeight * 0.6, l / 2 + 0.03);
        group.add(handle);

    } else if (id === "escritorio_recto" || id === "escritorio_l") {
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, id === "escritorio_l" ? l * 0.5 : l), Materials.oakWood);
        top.position.set(0, h - 0.025, id === "escritorio_l" ? -l * 0.25 : 0);
        group.add(top);

        if (id === "escritorio_l") {
            const sideTop = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 0.05, l * 0.5), Materials.oakWood);
            sideTop.position.set(-w * 0.3, h - 0.025, l * 0.25);
            group.add(sideTop);
        }

        const legGeo = new THREE.BoxGeometry(0.04, h - 0.05, 0.04);
        const legOffsets = id === "escritorio_l" ? [
            [w / 2 - 0.04, (h - 0.05) / 2, -l / 2 + 0.04],
            [w / 2 - 0.04, (h - 0.05) / 2, 0],
            [-w / 2 + 0.04, (h - 0.05) / 2, -l / 2 + 0.04],
            [-w / 2 + 0.04, (h - 0.05) / 2, l / 2 - 0.04],
            [-w * 0.1, (h - 0.05) / 2, l / 2 - 0.04]
        ] : [
            [-w / 2 + 0.05, (h - 0.05) / 2, -l / 2 + 0.05],
            [w / 2 - 0.05, (h - 0.05) / 2, -l / 2 + 0.05],
            [-w / 2 + 0.05, (h - 0.05) / 2, l / 2 - 0.05],
            [w / 2 - 0.05, (h - 0.05) / 2, l / 2 - 0.05]
        ];

        legOffsets.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, Materials.blackMetal);
            leg.position.set(...pos);
            group.add(leg);
        });

    } else if (id === "silla_ergonomica") {
        const baseCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), Materials.blackMetal);
        baseCenter.position.y = 0.1;
        group.add(baseCenter);

        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.04), Materials.blackMetal);
            leg.position.set(Math.cos(angle) * 0.14, 0.08, Math.sin(angle) * 0.14);
            leg.rotation.y = -angle;
            group.add(leg);

            const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), Materials.blackMetal);
            wheel.position.set(Math.cos(angle) * 0.26, 0.025, Math.sin(angle) * 0.26);
            group.add(wheel);
        }

        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12), Materials.chromeMetal);
        piston.position.y = 0.28;
        group.add(piston);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.08, l * 0.8), Materials.blackLeather);
        seat.position.y = 0.48;
        group.add(seat);

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, h * 0.55, 0.05), Materials.blackLeather);
        backrest.position.set(0, 0.8, -l * 0.35);
        group.add(backrest);

    } else if (id.includes("mueble_tv")) {
        const tvWidth = id.includes("grande") ? 1.6 : 1.2;
        const tvHeight = id.includes("grande") ? 0.95 : 0.75;

        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.8, l), Materials.darkNogal);
        cabinet.position.y = (h * 0.8) / 2;
        group.add(cabinet);

        const tvStandBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.25), Materials.blackMetal);
        tvStandBase.position.set(0, h * 0.81, 0);
        group.add(tvStandBase);

        const tvPole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.04), Materials.blackMetal);
        tvPole.position.set(0, h * 0.8 + 0.1, 0);
        group.add(tvPole);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(tvWidth, tvHeight, 0.03), Materials.tvScreen);
        screen.position.set(0, h * 0.8 + 0.1 + (tvHeight / 2), 0);
        group.add(screen);

        const bezel = new THREE.Mesh(new THREE.BoxGeometry(tvWidth + 0.03, tvHeight + 0.03, 0.01), Materials.blackMetal);
        bezel.position.set(0, h * 0.8 + 0.1 + (tvHeight / 2), -0.01);
        group.add(bezel);

    } else if (id.includes("sofa")) {
        const isTwoSeater = id === "sofa_2p";
        const cushionCount = isTwoSeater ? 2 : 1;
        const cushionWidth = (w * 0.8) / cushionCount;

        const base = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.2, l), Materials.darkNogal);
        base.position.y = h * 0.1;
        group.add(base);

        for (let i = 0; i < cushionCount; i++) {
            const posX = isTwoSeater ? (-w * 0.2 + i * (w * 0.4)) : 0;
            const cushion = new THREE.Mesh(new THREE.BoxGeometry(cushionWidth * 0.95, h * 0.25, l * 0.75), Materials.blueFabric);
            cushion.position.set(posX, h * 0.28, 0.02);
            group.add(cushion);
        }

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.55, l * 0.22), Materials.blueFabric);
        backrest.position.set(0, h * 0.55, -l * 0.35);
        group.add(backrest);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, h * 0.45, l), Materials.blueFabric);
        armL.position.set(-w * 0.44, h * 0.38, 0);
        group.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(w * 0.12, h * 0.45, l), Materials.blueFabric);
        armR.position.set(w * 0.44, h * 0.38, 0);
        group.add(armR);

    } else if (id === "rack_mancuernas") {
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, l * 0.9), Materials.blackMetal);
        frameL.position.set(-w * 0.45, h / 2, 0);
        group.add(frameL);

        const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, l * 0.9), Materials.blackMetal);
        frameR.position.set(w * 0.45, h / 2, 0);
        group.add(frameR);

        for (let level = 0; level < 2; level++) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.03, 0.08), Materials.blackMetal);
            const posY = h * 0.35 + level * (h * 0.4);
            rail.position.set(0, posY, 0);
            group.add(rail);

            for (let d = 0; d < 3; d++) {
                const posX = -w * 0.3 + d * (w * 0.3);
                const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 12), Materials.chromeMetal);
                handle.rotation.z = Math.PI / 2;
                handle.position.set(posX, posY + 0.04, 0);
                group.add(handle);

                const weightL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), Materials.blackMetal);
                weightL.rotation.z = Math.PI / 2;
                weightL.position.set(posX - 0.08, posY + 0.04, 0);
                group.add(weightL);

                const weightR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), Materials.blackMetal);
                weightR.rotation.z = Math.PI / 2;
                weightR.position.set(posX + 0.08, posY + 0.04, 0);
                group.add(weightR);
            }
        }

    } else if (id === "banco_plano") {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, l), Materials.blackLeather);
        pad.position.y = h - 0.04;
        group.add(pad);

        const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h - 0.08, 12), Materials.blackMetal);
        legL.position.set(-w * 0.4, (h - 0.08) / 2, 0);
        group.add(legL);

        const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h - 0.08, 12), Materials.blackMetal);
        legR.position.set(w * 0.4, (h - 0.08) / 2, 0);
        group.add(legR);

        const baseBarL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, l * 0.9), Materials.blackMetal);
        baseBarL.position.set(-w * 0.4, 0.015, 0);
        group.add(baseBarL);

        const baseBarR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, l * 0.9), Materials.blackMetal);
        baseBarR.position.set(w * 0.4, 0.015, 0);
        group.add(baseBarR);

    } else if (id === "laptop") {
        const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.015, l), Materials.chromeMetal);
        base.position.y = 0.0075;
        group.add(base);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(w, l * 0.9, 0.01), Materials.blackMetal);
        screen.rotation.x = -Math.PI / 3;
        screen.position.set(0, l * 0.35, -l * 0.4);
        group.add(screen);

    } else if (id === "pc_torre") {
        const caseBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.blackMetal);
        caseBody.position.y = h / 2;
        group.add(caseBody);

        const glassPanel = new THREE.Mesh(new THREE.BoxGeometry(0.01, h * 0.9, l * 0.85), Materials.glassWindow);
        glassPanel.position.set(w / 2 + 0.005, h / 2, 0);
        group.add(glassPanel);

    } else if (id === "monitor") {
        const standBase = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.2, w * 0.2, 0.015, 16), Materials.blackMetal);
        standBase.position.y = 0.0075;
        group.add(standBase);

        const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, h * 0.4, 12), Materials.chromeMetal);
        standPole.position.y = h * 0.2;
        group.add(standPole);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.65, 0.03), Materials.tvScreen);
        screen.position.y = h * 0.6;
        group.add(screen);

    } else if (id === "mouse") {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(w, 0.005, l), Materials.darkPlastic);
        pad.position.y = 0.0025;
        group.add(pad);

        const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.1), Materials.blackMetal);
        mouseBody.position.set(0, 0.015, 0);
        group.add(mouseBody);

    } else if (id === "caminadora") {
        const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, l), Materials.blackMetal);
        deck.position.y = 0.06;
        group.add(deck);

        const belt = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.01, l * 0.8), Materials.darkPlastic);
        belt.position.set(0, 0.125, 0);
        group.add(belt);

        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 12), Materials.blackMetal);
        postL.position.set(-w * 0.4, h / 2, -l * 0.35);
        postL.rotation.x = 0.2;
        group.add(postL);

        const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 12), Materials.blackMetal);
        postR.position.set(w * 0.4, h / 2, -l * 0.35);
        postR.rotation.x = 0.2;
        group.add(postR);

        const consoleBar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.3), Materials.darkPlastic);
        consoleBar.position.set(0, h * 0.9, -l * 0.25);
        group.add(consoleBar);

    } else if (id === "barra_pared") {
        const wallPlate = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), Materials.blackMetal);
        wallPlate.position.y = h / 2;
        group.add(wallPlate);

        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, w * 1.1, 16), Materials.chromeMetal);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, h * 0.8, l * 0.8);
        group.add(bar);

        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, l, 12), Materials.blackMetal);
        armL.rotation.x = Math.PI / 2;
        armL.position.set(-w * 0.35, h * 0.8, l / 2);
        group.add(armL);

        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, l, 12), Materials.blackMetal);
        armR.rotation.x = Math.PI / 2;
        armR.position.set(w * 0.35, h * 0.8, l / 2);
        group.add(armR);

    } else if (id.includes("ventana")) {
        const frameMat = Materials.whiteFrame;
        const glassMat = Materials.glassWindow;
        const frameThick = 0.05;

        if (id === "ventana_circular") {
            const outerRing = new THREE.Mesh(new THREE.TorusGeometry(w / 2, 0.04, 16, 32), frameMat);
            outerRing.position.y = h / 2;
            group.add(outerRing);

            const glass = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 - 0.02, w / 2 - 0.02, 0.02, 32), glassMat);
            glass.rotation.x = Math.PI / 2;
            glass.position.y = h / 2;
            group.add(glass);

        } else if (id === "ventana_esquina") {
            const glass1 = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), glassMat);
            glass1.position.set(0, h / 2, -l / 2);
            group.add(glass1);

            const glass2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, h, l), glassMat);
            glass2.position.set(-w / 2, h / 2, 0);
            group.add(glass2);

            const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), frameMat);
            post.position.set(-w / 2, h / 2, -l / 2);
            group.add(post);

        } else {
            const frameTop = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, 0.06), frameMat);
            frameTop.position.y = h - frameThick / 2;
            group.add(frameTop);

            const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, 0.06), frameMat);
            frameBottom.position.y = frameThick / 2;
            group.add(frameBottom);

            const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, 0.06), frameMat);
            frameLeft.position.set(-w / 2 + frameThick / 2, h / 2, 0);
            group.add(frameLeft);

            const frameRight = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, 0.06), frameMat);
            frameRight.position.set(w / 2 - frameThick / 2, h / 2, 0);
            group.add(frameRight);

            const glass = new THREE.Mesh(new THREE.BoxGeometry(w - frameThick * 2, h - frameThick * 2, 0.015), glassMat);
            glass.position.y = h / 2;
            group.add(glass);
        }

    } else if (id === "reloj_pared") {
        const frame = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.04, 32), Materials.whiteFrame);
        frame.rotation.x = Math.PI / 2;
        frame.position.y = h / 2;
        group.add(frame);

        const handH = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.01), Materials.blackMetal);
        handH.position.set(0, h / 2 + 0.03, 0.025);
        group.add(handH);

        const handM = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.01), Materials.blackMetal);
        handM.position.set(0.03, h / 2, 0.025);
        handM.rotation.z = Math.PI / 3;
        group.add(handM);

    } else if (id === "reloj_mesa") {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.emeraldFabric);
        body.position.y = h / 2;
        group.add(body);

        const display = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.7, 0.01), Materials.tvScreen);
        display.position.set(0, h / 2, l / 2 + 0.005);
        group.add(display);

    } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), Materials.oakWood);
        body.position.y = h / 2;
        group.add(body);
    }

+    if (id === "cama_king") {
        const footRunner = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.025, l * 0.1), Materials.amberFabric);
        footRunner.position.set(0, h * 0.67, l * 0.39);
        group.add(footRunner);
    }
+    if (id === "cama_queen") {
        const headboardStud = new THREE.SphereGeometry(0.025, 6, 5);
        [-1, 1].forEach(side => {
            const stud = new THREE.Mesh(headboardStud, Materials.goldMetal);
            stud.position.set(side * w * 0.32, h * 0.88, -l / 2 + 0.09);
            group.add(stud);
        });
    }
+    if (id === "cama_sencilla") {
        const foldedThrow = new THREE.Mesh(new THREE.BoxGeometry(w * 0.68, h * 0.025, l * 0.12), Materials.amberFabric);
        foldedThrow.position.set(0, h * 0.67, l * 0.37);
        group.add(foldedThrow);
    }
+    if (id === "mesa_noche") {
        const footGeometry = new THREE.CylinderGeometry(0.025, 0.035, 0.07, 5);
        [-1, 1].forEach(xSide => [-1, 1].forEach(zSide => {
            const foot = new THREE.Mesh(footGeometry, Materials.goldMetal);
            foot.position.set(xSide * w * 0.4, 0.035, zSide * l * 0.4);
            group.add(foot);
        }));
    }
+    if (id === "armario_doble") {
        const mirror = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.62, 0.008), Materials.chromeMetal);
        mirror.position.set(-w * 0.22, h * 0.54, l / 2 + 0.025);
        group.add(mirror);
    }
+    if (id === "armario_3p") {
        const centerInlay = new THREE.Mesh(new THREE.BoxGeometry(w * 0.012, h * 0.84, 0.008), Materials.goldMetal);
        centerInlay.position.set(0, h / 2, l / 2 + 0.025);
        group.add(centerInlay);
    }
    group.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return group;
}
