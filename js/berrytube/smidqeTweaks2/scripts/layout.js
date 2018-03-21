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
        __menu: null,
        __windows: null,
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
                        'click': () => {__windows.show(key, true)}
                    }
                }

                __windows.create(window);
                __menu.add(menuItem);
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

            __menu.add([menuSettingsButton, menuEmotesButton])
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

            self.setupCSS();

            self.enabled = true;

            //modify the text on the
            __menu.update({id: 'tweaks', what: 'text', value: 'Disable tweaks'})
        },
        enable: () => {
            let loaded = false;

            self.interval = setInterval(() => { 
                if (self.maltweaks && window.MT)
                    loaded = window.MT.loaded;

                if (!self.maltweaks)
                    loaded = true;

                if (loaded)
                    self.load();

                if (self.enabled)
                    clearInterval(self.interval);
            }, 500);

            SmidqeTweaks.settings.set('layout', true, true);
        },

        disable: () => {
            //unwrap the wrapped elements
            if (!self.maltweaks)
                $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();

            SmidqeTweaks.settings.set('layout', false, true);
        },
        toggle: () => {
            if (SmidqeTweaks.settings.get('layout'))
                self.enable();
            else
                self.disable();
        },
        init: () => {
            //add menu group
            __menu = SmidqeTweaks.modules.menu;
            __windows = SmidqeTweaks.modules.windows;

            //add the necessary groups
            __menu.add({type: 'group', id: 'berrytube', title: 'Berrytube'});
            __menu.add({type: 'group', id: 'windows', title: 'Windows'});
            
            //add the toggle for the 
            __menu.add({type: 'element', id: ''});

            self.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://localhost/smidqetweaks/css/stweaks.css"/>');            
            self.maltweaks = SmidqeTweaks.settings.get('maltweaks');

            //this handles the initial playlist load
            socket.on('recvPlaylist', () => {
                if (!self.enabled)
                    return;
                
                $("#playlist").addClass("st-window-playlist");
            })

            SmidqeTweaks.patch(__windows, 'show', (key) => {
                if (key !== 'playlist')
                    return;
                
                SmidqeTweaks.modules.playlist.refresh();
            })


        }
    }

    return self;
}

SmidqeTweaks.add(load());
