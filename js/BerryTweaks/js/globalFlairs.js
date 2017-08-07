BerryTweaks.modules['globalFlairs'] = (function(){
'use strict';

const self = {
    css: true,
    ensureFlair(nick, flair) {
        if ( !nick )
            return;

        const el = $('#chatlist > ul > li.' + nick);
        if ( !el )
            return;

        $('.berrytweaks-flair', el).remove();

        if ( +flair ){
            $('<div>', {
                class: 'berrytweaks-flair flair_' + flair
            }).appendTo(el);
        }
    },
    disable() {
        $('#chatlist > ul > li .berrytweaks-flair').remove();
    }
};

BerryTweaks.patch(window, 'addChatMsg', data => {
    if ( !self.enabled )
        return;

    if ( !data || !data.msg )
        return;

    self.ensureFlair(
        data.msg.nick,
        data.msg.metadata && data.msg.metadata.flair
    );
});

return self;

})();
