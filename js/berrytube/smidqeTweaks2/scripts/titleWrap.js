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
        disable: () => {
            $("#berrytweaks-video_title").unwrap();
            $(".st-window-users").removeClass("wrap");

            self.wrapped = false;
        },
        enable: (node) => {
            console.log(node);

            if (self.wrapped)
                return;

            if ($(node).attr('id') !== 'berrytweaks-video_title')
                return;

            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");
            $(".st-window-users").addClass("wrap");

            if (self.observer.obs)
                self.listeners.stop(self.observer);

            self.wrapped = true;
        },
        init: () => {
            self.listeners = SmidqeTweaks.getModule('listeners', 'main');
            self.observer = {
                path: '#chatControls',
                monitor: 'added',
                config: { childList: true }
            }

            self.observer.callback = self.enable;

            if (SmidqeTweaks.settings.get('titleWrap'))
                self.listeners.start(self.observer);
        },
    }

    return self;
}
SmidqeTweaks.addScript('titleWrap', load());
