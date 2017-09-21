function load() {
    const self = {
        started: false,
        requires: ['stats'],
        name: 'chat',
        pairs: [{
            id: 'count',
            title: 'Current usercount',
            value: 0,
        }, {
            id: 'admins',
            title: 'Moderators',
            value: 0,
            sub: true,
        }, {
            id: 'assistants',
            title: 'Modmins',
            value: 0,
            sub: true,
        }, {
            id: 'users',
            title: 'Normal users',
            value: 0,
            sub: true,
        }, {
            id: 'anons',
            title: 'Anons',
            value: 0,
            sub: true,
        }, {
            id: 'lurkers',
            title: 'Lurkers',
            value: 0,
            sub: true,
        }],
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

            if (groups.length != 6)
                return result;

            $.each(groups, (index, value) => {
                if (value === "")
                    return;

                result[value.split(':')[0].toLowerCase()] = value.split(':')[1].trim();
            })

            result.count = $('#connectedCount').text();
            return result;
        },
        init: () => {
            let stats = SmidqeTweaks.modules.stats;

            $.each(self.pairs, (key, value) => {
                stats.addPair('chat', value);
            })

            SmidqeTweaks.patch(window, 'handleNumCount', () => {
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
