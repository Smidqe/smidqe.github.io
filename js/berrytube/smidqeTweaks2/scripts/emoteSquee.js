function load() {
    const self = {
        settings: {
            title: 'Squee on specific emotes',
            type: 'checkbox',

        },
        enabled: false,
        disable: () => {
            self.enabled = false;
        },
        enable: () => {
            self.enabled = true;

            SmidqeTweaks.patch(window, 'addChatMsg', (data, _to) => {
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

    return self;
}
SmidqeTweaks.scripts.emoteSquee = load();
