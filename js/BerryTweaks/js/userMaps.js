BerryTweaks.modules['userMaps'] = (function(){
'use strict';

const self = {
    libs: ['user'],
    addMap() {
        // find window
        const dialogContent = $('#userOps').parents('.dialogContent');
        const nick = $('h1', dialogContent).text();
        if ( !dialogContent || !nick )
            return;

        BerryTweaks.lib.user.getMap(nick, mapdata => {
            if ( !mapdata )
                return;

            // add map
            $('<iframe>', {
                class: 'berrytweaks-usermap',
                frameborder: 0,
                css: {
                    border: 'none',
                    width: 256,
                    height: 256
                },
                src: `https://www.google.com/maps/embed/v1/place?key=AIzaSyBI0R0kAhUgPVt-Ov6OFn38xVBCk2qyDJY&zoom=5&q=${mapdata.lat},${mapdata.lng}`
            }).appendTo(dialogContent);

            BerryTweaks.fixWindowPosition(dialogContent);
        });
    },
    disable() {
        $('.berrytweaks-usermap').remove();
    },
    bind: {
        patchAfter: {
            showUserActions() {
                BerryTweaks.setTimeout(() => {
                    self.addMap();
                }, 200 + 100); // dialog fade-in
            }
        }
    }
};

return self;

})();
