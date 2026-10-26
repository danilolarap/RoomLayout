let currentLang = 'es';

        const dict = {
            es: {
                brandSub: "ROOMLAYOUT - ESTUDIO ESPACIAL",
                heroTitle: "El desorden",
                heroHighlight: "organiz\u00e1ndose.",
                heroKicker: "DISE\u00d1A \u00b7 PRUEBA \u00b7 ORGANIZA",
                heroDesc: "Convierte ideas sueltas en espacios que funcionan. Dise\u00f1a, mueve y encuentra el lugar ideal para cada mueble.",
                welcomeTitle: "Te damos la bienvenida",
                welcomeTitleReg: "Regístrate",
                welcomeSub: "Ingresa tus datos para acceder a RoomLayout.",
                welcomeSubReg: "Registra tus credenciales en la base de datos local de tu navegador.",
                themeLight: "Modo Claro",
                themeDark: "Modo Oscuro",
                tabLogin: "Iniciar Sesión",
                tabReg: "Registrarse",
                userLogin: "Usuario o Correo Electrónico",
                passLogin: "Contraseña",
                remember: "Recordarme en este navegador",
                forgot: "¿Olvidaste tu contraseña?",
                btnLogin: "Entrar al Simulador",
                regUser: "Nombre de Usuario",
                regEmail: "Correo Electrónico",
                regPass: "Contraseña",
                btnReg: "Crear cuenta local",
                or: "O CONTINUAR COMO",
                btnGuest: "Acceder en Modo Demo / Invitado"
            },
            en: {
                brandSub: "ROOMLAYOUT - SPATIAL DESIGN STUDIO",
                heroTitle: "A little chaos",
                heroHighlight: "finding its place.",
                heroKicker: "DESIGN - PLACE - REFINE",
                heroDesc: "Turn loose ideas into spaces that work. Design, move things around, and find the right place for every piece.",
                welcomeTitle: "Welcome",
                welcomeTitleReg: "Register",
                welcomeSub: "Enter your credentials to access RoomLayout.",
                welcomeSubReg: "Save your credentials into your browser's local database.",
                themeLight: "Light Mode",
                themeDark: "Dark Mode",
                tabLogin: "Sign In",
                tabReg: "Register",
                userLogin: "Username or Email",
                passLogin: "Password",
                remember: "Remember me in this browser",
                forgot: "Forgot password?",
                btnLogin: "Enter Simulator",
                regUser: "Username",
                regEmail: "Email Address",
                regPass: "Password",
                btnReg: "Create Local Account",
                or: "OR CONTINUE AS",
                btnGuest: "Access as Guest / Demo Mode"
            }
        };

        function updateLang() {
            const t = dict[currentLang];
            const isReg = !document.getElementById('form-register').classList.contains('hidden');

            document.getElementById('lbl-lang').innerText = currentLang.toUpperCase();
            document.getElementById('txt-brand-sub').innerText = t.brandSub;
            document.getElementById('txt-hero-title').innerText = t.heroTitle;
            document.getElementById('txt-hero-highlight').innerText = t.heroHighlight;
            document.getElementById('txt-hero-kicker').innerText = t.heroKicker;
            document.getElementById('txt-hero-desc').innerText = t.heroDesc;
            document.getElementById('txt-welcome-title').innerText = isReg ? t.welcomeTitleReg : t.welcomeTitle;
            document.getElementById('txt-welcome-sub').innerText = isReg ? t.welcomeSubReg : t.welcomeSub;
            document.getElementById('lbl-tab-login').innerText = t.tabLogin;
            document.getElementById('lbl-tab-reg').innerText = t.tabReg;
            document.getElementById('lbl-user-login').innerText = t.userLogin;
            document.getElementById('lbl-pass-login').innerText = t.passLogin;
            document.getElementById('lbl-remember').innerText = t.remember;
            document.getElementById('lbl-forgot').innerText = t.forgot;
            document.getElementById('btn-txt-login').innerText = t.btnLogin;
            document.getElementById('lbl-reg-user').innerText = t.regUser;
            document.getElementById('lbl-reg-email').innerText = t.regEmail;
            document.getElementById('lbl-reg-pass').innerText = t.regPass;
            document.getElementById('btn-txt-reg').innerText = t.btnReg;
            document.getElementById('txt-or').innerText = t.or;
            document.getElementById('btn-txt-guest').innerText = t.btnGuest;

            const isDark = document.documentElement.classList.contains('dark');
            document.getElementById('lbl-theme').innerText = isDark ? t.themeDark : t.themeLight;
        }

        document.addEventListener('DOMContentLoaded', () => {
            const btnLang = document.getElementById('btn-lang');
            const btnTheme = document.getElementById('btn-theme');
            const tabLogin = document.getElementById('tab-login');
            const tabRegister = document.getElementById('tab-register');
            const formLogin = document.getElementById('form-login');
            const formRegister = document.getElementById('form-register');
            const btnGuest = document.getElementById('btn-guest');

            btnLang.addEventListener('click', () => {
                currentLang = currentLang === 'es' ? 'en' : 'es';
                updateLang();
            });

            btnTheme.addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                document.getElementById('icon-theme').className = isDark ? "fa-solid fa-moon text-amber-400" : "fa-solid fa-sun text-amber-500";
                document.getElementById('lbl-theme').innerText = isDark ? dict[currentLang].themeDark : dict[currentLang].themeLight;
            });

            // PESTAÑA INICIAR SESIÓN
            tabLogin.addEventListener('click', () => {
                formLogin.classList.remove('hidden');
                formRegister.classList.add('hidden');

                tabLogin.className = "py-2.5 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold border border-amber-200 dark:border-slate-700";
                tabRegister.className = "py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 font-bold";

                document.getElementById('txt-welcome-title').innerText = dict[currentLang].welcomeTitle;
                document.getElementById('txt-welcome-sub').innerText = dict[currentLang].welcomeSub;
            });

            // PESTAÑA REGISTRARSE (ESTILO VERDE IGUAL A TU PRIMERA IMAGEN)
            tabRegister.addEventListener('click', () => {
                formRegister.classList.remove('hidden');
                formLogin.classList.add('hidden');

                tabRegister.className = "py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs transition-all flex items-center justify-center gap-1.5 font-bold";
                tabLogin.className = "py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 font-bold";

                document.getElementById('txt-welcome-title').innerText = dict[currentLang].welcomeTitleReg;
                document.getElementById('txt-welcome-sub').innerText = dict[currentLang].welcomeSubReg;
            });

            formRegister.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('reg-user').value.trim();
                const email = document.getElementById('reg-email').value.trim();
                const password = document.getElementById('reg-pass').value.trim();
                const msgBox = document.getElementById('reg-msg');

                if (!username || !email || !password) return;

                try {
                    if (typeof AuthService !== 'undefined') {
                        await AuthService.register(username, email, password);
                        msgBox.className = "text-xs font-semibold p-2.5 rounded-xl text-center bg-emerald-100 text-emerald-800 border border-emerald-300";
                        msgBox.innerText = "¡Cuenta creada exitosamente! Redirigiendo...";
                        msgBox.classList.remove('hidden');

                        setTimeout(() => {
                            localStorage.setItem('roomlayout_session', JSON.stringify({ user: username, mode: 'user' }));
                            window.location.href = 'index.html';
                        }, 1000);
                    } else {
                        localStorage.setItem('roomlayout_session', JSON.stringify({ user: username, mode: 'user' }));
                        window.location.href = 'index.html';
                    }
                } catch (err) {
                    msgBox.className = "text-xs font-semibold p-2.5 rounded-xl text-center bg-red-100 text-red-700 border border-red-300";
                    msgBox.innerText = err.message || "Error al registrar la cuenta.";
                    msgBox.classList.remove('hidden');
                }
            });

            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userVal = document.getElementById('login-user').value.trim();
                const passVal = document.getElementById('login-pass').value.trim();
                const msgBox = document.getElementById('login-msg');

                try {
                    if (typeof AuthService !== 'undefined') {
                        const user = await AuthService.login(userVal, passVal);
                        localStorage.setItem('roomlayout_session', JSON.stringify({ user: user.username, mode: 'user' }));
                        window.location.href = 'index.html';
                    } else {
                        localStorage.setItem('roomlayout_session', JSON.stringify({ user: userVal, mode: 'user' }));
                        window.location.href = 'index.html';
                    }
                } catch (err) {
                    msgBox.className = "text-xs font-semibold p-2.5 rounded-xl text-center bg-red-100 text-red-700 border border-red-300";
                    msgBox.innerText = err.message || "Usuario o contraseña incorrectos.";
                    msgBox.classList.remove('hidden');
                }
            });

            btnGuest.addEventListener('click', () => {
                localStorage.setItem('roomlayout_session', JSON.stringify({ user: 'Invitado Demo', mode: 'guest' }));
                window.location.href = 'index.html';
            });

            document.addEventListener('visibilitychange', () => {
                document.body.classList.toggle('page-hidden', document.hidden);
            });

            updateLang();
        });
