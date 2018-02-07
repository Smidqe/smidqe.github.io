/*
    Rewrite this one


*/

function load() {
    const self = {
        meta: {
            group: 'script',
            name: 'titleWrap'
        },
        group: 'patches',
        name: 'titleWrap',
        category: 'script',
        settings: [{
            title: 'Wrap videotitle to separate line',
            key: 'titleWrap',
        }],
        wrapped: false,
        /*
        getBerrytweakSetting: (value) => {
            if (!window.Berrytweaks)
                return;

            let config = window.BerryTweaks.loadSettings().enabled;

            return config[value] || false;
        },
        enable: () => {
            if (!window.BerryTweaks)
                return;

            let exists = self.getBerrytweakSetting(videotitle);

            if (!exists)
                return;

            if ()
        }
        */


        wrap: () => {
            $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
            $('#chatlist').addClass('st-patch-berrytweaks');

            self.wrapped = true;
        },
        unwrap: () => {
            $('#chatlist').removeClass('st-patch-berrytweaks');
            $("#berrytweaks-video_title").unwrap();

            self.wrapped = false;
        },
        enable: () => {
            if ($('#berrytweaks-video_title')[0])
                self.wrap();

            self.enabled = true;
        },
        disable: () => {
            if ($('#st-videotitle-window')[0])
                self.unwrap();

            self.enabled = false;
        },
        init: () => {
            

            socket.on('forceVideoChange', () => {
                if (!self.enabled)
                    self.enable();
            });

            socket.on('hbVideoDetail', () => {
                if (!self.enabled)
                    self.enable();
            });


        },
    }

    return self;
}
SmidqeTweaks.add(load());
