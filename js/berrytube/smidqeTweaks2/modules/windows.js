/*
    Data structure:
    {
        selectors: [],
        classes: [],

    }

*/

function load() {
    const self = {
        name: 'windows',
        started: false,
        requires: ['menu'],

        windows: {
            rules: {
                selectors: ["#st-wrap-motd", "#motdwrap"],
                classes: [],
            },
            header: {
                selectors: ["#st-wrap-header", "#headwrap", ],
                classes: [],
            },
            footer: {
                selectors: ["#st-wrap-footer", "#main #footwrap", ],
                classes: [],
            },
            polls: {
                selectors: ["#pollpane"],
                classes: ["st-window-overlap"],
            },
            messages: {
                selectors: ["#mailboxDiv"],
                classes: ["st-window-overlap"],
            },
            login: {
                selectors: [".wrapper #headbar"],
                classes: [],
            },
            playlist: {
                selectors: ["#main #leftpane"],
                classes: ["st-window-playlist", "st-window-overlap"],
            },
            users: {
                selectors: ["#chatlist"],
                classes: ["st-window-users"],
            },
        },

        add: (key, data) => {
            self.windows[key] = data;
        },

        get: (key) => {
            return self.windows[key];
        },

        show: (key) => {
            let data = self.get(key);
            var selector = data.selectors[0];

            if (SmidqeTweaks.settings.get('maltweaks') && data.selectors.length > 1)
                selector = data.selectors[1];

            const wrap = $('<div>', {
                class: 'st-window-wrap'
            }).append(
                $('<div>', { class: 'st-window-exit' }).text('x'));

            $(selector).wrap(wrap);
        },

        hide: (data) => {
            $('.st-window-wrap > .st-window-exit').remove();
            $('.st-window-wrap').contents().unwrap();
        },

        init: () => {
            let toolbar = SmidqeTweaks.modules.toolbar;
            let button = {
                id: 'menu',
                text: 'M',
                tooltip: 'Show/Hide the menu',
                isToggle: false,
                callbacks: {},
            }

            button.callbacks['on'] = () => {
                SmidqeTweaks.modules.windows.show('rules');
            }

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('windows', load(), 'main');
