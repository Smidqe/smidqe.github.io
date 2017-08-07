BerryTweaks.modules['ircifyModlog'] = (function(){
'use strict';

const self = {
    css: true,
    previous: null,
    addLogMsg(data) {
        const key = `${data.timestamp}|${data.nick}|${data.msg}`;
        if ( data.nick === 'Server' || key === self.previous )
            return;

        self.previous = key;
        addChatMsg({
            msg: {
                nick: data.nick,
                msg: `<span class="berrytweaks-ircify-modlog">${data.msg} </span>`,
                metadata:  {
                    graymute: false,
                    nameflaunt: false,
                    flair: null,
                    channel: 'main'
                },
                emote: 'act',
                timestamp: new Date(data.timestamp)
            },
            ghost: false
        }, '#chatbuffer');
    }
};

socket.on('adminLog', data => {
    if ( self.enabled )
        self.addLogMsg(data);
});

return self;

})();
