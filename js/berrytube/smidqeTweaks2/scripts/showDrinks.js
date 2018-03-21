/*
    ???
*/
function load() {
    const self = {
        meta: {
            group: 'script',
            name: 'showDrinks'
        },
        group: 'tweaks',
        category: 'script',
        name: 'showDrinks',
        settings: 
        {
            group: 'chat',
            values: [{
                title: 'Show drink count in chat',
                type: 'checkbox',
                key: 'showDrinks',
            },{
                title: 'Show video position'
            }]
        },
        pairs: [{
            id: 'current',
            title: 'Current drinks',
            value: 0,
        }, {
            id: 'dpm',
            title: 'Drinks per minute',
            value: 0,
        }],
        requires: ['stats'],
        stats: null,
        enabled: false,
        show: () => {
            const last = $(".drink:last tr");

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
        },
        enable: () => {
            self.enabled = true;
        },
        init: () => {
            self.stats = SmidqeTweaks.modules.stats;

            
            SmidqeTweaks.patch(window, 'addChatMsg', (data) => {
                if (!self.enabled || data.msg.emote !== 'drink')
                    return;

                self.show();
            }, false);

            /*
            $.each(self.pairs, (key, value) => {
                self.stats.addPair('drinks', value);
            });

            self.stats.update('current', $('#drinkCounter').text());

            socket.on('forceVideoChange', () => {
                self.stats.update('current', 0);
            });

            socket.on('drinkCount', () => {
                self.stats.update('current', $('#drinkCounter').text());
            });

            setInterval(() => {
                self.stats.update('dpm', $(".dpmCounter").text().substring(5));
            }, 1000);

            */
        },
    }

    return self;
}

SmidqeTweaks.add(load());
