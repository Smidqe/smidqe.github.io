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
        enable: () => {
            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");
            $(".st-window-users").addClass("wrap");

            self.wrapped = true;
        },
        callback: (mutations) => {
            console.log(mutations);

            $.each(mutations, (key, mutation) => {
                console.log(mutation);

                if (!mutation.addedNodes)
                    return;

                $.each(mutation.addedNodes, (key, node) => {
                    if (self.wrapped)
                        return;

                    console.log($(node).attr('id'));



                    if ($(node).attr('id') !== 'berrytweaks-video_title')
                        return;

                    setTimeout(self.enable, 1000);

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

            if (SmidqeTweaks.settings.get('titleWrap')) {
                console.log('');

                if ($('#berrytweaks-video_title')[0])
                    self.enable();
                else
                    self.listeners.start(self.observer);
            }
        },
    }

    return self;
}
SmidqeTweaks.addScript('titleWrap', load());
