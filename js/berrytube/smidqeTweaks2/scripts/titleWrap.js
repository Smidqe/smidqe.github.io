function load() {
    const self = {
        group: 'patches',
        settings: [{
            title: 'Wrap videotitle to separate line',
            type: 'checkbox',
            key: 'titleWrap',
            tweak: true,
        }],
        observer: null,
        requires: ['listeners'],
        callback: (node) => {
            if ($(node).attr('id') === 'berrytweaks-video_title') {
                self.enable();
                self.listeners.stop(self.observer);
            }
        }
        disable: () => {
            $("#berrytweaks-video_title").unwrap();
            $(".st-window-users").removeClass("wrap");
        },
        enable: () => {
            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");
            $(".st-window-users").addClass("wrap");
        },
        init: () => {
            self.listeners = SmidqeTweaks.modules.listeners;

            //no need to load these settings
            if (!SmidqeTweaks.settings.get('titleWrap'))
                return;

            self.observer = {
                monitor: 'added',
                path: '#chatControls',
                config: { childList: true },
            }

            self.observer.callback = self.callback;

            self.listeners.load(self.observer);
            self.listeners.run(self.observer);
        },
    }

    return self;
}
SmidqeTweaks.scripts.titleWrap = load();
