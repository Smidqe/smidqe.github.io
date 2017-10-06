function load() {
    const self = {
        started: false,
        requires: ['stats', 'listeners'],
        stats: null,
        group: 'time',
        name: 'time',
        settings: [{
            title: 'Show time in 12h format instead of 24',
            type: 'checkbox',
            key: '12hour'
        }],
        addedValues: false,
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
        getAllTimers: () => {
            return $($('iframe:not(#ytapiplayer)')[0].contentWindow.document).find('.namecol').parent();
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
        updateTimers: () => {
            $.each(self.getAllTimers(), (key, value) => {
                //create the 
                const title = $(value).find('.namecol').text()

                const struct = {
                    id: title.split(" ")[0].toLowerCase(),
                    title: title,
                    value: 0,
                    sub: true,
                }

                self.stats.update('time', struct);
            })
        },
        addTimersToStats: () => {
            $.each(self.getAllTimers(), (key, value) => {
                //create the 
                const title = $(value).find('.namecol').text()

                const struct = {
                    id: title.split(" ")[0].toLowerCase(),
                    title: title,
                    value: 0,
                    sub: true,
                }

                self.stats.addPair('time', struct);
            })

            self.addedValues = true;
        },
        init: () => {
            try {
                //Don't ask me. the domain is the same all the time, but without this there would be errors about invalid access
                document.domain = "berrytube.tv"
            } catch (error) {
                console.log(error);
            }

            self.stats = SmidqeTweaks.modules.stats;

            self.stats.addPair('time', {
                id: 'time',
                title: 'Current time',
                value: 0,
            });

            self.stats.update('time', self.get);

            setInterval(() => {
                self.stats.update('time', self.get());
            }, 60 * 1000)

            setInterval(() => {
                if (!self.addedValues)
                    self.addTimersToStats();

                self.updateTimers();
            }, 1000)

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('time', load());
