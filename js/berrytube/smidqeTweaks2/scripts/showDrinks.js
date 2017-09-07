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
        enabled: false,
        update: () => {
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
            SmidqeTweaks.patch(window, 'addChatMsg', (data) => {
                if (data.msg.emote !== 'drink')
                    return;

                if (self.enabled)
                    self.update();
            })
        },
    }

    return self;
}

SmidqeTweaks.scripts['showDrinks'] = load();
