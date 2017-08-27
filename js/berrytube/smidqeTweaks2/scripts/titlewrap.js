function load() {
    const self = {
        group: 'patches',
        settings: [{
            title: 'Wrap videotitle to separate line',
            type: 'checkbox',
            key: 'titleWrap'
        }],
        disable: () => {

        },
        enable: () => {

        }
    }

    return self;
}
SmidqeTweaks.scripts.titleWrap = load();
