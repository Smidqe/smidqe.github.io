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
*/

function load() {
    const self = {
        name: 'loadLayout',
        category: 'script',
        tries: 5,
        /*
        buttons: [{
            text: "Enable/Disable tweaks",
            id: 'tweaks',
            type: 'button',
            toggle: true,
            'data-key': 'tweaks',
            callbacks: {},
        }],

        */
        //need to think through this part
        
        windows: {
            rules: {
                title: 'Rules and MotD',
                selectors: [],
                classes: [], //only special classes
            },
            header: {
                title: 'Berrytube header',
                selectors: [],
            }
        },
        enable: () => {
            //load windows
            $.each(self.windows, (key, value) => {
                let index = self.maltweaks && value.selectors.length > 1 ? value.selectors[1] : value.selectors[0];

                var window = {
                    id: key,
                    wrap: true,
                    selector: value.selectors[index],
                    titlebar: {
                        remove: false,
                        title: value.title,
                    },
                    classes: ['st-window-default', 'st-window-wrap'].push(...value.classes)
                }

                self.windows.add(window);
            })

            //add wraps to the if maltweaks is not enabled
            if (!self.maltweaks)
            {
                $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            }
        },

        disable: () => {
            $.each(self.windows)

            //unwrap the wrapped elements
            if (!self.maltweaks)
                $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();
        },

        init: () => {
            self.settings = SmidqeTweaks.settings;
            self.utilities = SmidqeTweaks.modules.utilities;

            self.maltweaks = self.settings.get('maltweaks');

            if (!self.settings.get('layout'))
                return;

            //we have layout enabled by default, so 
            self.interval = setInterval(() => {
                if (self.maltweaks && self.utilities.check(window.MT, window.MT.loaded) || !(self.settings.get('maltweaks')))
                    self.enable();

                if (self.enabled)
                    clearIntervals(self.interval);
            }, 500);
        }
    }

    return self;
}

SmidqeTweaks.add(load());
