//this will be a fully rewritten smidqetweaks, trying to go without using mutationobserver
//

/*
    TODO:
        - Move chat, listeners, and playlist into libs folder
        - Load libs before any modules are loaded

        Create better method for loading the modules and scripts
        - If the module/script uses modules that haven't been added yet
        add them into a array, and everytime a module has been loaded, check the dependencies again
        - This way the order doesn't matter.
*/
const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //
    recheck: {},
    names: {
        modules: ['layout', 'listeners', 'chat', 'playlist'],
        scripts: ['playlistNotify', 'pollAverage', 'rcvSquee', 'showUsergroups', 'emoteCopy', 'emoteSquee', 'time', 'titlewrap'],
    },
    settings: {
        container: null,
        storage: {},
        groups: ['tweaks', 'chat', 'polls', 'playlist', 'patches'],
        get: (key, fallback) => {
            return self.settings.storage[key] || fallback;
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
                    self.settings.save();
                    //self.refresh();
                })

            if (data.sub)
                wrap.addClass('st-setting-sub');

            return wrap.append(element);
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

            //add to those groups
            $.each(self.scripts, (key, mod) => {
                if (!mod.settings)
                    return;

                //add every setting
                $.each(mod.settings, (key, val) => {
                    const setting = self.settings.create(val);
                    const group = cont.find('.st-settings-group.' + mod.group);

                    $(group).append(setting);
                })
            })

            $("#settingsGui > ul").append($('<li>').append(cont));
        }
    },
    addModule: (title, mod, _to) => {
        if (_to === 'layout')
            self.modules.layout.modules[title] = mod

        if (_to === 'main')
            self.modules[title] = mod;
    },
    removeModule: (title) => {
        delete self.modules[title];
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
    refresh: () => {
        $.each(self.modules, (key, mod) => {
            mod.disable();
            mod.enable();
        })

        /*
        $.each(self.scripts, (key, script) => {
            script.disable();
            script.enable();
        })
        */
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
        console.log(mod);

        if (!mod.requires)
            return true;



        var result = true;

        $.each(mod.requires, (index) => {
            if (!result) //if it is false
                return;

            result = self.modules[mod.requires[index]] !== undefined;
        })

        return result;
    },
    load: () => {
        self.settings.load();

        $.each(self.names.modules, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/modules/${name}.js`, () => {
                const mod = self.modules[name];

                if (!self.checkRequired(mod))
                    self.recheck[name] = mod;

                $.each(self.recheck, (key, value) => {
                    console.log(key, value);

                    if (self.checkRequired(value)) {
                        self.modules[key].init();
                        delete self.recheck[name];
                    }
                })
            })
        })

        $.each(self.names.scripts, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/scripts/${name}.js`)
        })
    },
    test: (event) => {
        console.log("Should print something")
        console.log(event);
    },
    init: () => {
        self.load();

        $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

        self.patch(window, 'showConfigMenu', () => {
            self.settings.show();
        })

        self.patch(window, 'closePoll', (data) => {
            console.log(data);
        })
    },
}

window.SmidqeTweaks = self;
self.init();
