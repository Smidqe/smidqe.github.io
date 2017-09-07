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

            var hours = time.getHours();
            const detail = hours < 12 ? "AM" : "PM";

            if (hours > 12 && SmidqeTweaks.settings.get('12hour'))
                hours -= 12;

            var minutes = time.getMinutes();

            if (minutes < 10)
                minutes = "0" + minutes;

            var msg = hours + ":" + time.getMinutes();

            if (SmidqeTweaks.settings.get('12hour'))
                msg += " " + detail;

            return msg;
        },
    }

    return self;
}

SmidqeTweaks.addModule('time', load(), 'main');
