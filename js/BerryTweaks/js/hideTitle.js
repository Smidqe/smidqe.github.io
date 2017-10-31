BerryTweaks.modules['hideTitle'] = (function(){
'use strict';

const self = {
    old: {
        title: null,
        notifyTitle: null
    },
    setFavicon(url) {
        $('link[rel~=icon]').remove();
        $('<link>', {
            type: 'image/x-icon',
            rel: 'shortcut icon',
            href: url
        }).appendTo(document.head);
    },
    enable() {
        if ( !self.old.title )
            self.old.title = window.WINDOW_TITLE;
        if ( !self.old.notifyTitle )
            self.old.notifyTitle = window.NOTIFY_TITLE;

        document.title = window.WINDOW_TITLE = 'BT';
        window.NOTIFY_TITLE = '!';

        self.setFavicon('https://dl.atte.fi/blank.ico');
    },
    disable() {
        if ( self.old.title )
            document.title = window.WINDOW_TITLE = self.old.title;
        if ( self.old.notifyTitle )
            window.NOTIFY_TITLE = self.old.notifyTitle;

        self.setFavicon('/favicon.ico');
    }
};

return self;

})();
