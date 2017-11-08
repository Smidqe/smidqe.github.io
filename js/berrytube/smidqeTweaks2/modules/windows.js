/*

*/

function load() {
    const self = {
        name: 'windows',
        started: false,
        requires: ['menu', 'layout'],
        menu: null,
        windows: {
            rules: {
                selectors: ["#st-wrap-motd", "#motdwrap"],
                classes: ["st-window-open", 'st-window-wrap'],
                text: 'Rules and MOTD'
            },
            header: {
                selectors: ["#st-wrap-header", "#headwrap", ],
                classes: ["st-window-open", 'st-window-wrap'],
                text: 'Berrytube header'
            },
            footer: {
                selectors: ["#st-wrap-footer", "#main #footwrap", ],
                classes: ["st-window-open", 'st-window-wrap'],
                text: 'Berrytube footer',
            },
            polls: {
                selectors: ["#pollpane"],
                classes: ["st-window-open st-window-overlap", 'st-window-wrap'],
                text: 'Polls'
            },
            messages: {
                selectors: ["#mailboxDiv"],
                classes: ["st-window-open st-window-overlap", 'st-window-wrap'],
                text: 'Personal messages'
            },
            login: {
                selectors: [".wrapper #headbar"],
                classes: ["st-window-open", 'st-window-wrap'],
                text: 'Login window'
            },
            playlist: {
                selectors: ["#main #leftpane"],
                classes: ["st-window-open st-window-playlist", "st-window-overlap", 'st-window-wrap'],
                text: 'Playlist',
                callback: () => {
                    SmidqeTweaks.modules.playlist.refresh();
                }
            },
            users: {
                selectors: ["#chatlist"],
                classes: ["st-window-open st-window-users", 'st-window-wrap'],
                text: 'List of users'
            },
        },
        add: (key, data, refresh) => {
            self.windows[key] = data;

            if (refresh)
                self.refresh();
        },
        get: (key) => {
            return self.windows[key];
        },
        show: (key) => {
            console.log('Key applied to windows.show(): ' + key);

            let data = self.get(key);
            var selector = data.selectors[0];

            if (SmidqeTweaks.settings.get('maltweaks') && data.selectors.length > 1)
                selector = data.selectors[1];

            const titlebar = $('<div>', {
                class: 'st-titlebar'
            }).append(
                $('<div>', {
                    class: 'st-titlebar-exit'
                }).on('click', () => {
                    self.hide(key);
                })
            ).append($('<span>').text(data.text));

            const window = $('' + selector);

            window.prepend(titlebar);

            $.each(data.classes, (key, value) => {
                window.addClass(value);
            })
        },

        hide: (key) => {
            const data = self.get(key);

            var selector = data.selectors[0];

            if (SmidqeTweaks.settings.get('maltweaks') && data.selectors.length > 1)
                selector = data.selectors[1];

            const window = $('' + selector);
            const titlebar = window.find('.st-titlebar');

            $.each(data.classes, (key, value) => {
                window.removeClass(value);
            })

            titlebar.remove();
        },

        hideAll: () => {
            $.each(self.windows, (key, value) => {
                self.hide(key);
            })
        },

        getSelector: (value) => {
            return SmidqeTweaks.settings.get('maltweaks') && value.selectors.length > 1 ? value.selectors[1] : value.selectors[0];
        },

        addMenuButtons: () => {
            $.each(self.windows, (key, value) => {
                var obj = {
                    text: key[0].toUpperCase() + key.slice(1),
                    id: key,
                    category: 'SmidqeTweaks',
                    group: 'Windows',
                    type: 'button',
                    'data-key': key
                }

                obj.callbacks = {
                    click: function() {
                        self.show($(this).attr('data-key'));

                        if (value.callback)
                            value.callback();

                        self.menu.hide();
                    }
                }

                self.menu.addElement(obj);
            })
        },

        removeMenuButtons: () => {
            $.each(self.windows, (key, value) => {
                var obj = {
                    category: 'SmidqeTweaks',
                    group: 'Windows',
                    key: key,
                }

                self.menu.removeElement(obj);
            })
        },

        refresh: () => {
            self.removeMenuButtons();
            self.addMenuButtons();

            $.each(self.windows, (key, value) => {
                $(self.getSelector(value)).addClass('st-window-default');
            })
        },

        init: () => {
            self.menu = SmidqeTweaks.modules.menu;

            self.check = setInterval(() => {
                let layout = SmidqeTweaks.modules.layout;

                if (!layout)
                    return;

                if (!layout.enabled)
                    return;

                self.refresh();

                clearInterval(self.check);
            })

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('windows', load());
