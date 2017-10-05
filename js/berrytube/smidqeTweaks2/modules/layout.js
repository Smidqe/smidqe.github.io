/*
    TODO:

        - Remove the listeners from here and use settings to figure out what scripts we are using,
        -

*/

function load() {
    const self = {
        runnable: true,
        started: false,
        requires: ['listeners', 'time', 'menu'], //soon menu aswell
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
        listeners: {
            maltweaks: {
                path: "body",
                config: { childList: true },
            },
        },
        timeout: null,
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
        enable: () => {
            $.each(self.listeners, (key, value) => {
                value.observer.disconnect();
            });

            $("#chatpane").addClass("st-chat");
            $("#videowrap").addClass("st-video");

            const location = SmidqeTweaks.settings.get('maltweaks') ? $('body') : $('head');

            SmidqeTweaks.settings.set("active", true, true);

            if (!SmidqeTweaks.settings.get('maltweaks'))
                self.wrap();

            if (!$('#st-stylesheet')[0])
                location.append(self.stylesheet);

            self.enabled = true;
        },
        disable: () => {
            SmidqeTweaks.settings.set("active", false, true)

            $("#chatpane").removeClass("st-chat");
            $("#videowrap").removeClass("st-video");

            if (!SmidqeTweaks.settings.get('maltweaks'))
                self.unwrap();

            if (SmidqeTweaks.settings.get('maltweaks')) // patch/hack, fixes wrong sized header when exiting from tweaks
                $(".wrapper #dyn_header iframe").css({ "height": "140px" });

            self.window

            self.enabled = false;
        },
        toggle: () => {
            if (self.enabled)
                self.disable();
            else
                self.enable();
        },
        init: () => {
            self.stylesheet = stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>');
            self.menu = SmidqeTweaks.modules.menu;

            self.button.callbacks = {
                click: self.toggle
            };

            self.button.active = SmidqeTweaks.settings.get('active');
            self.toolbar = SmidqeTweaks.modules.toolbar;

            self.menu.addGroup({
                category: 'SmidqeTweaks',
                id: 'general',
                title: 'General'
            })

            self.menu.addElement(self.button);

            self.listeners.maltweaks.callback = self.handleMaltweaks;
            self.interval = setInterval(() => {
                if (!$('#playlist')[0])
                    return;

                $("#playlist").addClass("st-window-playlist");
                clearInterval(self.interval);
            })

            setTimeout(() => {
                $.each(self.listeners, (key, value) => {
                    SmidqeTweaks.modules.listeners.stop(value);
                })
            }, 30000)

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
