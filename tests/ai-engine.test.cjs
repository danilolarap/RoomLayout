const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const THREE = require('three');

function environment() {
    const context = vm.createContext({ THREE, activeItems: [], wallEditing: false,
        document: { getElementById: () => ({ value: '6' }) } });
    context.window = context;
    const material = new THREE.MeshBasicMaterial();
    context.Materials = new Proxy({}, { get: () => material });
    for (const path of [...fs.readdirSync('js/furniture/details').map(name => `js/furniture/details/${name}`),
        'js/furniture-builder.js', 'js/catalog.js', 'js/ai-engine.js']) {
        vm.runInContext(fs.readFileSync(path, 'utf8'), context);
    }
    const add = (geometry, name = 'Object') => {
        const group = new THREE.Group();
        group.add(new THREE.Mesh(geometry, material));
        group.userData = { name, w: 1, l: 1 };
        context.activeItems.push(group);
        return group;
    };
    return { context, add, analyze: () => context.AIEngine.analyzeScene() };
}

test('the real office chair fits in the L desk opening; crossing the tabletop still warns', () => {
    const { context: c, analyze } = environment();
    const deskData = { id: 'escritorio_l', name: 'Escritorio', w: 1.6, h: 0.75, l: 1.4 };
    const chairData = { id: 'silla_ergonomica', name: 'Silla', w: 0.6, h: 1.1, l: 0.6 };
    const desk = c.createDetailedFurniture(deskData), chair = c.createDetailedFurniture(chairData);
    desk.userData = deskData;
    chair.userData = chairData;
    chair.position.set(0.35, 0, 0.32);
    c.activeItems.push(desk, chair);
    assert.ok(new THREE.Box3().setFromObject(desk).intersectsBox(new THREE.Box3().setFromObject(chair)), 'reproduces the old bounding-box false positive');
    assert.equal(analyze().conflicts.length, 0);
    chair.position.z = -0.2;
    assert.equal(analyze().conflicts.length, 1);
});

test('rotated thin objects are checked in their own orientation, not their enclosing boxes', () => {
    const { add, analyze } = environment();
    const a = add(new THREE.BoxGeometry(1.5, 0.1, 0.05), 'A');
    const b = add(new THREE.BoxGeometry(1.5, 0.1, 0.05), 'B');
    a.position.y = b.position.y = 0.5;
    a.rotation.y = b.rotation.y = Math.PI / 4;
    b.position.x = b.position.z = Math.SQRT1_2 * 0.1;
    assert.equal(analyze().conflicts.length, 0);
    b.position.x = b.position.z = 0;
    assert.equal(analyze().conflicts.length, 1);
});

test('surface contact and tiny numerical penetrations are allowed; thin real intersections warn', () => {
    const { add, analyze } = environment();
    const table = add(new THREE.BoxGeometry(1, 0.05, 1), 'Table');
    table.position.y = 0.725;
    const laptop = add(new THREE.BoxGeometry(0.3, 0.02, 0.2), 'Laptop');
    laptop.position.y = 0.76;
    assert.equal(analyze().conflicts.length, 0);
    laptop.position.y -= 0.001;
    assert.equal(analyze().conflicts.length, 0);
    laptop.position.y -= 0.015;
    assert.equal(analyze().conflicts.length, 1);
});

test('curved meshes do not collide only because their boxes overlap', () => {
    const { add, analyze } = environment();
    const a = add(new THREE.SphereGeometry(0.25, 16, 12));
    const b = add(new THREE.SphereGeometry(0.25, 16, 12));
    a.position.y = b.position.y = 0.5;
    b.position.set(0.4, 0.5, 0.4);
    assert.equal(analyze().conflicts.length, 0);
    b.position.x = b.position.z = 0.2;
    assert.equal(analyze().conflicts.length, 1);
});

test('ring holes stay empty and an object passing through the rim warns', () => {
    const { add, analyze } = environment();
    const ring = add(new THREE.TorusGeometry(0.5, 0.04, 8, 24));
    ring.position.y = 1;
    const ball = add(new THREE.SphereGeometry(0.06, 12, 8));
    ball.position.y = 1;
    assert.equal(analyze().conflicts.length, 0);
    ball.position.x = 0.5;
    assert.equal(analyze().conflicts.length, 1);
});

test('complete containment is an overlap and each pair produces only one comment', () => {
    const { add, analyze } = environment();
    const outer = add(new THREE.BoxGeometry(1, 1, 1));
    const inner = add(new THREE.BoxGeometry(0.1, 0.1, 0.1));
    outer.position.y = inner.position.y = 1;
    inner.add(inner.children[0].clone());
    assert.equal(analyze().conflicts.length, 1);
});

test('empty, floating or crowded rooms produce no unsolicited comments', () => {
    const { add, analyze } = environment();
    assert.equal(analyze().suggestions.length, 0);
    const floating = add(new THREE.BoxGeometry(0.1, 0.1, 0.1));
    floating.position.y = 2;
    floating.userData.w = floating.userData.l = 6; // Occupancy should not affect diagnosis.
    assert.equal(analyze().conflicts.length, 0);
    assert.equal(analyze().suggestions.length, 0);
    assert.equal(analyze().score, 100);
});

test('detects physical bounds including rotation, elevation below floor and the door', () => {
    const { add, analyze } = environment();
    const item = add(new THREE.BoxGeometry(0.4, 0.4, 0.4));
    item.position.set(2.79, 0.2, 0);
    assert.equal(analyze().conflicts.length, 0);
    item.rotation.y = Math.PI / 4;
    assert.equal(analyze().conflicts.length, 1);
    item.position.set(0, 0.1, 0);
    assert.equal(analyze().conflicts.length, 1);
    item.userData.isDoor = true;
    item.children[0].name = 'door-leaf';
    item.position.set(4, 0.2, 0);
    assert.equal(analyze().conflicts.length, 1);
});

