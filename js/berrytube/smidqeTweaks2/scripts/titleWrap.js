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
        disable: () => {
            $("#berrytweaks-video_title").unwrap();
            $(".st-window-users").removeClass("wrap");

            self.wrapped = false;
        },

        wrap: () => {
            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");
            $(".st-window-users").addClass("wrap");

            self.wrapped = true;
        },

        enable: () => {
            if (SmidqeTweaks.settings.get('titleWrap')) {
                console.log($('#berrytweaks-video_title')[0]);

                if ($('#berrytweaks-video_title')[0])
                    self.enable();
                else
                    self.listeners.start(self.observer);
            }
        },
        callback: (mutations) => {
            console.log(mutations);

            $.each(mutations, (key, mutation) => {
                console.log(mutation);

                if (!mutation.addedNodes)
                    return;

                $.each(mutation.addedNodes, (key, node) => {
                    console.log("Wrapped: ", self.wrapped);

                    if (self.wrapped)
                        return;

                    console.log($(node).attr('id'));



                    if ($(node).attr('id') !== 'berrytweaks-video_title')
                        return;

                    self.wrap();

                    if (self.observer.obs)
                        self.listeners.stop(self.observer);
                })
            })
        },
        init: () => {
            self.listeners = SmidqeTweaks.getModule('listeners', 'main');
            self.observer = {
                path: '#chatControls',
                monitor: 'added',
                config: { childList: true }
            }

            self.observer.callback = self.callback;
        },
    }

    return self;
}
SmidqeTweaks.addScript('titleWrap', load());
