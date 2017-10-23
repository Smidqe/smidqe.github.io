/*
	Hides/shows the original settings button
*/
function load() {
    const self = {
        name: 'hideSettings',

        settings: [{

        }],

        button: {
            text: "Show settings",
            id: 'settings',
            category: 'Berrytube',
            group: 'General',
            type: 'button',
            toggle: true,
            'data-key': 'settings',
            callbacks: {},
        },

        enable: () => {
            $('#chatControls > .settings').addClass('st-window-default');

            //SmidqeTweaks.modules.menu.addElement(button);
        },
        disable: () => {
            $('#chatControls > .settings').removeClass('st-window-default');
            //SmidqeTweaks.modules.menu.removeElement(button);
        },
    }

    return self;
}

SmidqeTweaks.addScript('hideSettings', load());
