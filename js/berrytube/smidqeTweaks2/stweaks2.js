/*
    TODO:
        Rework the stats window 
*/

const self = {
    modules: {}, 
    scripts: {}, 
    callbacks: {},
    dependencies: {},
    queue: [],
    updater: false,
    names: { 
        modules: ['settings', 'toolbar', 'windows', 'playlist', 'menu', 'stats', 'time', 'chat', 'utilities', 'polls', 'colors'],
        scripts: [
            'layout', 'pollAverage', 'rcvSquee', 'titleWrap', 
            'showDrinks', 'trackPlaylist', 'showTime', 'berryControls', 
            'hideOriginals', 'usercount', 'wutColorRefresh', 'pollClose',
            'preventVideoRefresh'
        ],
        groups: ['time', 'chat', 'playlist', 'polls', 'berry', 'patches', 'random'],
        others: ['maltweaks', 'berrytweaks', 'wutcolors'],
        enabled: [],
    },
    descriptions: {
        maltweaks: 'Maltweaks made by Malsententia',
        berrytweaks: 'BerryTweaks, made by Atte',
        wutcolors: 'Username colorisation by wut',
        
        layout: 'Custom layout for Berrytube',
        pollClose: 'Notify when the poll is closed',
        pollAverage: 'Calculate episode average when poll closes',
        rcvSquee: 'Squee when RCV message is received',
        titleWrap: 'Wrap BerryTweaks videotitle to a separate line',
        showDrinks: 'Show the amount of drinks in chat',
        trackPlaylist: 'Track playlist changes',
        showTime: 'Show time in toolbar',
        berryControls: 'Modularize playlist and poll controls when given berry',
        hideOriginals: 'Hide the original emote/settings buttons (needs layout enabled)',
        usercount: 'Show usercount in the userlist window (needs layout enabled)',
        wutColorRefresh: 'Move wutColors refresh button to titlebar'
    },
    add: (mod) => {
        if (!mod.meta)
            return;

        self[mod.meta.group][mod.meta.name] = mod;

        $.each(mod.meta.requires || [], (index, value) => {
            self.dependencies[value].push(mod.meta.name);
        });

        self.start(mod);
    },
    load: (data, callback) => {
        if (self[data.dir][data.name] || (self.queue.indexOf(data.name) !== -1))
            return;

        let path = `https://smidqe.github.io/js/berrytube/smidqeTweaks2/${data.dir}/${data.name}.js`;

        if (data.path)
            path = data.path;

        self.queue.push(data.name);

        $.ajax(path, {
            cache: false,
            dataType: "script",
        });
    },
    unload: (data) => {
        let values = [];
        let mod = self[data.dir][data.name];

        if (!mod)
            return;

        if (data.dir === 'scripts')
            values = mod.meta.requires;

        if (mod.disable)
            mod.disable();

        self.notify({id: 'moduleUnload', data: Object.assign({}, mod)});

        $.each(values, (index, val) => {
            self.dependencies[val] = self.dependencies[val].filter(script => script !== data.name);

            if (self.dependencies[val].length === 0)
                self.unload({dir: 'modules', name: val});
        });

        delete self[data.dir][data.name];
    },
    get: (key) => {
        if (self.names.modules.indexOf(key) !== -1)
            return self.modules[key];

        if (self.names.scripts.indexOf(key) !== -1)
            return self.scripts[key];
        
        return undefined;
    },
    unpatch: (data) => {
        if (data instanceof Array)
        {
            $.each(data, sub => self.unpatch(sub));
            return;
        }

        self.callbacks[data.container][data.name] = self.callbacks[data.container][data.name].filter((value) => {
            return data.callback !== value.callback;
        });
    },
    patch: (data) => {
        if (data instanceof Array)
        {
            $.each(data, index => self.patch(data[index]));
            return;
        }
        
        let container = data.container.name;
        let name = data.name;

        if (!self.callbacks[container])
            self.callbacks[container] = {};
        
        if (!self.callbacks[container][name])
            self.callbacks[container][name] = [];

        let original = data.container.obj[name];
        let cont = self.callbacks[container];

        if (cont[data.name].length === 0)
            cont[data.name] = [original];

        if (data.after || (data.after === undefined))
            cont[data.name].push(data.callback);
        else
            cont[data.name].unshift(data.callback);

        let patch = function () {
            let result;

            for (let f of cont[data.name])
            {
                try {
                    if (f === original)
                        result = f.apply(this, arguments);
                    else
                        f.apply(this, arguments);
                } catch (error) {
                    console.log(error);
                }
            }

            return result;
        };

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
            });

            if (start && mod.init)
                mod.init();

            if (start)
            {
                let data = {
                    id: 'moduleAdd',
                    key: mod.meta.name,
                    mod: mod
                };

                self.notify(data);
                self.queue.splice(self.queue.indexOf(data.key), 1);

                clearInterval(interval);
            }
        }, 1500);
    },
    update: () => {
        $.each(self.names.enabled, (index, key) => {
            self.load({dir: 'scripts', name: key});
        });
    },
    init: () => {
        console.log("Loading Smidqetweaks");

        $.each(self.names.modules, (index, val) => {
            self.dependencies[val] = [];
        });

        self.dependencies.settings.push('main');

        $('head').append($('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="https://smidqe.github.io/js/berrytube/css/stweaks.css"/>'));
        
        self.load({dir: 'modules', name: 'settings'});
    },
};

window.SmidqeTweaks = self;
self.init();
