function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'showDrinks',
            requires: ['settings', 'chat']
        },
        config: {
            group: 'chat',
            values: [{
                title: 'Show drink count in chat',
                key: 'showDrinks',
            }]
        },
        chat: null,
        show: (data) => {
            if (data.msg.emote !== 'drink')
                return;

            let last = self.chat.drinks().last().find('tr');
        
            //shouldn't trigger, but meh
            if (last.find('.st-chat-drinkcount').length > 0)
                return;

            last.prepend(
                $("<td>", {
                    class: 'st-chat-drinkcount',
                }).append($("<span>", {
                    text: 'x' + $('#drinkCounter').text(),
                }))
            )
        },
        disable: () => {
            self.chat.unpatch('addChatMsg', self.show);
        },
        enable: () => {
            self.chat.patch('addChatMsg', self.show);
        },
        init: () => {
            self.chat = SmidqeTweaks.get('chat');
        },
    }

    return self;
}

SmidqeTweaks.add(load());
