function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'chat', 
            //requires: ['colors']
        },
        events: [
            'chatMsg', 'setNick', 'setType', 'newChatList', 
            'userJoin', 'fondleUser', 'userPart', 'shadowBan', 
            'unShadowBan', 'drinkCount', 'numConnected', 'leaderIs'
        ],
        functions: [
            'addChatMsg', 'handleNumCount'
        ],
        container: null,
        started: false,
        add: (nick, text, type, hideNick) => {
            let time = new Date();

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

            if (hideNick)
                $('.msg-' + nick).last().find('.nick').css('display', 'none');

            delete CHATLIST[nick];
        },
        users: () => {
            return $('#chatlist li').map((index, data) => {
                let classes = $(data).attr('class').split(' ');
                let result = {
                    name: $(data).find('.chatlistname').text(),
                    me: classes.indexOf('me') !== -1,
                } 

                result.group = classes.filter(value => value !== result.name)[0];
                return result;
            });
        },
        drinks: () => {
            return self.container.find('.drink');
        },
        emotes: () => {
            return $('.berryemote');
        },
        rcv: () => {
            return self.messages().find('.rcv').parent();
        },
        messages: () => {
            return self.container.find('[class*=msg-]');
        },
        usercount: () => {
            return window.CONNECTED;
        },
        patch: (key, callback, after=true) => {
            if (self.functions.indexOf(key) === -1)
                return;

            let data = {
                container: {obj: window, name: 'chat'},
                name: key,
                after: after,
                callback: callback
            }

            SmidqeTweaks.patch(data);
        },
        unpatch: (key, callback) => {
            SmidqeTweaks.unpatch({
                container: 'chat',
                name: key,
                callback: callback
            })
        },
        listen: (key, callback) => {
            if (self.events.indexOf(key) === -1)
                return;

            socket.on(key, callback);
        },
        unlisten: (key, callback) => {
            if (self.events.indexOf(key) === -1)
                return;

            socket.removeListener(key, callback);
        },
        init: () => {
            self.container = $('#chatbuffer');
            self.started = true;
        },
    }
    return self;
}
SmidqeTweaks.add(load());
