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
        enabled: false,
        notify: () => {
            let title = $(".poll:first:not(.active)").find('.title').text();
            let msg = "'" + title + "' was closed";

            if (SmidqeTweaks.get('modules', 'settings').get('squeeClose'))
                doSqueeNotify();

            SmidqeTweaks.modules.chat.add('Poll', msg, 'act', false);
        },
        enable: () => {
            self.enabled = true;

            socket.on('clearPoll', self.notify);
        },
        disable: () => {
            self.enabled = false;

            socket.removeListener('clearPoll', self.notify);
        },
    }

    return self;
}

SmidqeTweaks.add(load())
