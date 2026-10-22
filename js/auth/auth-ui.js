// js/auth/auth-ui.js - Lógica de Interfaz del Modal de Autenticación y Persistencia Local

window.initAuthModal = function() {
    const authModal = document.getElementById("auth-modal");
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const authError = document.getElementById("auth-error");
    const regError = document.getElementById("reg-error");
    const btnGuestMode = document.getElementById("btn-guest-mode");
    const btnLogout = document.getElementById("btn-logout");
    const userBadge = document.getElementById("user-info-badge");
    const userDisplayName = document.getElementById("user-display-name");
    const btnModalTheme = document.getElementById("btn-modal-theme-toggle");
    const lblModalTheme = document.getElementById("lbl-modal-theme");

    // Reorganizar Pestañas Login / Registro
    if (tabLogin && tabRegister) {
        tabLogin.onclick = (e) => {
            e.preventDefault();
            tabLogin.className = "py-2 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold";
            tabRegister.className = "py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 font-bold";
            formLogin.classList.remove("hidden");
            formRegister.classList.add("hidden");
        };

        tabRegister.onclick = (e) => {
            e.preventDefault();
            tabRegister.className = "py-2 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold";
            tabLogin.className = "py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 font-bold";
            formRegister.classList.remove("hidden");
            formLogin.classList.add("hidden");
        };
    }

    // Toggle de Tema directamente desde el Modal de Login
    if (btnModalTheme) {
        btnModalTheme.onclick = () => {
            const isDark = document.documentElement.classList.toggle("dark");
            if (lblModalTheme) {
                lblModalTheme.innerText = isDark ? "Modo Oscuro" : "Modo Claro";
            }
            const themeLabel = document.getElementById("theme-label");
            if (themeLabel) themeLabel.innerText = isDark ? "Modo Oscuro" : "Modo Claro";
            const themeIcon = document.getElementById("theme-icon");
            if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";

            if (typeof scene !== "undefined" && scene) {
                scene.background = new THREE.Color(isDark ? 0x0f172a : 0xfef3c7);
            }
        };
    }

    // Comprobar la sesión guardada al iniciar la aplicación
    function updateUIState() {
        const user = AuthService.getCurrentUser();
        if (user) {
            if (userDisplayName) userDisplayName.innerText = user.username;
            if (userBadge) {
                userBadge.classList.remove("hidden");
                userBadge.classList.add("flex");
            }
            if (authModal) authModal.classList.add("hidden");
        } else {
            if (userBadge) {
                userBadge.classList.add("hidden");
                userBadge.classList.remove("flex");
            }
            if (authModal) authModal.classList.remove("hidden");
        }
    }

    // Iniciar Sesión
    if (formLogin) {
        formLogin.onsubmit = async (e) => {
            e.preventDefault();
            authError.classList.add("hidden");

            const emailOrUser = document.getElementById("login-user").value.trim();
            const pass = document.getElementById("login-pass").value;

            try {
                const user = await AuthService.login(emailOrUser, pass);
                updateUIState();
            } catch (err) {
                authError.innerText = err.message;
                authError.classList.remove("hidden");
            }
        };
    }

    // Registrar Usuario Local
    if (formRegister) {
        formRegister.onsubmit = async (e) => {
            e.preventDefault();
            regError.classList.add("hidden");

            const username = document.getElementById("reg-user").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;

            try {
                const user = await AuthService.register(username, email, pass);
                updateUIState();
            } catch (err) {
                regError.innerText = err.message;
                regError.classList.remove("hidden");
            }
        };
    }

    // Modo Invitado / Demo
    if (btnGuestMode) {
        btnGuestMode.onclick = () => {
            const guestUser = { id: "guest", username: "Invitado Demo", email: "invitado@local" };
            localStorage.setItem("roomlayout_user", JSON.stringify(guestUser));
            updateUIState();
        };
    }

    // Cerrar Sesión
    if (btnLogout) {
        btnLogout.onclick = () => {
            AuthService.logout();
            window.currentProjectId = null;
            updateUIState();
        };
    }

    updateUIState();
};