// Contacto con paredes: separación real de superficies, ajuste y arrastre continuo.
const wallContactGap = 0.008;
const wallSnapDistance = 0.12;
const placementBounds = new WeakMap();

function itemLocalBounds(item) {
    if (item.userData.isDoor) return new THREE.Box3(new THREE.Vector3(-0.44, 0, -0.04), new THREE.Vector3(0.44, 2, 0.04));
    if (placementBounds.has(item)) return placementBounds.get(item);
    item.updateWorldMatrix(true, true);
    const inverse = item.matrixWorld.clone().invert();
    const bounds = new THREE.Box3();
    item.traverse(child => {
        if (!child.isMesh || !child.geometry) return;
        if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
        bounds.union(child.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, child.matrixWorld)));
    });
    if (bounds.isEmpty()) bounds.set(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1, 0.5));
    placementBounds.set(item, bounds);
    return bounds;
}

function itemPlan(item) {
    const b = itemLocalBounds(item);
    const c = Math.cos(item.rotation.y), s = Math.sin(item.rotation.y);
    const x = (b.min.x + b.max.x) / 2, z = (b.min.z + b.max.z) / 2;
    return {
        x: item.position.x + c * x + s * z, z: item.position.z - s * x + c * z,
        tx: c, tz: -s, nx: s, nz: c,
        halfX: (b.max.x - b.min.x) / 2, halfZ: (b.max.z - b.min.z) / 2,
        bottom: item.position.y + b.min.y, top: item.position.y + b.max.y
    };
}

function planRadius(plan, x, z) {
    return plan.halfX * Math.abs(plan.tx * x + plan.tz * z) + plan.halfZ * Math.abs(plan.nx * x + plan.nz * z);
}

function wallFrame(wall) {
    const c = Math.cos(wall.rotation.y), s = Math.sin(wall.rotation.y);
    return { tx: c, tz: -s, nx: s, nz: c };
}

function wallInteriorSide(wall) {
    const f = wallFrame(wall);
    return wall.position.x * f.nx + wall.position.z * f.nz > 0 ? -1 : 1;
}

function itemIntersectsWall(item, wall) {
    const p = itemPlan(item), f = wallFrame(wall);
    if (p.bottom >= wall.userData.height || p.top <= 0) return false;
    const dx = p.x - wall.position.x, dz = p.z - wall.position.z;
    // Cuatro ejes separadores: funciona también con muebles y tabiques diagonales.
    return [[p.tx, p.tz], [p.nx, p.nz], [f.tx, f.tz], [f.nx, f.nz]].every(([x, z]) => {
        const wallRadius = wall.userData.length / 2 * Math.abs(f.tx * x + f.tz * z)
            + (wallThickness / 2 + wallContactGap) * Math.abs(f.nx * x + f.nz * z);
        return Math.abs(dx * x + dz * z) < planRadius(p, x, z) + wallRadius - 1e-6;
    });
}

function clampItemToRoom(item) {
    const size = wallRoomSize(), p = itemPlan(item);
    const rx = planRadius(p, 1, 0), rz = planRadius(p, 0, 1);
    const cx = rx <= size.width / 2 ? THREE.MathUtils.clamp(p.x, -size.width / 2 + rx, size.width / 2 - rx) : 0;
    const cz = rz <= size.length / 2 ? THREE.MathUtils.clamp(p.z, -size.length / 2 + rz, size.length / 2 - rz) : 0;
    item.position.x += cx - p.x;
    item.position.z += cz - p.z;
}

function shouldAlignItemToWall(item) {
    const id = item.userData.id || "";
    // La puerta conserva su orientación manual; el contacto solo ajusta su posición.
    return !item.userData.isDoor && (id.includes("ventana") || ["reloj_pared", "barra_pared", "cortinas"].includes(id));
}

