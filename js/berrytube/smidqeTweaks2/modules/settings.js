const self = {
    container: null,
    storage: {},
    groups: ['chat', 'polls', 'playlist', 'patches'],
    get: (key, fallback) => {
        return self.storage[key] || fallback;
    },
    load: () => {
        self.storage = JSON.parse(localStorage.SmidqeTweaks || '{}')
    },
    save: () => {
        localStorage.SmidqeTweaks = JSON.stringify(self.storage);
    },
    create: (data, sub) => {
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

        if (sub)
            wrap.addClass('st-setting-sub');

        return wrap.append(element);
    },
    show: () => {
        var cont = self.container;

        if (!cont)
            cont = $('<fieldset>');

        cont.empty();
        cont.append($('<legend>', { text: 'SmidqeTweaks' }));

        $("#settingsGui > ul").append($('<li>').append(cont));

        //create the groups
        $.each(self.groups, (key, val) => {
            cont.append($('<div>', {
                class: 'st-settings-group ' + val,
            }).append($('<label>', {
                text: (val[0].toUpperCase() + val.slice(1)),
            })));
        })

        //add to those groups
        $.each(self.modules, (key, mod) => {
            if (!mod.settings)
                return;

            //add every setting
            $.each(mod.settings, (key, val) => {
                const setting = self.settings.create(val, !!val.sub)
                const group = '.st-settings-group.' + mod.group;

                $(group).append(setting);
            })
        })
    }
}

SmidqeTweaks.settings = self;
