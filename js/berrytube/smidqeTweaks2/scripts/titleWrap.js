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
                depends: ['berrytweaks'],
            }]
        },
        enable: () => {
            self.enabled = true;
            
            socket.on('forceVideoChange', self.grab);
            socket.on('hbVideoDetail', self.grab);
        },
        disable: () => {
            self.enabled = false;
            
            socket.removeListener('forceVideoChange', self.grab);
            socket.removeListener('hbVideoDetail', self.grab);

            if (self.container)
            {
                self.container.unwrap();
                self.container = null;
            }
            
            $('.st-window-users').removeClass('st-patch-berrytweaks');
        },
        grab: () => {
            if (!self.enabled)
                return;
            
            if (self.container)
                return;

            let title = $('#berrytweaks-video_title');
            
            if (self.enabled && title.length == 0)
                return;

            self.container = title
            self.container.wrap($('<div>', {id: 'st-videotitle-window'}));
            
            $('.st-window-users').addClass('st-patch-berrytweaks');
        },
    }

    return self;
}
SmidqeTweaks.add(load());
