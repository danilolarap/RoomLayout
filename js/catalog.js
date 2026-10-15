// Catálogo de muebles bilingüe actualizado
const FURNITURE_CATALOG = [
    {
        category: { es: "Básicos del Cuarto", en: "Bedroom Basics" },
        items: [
            { id: "cama_king", name: { es: "Cama King", en: "King Bed" }, w: 2.0, l: 2.0, h: 0.65, color: 0x1d4ed8, icon: "fa-bed" },
            { id: "cama_queen", name: { es: "Cama Queen", en: "Queen Bed" }, w: 1.6, l: 2.0, h: 0.6, color: 0x059669, icon: "fa-bed" },
            { id: "cama_sencilla", name: { es: "Cama Individual", en: "Single Bed" }, w: 1.0, l: 1.9, h: 0.5, color: 0xd97706, icon: "fa-bed" },
            { id: "mesa_noche", name: { es: "Mesa de Noche", en: "Nightstand" }, w: 0.45, l: 0.45, h: 0.5, color: 0xb45309, icon: "fa-box" },
            { id: "armario_doble", name: { es: "Armario 2 Puertas", en: "2-Door Wardrobe" }, w: 1.2, l: 0.6, h: 2.0, color: 0x78350f, icon: "fa-door-closed" },
            { id: "armario_3p", name: { es: "Armario 3 Puertas", en: "3-Door Wardrobe" }, w: 1.8, l: 0.6, h: 2.0, color: 0x78350f, icon: "fa-door-closed" },
            { id: "armario_4p", name: { es: "Armario 4 Puertas", en: "4-Door Wardrobe" }, w: 2.4, l: 0.6, h: 2.0, color: 0x78350f, icon: "fa-door-closed" }
        ]
    },
    {
        category: { es: "Estudio & Oficina", en: "Study & Office" },
        items: [
            { id: "escritorio_l", name: { es: "Escritorio Tipo L", en: "L-Shaped Desk" }, w: 1.6, l: 1.4, h: 0.75, color: 0xd97706, icon: "fa-laptop" },
            { id: "escritorio_recto", name: { es: "Escritorio Recto", en: "Straight Desk" }, w: 1.2, l: 0.7, h: 0.75, color: 0xf59e0b, icon: "fa-laptop" },
            { id: "silla_ergonomica", name: { es: "Silla de Oficina", en: "Office Chair" }, w: 0.6, l: 0.6, h: 1.1, color: 0xea580c, icon: "fa-chair" }
        ]
    },
    {
        category: { es: "Electrónica & Periféricos", en: "Electronics & Gadgets" },
        items: [
            { id: "laptop", name: { es: "Laptop Portátil", en: "Laptop" }, w: 0.38, l: 0.28, h: 0.2, color: 0x9ca3af, icon: "fa-laptop" },
            { id: "pc_torre", name: { es: "Torre PC Gaming", en: "PC Tower" }, w: 0.25, l: 0.45, h: 0.5, color: 0x111827, icon: "fa-server" },
            { id: "monitor", name: { es: "Monitor 27\"", en: "27\" Monitor" }, w: 0.62, l: 0.18, h: 0.45, color: 0x030712, icon: "fa-desktop" },
            { id: "mouse", name: { es: "Mouse & Pad", en: "Mouse & Pad" }, w: 0.22, l: 0.28, h: 0.03, color: 0x374151, icon: "fa-computer-mouse" }
        ]
    },
    {
        category: { es: "Entretenimiento & Confort", en: "Entertainment & Comfort" },
        items: [
            { id: "mueble_tv_grande", name: { es: "Mueble TV 65\"", en: "TV Stand 65\"" }, w: 1.8, l: 0.45, h: 0.5, color: 0xc2410c, icon: "fa-tv" },
            { id: "mueble_tv", name: { es: "Mueble TV 55\"", en: "TV Stand 55\"" }, w: 1.4, l: 0.4, h: 0.5, color: 0xea580c, icon: "fa-tv" },
            { id: "sofa_1p", name: { es: "Sofá 1 Puesto", en: "Armchair (1-Seater)" }, w: 0.9, l: 0.85, h: 0.8, color: 0x2563eb, icon: "fa-couch" },
            { id: "sofa_2p", name: { es: "Sofá 2 Puestos", en: "2-Seater Sofa" }, w: 1.6, l: 0.85, h: 0.8, color: 0x2563eb, icon: "fa-couch" }
        ]
    },
    {
        category: { es: "Fitness & Ejercicio", en: "Fitness & Workout" },
        items: [
            { id: "caminadora", name: { es: "Caminadora Eléctrica", en: "Treadmill" }, w: 0.8, l: 1.6, h: 1.3, color: 0x111827, icon: "fa-person-walking" },
            { id: "barra_pared", name: { es: "Barra Dominadas (Pared)", en: "Wall Pull-Up Bar" }, w: 1.0, l: 0.5, h: 0.4, color: 0x1f2937, icon: "fa-dumbbell" },
            { id: "rack_mancuernas", name: { es: "Rack Mancuernas", en: "Dumbbell Rack" }, w: 1.1, l: 0.5, h: 0.8, color: 0xd97706, icon: "fa-dumbbell" },
            { id: "banco_plano", name: { es: "Banco Plano", en: "Flat Bench" }, w: 1.2, l: 0.45, h: 0.4, color: 0xb45309, icon: "fa-cubes" }
        ]
    },
    {
        category: { es: "Decoración & Pared", en: "Decor & Wall Objects" },
        items: [
            { id: "reloj_pared", name: { es: "Reloj de Pared", en: "Wall Clock" }, w: 0.4, l: 0.1, h: 0.4, color: 0xf59e0b, icon: "fa-clock" },
            { id: "reloj_mesa", name: { es: "Reloj de Mesa", en: "Table Clock" }, w: 0.18, l: 0.1, h: 0.15, color: 0x059669, icon: "fa-clock" }
        ]
    },
    {
        category: { es: "Ventanas & Arquitectura", en: "Windows & Architecture" },
        items: [
            { id: "ventana_cuadrada", name: { es: "Ventana Cuadrada", en: "Square Window" }, w: 1.0, l: 0.1, h: 1.0, color: 0x38bdf8, icon: "fa-window-maximize" },
            { id: "ventana_rect", name: { es: "Ventana Rectangular", en: "Rectangular Window" }, w: 1.6, l: 0.1, h: 0.9, color: 0x38bdf8, icon: "fa-window-maximize" },
            { id: "ventana_circular", name: { es: "Ventana Circular", en: "Circular Window" }, w: 0.9, l: 0.1, h: 0.9, color: 0x38bdf8, icon: "fa-circle-dot" },
            { id: "ventana_esquina", name: { es: "Ventanal de Esquina L", en: "Corner L-Window" }, w: 1.2, l: 1.2, h: 1.4, color: 0x38bdf8, icon: "fa-border-all" }
        ]
    }
];

