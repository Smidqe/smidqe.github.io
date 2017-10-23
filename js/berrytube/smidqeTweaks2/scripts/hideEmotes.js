/*
	Hides/shows the original emotes button
*/
function load() {
    const self = {
        name: 'hideEmotes',

        button: {
            text: "Enable/Disable tweaks",
            id: 'tweaks',
            category: 'SmidqeTweaks',
            group: 'General',
            type: 'button',
            toggle: true,
            'data-key': 'tweaks',
            callbacks: {},
        },

        enable: () => {
            //add menu button
        },
        disable: () => {
            //remove the menu button
        },
    }

    return self;
}

SmidqeTweaks.addScript('hideEmotes', load());
