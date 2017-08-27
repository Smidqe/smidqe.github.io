function load() {
    const self = {
        add: (nick, text, type) => {
            var time = null;

            //get the server time from berrytweaks if it is enabled
            if (settings.get("berrytweaks"))
                time = BerryTweaks.getServerTime();
            else
                time = new Date();

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

        getFromNick: () => {

        },
        getEmotes: () => {

        },
    }
    return self;
}
SmidqeTweaks.modules.chat = load();
