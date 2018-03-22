/*
    - Layout
        - Video left (stays)
        - Chat right (stays)
        - Menu (changes) DONE

        - Playlist
            * Controls will be separated from the playlist and inserted into body
            * Playlist position varies
                * If opened from the controls it opens to the bottom of the controls
                * If opened from the menu, covers the chat, berry overrides this
                * Possibility to pop the playlist?
            * Having berry automatically opens the playlist controls and forces things


    - Data structures
        * Window:
            - title
            - selectors
            - 


    - Problem with maltweaks
        - 
*/

function load() {
    const self = {
        meta: {
            group: 'script',
            name: 'layout'
        },
        requires: ['menu', 'toolbar', 'windows'],
        setting: null,
        utilities: null,
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
            },
            polls: {
                selectors: ["#pollpane"],
                classes: ["st-window-overlap"],
                title: 'Polls'
            },
            messages: {
                selectors: ["#mailboxDiv"],
                classes: ["st-window-overlap"],
                title: 'Messages'
            },
            login: {
                selectors: [".wrapper #headbar"],
                title: 'Login'
            },
            playlist: {
                selectors: ["#main #leftpane"],
                classes: ["st-window-playlist", "st-window-overlap"],
                title: 'Playlist',
            },
            users: {
                selectors: ["#chatlist"],
                classes: ["st-window-overlap", "st-window-users"],
                title: 'Userlist'
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
                    titlebar: {
                        remove: false,
                        title: value.title,
                    },
                    classes: ['st-window-wrap'],
                }

                if (value.classes)
                    window.classes.push(...value.classes);

                let menuItem = {
                    type: 'element', 
                    element: 'div', 
                    group: 'windows', 
                    menu: true, 
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
        hideOriginals: () => {
            $('.settings, .berrymotes_button').css('display', 'none');

            if (!$('.berrymotes_button')[0])
            {
                //apply a patch for init script for berrymotes
                SmidqeTweaks.patch(Bem, 'berrySiteInit', () => {
                    $('.berrymotes_button').css('display', 'none');
                })
            }

            //add settings window and emote window
            let menuSettingsButton = {
                type: 'element', 
                element: 'div', 
                group: 'berrytube', 
                menu: true, 
                id: 'settings', 
                title: 'Settings', 
                callbacks: {
                    'click': () => {window.showConfigMenu()}
                }
            }

            let menuEmotesButton = {
                type: 'element', 
                element: 'div', 
                group: 'berrytube', 
                menu: true, 
                id: 'emotes', 
                title: 'Emotes', 
                callbacks: {
                    'click': () => {Bem.showBerrymoteSearch()}
                }
            }

            self.__menu.add([menuSettingsButton, menuEmotesButton])
        },
        setupCSS: (remove) => {
            if (!remove)
                (self.maltweaks ? $('body') : $('head')).append(self.stylesheet);
            else
                $('#st-stylesheet').remove();
        },
        load: () => {
            if (!self.maltweaks)
            {
                $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            }

            self.loadWindows();
            self.hideOriginals();

            //add custom classes to chat and video
            $("#chatpane").addClass("st-chat");
            $("#videowrap").addClass("st-video");
            $("#playlist").addClass("st-window-playlist");

            self.setupCSS();

            self.enabled = true;

            //modify the text on the
            self.__menu.update({id: 'tweaks', what: 'text', value: 'Disable tweaks'})
            self.__toolbar.hide('layout');
            self.__toolbar.show('menu');
        },
        enable: () => {
            let loaded = false;

            self.interval = setInterval(() => { 
                if (self.maltweaks && window.MT)
                    loaded = window.MT.loaded;

                if (!self.maltweaks)
                    loaded = true;

                if (loaded && $('#playlist')[0])
                    self.load();

                if (self.enabled)
                    clearInterval(self.interval);

                console.log("Enabled:", loaded);
            }, 500);

            SmidqeTweaks.settings.set('layout', true, true);
        },

        disable: () => {
            //unwrap the wrapped elements
            if (!self.maltweaks)
                $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();

            $("#chatpane").removeClass("st-chat");
            $("#videowrap").removeClass("st-video");
            $("#playlist").removeClass("st-window-playlist");

            SmidqeTweaks.settings.set('layout', false, true);

            self.__toolbar.show('layout');
            self.__toolbar.hide('menu');

            self.setupCSS(true);

            $.each(self.windows, (window, key) => {
                self.__windows.remove(window);
            })
        },
        toggle: () => {
            if (!SmidqeTweaks.settings.get('layout'))
                self.enable();
            else
                self.disable();
        },
        init: () => {
            //add menu group
            self.__menu = SmidqeTweaks.modules.menu;
            self.__windows = SmidqeTweaks.modules.windows;
            self.__toolbar = SmidqeTweaks.modules.toolbar;

            //add the necessary groups
            self.__menu.add({type: 'group', id: 'berrytube', title: 'Berrytube'});
            self.__menu.add({type: 'group', id: 'windows', title: 'Windows'});
            
            self.__menu.add({
                type: 'element', 
                element: 'div', 
                group: 'berrytube', 
                menu: true, 
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

            //$('#st-toolbar-element-time').css('left', 'right');

            if (SmidqeTweaks.settings.get('development'))
                self.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://localhost/smidqetweaks/css/stweaks.css"/>');            
            else
                self.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>');

            self.maltweaks = SmidqeTweaks.settings.get('maltweaks');

            //this handles the initial playlist load
            socket.on('recvPlaylist', () => {
                if (!self.enabled)
                    return;
                
                self.playlist = true;
            })

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
