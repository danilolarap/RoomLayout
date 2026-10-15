// js/ai-engine.js - Motor Local de Análisis Inteligente de Espacios

window.AIEngine = {
    analyzeScene: function() {
        const roomW = parseFloat(document.getElementById("room-width")?.value) || 4.0;
        const roomL = parseFloat(document.getElementById("room-length")?.value) || 3.5;
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
            results.suggestions.push("La habitación está vacía. Agrega muebles desde el catálogo para obtener un análisis.");
            return results;
        }

        // 1. Calcular Áreas Ocupadas y de Circulación
        let totalFurnitureArea = 0;
        const itemsBounding = [];

        activeItems.forEach(group => {
            const data = group.userData || {};
            if (data.isDoor) return; // Excluir puerta del área de muebles

            const w = data.w || 1;
            const l = data.l || 1;
            const area = w * l;
            totalFurnitureArea += area;

            // Obtener caja delimitadora en espacio mundial 2D (XZ)
            const box = new THREE.Box3().setFromObject(group);
            itemsBounding.push({
                group: group,
                name: data.name?.es || data.id || "Mueble",
                id: data.id,
                box: box,
                pos: group.position.clone(),
                w: w,
                l: l
            });
        });

        results.metrics.occupiedArea = totalFurnitureArea;
        results.metrics.freeArea = Math.max(0, roomArea - totalFurnitureArea);
        results.metrics.occupancyPercentage = Math.round((totalFurnitureArea / roomArea) * 100);

        // Penalización por saturación de espacio
        if (results.metrics.occupancyPercentage > 45) {
            results.score -= 20;
            results.conflicts.push(`Habitación sobrecargada (${results.metrics.occupancyPercentage}% ocupado). Se recomienda mantener menos del 40% para buena circulación.`);
        } else if (results.metrics.occupancyPercentage < 15 && activeItems.length > 1) {
            results.suggestions.push("Espacio muy despejado. Puedes integrar zonas adicionales como estudio o descanso.");
        }

        // 2. Detección de Colisiones entre Muebles
        for (let i = 0; i < itemsBounding.length; i++) {
            for (let j = i + 1; j < itemsBounding.length; j++) {
                const itemA = itemsBounding[i];
                const itemB = itemsBounding[j];

                // Reducir ligeramente el margen para evitar falsos positivos por contacto de bordes
                const boxA = itemA.box.clone().expandByScalar(-0.02);
                const boxB = itemB.box.clone().expandByScalar(-0.02);

                if (boxA.intersectsBox(boxB)) {
                    results.score -= 15;
                    results.conflicts.push(`Colisión detectada entre "${itemA.name}" y "${itemB.name}".`);
                }
            }
        }

        // 3. Verificación de Accesibilidad a la Puerta
        const doorObj = activeItems.find(item => item.userData?.isDoor);
        if (doorObj) {
            const doorBox = new THREE.Box3().setFromObject(doorObj).expandByScalar(0.2); // Área de apertura
            itemsBounding.forEach(item => {
                if (doorBox.intersectsBox(item.box)) {
                    results.score -= 25;
                    results.conflicts.push(`"${item.name}" bloquea el paso o la apertura de la puerta.`);
                }
            });
        }

        // 4. Análisis Ergonómico e Iluminación Solar
        const sunHour = parseFloat(document.getElementById("sun-time")?.value) || 12;
        
        itemsBounding.forEach(item => {
            // Pantallas / Monitores vs Luz Directa
            if (item.id === "monitor" || item.id === "pc_torre" || item.id?.includes("mueble_tv")) {
                if (sunHour >= 13 && sunHour <= 16 && item.pos.z < 0) {
                    results.suggestions.push(`"${item.name}" podría recibir reflejo solar directo por la tarde (13:00-16:00). Se sugiere reorientarlo.`);
                }
            }

            // Escritorios
            if (item.id?.includes("escritorio")) {
                results.suggestions.push(`Asegúrate de que la silla de "${item.name}" tenga al menos 0.8m libres hacia atrás para desplazarse cómodamente.`);
            }
        });

        // Asegurar que el puntaje permanezca entre 0 y 100
        results.score = Math.max(0, Math.min(100, results.score));

        return results;
    }
};