document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar renderizador e interfaz
    initScene();
    renderCatalog();

    // 2. Eventos de Dimensiones de la Habitación
    document.getElementById("room-width").addEventListener("change", (e) => {
        const w = parseFloat(e.target.value);
        const l = parseFloat(document.getElementById("room-length").value);
        updateRoomDimensions(w, l);
        window.updateMetrics();
    });

    document.getElementById("room-length").addEventListener("change", (e) => {
        const w = parseFloat(document.getElementById("room-width").value);
        const l = parseFloat(e.target.value);
        updateRoomDimensions(w, l);
        window.updateMetrics();
    });

    // 3. Slider de Hora Solar
    const timeSlider = document.getElementById("time-slider");
    const timeDisplay = document.getElementById("time-display");

    timeSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        const hours = Math.floor(val);
        const mins = (val % 1) === 0 ? "00" : "30";
        timeDisplay.innerText = `${hours}:${mins}`;
        updateSunPosition(val);
    });

    // 4. Conmutadores de Vista (ISO / TOP)
    document.getElementById("btn-view-iso").addEventListener("click", () => {
        camera.position.set(6, 6, 8);
        controls.target.set(0, 0, 0);
    });

    document.getElementById("btn-view-top").addEventListener("click", () => {
        camera.position.set(0, 10, 0.01);
        controls.target.set(0, 0, 0);
    });

    // 5. Atajos de Teclado
    window.addEventListener("keydown", (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
            if (selectedMesh) window.deleteSelected();
        }
        if (e.key === "r" || e.key === "R") {
            if (selectedMesh) window.rotateSelected(45);
        }
    });
});