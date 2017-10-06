/*
	Hides/shows the original settings button
*/
function load() {
    const self = {
        name: 'hideSettings',

        settings: [{

        }],

        enable: () => {
            $('#chatControls > .settings').addClass('st-window-default');
        },
        disable: () => {
            $('#chatControls > .settings').removeClass('st-window-default');
        },
    }

    return self;
}

SmidqeTweaks.addScript('hideSettings', load());
