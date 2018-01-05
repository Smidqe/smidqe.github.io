function load() {
    const self = {
        started: false,
        category: 'module',
        requires: ['stats'],
        name: 'chat',
        add: (nick, text, type, hideNick) => {
            var time = new Date();

            //utilise Berrytweaks to get consistent time, there is variability between local and server times \\fsnotmad
            if (SmidqeTweaks.settings.get('berrytweaks') && window.BerryTweaks)
                time = BerryTweaks.getServerTime();

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

            //add option to hide the nick
            if (hideNick)
                $('.msg-' + nick).last().find('.nick').css('display', 'none');

            //prevent tabcomplete on non existant/wrong users
            delete CHATLIST[nick];
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

            //make sure the users is the top one
            result.usercount = $('#connectedCount').text();

            $.each(groups, (index, value) => {
                if (value === "")
                    return;

                result[value.split(':')[0].toLowerCase()] = value.split(':')[1].trim();
            })

            return result;
        },
        init: () => {
            let stats = SmidqeTweaks.modules.stats;

            $.each(self.getUsers(), (key, value) => {
                stats.addPair('chat', {
                    id: key,
                    title: key[0].toUpperCase() + key.slice(1),
                    value: value,
                    sub: key !== "usercount",
                });
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
SmidqeTweaks.addModule(load());
