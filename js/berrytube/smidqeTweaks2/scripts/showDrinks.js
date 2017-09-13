/*
	PLACEHOLDER FOR NOW

	Eventually will handle the drinks data that will be shown in the infobox
*/
function load() {
    const self = {
        group: 'tweaks',
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
            const last = $(".drink:last tr")

            if (last.find('.st-chat-drinkcount')[0])
                return;

            const wrap = $("<td>", { class: 'st-chat-drinkcount' })
            const text = $("<span>", { text: 'x' + $('#drinkCounter').text() })

            wrap.append(text);
            last.prepend(wrap);
        },
        disable: () => {
            self.enabled = false;
        },
        enable: () => {
            self.enabled = true;
        },
        init: () => {
            self.stats = SmidqeTweaks.modules.stats;

            $.each(self.pairs, (key, value) => {
                self.stats.addPair('general', value);
            })

            SmidqeTweaks.patch(window, 'addChatMsg', (data) => {
                if (data.msg.emote !== 'drink')
                    return;

                self.stats.update('current', $('#drinkCounter').text());

                if (self.enabled)
                    self.show();
            })

            setInterval(() => {
                self.stats.update('dpm', $(".dpmCounter").text().substring(5));
            }, 1000);
        },
    }

    return self;
}

SmidqeTweaks.addScript('showDrinks', load());
