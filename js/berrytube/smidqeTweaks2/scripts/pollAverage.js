function load() {
    const self = {
        group: 'poll',
        settings: [{
            title: "Calculate episode poll average",
            type: "checkbox",
            key: "pollAverage",
            tweak: 'pollAverage',
        }],
        calculate: function(data) {
            if (data.votes.length != 11)
                return;

            var total = 0;
            var count = 0;

            $.each(data.votes, (index, value) => {
                total += value * index;
                count += value;
            })

            const average = total / count;
            const msg = "average is " + average;

            SmidqeTweaks.chat.add("Episode average", msg, 'rcv');
        },

        enable: () => {
            socket.on('clearPoll', (data) => {
                if (!SmidqeTweaks.settings.get('pollAverage'))
                    return;

                self.calculate(data);
            })
        },
        disable: () => {}
    }
    return self;
}

SmidqeTweaks.scripts['pollAverage'] = load();
