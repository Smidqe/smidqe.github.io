BerryTweaks.modules['showLocaltimes'] = (function(){
'use strict';

const self = {
    css: true,
    libs: ['user'],
    clockUpdateInterval: null,
    todo: [],
    todoFlusher: null,
    update() {
        const now = BerryTweaks.getServerTime();
        $('#chatlist > ul > li').each(function(){
            const el = $(this);
            const offset = el.data('berrytweaks-localtime_offset');
            if ( offset == null )
                return;

            const time = new Date(now + offset);
            const mins = time.getUTCMinutes();
            $('.berrytweaks-localtime', el).text(time.getUTCHours() + ':' + (mins<10 ? '0'+mins : mins));
        });
    },
    flushTodo() {
        BerryTweaks.lib.user.getTimes(self.todo, (nick, timedata) => {
            const el = $('#chatlist > ul > li.' + nick);
            const offset = timedata && timedata.gmtOffset;
            if ( offset == null )
                return;

            if ( !$('.berrytweaks-localtime', el).length ){
                $('<div>', {
                    class: 'berrytweaks-localtime'
                }).appendTo(el);
            }

            el.data('berrytweaks-localtime_offset', (+offset)*1000);
        }, () => {
            self.update();
        });
        self.todoFlusher = null;
    },
    handleUser(nick) {
        if ( !nick )
            return;

        self.todo.push(nick);
        if ( !self.todoFlusher ){
            self.todoFlusher = setTimeout(() => {
                self.flushTodo();
            }, 1000);
        }
    },
    enable() {
        $('#chatlist > ul > li').each(function(){
            self.handleUser($(this).data('nick'));
        });
        self.clockUpdateInterval = setInterval(self.update, 1000*60);
    },
    disable() {
        if ( self.clockUpdateInterval ){
            clearInterval(self.clockUpdateInterval);
            self.clockUpdateInterval = null;
        }

        $('#chatlist > ul > li .berrytweaks-localtime').remove();
    }
};

BerryTweaks.patch(window, 'addUser', data => {
    if ( !self.enabled )
        return;

    self.handleUser(data && data.nick);
});

return self;

})();
