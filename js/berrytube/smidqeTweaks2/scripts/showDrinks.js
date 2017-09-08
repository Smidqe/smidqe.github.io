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
        data: {
            block: 'Drinks',
            values: [{
                id: 'current',
                title: 'Current drinks',
                value: 0,
            }, {
                id: 'dpm',
                title: 'Drinks per minute',
                value: 0,
            }]
        },
        infobox: null,
        enabled: false,
        update: () => {
            self.infobox.update('current', $('#drinkCounter').text());

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
            self.infobox = SmidqeTweaks.modules.infobox;
            self.infobox.addBlock(self.data);

            SmidqeTweaks.patch(window, 'addChatMsg', (data) => {
                if (data.msg.emote !== 'drink')
                    return;

                if (self.enabled)
                    self.update();
            })

            setInterval(() => {
                self.infobox.update('dpm', $(".dpmCounter").text().substring(5));
            }, 1000);
        },
    }

    return self;
}

SmidqeTweaks.addScript('showDrinks', load());
