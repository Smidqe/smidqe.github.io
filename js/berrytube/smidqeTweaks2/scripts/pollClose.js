function load() {
    const self = {
        meta: {
            group: 'script',
            name: 'pollClose'
        },
        settings: {
            group: 'poll',
            values:[{
                title: 'Show poll closures in chat',
                type: 'checkbox',
                key: 'pollClose',
            }]
        },
        enabled: false,
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

                let title = $(".poll:first:not(.active)").find('.title').text();
                let msg = "'" + title + "' was closed";

                SmidqeTweaks.modules.chat.add('Poll', msg, 'act', false);
            })
        },
    }

    return self;
}

SmidqeTweaks.add(load())
