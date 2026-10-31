// A separate panoramic scene: never included in room picking or saved projects.
(() => {
    "use strict";
    const storageKey = "roomlayout_viewer_background";
    const themes = {
        calm: { es: "Calma", en: "Calm", day: ["#bddddd", "#f0edd9", "#a3bea5", "#b5cab7", "#9bb9a6", "#86aa97", "#608877", "#dfc7a3"], night: ["#18283e", "#506574", "#293f47", "#3e5864", "#344c56", "#2e454e", "#203b40", "#c5b99b"] },
        halloween: { es: "Halloween", en: "Halloween", day: ["#c5b7d6", "#f0d2b3", "#ab95ac", "#b7a3bd", "#a38dab", "#8c789b", "#655675", "#ce955e"], night: ["#241d3b", "#79556c", "#3e334e", "#5e4565", "#4d3b59", "#40344e", "#29263c", "#d59b56"] },
        christmas: { es: "Navidad", en: "Christmas", day: ["#b8d4e5", "#eef1f1", "#e4eced", "#c1d4e1", "#cfdee6", "#e4ecef", "#779b98", "#c6a79c"], night: ["#1b2a46", "#6d819a", "#9cabbc", "#586b86", "#71859e", "#98acbe", "#355665", "#617087"] },
        fantasy: { es: "Fantasía", en: "Fantasy", day: ["#c0c4e2", "#ebe0e7", "#a2accb", "#b3b3d2", "#9eabc7", "#8d9cbb", "#657b9c", "#b3d0db"], night: ["#1d203d", "#605b8d", "#333f60", "#535275", "#444b6e", "#394563", "#293958", "#90accb"] },
    };
})();
