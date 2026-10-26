// Generador de texturas procedimentales mediante Canvas 2D
const TextureFactory = {
    smoothWood: (baseHex = "#c084fc", grainHex = "#9333ea") => {
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext("2d");

        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, baseHex);
        grad.addColorStop(1, grainHex);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    fabric: (baseHex = "#2563eb") => {
        const canvas = document.createElement("canvas");
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        for (let x = 0; x < 256; x += 4) ctx.fillRect(x, 0, 2, 256);
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        for (let y = 0; y < 256; y += 4) ctx.fillRect(0, y, 256, 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    parquetFloor: () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;

        for (let y = 0; y <= 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
};

// Materiales globales de la escena
const Materials = {
    oakWood: new THREE.MeshStandardMaterial({ map: TextureFactory.smoothWood("#d97706", "#b45309"), roughness: 0.4 }),
    darkNogal: new THREE.MeshStandardMaterial({ map: TextureFactory.smoothWood("#451a03", "#270e02"), roughness: 0.5 }),
    cherryWood: new THREE.MeshStandardMaterial({ map: TextureFactory.smoothWood("#9a3412", "#7c2d12"), roughness: 0.4 }),
    whiteSheet: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#f8fafc"), roughness: 0.9 }),
    blueFabric: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#2563eb"), roughness: 0.8 }),
    emeraldFabric: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#059669"), roughness: 0.8 }),
    amberFabric: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#d97706"), roughness: 0.8 }),
    redFabric: new THREE.MeshStandardMaterial({ map: TextureFactory.fabric("#dc2626"), roughness: 0.8 }),
    blackLeather: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.2 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.8 }),
    chromeMetal: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.1, metalness: 0.95 }),
    skyAccent: new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x075985, emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.25 }),
    goldMetal: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 }),
    tvScreen: new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.1, metalness: 0.9 }),
    glassWindow: new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, roughness: 0.1, side: THREE.DoubleSide }),
    whiteFrame: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 }),
    darkPlastic: new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4 })
};
