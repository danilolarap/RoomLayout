const FURNITURE_CATALOG = [
    {
        category: "Básicos del Cuarto",
        items: [
            { id: "cama_king", name: "Cama King", w: 2.0, l: 2.0, h: 0.65, color: 0xd97706, icon: "fa-bed" },
            { id: "cama_queen", name: "Cama Queen", w: 1.6, l: 2.0, h: 0.6, color: 0xf59e0b, icon: "fa-bed" },
            { id: "cama_sencilla", name: "Cama Individual", w: 1.0, l: 1.9, h: 0.5, color: 0xfbbf24, icon: "fa-bed" },
            { id: "mesa_noche", name: "Mesa de Noche", w: 0.45, l: 0.45, h: 0.5, color: 0xb45309, icon: "fa-box" },
            { id: "armario_doble", name: "Armario Doble", w: 1.5, l: 0.6, h: 2.0, color: 0x78350f, icon: "fa-door-closed" }
        ]
    },
    {
        category: "Estudio & Oficina",
        items: [
            { id: "escritorio_l", name: "Escritorio Tipo L", w: 1.6, l: 1.4, h: 0.75, color: 0xd97706, icon: "fa-laptop" },
            { id: "escritorio_recto", name: "Escritorio Recto", w: 1.2, l: 0.7, h: 0.75, color: 0xf59e0b, icon: "fa-laptop" },
            { id: "silla_ergonomica", name: "Silla de Oficina", w: 0.6, l: 0.6, h: 1.1, color: 0xea580c, icon: "fa-chair" }
        ]
    },
    {
        category: "Entretenimiento & Confort",
        items: [
            { id: "mueble_tv_grande", name: "Mueble TV 65\"", w: 1.8, l: 0.45, h: 0.5, color: 0xc2410c, icon: "fa-tv" },
            { id: "mueble_tv", name: "Mueble TV 55\"", w: 1.4, l: 0.4, h: 0.5, color: 0xea580c, icon: "fa-tv" },
            { id: "sofa_2p", name: "Sofá 2 Puestos", w: 1.6, l: 0.85, h: 0.8, color: 0xd97706, icon: "fa-couch" }
        ]
    },
    {
        category: "Fitness & Ejercicio",
        items: [
            { id: "rack_mancuernas", name: "Rack Mancuernas", w: 1.1, l: 0.5, h: 0.8, color: 0xd97706, icon: "fa-dumbbell" },
            { id: "banco_plano", name: "Banco Plano", w: 1.2, l: 0.45, h: 0.4, color: 0xb45309, icon: "fa-cubes" }
        ]
    }
];

function renderCatalog(filterQuery = "") {
    const container = document.getElementById("catalog-container");
    const countBadge = document.getElementById("catalog-count");
    
    if (!container) return;
    container.innerHTML = "";

    let totalItems = 0;
    const query = filterQuery.toLowerCase().trim();

    FURNITURE_CATALOG.forEach(cat => {
        const filteredItems = cat.items.filter(item => 
            item.name.toLowerCase().includes(query) || cat.category.toLowerCase().includes(query)
        );

        if (filteredItems.length === 0) return;

        totalItems += filteredItems.length;

        const catHeader = document.createElement("div");
        catHeader.className = "font-bold text-amber-800 dark:text-amber-400 mt-3 mb-1.5 text-[11px] uppercase tracking-wider border-b border-amber-200 dark:border-slate-700/60 pb-0.5";
        catHeader.innerText = cat.category;
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

            card.innerHTML = `
                <div class="text-amber-600 dark:text-amber-400 mb-1 text-lg"><i class="fa-solid ${item.icon}"></i></div>
                <div class="font-bold text-slate-800 dark:text-slate-100 text-[11px] truncate">${item.name}</div>
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