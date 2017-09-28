/*
    Replace the exit button with a small image
    25px X 25px

    Once I've finished the necessary modules, clean all the modules

*/
const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //simplistic methods
    windows: {}, //possibly, will probably remove this
    check: null,
    queue: {},
    base: {},
    start: null,
    names: { //holds the names for modules, scripts and groups
        modules: ['listeners', 'toolbar', 'playlist', 'stats', 'chat', 'time', 'menu', 'windows', 'layout'],
        scripts: ['playlistNotify', 'pollAverage', 'rcvSquee', 'titleWrap', 'showDrinks'],
    },
    settings: {
        groups: ['dependencies', 'tweaks', 'chat', 'time', 'polls', 'playlist', 'patches', 'debug'],
        container: null,
        storage: {},
        get: (key) => {
            return self.settings.storage[key];
        },
        set: (key, value, save) => {
            self.settings.storage[key] = value;

            if (save)
                self.settings.save();
        },
        load: () => {
            self.settings.storage = JSON.parse(localStorage.SmidqeTweaks2 || '{}')
        },
        save: () => {
            localStorage.SmidqeTweaks2 = JSON.stringify(self.settings.storage);
        },
        create: (data) => {
            const wrap = $('<div>', { class: 'st-settings-wrap' }).append($('<label>', { text: data.title }));
            const element = $('<input>', {
                    type: data.type,
                    checked: self.settings.get(data.key),
                    'data-key': data.key,
                })
                .change(function() {
                    self.settings.set($(this).attr('data-key'), $(this).prop('checked'), true);

                    const script = self.scripts[$(this).attr('data-key')]

                    if (!script)
                        return;

                    if ($(this).prop('checked'))
                        script.enable();
                    else
                        script.disable();
                })

            if (data.sub)
                wrap.addClass('st-setting-sub');

            return wrap.append(element);
        },
        append: (cont, mod) => {
            if (!mod.settings)
                return;

            $.each(mod.settings, (key, val) => {
                const setting = self.settings.create(val);
                const group = cont.find('.st-settings-group.' + mod.group);

                $(group).append(setting);
            })
        },
        show: () => {
            var cont = self.settings.container;

            if (!cont)
                cont = $('<fieldset>');

            cont.empty();
            cont.append($('<legend>', { text: 'SmidqeTweaks' }));

            //create the groups
            $.each(self.settings.groups, (key, val) => {
                cont.append($('<div>', {
                    class: 'st-settings-group ' + val,
                }).append($('<label>', {
                    text: (val[0].toUpperCase() + val.slice(1)),
                })));
            })

            //use the names defined in self.names, to ensure same order everytime
            $.each(self.names.modules, (key, mod) => {
                self.settings.append(cont, self.modules[mod]);
            })

            $.each(self.names.scripts, (key, mod) => {
                self.settings.append(cont, self.scripts[mod]);
            })

            $("#settingsGui > ul").append($('<li>').append(cont));
        }
    },
    addModule: (title, mod, _to) => {
        if (_to === 'layout')
            self.modules.layout.modules[title] = mod

        if (_to === 'main')
            self.modules[title] = mod;

        //to start the module
        //self.queue[title] = mod;
    },
    removeModule: (title, _from) => {
        if (_from === 'main')
            delete self.modules[title];

        if (_from === 'layout')
            delete self.modules.layout[title];
    },
    getModule: (title, _from) => {
        if (_from === 'layout')
            return self.modules.layout.modules[title];

        if (_from === 'main')
            return self.modules[title];
    },
    getScript: (title) => {
        return self.scripts[title];
    },
    addScript: (title, script) => {
        self.scripts[title] = script;
    },
    addWindow: (name, win) => {
        self.windows[name] = win;
    },
    patch: (container, func, callback) => {
        const original = container[func];

        //don't patch an non existant function
        if (!original)
            return;

        container[func] = function() {
            const before = original.apply(this, arguments);
            callback.apply(this, arguments);
            return before;
        }
    },
    checkRequired: (mod) => {
        if (!mod.requires)
            return true;

        let result = true;

        $.each(mod.requires, (index) => {
            if (!result)
                return;

            const check = self.modules[mod.requires[index]]

            //check if it's not even loaded
            if (!check) {
                result = false;
                return;
            }

            //check if the module has finished loading
            if (!check.started) {
                result = false;
                return;
            }
        })

        return result;
    },

    startModule: (mod, src) => {
        //if module/script has something that is can't be disabled/enabled
        if (mod.init)
            mod.init();

        //enable script according to settings
        if (mod.script) {
            if (self.settings.get(mod.name))
                mod.enable();
        }

        delete src[mod.name];
    },

    load: () => {
        self.settings.load();

        $.each(self.names.modules, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/modules/${name}.js`, () => {
                self.base[name] = self.modules[name];
            })
        })

        $.each(self.names.scripts, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/scripts/${name}.js`, () => {
                self.base[name] = self.scripts[name];
            })
        })
    },
    init: () => {
        self.load();

        $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

        self.patch(window, 'showConfigMenu', () => {
            self.settings.show();
        })

        socket.on('clearPoll', (data) => {
            self.settings.set('polldata', data, true);
        })

        //will ensure that modules are loaded in right order
        self.start = setInterval(() => {
            var skip = false;

            //ensure everything is loaded
            $.each(self.names, (key, names) => {
                $.each(names, (index, key) => {
                    if (skip)
                        return;

                    if (!self.base[key])
                        skip = true;
                })
            })

            if (skip)
                return;

            $.each(self.names, (key, names) => {
                $.each(names, (index, key) => {
                    self.startModule(self.base[key], self.base);
                })
            })

            clearInterval(self.start);
        })

        self.check = setInterval(() => {
            if ($.isEmptyObject(self.queue))
                return;

            $.each(self.queue, (key, mod) => {
                if (!self.checkRequired(mod))
                    return;

                self.startModule(mod, self.queue);
            })
        }, 1000);
    },
}

window.SmidqeTweaks = self;
self.init();
