BerryTweaks.modules['sortComplete'] = (function(){
'use strict';

const self = {
    originalTabComplete: null,
    squees: {},
    onMessage(data) {
        if ( data.msg.nick != window.NAME && window.NAME.length > 0 && window.detectName(window.NAME, data.msg.msg) )
            self.squees[data.msg.nick] = new Date(data.msg.timestamp).getTime();
    },
    tabComplete(elem) { // copypasted from functions.js; changes annotated
        var chat = elem.val();
        var tabOptions = elem.data('tabcycle');
        var hasTabOptions = (tabOptions !== undefined && tabOptions != false);
        var who = '';
        var result = [];

        if (!hasTabOptions) {
            var onlyword = /^([^ ]*)$/i;
            var endword = /([^ ]+)$/i;
            var m = chat.match(endword);
            if (m) {
                who = m[1];
            }
            else {
                return;
            }

            var re = new RegExp('^' + who + '.*', 'i');
            for (var prop in CHATLIST) {
                m = prop.match(re);
                if (m && prop != window.NAME) { // BerryTweaks: added check for self-completes
                    // BerryTweaks: removed sorting based on lastchat
                    result.push({ nick:prop, lastchat:CHATLIST[prop]||0, lastsquee:self.squees[prop]||0 }); // BerryTweaks: added lastsquee
                }
            }

            if (result.length == 1) {
                x = chat.replace(endword, result[0].nick);
                if (chat.match(onlyword)) {
                    x += ": ";
                }
                else {
                    x += " ";
                }
                elem.val(x);
            }
            else if (result.length > 1) {
                // BerryTweaks: added sorting
                result.sort((a, b) => {
                    const diff = b.lastsquee - a.lastsquee;
                    return diff ? diff : (b.lastchat - a.lastchat);
                });

                tabOptions = [];
                for (var i in result) {
                    var x = chat.replace(endword, result[i].nick);
                    if (chat.match(onlyword)) {
                        x += ": "
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
            var index = elem.data('tabindex');
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
    }
};

BerryTweaks.patch(window, 'addChatMsg', (data, _to) => {
    if ( !self.enabled )
        return;

    self.onMessage(data);
});

return self;

})();
