function load() {
    const self = {
        group: 'time',
        settings: [{
            title: 'Show time in 12h format instead of 24',
            type: 'checkbox',
            key: '12hour'
        }],

        get: (half) => {
            const time = new Date();

            const s = time.getSeconds();
            const m = time.getMinutes();
            var h = time.getHours();

            if (h > 12 && half)
                h -= 12;

            var text = h + ":" + m + ":" + s;

            if (half)
                text += text + " " + (time.getHours() < 12 ? "AM" : "PM");

            return text;
        },

    }
}

SmidqeTweaks.addModule('time', load(), 'main');
