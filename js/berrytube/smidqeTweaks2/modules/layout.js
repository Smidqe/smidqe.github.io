/*
Add more files to layout
    - video, chat, playlist \\hmmm
*/

function load() {
    const self = {
        runnable: true,
        started: false,
        requires: ['listeners', 'time', 'toolbar'], //soon menu aswell
        enabled: false,
        stylesheet: null,
        name: 'layout',
        button: {
            id: 'tweaks',
            text: 'T',
            tooltip: 'Enable/disable tweaks',
            active: false,
            isToggle: true,
            callbacks: {},
        },
        listeners: {
            maltweaks: {
                path: "body",
                config: { childList: true },
            },

            berrytweaks: { //if there will be more than one use for this, change the name
                path: "head",
                config: { childList: true },
            }
        },
        modules: {},
        check: null,
        timeout: null,
        names: ['windows', 'toolbar', 'wraps', 'chat', 'playlist', 'video'],
        waitForModules: () => {
            if (Object.keys(self.modules).length != self.names.length)
                return;

            self.enable();
            clearInterval(self.check);
        },
        handleMaltweaks: (mutations) => {
            $.each(mutations, (key, mutation) => {
                if (!mutation.addedNodes)
                    return;

                $.each(mutation.addedNodes, (key, node) => {
                    if (node.id !== 'headwrap')
                        return;

                    if (node.id === 'headwrap' && !SmidqeTweaks.settings.get('maltweaks'))
                        SmidqeTweaks.settings.set('maltweaks', true, true);

                    if (SmidqeTweaks.settings.get("active") && SmidqeTweaks.settings.get("maltweaks")) {
                        clearTimeout(self.timeout);
                        self.check = setInterval(self.waitForModules, 500);
                    }
                })
            })
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

            const location = SmidqeTweaks.settings.get('maltweaks') ? $('body') : $('head');

            SmidqeTweaks.settings.set("active", true, true);

            location.append(self.stylesheet);

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

            self.stylesheet.remove();

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
            self.stylesheet = stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>')
            self.button.callbacks = {
                click: self.toggle
            };

            self.button.active = SmidqeTweaks.settings.get('active');
            self.toolbar = SmidqeTweaks.modules.toolbar;

            self.listeners.maltweaks.callback = self.handleMaltweaks;
            self.listeners.berrytweaks.callback = self.handleBerryTweaks;

            self.toolbar.add(self.button);

            $.each(self.listeners, (key, value) => {
                SmidqeTweaks.modules.listeners.start(value);
            });

            //hacky, but necessary
            if (SmidqeTweaks.settings.get('active') && (!SmidqeTweaks.settings.get('maltweaks')))
                self.enable();

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