test('door opening helpers and proximity do not warn; the actual leaf can collide', () => {
    const { add, analyze } = environment();
    const door = add(new THREE.BoxGeometry(0.88, 2, 0.08), 'Door');
    door.position.y = 1;
    door.userData.isDoor = true;
    door.children[0].name = 'door-leaf';
    const helper = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial());
    helper.userData.diagnosticIgnore = true;
    door.add(helper);
    const item = add(new THREE.BoxGeometry(0.1, 0.1, 0.1));
    item.position.set(0, 0.5, 0.2);
    assert.equal(analyze().conflicts.length, 0);
    item.position.z = 0;
    assert.equal(analyze().conflicts.length, 1);
});

test('diagnostics pause during wall editing and update after transforms change', () => {
    const { context: c, add, analyze } = environment();
    const a = add(new THREE.BoxGeometry(1, 1, 1));
    const b = add(new THREE.BoxGeometry(1, 1, 1));
    a.position.y = b.position.y = 1;
    assert.equal(analyze().conflicts.length, 1);
    c.wallEditing = true;
    assert.equal(analyze().conflicts.length, 0);
    c.wallEditing = false;
    b.position.x = 2;
    assert.equal(analyze().conflicts.length, 0);
    b.position.x = 0.5;
    assert.equal(analyze().conflicts.length, 1);
});

test('open containers keep their interior empty; crossing their sides warns', () => {
    const { add, analyze } = environment();
    const basket = add(new THREE.CylinderGeometry(0.5, 0.4, 0.8, 8, 1, true));
    basket.position.y = 0.4;
    const ball = add(new THREE.SphereGeometry(0.05, 12, 8));
    ball.position.y = 0.4;
    assert.equal(analyze().conflicts.length, 0);
    ball.position.x = 0.45;
    assert.equal(analyze().conflicts.length, 1);
});

test('no-conflict UI stays silent and conflict comments clear after correction', () => {
    const { context: c, add } = environment();
    class Element {
        constructor() { this.children = []; this.span = {}; }
        set innerHTML(value) { this.html = value; this.children = []; }
        get innerHTML() { return this.html; }
        appendChild(child) { this.children.push(child); }
        querySelector() { return this.span; }
    }
    const panel = new Element(), badge = new Element();
    c.document = {
        getElementById: id => id === 'diagnostic-box' ? panel : id === 'ai-score-badge' ? badge : { value: '6' },
        createElement: () => new Element()
    };
    vm.runInContext(fs.readFileSync('js/ui.js', 'utf8'), c);
    c.runAIDiagnostic();
    assert.equal(panel.hidden, true);
    assert.equal(panel.children.length, 0);
    const a = add(new THREE.BoxGeometry(1, 1, 1), '<b>Object</b>');
    const b = add(new THREE.BoxGeometry(1, 1, 1), 'Other');
    a.position.y = b.position.y = 1;
    c.runAIDiagnostic();
    assert.equal(panel.hidden, false);
    assert.equal(panel.children.length, 1);
    assert.ok(panel.children[0].span.textContent.includes('<b>Object</b>'));
    assert.ok(!panel.children[0].innerHTML.includes('<b>Object</b>'));
    b.position.x = 2;
    c.runAIDiagnostic();
    assert.equal(panel.hidden, true);
    assert.equal(panel.children.length, 0);
});

test('convex intersection agrees with an independent box SAT oracle under rotation and reflection', () => {
    const { add, analyze } = environment();
    const a = add(new THREE.BoxGeometry(1, 0.6, 0.8));
    const b = add(new THREE.BoxGeometry(0.7, 1.1, 0.9));
    let seed = 12345;
    const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
    function box(group, halfSize) {
        const matrix = group.matrixWorld;
        const axes = [0, 1, 2].map(i => new THREE.Vector3().setFromMatrixColumn(matrix, i).normalize());
        const scale = new THREE.Vector3().setFromMatrixScale(matrix);
        return { axes, half: halfSize.map((value, i) => value * Math.abs(scale.getComponent(i))), center: group.position };
    }
    for (let i = 0; i < 250; i++) {
        for (const group of [a, b]) {
            group.position.set(random() * 2 - 1, 1.5 + random() * 0.5, random() * 2 - 1);
            group.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
            group.scale.set(random() > 0.5 ? -1 : 1, 0.8 + random() * 0.4, 0.8 + random() * 0.4);
            group.updateWorldMatrix(true, true);
        }
        const boxA = box(a, [0.5, 0.3, 0.4]), boxB = box(b, [0.35, 0.55, 0.45]);
        const axes = [...boxA.axes, ...boxB.axes, ...boxA.axes.flatMap(x => boxB.axes.map(y => x.clone().cross(y)))];
        const delta = boxB.center.clone().sub(boxA.center);
        const radius = (box, axis) => box.axes.reduce((sum, basis, i) => sum + box.half[i] * Math.abs(basis.dot(axis)), 0);
        let penetration = Infinity;
        for (const axis of axes) {
            if (axis.lengthSq() < 1e-10) continue;
            axis.normalize();
            penetration = Math.min(penetration, radius(boxA, axis) + radius(boxB, axis) - Math.abs(delta.dot(axis)));
        }
        if (Math.abs(penetration) < 0.01) continue;
        assert.equal(analyze().conflicts.length > 0, penetration > 0, `case ${i}, penetration ${penetration}`);
    }
});
