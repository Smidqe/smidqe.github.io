/*
	Hides/shows the original emotes/settings button
*/
function load() {
    const self = {
        name: 'originals',

        settings: [{
            title: "Show original settings button",
            type: "checkbox",
            key: "showSettings",
        }, {
            title: 'Show original emotes button',
            type: 'checkbox',
            key: 'showEmotes'
        }],

        enable: () => {
            if (SmidqeTweaks.settings.get('showSettings'))
                $('#chatControls > .settings').css('display', 'block');

            if (SmidqeTweaks.settings.get('showEmotes'))
                $('#chatControls > .berrymotes_button').css('display', 'block');
        },
        disable: () => {
            if (!SmidqeTweaks.settings.get('showSettings'))
                $('#chatControls > .settings').css('display', 'none');

            if (!SmidqeTweaks.settings.get('showEmotes'))
                $('#chatControls > .berrymotes_button').css('display', 'none');
        },
    }

    return self;
}

SmidqeTweaks.addScript('originals', load());
