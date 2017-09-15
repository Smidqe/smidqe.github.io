function load() {
    const self = {
        started: false,
        requires: ['stats'],
        name: 'chat',
        add: (nick, text, type) => {
            const time = new Date();

            addChatMsg({
                msg: {
                    nick,
                    msg: text,
                    metadata: {
                        graymute: false,
                        nameflaunt: false,
                        flair: null,
                        channel: 'main'
                    },
                    emote: type,
                    timestamp: time,
                },

                ghost: false,
            }, "#chatbuffer");

            //prevent tabcomplete on non existant/wrong users
            delete CHATLIST[nick];
        },

        getMessages: (user) => {
            if (!user)
                return null;

            //

        },
        //could be expanded more
        getEmotes: (user) => {
            var query = null;

            if (!user)
                query = $('.berryemote');
            else
                query = $('#chatbuffer > .' + user + ' .berryemote');

            return query;
        },

        init: () => {
            self.stats = SmidqeTweaks.modules.stats;

            SmidqeTweaks.patch(window, 'handleNumCount', (data) => {
                self.stats.update('users', data.num);
            })

            self.started = true;
        },
    }
    return self;
}
SmidqeTweaks.addModule('chat', load(), 'main');
