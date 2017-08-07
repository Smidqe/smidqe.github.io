BerryTweaks.modules['autoshowVideo'] = (function(){
'use strict';

const self = {
    css: false,
    libs: ['video'],
    onChange(video) {
        if ( !window.MT || !MT.loaded )
            return;

        const isShown = MT.storage.state.video;

        // if current is volatile; ensure shown, return
        if ( video.isVolatile ){
            if ( !isShown ){
                MT.butts.video.$.click();
            }
            return;
        }

        // if video hidden; return
        if ( !isShown )
            return;

        // if volatiles on list; return
        for ( let vid = window.ACTIVE; vid !== window.PLAYLIST.first; vid = vid.next ){
            if ( vid.volat )
                return;
        }

        // hide video
        MT.butts.video.$.click();
    },
    enable() {
        BerryTweaks.lib.video.subscribe(self.onChange);
    },
    disable() {
        BerryTweaks.lib.video.unsubscribe(self.onChange);
    }
};

return self;

})();
