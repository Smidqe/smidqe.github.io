/*
Add more files to layout
    - video, chat, playlist \\hmmm
*/

function load() {
    const self = {
        settings: null,
        listeners: {
            maltweaks: {
                path: "body",
                config: { childList: true },
                monitor: "added",
            },

            berrytweaks: { //if there will be more than one use for this, change the name
                path: "head",
                config: { childList: true },
                monitor: "added",
            }
        },
        modules: {},
        names: ['bottom', 'infobox', 'toolbar', 'windows', 'wraps'],
        handleMaltweaks: (mutation) => {
            const isMaltweaks = self.settings.get('maltweaks');

            if (mutation.id !== 'headwrap')
                return;

            if (mutation.id === 'headwrap' && !isMaltweaks)
                self.settings.set('maltweaks', true, true);

            if (self.settings.get("active") && self.settings.get("maltweaks")) {
                self.listeners['maltweaks'].observer.disconnect();
                self.start();
            }
        },
        handleBerryTweaks: () => {
            if ($("head > link").attr('href').indexOf("atte.fi") === -1)
                return;

            self.settings.set("berrytweaks", true, true);
            self.listeners['berrytweaks'].observer.disconnect();
        },
        enable: () => {
            const stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>')
            const location = self.settings.get('maltweaks') ? $('body') : $('head');

            self.settings.set("active", true, true)

            location.append(stylesheet);

            if (!self.settings.get('maltweaks'))
                self.modules.wraps.enable();

            $("#chatpane").addClass("st-chat");
            $("#videowrap").addClass("st-video");
            $("#playlist").addClass("st-window-playlist");

            $("#st-controls-container").removeClass("st-window-default");
        },
        disable: () => {
            if (!self.settings.get('maltweaks'))
                $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();

            self.settings.set("active", false, true)

            $("#chatpane, #videowrap, #playlist").removeClass("st-chat st-video st-window-playlist");
            $("#st-stylesheet").remove();

            self.modules.toolbar.hide();

            if (self.settings.get('maltweaks')) //patch, fixes wrong sized header when exiting from tweaks
                $(".wrapper #dyn_header iframe").css({ "height": "140px" });
        },
        init: () => {
            //load the listeners
            self.settings = SmidqeTweaks.modules.settings;

            self.listeners.maltweaks.func = self.handleMaltweaks;
            self.listeners.berrytweaks.func = self.handleBerryTweaks;

            self.settings.set('maltweaks', false, true);
            self.settings.set('berrytweaks', false, true)

            $.each(self.listeners, (key, value) => {
                self.listeners[key].observer = SmidqeTweaks.modules.listeners.create(value);
                SmidqeTweaks.modules.listeners.start(self.listeners[key]);
            });

            $.each(self.names, (index, value) => {
                $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/layout/${value}.js`, () => {
                    self.modules[value].init();
                })
            });

            setTimeout(() => {
                self.listeners['maltweaks'].observer.disconnect();
            }, 15000)
        },
    }

    return self;
}
SmidqeTweaks.modules.layout = load();
