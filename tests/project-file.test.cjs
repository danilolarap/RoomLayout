const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { webcrypto } = require('node:crypto');

function environment() {
    const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, DataView, Blob, crypto: webcrypto, setTimeout });
    context.window = context;
    vm.runInContext(fs.readFileSync('js/projects/project-file.js', 'utf8'), context);
    return context;
}

const fixture = () => ({
    room: { width: 4, length: 3.5, sunTime: 15.5, walls: [
        { wallId: 'wall-1', placement: 'back', edgeStart: -0.5, edgeEnd: 0.5, length: 4, height: 2.2, x: 0, z: -1.75, rotationY: 0 }
    ] },
    items: [{ id: 'mesa_noche', name: { es: 'Mesa de noche', en: 'Nightstand' }, w: 0.55, l: 0.55, h: 0.55,
        color: 0xb45309, customColor: '#ff0088', icon: 'fa-box', isDoor: false,
        position: { x: 1, y: 0.2, z: -1.4 }, rotationY: Math.PI / 2,
        wallAttachment: { wallId: 'wall-1', offset: 0.25, side: 1 } },
    { id: 'puerta_movil', name: { es: 'Puerta', en: 'Door' }, w: 0.9, l: 0.9, h: 2,
        color: 0xf59e0b, customColor: null, isDoor: true, doorHinge: 'right', doorOpening: 'outward',
        position: { x: 0, y: 0, z: 1 }, rotationY: 0 }]
});
const file = (bytes, name = 'diseno.roomlayout') => new File([bytes], name);
const code = expected => error => error.message === expected;

test('portable round trip preserves the full scene across independent app instances', async () => {
    const writer = environment().RoomLayoutFile;
    const reader = environment().RoomLayoutFile;
    const scene = fixture();
    const blob = await writer.encode('Habitación 🌙', scene);
    const opened = await reader.decode(file(blob, 'DISENO.ROOMLAYOUT'));
    assert.deepEqual(JSON.parse(JSON.stringify(opened)), { application: 'RoomLayout', name: 'Habitación 🌙', scene });
});

test('rejects renamed JSON, wrong extensions, truncation, tampering and future versions', async () => {
    const api = environment().RoomLayoutFile;
    const blob = await api.encode('Room', fixture());
    await assert.rejects(api.decode(file(blob, 'room.json')), code('extension'));
    await assert.rejects(api.decode(file(JSON.stringify(fixture()))), code('invalid'));
    await assert.rejects(api.decode(file(await blob.slice(0, -1).arrayBuffer())), code('invalid'));
    const tampered = new Uint8Array(await blob.arrayBuffer());
    tampered[tampered.length - 3] ^= 1;
    await assert.rejects(api.decode(file(tampered)), code('integrity'));
    const future = new Uint8Array(await blob.arrayBuffer());
    future[12] = 2;
    await assert.rejects(api.decode(file(future)), code('version'));
    await assert.rejects(api.decode(file(new Uint8Array(10 * 1024 * 1024 + 1))), code('size'));
});

test('valid checksum does not bypass schema validation', async () => {
    const api = environment().RoomLayoutFile;
    const scene = fixture();
    scene.items[0].position.x = 'invalid';
    const payload = new TextEncoder().encode(JSON.stringify({ application: 'RoomLayout', name: 'Room', scene }));
    const bytes = new Uint8Array(49 + payload.length);
    bytes.set(new TextEncoder().encode('ROOMLAYOUT\r\n'));
    bytes[12] = 1;
    new DataView(bytes.buffer).setUint32(13, payload.length);
    bytes.set(new Uint8Array(await webcrypto.subtle.digest('SHA-256', payload)), 17);
    bytes.set(payload, 49);
    await assert.rejects(api.decode(file(bytes)), code('invalid'));
});

test('invalid geometry and broken wall references cannot be exported', async () => {
    const api = environment().RoomLayoutFile;
    const scene = fixture();
    scene.items[0].wallAttachment.wallId = 'missing';
    await assert.rejects(api.encode('Room', scene), code('invalid'));
    scene.items = [];
    scene.room.width = Infinity;
    await assert.rejects(api.encode('Room', scene), code('invalid'));
});

test('UI downloads for guests and never overwrites a local project after import', async () => {
    const context = environment();
    const elements = Object.fromEntries(['btn-save-project', 'btn-export-project', 'file-import-project', 'projects-modal'].map(id =>
        [id, { disabled: false, value: 'selected', classList: { add() {} } }]));
    context.document = { getElementById: id => elements[id] };
    context.prompt = () => 'Room';
    context.alert = () => {};
    context.getSceneData = fixture;
    let downloads = 0;
    let loaded;
    const api = context.RoomLayoutFile;
    context.RoomLayoutFile = { ...api, download() { downloads++; } };
    context.loadSceneData = data => { loaded = data; };
    vm.runInContext(fs.readFileSync('js/projects/projects-ui.js', 'utf8'), context);
    context.initProjectsUI();
    await elements['btn-save-project'].onclick();
    assert.equal(downloads, 1);
    assert.equal(elements['btn-save-project'].disabled, false);
    context.currentProjectId = 123;
    const input = elements['file-import-project'];
    input.files = [file(await api.encode('Imported', fixture()))];
    await input.onchange();
    assert.ok(loaded);
    assert.equal(context.currentProjectId, null);
    assert.equal(context.currentProjectName, 'Imported');
    assert.equal(input.value, '');
    loaded = undefined;
    context.currentProjectId = 456;
    input.files = [file('{}')];
    await input.onchange();
    assert.equal(loaded, undefined);
    assert.equal(context.currentProjectId, 456);
    assert.equal(input.disabled, false);
});
