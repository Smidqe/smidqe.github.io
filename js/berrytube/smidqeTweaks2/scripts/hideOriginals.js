function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'hideOriginals',
            requires: ['menu', 'settings', 'utilities'],
        },
        config: {
            group: 'patches',    
            values: [{
                title: "Hide original settings/emote buttons",
                key: "hideOriginals",
                depends: ['layout'],
            }]
        },
        buttons: {},
        interval: null,
        hide: () => {
            $('#chatControls').addClass('st-controls-hidden');

            $.each(self.buttons, (key, value) => {
                self.menu.add(value);
            })
        },
        unhide: () => {
            $('#chatControls').removeClass('st-controls-hidden');

            $.each(self.buttons, key => {
                self.menu.remove('element', key);
            })
        },
        enable: () => {
            SmidqeTweaks.patch({
				container: {obj: SmidqeTweaks.scripts.layout, name: 'originals'},
				name: 'prepare',
				after: true,
                callback: self.hide,
			})

            SmidqeTweaks.patch({
				container: {obj: SmidqeTweaks.scripts.layout, name: 'originals'},
				name: 'unprepare',
				after: true,
				callback: self.unhide
            })

            if (self.settings.get('layout'))
                self.hide();
        },
        disable: () => {
            SmidqeTweaks.unpatch({
                container: 'originals',
                name: 'prepare',
                callback: self.hide
            })

            SmidqeTweaks.unpatch({
                container: 'originals',
                name: 'unprepare',
                callback: self.unhide
            })
        },
        init: () => {
            self.utilities = SmidqeTweaks.get('utilities');
            self.menu = SmidqeTweaks.get('menu');
            self.settings = SmidqeTweaks.get('settings');

            self.buttons = {
                settings: {
                    id: 'settings',
                    group: 'berrytube',
                    title: 'Settings',
                    callbacks: {
                        click: window.showConfigMenu
                    }
                },
                emotes: {
                    id: 'emotes',
                    group: 'berrytube',
                    title: 'Emotes',
                    callbacks: {
                        click: window.Bem.showBerrymoteSearch
                    }
                }
            }
        },
    }

    return self;
}

SmidqeTweaks.add(load());
