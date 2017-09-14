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
            const button = $("<div>", {
                class: "st-button-control",
                id: "st-button-control-" + data.id,
                text: data.text,
            });

            if (data.isToggle)
                button.on('click', function() {
                    $(this).toggleClass('active');
                })

            if (data.tooltip)
                button.attr('title', data.tooltip);

            if (SmidqeTweaks.settings.get(data.setting) || data.active)
                button.addClass('active');

            self.bar.append(button);

            $.each(data.callbacks, (key, value) => {
                self.addCallback(data.id, key, value);
            })

        },
        remove: (key) => {
            delete self.bar[key];
        },
        addCallback: (id, key, callback) => {
            $("#st-button-control-" + id).on(key, callback);
        },
        show: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                $("#st-button-control-" + sub).removeClass('hidden');
            })
        },

        hide: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                if (!self.buttons[sub].alwaysVisible)
                    $("#st-button-control-" + sub).addClass('hidden');
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

SmidqeTweaks.addModule('toolbar', load(), 'main');
