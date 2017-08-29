function load() {
    const self = {
        group: 'emotes',
        settings: [{
            title: 'Squee on specific emotes',
            type: 'checkbox',

        }],
        disable: () => {},
        enable: () => {}
    }

    return self;
}
SmidqeTweaks.scripts.emoteSquee = load();
