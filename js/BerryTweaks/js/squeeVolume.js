BerryTweaks.modules['squeeVolume'] = (function(){
'use strict';

const self = {
    applyVolume() {
        const vol = self.enabled ? BerryTweaks.getSetting('squeeVolume', 1.0) : 1.0;

        // [<audio>, baseVolume=1.0]
        [
            [window.NOTIFY],
            [window.DRINK],
            [window.ATTENTION],
            [window.PEP && window.PEP.JAM],
            [window.OHMY, 0.5],
            [window.SHOOBEDOO, 0.5],
            [window.DOOT],
            [window.welcomeToTheJam]
        ].forEach(el => {
            if ( el[0] )
                el[0].volume = vol * (el[1] || 1.0);
        });
    },
    enable() {
        self.applyVolume();

        // in case some other scripts haven't loaded yet
        BerryTweaks.setTimeout(self.applyVolume, 1000 * 10);
    },
    disable() {
        self.applyVolume();
    },
    addSettings(container) {
        $('<div>', {

        }).slider({
            range: 'min',
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: BerryTweaks.getSetting('squeeVolume', 1.0),
            stop(event, ui) {
                BerryTweaks.setSetting('squeeVolume', ui.value);
                self.applyVolume();
                if ( window.NOTIFY )
                    window.NOTIFY.play();
            }
        }).appendTo(container);
    },
    bind: {
        patchAfter: {
            initToastThemes() {
                self.applyVolume();
            }
        }
    }
};

return self;

})();
