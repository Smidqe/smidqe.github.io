function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'chat', 
        },
        events: [
            'chatMsg', 'setNick', 'setType', 'newChatList', 
            'userJoin', 'fondleUser', 'userPart', 'shadowBan', 
            'unShadowBan', 'drinkCount', 'numConnected', 'leaderIs'
        ],
        functions: [
            'addChatMsg', 'handleNumCount', 'addNewMailMessage'
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
                self.messages(nick).last().find('.nick').css('display', 'none');

            delete CHATLIST[nick];
        },
        users: () => {
            return $('#chatlist li').map((index, data) => {
                let classes = $(data).attr('class').split(' ');
                let result = {
                    name: $(data).find('.chatlistname').text(),
                    me: classes.indexOf('me') !== -1,
                };

                result.group = classes.filter(value => value !== result.name)[0];
                return result;
            });
        },
        groups: () => {
            let result = [];

            self.users().map((index, elem) => {
                if (result.indexOf(elem.group) !== -1)
                    return;

                result.push(elem.group);
            });

            return result;
        },
        drinks: () => {
            return self.container.find('.drink');
        },
        emotes: (nick) => {
            return self
                .messages(nick)
                .filter((index, elem) => 
                    $(elem).find('.berryemote').length > 0
                );
        },
        rcv: () => {
            return self.messages().find('.rcv').parent();
        },
        messages: (nick) => {
            let selector = '[class*=msg-]';

            if (nick)
                selector = '.msg-' + nick;

            return self.container.find(selector);
        },
        usercount: () => {
            return window.CONNECTED;
        },
        highlight: (post) => {
            (post || self.last()).addClass('highlight');
        },
        last: () => {
            return self.messages.last();
        },
        patch: (key, callback, after=true) => {
            if (self.functions.indexOf(key) === -1)
                return;

            let data = {
                container: {obj: window, name: 'chat'},
                name: key,
                after: after,
                callback: callback
            };

            SmidqeTweaks.patch(data);
        },
        unpatch: (key, callback) => {
            SmidqeTweaks.unpatch({
                container: 'chat',
                name: key,
                callback: callback
            });
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

            //just for curiosity
			$.each(self.events, (index, value) => {
				self.listen(value, data => console.log('Event: ' + value, data));
            });
        },
    };
    return self;
}
SmidqeTweaks.add(load());
