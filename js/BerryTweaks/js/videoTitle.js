BerryTweaks.modules['videoTitle'] = (function(){
'use strict';

const self = {
    css: true,
    libs: ['video'],
    time: 0,
    link: null,
    onChange(video) {
        self.link.html(video.title);
    },
    onUpdate(video) {
        self.link.attr('href', video.timedLink);
    },
    enable() {
        self.link = $('<a>', {
            id: 'berrytweaks-video_title',
            target: '_blank',
            rel: 'noopener noreferrer',
            text: 'Video title will be available after video change'
        }).appendTo('#chatControls');

        BerryTweaks.lib.video.subscribe(self.onChange, self.onUpdate);
    },
    disable() {
        BerryTweaks.lib.video.unsubscribe(self.onChange, self.onUpdate);

        if ( self.link ){
            self.link.remove();
            self.link = null;
        }
    }
};

return self;

})();
