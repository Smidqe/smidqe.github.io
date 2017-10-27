/*
    This module might be removed in the future,

    I think the toolbar will eventually just hold the menu button
    and some simplistic debugging buttons, like adding a new message
    poll, playlist and other creation/handling, all enabled from the menu
    Debugging options should not save, atleast not for now
*/
function load() {
    const self = {
        started: false,
        name: 'toolbar',
        buttons: {},
        settings: [{
            title: 'Hide original settings button',
            type: 'checkbox',
            key: 'hideSettings',
        }, {
            title: 'Hide original emotes button',
            type: 'checkbox',
            key: 'hideEmotes',
        }],
        add: (data) => {
            const element = $("<div>", {
                class: "st-toolbar-element",
                id: "st-toolbar-element-" + data.id,
                text: data.text,
            });

            if (data.isToggle)
                element.on('click', function() {
                    $(this).toggleClass('active');
                })

            if (data.tooltip)
                element.attr('title', data.tooltip);

            if (SmidqeTweaks.settings.get(data.setting) || data.active)
                element.addClass('active');

            self.bar.append(element);

            $.each(data.callbacks, (key, value) => {
                self.addCallback(data.id, key, value);
            })
        },
        remove: (key) => {
            delete self.bar[key];
        },
        addCallback: (id, key, callback) => {
            $("#st-toolbar-element-" + id).on(key, callback);
        },
        show: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                $("#st-toolbar-element-" + sub).removeClass('hidden');
            })
        },
        updateText: (key, value) => {
            $('#st-toolbar-element-' + key).text(value);
        },
        hide: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                if (!self.buttons[sub].alwaysVisible)
                    $("#st-toolbar-element-" + sub).addClass('hidden');
            })
        },

        init: () => {
            self.bar = $("<div>", { id: "st-toolbar-wrap" });
            $("#chatControls").append(self.bar);

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('toolbar', load());
