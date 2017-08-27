function load() {
    const self = {
        settings: {

        },
        deps: [
            ['SmidqeTweaks', 'calcAvg']
        ],
        run: function(data) {
            //const buttons = $(mutation.target).find(".btn:not('.close')");
            return;

            const buttons = [];

            //there would be 11 buttons, 0..10
            if (buttons.length != 11)
                return;

            var number = true;
            var value = 0;
            console.log("Amount of buttons in the poll: " + buttons.length);

            var count = 0;

            $.each(buttons, i => {
                number = !isNaN($(buttons[i]).text());

                if (!number)
                    return;

                value += $(buttons[i]).text() * i;
                count += Number($(buttons[i]).text());
            })

            if (!number)
                return;

            const average = value / count;
            const msg = "average is " + average;

            //debug.log("Poll average is: " + average);
            SmidqeTweaks.chat.add("Episode average", msg, 'rcv');
        },

        enable: () => {
            SmidqeTweaks.patch(window, 'closePoll', (data) => {
                console.log("Poll closed");
                console.log(data);
            })
        },
        disable: () => {
            SmidqeTweaks.patch(window, 'closePoll', (data) => {}) //remove the callback
        }
    }
    return self;
}

SmidqeTweaks.scripts['pollAverage'] = load();
