function load() {
    const self = {
        started: false,
        requires: ['stats'],
        stats: null,
        group: 'time',
        name: 'time',
        settings: [{
            title: 'Show time in 12h format instead of 24',
            type: 'checkbox',
            key: '12hour'
        }],
        pair: {
            id: 'time',
            title: 'Current time',
            value: 0,
        },
        get: () => {
            const time = new Date();

            var hours = time.getHours();
            const detail = hours < 12 ? "AM" : "PM";

            if (hours > 12 && SmidqeTweaks.settings.get('12hour'))
                hours -= 12;

            var minutes = time.getMinutes();

            if (minutes < 10)
                minutes = "0" + minutes;

            var msg = hours + ":" + minutes;

            if (SmidqeTweaks.settings.get('12hour'))
                msg += " " + detail;

            return msg;
        },

        init: () => {
            self.stats = SmidqeTweaks.modules.stats;

            self.stats.addPair('general', self.pair)
            self.stats.update('time', self.get);

            setInterval(() => {
                self.stats.update('time', self.get());
            }, 60 * 1000)

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('time', load(), 'main');
