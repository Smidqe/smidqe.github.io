function load() {
    const self = {
        group: 'time',
        settings: [{
            title: 'Show time in 12h format instead of 24',
            type: 'checkbox',
            key: '12hour'
        }],

        get: () => {
            const time = new Date();

            var hours = time.getUTCHours();
            const detail = hours < 12 ? "AM" : "PM";

            if (hours >= 12 && SmidqeTweaks.settings.get('12hour'))
                hours -= 12;

            return hours + ":" + time.getUTCMinutes() + " " + detail;
        },
    }

    return self;
}

SmidqeTweaks.addModule('time', load(), 'main');
