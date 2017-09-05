function load() {
    const self = {
        group: 'patches',
        settings: [{
            title: 'Wrap videotitle to separate line',
            type: 'checkbox',
            key: 'titleWrap',
            tweak: true,
        }],

        disable: () => {
            $("#berrytweaks-video_title").unwrap();
            $(".st-window-users").removeClass("wrap");
        },
        enable: () => {
            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $("#st-videotitle-window").addClass("active");

            $(".st-window-users").addClass("wrap");
        }
    }

    return self;
}
SmidqeTweaks.scripts.titleWrap = load();
