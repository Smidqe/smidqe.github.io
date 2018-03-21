/*
	TODO:
	- Add separate input to give the amount of buttons/values in the poll to trigger the
	script. Since some mods have polls that start from 1 and not from zero.
	
*/

function load() {
    const self = {
        meta: {
            group: 'script',
            name: 'pollAverage'
        },
        name: 'pollAverage',
        settings: { 
            group: 'poll',
            values: [{
                title: "Calculate episode average",
                key: "pollAverage",
            }, {
                title: 'Ignore 0-votes',
                key: 'ignoreZero',
                sub: true,
            }, {
                title: 'Show average in stats',
                key: 'statsAverage',
            }, {
                title: 'Show previous averages',
                key: 'historyAverage',
                sub: true,
            }],
        },
        enabled: false,
        calculate: function(data) {
            if (data.votes.length < 10) //to take into account that some mods don't use 0..10 scale, instead there's 1..10
                return;

            let total = 0;
            let count = 0;

            $.each(data.votes, (index, value) => {
                //only ignore zeros when there are 11 values (0..10), and not when (1..10)
                if (self.main.get('ignoreZero') && index == 0 && data.votes.length == 11)
                    return;

                total += value * index;
                count += value;
            })

            let average = total / count;
            let msg = "average is " + average;
            
            //don't show invalid values
            if (isNaN(average))
                return;

            //not functional yet
            if (self.main.get('statsAverage'))
                self.save();
            
            self.chat.add("Episode ", msg, 'rcv', false);
        },
        save: (value) => {

        },
        enable: () => {
            self.enabled = true;
        },
        disable: () => {
            self.enabled = false;
        },
        init: () => {
            self.stats = SmidqeTweaks.modules.stats;
            self.chat = SmidqeTweaks.modules.chat;
            self.main = SmidqeTweaks.settings;

            socket.on('clearPoll', (data) => {
                if (!self.enabled)
                    return;

                self.calculate(data);
            })
        },
    }
    return self;
}

SmidqeTweaks.add(load());
