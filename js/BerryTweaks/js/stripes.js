BerryTweaks.modules['stripes'] = (function(){
'use strict';

const self = {
    isEven: true,
    handleMessage(_to) {
        const msg = $(_to).children().last();
        msg.addClass(self.isEven ? 'even' : 'odd');
        self.isEven = !self.isEven;
    },
    enable() {
        self.isEven = true;
        $('#chatbuffer > div').each(_to => {
            self.handleMessage(_to);
        });
    },
    disable() {
        $('#chatbuffer > div').removeClass('even odd');
    }
};

BerryTweaks.patch(window, 'addChatMsg', (data, _to) => {
    if ( !self.enabled )
        return;

    self.handleMessage(_to);
});

return self;

})();
