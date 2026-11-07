// Local geometry checks, limited to intersections and room boundaries.
window.AIEngine = (() => {
    const CONTACT_TOLERANCE = 0.003; // Touching/supporting surfaces are allowed (3 mm).
    const BOUNDARY_TOLERANCE = 0.02;
    const localGeometry = new WeakMap();
    const worldGeometry = new WeakMap();

    function geometryParts(geometry) {
        const position = geometry.attributes.position;
        if (!position) return [];
        const cached = localGeometry.get(geometry);
        if (cached?.version === position.version && cached.indexVersion === geometry.index?.version) return cached.parts;
        const buckets = new Map();
        const add = (key, point) => {
            if (!buckets.has(key)) buckets.set(key, new Map());
            buckets.get(key).set(`${point.x},${point.y},${point.z}`, point);
        };
        // A ring is hollow: retain its individual tube segments instead of filling its center.
        const torus = geometry.type === "TorusGeometry" || geometry.type === "TorusBufferGeometry";
        const openCylinder = (geometry.type === "CylinderGeometry" || geometry.type === "CylinderBufferGeometry") && geometry.parameters.openEnded;
        if (torus || openCylinder) {
            const count = geometry.index ? geometry.index.count : position.count;
            const segments = torus ? geometry.parameters.tubularSegments : geometry.parameters.radialSegments;
            for (let i = 0; i < count; i += 3) {
                const triangle = [0, 1, 2].map(offset => new THREE.Vector3().fromBufferAttribute(position,
                    geometry.index ? geometry.index.getX(i + offset) : i + offset));
                const center = triangle.reduce((sum, point) => sum.add(point), new THREE.Vector3());
                const angle = (Math.atan2(torus ? center.y : center.z, center.x) + Math.PI * 2) % (Math.PI * 2);
                const key = Math.floor(angle / (Math.PI * 2) * segments);
                triangle.forEach(point => add(key, point));
            }
        } else {
            for (let i = 0; i < position.count; i++) add(0, new THREE.Vector3().fromBufferAttribute(position, i));
        }
        const parts = [...buckets.values()].map(points => [...points.values()]);
        localGeometry.set(geometry, { version: position.version, indexVersion: geometry.index?.version, parts });
        return parts;
    }

    function meshParts(mesh) {
        const matrix = mesh.matrixWorld.elements;
        const local = geometryParts(mesh.geometry);
        const cached = worldGeometry.get(mesh);
        if (cached?.local === local && cached.matrix.every((value, i) => value === matrix[i])) return cached.parts;
        const parts = local.map(vertices => {
            const points = vertices.map(point => point.clone().applyMatrix4(mesh.matrixWorld));
            return { points, box: new THREE.Box3().setFromPoints(points) };
        }).filter(part => !part.box.isEmpty());
        worldGeometry.set(mesh, { local, matrix: matrix.slice(), parts });
        return parts;
    }

    function collect(group) {
        group.updateWorldMatrix(true, true);
        const parts = [];
        function visit(node) {
            if (node !== group && !node.visible) return;
            if (node.isMesh && node.geometry && !node.userData.diagnosticIgnore
                && (Array.isArray(node.material) ? node.material.some(material => material.visible) : node.material?.visible)) {
                if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
                const size = node.geometry.boundingBox.getSize(new THREE.Vector3());
                // Ignore flat guides even after rotation gives their world box a volume.
                if (Math.min(size.x, size.y, size.z) > 1e-6) {
                    meshParts(node).forEach(part => parts.push({ ...part, mesh: node }));
                }
            }
            node.children.forEach(visit);
        }
        visit(group);
        const box = new THREE.Box3();
        parts.forEach(part => box.union(part.box));
        return { parts, box };
    }

    function boxesOverlap(a, b, tolerance = CONTACT_TOLERANCE) {
        return ["x", "y", "z"].every(axis => Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis]) > tolerance);
    }

    function support(a, b, direction) {
        const extreme = (points, sign) => {
            let best = points[0], projection = best.dot(direction) * sign;
            for (let i = 1; i < points.length; i++) {
                const candidate = points[i].dot(direction) * sign;
                if (candidate > projection) { best = points[i]; projection = candidate; }
            }
            return best;
        };
        return extreme(a.points, 1).clone().sub(extreme(b.points, -1));
    }

    function line(simplex, direction) {
        const a = simplex[simplex.length - 1], b = simplex[simplex.length - 2];
        const ab = b.clone().sub(a), ao = a.clone().negate();
        if (ab.dot(ao) > 0) {
            direction.crossVectors(ab, ao).cross(ab);
            if (direction.lengthSq() < 1e-20) {
                direction.crossVectors(ab, new THREE.Vector3(1, 0, 0));
                if (direction.lengthSq() < 1e-20) direction.crossVectors(ab, new THREE.Vector3(0, 1, 0));
            }
        } else {
            simplex.splice(0, simplex.length, a);
            direction.copy(ao);
        }
    }

    function triangle(simplex, direction) {
        const [c, b, a] = simplex;
        const ab = b.clone().sub(a), ac = c.clone().sub(a), ao = a.clone().negate();
        const normal = ab.clone().cross(ac);
        if (normal.clone().cross(ac).dot(ao) > 0) {
            if (ac.dot(ao) > 0) {
                simplex.splice(0, 3, c, a);
                line(simplex, direction);
            } else {
                simplex.splice(0, 3, b, a);
                line(simplex, direction);
            }
        } else if (ab.clone().cross(normal).dot(ao) > 0) {
            simplex.splice(0, 3, b, a);
            line(simplex, direction);
        } else if (normal.dot(ao) > 0) {
            direction.copy(normal);
        } else {
            simplex.splice(0, 3, b, c, a);
            direction.copy(normal).negate();
        }
    }

    // GJK tests convex mesh volumes directly, including rotated/scaled curved primitives.
    function intersects(a, b) {
        if (!boxesOverlap(a.box, b.box)) return false;
        const direction = b.box.getCenter(new THREE.Vector3()).sub(a.box.getCenter(new THREE.Vector3()));
        if (direction.lengthSq() < 1e-20) direction.set(1, 0, 0);
        const simplex = [support(a, b, direction)];
        direction.copy(simplex[0]).negate();
        if (direction.lengthSq() < 1e-20) direction.set(0, 1, 0);
        for (let iteration = 0; iteration < 64; iteration++) {
            direction.normalize();
            const point = support(a, b, direction);
            if (point.dot(direction) <= CONTACT_TOLERANCE) return false;
            simplex.push(point);
            if (simplex.length === 2) line(simplex, direction);
            else if (simplex.length === 3) triangle(simplex, direction);
            else {
                const [d, c, b, a] = simplex;
                const ao = a.clone().negate();
                let outside = false;
                for (const [first, second, opposite] of [[b, c, d], [c, d, b], [d, b, c]]) {
                    const normal = first.clone().sub(a).cross(second.clone().sub(a));
                    if (normal.dot(opposite.clone().sub(a)) > 0) normal.negate();
                    if (normal.dot(ao) > 0) {
                        simplex.splice(0, 4, second, first, a);
                        triangle(simplex, direction);
                        outside = true;
                        break;
                    }
                }
                if (!outside) return true;
            }
            // Ambiguous/degenerate geometry must not generate an unconfirmed warning.
            if (direction.lengthSq() < 1e-20) return false;
        }
        return false;
    }

    function analyzeScene() {
        const lang = window.currentLang || "es", isEn = lang === "en";
        const width = parseFloat(document.getElementById("room-width")?.value) || 4;
        const length = parseFloat(document.getElementById("room-length")?.value) || 3.5;
        const groups = typeof activeItems === "undefined" ? [] : activeItems;
        const occupied = groups.reduce((area, item) => area + (item.userData.isDoor ? 0 : (item.userData.w || 1) * (item.userData.l || 1)), 0);
        const results = { score: 100, conflicts: [], suggestions: [], metrics: {
            occupiedArea: occupied, freeArea: Math.max(0, width * length - occupied),
            occupancyPercentage: Math.round(occupied / (width * length) * 100)
        } };
        if (typeof wallEditing !== "undefined" && wallEditing) return results;
        const items = groups.map(group => {
            const data = group.userData || {};
            const name = typeof data.name === "string" ? data.name : data.name?.[lang] || data.name?.es || (isEn ? "Item" : "Objeto");
            return { ...collect(group), name, group };
        });
        items.forEach(item => {
            // Door handles can protrude through the room boundary; check the leaf itself.
            const boundaryParts = item.group.userData.isDoor ? item.parts.filter(part => part.mesh.name === "door-leaf") : item.parts;
            if (boundaryParts.some(({ box }) => box.min.x < -width / 2 - BOUNDARY_TOLERANCE || box.max.x > width / 2 + BOUNDARY_TOLERANCE
                || box.min.z < -length / 2 - BOUNDARY_TOLERANCE || box.max.z > length / 2 + BOUNDARY_TOLERANCE)) {
                results.conflicts.push(isEn ? `"${item.name}" exceeds the room boundaries.` : `"${item.name}" sobrepasa los límites de la habitación.`);
            }
            if (boundaryParts.some(({ box }) => box.min.y < -BOUNDARY_TOLERANCE)) {
                results.conflicts.push(isEn ? `"${item.name}" intersects the floor.` : `"${item.name}" está atravesando el piso.`);
            }
        });
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const a = items[i], b = items[j];
                if (boxesOverlap(a.box, b.box) && a.parts.some(partA => b.parts.some(partB => intersects(partA, partB)))) {
                    results.conflicts.push(isEn ? `"${a.name}" and "${b.name}" intersect.` : `"${a.name}" y "${b.name}" se están atravesando.`);
                }
            }
        }
        results.score = Math.max(0, 100 - results.conflicts.length * 20);
        return results;
    }
    return { analyzeScene };
})();
