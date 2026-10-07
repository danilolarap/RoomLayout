const FURNITURE_CATALOG = [
    {
        category: "Básicos del Cuarto",
        items: [
            { id: "cama_queen", name: "Cama Queen", w: 1.6, l: 2.0, h: 0.6, color: 0x3b82f6, icon: "fa-bed" },
            { id: "armario_doble", name: "Armario Doble", w: 1.2, l: 0.6, h: 1.8, color: 0x64748b, icon: "fa-door-closed" },
            { id: "escritorio", name: "Escritorio Recto", w: 1.2, l: 0.7, h: 0.75, color: 0xf59e0b, icon: "fa-laptop" }
        ]
    },
    {
        category: "Entretenimiento & Audio",
        items: [
            { id: "mueble_tv", name: "Mueble TV 55\"", w: 1.4, l: 0.4, h: 0.5, color: 0x06b6d4, icon: "fa-tv" }
        ]
    },
    {
        category: "Fitness & Ejercicio",
        items: [
            { id: "rack_mancuernas", name: "Rack Mancuernas", w: 1.1, l: 0.5, h: 0.8, color: 0xef4444, icon: "fa-dumbbell" },
            { id: "banco_plano", name: "Banco Plano", w: 1.2, l: 0.45, h: 0.4, color: 0x8b5cf6, icon: "fa-cubes" }
        ]
    }
];

function renderCatalog() {
    const container = document.getElementById("catalog-container");
    container.innerHTML = "";

    FURNITURE_CATALOG.forEach(cat => {
        const catHeader = document.createElement("div");
        catHeader.className = "font-semibold text-slate-400 mt-2 mb-1 text-[11px] uppercase";
        catHeader.innerText = cat.category;
        container.appendChild(catHeader);

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-2 gap-2";

        cat.items.forEach(item => {
            const card = document.createElement("div");
            card.className = "item-card bg-slate-900 border border-slate-700 p-2 rounded cursor-pointer text-center hover:bg-slate-800";
            card.onclick = () => window.addFurnitureToScene(item);
            card.innerHTML = `
                <div class="text-blue-400 mb-1 text-lg"><i class="fa-solid ${item.icon}"></i></div>
                <div class="font-medium text-slate-200 text-[11px] truncate">${item.name}</div>
                <div class="text-[10px] text-slate-400">${item.w}m × ${item.l}m</div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    });
}