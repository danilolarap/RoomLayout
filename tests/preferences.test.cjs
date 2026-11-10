const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function page(storage, script) {
    const elements = new Map();
    const classes = new Set(['light']);
    const classList = values => ({
        contains: value => values.has(value),
        add: value => values.add(value),
        remove: value => values.delete(value),
        toggle(value, force = !values.has(value)) {
            if (force) values.add(value); else values.delete(value);
            return force;
        }
    });
    const getElementById = id => {
        if (!elements.has(id)) elements.set(id, {
            innerText: '', className: '', classList: classList(new Set(['hidden'])),
            handlers: {}, addEventListener(event, handler) { this.handlers[event] = handler; }
        });
        return elements.get(id);
    };
    const context = vm.createContext({
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
        document: {
            documentElement: { lang: 'es', classList: classList(classes) },
            getElementById, addEventListener(event, handler) { if (event === 'DOMContentLoaded') this.ready = handler; }
        },
        location: {}, initProjectsUI() {}, renderWallTools() {}
    });
    context.window = context;
    for (const file of ['js/preferences.js', script]) {
        vm.runInContext(fs.readFileSync(file, 'utf8'), context);
    }
    if (script === 'js/ui.js') context.initUI(); else context.document.ready();
    return { context, element: getElementById, click: id => getElementById(id).handlers.click() };
}

test('login choices survive guest navigation, reload and changes in the simulator', () => {
    const storage = new Map();
    const login = page(storage, 'js/auth/login.js');
    login.click('btn-lang');
    login.click('btn-theme');
    login.click('btn-guest');
    assert.equal(login.context.location.href, 'index.html');

    for (let reload = 0; reload < 2; reload++) {
        const main = page(storage, 'js/ui.js');
        assert.equal(main.context.currentLang, 'en');
        assert.equal(main.context.document.documentElement.lang, 'en');
        assert.equal(main.context.document.documentElement.classList.contains('dark'), true);
        assert.equal(main.element('lang-label').innerText, 'EN');
        assert.equal(main.element('theme-label').innerText, 'Dark Mode');
        assert.equal(main.element('theme-icon').className, 'fa-solid fa-moon');
        assert.equal(main.element('title-catalog').innerText, 'FURNITURE CATALOG');
    }

    const main = page(storage, 'js/ui.js');
    main.click('lang-toggle');
    main.click('theme-toggle');
    const returned = page(storage, 'js/auth/login.js');
    assert.equal(returned.element('lbl-lang').innerText, 'ES');
    assert.equal(returned.element('lbl-theme').innerText, 'Modo Claro');
    assert.equal(returned.context.document.documentElement.classList.contains('dark'), false);
});

test('missing or invalid preferences default to Spanish and light mode', () => {
    for (const storage of [new Map(), new Map([['roomlayout_language', 'xx'], ['roomlayout_theme', 'invalid']])]) {
        const main = page(storage, 'js/ui.js');
        assert.equal(main.context.currentLang, 'es');
        assert.equal(main.element('lang-label').innerText, 'ES');
        assert.equal(main.element('theme-label').innerText, 'Modo Claro');
        assert.equal(main.context.document.documentElement.classList.contains('dark'), false);
    }
});
