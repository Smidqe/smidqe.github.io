function load() {
    const self = {
        settings: null,
        bar: null,
        buttons: {
            tweaks: {
                id: 'tweaks',
                text: 'T',
                tooltip: 'Toggle tweaks',
                deps: [],
                alwaysVisible: true,
                callbacks: {
                    click: () => {
                        if (self.settings.get('active'))
                            SmidqeTweaks.modules.layout.disable();
                        else
                            SmidqeTweaks.modules.layout.enable();
                    },
                    mouseenter: () => {},
                    mouseleft: () => {}
                }
            },
        },
        create: (data) => {
            const button = $("<div>", {
                class: "st-button-control",
                id: "st-button-control-" + data.id,
                text: data.text,
            });

            $.each(data.callbacks, (key, value) => {
                button.on(key, value);
            })

            if (data.tooltip)
                button.attr('title', data.tooltip);

            if (data.active)
                button.addclass('active');

            self.bar.append(button)
        },
        enable: () => {
            $.each(self.buttons, (key, value) => {
                /*
                if (!SmidqeTweaks.checkDeps(value.deps))
                	return;
				
                */

                $('#st-button-control-' + value.id).removeClass('hidden');
            })
        },
        disable: () => {
            $.each(self.buttons, (key, value) => {

                if (!value.alwaysVisible)
                    $('#st-button-control-' + value.id).addClass('hidden');
            })
        },
        init: () => {
            self.settings = SmidqeTweaks.settings;
            self.bar = $("<div>", { id: "st-toolbar-wrap" });

            $.each(self.buttons, (key, value) => {
                self.create(value);
            })

            $('#chatControls').append(self.bar);
        },
    };

    return self;
}

SmidqeTweaks.addModule('toolbar', load(), 'layout');
