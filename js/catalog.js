const FURNITURE_CATALOG = [
    {
        category: "Básicos del Cuarto",
        items: [
            { id: "cama_king", name: "Cama King", w: 2.0, l: 2.0, h: 0.65, color: 0x1e3a8a, icon: "fa-bed" },
            { id: "cama_queen", name: "Cama Queen", w: 1.6, l: 2.0, h: 0.6, color: 0x3b82f6, icon: "fa-bed" },
            { id: "cama_sencilla", name: "Cama Individual", w: 1.0, l: 1.9, h: 0.5, color: 0x60a5fa, icon: "fa-bed" },
            { id: "mesa_noche", name: "Mesa de Noche", w: 0.45, l: 0.45, h: 0.5, color: 0xd97706, icon: "fa-box" },
            { id: "armario_doble", name: "Armario Doble", w: 1.5, l: 0.6, h: 2.0, color: 0x475569, icon: "fa-door-closed" },
            { id: "armario_simple", name: "Ropero Individual", w: 0.9, l: 0.55, h: 1.8, color: 0x64748b, icon: "fa-door-closed" }
        ]
    },
    {
        category: "Estudio & Oficina",
        items: [
            { id: "escritorio_l", name: "Escritorio Tipo L", w: 1.6, l: 1.4, h: 0.75, color: 0xd97706, icon: "fa-laptop" },
            { id: "escritorio_recto", name: "Escritorio Recto", w: 1.2, l: 0.7, h: 0.75, color: 0xf59e0b, icon: "fa-laptop" },
            { id: "silla_ergonomica", name: "Silla de Oficina", w: 0.6, l: 0.6, h: 1.1, color: 0x0284c7, icon: "fa-chair" },
            { id: "estante_libros", name: "Librero Alto", w: 0.8, l: 0.35, h: 1.9, color: 0x78350f, icon: "fa-book" }
        ]
    },
    {
        category: "Entretenimiento & Confort",
        items: [
            { id: "mueble_tv_grande", name: "Mueble TV 65\"", w: 1.8, l: 0.45, h: 0.5, color: 0x0891b2, icon: "fa-tv" },
            { id: "mueble_tv", name: "Mueble TV 55\"", w: 1.4, l: 0.4, h: 0.5, color: 0x06b6d4, icon: "fa-tv" },
            { id: "sofa_2p", name: "Sofá 2 Puestos", w: 1.6, l: 0.85, h: 0.8, color: 0x059669, icon: "fa-couch" },
            { id: "puf_individual", name: "Sillón / Puf", w: 0.8, l: 0.8, h: 0.7, color: 0x10b981, icon: "fa-couch" }
        ]
    },
    {
        category: "Fitness & Ejercicio",
        items: [
            { id: "rack_mancuernas", name: "Rack Mancuernas", w: 1.1, l: 0.5, h: 0.8, color: 0xef4444, icon: "fa-dumbbell" },
            { id: "banco_plano", name: "Banco Plano", w: 1.2, l: 0.45, h: 0.4, color: 0x8b5cf6, icon: "fa-cubes" },
            { id: "bicicleta_estatica", name: "Bici Estática", w: 1.0, l: 0.5, h: 1.2, color: 0xd946ef, icon: "fa-person-biking" }
        ]
    },
    {
        category: "Plantas & Decoración",
        items: [
            { id: "planta_maceta", name: "Planta de Interior", w: 0.5, l: 0.5, h: 1.2, color: 0x22c55e, icon: "fa-seedling" },
            { id: "espejo_de_pie", name: "Espejo Cuerpo Entero", w: 0.5, l: 0.1, h: 1.6, color: 0xe2e8f0, icon: "fa-border-all" }
        ]
    }
];

function renderCatalog() {
    const container = document.getElementById("catalog-container");
    const countBadge = document.getElementById("catalog-count");
    
    if (!container) return;
    container.innerHTML = "";

    let totalItems = 0;

    FURNITURE_CATALOG.forEach(cat => {
        totalItems += cat.items.length;

        // Encabezado de la categoría
        const catHeader = document.createElement("div");
        catHeader.className = "font-semibold text-slate-400 mt-3 mb-1.5 text-[11px] uppercase tracking-wider border-b border-slate-700/50 pb-0.5";
        catHeader.innerText = cat.category;
        container.appendChild(catHeader);

        // Cuadrícula de tarjetas de muebles
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-2 gap-2";

        cat.items.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card bg-slate-900 border border-slate-700/80 p-2.5 rounded-lg cursor-pointer text-center hover:bg-slate-800 hover:border-blue-500 transition-all select-none shadow-sm";
            
            // Evento al hacer clic
            card.onclick = () => window.addFurnitureToScene(item);

            // Estructura interna de la tarjeta
            card.innerHTML = `
                <div class="text-blue-400 mb-1 text-lg"><i class="fa-solid ${item.icon}"></i></div>
                <div class="font-medium text-slate-200 text-[11px] truncate">${item.name}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">${item.w}m × ${item.l}m</div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    });

    if (countBadge) {
        countBadge.innerText = `${totalItems} items`;
    }
}