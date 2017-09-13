function load() {
    const self = {
        buttons: {},
        settings: [{
            title: 'Hide original settings button',
            type: 'checkbox',
            key: 'hideSettings',
        }, {
            title: 'Hide original emotes button',
            type: 'checkbox',
            key: 'hideEmotes',
        }],
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

            console.log("Callbacks: ", data.callbacks);

            $.each(data.callbacks, (key, value) => {
                self.addCallback(data.id, value);
            })


            self.bar.append(button);
        },
        remove: (key) => {
            delete self.bar[key];
        },
        addCallback: (key, data) => {
            $("st-toolbar-button-" + key).on(data.key, data.callback);
        },
        show: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                $("#st-toolbar-button-" + sub).removeClass('hidden');
            })
        },

        hide: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                if (!self.buttons[sub].alwaysVisible)
                    $("#st-toolbar-button-" + sub).addClass('hidden');
            })
        },

        init: () => {
            self.bar = $("<div>", { id: "st-toolbar-wrap" });
            $("#chatControls").append(self.bar);
        },
    }

    return self;
}

SmidqeTweaks.addModule('toolbar', load(), 'main');
