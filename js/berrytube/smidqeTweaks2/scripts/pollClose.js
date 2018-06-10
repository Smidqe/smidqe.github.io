function load() {
    const self = {
        meta: {
            group: 'scripts',
            name: 'pollClose',
            depends: ['chat', 'settings']
        },
        config: {
            group: 'polls',
            values:[{
                title: 'Show poll closures in chat',
                key: 'pollClose',
            }, {
                title: 'Squee upon closure',
                key: 'squeeClose',
                sub: true,
                depends: ['pollClose'],
            }]
        },
        notify: () => {
            let poll = self.polls.first(false);
            let message = "'" + poll.find('.title').text() + "' was closed"; 
            
            if (self.settings.get('squeeClose'))
                window.doSqueeNotify();

            self.chat.add('Poll', message, 'act', false);
        },
        enable: () => {
            self.polls.listen('clearPoll', self.notify);
        },
        disable: () => {
            self.polls.unlisten('clearPoll', self.notify);
        },
    }

    return self;
}

SmidqeTweaks.add(load())
