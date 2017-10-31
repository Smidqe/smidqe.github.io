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

        self.queueTimeout = BerryTweaks.setTimeout(() => {
            self.queueTimeout = null;

            const video = self.queue.pop();
            if ( !video )
                return;

            self.queueVideo(video.id);
        }, 100);
    },
    getPage(id, token, callback) {
        const params = {
            key: 'AIzaSyBI0R0kAhUgPVt-Ov6OFn38xVBCk2qyDJY',
            playlistId: id,
            part: 'snippet',
            maxResults: '50'
        };
        if ( token )
            params.pageToken = token;

        BerryTweaks.ajax({
            url: 'https://www.googleapis.com/youtube/v3/playlistItems',
            dataType: 'json',
            data: params,
            success(data) {
                if ( !data || (!data.items && self.queue.length === 0) ){
                    BerryTweaks.dialog("That doesn't seem like a valid playlist URL or ID");
                    return;
                }

                self.queue = self.queue.concat(
                    data.items
                    .filter(item => item.kind === 'youtube#playlistItem' && item.snippet && item.snippet.resourceId.kind === 'youtube#video')
                    .map(item => {
                        return {
                            title: item.snippet.title,
                            id: item.snippet.resourceId.videoId
                        };
                    })
                );

                if ( data.nextPageToken )
                    self.getPage(id, data.nextPageToken, callback);
                else
                    callback();
            }
        });
    },
    enable() {
        BerryTweaks.whenExists('.import > div:nth-child(2) > .clear', clear => {
            $('<div>', {
                'class': 'impele btn berrytweaks-queue-playlist',
                'text': 'P'
            }).click(BerryTweaks.raven.wrap(function click() {
                if ( window.TYPE < 2 )
                    return;

                const url = $('.import > div:nth-child(2) input').val();
                const m = url.match(/youtube\.com\/.*?[&?]list=([a-zA-Z0-9_-]+)/);
                const id = m ? m[1] : url;

                self.queue = [];
                self.getPage(id, null, () => {
                    if ( self.queue.length === 0 ){
                        BerryTweaks.dialog("That playlist seems to be empty.");
                        return;
                    }

                    BerryTweaks.confirm(`Queue ${self.queue.length} videos?`, ok => {
                        if ( ok )
                            self.queueNext();
                    });
                });
            })).insertBefore(clear);
        });
    },
    disable() {
        $('.berrytweaks-queue-playlist').remove();
    },
    bind: {
        patchAfter: {
            revertLoaders() {
                self.queueNext();
            },
            doRequeue() {
                self.queueNext();
            }
        }
    }
};

return self;

})();
