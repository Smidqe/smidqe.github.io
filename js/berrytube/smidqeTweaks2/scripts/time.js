function load() {
    const self = {
        settings: [{
            title: 'Show time 12Hr format',
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
