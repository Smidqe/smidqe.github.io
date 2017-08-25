function load() {
    const self = {
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
            if ($("head > script").attr('href').indexOf("atte.fi") === -1)
                return;

            SmidqeTweaks.settings.set("berrytweaks", true, true);
            self.listeners['berrytweaks'].disconnect();
        },
        init: () => {
            //load the listeners
            self.settings = SmidqeTweaks.settings;

            self.listeners.maltweaks.func = self.handleMaltweaks;
            self.listeners.berrytweaks.func = self.handleBerryTweaks;

            self.settings.set('maltweaks', false, true);
            self.settings.set('berrytweaks', false, true)

            $.each(self.listeners, (key, value) => {
                self.listeners[key].observer = SmidqeTweaks.listeners.create(value);
                SmidqeTweaks.listeners.start(self.listeners[key]);
            });

            $.each(self.names, (index, value) => {
                $.getScript(`https://smidqe.github.io/js/berrytube/SmidqeTweaks2/layout/${value}.js`)
            });

            self.interval = setInterval(function() {
                if (self.modules.length != self.names.length)
                    return;

                $.each(self.modules, name => {
                    self.modules[name].init();
                })

                clearInterval(self.interval);
            }, 250)


        },
    }

    return self;
}
SmidqeTweaks.layout = load();
