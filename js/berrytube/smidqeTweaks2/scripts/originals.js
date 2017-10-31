/*
	Hides/shows the original emotes/settings button
*/
function load() {
    const self = {
        name: 'originals',
        group: 'patches',
        script: true,
        settings: [{
            title: "Show original settings button",
            type: "checkbox",
            key: "showSettings",
        }, {
            title: 'Show original emotes button',
            type: 'checkbox',
            key: 'showEmotes'
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
        init: () => {
            $.each(self.settings, () => {
                setting.callbacks.click = self.refresh;
            })
        },
    }

    return self;
}

SmidqeTweaks.addModule('originals', load());
