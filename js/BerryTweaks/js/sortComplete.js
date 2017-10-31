BerryTweaks.modules['sortComplete'] = (function(){
'use strict';

const self = {
    originalTabComplete: null,
    squees: {},
    onMessage(data) {
        if ( data.msg.nick !== window.NAME && window.NAME.length > 0 && window.detectName(window.NAME, data.msg.msg) )
            self.squees[data.msg.nick] = new Date(data.msg.timestamp).getTime();
    },
    tabComplete(elem) { // originally copypasted from functions.js
        const chat = elem.val();
        let tabOptions = elem.data('tabcycle');
        let hasTabOptions = !!tabOptions;
        let who = '';
        const result = [];

        if (!hasTabOptions) {
            const onlyword = /^([^ ]*)$/i;
            const endword = /([^ ]+)$/i;
            let m = chat.match(endword);
            if (m) {
                who = m[1];
            }
            else {
                return;
            }

            const re = new RegExp('^' + who + '.*', 'i');
            for (const prop in CHATLIST) {
                if (!CHATLIST.hasOwnProperty(prop)) {
                    continue;
                }

                m = prop.match(re);
                if (m && prop !== window.NAME) {
                    result.push({ nick:prop, lastchat:CHATLIST[prop]||0, lastsquee:self.squees[prop]||0 }); // BerryTweaks: added lastsquee
                }
            }

            if (result.length == 1) {
                let x = chat.replace(endword, result[0].nick);
                if (chat.match(onlyword)) {
                    x += ": ";
                }
                else {
                    x += " ";
                }
                elem.val(x);
            }
            else if (result.length > 1) {
                result.sort((a, b) => {
                    const diff = b.lastsquee - a.lastsquee;
                    return diff ? diff : (b.lastchat - a.lastchat);
                });

                tabOptions = [];
                for (let i = 0; i < result.length; ++i) {
                    let x = chat.replace(endword, result[i].nick);
                    if (chat.match(onlyword)) {
                        x += ": ";
                    }
                    else {
                        x += " ";
                    }
                    tabOptions.push(x);
                }
                elem.data('tabcycle', tabOptions);
                elem.data('tabindex', 0);
                hasTabOptions = true;
            }
        }

        if (hasTabOptions) {
            let index = elem.data('tabindex');
            elem.val(tabOptions[index]);
            index = (index + 1) % tabOptions.length;
            elem.data('tabindex', index);
        }
    },
    enable() {
        self.originalTabComplete = window.tabComplete;
        window.tabComplete = self.tabComplete;
    },
    disable() {
        window.tabComplete = self.originalTabComplete;
    },
    bind: {
        patchAdter: {
            addChatMsg(data) {
                self.onMessage(data);
            }
        }
    }
};

return self;

})();
