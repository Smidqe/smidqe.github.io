/*
    TODO:

        - Remove the listeners from here and use settings to figure out what scripts we are using,
        -

*/

function load() {
    const self = {
        runnable: true,
        started: false,
        requires: ['listeners', 'menu'], //soon menu aswell
        group: 'dependencies',
        enabled: false,
        settings: [{
            title: 'Using Maltweaks',
            type: 'checkbox',
            key: 'maltweaks'
        }, {
            title: 'Using BerryTweaks',
            type: 'checkbox',
            key: 'maltweaks'
        }],
        stylesheet: null,
        name: 'layout',
        buttons: [{
            text: "Enable/Disable tweaks",
            id: 'tweaks',
            category: 'SmidqeTweaks',
            group: 'General',
            type: 'button',
            toggle: true,
            'data-key': 'tweaks',
            callbacks: {},
        }, {
            text: "Show emotes",
            id: 'emotes',
            category: 'Berrytube',
            group: 'General',
            type: 'button',
            toggle: true,
            'data-key': 'emotes',
            callbacks: {
                click: () => { Bem.showBerrymoteSearch(); }
            },
        }, {
            text: "Show settings",
            id: 'settings',
            category: 'Berrytube',
            group: 'General',
            type: 'button',
            toggle: true,
            'data-key': 'settings',
            callbacks: {
                click: () => { showConfigMenu(); }
            },
        }],

        listeners: {
            maltweaks: {
                path: "body",
                config: { childList: true },
            },
        },
        interval: null,
        menu: null,
        handleMaltweaks: (mutations) => {
            $.each(mutations, (key, mutation) => {
                if (!mutation.addedNodes)
                    return;

                $.each(mutation.addedNodes, (key, node) => {
                    if (node.id !== 'headwrap')
                        return;

                    if (SmidqeTweaks.settings.get("active") && SmidqeTweaks.settings.get("maltweaks"))
                        self.enable();
                })
            })
        },
        wrap: () => {
            $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
            $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
            $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
        },
        unwrap: () => {
            $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();
        },
        hide: () => {
            $('#chatControls > .settings, #chatControls > .berrymotes_button').css('display', 'none');
        },
        unhide: () => {
            $('#chatControls > .settings, #chatControls > .berrymotes_button').css('display', 'block');
        },
        enable: () => {
            SmidqeTweaks.settings.set("active", true, true);

            if (!SmidqeTweaks.settings.get('maltweaks'))
                self.wrap();

            if (!$('#st-stylesheet')[0])
                (SmidqeTweaks.settings.get('maltweaks') ? $('body') : $('head')).append(self.stylesheet);

            self.interval = setInterval(() => {
                if (!$('#playlist')[0])
                    return;

                $("#playlist").addClass("st-window-playlist");
                clearInterval(self.interval);
            })

            self.hide();
            self.enabled = true;
        },
        disable: () => {
            SmidqeTweaks.settings.set("active", false, true)

            self.stylesheet.remove();

            self.unhide();

            if (!SmidqeTweaks.settings.get('maltweaks'))
                self.unwrap();

            $('.st-window-default').filter(function(index, element) {
                let id = $(this).attr('id');

                return id !== "st-menu" || id !== "st-stats-container";
            }).removeClass('st-window-default');

            if (SmidqeTweaks.settings.get('maltweaks')) // patch/hack, fixes wrong sized header when exiting from tweaks
                $(".wrapper #dyn_header iframe").css({ "height": "140px" });

            SmidqeTweaks.modules.windows.removeMenuButtons();

            self.enabled = false;
        },
        toggle: () => {
            if (self.enabled)
                self.disable();
            else
                self.enable();
        },
        init: () => {
            self.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>');
            self.menu = SmidqeTweaks.modules.menu;

            //the tweaks button, can't do it when it is created because the function doesn't exist
            self.buttons[0].callbacks = {
                click: () => { self.toggle() }
            };

            self.buttons[0].active = SmidqeTweaks.settings.get('active');

            $.each(self.buttons, (index, value) => {
                self.menu.addElement(value);
            })

            self.listeners.maltweaks.callback = self.handleMaltweaks;

            setTimeout(() => {
                $.each(self.listeners, (key, value) => {
                    SmidqeTweaks.modules.listeners.stop(value);
                })
            }, 30000)

            $("#chatpane").addClass("st-chat");
            $("#videowrap").addClass("st-video");

            if (SmidqeTweaks.settings.get('active'))
                if (!SmidqeTweaks.settings.get('maltweaks'))
                    self.enable();
                else
                    SmidqeTweaks.modules.listeners.start(self.listeners.maltweaks);

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('layout', load());
