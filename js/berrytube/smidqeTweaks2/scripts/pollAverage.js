function load() {
    const self = {
        group: 'polls',
        script: true,
        name: 'pollAverage',
        settings: [{
            title: "Calculate episode poll average",
            type: "checkbox",
            key: "pollAverage",
        }, {
            title: 'Ignore 0-votes',
            type: 'checkbox',
            key: 'ignoreZero'
        }],
        enabled: false,
        calculate: function(data) {
            if (data.votes.length != 11)
                return;

            var total = 0;
            var count = 0;

            $.each(data.votes, (index, value) => {
                if (SmidqeTweaks.settings.get('ignoreZero') && index == 0)
                    return;

                total += value * index;
                count += value;
            })

            const average = total / count;
            const msg = "average is " + average;

            SmidqeTweaks.chat.add("Episode ", msg, 'rcv');
        },
        enable: () => {
            self.enabled = true;
        },
        disable: () => {
            self.enabled = false;
        },
        init: () => {
            socket.on('clearPoll', (data) => {
                if (!self.enabled)
                    return;

                self.calculate(data);
            })
        },
    }
    return self;
}

SmidqeTweaks.addScript('pollAverage', load());
