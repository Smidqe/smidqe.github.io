BerryTweaks.modules['altTab'] = (function(){
'use strict';

const self = {
    handler(e) {
        if ( window.TYPE < 2 )
            return;

        if ( e.altKey && !e.shiftKey && !e.ctrlKey ){
            let target = null;
            switch ( e.keyCode ){
                case 49:
                case 97:
                    target = 'main';
                    break;
                case 50:
                case 98:
                    target = 'admin';
                    break;
                default:
                    return;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
            window.showChat(target);
        }
    },
    enable() {
        $(window).on('keydown.btweaksAltTab', BerryTweaks.raven.wrap(self.handler));
    },
    disable() {
        $(window).off('.btweaksAltTab');
    }
};

return self;

})();
