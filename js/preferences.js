// Shared by login and simulator; apply the theme before the page is painted.
(() => {
    const read = key => {
        try { return localStorage.getItem(key); } catch { return null; }
    };
    const write = (key, value) => {
        try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ }
    };
    const preferences = window.RoomLayoutPreferences = {
        language: read('roomlayout_language') === 'en' ? 'en' : 'es',
        theme: read('roomlayout_theme') === 'dark' ? 'dark' : 'light',
        setLanguage(language) {
            this.language = language === 'en' ? 'en' : 'es';
            document.documentElement.lang = this.language;
            write('roomlayout_language', this.language);
        },
        setTheme(theme) {
            this.theme = theme === 'dark' ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', this.theme === 'dark');
            document.documentElement.classList.toggle('light', this.theme === 'light');
            write('roomlayout_theme', this.theme);
        }
    };
    document.documentElement.lang = preferences.language;
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    document.documentElement.classList.toggle('light', preferences.theme === 'light');
})();
