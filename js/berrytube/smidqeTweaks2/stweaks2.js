/*
    FUTURE:
        - MODULES:
            - infobox.js
                * Will hold all logic regarding the infobox
    
        - SCRIPTS:
            - showFullscreen.js
                * Will enable fullscreen mode where the chat is hidden, only squees will show up
                - Video will be almost fullscreen (minus the bottom)
                    - This is because 

            - 
*/
const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //
    check: {},
    names: {
        modules: ['layout', 'listeners', 'chat', 'playlist', 'time'],
        scripts: ['playlistNotify', 'pollAverage', 'rcvSquee', 'showUsergroups', 'emoteCopy', 'emoteSquee', 'titleWrap'],
    },
    settings: {
        container: null,
        storage: {},
        groups: ['tweaks', 'chat', 'time', 'polls', 'playlist', 'patches'],
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
                    'tweak': data.tweak,
                })
                .change(function() {
                    self.settings.set($(this).attr('data-key'), $(this).prop('checked'), true);

                    if (!$(this).attr('tweak'))
                        return;

                    const script = self.scripts[$(this).attr('data-key')]

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

            $.each(self.modules, (key, mod) => {
                self.settings.append(cont, mod);
            })

            $.each(self.scripts, (key, mod) => {
                self.settings.append(cont, mod);
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

        var result = true;

        $.each(mod.requires, (index) => {
            if (!result) //if it is false, doesn't matter if others are fine
                return;

            result = self.modules[mod.requires[index]] !== undefined;
        })

        return result;
    },
    recheck: (_type) => {
        $.each(self.check, (key, value) => {
            if (!self.checkRequired(value, _type))
                return;

            delete self.check[key];

            if (_type === 'module')
                self.modules[key].init();

            if (_type === 'script' && self.scripts[key].init)
                self.scripts[key].init();
        })
    },
    load: () => {
        self.settings.load();

        $.each(self.names.modules, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/modules/${name}.js`, () => {
                const mod = self.modules[name];

                if (!self.checkRequired(mod, 'module'))
                    self.check[name] = mod;

                if (!self.check[name] && mod.init)
                    mod.init();

                self.recheck('module');
            })
        })

        $.each(self.names.scripts, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/scripts/${name}.js`, () => {
                const script = self.scripts[name]

                if (!self.checkRequired(script, 'script'))
                    self.check[name] = script;

                if (!self.check[name] && script.init)
                    script.init();

                self.recheck('script');
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
            console.log(data);
            self.settings.set('polldata', data, true);
        })
    },
}

window.SmidqeTweaks = self;
self.init();
