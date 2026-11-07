const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

// Minimal scene objects: exercise wall/placement logic without a WebGL renderer.
class Vector3 {
    constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
    set(x, y, z) { Object.assign(this, { x, y, z }); return this; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    copy(v) { return this.set(v.x, v.y, v.z); }
}
class Group {
    constructor() {
        this.position = new Vector3();
        this.rotation = { y: 0 };
        this.scale = new Vector3(1, 1, 1);
        this.children = [];
        this.userData = {};
        this.visible = true;
    }
    add(child) { this.children.push(child); }
    traverse(fn) { fn(this); this.children.forEach(child => child.traverse(fn)); }
}
class Mesh extends Group {
    constructor(geometry, material) { super(); Object.assign(this, { geometry, material }); }
}
class Geometry { dispose() {} }
class Material { constructor(options) { Object.assign(this, options); } dispose() {} }

function environment() {
    let id = 0;
    const fields = { 'room-width': { value: '4' }, 'room-length': { value: '3.5' } };
    const context = vm.createContext({
        THREE: {
            Group, Mesh, LineSegments: Mesh, BoxGeometry: Geometry, EdgesGeometry: Geometry,
            MeshStandardMaterial: Material, LineBasicMaterial: Material, Vector3,
            Box3: class { constructor(min, max) { Object.assign(this, { min, max }); } },
            MathUtils: { clamp: (n, min, max) => Math.max(min, Math.min(n, max)),
                generateUUID: () => `wall-${++id}`, radToDeg: x => x * 180 / Math.PI, degToRad: x => x * Math.PI / 180 }
        },
        document: { getElementById: id => fields[id] || null },
        scene: { add() {}, remove() {} },
        activeItems: [], selectedMesh: null,
        onPointerUp() {}, updateSmartWallOpacity() {}, updateFurnitureFootprint() {}, updateDoorOpening() {}
    });
    context.window = context;
    for (const path of ['js/walls.js', 'js/placement.js', 'js/inspector.js']) {
        vm.runInContext(fs.readFileSync(path, 'utf8'), context);
    }
    const wall = context.createRoomWall({ placement: 'back' });
    const untouched = context.createRoomWall({ placement: 'left' });
    const door = new Group();
    door.position.set(0.4, 0, -1.6);
    door.userData = { isDoor: true, rotationY: 0, wallAttachment: { wallId: wall.userData.wallId, offset: 0.1, side: 1 } };
    const desk = new Group();
    desk.position.set(-1, 0.2, 0.5);
    desk.rotation.y = Math.PI / 2;
    desk.userData = { rotationY: Math.PI / 2, wallAttachment: { wallId: untouched.userData.wallId, offset: 0.1, side: 1 } };
    context.activeItems.push(door, desk);
    return { context, fields, wall, untouched, door, desk };
}
const transforms = items => items.map(item => ({ position: { ...item.position }, rotation: { ...item.rotation } }));

test('trying every placement, dimensions and drag keeps door and furniture hidden and stationary', () => {
    const { context: c, wall, door, desk } = environment();
    const before = transforms(c.activeItems);
    c.setWallEditing(true);
    c.selectFurniture(wall);
    for (const placement of ['front', 'right', 'back', 'left', 'free']) {
        c.updateSelectedWall('placement', placement);
        assert.equal(door.visible, false);
        assert.equal(desk.visible, false);
        assert.deepEqual(transforms(c.activeItems), before);
    }
    for (const [key, value] of [['angle', 45], ['length', 1.5], ['height', 3], ['x', 0.4], ['z', -0.3]]) {
        c.updateSelectedWall(key, value);
    }
    wall.position.x = 0.2;
    c.syncWallAttachedItems(); // Same synchronization as pointer drag.
    c.finishWallMove(wall);
    c.syncRoomWalls(4, 3.5);
    c.changeItemPlacement(door, () => { door.position.x = 99; });
    c.moveItemWithWalls(door, new Vector3(99, 0, 99));
    assert.deepEqual(transforms(c.activeItems), before);
    assert.equal(door.userData.wallAttachment, undefined);
    assert.ok(desk.userData.wallAttachment, 'an unchanged wall retains its attachment');
    c.setWallEditing(false);
    assert.equal(door.visible, true);
    assert.equal(desk.visible, true);
    assert.deepEqual(transforms(c.activeItems), before);
});

test('adding and deleting walls does not check or reposition hidden objects', () => {
    const { context: c, wall, door } = environment();
    const before = transforms(c.activeItems);
    c.itemIntersectsWall = () => { throw new Error('Hidden objects must not affect wall editing'); };
    c.addRoomWall();
    assert.equal(c.getRoomWallsData().length, 3);
    c.selectFurniture(wall);
    c.deleteSelected();
    assert.equal(c.getRoomWallsData().length, 2);
    c.setWallEditing(false);
    assert.equal(door.userData.wallAttachment, undefined);
    assert.deepEqual(transforms(c.activeItems), before);
});

test('repeated toggles preserve original visibility and unchanged attachments', () => {
    const { context: c, door, desk } = environment();
    desk.visible = false;
    c.setWallEditing(true);
    c.setWallEditing(true);
    c.setWallEditing(false);
    c.setWallEditing(false);
    assert.equal(door.visible, true);
    assert.equal(desk.visible, false);
    assert.ok(door.userData.wallAttachment);
    c.setWallEditing(true);
    c.setWallEditing(false);
    assert.equal(door.visible, true);
    assert.equal(desk.visible, false);
});

test('a previously stranded door recovers inside the room even if movement is blocked', () => {
    const { context: c, door } = environment();
    door.position.set(20, 0, 20);
    c.itemIntersectsWall = () => true; // Force the movement rollback path.
    c.moveItemWithWalls(door, new Vector3(20.1, 0, 20.1), false);
    assert.ok(door.position.x <= 2 - 0.44 + 1e-9 && door.position.x >= -2 + 0.44 - 1e-9);
    assert.ok(door.position.z <= 1.75 - 0.04 + 1e-9 && door.position.z >= -1.75 + 0.04 - 1e-9);
});

test('wall fields expose labeled minus/plus controls and apply their numeric step', () => {
    const { context: c, fields, wall } = environment();
    c.setWallEditing(true);
    c.selectFurniture(wall);
    const content = {};
    c.renderWallInspector(wall, content);
    for (const key of ['length', 'height', 'x', 'z', 'angle']) {
        assert.ok(content.innerHTML.includes(`id="wall-field-${key}"`));
        assert.ok(content.innerHTML.includes(`window.stepSelectedWall('${key}', -1)`));
        assert.ok(content.innerHTML.includes(`window.stepSelectedWall('${key}', 1)`));
    }
    fields['wall-field-height'] = { value: '2.2', stepUp(direction) { this.value = String(Number(this.value) + direction * 0.05); } };
    c.stepSelectedWall('height', 1);
    assert.equal(wall.userData.height, 2.25);
    c.stepSelectedWall('height', -1);
    assert.equal(wall.userData.height, 2.2);
    fields['wall-field-angle'] = { value: '0', stepUp(direction) { this.value = String(Number(this.value) + direction * 15); } };
    c.stepSelectedWall('angle', 1);
    assert.equal(wall.rotation.y, Math.PI / 12);
});
