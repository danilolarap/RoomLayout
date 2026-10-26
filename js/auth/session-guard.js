const sessionRaw = localStorage.getItem('roomlayout_session');

if (!sessionRaw) {
    window.location.href = 'login.html';
} else {
    try {
        const sessionData = JSON.parse(sessionRaw);
        document.addEventListener('DOMContentLoaded', () => {
            const userNameEl = document.getElementById('user-display-name');
            if (userNameEl && sessionData.user) {
                userNameEl.innerText = sessionData.user === 'Invitado Demo'
                    ? (window.currentLang === 'en' ? 'Guest Demo' : 'Invitado Demo')
                    : sessionData.user;
            }
        });
    } catch (e) {
        document.addEventListener('DOMContentLoaded', () => {
            const userNameEl = document.getElementById('user-display-name');
            if (userNameEl) userNameEl.innerText = sessionRaw;
        });
    }
}
