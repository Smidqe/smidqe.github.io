BerryTweaks.lib['video'] = (function(){
'use strict';

const self = {
    enabled: false,
    interval: null,
    data: {},
    callbacksChange: [],
    callbacksUpdate: [],
    subscribe(change, update) {
        self.unsubscribe(change, update, false);
        if ( change )
            self.callbacksChange.push(change);
        if ( update )
            self.callbacksUpdate.push(update);
        self.updateInternalCallbacks();
    },
    unsubscribe(change, update, updateInternals) {
        const changeIndex = self.callbacksChange.indexOf(change);
        if ( changeIndex >= 0 )
            self.callbacksChange.splice(changeIndex, 1);

        const updateIndex = self.callbacksUpdate.indexOf(update);
        if ( updateIndex >= 0 )
            self.callbacksUpdate.splice(updateIndex, 1);

        if ( updateInternals !== false )
            self.updateInternalCallbacks();
    },
    updateInternalCallbacks() {
        const lastEnabled = self.enabled;
        self.enabled = self.callbacksChange.length > 0 || self.callbacksUpdate.length > 0;
        if ( lastEnabled === self.enabled )
            return;

        if ( self.enabled ){
            self.interval = setInterval(self.onSecondPassed, 1000);
        }
        else{
            if ( self.interval ){
                clearInterval(self.interval);
                self.interval = null;
            }

            self.prevID = null;
        }
    },
    callCallbacks() {
        if ( window.ACTIVE.videoid !== self.prevID ){
            self.prevID = window.ACTIVE.videoid;
            self.data = {
                id: window.ACTIVE.videoid,
                length: window.ACTIVE.videolength ? self.parseTime(window.ACTIVE.videolength) : null,
                title: decodeURIComponent(window.ACTIVE.videotitle),
                link: self.videoLink(window.ACTIVE),
                timedLink: self.videoLink(window.ACTIVE, Math.max(self.time-1, 0)),
                isVolatile: !!window.ACTIVE.volat
            };

            self.callbacksChange.forEach(cback => {
                cback(self.data);
            });
        }
        else
            self.data.timedLink = self.videoLink(window.ACTIVE, Math.max(self.time-1, 0));

        self.callbacksUpdate.forEach(cback => {
            cback(self.data);
        });
    },
    parseTime(time) {
        return {
            h: Math.floor(time / 60 / 60),
            m: Math.floor((time / 60) % 60),
            s: Math.floor(time % 60)
        };
    },
    timeString(time) {
        if ( !time )
            return '';

        time = self.parseTime(time);
        if ( time.h > 0 )
            return time.h+'h' + time.m+'m' + time.s+'s';
        else if ( time.m > 0 )
            return time.m+'m' + time.s+'s';
        else
            return time.s+'s';
    },
    videoLink(vid, time) {
        if ( vid.meta && vid.meta.permalink )
            return vid.meta.permalink;

        const timeStr = self.timeString(time);

        switch ( vid.videotype ){
            case 'yt':
                return 'https://www.youtube.com/watch?v=' + vid.videoid + (timeStr ? '#t='+timeStr : '');
            case 'vimeo':
                return 'https://vimeo.com/' + vid.videoid + (timeStr ? '#t='+timeStr : '');
            case 'dm':
                return 'http://www.dailymotion.com/video/' + vid.videoid;
            case 'osmf':
                return vid.videoid;
            case 'soundcloud':
                return 'https://atte.fi/soundcloud/?' + vid.videoid.substr(2);
            default:
                return null;
        }
    },
    onSecondPassed() {
        self.time += 1;
        self.callCallbacks();
    },
    handleVideoDetails(data) {
        self.time = data.time;
        self.callCallbacks();
    }
};

socket.on('hbVideoDetail', data => {
    if ( self.enabled )
        self.handleVideoDetails(data);
});

socket.on('forceVideoChange', data => {
    if ( self.enabled )
        self.handleVideoDetails(data);
});

return self;

})();
