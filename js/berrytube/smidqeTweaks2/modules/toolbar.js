function load() {
    const self = {

        add: (data) => {
            const button = $("<div>", {
                class: "st-button-control",
                id: "st-button-control-" + data.id,
                text: data.text,
            });

            button.on('click', function() {
                $(this).toggleClass('active');
            })

            if (data.tooltip)
                button.attr('title', data.tooltip);

            if (SmidqeTweaks.settings.get(data.setting) || data.active)
                button.addClass('active');

            self.bar.append(button)
        },

        remove: (key) => {
            delete self.bar[key];
        },

        addCallback: (key, data) => {
            $("st-toolbar-button-" + key).on(data.key, data.callback);
        },

        show: () => {

        },

        init: () => {
            self.bar = $("<div>", { id: "st-toolbar-wrap" });
        },
    }

    return self;
}

SmidqeTweaks.addModule('toolbar', load(), 'main');
