// js/ai-engine.js - Motor Local de Análisis Inteligente de Espacios 3D (Soporte Bilingüe ES/EN)

window.AIEngine = {
    analyzeScene: function() {
        const lang = window.currentLang || "es";
        const isEn = lang === "en";

        const roomW = parseFloat(document.getElementById("room-width")?.value) || 4.0;
        const roomL = parseFloat(document.getElementById("room-length")?.value) || 3.5;
        const halfW = roomW / 2;
        const halfL = roomL / 2;
        const roomArea = roomW * roomL;

        const results = {
            score: 100,
            conflicts: [],
            suggestions: [],
            metrics: {
                occupiedArea: 0,
                freeArea: roomArea,
                occupancyPercentage: 0
            }
        };

        if (typeof activeItems === "undefined" || activeItems.length === 0) {
            results.suggestions.push(
                isEn 
                    ? "The room is empty. Add furniture to start evaluation." 
                    : "La habitación está vacía. Agrega muebles para iniciar la evaluación."
            );
            return results;
        }

        let totalFurnitureArea = 0;
        const items = [];

        // 1. Recopilar bounding boxes 3D en espacio del mundo y datos de cada objeto
        activeItems.forEach(group => {
            const data = group.userData || {};
            if (data.isDoor) return;

            const box = new THREE.Box3().setFromObject(group);
            const w = data.w || (box.max.x - box.min.x);
            const h = data.h || (box.max.y - box.min.y);
            const l = data.l || (box.max.z - box.min.z);

            totalFurnitureArea += (w * l);

            // Obtener el nombre del objeto según el idioma actual
            let nameStr = isEn ? "Item" : "Objeto";
            if (data.name) {
                if (typeof data.name === "object") {
                    nameStr = data.name[lang] || data.name.es || data.name.en || nameStr;
                } else if (typeof data.name === "string") {
                    nameStr = data.name;
                }
            }

            items.push({
                group: group,
                name: nameStr,
                id: data.id || "",
                box: box,
                pos: group.position.clone(),
                w: w,
                h: h,
                l: l,
                isWallItem: data.id?.includes("ventana") || data.id === "reloj_pared" || data.id === "barra_pared",
                isSurfaceItem: ["laptop", "pc_torre", "monitor", "mouse", "reloj_mesa"].includes(data.id)
            });
        });

        results.metrics.occupiedArea = totalFurnitureArea;
        results.metrics.freeArea = Math.max(0, roomArea - totalFurnitureArea);
        results.metrics.occupancyPercentage = Math.round((totalFurnitureArea / roomArea) * 100);

        // 2. REGLA 1: Verificar si el objeto está fuera del cuarto (Límites X / Z)
        items.forEach(item => {
            const margin = 0.02; // Pequeño margen numérico para imprecisiones flotantes
            if (item.box.min.x < -halfW - margin || item.box.max.x > halfW + margin ||
                item.box.min.z < -halfL - margin || item.box.max.z > halfL + margin) {
                results.score -= 20;
                results.conflicts.push(
                    isEn 
                        ? `"${item.name}" exceeds the room boundaries.` 
                        : `"${item.name}" sobrepasa los límites de la habitación.`
                );
            }
        });

        // 3. REGLA 2: Verificar si un objeto está FLOTANDO en el aire sin soporte
        items.forEach(item => {
            if (item.pos.y > 0.1 && !item.isWallItem) {
                let supported = false;

                for (let other of items) {
                    if (other === item) continue;

                    const isOverlappingXZ = (
                        item.box.min.x < other.box.max.x &&
                        item.box.max.x > other.box.min.x &&
                        item.box.min.z < other.box.max.z &&
                        item.box.max.z > other.box.min.z
                    );

                    const isSupportedVertically = Math.abs(item.box.min.y - other.box.max.y) < 0.15 || item.pos.y >= (other.h * 0.7);

                    if (isOverlappingXZ && isSupportedVertically) {
                        supported = true;
                        break;
                    }
                }

                if (!supported) {
                    results.score -= 15;
                    results.conflicts.push(
                        isEn 
                            ? `"${item.name}" is floating in the air without a supporting surface.` 
                            : `"${item.name}" está flotando en el aire sin un mueble o superficie que lo sostenga.`
                    );
                }
            }
        });

        // 4. REGLA 3: Detección de Colisiones Reales (Volumétricas 3D)
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const itemA = items[i];
                const itemB = items[j];

                if (itemA.id.includes("ventana") && itemB.id.includes("ventana")) continue;

                const isStacked = (itemA.box.min.y >= itemB.box.max.y - 0.05) || (itemB.box.min.y >= itemA.box.max.y - 0.05);
                if (isStacked) continue;

                const boxA = itemA.box.clone().expandByScalar(-0.03);
                const boxB = itemB.box.clone().expandByScalar(-0.03);

                if (boxA.intersectsBox(boxB)) {
                    results.score -= 20;
                    results.conflicts.push(
                        isEn 
                            ? `Collision detected between "${itemA.name}" and "${itemB.name}".` 
                            : `Colisión e incrustación detectada entre "${itemA.name}" y "${itemB.name}".`
                    );
                }
            }
        }

        // 5. REGLA 4: Bloqueo de Puerta
        const doorObj = activeItems.find(item => item.userData?.isDoor);
        if (doorObj) {
            const doorBox = new THREE.Box3().setFromObject(doorObj).expandByScalar(0.15);
            items.forEach(item => {
                if (doorBox.intersectsBox(item.box)) {
                    results.score -= 25;
                    results.conflicts.push(
                        isEn 
                            ? `"${item.name}" blocks the door opening area.` 
                            : `"${item.name}" bloquea el área de apertura de la puerta.`
                    );
                }
            });
        }

        // 6. Sugerencias Ergonómicas
        if (results.metrics.occupancyPercentage > 45) {
            results.suggestions.push(
                isEn 
                    ? `The room is quite full (${results.metrics.occupancyPercentage}%). Try clearing walkway areas.` 
                    : `La habitación está bastante llena (${results.metrics.occupancyPercentage}%). Intenta liberar zonas de paso.`
            );
        }

        results.score = Math.max(0, Math.min(100, results.score));
        return results;
    }
};