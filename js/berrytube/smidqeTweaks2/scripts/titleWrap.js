function load() {
    const self = {
        group: 'patches',
        name: 'titleWrap',
        script: true,
        settings: [{
            title: 'Wrap videotitle to separate line',
            type: 'checkbox',
            key: 'titleWrap',
        }],
        requires: ['listeners'],
        observer: null,
        wrapped: false,
        wrap: () => {
            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");
            $(".st-window-users").addClass("wrap");

            self.wrapped = true;
        },
        unwrap: () => {
            $("#berrytweaks-video_title").unwrap();
            $(".st-window-users").removeClass("wrap");

            self.wrapped = false;
        },
        enable: () => {
            if (SmidqeTweaks.settings.get('titleWrap')) {
                if ($('#berrytweaks-video_title')[0])
                    self.wrap();
                else
                    self.listeners.start(self.observer);
            }
        },
        disable: () => {
            self.unwrap();
        },
        callback: (mutations) => {
            $.each(mutations, (key, mutation) => {
                if (!mutation.addedNodes)
                    return;

                $.each(mutation.addedNodes, (key, node) => {
                    if (self.wrapped)
                        return;

                    if ($(node).attr('id') !== 'berrytweaks-video_title')
                        return;

                    self.wrap();
                    self.listeners.stop(self.observer);
                })
            })
        },
        init: () => {
            self.listeners = SmidqeTweaks.getModule('listeners', 'main');
            self.observer = {
                path: '#chatControls',
                config: { childList: true }
            }

            self.observer.callback = self.callback;
        },
    }

    return self;
}
SmidqeTweaks.addScript('titleWrap', load());
