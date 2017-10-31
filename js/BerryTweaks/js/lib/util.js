BerryTweaks.lib['util'] = (function(){
'use strict';

const self = {
    getPlaylist() {
        const out = [];
        let item = PLAYLIST.first;
        for ( let i=0; i<PLAYLIST.length; ++i ){
            out.push(item);
            item = item.next;
        }
        return out;
    },
    dumpPlaylist() {
        console.log(JSON.stringify(self.getPlaylist()));
    }
};

return self;

})();
