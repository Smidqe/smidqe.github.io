BerryTweaks.modules['sync'] = (function(){
'use strict';

const self = {
    libs: ['https://dl.atte.fi/lib/sha1.min.js'],
    post(data, callback) {
        const nick = localStorage.getItem('nick');
        const pass = localStorage.getItem('pass');
        if ( !nick || !pass )
            return;

        data['id'] = sha1(nick + '|' + pass);
        $.post('https://atte.fi/berrytweaks/api/sync.php', data, callback, 'json');
    },
    sync() {
        if ( !self.enabled )
            return;

        const browser = {
            version: BerryTweaks.getSetting('syncVersion', 0),
            data: {
                squee: localStorage.getItem('highlightList'),
                PEP: localStorage.getItem('PEP'),
                squeeSound: BerryTweaks.getSetting('squeeSound')
            }
        };

        self.post({
            action: 'sync',
            payload: JSON.stringify(browser)
        }, server => {
            BerryTweaks.setSetting('syncVersion', server.version);

            if ( server.data.squee ){
                localStorage.setItem('highlightList', server.data.squee);

                if ( server.data.squee.length > 0 )
                    HIGHLIGHT_LIST = server.data.squee.split(';');
            }

            if ( server.data.PEP ){
                localStorage.setItem('PEP', server.data.PEP);

                if ( window.PEP ){
                    PEP.alarms = PEP.getStorage();
                    PEP.restarPlaylist();
                }
            }

            if ( server.data.squeeSound ){
                BerryTweaks.setSetting('squeeSound', server.data.squeeSound);

                if ( BerryTweaks.modules.squeeSound )
                    BerryTweaks.modules.squeeSound.applySound();
            }
        });
    },
    delete() {
        $('#berrytweaks-module-toggle-sync').prop('checked', false);

        self.post({
            action: 'delete'
        }, data => {
            if ( !data.found ){
                BerryTweaks.dialog('No data found on server! Have you already deleted it?');
                return;
            }

            if ( data.deleted )
                BerryTweaks.dialog('Data found and deleted successfully');
            else
                BerryTweaks.dialog('Data found, but deletion failed! Please contact Atte');
        });
    },
    enable() {
        self.sync();
    },
    addSettings(container) {
        $('<a>', {
            href: 'javascript:void(0)',
            click: self['delete'],
            text: 'Delete synced data from server'
        }).appendTo(container);
    },
    bind: {
        patchAfter: {
            showCustomSqueesWindow() {
                $('.controlWindow > div > .button:nth-child(2)').click(BerryTweaks.raven.wrap(function click() {
                    self.sync();
                }));
            }
        }
    }
};

BerryTweaks.whenExists('#manageAlarms', () => {
    BerryTweaks.patch(PEP, 'setStorage', () => {
        self.sync();
    });
});

return self;

})();
