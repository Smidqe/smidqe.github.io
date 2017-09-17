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
        getUsers: () => {
            const result = {};
            const groups = $('#connectedCountWrapper').attr('title').split('<br />');

            $.each(groups, (index, value) => {
                console.log(value);

                if (value === "")
                    return;

                result[value.split(':')[0].toLowerCase()] = value.split(':')[1].trim();
            })

            result.count = $('#connectedCount').text();
            return result;
        },
        init: () => {
            let stats = SmidqeTweaks.modules.stats;

            $.each(self.getUsers(), (key, value) => {
                stats.addPair('general', { id: key, title: key[0].toUpperCase() + key.slice(1), value: value, })
            })

            SmidqeTweaks.patch(window, 'handleNumCount', (data) => {
                stats.update('users', data.num);

                $.each(self.getUsers(), (key, value) => {
                    stats.update(key, value);
                })
            })

            self.started = true;
        },
    }
    return self;
}
SmidqeTweaks.addModule('chat', load(), 'main');
