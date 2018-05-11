const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //simplistic methods
    callbacks: {},
    dependencies: {},
    queue: [],
    update: false,
    names: { //holds the names for modules, scripts and groups
        modules: ['settings', 'toolbar', 'windows', 'playlist', 'menu', 'stats', 'time', 'chat', 'utilities'],
        scripts: ['layout', 'pollAverage', 'rcvSquee', 'titleWrap', 'showDrinks', 'trackPlaylist', 'showTime', 'berryControls', 'hideOriginals', 'usercount'],
        groups: ['time', 'chat', 'playlist', 'polls', 'berry', 'patches'],
        enabled: [],
    },
    descriptions: {
        maltweaks: 'Maltweaks made by Malsententia',
        berrytweaks: 'BerryTweaks, made by Atte',
        layout: 'Custom layout for Berrytube',
        pollAverage: 'Calculate episode average when poll closes',
        rcvSquee: 'Squee when RCV message is received',
        titleWrap: 'Wrap BerryTweaks videotitle to a separate line',
        showDrinks: 'Show the amount of drinks in chat',
        trackPlaylist: 'Track playlist changes',
        showTime: 'Show time in toolbar',
        berryControls: 'Modularize playlist and poll controls when given berry',
        hideOriginals: 'Hide the original emote/settings buttons (needs layout enabled)',
        usercount: 'Show usercount in the userlist window (needs layout enabled)'
    },
    add: (mod) => {
        if (!mod.meta)
            return;

        self[mod.meta.group][mod.meta.name] = mod;

        $.each(mod.meta.requires || [], (index, value) => {
            self.dependencies[value].push(mod.meta.name);
        })

        self.start(mod);
    },
    load: (data, callback) => {
        if (self[data.dir][data.name] || self.queue.indexOf(data.name) !== -1)
            return;

        let path = `https://smidqe.github.io/js/berrytube/smidqeTweaks2/${data.dir}/${data.name}.js`

        //this will be gone at some point
        if (JSON.parse(localStorage.SmidqeTweaks).development)
            path = `http://localhost/smidqetweaks/${data.dir}/${data.name}.js`

        if (data.path)
            path = data.path;

        self.queue.push(data.name);

        $.ajax(path, {
            cache: false,
            dataType: "script",
        })
    },
    unload: (data) => {
        let values = [];
        let mod = self[data.dir][data.name]

        if (!mod)
            return;

        if (data.dir === 'scripts')
            values = mod.meta.requires;

        if (mod.disable)
            mod.disable();

        $.each(values, (index, val) => {
            self.dependencies[val] = self.dependencies[val].filter(script => script !== data.name)

            //unload the module since it's no longer needed
            if (self.dependencies[val].length === 0)
                self.unload({dir: 'modules', name: val});
        })

        delete self[data.dir][data.name];
    },
    get: (_from, title) => {
        return self[_from][title];
    },
    unpatch: (data) => {
        if (data instanceof Array)
        {
            $.each(data, sub => self.unpatch(sub))
            return;
        }

        self.callbacks[data.container][data.name] = self.callbacks[data.container][data.name].filter((value) => {
            return data.callback !== value.callback
        })
    },
    patch: (data) => {
        if (data instanceof Array)
        {
            $.each(data, index => self.patch(data[index]));
            return;
        }
        
        if (!self.callbacks[data.container.name])
            self.callbacks[data.container.name] = {};
        
        if (!self.callbacks[data.container.name][data.name])
            self.callbacks[data.container.name][data.name] = [];

        let original = data.container.obj[data.name];
        let cont = self.callbacks[data.container.name];

        if (cont[data.name].length === 0)
            cont[data.name] = [original];

        if (data.after)
            cont[data.name].push(data.callback);
        else
            cont[data.name].unshift(data.callback);

        let patch = function () {
            let result = undefined;

            for (let f of cont[data.name])
            {
                try {
                    if (f === original)
                        result = f.apply(this, arguments)
                    else
                        f.apply(this, arguments);
                } catch (error) {
                    console.log(error);
                }
            }

            return result;
        }

        data.container.obj[data.name] = patch;
    },
    notify: (data) => {}, // \\ppcute
    start: (mod) => {
        if (!mod.meta)
            return;

        let interval = setInterval(() => {
            let start = true;
            $.each(mod.meta.requires || [], (index, key) => {                
                if (self.queue.indexOf(key) !== -1)
                {
                    start = false;
                    return;
                }

                if (!self.modules[key] && self.queue.indexOf(key) === -1)    
                {
                    start = false;
                    self.load({dir: 'modules', name: key});
                    return;
                }

                if (self.modules[key].init && start)
                    start = self.modules[key].started;
            })

            if (start && mod.init)
                mod.init();

            if (start)
            {
                self.notify({key: mod.meta.name, mod: mod});

                self.queue.splice(self.queue.indexOf(mod.meta.name), 1);
                clearInterval(interval);
            }
        }, 1500);
    },
    update: () => {
        $.each(self.names.enabled, (index, key) => {
            if (!self.scripts[key])
                self.load({dir: 'scripts', name: key});
        })
    },
    init: () => {
        console.log("Loading Smidqetweaks");

        $.each(self.names.modules, (index, val) => {
            self.dependencies[val] = [];
        })

        //this prevents the settings module from being unloaded if las 
        self.dependencies['settings'].push('main');

        //append the min-css file
        //if (true)
            $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://localhost/smidqetweaks/css/stweaks-min.css"/>'))
        //else
            //$('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))    
        self.load({dir: 'modules', name: 'settings'});
    },
}

window.SmidqeTweaks = self;
self.init();
