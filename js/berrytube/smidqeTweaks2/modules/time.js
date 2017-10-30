/*
    TODO:
        - Add time to toolbar

*/

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
        toolbarElement: {
            id: 'time',
            text: '',
            tooltip: 'Current time',
            type: 'button',
            callbacks: {},
        },
        addedValues: false,
        //clean this function eventually
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
        getTimerFrame: () => {
            return $('iframe:not(#ytapiplayer)')[0];
        },
        getAllTimers: () => {
            var iframe = $('iframe:not(#ytapiplayer)')[0];

            if (!iframe)
                return undefined;

            return $(iframe.contentWindow.document).find('.namecol').parent();
        },
        getTimerByName: (name) => {
            //very hacky method, but due to cross frame script restrictions, it's necessary

            var iframe = $('iframe:not(#ytapiplayer)')[0];

            if (!iframe)
                return undefined;

            var timers = $(iframe.contentWindow.document).find('.namecol');
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
                self.stats.update($(value).find('.namecol').text().split(" ")[0].toLowerCase(), $(value).find('.remaincol').text());
            })
        },
        addTimersToStats: () => {
            const timers = self.getAllTimers();

            $.each(timers, (key, value) => {
                //create the 
                const title = $(value).find('.namecol').text();
                const id = title.split(" ")[0].toLowerCase();

                const struct = {
                    id: id,
                    title: title,
                    value: 0,
                    sub: true,
                }

                self.stats.addPair('time', struct);
            });

            if (timers !== undefined && timers.length > 0)
                self.addedValues = true;
        },
        init: () => {
            self.toolbarElement.text = self.get();

            SmidqeTweaks.modules.toolbar.add(self.toolbarElement);

            setInterval(() => {
                SmidqeTweaks.modules.toolbar.updateText('time', self.get());
            }, 60 * 1000)

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('time', load());
