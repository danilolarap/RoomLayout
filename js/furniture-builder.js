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
            door.position.set(posX, h / 2, l / 2 + 0.022);
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
        glassPanel.position.set(w / 2 + 0.012, h / 2, 0);
        glassPanel.userData.noShadow = true;
        group.add(glassPanel);

        const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, h * 0.82, 0.008), Materials.darkPlastic);
        frontPanel.position.set(0, h / 2, l / 2 + 0.004);
        frontPanel.userData.noShadow = true;
        group.add(frontPanel);

        const frontAccent = new THREE.Mesh(new THREE.BoxGeometry(w * 0.045, h * 0.62, 0.006), Materials.skyAccent);
        frontAccent.position.set(-w * 0.31, h * 0.51, l / 2 + 0.011);
        frontAccent.userData.noShadow = true;
        group.add(frontAccent);

        for (let vent = 0; vent < 3; vent++) {
            const grille = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, 0.008, 0.006), Materials.blackMetal);
            grille.position.set(w * 0.27, h * (0.57 - vent * 0.045), l / 2 + 0.011);
            grille.userData.noShadow = true;
            group.add(grille);
        }

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
    }
    if (id === "espejo_cuerpo") {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, l * 0.7), Materials.darkNogal);
        frame.position.y = h / 2;
        group.add(frame);

        const mirrorFace = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, h * 0.91, 0.008), Materials.glassWindow);
        mirrorFace.position.set(0, h * 0.52, l * 0.36);
        group.add(mirrorFace);

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
            const leaf = new THREE.Mesh(leafGeometry, index % 2 ? Materials.emeraldFabric : Materials.blueFabric);
            leaf.scale.set(1, 0.72, 0.82);
            leaf.position.set(...position);
            group.add(leaf);
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
    }
    group.traverse(child => {
        if (child.isMesh) {
            child.castShadow = !child.userData?.noShadow;
            child.receiveShadow = !child.userData?.noShadow;
        }
    });

    return group;
}
