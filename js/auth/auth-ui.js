// js/auth/auth-ui.js - Lógica de Autenticación, Transición de Formularios y Persistencia Local

window.initAuthModal = function() {
    const authModal = document.getElementById("auth-modal");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const authTitle = document.getElementById("auth-title");
    const authSubtitle = document.getElementById("auth-subtitle");
    const btnSwitchAuth = document.getElementById("btn-switch-auth");
    const txtTogglePrompt = document.getElementById("txt-toggle-prompt");
    const authError = document.getElementById("auth-error");
    const regError = document.getElementById("reg-error");
    const btnGuestMode = document.getElementById("btn-guest-mode");
    const btnLogout = document.getElementById("btn-logout");
    const userBadge = document.getElementById("user-info-badge");
    const userDisplayName = document.getElementById("user-display-name");
    const btnModalTheme = document.getElementById("btn-modal-theme-toggle");
    const lblModalTheme = document.getElementById("lbl-modal-theme");

    let isLoginView = true;

    // Cambiar entre vista Iniciar Sesión y Registro
    if (btnSwitchAuth) {
        btnSwitchAuth.onclick = (e) => {
            e.preventDefault();
            isLoginView = !isLoginView;

            if (isLoginView) {
                authTitle.innerText = "Bienvenido de nuevo";
                authSubtitle.innerText = "Ingresa tus datos para acceder a RoomLayout.";
                formLogin.classList.remove("hidden");
                formRegister.classList.add("hidden");
                txtTogglePrompt.innerText = "¿Aún no tienes una cuenta?";
                btnSwitchAuth.innerText = "Crear cuenta";
            } else {
                authTitle.innerText = "Crea tu cuenta local";
                authSubtitle.innerText = "Registra tus credenciales en la base de datos local.";
                formRegister.classList.remove("hidden");
                formLogin.classList.add("hidden");
                txtTogglePrompt.innerText = "¿Ya tienes una cuenta?";
                btnSwitchAuth.innerText = "Iniciar sesión";
            }
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

    // Formulario Iniciar Sesión
    if (formLogin) {
        formLogin.onsubmit = async (e) => {
            e.preventDefault();
            authError.classList.add("hidden");

            const emailOrUser = document.getElementById("login-user").value.trim();
            const pass = document.getElementById("login-pass").value;

            try {
                await AuthService.login(emailOrUser, pass);
                updateUIState();
            } catch (err) {
                authError.innerText = err.message;
                authError.classList.remove("hidden");
            }
        };
    }

    // Formulario Registrar Usuario
    if (formRegister) {
        formRegister.onsubmit = async (e) => {
            e.preventDefault();
            regError.classList.add("hidden");

            const username = document.getElementById("reg-user").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;

            try {
                await AuthService.register(username, email, pass);
                updateUIState();
            } catch (err) {
                regError.innerText = err.message;
                regError.classList.remove("hidden");
            }
        };
    }

    // Acceder como Invitado / Modo Demo
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