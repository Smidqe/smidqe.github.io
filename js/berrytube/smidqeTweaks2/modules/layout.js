/*
    TODO:

        - Remove the listeners from here and use settings to figure out what scripts we are using,
        -

*/

function load() {
    const self = {
        runnable: true,
        started: false,
        requires: ['listeners', 'time', 'menu'], //soon menu aswell
        group: 'dependencies',
        enabled: false,
        settings: [{
            title: 'Using Maltweaks',
            type: 'checkbox',
            key: 'maltweaks'
        }, {
            title: 'Using BerryTweaks',
            type: 'checkbox',
            key: 'maltweaks'
        }],
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

            /*
            //Not needed anymore
            berrytweaks: { //if there will be more than one use for this, change the name
                path: "head",
                config: { childList: true },
            }
            */
        },
        modules: {},
        check: null,
        timeout: null,
        names: ['wraps', 'chat', 'playlist', 'video'],
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
        enable: () => {
            $.each(self.listeners, (key, value) => {
                value.observer.disconnect();
            });

            const location = SmidqeTweaks.settings.get('maltweaks') ? $('body') : $('head');

            SmidqeTweaks.settings.set("active", true, true);

            if (!$('#st-stylesheet')[0])
                location.append(self.stylesheet);

            $.each(self.names, (key, name) => {
                self.modules[name].enable();
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
            self.stylesheet = stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>');
            self.menu = SmidqeTweaks.modules.menu;

            self.button.callbacks = {
                click: self.toggle
            };

            self.button.active = SmidqeTweaks.settings.get('active');
            self.toolbar = SmidqeTweaks.modules.toolbar;

            /*
                Add menu items here
            */

            self.listeners.maltweaks.callback = self.handleMaltweaks;

            self.toolbar.add(self.button);

            $.each(self.listeners, (key, value) => {
                SmidqeTweaks.modules.listeners.start(value);
            });

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

            if (SmidqeTweaks.settings.get('active') && (!SmidqeTweaks.settings.get('maltweaks')))
                self.check = setInterval(self.waitForModules, 500);

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('layout', load(), 'main');