function renderCatalog(filterQuery = "") {
    const container = document.getElementById("catalog-container");
    const countBadge = document.getElementById("catalog-count");
    const currentLang = window.currentLang || "es";
    
    if (!container) return;
    container.innerHTML = "";

    let totalItems = 0;
    const query = filterQuery.toLowerCase().trim();

    FURNITURE_CATALOG.forEach(cat => {
        const categoryName = cat.category[currentLang] || cat.category.es;

        const filteredItems = cat.items.filter(item => {
            const itemName = (item.name[currentLang] || item.name.es).toLowerCase();
            return itemName.includes(query) || categoryName.toLowerCase().includes(query);
        });

        if (filteredItems.length === 0) return;

        totalItems += filteredItems.length;

        const catHeader = document.createElement("div");
        catHeader.className = "font-bold text-amber-800 dark:text-amber-400 mt-3 mb-1.5 text-[11px] uppercase tracking-wider border-b border-amber-200 dark:border-slate-700/60 pb-0.5";
        catHeader.innerText = categoryName;
        container.appendChild(catHeader);

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-2 gap-2";

        filteredItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card bg-amber-50/80 dark:bg-slate-900 border border-amber-200 dark:border-slate-700/80 p-2.5 rounded-xl cursor-pointer text-center hover:border-amber-500 hover:bg-amber-100/60 dark:hover:bg-slate-800 transition-all select-none shadow-xs";
            
            card.onclick = () => {
                if (typeof window.addFurnitureToScene === "function") {
                    window.addFurnitureToScene(item);
                }
            };

            const displayName = item.name[currentLang] || item.name.es;

            card.innerHTML = `
                <div class="text-amber-600 dark:text-amber-400 mb-1 text-lg"><i class="fa-solid ${item.icon}"></i></div>
                <div class="font-bold text-slate-800 dark:text-slate-100 text-[11px] truncate">${displayName}</div>
                <div class="text-[10px] text-amber-700/70 dark:text-slate-400 mt-0.5 font-medium">${item.w}m × ${item.l}m</div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    });

    if (countBadge) {
        countBadge.innerText = `${totalItems} items`;
    }
}