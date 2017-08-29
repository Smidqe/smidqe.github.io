function load() {
    const self = {
        settings: [{
            title: 'Copy emote string by middle clicking it',
            type: 'checkbox',
            key: 'copyEmote'
        }],
        enabled: false,
        copy: (event) => {
            if (!self.enabled)
                return;

            console.log(event);
        },
        disable: () => {
            self.enabled = false;

            $('.berrymote').off('click', self.copy)
        },
        enable: () => {
            self.enabled = true;

            //update the event handlers everytime there is a new message, so it applies
            SmidqeTweaks.patch(window, 'addChatMsg', () => {
                $('.berryemote').off('click', self.copy).on('click', event => self.copy);
            })
        }
    }

    return self;
}
SmidqeTweaks.scripts.emoteCopy = load();
