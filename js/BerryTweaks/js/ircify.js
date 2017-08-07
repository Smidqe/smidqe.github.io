BerryTweaks.modules['ircify'] = (function() {
'use strict';

const self = {
    css: true,
    verbs: {
        join: 'joined',
        part: 'left'
    },
    partTimeoutHandles: {},
    holdActs: true,
    act(nick, type, time, overrideHold) {
        if (!nick || (self.holdActs && !overrideHold))
            return;

        addChatMsg({
            msg: {
                nick,
                msg: `<span class="berrytweaks-ircify-${type}">${self.verbs[type]}</span>`,
                metadata: {
                    graymute: false,
                    nameflaunt: false,
                    flair: null,
                    channel: 'main'
                },
                emote: 'act',
                timestamp: time
            },
            ghost: false
        }, '#chatbuffer');

        if (type === "part")
            delete window.CHATLIST[nick];
    },
    addUser(nick) {
        if (nick === window.NAME)
            self.holdActs = false;

        if (self.partTimeoutHandles[nick]) {
            clearTimeout(self.partTimeoutHandles[nick]);
            self.partTimeoutHandles[nick] = null;
        } else
            self.act(nick, 'join', BerryTweaks.getServerTime());
    },
    rmUser(nick) {
        if (self.partTimeoutHandles[nick])
            return;

        const time = BerryTweaks.getServerTime();
        self.partTimeoutHandles[nick] = setTimeout(() => {
            self.partTimeoutHandles[nick] = null;
            self.act(nick, 'part', time);
        }, BerryTweaks.getSetting('timeoutSmoothing', 5) * 1000);
    },
    enable() {
        if (window.CHATLIST.hasOwnProperty(window.NAME))
            self.holdActs = false;
    },
    addSettings(container) {
        $('<div>', {

        }).append(
            $('<label>', {
                for: 'berrytweaks-ircify-timeout',
                text: 'Hide disconnects shorter than '
            })
        ).append(
            $('<input>', {
                id: 'berrytweaks-ircify-timeout',
                type: 'number',
                step: 1,
                min: 0,
                css: {
                    width: '3em'
                },
                value: BerryTweaks.getSetting('timeoutSmoothing', 5)
            }).change(function() {
                BerryTweaks.setSetting('timeoutSmoothing', +$(this).val());
            })
        ).append(
            $('<label>', {
                for: 'berrytweaks-ircify-timeout',
                text: ' seconds'
            })
        ).appendTo(container);
    }
};

BerryTweaks.patch(window, 'addUser', data => {
    if (!self.enabled)
        return;

    self.addUser(data.nick);
});

BerryTweaks.patch(window, 'rmUser', nick => {
    if (!self.enabled)
        return;

    self.rmUser(nick);
}, true);

socket.on('reconnecting', () => {
    self.holdActs = true;
});

return self;

})();