/*
Add more files to layout
    - video, chat, playlist \\hmmm
*/

function load() {
    const self = {
        runnable: true,
        settings: null,
        requires: ['listeners'],
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

            if (mutation.id === 'headwrap' && !self.settings.get('maltweaks'))
                self.settings.set('maltweaks', true, true);

            if (self.settings.get("active") && self.settings.get("maltweaks"))
                self.waitForModules(self.enable);
        },
        handleBerryTweaks: () => {
            if ($("head > link").attr('href').indexOf("atte.fi") === -1)
                return;

            self.settings.set("berrytweaks", true, true);
            self.listeners['berrytweaks'].observer.disconnect();
        },
        enable: () => {
            $.each(self.listeners, (key, value) => {
                value.observer.disconnect();
            });

            const stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>')
            const location = self.settings.get('maltweaks') ? $('body') : $('head');

            self.settings.set("active", true, true)

            location.append(stylesheet);

            $.each(self.modules, (key, mod) => {
                mod.enable();
            })
        },
        disable: () => {
            self.settings.set("active", false, true)

            $.each(self.modules, (key, mod) => {
                mod.disable();
            })

            if (self.settings.get('maltweaks')) // patch/hack, fixes wrong sized header when exiting from tweaks
                $(".wrapper #dyn_header iframe").css({ "height": "140px" });
        },
        init: () => {
            //load the listeners
            console.log("Starting ")

            self.settings = SmidqeTweaks.settings;

            self.listeners.maltweaks.func = self.handleMaltweaks;
            self.listeners.berrytweaks.func = self.handleBerryTweaks;

            self.settings.set('maltweaks', false, true);
            self.settings.set('berrytweaks', false, true)

            $.each(self.listeners, (key, value) => {
                self.listeners[key].observer = SmidqeTweaks.modules.listeners.create(value);
                SmidqeTweaks.modules.listeners.start(self.listeners[key]);
            });

            //check if we have berrytweaks already in the m
            if (window.BerryTweaks)
                self.settings.set('berrytweaks', true, true);

            $.each(self.names, (index, value) => {
                $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/layout/${value}.js`, () => {
                    self.modules[value].init();
                })
            });

            setTimeout(() => {
                $.each(self.listeners, (key) => {
                    self.listeners[key].observer.disconnect();
                })
            }, 30000)
        },
    }

    return self;
}

SmidqeTweaks.addModule('layout', load(), 'main');
