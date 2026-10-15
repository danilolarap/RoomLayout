document.addEventListener("DOMContentLoaded", () => {
    if (typeof initScene === "function") {
        initScene();
    }
    if (typeof renderCatalog === "function") {
        renderCatalog();
    }

    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    const htmlEl = document.documentElement;

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isDark = htmlEl.classList.contains("dark");

            if (isDark) {
                htmlEl.classList.remove("dark");
                if (themeIcon) themeIcon.className = "fa-solid fa-sun text-amber-500";
                if (themeText) themeText.innerText = "Modo Claro";
                
                if (typeof scene !== "undefined" && scene) {
                    scene.background = new THREE.Color(0xfef3c7);
                }
            } else {
                htmlEl.classList.add("dark");
                if (themeIcon) themeIcon.className = "fa-solid fa-moon text-amber-400";
                if (themeText) themeText.innerText = "Modo Oscuro";

                if (typeof scene !== "undefined" && scene) {
                    scene.background = new THREE.Color(0x0f172a);
                }
            }
        });
    }

    const searchInput = document.getElementById("catalog-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            if (typeof renderCatalog === "function") {
                renderCatalog(e.target.value);
            }
        });
    }

    const roomW = document.getElementById("room-width");
    const roomL = document.getElementById("room-length");

    if (roomW && roomL) {
        const handleRoomChange = () => {
            const w = parseFloat(roomW.value) || 4;
            const l = parseFloat(roomL.value) || 3.5;
            if (typeof updateRoomDimensions === "function") {
                updateRoomDimensions(w, l);
            }
            if (typeof window.updateMetrics === "function") {
                window.updateMetrics();
            }
        };

        roomW.addEventListener("change", handleRoomChange);
        roomL.addEventListener("change", handleRoomChange);
    }

    const timeSlider = document.getElementById("time-slider");
    const timeDisplay = document.getElementById("time-display");

    if (timeSlider && timeDisplay) {
        timeSlider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            const hours = Math.floor(val);
            const mins = (val % 1) === 0 ? "00" : "30";
            timeDisplay.innerText = `${hours}:${mins}`;
            if (typeof updateSunPosition === "function") {
                updateSunPosition(val);
            }
        });
    }

    const btnIso = document.getElementById("btn-view-iso");
    const btnTop = document.getElementById("btn-view-top");

    if (btnIso) {
        btnIso.addEventListener("click", () => {
            if (typeof camera !== "undefined" && typeof controls !== "undefined") {
                camera.position.set(6, 6, 8);
                controls.target.set(0, 0, 0);
            }
        });
    }

    if (btnTop) {
        btnTop.addEventListener("click", () => {
            if (typeof camera !== "undefined" && typeof controls !== "undefined") {
                camera.position.set(0, 10, 0.01);
                controls.target.set(0, 0, 0);
            }
        });
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
            if (typeof selectedMesh !== "undefined" && selectedMesh && typeof window.deleteSelected === "function") {
                window.deleteSelected();
            }
        }
        if (e.key === "r" || e.key === "R") {
            if (typeof selectedMesh !== "undefined" && selectedMesh && typeof window.rotateSelected === "function") {
                window.rotateSelected(45);
            }
        }
    });
});