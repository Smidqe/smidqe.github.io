/*
	PLACEHOLDER FOR NOW

	Eventually will handle the drinks data that will be shown in the infobox
*/
function load() {
    const self = {
        group: 'tweaks',
        script: true,
        name: 'showDrinks',
        settings: [{
            title: 'Show drink count in chat',
            type: 'checkbox',
            key: 'showDrinks',
        }],
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
                if (!self.enabled)
                    return;

                if (data.msg.emote !== 'drink')
                    return;

                self.show();
            }, false);

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
        },
    }

    return self;
}

SmidqeTweaks.addScript('showDrinks', load());
