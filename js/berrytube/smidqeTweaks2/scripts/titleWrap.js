function load() {
    const self = {
        group: 'patches',
        settings: [{
            title: 'Wrap videotitle to separate line',
            type: 'checkbox',
            key: 'titleWrap',
        }],
        requires: ['listeners'],
        observer: null,
        wrapped: false,
        wrap: (node) => {
            console.log(node);

            if ($(node).attr('id') !== 'berrytweaks-video_title')
                return;

            if (self.observer.obs)
                self.listeners.stop(self.observer);

            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");
            $(".st-window-users").addClass("wrap");

            self.wrapped = true;
        },
        disable: () => {
            $("#berrytweaks-video_title").unwrap();
            $(".st-window-users").removeClass("wrap");

            self.wrapped = false;
        },
        enable: () => {
            if (self.wrapped)
                return;

            self.wrap();
        },
        init: () => {
            self.listeners = SmidqeTweaks.getModule('listeners', 'main');
            self.observer = {
                path: '#chatControls',
                monitor: 'added',
                config: { childList: true }
            }

            self.observer.callback = self.wrap;

            if (!window.BerryTweaks) {
                self.listeners.load(self.observer);
                self.listeners.start(self.observer);
            } else {
                SmidqeTweaks.patch(BerryTweaks, 'enableModule', (name) => {
                    if (name === 'videoTitle' && SmidqeTweaks.settings.get('titleWrap'))
                        self.enable();
                });
            }
        },
    }

    return self;
}
SmidqeTweaks.scripts.titleWrap = load();
