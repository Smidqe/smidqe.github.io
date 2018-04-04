/*
    - Layout
        - Video left (stays)
        - Chat right (stays)
        - Menu (changes) DONE

    - Data structures
        * Window:
            - title
            - selectors
            - 

    TODO:
        - Integration with theme changes for selected elements
*/

function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'layout',
            requires: ['menu', 'toolbar', 'windows'],
        },
        maltweaks: false,
        windows: {
            rules: {
                selectors: ["#st-wrap-motd", "#motdwrap"],
                title: 'Rules/MOTD'
            },
            header: {
                selectors: ["#st-wrap-header", "#headwrap", ],
                title: 'Header'
            },
            footer: {
                selectors: ["#st-wrap-footer", "#main #footwrap", ],
                title: 'Footer',
                wrap: true,
            },
            polls: {
                selectors: ["#pollpane"],
                classes: ["st-window-overlap"],
                title: 'Polls',
                wrap: true,
            },
            messages: {
                selectors: ["#mailboxDiv"],
                classes: ["st-window-overlap"],
                title: 'Messages',
                wrap: true,
            },
            login: {
                selectors: [".wrapper #headbar"],
                title: 'Login',
                wrap: true,
            },
            playlist: {
                selectors: ["#main #leftpane"],
                classes: ["st-window-playlist", "st-window-overlap"],
                title: 'Playlist',
                wrap: true,
            },
            users: {
                selectors: ["#chatlist"],
                classes: ["st-window-overlap", "st-window-users"],
                title: 'Userlist',
                wrap: true,
            },
        },
        stylesheet: null,
        playlist: false,
        __menu: null,
        __windows: null,
        __toolbar: null,
        loadWindows: () => {
            //create windows
            $.each(self.windows, (key, value) => {
                let selector = self.maltweaks && value.selectors.length > 1 ? value.selectors[1] : value.selectors[0];
                let window = {
                    id: key,
                    wrap: true,
                    selector: selector,
                    title: value.title,
                    classes: [],
                }

                if (value.classes)
                    window.classes.push(...value.classes);

                let menuItem = {
                    group: 'windows', 
                    id: key, 
                    title: value.title, 
                    callbacks: {
                        'click': () => {self.__windows.show(key, true)}
                    }
                }

                self.__windows.create(window);
                self.__menu.add(menuItem);
            })
        },
        setupCSS: () => {  
            if (self.enabled)
                (self.maltweaks ? $('body') : $('head')).append(self.stylesheet);
            else
                $('#st-stylesheet').remove();
        },
        specials: () => {
            if (self.enabled) 
            {
                $("#chatpane").addClass("st-chat");
                $("#videowrap").addClass("st-video");
                $("#playlist").addClass("st-window-playlist");
            }
            else
                $('#chatpane, #videowrap, #playlist').removeClass("st-chat st-video st-window-playlist");
        },
        wraps: () => {
            if (self.enabled) 
            {
                $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            }
            else
                $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();
        },
        updateToolbar: () => {
            let values = ['layout', 'menu'];

            if (!self.enabled)
                values.reverse();

            self.__toolbar.hide(values[0]);
            self.__toolbar.show(values[1]);
        },
        setup: () => {
            self.enabled = !self.enabled;

            if (!self.maltweaks)
                self.wraps();

            if (self.enabled)
                self.loadWindows();
            
            self.specials();
            self.setupCSS();
            self.updateToolbar();
        },
        enable: () => {
            let loaded = false;

            self.interval = setInterval(() => { 
                if (self.maltweaks && window.MT)
                    loaded = window.MT.loaded;

                if (!self.maltweaks)
                    loaded = true;

                if (loaded && $('#playlist')[0]) //use playlist.loaded()
                    self.setup();

                if (self.enabled)
                    clearInterval(self.interval);
            }, 500);

            SmidqeTweaks.settings.set('layout', true, true);
        },
        disable: () => {
            self.setup();
            
            $.each(self.windows, (window, key) => {
                self.__windows.remove(window);
            })

            SmidqeTweaks.settings.set('layout', false, true);
        },
        init: () => {
            //add menu group
            self.__menu = SmidqeTweaks.modules.menu;
            self.__windows = SmidqeTweaks.modules.windows;
            self.__toolbar = SmidqeTweaks.modules.toolbar;

            //add the necessary groups
            self.__menu.add([{type: 'group', id: 'berrytube', title: 'Berrytube'}, {type: 'group', id: 'windows', title: 'Windows'}])
            
            self.__menu.add({
                group: 'berrytube', 
                id: 'layout', 
                title: 'Disable layout', 
                callbacks: {
                    'click': () => {self.disable()}
                }
            })

            //add the toggle for tweaks
            self.__toolbar.add({
                id: 'layout',
                text: 'Tweaks',
                tooltip: 'Enable/Disable layout',
                toggle: true,
                callbacks: {
                    'click': () => {self.enable()}
                }
            });

            self.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css"/>').attr("href", "http://smidqe.github.io/js/berrytube/css/stweaks.css");
            self.maltweaks = SmidqeTweaks.settings.get('maltweaks');

            if (SmidqeTweaks.settings.get('development'))
                self.stylesheet.attr("href", "http://localhost/smidqetweaks/css/stweaks.css");

            SmidqeTweaks.patch(self.__windows, 'show', (key) => {
                if (key !== 'playlist')
                    return;
                
                SmidqeTweaks.modules.playlist.refresh();
            })
        }
    }

    return self;
}

SmidqeTweaks.add(load());
