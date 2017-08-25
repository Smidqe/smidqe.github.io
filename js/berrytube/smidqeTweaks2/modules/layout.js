function load() {
    const self = {
        listeners: {},
        modules: {},
        names: ['bottom', 'infobox', 'toolbar', 'windows', 'wraps'],
        configs: {
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
            if ($("head > script").attr('href').indexOf("atte.fi") === -1)
                return;

            SmidqeTweaks.settings.set("berrytweaks", true, true);
            self.listeners['berrytweaks'].disconnect();
        },
        start: () => {
            $.each(self.modules, name => {
                self.modules[name].init();
            })
        },
        init: () => {
            //load the listeners
            self.settings = SmidqeTweaks.settings;

            self.configs.maltweaks.func = self.handleMaltweaks;
            self.configs.berrytweaks.func = self.handleBerryTweaks;

            self.settings.set('maltweaks', false, true);
            self.settings.set('berrytweaks', false, true)

            $.each(self.configs, (key, value) => {
                self.listeners[key] = SmidqeTweaks.listeners.load(value);
                self.listeners[key].start();
            });

            $.each(names, index => {
                $.getScript(`https://smidqe.github.io/js/berrytube/SmidqeTweaks2/layout/${names[index]}.js`)
            });

            if (!SmidqeTweaks.settings.get('maltweak') && SmidqeTweaks.settings.get('active'))
                self.start();
        },
    }

    return self;
}
SmidqeTweaks.layout = load();
