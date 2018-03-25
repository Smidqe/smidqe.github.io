/*
    This could be combined with layout?
*/
function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'originals',
            requires: ['menu'],
        },
        group: 'patches',
        script: true,
        settings: [{
            title: "Show original settings button",
            type: "checkbox",
            key: "showSettings",
            callback: null,
        }, {
            title: 'Show original emotes button',
            type: 'checkbox',
            key: 'showEmotes',
            callback: null,
        }],
        refresh: () => {
            const berrymotes = $('#chatControls > .berrymotes_button');
            const settings = $('#chatControls > .settings');

            if (SmidqeTweaks.settings.get('showSettings'))
                settings.css('display', 'block');
            else
                settings.css('display', 'none');

            if (SmidqeTweaks.settings.get('showEmotes'))
                berrymotes.css('display', 'block');
            else
                berrymotes.css('display', 'none');
        },
        toggle: () => {
            
        },
        init: () => {
            $.each(self.settings, (key, setting) => {
                setting.callback = self.refresh;
            })

            self.refresh();
        },
    }

    return self;
}

SmidqeTweaks.add(load());
