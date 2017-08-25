const self = {
    settings: {
        title: 'Squee on RCV messages',
        type: 'checkbox',
    },
    enabled: false,
    disable: () => {
        self.enabled = false;
    },
    enable: () => {
        self.enabled = true;

        patch(window, 'addChatMsg', (data, _to) => {
            if (!self.enabled)
                return;

            if (data.msg.emote !== 'rcv')
                return;

            doSqueeNotify();

            if (SmidqeTweaks.settings.get('highlightRCV'))
                $('.msg-' + data.msg.nick + ':last-child > .rcv').addClass('highlight');
        })
    }
}

SmidqeTweaks.scripts['rcvSquee'] = self;