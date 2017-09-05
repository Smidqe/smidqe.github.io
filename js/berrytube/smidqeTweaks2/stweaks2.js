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
                    'tweak': data.sub == undefined,
                })
                .change(function() {
                    self.settings.save();

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
    recheck: () => {
        $.each(self.check, (key, value) => {
            if (!self.checkRequired(value))
                return;

            delete self.check[key];
            self.modules[key].init();
        })
    },
    load: () => {
        self.settings.load();

        $.each(self.names.modules, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/modules/${name}.js`, () => {
                const mod = self.modules[name];

                if (!self.checkRequired(mod))
                    self.check[name] = mod;

                if (!self.check[name] && mod.init)
                    mod.init();

                self.recheck();
            })
        })

        $.each(self.names.scripts, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/scripts/${name}.js`, () => {
                const script = self.scripts[name]

                //if we have some default functionality/or the way the script is built
                //start it
                //some scripts like showDrinks or  by default show things
                if (script.init)
                    script.init();
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

        console.log(self.getTime());
    },
}

window.SmidqeTweaks = self;
self.init();
