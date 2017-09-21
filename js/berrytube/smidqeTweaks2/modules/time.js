function load() {
    const self = {
        started: false,
        requires: ['stats', 'listeners'],
        stats: null,
        group: 'time',
        name: 'time',
        observer: null,
        settings: [{
            title: 'Show time in 12h format instead of 24',
            type: 'checkbox',
            key: '12hour'
        }],
        pairs: [{
            id: 'time',
            title: 'Current time',
            value: 0,
        }, {
            id: 'euro',
            title: 'Euro Drinking Games',
            value: 0,
        }, {
            id: 'signature',
            title: 'Signature Drinking Games',
            value: 0,
        }, {
            id: 'bonus',
            title: 'Bonus Drinking Games',
            value: 0,
        }, {
            id: 'new',
            title: 'New Horse',
            value: 0,
        }, {
            id: 'movie',
            title: 'Horse Movie',
            value: 0,
        }, ],
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
        getTimerByName: (name) => {
            //very hacky method, but due to cross frame script restrictions, it's necessary
            var timers = $($('iframe:not(#ytapiplayer)')[0].contentWindow.document).find('.namecol');
            var result = undefined;

            $.each(timers, (index, value) => {
                if (result)
                    return;

                if ($(value).text() === name)
                    result = $(value).parent();
            })

            return result;
        },
        init: () => {
            try {
                //Don't ask me. the domain is the same all the time, but without this there would be errors about invalid access
                document.domain = "berrytube.tv"
            } catch (error) {
                console.log(error);
            }

            self.stats = SmidqeTweaks.modules.stats;

            $.each(self.pairs, (key, value) => {
                self.stats.addPair('time', value);
            })

            self.stats.update('time', self.get);

            setInterval(() => {
                self.stats.update('time', self.get());
            }, 60 * 1000)

            setInterval(() => {
                $.each(self.pairs, (key, value) => {
                    if (value.id === 'time')
                        return;

                    self.stats.update(value.id, self.getTimerByName(value.title).find('.remaincol').text());
                })
            }, 1000)

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('time', load(), 'main');
