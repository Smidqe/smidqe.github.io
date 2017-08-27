function load() {
    const self = {
        settings: {
            title: 'Squee on specific emotes',
            type: 'checkbox',

        },
        enabled: false,
        disable: () => {
            self.enabled = false;
        },
        enable: () => {
            self.enabled = true;

            patch(window, 'addChatMsg', (data, _to) => {

            })
        }
    }

    return self;
}
SmidqeTweaks.scripts.emoteCopy = load();
