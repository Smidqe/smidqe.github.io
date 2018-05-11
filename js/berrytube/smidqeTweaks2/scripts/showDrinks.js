function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'showDrinks',
            requires: ['settings']
        },
        config: 
        {
            group: 'chat',
            values: [{
                title: 'Show drink count in chat',
                type: 'checkbox',
                key: 'showDrinks',
            }]
        },
        enabled: false,
        show: (data) => {
            if (!self.enabled || data.msg.emote !== 'drink')
                return;

            let last = $(".drink:last tr");

            if (last.find('.st-chat-drinkcount')[0])
                return;

            last.prepend(
                $("<td>", {
                    class: 'st-chat-drinkcount',
                }).append($("<span>", {
                    text: 'x' + $('#drinkCounter').text(),
                }))
            );
        },
        disable: () => {
            self.enabled = false;
            SmidqeTweaks.unpatch({container: 'chatmessage', name: 'addChatMsg', callback: self.show});
        },
        enable: () => {
            self.enabled = true;
            SmidqeTweaks.patch({container: {obj: window, name: 'chatmessage'}, name: 'addChatMsg', callback: self.show})
        },
    }

    return self;
}

SmidqeTweaks.add(load());
