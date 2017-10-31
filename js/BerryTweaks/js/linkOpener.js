BerryTweaks.modules['linkOpener'] = (function(){
'use strict';

const self = {
    win: null,
    handleMessage(msg) {
        if ( !self.win || self.win.closed || msg.emote === 'request' )
            return;

        if (
            BerryTweaks.getSetting('hideSpoilers', true) && (
                msg.msg.indexOf('spoiler') !== -1 ||
                msg.emote === 'spoiler'
            )
        ){
                return;
        }

        if ( msg.msg.indexOf('berrytweaks-ircify-title') !== -1 )
            return;

        const m = msg.msg.match(/\bhttps?:\/\/[^\s]+/i);
        if ( m )
            self.win.location.href = m[0];
    },
    addSettings(container) {
        $('<div>', {

        }).append(
            $('<label>', {
                for: 'berrytweaks-linkOpener-hideSpoilers',
                text: "Don't open spoiler links"
            })
        ).append(
            $('<input>', {
                id: 'berrytweaks-linkOpener-hideSpoilers',
                type: 'checkbox',
                checked: BerryTweaks.getSetting('hideSpoilers', true)
            }).change(BerryTweaks.raven.wrap(function() {
                BerryTweaks.setSetting('hideSpoilers', !!$(this).prop('checked'));
            }))
        ).appendTo(container);

        $('<a>', {
            href: 'javascript:void(0)',
            click() {
                self.win = window.open('about:blank', 'linkOpener', 'menubar=no,toolbar=no,personalbar=no,location=yes');
            },
            text: 'Open link opener window'
        }).appendTo(container);
    },
    bind: {
        patchAfter: {
            addChatMsg(data) {
                self.handleMessage(data.msg);
            }
        }
    }
};

return self;

})();
