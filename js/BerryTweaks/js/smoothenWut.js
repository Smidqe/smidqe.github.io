BerryTweaks.modules['smoothenWut'] = (function(){
'use strict';

const self = {
    css: true,
    patchDone: false,
    enable() {
        if ( self.patchDone ){
            wutReloadUserColors();
            return;
        }

        self.patchDone = true;
        whenExists('#wutColorStyles', () => {
            BerryTweaks.patch(window, 'wutProcessUsername', nick => {
                if ( !self.enabled )
                    return;

                const sheet = document.getElementById('wutColorStyles').sheet;
                const color = wutGetUsercolor(nick);

                sheet.insertRule(`.msg-${nick} { border-image: linear-gradient(to right, ${color}, transparent) 1 100%; }`, sheet.cssRules.length);
            });
            wutReloadUserColors();
        });
    },
    disable() {
        wutReloadUserColors();
    },
    concatContinuous(_to) {
        const container = $(_to).children().last();
        const previousContainer = container.prev();
        if ( container[0] && previousContainer[0] && container[0].className === previousContainer[0].className ){
            previousContainer.append(container.children());
            container.remove();
        }
    }
};

BerryTweaks.patch(window, 'addChatMsg', (data, _to) => {
    if ( !self.enabled )
        return;

    self.concatContinuous(_to);
});

return self;

})();
