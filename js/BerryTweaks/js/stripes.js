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
        $('#chatbuffer > div').each(function() {
            self.handleMessage(this);
        });
    },
    disable() {
        $('#chatbuffer > div').removeClass('even odd');
    },
    bind: {
        patchAfter: {
            addChatMsg(data, _to) {
                self.handleMessage(_to);
            }
        }
    }
};

return self;

})();
