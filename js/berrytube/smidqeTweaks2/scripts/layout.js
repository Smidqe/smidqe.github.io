/*
    - Layout
        - Video left (stays)
        - Chat right (stays)
        - Menu (changes)
            * Can be only opened on hover, will have a column of buttons or a full window (min vs full (settings))
            * Flexible (meaning can work atleast 720p)
            * Each button has either a hover or click
                * Most windows are click
                * Some are hover only

        - Playlist
            * Controls will be separated from the playlist and inserted into body
            * Playlist position varies
                * If opened from the controls it opens to the bottom of the controls
                * If opened from the menu, covers the chat, berry overrides this
                * Possibility to pop the playlist?
            * Having berry automatically opens the playlist controls and forces things

        
        - Userlist
            * Will not be a click type of window, will vanish once the mouse leaves the area
                * This can be changed from the settings if necessary
            * WutColors refresh button will be moved to the menu
                * wutColors -> refresh
            * Might have a shortcut somewhere in chat (same as emotes)
                * One side of the input a square button that opens a small menu
                * Will be a script
                    *
        - 

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
        menuElement: {
            element: ''
        },
        windows: {
            rules: {
                selectors: ["#st-wrap-motd", "#motdwrap"],
                title: 'Rules and MOTD'
            },
            header: {
                selectors: ["#st-wrap-header", "#headwrap", ],
                title: 'Berrytube header'
            },
            footer: {
                selectors: ["#st-wrap-footer", "#main #footwrap", ],
                title: 'Berrytube footer',
            },
            polls: {
                selectors: ["#pollpane"],
                classes: ["st-window-overlap"],
                title: 'Polls'
            },
            messages: {
                selectors: ["#mailboxDiv"],
                classes: ["st-window-overlap"],
                title: 'Personal messages'
            },
            login: {
                selectors: [".wrapper #headbar"],
                title: 'Login window'
            },
            playlist: {
                selectors: ["#main #leftpane"],
                classes: ["st-window-playlist", "st-window-overlap"],
                title: 'Playlist',
            },
            users: {
                selectors: ["#chatlist"],
                classes: ["st-window-users"],
                title: 'Userlist'
            },
        },
        stylesheet: null,
        load: () => {
            if (!self.maltweaks)
            {
                $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            }

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

                SmidqeTweaks.modules.windows.create(window);
            })
            
            //append the css sheet (full version)
            
            $("#chatpane").addClass("st-chat");
            $("#videowrap").addClass("st-video");

            let location = self.maltweaks ? $('body') : $('head');

            location.append(self.stylesheet);

            self.enabled = true;
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
            self.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://localhost/smidqetweaks/css/stweaks.css"/>');            
            self.maltweaks = SmidqeTweaks.settings.get('maltweaks');
            /*
                TODO:
                    - Add button to menu (eventually)
                    - 
            */

            //this handles the initial playlist load
            socket.on('recvPlaylist', () => {
                $("#playlist").addClass("st-window-playlist");
            })

            SmidqeTweaks.patch(SmidqeTweaks.modules.windows, 'show', (key) => {
                if (key !== 'playlist')
                    return;
                
                SmidqeTweaks.modules.playlist.refresh();
            })
        }
    }

    return self;
}

SmidqeTweaks.add(load());
