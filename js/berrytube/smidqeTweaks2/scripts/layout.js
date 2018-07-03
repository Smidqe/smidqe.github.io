/*
    
*/

function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'layout',
            requires: ['menu', 'toolbar', 'windows', 'settings', 'playlist', 'utilities'],
        },
        maltweaks: false,
        values: {
            rules: {
                selectors: ["#st-wrap-motd", "#motdwrap"],
                title: 'Rules'
            },
            header: {
                selectors: ["#st-wrap-header", "#headwrap", ],
                title: 'Header'
            },
            footer: {
                selectors: ["#st-wrap-footer", "#main #footwrap", ],
                wrap: true,
                title: 'Footer'
            },
            polls: {
                selectors: ["#pollbox"],
                classes: ["st-window-overlap"],
                wrap: true,
                title: 'Polls'
            },
            messages: {
                selectors: ["#mailboxDiv"],
                classes: ["st-window-overlap"],
                wrap: true,
                title: 'Messages'
            },
            login: {
                selectors: [".wrapper > #headbar"],
                wrap: true,
                title: 'Login'
            },
            playlist: {
                selectors: ["#main #leftpane"],
                classes: ["st-window-playlist", "st-window-overlap"],
                wrap: true,
                title: 'Playlist'
            },
            users: {
                selectors: ["#chatlist"],
                classes: ["st-window-overlap", "st-window-users"],
                wrap: true,
                title: 'Userlist'
            },
        },
        config: {
            group: 'layout',
            values: [{
                title: 'Enable layout',
                key: 'layout'
            }]
        },
        playlist: false,
        menu: null,
        windows: null,
        toolbar: null,
        createWindows: () => {
            let result = [];
            $.each(self.values, (key, value) => {
                let selector = (self.maltweaks && value.selectors.length > 1) ? value.selectors[1] : value.selectors[0];
                let window = {
                    id: key,
                    wrap: true,
                    selector: selector,
                    classes: [],
                };

                if (value.classes)
                    window.classes.push(...value.classes);

                result.push(window);
            });

            self.windows.create(result);
        },
        createMenuItems: () => {
            let result = [];
            $.each(self.values, (key, value) => {
                let menuItem = {
                    group: 'windows', 
                    id: key, 
                    title: value.title, 
                    callbacks: {
                        'click': () => {self.windows.show({name: key, show: true});}
                    }
                };

                result.push(menuItem);
            });

            self.menu.add(result);
        },
        prepare: () => {
            if (!self.maltweaks)
            {
                $('#extras, #banner, #countdown-error, #countdown-timers, body > .wrapper:first').wrapAll('<div id="st-wrap-header"></div>');
                $('#pollControl, #pollpane').wrapAll('<div id="pollbox"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>');
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            }

            self.createWindows();
            self.createMenuItems();

            //TODO: Remove these
            $("#chatpane").addClass("st-chat");
            $("#videowrap").addClass("st-video");

            SmidqeTweaks.patch({
                container: {
                    obj: SmidqeTweaks.modules.windows, 
                    name: 'layout'
                }, 
                name: 'show', 
                after: true, 
                callback: self.updatePlaylistPosition
            });

            self.settings.set('layout', true, true);
            self.updateToolbar();
        },
        unprepare: () => {
            $('#chatpane, #videowrap, #playlist').removeClass("st-chat st-video st-window-playlist");
            
            if (!self.maltweaks)
                $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();

            $.each(self.values, (window, key) => {
                self.windows.remove(window);
            });

            SmidqeTweaks.unpatch({
                container: 'layout', 
                name: 'show', 
                callback: self.updatePlaylistPosition
            });

            self.settings.set('layout', false, true);
            self.updateToolbar();
        },
        updateToolbar: () => {
            let values = ['layout', 'menu'];

            if (!self.settings.get('layout'))
                values.reverse();

            self.toolbar.hide(values[0]);
            self.toolbar.show(values[1]);
        },
        enable: () => {
            if (self.maltweaks) {
                let interval = setInterval(() => {
                    if (self.utilities.linearCheck(MT, MT.loaded)) {
                        self.prepare();
                        clearInterval(interval);
                    }
                }, 500);
            } else
                self.utilities.waitFor('#playlist', self.prepare);
        },
        disable: () => {
            if (!SmidqeTweaks.get('settings').get('layout'))
                return;
            
            self.unprepare();
        },
        updatePlaylistPosition: (data) => {
            if (data.name !== 'playlist')
                return;

            SmidqeTweaks.get('playlist').refresh();
        },
        init: () => {
            self.menu = SmidqeTweaks.modules.menu;
            self.windows = SmidqeTweaks.modules.windows;
            self.toolbar = SmidqeTweaks.modules.toolbar;

            self.utilities = SmidqeTweaks.get('utilities');
            self.settings = SmidqeTweaks.get('settings');

            self.maltweaks = SmidqeTweaks.get('settings').get('maltweaks');
            
            self.menu.add([
                {type: 'group', id: 'berrytube', title: 'Berrytube'}, {type: 'group', id: 'windows', title: 'Windows'},
                {group: 'layout', id: 'layout', title: 'Disable layout', callbacks: {'click': () => self.disable()}}
            ]);

            self.toolbar.add({
                id: 'layout',
                text: 'Tweaks',
                tooltip: 'Enable/Disable layout',
                toggle: true,
                callbacks: {
                    'click': () => self.enable()
                }
            });
        }
    };

    return self;
}

SmidqeTweaks.add(load());
