function load() {
    const self = {
        settings: null,
        listeners: {
            maltweaks: {
                path: "body",
                config: { childList: true },
                monitor: "added",
            },

            berrytweaks: { //if there will be more than one use for this, change the name
                path: "head",
                config: { childList: true },
                monitor: "added",
            }
        },
        modules: {},
        names: ['bottom', 'infobox', 'toolbar', 'windows', 'wraps'],
        handleMaltweaks: (mutation) => {
            const isMaltweaks = self.settings.get('maltweaks');

            if (mutation.id !== 'headwrap')
                return;

            if (mutation.id === 'headwrap' && !isMaltweaks)
                self.settings.set('maltweaks', true, true);

            if (self.settings.get("active") && self.settings.get("maltweaks"))
                self.start();
        },
        handleBerryTweaks: () => {
            if ($("head > link").attr('href').indexOf("atte.fi") === -1)
                return;

            self.settings.set("berrytweaks", true, true);
            self.listeners['berrytweaks'].disconnect();
        },
        init: () => {
            //load the listeners
            self.settings = SmidqeTweaks.modules.settings;

            self.listeners.maltweaks.func = self.handleMaltweaks;
            self.listeners.berrytweaks.func = self.handleBerryTweaks;

            self.settings.set('maltweaks', false, true);
            self.settings.set('berrytweaks', false, true)

            $.each(self.listeners, (key, value) => {
                self.listeners[key].observer = SmidqeTweaks.modules.listeners.create(value);
                SmidqeTweaks.modules.listeners.start(self.listeners[key]);
            });

            $.each(self.names, (index, value) => {
                $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/layout/${value}.js`, () => {
                    self.modules[name].init();
                })
            });
        },
    }

    return self;
}
SmidqeTweaks.modules.layout = load();
