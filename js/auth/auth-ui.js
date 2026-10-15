// js/auth/auth-ui.js - Manejo de la UI de autenticación

function updateAuthUI() {
    const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
    const userDisplay = document.getElementById("user-display-name");
    const btnAuth = document.getElementById("btn-auth-modal");

    if (user && userDisplay) {
        userDisplay.innerText = user.username;
        btnAuth.onclick = () => {
            if (confirm(`¿Deseas cerrar la sesión de ${user.username}?`)) {
                window.AuthService.logout();
                updateAuthUI();
            }
        };
    } else if (userDisplay) {
        userDisplay.innerText = "Ingresar";
        btnAuth.onclick = () => {
            const modal = document.getElementById("auth-modal");
            if (modal) modal.classList.remove("hidden");
        };
    }
}

function initAuthModal() {
    const modal = document.getElementById("auth-modal");
    const btnClose = document.getElementById("btn-close-modal");
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const authError = document.getElementById("auth-error");
    const regError = document.getElementById("reg-error");

    if (btnClose) btnClose.onclick = () => modal.classList.add("hidden");

    if (tabLogin && tabRegister) {
        tabLogin.onclick = () => {
            tabLogin.className = "font-bold text-sm text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 pb-1";
            tabRegister.className = "font-bold text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pb-1";
            formLogin.classList.remove("hidden");
            formRegister.classList.add("hidden");
        };

        tabRegister.onclick = () => {
            tabRegister.className = "font-bold text-sm text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 pb-1";
            tabLogin.className = "font-bold text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pb-1";
            formRegister.classList.remove("hidden");
            formLogin.classList.add("hidden");
        };
    }

    if (formLogin) {
        formLogin.onsubmit = async (e) => {
            e.preventDefault();
            authError.classList.add("hidden");
            try {
                await window.AuthService.login(
                    document.getElementById("login-user").value,
                    document.getElementById("login-pass").value
                );
                modal.classList.add("hidden");
                updateAuthUI();
            } catch (err) {
                authError.innerText = err.message;
                authError.classList.remove("hidden");
            }
        };
    }

    if (formRegister) {
        formRegister.onsubmit = async (e) => {
            e.preventDefault();
            regError.classList.add("hidden");
            try {
                await window.AuthService.register(
                    document.getElementById("reg-user").value,
                    document.getElementById("reg-email").value,
                    document.getElementById("reg-pass").value
                );
                modal.classList.add("hidden");
                updateAuthUI();
            } catch (err) {
                regError.innerText = err.message;
                regError.classList.remove("hidden");
            }
        };
    }

    updateAuthUI();
}

// Exponer inicialización para main.js / ui.js
window.initAuthModal = initAuthModal;