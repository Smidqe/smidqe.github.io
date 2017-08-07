BerryTweaks.modules['flags'] = (function(){
'use strict';

const self = {
    css: true,
    libs: ['user'],
    urlPrefix: 'https://dl.atte.fi/flags/',
    todo: [],
    flushTodo() {
        BerryTweaks.lib.user.getTimes(self.todo, (nick, timedata) => {
            const el = $('#chatlist > ul > li.' + nick);
            if ( timedata.countryCode && !$('.berrytweaks-flag', el).length ){
                $('<div>', {
                    class: 'berrytweaks-flag',
                    css: {
                        'background-image': `url("${self.urlPrefix}${timedata.countryCode}.png")`
                    }
                }).appendTo(el);
            }
        });
        self.todo = [];
    },
    handleUser(nick) {
        if ( !nick )
            return;

        self.todo.push(nick);
        if ( !self.todoFlusher ){
            self.todoFlusher = setTimeout(() => {
                self.todoFlusher = null;
                self.flushTodo();
            }, 1000);
        }
    },
    enable() {
        $('#chatlist > ul > li').each(function(){
            self.handleUser($(this).data('nick'));
        });
    },
    disable() {
        $('#chatlist > ul > li .berrytweaks-flag').remove();
    }
};

BerryTweaks.patch(window, 'addUser', data => {
    if ( !self.enabled )
        return;

    self.handleUser(data && data.nick);
});

return self;

})();
