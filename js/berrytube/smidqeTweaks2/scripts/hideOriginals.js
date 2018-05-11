function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'hideOriginals',
            requires: ['menu', 'settings'],
        },
        group: 'patches',
        script: true,
        config: {
            group: 'patches',    
            values: [{
                title: "Hide original settings/emote buttons",
                key: "hideOriginals",
                depends: ['layout'],
            }]
        },
        buttons: {
            emotes: {
                id: 'emotes',
                group: 'berrytube',
                title: 'Emotes',
                callbacks: {
                    click: Bem.showBerrymoteSearch
                }
            },
            settings: {
                id: 'settings',
                group: 'berrytube',
                title: 'Settings',
                callbacks: {
                    click: window.showConfigMenu
                }
            }
        },
        enable: () => {
            $('#chatControls').addClass('st-controls-hidden');

            $.each(self.buttons, key => {
                SmidqeTweaks.get('modules', 'menu').add(self.buttons[key]);
            })
        },
        disable: () => {
            $('#chatControls').removeClass('st-controls-hidden');

            $.each(self.buttons, key => {
                SmidqeTweaks.get('modules', 'menu').remove(key);
            })
        },
    }

    return self;
}

SmidqeTweaks.add(load());
