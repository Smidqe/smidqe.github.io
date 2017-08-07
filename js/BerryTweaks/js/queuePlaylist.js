BerryTweaks.modules['queuePlaylist'] = (function(){
'use strict';

const self = {
    css: false,
    queue: [],
    queueTimeout: null,
    queueVideo(id) {
        const input = $('.import > div:nth-child(2) input');
        const button = $('.import > div:nth-child(2) > div#addVolatButton');
        input.val(id);
        button.click();
    },
    queueNext() {
        if ( self.queueTimeout !== null ){
            clearTimeout(self.queueTimeout);
            self.queueTimeout = null;
        }

        self.queueTimeout = setTimeout(() => {
            self.queueTimeout = null;

            const video = self.queue.pop();
            if ( !video )
                return;

            self.queueVideo(video.id);
        }, 1000);
    },
    enable() {
        whenExists('.import > div:nth-child(2) > .clear', clear => {
            $('<div>', {
                'class': 'impele btn berrytweaks-queue-playlist',
                'text': 'P'
            }).click(() => {
                const url = $('.import > div:nth-child(2) input').val();
                const m = url.match(/youtube\.com\/.*?[&?]list=([a-zA-Z0-9_-]+)/);
                const id = m ? m[1] : url;
                $.getJSON('https://www.googleapis.com/youtube/v3/playlistItems', {
                    key: 'AIzaSyBI0R0kAhUgPVt-Ov6OFn38xVBCk2qyDJY',
                    playlistId: id,
                    part: 'snippet',
                    maxResults: '50'
                }, data => {
                    if ( !data || !data.items ){
                        BerryTweaks.dialog("That doesn't seem like a valid playlist URL or ID");
                        return;
                    }
                    if ( data.items.length === 0 ){
                        BerryTweaks.dialog("That playlist seems to be empty");
                        return;
                    }

                    const videos = data.items.filter(item => item.kind === 'youtube#playlistItem' && item.snippet && item.snippet.resourceId.kind === 'youtube#video').map(item => {
                        return {
                            title: item.snippet.title,
                            id: item.snippet.resourceId.videoId
                        };
                    });
                    if ( !videos || videos.length === 0 ){
                        BerryTweaks.dialog("That playlist doesn't seem to be empty, but it didn't contain any videos either. What did you even do?");
                        return;
                    }

                    const titleList = videos.map(video => video.title).join(', ');
                    BerryTweaks.confirm('Going to queue the following videos: ' + titleList, ok => {
                        if ( !ok )
                            return;

                        self.queue = videos;
                        self.queueNext();
                    });
                });
            }).insertBefore(clear);
        });
    },
    disable() {
        $('.berrytweaks-queue-playlist').remove();
    }
};

BerryTweaks.patch(window, 'revertLoaders', () => {
    if ( self.enabled )
        self.queueNext();
});

BerryTweaks.patch(window, 'doRequeue', () => {
    if ( self.enabled )
        self.queueNext();
});

return self;

})();