function trySnapItemToWall(item, preferredWallId) {
    const p = itemPlan(item);
    const candidates = roomWalls.map(wall => {
        const f = wallFrame(wall);
        const dx = p.x - wall.position.x, dz = p.z - wall.position.z;
        const normal = dx * f.nx + dz * f.nz;
        const tangent = dx * f.tx + dz * f.tz;
        const gap = Math.abs(normal) - planRadius(p, f.nx, f.nz) - wallThickness / 2;
        return { wall, f, normal, tangent, gap };
    }).filter(({ wall, f, tangent, gap }) => p.bottom < wall.userData.height && p.top > 0
        && Math.abs(tangent) < wall.userData.length / 2 + planRadius(p, f.tx, f.tz)
        && gap >= -0.001 && gap <= wallSnapDistance).sort((a, b) =>
            Number(b.wall.userData.wallId === preferredWallId) - Number(a.wall.userData.wallId === preferredWallId) || a.gap - b.gap);
    for (const candidate of candidates) {
        const { wall, f, normal } = candidate;
        const previous = item.position.clone(), rotation = item.rotation.y;
        const side = Math.abs(normal) > 1e-6 ? Math.sign(normal) : wallInteriorSide(wall);
        if (shouldAlignItemToWall(item)) {
            item.rotation.y = wall.rotation.y + (side < 0 ? Math.PI : 0);
            item.userData.rotationY = item.rotation.y;
        }
        const shape = itemPlan(item);
        const tangent = (shape.x - wall.position.x) * f.tx + (shape.z - wall.position.z) * f.tz;
        const tangentRadius = planRadius(shape, f.tx, f.tz);
        if (item.userData.isDoor && tangentRadius * 2 > wall.userData.length) {
            item.rotation.y = rotation;
            item.userData.rotationY = rotation;
            continue;
        }
        const maxTangent = Math.max(0, wall.userData.length / 2 - tangentRadius);
        const offset = THREE.MathUtils.clamp(tangent, -maxTangent, maxTangent);
        const distance = side * (wallThickness / 2 + wallContactGap + planRadius(shape, f.nx, f.nz));
        item.position.x += wall.position.x + f.tx * offset + f.nx * distance - shape.x;
        item.position.z += wall.position.z + f.tz * offset + f.nz * distance - shape.z;
        clampItemToRoom(item);
        if (!roomWalls.some(other => itemIntersectsWall(item, other))) {
            item.userData.wallAttachment = { wallId: wall.userData.wallId, offset: offset / wall.userData.length, side };
            if (item.userData.isDoor) updateDoorOpening(item);
            return true;
        }
        item.position.copy(previous);
        item.rotation.y = rotation;
        item.userData.rotationY = rotation;
    }
    return false;
}

function moveItemWithWalls(item, target, snap = true) {
    const attachment = item.userData.wallAttachment;
    delete item.userData.wallAttachment;
    const start = item.position.clone();
    const steps = Math.max(1, Math.ceil(Math.hypot(target.x - start.x, target.z - start.z) / 0.04));
    for (let step = 1; step <= steps; step++) {
        const previous = item.position.clone(), before = itemPlan(item);
        item.position.x = previous.x + (target.x - start.x) / steps;
        item.position.z = previous.z + (target.z - start.z) / steps;
        clampItemToRoom(item);
        for (let pass = 0; pass < 6; pass++) {
            let corrected = false;
            roomWalls.forEach(wall => {
                if (!itemIntersectsWall(item, wall)) return;
                const f = wallFrame(wall), p = itemPlan(item);
                const oldDistance = (before.x - wall.position.x) * f.nx + (before.z - wall.position.z) * f.nz;
                const side = attachment?.wallId === wall.userData.wallId ? attachment.side
                    : Math.abs(oldDistance) > 1e-6 ? Math.sign(oldDistance) : wallInteriorSide(wall);
                const distance = (p.x - wall.position.x) * f.nx + (p.z - wall.position.z) * f.nz;
                const correction = side * (planRadius(p, f.nx, f.nz) + wallThickness / 2 + wallContactGap) - distance;
                item.position.x += f.nx * correction;
                item.position.z += f.nz * correction;
                clampItemToRoom(item);
                corrected = true;
            });
            if (!corrected) break;
        }
        if (roomWalls.some(wall => itemIntersectsWall(item, wall))) {
            item.position.copy(previous);
            break;
        }
    }
    if (snap) trySnapItemToWall(item, attachment?.wallId);
    if (item.userData.isDoor) updateDoorOpening(item);
}

