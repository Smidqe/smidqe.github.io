/*
    TODO:
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
        scripts: ['layout', 'pollAverage', 'rcvSquee', 'titleWrap', 'showDrinks', 'trackPlaylist', 'showTime', 'playlistControls', 'pollControls'],
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
        dependencies: {},
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
                    'data-reload': data.reload,
                    'data-others': data.depends
                })
                .change(function() {
                    let checked = $(this).prop('checked');
                    let key = $(this).data('key');
                    let reload = $(this).data('reload');

                    self.settings.set(key, checked, true);

                    if (self.settings.dependencies[key])
                        self.settings.show(false);
                
                    if (self.names.scripts.indexOf(key) !== -1)
                        (checked ? self.scripts[key].enable : self.scripts[key].disable)();
                    
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
                if (!self.settings.check(val.depends))
                    return;

                let setting = self.settings.create(val);
                
                if (val.group)
                    self.settings.group('get', val.group).append(setting);
                else
                    group.append(setting);
            })

            return group;
        },
        check: (list) => {
            if (!list)
                return true;

            let result = true;

            $.each(list, (index, key) => {
                if (!result)
                    return;

                if (!self.settings.get(key))
                    result = false;
            })

            return result;
        },
        show: (append = true) => {
            let cont = self.settings.container || $('<fieldset>');

            if (!self.settings.container)
                self.settings.container = cont;
            else
                cont = self.settings.container;

            cont.empty();
            cont.append($('<legend>', { text: 'SmidqeTweaks' }));

            //create the groups
            $.each(self.names.groups, (key, grp) => {
                cont.append(self.settings.group('create', grp));
            })

            self.settings.append(cont, self.config);

            $.each(self.names, (key) => {
                if (key === 'groups')
                    return;

                $.each(self.names[key], (index, mod) => {
                    self.settings.append(cont, self[key][mod].settings);
                })
            })

            //use the names defined in self.names, to ensure same order everytime
            if (append)
                $("#settingsGui > ul").append($('<li>').append(cont));
        },
        updateDependencies: (settings) => {
            if (!settings)
                return;

            let deps = self.settings.dependencies
            $.each(settings.values, (index, value) => {
                if (!value.depends)
                    return;

                $.each(value.depends, (index, key) => {
                    if (!deps[key])
                        deps[key] = [];

                    deps[key].push(value.key);
                })
            })
        }
    },
    add: (mod) => {
        if (!mod.meta)
            return;

        self[mod.meta.group][mod.meta.name] = mod;

        //don't init twice those that are core modules (is this required anymore???)
        if (mod.init && (self.names.modules.indexOf(mod.meta.name) == -1))
            self.queue[mod.meta.name] = mod;
    },
    remove: (title, _from) => {
        delete self[_from][title];
    },
    get: (title, _from) => {
        return self[_from][title];
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
        if (!mod.meta.requires)
            return true;

        let result = true;
        let list = mod.meta.requires;

        $.each(list, (index) => {
            if (!result)
                return;

            let check = self.modules[list[index]];

            if (!check)
                result = false;
            else 
                result = !!check.init ? check.started : true;
        })

        return result;
    },

    startModule: (mod, src) => {
        //if something need to be initialised

        self.settings.updateDependencies(mod.settings);

        if (mod.init)
            mod.init();

        //enable script according to settings
        if (mod.meta.group === 'scripts' && self.settings.get(mod.meta.name))
            mod.enable();

        delete src[mod.meta.name];
    },
    load: () => {
        self.settings.load();

        $.each(self.names, (key) => {
            if (key === 'groups')
                return;

            $.each(self.names[key], (index, name) => {
                let path = `https://smidqe.github.io/js/berrytube/smidqeTweaks2/${key}/${name}.js`

                if (self.settings.get('development'))
                    path = `http://localhost/smidqetweaks/${key}/${name}.js`;

                $.getScript(path, () => {
                    self.queue[name] = self[key][name];
                })
            })
        })
    },
    init: () => {
        console.log("Loading Smidqetweaks");

        self.load();

        //append the min-css file
        if (self.settings.get('development'))
            $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://localhost/smidqetweaks/css/stweaks-min.css"/>'))
        else
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
    },
}

window.SmidqeTweaks = self;
self.init();
