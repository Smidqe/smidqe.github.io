function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'chat'
        },
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

        get: (type, data) => {
            switch(type)
            {
                case 'usercounts': return self.usercount(); 
                case 'users': return self.users(data); //list of users
                case 'emotes': return self.emotes(data);//used emotes
                case 'rcv': return self.rcv(data);  //rcv's
                default:
                    return undefined;
            }
        },
        users: (data) => {
            /*
                What data do we need?
                data:
                {
                    filters: {
                        users: [],
                        groups: [],
                    }, 

                    keepGroup: false //if this is enabled return value will have group (user, anon, admin etc)
                }
            */
        },
        emotes: (data) => {
            return $('.berryemote');
        },
        rcv: (data) => {
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
