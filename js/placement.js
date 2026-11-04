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

