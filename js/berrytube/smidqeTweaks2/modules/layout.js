/*
Add more files to layout
    - video, chat, playlist \\hmmm
*/

function load() {
    const self = {
        runnable: true,
        started: false,
        requires: ['listeners', 'time', 'toolbar'],
        enabled: false,
        button: {
            id: 'tweaks',
            text: 'T',
            tooltip: 'Enable/disable tweaks',
            active: false,
            callbacks: {},
        },
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
        names: ['windows', 'infobox', 'toolbar', 'wraps', 'chat', 'playlist', 'video', 'bottom'],
        waitForModules: (callback) => {
            if (Object.keys(self.modules).length != self.names.length)
                setTimeout(self.waitForModules(callback), 250);
            else
                callback();
        },
        handleMaltweaks: (mutation) => {
            if (mutation.id !== 'headwrap')
                return;

            if (mutation.id === 'headwrap' && !SmidqeTweaks.settings.get('maltweaks'))
                SmidqeTweaks.settings.set('maltweaks', true, true);

            if (SmidqeTweaks.settings.get("active") && SmidqeTweaks.settings.get("maltweaks"))
                self.waitForModules(self.enable);
        },
        handleBerryTweaks: () => {
            if ($("head > link").attr('href').indexOf("atte.fi") === -1)
                return;

            SmidqeTweaks.settings.set("berrytweaks", true, true);
            self.listeners['berrytweaks'].observer.disconnect();
        },
        enable: () => {
            $.each(self.listeners, (key, value) => {
                value.observer.disconnect();
            });

            const stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>')
            const location = SmidqeTweaks.settings.get('maltweaks') ? $('body') : $('head');

            SmidqeTweaks.settings.set("active", true, true)

            location.append(stylesheet);

            $.each(self.modules, (key, mod) => {
                mod.enable();
            })

            self.enabled = true;
        },
        disable: () => {
            SmidqeTweaks.settings.set("active", false, true)

            $.each(self.modules, (key, mod) => {
                mod.disable();
            })

            if (SmidqeTweaks.settings.get('maltweaks')) // patch/hack, fixes wrong sized header when exiting from tweaks
                $(".wrapper #dyn_header iframe").css({ "height": "140px" });

            self.enabled = false;
        },
        toggle: () => {
            if (self.enabled)
                self.disable();
            else
                self.enable();
        },
        init: () => {
            self.button.callbacks = {
                click: self.toggle
            };

            self.button.active = SmidqeTweaks.settings.get('active');
            self.toolbar = SmidqeTweaks.modules.toolbar;

            self.listeners.maltweaks.callback = self.handleMaltweaks;
            self.listeners.berrytweaks.callback = self.handleBerryTweaks;

            SmidqeTweaks.settings.set('maltweaks', false, true);
            SmidqeTweaks.settings.set('berrytweaks', false, true)

            self.toolbar.add(self.button);

            $.each(self.listeners, (key, value) => {
                SmidqeTweaks.modules.listeners.start(value);
            });

            //check if we have berrytweaks already in the m
            if (window.BerryTweaks)
                SmidqeTweaks.settings.set('berrytweaks', true, true);

            $.each(self.names, (index, value) => {
                $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/layout/${value}.js`, () => {
                    self.modules[value].init();
                })
            });

            setTimeout(() => {
                $.each(self.listeners, (key, value) => {
                    SmidqeTweaks.modules.listeners.stop(value);
                })
            }, 30000)

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('layout', load(), 'main');
