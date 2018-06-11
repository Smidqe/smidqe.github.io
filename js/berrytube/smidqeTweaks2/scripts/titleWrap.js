/*
    Rewrite this one


*/

function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'titleWrap',
            requires: ['settings']
        },
        config: {
            group: 'playlist',
            values: [{
                title: 'Wrap videotitle to separate line',
                key: 'titleWrap',
                depends: ['berrytweaks'],
            }]
        },
        elements: ['#rcvOverlay', '.st-window-users', '#chatbuffer'],
        functions: ['forceVideoChange', 'hbVideoDetail'],
        patch: () => {
            let height = $('#st-videotitle-window').height();

            $.each(self.elements, (index, key) => {
                let changes = {
                    'top': height + 20 + "px",
                }

                if (key !== '#rcvOverlay')
                    changes['max-height'] = "calc(100% - " + (52 + height) + "px)" //52 == (20px for chatControls, 30 for input, 2 for borders)

                $(key).css(changes);
            })
        },
        unpatch: () => {
            $.each(self.elements, (index, key) => {
                $(key).css({
                    'top': 'none',
                    'max-height': 'none'
                })
            })
        },
        grab: () => {
            let title = $('#berrytweaks-video_title')

            if (title.parent().attr('id') === 'st-videotitle-window')
                return;

            self.container.appendTo($('#chatControls')).append(title);
        },
        update: () => {
            self.grab();
            self.patch();
        },
        enable: () => {
            if (!self.settings.berrytweaks('videoTitle'))
            {
                self.settings.set('titleWrap', false, true);    
                return;
            }
            
            $.each(self.functions, (index, value) => socket.on(value, self.update));
        },
        disable: () => {
            $.each(self.functions, (index, value) => socket.removeListener(value, self.update));
            self.unpatch();
        },
        init: () => {
            self.container = $('<div>', {id: 'st-videotitle-window'});
            self.settings = SmidqeTweaks.get('settings');
        },
    }

    return self;
}
SmidqeTweaks.add(load());
