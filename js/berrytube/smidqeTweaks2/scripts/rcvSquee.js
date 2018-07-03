function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'rcvSquee',
            requires: ['settings', 'chat']
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
        notify: (data) => {
            if (data.msg.emote !== 'rcv')
                return;

            window.doSqueeNotify();

            if (self.settings.get('highlightRCV'))
                self.chat.rcv().last().addClass('highlight');
        },
        disable: () => {
            self.chat.unpatch('addChatMsg', self.notify);
        },
        enable: () => {
            self.chat = SmidqeTweaks.get('chat');
            self.settings = SmidqeTweaks.get('settings');

            self.chat.patch('addChatMsg', self.notify);
        },
    };
    
    return self;
}
SmidqeTweaks.add(load());
