function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'rcvSquee',
            requires: ['settings']
        },
        config: {
            group: 'chat',
            values: [{
                title: 'Squee on RCV messages',
                key: 'rcvSquee',
            }, {
                title: 'Highlight the message',
                key: 'highlightRCV',
                sub: true,
                depends: ['rcvSquee']
            }]
        },
        enabled: false,
        notify: (data) => {
            if (!self.enabled || data.msg.emote !== 'rcv')
                return;

            doSqueeNotify();

            if (SmidqeTweaks.get('modules', 'settings').get('highlightRCV'))
                $('.msg-' + data.msg.nick + ':last-child > .rcv').addClass('highlight');
        },
        disable: () => {
            self.enabled = false;
            SmidqeTweaks.unpatch({container: 'window', name: 'addChatMsg', callback: self.notify})
        },
        enable: () => {
            self.enabled = true;
            SmidqeTweaks.patch({container: {obj: window, name: 'window'}, name: 'addChatMsg', callback: self.notify, after: true})
        },
    }
    return self;
}
SmidqeTweaks.add(load());
