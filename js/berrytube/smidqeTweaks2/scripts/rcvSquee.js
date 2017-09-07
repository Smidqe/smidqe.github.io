function load() {
    const self = {
        group: 'tweaks',
        settings: [{
            title: 'Squee on RCV messages',
            type: 'checkbox',
            key: 'rcvSquee',
        }, {
            title: 'Highlight the message',
            type: 'checkbox',
            key: 'highlightRCV',
            sub: true,
        }],
        enabled: false,
        disable: () => {
            self.enabled = false;
        },
        enable: () => {
            self.enabled = true;
        },
        init: () => {
            SmidqeTweaks.patch(window, 'addChatMsg', (data, _to) => {
                if (!self.enabled || data.msg.emote !== 'rcv')
                    return;

                doSqueeNotify();

                if (SmidqeTweaks.settings.get('highlightRCV'))
                    $('.msg-' + data.msg.nick + ':last-child > .rcv').addClass('highlight');
            })
        },
    }
    return self;
}
SmidqeTweaks.addScript('rcvSquee', load());
