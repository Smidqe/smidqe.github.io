BerryTweaks.modules['resetFlair'] = (function(){
'use strict';

const self = {
    flair: 0,
    enable() {
        window.MY_FLAIR_ID = self.flair;
        setStorage('myFlairID', self.flair);
        $('#flairMenu').removeClass().addClass('flair_' + self.flair);
    }
};

return self;

})();
