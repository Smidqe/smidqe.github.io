function load() {
    const self = {
        group: 'tweaks',
        settings: [{
            title: 'Show time in 12 hr format',
            type: 'checkbox',
            key: 'showTime'
        }],
        disable: () => {

        },
        enable: () => {

        }
    }
    return self;
}
SmidqeTweaks.scripts['time'] = load();
