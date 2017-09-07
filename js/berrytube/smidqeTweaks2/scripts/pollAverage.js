function load() {
    const self = {
        group: 'polls',
        settings: [{
            title: "Calculate episode poll average",
            type: "checkbox",
            key: "pollAverage",
        }],
        enabled: false,
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

SmidqeTweaks.scripts['pollAverage'] = load();
