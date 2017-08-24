/*
    Eventually instead of creating a window, use jQuery to grab the necessary elements
    and wrap them into a div (.st-window-wrap), this way we don't need to know if maltweaks
    is running, since it'll be checked during opening of a window, instead of during init
*/

const self = {
    modules: {
        rules: {
            paths: ["#motdwrap", "#st-wrap-motd"]
        },
        header: {
            paths: ["#headwrap", "#st-wrap-header"],
        },
        footer: {
            paths: ["#main #footwrap", "#st-wrap-footer"],
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

        const window = self.modules[key];
        var pathIndex = 0;

        if (element.paths.length == 2 && SmidqeTweaks.settings.get('maltweaks'))
            pathIndex = 1;

        $(window.paths[pathIndex]).toggleClass("st-window-open");

        self.previous = key;
    },

    init: () => {
        $.each(modules, (key) => {
            const element = modules[key];
            var pathIndex = 0;

            if (element.paths.length == 2 && SmidqeTweaks.settings.get('maltweaks'))
                pathIndex = 1;

            $.each(element.classes, c => {
                $(element.paths[pathIndex]).addClass(element.classes[c]);
            })

            $(element.paths[pathIndex]).addClass('st-window-default');
        })
    }
}

SmidqeTweaks.modules.layout.windows = self;
