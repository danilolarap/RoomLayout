// Portable RoomLayout container: magic, version, payload length, SHA-256, UTF-8 payload.
// The checksum detects corruption; it is not a proof of origin or encryption.
window.RoomLayoutFile = (() => {
    const MAGIC = new TextEncoder().encode("ROOMLAYOUT\r\n");
    const HEADER_SIZE = MAGIC.length + 1 + 4 + 32;
    const MAX_BYTES = 10 * 1024 * 1024;
    const fail = code => { throw new Error(code); };
    const record = value => value && typeof value === "object" && !Array.isArray(value);
    const number = (value, min, max) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
    const text = (value, max = 200) => typeof value === "string" && value.length <= max;

    function validateScene(data) {
        if (!record(data) || !record(data.room) || !Array.isArray(data.items)) fail("invalid");
        const room = data.room;
        if (!number(room.width, 2, 15) || !number(room.length, 2, 15) || !number(room.sunTime, 6, 18)
            || !Array.isArray(room.walls) || room.walls.length > 500 || data.items.length > 2000) fail("invalid");
        const wallIds = new Set();
        room.walls.forEach(wall => {
            if (!record(wall) || !text(wall.wallId) || !wall.wallId || wallIds.has(wall.wallId)
                || !["free", "back", "front", "left", "right"].includes(wall.placement)
                || !number(wall.length, 0.25, 100) || !number(wall.height, 0.25, 4)
                || !number(wall.x, -100, 100) || !number(wall.z, -100, 100)
                || !number(wall.rotationY, -1e6, 1e6)
                || !number(wall.edgeStart, -0.5, 0.5) || !number(wall.edgeEnd, -0.5, 0.5)
                || wall.edgeStart >= wall.edgeEnd) fail("invalid");
            wallIds.add(wall.wallId);
        });
        data.items.forEach(item => {
            if (!record(item) || !text(item.id) || !item.id || !record(item.position)
                || !number(item.w, 0.001, 100) || !number(item.l, 0.001, 100) || !number(item.h, 0.001, 100)
                || !number(item.color, 0, 0xffffff) || !Number.isInteger(item.color)
                || !number(item.position.x, -100, 100) || !number(item.position.y, -100, 100)
                || !number(item.position.z, -100, 100) || !number(item.rotationY, -1e6, 1e6)
                || (item.isDoor !== undefined && typeof item.isDoor !== "boolean")
                || (item.customColor != null && !/^#[0-9a-f]{6}$/i.test(item.customColor))
                || (item.icon !== undefined && !text(item.icon))
                || (item.name !== undefined && !text(item.name) && !(record(item.name) && text(item.name.es) && text(item.name.en)))
                || (item.doorHinge !== undefined && !["left", "right"].includes(item.doorHinge))
                || (item.doorOpening !== undefined && !["inward", "outward"].includes(item.doorOpening))) fail("invalid");
            if (item.wallAttachment != null) {
                const attachment = item.wallAttachment;
                if (!record(attachment) || !wallIds.has(attachment.wallId)
                    || !number(attachment.offset, -0.5, 0.5) || ![-1, 1].includes(attachment.side)) fail("invalid");
            }
        });
        return data;
    }

    async function checksum(bytes) {
        if (!globalThis.crypto?.subtle) fail("crypto");
        return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    }

    async function encode(name, scene) {
        validateScene(scene);
        if (!text(name) || !name.trim()) fail("invalid");
        const payload = new TextEncoder().encode(JSON.stringify({ application: "RoomLayout", name, scene }));
        if (payload.length + HEADER_SIZE > MAX_BYTES) fail("size");
        const bytes = new Uint8Array(HEADER_SIZE + payload.length);
        bytes.set(MAGIC);
        bytes[MAGIC.length] = 1;
        new DataView(bytes.buffer).setUint32(MAGIC.length + 1, payload.length);
        bytes.set(await checksum(payload), MAGIC.length + 5);
        bytes.set(payload, HEADER_SIZE);
        return new Blob([bytes], { type: "application/x-roomlayout" });
    }

    async function decode(file) {
        if (!/\.roomlayout$/i.test(file.name)) fail("extension");
        if (file.size > MAX_BYTES) fail("size");
        if (file.size < HEADER_SIZE) fail("invalid");
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!MAGIC.every((value, i) => bytes[i] === value)) fail("invalid");
        if (bytes[MAGIC.length] !== 1) fail("version");
        if (new DataView(bytes.buffer).getUint32(MAGIC.length + 1) !== bytes.length - HEADER_SIZE) fail("invalid");
        const payload = bytes.subarray(HEADER_SIZE);
        const hash = await checksum(payload);
        if (!hash.every((value, i) => bytes[MAGIC.length + 5 + i] === value)) fail("integrity");
        let project;
        try { project = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(payload)); }
        catch { fail("invalid"); }
        if (!record(project) || project.application !== "RoomLayout" || !text(project.name) || !project.name.trim()) fail("invalid");
        validateScene(project.scene);
        return project;
    }

    function download(blob, name) {
        const filename = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/[. ]+$/g, "").slice(0, 100) || "RoomLayout";
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${filename}.roomlayout`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return Object.freeze({ encode, decode, download });
})();
