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

            const button = $('<div>', {
                class: 'st-window-exit'
            }).append($('<span>').text('x'));

            let window = $('' + selector)

            window.append(button);

            $.each(data.classes, (key, value) => {
                window.addClass(value);
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
            let menu = SmidqeTweaks.modules.menu;

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
                        text: 'Test',
                        id: key,
                        category: 'SmidqeTweaks',
                        group: 'Windows',
                        type: 'button',
                        'data-key': key,
                        callbacks: {
                            click: () => {
                                self.show($(this).attr('data-key'));
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
