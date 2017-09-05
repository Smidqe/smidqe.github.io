function load() {
    const self = {
        group: 'tweaks',
        settings: [{
            title: 'Show time in 12 hr format',
            type: 'checkbox',
            key: 'convertTime'
        }],
        disable: () => {

        },
        enable: () => {
            SmidqeTweaks.patch(BerryTweaks, 'getServerTime', () => {
                $("#st-info-time > span").text($(".me > .berrytweaks-localtime").text());
            })
        }
    }
    return self;
}
SmidqeTweaks.scripts['convertTime'] = load();
