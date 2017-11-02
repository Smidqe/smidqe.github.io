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
        getTimers: () => {
            //will eventually grab the values through ajax
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
