BerryTweaks.modules['squeeSound'] = (function(){
'use strict';

const self = {
    original: window.NOTIFY.src,
    applySound() {
        const url = BerryTweaks.getSetting('squeeSound');
        if ( self.enabled && url )
            window.NOTIFY.src = url;
        else
            window.NOTIFY.src = self.original;
    },
    enable() {
        self.applySound();
    },
    disable() {
        window.NOTIFY.src = self.original;
    },
    addSettings(container) {
        $('<input>', {
            type: 'text',
            value: BerryTweaks.getSetting('squeeSound', ''),
            placeholder: 'Sound file URL',
            css: {
                width: '100%'
            },
            on: {
                change() {
                    BerryTweaks.setSetting('squeeSound', $(this).val());
                    self.applySound();
                }
            }
        }).appendTo(container);
    }
};

return self;

})();
