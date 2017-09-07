function load() {
    const self = {
        bar: null,
        buttons: [{
            id: 'tweaks',
            text: 'T',
            tooltip: 'Toggle tweaks',
            setting: 'active',
            alwaysVisible: true,
            callbacks: {
                click: () => {
                    if (SmidqeTweaks.settings.get('active'))
                        SmidqeTweaks.modules.layout.disable();
                    else
                        SmidqeTweaks.modules.layout.enable();
                },
            }
        }, {
            id: 'video',
            text: 'V',
            tooltip: 'Show/Hide the video',
            active: true,
            callbacks: {
                click: () => {
                    SmidqeTweaks.getModule('video', 'layout').toggle();
                }
            },
            deps: [],
        }, {
            id: 'drinktest',
            text: 'D',
            tooltip: 'Add a test drink message',
            callbacks: {
                click: () => {
                    SmidqeTweaks.modules.chat.add('ST', 'DRINK TEST', 'drink');
                }
            }
        }],
        create: (data) => {
            const button = $("<div>", {
                class: "st-button-control",
                id: "st-button-control-" + data.id,
                text: data.text,
            });

            button.on('click', function() {
                $(this).toggleClass('active');
            })

            $.each(data.callbacks, (key, value) => {
                button.on(key, value);
            })

            if (data.tooltip)
                button.attr('title', data.tooltip);

            if (SmidqeTweaks.settings.get(data.setting) || data.active)
                button.addClass('active');

            self.bar.append(button)
        },
        enable: () => {
            $.each(self.buttons, (key, button) => {
                $('#st-button-control-' + button.id).removeClass('hidden');
            })
        },
        disable: () => {
            $.each(self.buttons, (key, button) => {
                if (!button.alwaysVisible)
                    $('#st-button-control-' + button.id).addClass('hidden');
            })
        },
        init: () => {
            self.bar = $("<div>", { id: "st-toolbar-wrap" });

            $.each(self.buttons, (key, button) => {
                self.create(button);
            })

            $('#chatControls').append(self.bar);
        },
    };

    return self;
}

SmidqeTweaks.addModule('toolbar', load(), 'layout');
