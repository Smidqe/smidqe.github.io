function load() {
    const self = {
        settings: [{
            title: 'Copy emote string by middle clicking it',
            type: 'checkbox',
            key: 'emoteCopy'
        }],
        enabled: false,
        copy: (event) => {
            if (!self.enabled)
                return;

            console.log(event);
        },
        disable: () => {
            $('.berrymote').off('click', self.copy)
        },
        enable: () => {
            //update the event handlers everytime there is a new message, so it applies
            SmidqeTweaks.patch(window, 'addChatMsg', () => {
                $('.berryemote').off('click', self.copy).on('click', event => self.copy);
            })
        }
    }

    return self;
}
SmidqeTweaks.scripts.emoteCopy = load();
