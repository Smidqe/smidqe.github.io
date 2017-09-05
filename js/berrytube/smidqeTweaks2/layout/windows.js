/*
    Eventually instead of creating a window, use jQuery to grab the necessary elements
    and wrap them into a div (.st-window-wrap), this way we don't need to know if maltweaks
    is running, since it'll be checked during opening of a window, instead of during init
*/
function load() {
    const self = {
        modules: {
            rules: {
                paths: ["#st-wrap-motd", "#motdwrap"],
                classes: [],
            },
            header: {
                paths: ["#st-wrap-header", "#headwrap", ],
                classes: [],
            },
            footer: {
                paths: ["#st-wrap-footer", "#main #footwrap", ],
                classes: [],
            },
            polls: {
                paths: ["#pollpane"],
                classes: ["st-window-overlap"],
            },
            messages: {
                paths: ["#mailboxDiv"],
                classes: ["st-window-overlap"],
            },
            login: {
                paths: [".wrapper #headbar"],
                classes: [],
            },
            playlist: {
                paths: ["#main #leftpane"],
                classes: ["st-window-playlist", "st-window-overlap"],
            },
            users: {
                paths: ["#chatlist"],
                classes: ["st-window-users"],
            },
        },
        getPath: (key) => {
            var index = 0;

            if (self.modules[key].paths.length == 2 && SmidqeTweaks.settings.get('maltweaks'))
                index = 1;

            return self.modules[key].paths[index];
        },
        toggle: (key) => {
            if (key !== self.previous)
                $(".st-window-open").removeClass("st-window-open");

            $(self.getPath(key)).toggleClass("st-window-open");

            self.previous = key;
        },

        enable: () => {
            $.each(self.modules, (key, value) => {
                const path = self.getPath(key);

                $.each(value.classes, c => {
                    $(path).addClass(value.classes[c]);
                })

                $(path).addClass('st-window-default');
            })
        },

        disable: () => {
            $.each(self.modules, (key, value) => {
                $.each(value.classes, c => {
                    $(self.getPath(key)).removeClass(value.classes[c]);
                })

                $('.st-window-default').removeClass('st-window-default');
            })
        },

        init: () => {}
    }

    return self;
}

SmidqeTweaks.addModule('windows', load(), 'layout');
