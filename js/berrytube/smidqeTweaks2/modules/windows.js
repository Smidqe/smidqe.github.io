/*
    Data structure:
    {
        selectors: [],
        classes: [],

    }

    //append a button to click to close the window, (not sure how users )
*/

function load() {
    const self = {
        name: 'windows',
        started: false,
        requires: ['menu', 'layout'],

        windows: {
            rules: {
                selectors: ["#st-wrap-motd", "#motdwrap"],
                classes: ["st-window-open"],
            },
            header: {
                selectors: ["#st-wrap-header", "#headwrap", ],
                classes: ["st-window-open"],
            },
            footer: {
                selectors: ["#st-wrap-footer", "#main #footwrap", ],
                classes: ["st-window-open"],
            },
            polls: {
                selectors: ["#pollpane"],
                classes: ["st-window-open st-window-overlap"],
            },
            messages: {
                selectors: ["#mailboxDiv"],
                classes: ["st-window-open st-window-overlap"],
            },
            login: {
                selectors: [".wrapper #headbar"],
                classes: ["st-window-open"],
            },
            playlist: {
                selectors: ["#main #leftpane"],
                classes: ["st-window-open st-window-playlist", "st-window-overlap"],
            },
            users: {
                selectors: ["#chatlist"],
                classes: ["st-window-open st-window-users"],
            },
        },

        add: (key, data) => {
            self.windows[key] = data;
        },

        get: (key) => {
            return self.windows[key];
        },

        show: (key) => {
            console.log('Key applied to windows.show(): ' + key)

            let data = self.get(key);
            var selector = data.selectors[0];

            if (SmidqeTweaks.settings.get('maltweaks') && data.selectors.length > 1)
                selector = data.selectors[1];

            const button = $('<div>', {
                class: 'st-button-exit'
            }).append($('<span>').text('x'));

            const window = $('' + selector);

            window.append(button);

            $.each(data.classes, (key, value) => {
                window.addClass(value);
            })

            button.on('click', () => {
                self.hide(window.attr('data-key'));
            })
        },

        hide: (key) => {
            let data = self.get(key);

            $('.st-window-wrap > .st-window-exit').remove();

            $.each(data.classes, (key, value) => {
                window.removeClass(value);
            })
        },

        hideAll: () => {
            $.each(self.windows, (key, value) => {
                self.hide(key);
            })
        },

        init: () => {
            const menu = SmidqeTweaks.modules.menu;

            menu.addGroup({
                category: 'SmidqeTweaks',
                id: 'windows',
                title: 'Windows'
            })

            self.check = setInterval(() => {
                let layout = SmidqeTweaks.modules.layout;

                if (!layout)
                    return;

                if (!layout.enabled)
                    return;

                $.each(self.windows, (key, value) => {
                    var selector = value.selectors[0];

                    if (SmidqeTweaks.settings.get('maltweaks') && value.selectors.length > 1)
                        selector = value.selectors[1];

                    menu.addElement({
                        text: key[0].toUpperCase() + key.slice(1),
                        id: key,
                        category: 'SmidqeTweaks',
                        group: 'Windows',
                        type: 'button',
                        'data-key': key,
                        callbacks: {
                            click: function() {
                                self.show($(this).attr('data-key'));
                                menu.hide();
                            }
                        },
                    })

                    $(selector).addClass("st-window-default");
                })

                clearInterval(self.check);
            })

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('windows', load());
