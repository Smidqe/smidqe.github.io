/*
    Eventually instead of creating a window, use jQuery to grab the necessary elements
    and wrap them into a div (.st-window-wrap), this way we don't need to know if maltweaks
    is running, since it'll be checked during opening of a window, instead of during init
*/
function load() {
    const self = {
        settings: null,
        modules: {
            rules: {
                paths: ["#motdwrap", "#st-wrap-motd"],
                classes: [],
            },
            header: {
                paths: ["#headwrap", "#st-wrap-header"],
                classes: [],
            },
            footer: {
                paths: ["#main #footwrap", "#st-wrap-footer"],
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

        toggle: (key) => {
            if (key !== self.previous)
                $(".st-window-open").removeClass("st-window-open");

            var pathIndex = 0;
            if (element.paths.length == 2 && self.settings.get('maltweaks'))
                pathIndex = 1;

            $(self.modules[key].paths[pathIndex]).toggleClass("st-window-open");

            self.previous = key;
        },

        init: () => {
            self.settings = SmidqeTweaks.modules.settings;

            $.each(self.modules, (key, value) => {
                var pathIndex = 0;

                if (value.paths.length == 2 && self.settings.get('maltweaks'))
                    pathIndex = 1;

                $.each(value.classes, c => {
                    $(value.paths[pathIndex]).addClass(value.classes[c]);
                })

                $(value.paths[pathIndex]).addClass('st-window-default');
            })
        }
    }

    return self;
}

SmidqeTweaks.modules.layout.modules.windows = load();
