function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'chat',
        },
        add: (nick, text, type, hideNick) => {
            var time = new Date();

            //utilise Berrytweaks to get consistent time, there is variability between local and server times \\fsnotmad
            if (window.BerryTweaks)
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
        users: () => {
            let users = $('#chatlist li');
            let result = [];

            $.each(users, (index, obj) => {
                let filters = ['admin', 'assistant', 'user', 'anon'];
                let attrs = $(obj).attr('class').split(' ');

                result.push({
                    name: attrs.filter(name => filters.indexOf(name) === -1)[0],
                    group: attrs.filter(name => filters.indexOf(name) !== -1),
                    me: attrs.indexOf('me') !== -1,
                })
            })

            return result;
        },
        emotes: () => {
            return $('.berryemote');
        },
        rcv: () => {
            return $('.rcv');
        },
        usercount: () => {
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
    }
    return self;
}
SmidqeTweaks.add(load());
