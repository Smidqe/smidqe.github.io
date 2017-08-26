function load() {
    const self = {
        windows: null,
        grids: {
            time: {
                group: false,
                ids: ['time'],
                titles: ['Time'],
            },
            users: {
                group: false,
                ids: ['users'],
                titles: ['Users'],
            },
            drinks: {
                group: true,
                ids: ['drinks', 'dpm'],
                titles: ['Drinks', 'DPM'],
            },

        },
        buttons: {
            about: {
                window: false,
                callbacks: {
                    click: () => { window.open("http://berrytube.tv/about.php", "_blank") }
                },
            },
            settings: {
                window: false,
                callbacks: {
                    click: () => { showConfigMenu(true); }
                },
            },
            header: {
                window: true,
                callbacks: {}
            },
            footer: {
                window: true,
                callbacks: {}
            },
            rules: {
                window: true,
                callbacks: {}
            },
            polls: {
                window: true,
                callbacks: {}
            },
            messages: {
                window: true,
                callbacks: {
                    click: () => {
                        $("#st-button-messages").removeClass("st-button-changed");
                    }
                },
            },
            login: {
                window: true,
                callbacks: {}
            },
            playlist: {
                window: true,
                callbacks: {
                    click: () => {
                        smartRefreshScrollbar();
                        scrollToPlEntry(Math.max($(".overview > ul > .active").index() - 2), 0);
                        realignPosHelper();
                    }
                }
            },
            users: {
                window: true,
                callbacks: {}
            },
            toast: {
                window: false,
                callbacks: {
                    click: () => {
                        toggle();
                    }
                },
            },
        },
        bar: {},
        createButton: (key, data) => {
            const button = $('<button>', {
                class: 'st-button st-window-default',
                id: 'st-button-' + key,
                key: key,
                window: data.window,
                text: (key[0].toUpperCase() + key.slice(1)),
            })

            //these are always there
            button.on('click', function() {
                const key = $(this).attr('key');
                const window = $(this).attr('window');

                if (!window)
                    return;

                self.windows.toggle(key);
            })

            $.each(data.callbacks, (key, value) => {
                button.on(key, value());
            })
        },

        createGridBlock: (key, data) => {
            const block = $("<div>", { id: "st-container-info", class: "st-grid" });

            if (data.group)
            ;
        },
        init: () => {
            self.windows = SmidqeTweaks.modules.layout.modules.windows;
            self.bar.buttons = $('<div>', { class: "st-buttons-container" });
            self.bar.container = $("<div>", { id: "st-controls-container", class: "st-controls-wrap st-window-default" });

            self.bar.container.append(self.bar.buttons);

            console.log("loading bottom buttons")

            $.each(self.buttons, (key, value) => {
                self.createButton(key, value);
            })


            $('body').append(self.bar.container);
        },
    }

    return self;
}
SmidqeTweaks.modules.layout.modules.bottom = load();
