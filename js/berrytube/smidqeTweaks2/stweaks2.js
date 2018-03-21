/*
    TODO:
        - Move layout to scripts, DONE
        - Rework the information system for modules DONE
        - Rework the start module system DONE
        
        - Integration with wutShot
            * Show the amount of shots taken
            * Squee when button is ready for another shot
            * ???

        - New setting data structure
            - group
            - values
                - title
                - key
                - reload (requires a reload to take effect (alert!))
                - requires (requires other settings)
                - group ()


        - Possibly rework the settings
            - Allow dependencies of certain settings
        
*/
const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //simplistic methods
    check: null,
    queue: {},
    names: { //holds the names for modules, scripts and groups
        modules: ['toolbar', 'windows', 'playlist', 'menu', 'stats', 'time', 'chat', 'utilities'],
        scripts: ['layout', 'pollAverage', 'rcvSquee', 'titleWrap', 'showDrinks', 'trackPlaylist', 'showTime'],
        groups: ['dependencies', 'time', 'chat', 'playlist', 'poll'],
    },
    //will hold all depedencies
    config: {
        group: 'dependencies',
        values: [{
            title: 'Using MalTweaks',
            key: 'maltweaks',
        }, {
            title: 'Using BerryTweaks',
            key: 'berrytweaks',
        }]
    },
    //possiblity to move this into a module or scatter it to this file??
    settings: {
        container: null,
        storage: {},
        group: (method, name) => {
            if (method === 'get')
                return self.settings.container.find('#st-settings-group-' + name);

            if (method === 'create' && name)
            {
                let title = name[0].toUpperCase() + name.slice(1);
                let label = $('<label>', {class: 'st-settings-group-label', text: title});
                let wrap = $('<div>', {id: 'st-settings-group-' + name, class: 'st-settings-group'});

                return wrap.append(label);
            }
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
            self.settings.storage = JSON.parse(localStorage.SmidqeTweaks || '{}')
        },
        save: () => {
            localStorage.SmidqeTweaks = JSON.stringify(self.settings.storage);
        },
        create: (data) => {
            const wrap = $('<div>', { class: 'st-settings-wrap' }).append($('<label>', { text: data.title }));
            const element = $('<input>', {
                    type: data.type ? data.type : 'checkbox',
                    checked: self.settings.get(data.key),
                    'data-key': data.key,
                    'data-reload': data.reload
                })
                .change(function() {
                    let checked = $(this).prop('checked');
                    let key = $(this).data('key');
                    let reload = $(this).data('reload')

                    self.settings.set(key, checked, true);

                    if (self.names.scripts.indexOf(key) !== -1)
                    {
                        let script = self.scripts[key];
                        
                        if (checked)    
                            script.enable();
                        else
                            script.disable();
                    }
                    
                    if (reload)
                        alert('Refresh is needed to take effect');
                })

            if (data.sub)
                wrap.addClass('st-setting-sub');

            return wrap.append(element);
        },
        append: (cont, settings) => {
            if (!settings)
                return;

            const group = self.settings.group('get', settings.group);
            
            $.each(settings.values, (key, val) => {
                let setting = self.settings.create(val);

                if (val.group)
                    self.settings.group('get', val.group).append(setting);
                else
                    group.append(setting);
            })

            return group;
        },
        show: () => {
            let cont = self.settings.container || $('<fieldset>');

            if (!self.settings.container)
                self.settings.container = cont;

            cont.empty();
            cont.append($('<legend>', { text: 'SmidqeTweaks' }));

            //create the groups
            $.each(self.names.groups, (key, grp) => {
                cont.append(self.settings.group('create', grp));
            })

            self.settings.append(cont, self.config);

            //use the names defined in self.names, to ensure same order everytime
            $.each(self.names.modules, (key, mod) => {
                self.settings.append(cont, self.modules[mod].settings);
            })

            $.each(self.names.scripts, (key, mod) => {
                self.settings.append(cont, self.scripts[mod].settings);
            })

            $("#settingsGui > ul").append($('<li>').append(cont));
        }
    },
    add: (mod) => {
        if (!mod.meta)
            return;
        
        let location = mod.meta.group === 'script' ? self.scripts : self.modules;

        if (mod.meta.name)
            location[mod.meta.name] = mod;

        //don't init twice those that are core modules (is this required anymore???)
        if (mod.init && (self.names.modules.indexOf(mod.meta.name) == -1))
            self.queue[mod.meta.name] = mod;
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

            let check = self.modules[mod.requires[index]];

            if (!check)
                result = false;
            else 
                result = !!check.init ? check.started : true;
        })

        return result;
    },

    startModule: (mod, src) => {
        //if something need to be initialised
        if (mod.init)
            mod.init();

        //enable script according to settings
        if (mod.meta.group === 'script' && self.settings.get(mod.meta.name))
            mod.enable();

        delete src[mod.meta.name];
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
        $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://localhost/smidqetweaks/css/stweaks-min.css"/>'))

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
    },
}

window.SmidqeTweaks = self;
self.init();
