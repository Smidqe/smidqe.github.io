function load() {
    const self = {
        requires: ['stats'],
        stats: null,
        group: 'time',
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
            self.stats.addPair(self.stats.getBlock('general'), self.pair)

            setInterval(() => {
                $("#st-info-time > span").text(self.get());
            }, 60 * 1000)
        },
    }

    return self;
}

SmidqeTweaks.addModule('time', load(), 'main');
