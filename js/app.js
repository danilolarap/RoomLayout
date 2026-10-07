document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar renderizador e interfaz
    initScene();
    renderCatalog();

    // 2. Eventos de la barra superior (Dimensiones Habitación)
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

    // 3. Evento del Slider Solar
    const timeSlider = document.getElementById("time-slider");
    const timeDisplay = document.getElementById("time-display");

    timeSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        const hours = Math.floor(val);
        const mins = (val % 1) === 0 ? "00" : "30";
        timeDisplay.innerText = `${hours}:${mins}`;
        updateSunPosition(val);
    });

    // 4. Cambios de Vista (ISO / TOP)
    document.getElementById("btn-view-iso").addEventListener("click", () => {
        camera.position.set(6, 6, 8);
        controls.target.set(0, 0, 0);
    });

    document.getElementById("btn-view-top").addEventListener("click", () => {
        camera.position.set(0, 10, 0.01);
        controls.target.set(0, 0, 0);
    });
});