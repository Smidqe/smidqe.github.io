function load() {
    const self = {
        container: null,
        storage: {},
        groups: ['chat', 'polls', 'playlist', 'patches'],
        get: (key, fallback) => {
            return self.storage[key] || fallback;
        },
        set: (key, value, save) => {
            self.storage[key] = value;

            if (save)
                self.save();
        },
        load: () => {
            self.storage = JSON.parse(localStorage.SmidqeTweaks2 || '{}')
        },
        save: () => {
            localStorage.SmidqeTweaks2 = JSON.stringify(self.storage);
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
                    self.refresh();
                })

            if (data.sub)
                wrap.addClass('st-setting-sub');

            return wrap.append(element);
        },
        show: () => {
            var cont = self.container;

            if (!cont)
                cont = $('<fieldset>');

            cont.empty();
            cont.append($('<legend>', { text: 'SmidqeTweaks' }));

            //create the groups
            $.each(self.groups, (key, val) => {
                cont.append($('<div>', {
                    class: 'st-settings-group ' + val,
                }).append($('<label>', {
                    text: (val[0].toUpperCase() + val.slice(1)),
                })));
            })

            //add to those groups
            $.each(SmidqeTweaks.scripts, (key, mod) => {
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
    }

    return self;
}
SmidqeTweaks.settings = load();
