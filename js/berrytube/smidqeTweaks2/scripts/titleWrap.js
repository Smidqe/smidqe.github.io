function load() {
    const self = {
        group: 'patches',
        settings: [{
            title: 'Wrap videotitle to separate line',
            type: 'checkbox',
            key: 'titleWrap',
            tweak: true,
        }],
        wrap: () => {
            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");
            $(".st-window-users").addClass("wrap");
        },
        disable: () => {
            $("#berrytweaks-video_title").unwrap();
            $(".st-window-users").removeClass("wrap");
        },
        enable: () => {
            if ($("#berrytweaks-video_title")[0]) {
                self.wrap();
                return;
            }

            SmidqeTweaks.patch(BerryTweaks.modules.videoTitle, 'enable', () => {
                self.wrap();
            })
        }
    }

    return self;
}
SmidqeTweaks.scripts.titleWrap = load();
