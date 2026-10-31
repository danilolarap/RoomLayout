// A separate panoramic scene: never included in room picking or saved projects.
(() => {
    "use strict";
    const storageKey = "roomlayout_viewer_background";
    const themes = {
        calm: { es: "Calma", en: "Calm", day: ["#bddddd", "#f0edd9", "#a3bea5", "#b5cab7", "#9bb9a6", "#86aa97", "#608877", "#dfc7a3"], night: ["#18283e", "#506574", "#293f47", "#3e5864", "#344c56", "#2e454e", "#203b40", "#c5b99b"] },
        halloween: { es: "Halloween", en: "Halloween", day: ["#c5b7d6", "#f0d2b3", "#ab95ac", "#b7a3bd", "#a38dab", "#8c789b", "#655675", "#ce955e"], night: ["#241d3b", "#79556c", "#3e334e", "#5e4565", "#4d3b59", "#40344e", "#29263c", "#d59b56"] },
        christmas: { es: "Navidad", en: "Christmas", day: ["#b8d4e5", "#eef1f1", "#e4eced", "#c1d4e1", "#cfdee6", "#e4ecef", "#779b98", "#c6a79c"], night: ["#1b2a46", "#6d819a", "#9cabbc", "#586b86", "#71859e", "#98acbe", "#355665", "#617087"] },
        fantasy: { es: "Fantasía", en: "Fantasy", day: ["#c0c4e2", "#ebe0e7", "#a2accb", "#b3b3d2", "#9eabc7", "#8d9cbb", "#657b9c", "#b3d0db"], night: ["#1d203d", "#605b8d", "#333f60", "#535275", "#444b6e", "#394563", "#293958", "#90accb"] },
        forest: { es: "Bosque", en: "Forest", day: ["#bbd4ca", "#e4ead4", "#91ad8d", "#b4c7a3", "#97b598", "#7ea48a", "#507b68", "#c5b79a"], night: ["#142c30", "#45605a", "#283e35", "#3c5d50", "#314f43", "#294539", "#1c352b", "#c4c09c"] },
        coast: { es: "Costa", en: "Coast", day: ["#afd9df", "#e7eee5", "#c7d5bf", "#a7d0ce", "#8cbfc1", "#a3cacc", "#699c8d", "#e4d4b4"], night: ["#1b304b", "#567b8d", "#526b72", "#3d677c", "#345b70", "#426c7c", "#304c59", "#a6b6ad"] },
        desert: { es: "Desierto", en: "Desert", day: ["#ccd5dd", "#f1dfc4", "#d8bd99", "#ddc6ad", "#d4b59c", "#cda98a", "#8e997b", "#b98d72"], night: ["#292b48", "#877083", "#665363", "#84637a", "#745a70", "#685367", "#404e4e", "#c59d8b"] },
        sakura: { es: "Sakura", en: "Cherry blossom", day: ["#c6dce0", "#f4e5e5", "#b9c7ad", "#c5cfb9", "#b2c0aa", "#a3b89f", "#8a8878", "#e5b8cc"], night: ["#292b48", "#76677f", "#424c50", "#61616c", "#51595f", "#465158", "#3c3d48", "#a683a0"] },
        aurora: { es: "Aurora", en: "Aurora", day: ["#b6d5db", "#e1e9e3", "#b7cfcb", "#b1c9d2", "#a6c1ca", "#b3cccf", "#658a8b", "#a9cdca"], night: ["#142c41", "#426975", "#45636e", "#3c596b", "#345464", "#436674", "#294b56", "#74bca9"] }
    };
    const text = {
        es: { title: "Elige tu paisaje", subtitle: "Un entorno animado de 360° que acompaña la perspectiva de tu habitación.", open: "Temas 360°", day: "Día", night: "Noche", cancel: "Cancelar", apply: "Usar tema", close: "Cerrar galería", preview: "Vista previa", hint: "Previsualiza el día o la noche. El visor seguirá tu modo claro u oscuro." },
        en: { title: "Choose your landscape", subtitle: "An animated 360° environment that follows your room’s perspective.", open: "360° themes", day: "Day", night: "Night", cancel: "Cancel", apply: "Use theme", close: "Close gallery", preview: "Preview", hint: "Preview day or night. The viewer follows your light or dark mode." }
    };
    const TAU = Math.PI * 2;
    let current = "calm", pending = current, language = "es", previewNight = false;
    let dialog, launcher, texture, skyScene, skyCamera, surface;
    let night = document.documentElement.classList.contains("dark") ? 1 : 0;
    let blend = night, lastFrame = 0, lastPaint = -Infinity, elapsed = 0, dirty = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

})();
