/*
    TODO:
        - Move layout to scripts
        - Rework the information system for modules
        - Rework the start module system
        - 
*/
const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //simplistic methods
    check: null,
    queue: {},
    names: { //holds the names for modules, scripts and groups
        modules: ['listeners', 'toolbar', 'playlist', 'menu', 'windows', 'stats', 'time', 'chat', 'layout'],
        scripts: ['pollAverage', 'rcvSquee', 'titleWrap', 'showDrinks', 'originals', 'trackPlaylist'],
    },
    settings: {
        groups: ['dependencies', 'tweaks', 'chat', 'time', 'polls', 'playlist', 'patches'],
        container: null,
        storage: {},
        addGroup: (id) => {
            //don't add duplicate group
            if (self.settings.groups.indexOf(id) !== -1)
                return;

            self.settings.groups.push(id);
        },
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
        /*
        create: (data) => {
            
        }
        */

        create: (data) => {
            const wrap = $('<div>', { class: 'st-settings-wrap' }).append($('<label>', { text: data.title }));
            const element = $('<input>', {
                    type: data.type,
                    checked: self.settings.get(data.key),
                    'data-key': data.key,
                })
                .change(function() {
                    const checked = $(this).prop('checked');
                    const key = $(this).attr('data-key');

                    self.settings.set(key, checked, true);

                    const script = self.scripts[key];

                    if (script) {
                        if (checked)
                            script.enable();
                        else
                            script.disable();
                    }

                    if (data.callback)
                        data.callback();
                })

            if (data.sub)
                wrap.addClass('st-setting-sub');

            return wrap.append(element);
        },
        append: (cont, mod) => {
            if (!mod.settings)
                return;

            $.each(mod.settings.ids, (key, val) => {
                const setting = self.settings.create(val);
                const group = cont.find('.st-settings-group.' + mod.group);

                $(group).append(setting);
            })
        },
        show: () => {
            var cont = self.settings.container || $('<fieldset>');

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
    add: (mod) => {
        if (mod.category == 'script')
            self.scripts[mod.name] = mod;
        else
            self.modules[mod.name] = mod;

        //don't init twice those that are core modules (is this required anymore???)
        if (mod.init && (self.names.modules.indexOf(mod.name) == -1))
            self.queue[mod.name] = mod;
    },
    remove: (title, _from) => {
        if (_from === 'script')
            delete self.scripts[title];
        else
            delete self.modules[title];
    },
    get: (title, _from) => {
        if (_from === "script")
            return self.scripts[title];
        else
            return self.modules[title];
    },
    //Credits to Atte and BerryTweaks, I just split them
    appendCallback: (container, func, callback) => {
        var original = container[func];
        var patch = function() {
            const before = original.apply(this, arguments);
            callback.apply(this, arguments);
            return before;
        }

        container[func] = patch;
    },
    prependCallback: (container, func, callback) => {
        var original = container[func];
        var patch = function() {
            if (callback.apply(this, arguments) !== false)
                return original.apply(this, arguments);

            return undefined;
        }

        container[func] = patch;
    },
    patch: (container, func, callback, prepend) => {
        if (!container[func])
            return;

        if (prepend)
            self.prependCallback(container, func, callback);
        else
            self.appendCallback(container, func, callback);
    },
    checkRequired: (mod) => {
        if (!mod.requires)
            return true;

        let result = true;

        $.each(mod.requires, (index) => {
            if (!result)
                return;

            const check = self.modules[mod.requires[index]];

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
        if (mod.script)
            if (self.settings.get(mod.name))
                mod.enable();

        delete src[mod.name];
    },

    load: () => {
        self.settings.load();

        $.each(self.names.modules, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/modules/${name}.js`, () => {
                self.queue[name] = self.modules[name];
            })
        })

        $.each(self.names.scripts, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/scripts/${name}.js`, () => {
                self.queue[name] = self.scripts[name];
            })
        })
    },
    init: () => {
        console.log("Loading Smidqetweaks");

        self.load();

        //append the min-css file
        $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

        self.check = setInterval(() => {
            if ($.isEmptyObject(self.queue))
                return;

            $.each(self.queue, (key, mod) => {
                if (!self.checkRequired(mod))
                    return;

                self.startModule(mod, self.queue);
            })
        }, 1000);

        self.patch(window, 'showConfigMenu', () => {
            self.settings.show();
        }, false);

        self.settings.add({
            text: 'Dependencies',
            titles: ['Using BerryTweaks', 'Using Maltweaks'],
            type: ['checkbox', 'checkbox'],
            keys: ['berrytweaks', 'maltweaks'],
            callbacks: [null, null],
            subs: [false, false],
        })
    },
}

window.SmidqeTweaks = self;
self.init();
