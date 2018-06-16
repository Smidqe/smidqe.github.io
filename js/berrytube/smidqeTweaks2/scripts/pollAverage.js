function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'pollAverage',
            requires: ['settings', 'chat', 'polls']
        },
        name: 'pollAverage',
        config: { 
            group: 'polls',
            values: [{
                title: "Calculate episode average",
                key: "pollAverage",
            }, {
                title: 'Ignore 0-votes',
                key: 'ignoreZero',
                sub: true,
                depends: ['pollAverage']
            }],
        },
        check: (votes) => {
            if (votes.length < 10 || votes.length > 11)
                return false;

            if (votes.filter(vote => isNaN(parseInt(vote.text))).length > 0)
                return false;

            return true;
        },
        calculate: () => {
            let options = self.polls.options(self.polls.first(false));
            let total = 0;

            if (!self.check(options))
                return;
            
            $.each(options, (index, value)  => {
                if (self.settings.get('ignoreZero') && index == 0 && options.length == 11)
                    return;

                if (options.length === 10)
                    index += 1;

                total += value * index;
            })
            
            let average = total / values.count.reduce((sum, val) => sum + val, 0);
            let message = "average is " + average;

            self.chat.add('Episode ', message, 'rcv', false);
        },
        enable: () => {
            self.polls.listen('clearPoll', self.calculate);
        },
        disable: () => {
            self.polls.unlisten('clearPoll', self.calculate);
        },
        init: () => {
            self.chat = SmidqeTweaks.get('chat');
            self.settings = SmidqeTweaks.get('settings');
            self.polls = SmidqeTweaks.get('polls');
        },
    }
    return self;
}

SmidqeTweaks.add(load());
