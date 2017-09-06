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
        }, {
            title: '',
            type: 'checkbox'
        }],

        enabled: false,
        update: () => {

        },
        disable: () => {
            self.enabled = true;
        },
        enable: () => {
            self.enabled = true;
        },
        init: () => {
            SmidqeTweaks.patch(window, 'addChatMsg', (data) => {
                console.log('DRINK MESSAGE: ' + data);
                if (data.msg.emote !== 'drink')
                    return;

                const last = $(".drink:last tr")

                if (last.find('.st-chat-drinkcount')[0])
                    return;

                const wrap = $("<td>", { class: 'st-chat-drinkcount' })
                const text = $("<span>", { text: $('#drinkCounter').text() })

                wrap.append(text);
                last.prepend(wrap);
            })
        },
    }

    return self;
}

SmidqeTweaks.scripts['showDrinks'] = load();
