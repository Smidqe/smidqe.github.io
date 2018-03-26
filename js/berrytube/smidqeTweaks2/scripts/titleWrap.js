/*
    Rewrite this one


*/

function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'titleWrap'
        },
        settings: {
            group: 'playlist',
            values: [{
                title: 'Wrap videotitle to separate line',
                key: 'titleWrap',
            }]
        },
        enable: () => {
            if (self.enabled)
                return;
            
            self.container.wrap($('<div>', {id: 'st-videotitle-window'}));
            $('.st-window-users').addClass('st-patch-berrytweaks');

            self.enabled = true;
        },
        disable: () => {
            if (!self.enabled)
                return;

            $('.st-window-users').removeClass('st-patch-berrytweaks');

            self.container.unwrap();
            self.enabled = false;
        },
        grab: () => {
            self.container = $('#berrytweaks-video_title');
        },
        init: () => {   
            socket.on('forceVideoChange', () => {
                if (!self.container)
                    self.grab();
                
                self.enable();
            });

            socket.on('hbVideoDetail', () => {
                if (!self.container)
                    self.grab();
                
                self.enable();
            });
        },
    }

    return self;
}
SmidqeTweaks.add(load());
