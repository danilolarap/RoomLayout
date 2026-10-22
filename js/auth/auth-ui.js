// js/auth/auth-ui.js - Interacción del Modal de Autenticación e Idiomas

window.initAuthModal = function() {
    const authModal = document.getElementById("auth-modal");
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const authTitle = document.getElementById("auth-title");
    const authSubtitle = document.getElementById("auth-subtitle");
    const authError = document.getElementById("auth-error");
    const regError = document.getElementById("reg-error");
    const btnGuestMode = document.getElementById("btn-guest-mode");
    const btnLogout = document.getElementById("btn-logout");
    const userBadge = document.getElementById("user-info-badge");
    const userDisplayName = document.getElementById("user-display-name");
    const btnModalTheme = document.getElementById("btn-modal-theme-toggle");
    const lblModalTheme = document.getElementById("lbl-modal-theme");
    const modalLangToggle = document.getElementById("modal-lang-toggle");

    // Función de Cambio entre Iniciar Sesión y Registro
    function showTab(view) {
        if (view === "login") {
            formLogin.classList.remove("hidden");
            formRegister.classList.add("hidden");

            tabLogin.className = "py-2 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold";
            tabRegister.className = "py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 font-bold";

            authTitle.innerText = window.currentLang === "en" ? "Welcome back" : "Bienvenido de nuevo";
            authSubtitle.innerText = window.currentLang === "en" ? "Enter your credentials to access RoomLayout." : "Ingresa tus datos para acceder a RoomLayout.";
        } else {
            formRegister.classList.remove("hidden");
            formLogin.classList.add("hidden");

            tabRegister.className = "py-2 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold";
            tabLogin.className = "py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 font-bold";

            authTitle.innerText = window.currentLang === "en" ? "Create local account" : "Regístrate";
            authSubtitle.innerText = window.currentLang === "en" ? "Register your credentials in your browser local database." : "Registra tus credenciales en la base de datos local de tu navegador.";
        }
    }

    if (tabLogin) tabLogin.onclick = () => showTab("login");
    if (tabRegister) tabRegister.onclick = () => showTab("register");

    // Conmutador de Idiomas
    if (modalLangToggle) {
        modalLangToggle.onclick = () => {
            const langBtn = document.getElementById("lang-toggle");
            if (langBtn) langBtn.click(); // Dispara el cambio global
            updateModalLanguageTexts();
        };
    }

    // Alternar Tema desde el Modal
    if (btnModalTheme) {
        btnModalTheme.onclick = () => {
            const isDark = document.documentElement.classList.toggle("dark");
            if (lblModalTheme) {
                lblModalTheme.innerText = isDark ? (window.currentLang === "en" ? "Dark Mode" : "Modo Oscuro") : (window.currentLang === "en" ? "Light Mode" : "Modo Claro");
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

    // Actualizar Estado de UI de Sesión
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

    // Envío del Formulario Login
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

    // Envío del Formulario Registro
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

    // Acceso como Invitado
    if (btnGuestMode) {
        btnGuestMode.onclick = () => {
            const guestUser = { id: "guest", username: "Invitado Demo", email: "invitado@local" };
            localStorage.setItem("roomlayout_user", JSON.stringify(guestUser));
            updateUIState();
        };
    }

    // Cierre de Sesión
    if (btnLogout) {
        btnLogout.onclick = () => {
            AuthService.logout();
            window.currentProjectId = null;
            updateUIState();
        };
    }

    updateUIState();
};

window.updateModalLanguageTexts = function() {
    const isEn = window.currentLang === "en";
    const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    };

    setTxt("modal-lang-label", isEn ? "EN" : "ES");
    setTxt("m-brand-sub", isEn ? "FROM IDEA TO ORGANIZED SPACE" : "DE LA IDEA AL ESPACIO ORGANIZADO");
    setTxt("m-hero-title", isEn ? "Smart 3D Interior Design" : "Diseño e interiorismo inteligente 3D");
    setTxt("m-hero-desc", isEn ? "Simulate ergonomic flow, analyze real-time solar impact, and store your designs in your local database." : "Simula la circulación ergonómica, analiza la incidencia solar en tiempo real y guarda tus proyectos en tu base de datos local.");

    setTxt("txt-tab-login", isEn ? "Log In" : "Iniciar Sesión");
    setTxt("txt-tab-reg", isEn ? "Register" : "Registrarse");

    setTxt("lbl-login-user", isEn ? "User or Email Address" : "Usuario o Correo Electrónico");
    setTxt("lbl-login-pass", isEn ? "Password" : "Contraseña");
    setTxt("lbl-remember", isEn ? "Remember me in this browser" : "Recordarme en este navegador");
    setTxt("lbl-forgot", isEn ? "Forgot password?" : "¿Olvidaste tu contraseña?");
    setTxt("btn-txt-login", isEn ? "Enter Simulator" : "Entrar al Simulador");

    setTxt("lbl-reg-user", isEn ? "Username" : "Nombre de Usuario");
    setTxt("lbl-reg-email", isEn ? "Email Address" : "Correo Electrónico");
    setTxt("lbl-reg-pass", isEn ? "Password" : "Contraseña");
    setTxt("btn-txt-reg", isEn ? "Create Local Account" : "Crear cuenta local");

    setTxt("txt-or-continue", isEn ? "OR CONTINUE AS" : "O CONTINUAR COMO");
    setTxt("btn-txt-guest", isEn ? "Access in Demo / Guest Mode" : "Acceder en Modo Demo / Invitado");

    const isRegVisible = !document.getElementById("form-register")?.classList.contains("hidden");
    if (isRegVisible) {
        setTxt("auth-title", isEn ? "Create local account" : "Regístrate");
        setTxt("auth-subtitle", isEn ? "Register your credentials in your browser local database." : "Registra tus credenciales en la base de datos local de tu navegador.");
    } else {
        setTxt("auth-title", isEn ? "Welcome back" : "Bienvenido de nuevo");
        setTxt("auth-subtitle", isEn ? "Enter your credentials to access RoomLayout." : "Ingresa tus datos para acceder a RoomLayout.");
    }
};