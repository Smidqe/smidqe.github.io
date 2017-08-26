function load() {
    const self = {
        bar: null,
        buttons: {
            tweaks: {
                id: 'tweaks',
                text: 'T',
                tooltip: 'Toggle tweaks',
                callbacks: {
                    click: () => {
                        //SmidqeTweaks.modules.layout.toggle();
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
        show: () => {
            $.each(self.buttons, (key, value) => {
                /*
                if (!SmidqeTweaks.checkDeps(value.deps))
                	return;
				
                */

                $('#st-button-control-' + value.id).removeClass('hidden');
            })
        },
        hide: () => {
            $.each(self.buttons, (key, value) => {
                $('#st-button-control-' + value.id).addClass('hidden');
            })
        },
        init: () => {
            console.log('loading toolbar');

            self.bar = $("<div>", { id: "st-toolbar-wrap" });

            $.each(self.buttons, (key, value) => {
                self.create(value);
            })

            $('#chatControls').append(self.bar);
        },
    };

    return self;
}

SmidqeTweaks.modules.layout.modules.toolbar = load();
