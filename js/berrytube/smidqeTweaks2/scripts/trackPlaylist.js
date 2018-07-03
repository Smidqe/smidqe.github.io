function load() {
    const self = {
        config: {
            group: 'playlist',
            values: [{
                title: 'Show playlist changes',
                key: 'trackPlaylist',
            }, {
                title: 'Show current position',
                key: 'trackCurrent',
                sub: true,
                depends: ['trackPlaylist'],
            }]
        },
        meta: {
            group: 'scripts',
            name: 'trackPlaylist',
            requires: ['playlist', 'chat', 'settings'],
        },
        shuffle: false,
        tracking: {},
        playlist: null,
        patch: ['remove', 'insertAfter', 'append', 'insertBefore'],
        track: (video, pos) => {
            let title = decodeURIComponent(video.videotitle);
            let position = pos || self.playlist.get('title', title).pos;

            let object = {
                videoid: video.videoid,
                title: title,
                pos: position,
                volat: video.volat,
                videolength: video.videolength,
                videotype: video.videotype,
                timeout: 0,
                changed: false,
                changes: [],
                remove: false,
            };

            self.tracking[object.videoid] = object;
            return object;
        },
        message: (data, id) => {
            let msg = data.title;

            if (data.volat)
                msg += ' (volatile)';

            if (id === 'remove')
                msg += ' was removed from playlist';

            if (id === 'add')
                msg += ' was added to playlist';

            $.each(data.changes, (key, value) => {
                if (value.key === 'volat')
                {
                    msg += ' was set to ';
                    msg += value.new ? ' volatile ' : ' permanent';
                }

                if (value.key === 'pos')
                {
                    msg += ' was moved';
                    msg += ' (' + value.old + ' -> ' + value.new + ')';

                    if (self.settings.get('trackCurrent'))
                        msg += ' Current: ' + self.playlist.position('title', decodeURIComponent(window.ACTIVE.videotitle));
                }
            });

            self.chat.add('Playlist', msg, 'act', true);
            data.changes = [];
        },
        action: (data, action) => {
            if (!self.enabled || !data)
                return;

            let volatile = action === 'volatile';
            let object = self.tracking[data.videoid];
            let video = volatile ? self.playlist.get('index', data.pos).value : null;
            let message = false;

            if (!object && !volatile)
                object = self.track(data);

            if (!object && volatile)
                object = self.tracking[video.videoid] || self.track(video);

            switch (action) {
                case 'add': message = true; break;
                case 'remove':
                {
                    object.timeout = setTimeout(() => {
                        if (!self.playlist.exists('title', object.title))
                            self.message(object, 'remove');

                        delete self.tracking[object.videoid];
                    }, 1000);

                    break;
                }
                case 'modify':
                {
                    clearTimeout(object.timeout);

                    data.pos = self.playlist.get('title', object.title).pos;
                    $.each(data, (key, value) => {
                        if (!object[key])
                            return;

                        if (object[key] === value)
                            return;

                        object.changes.push({
                            key: key,
                            old: object[key],
                            new: value
                        });

                        object[key] = value; 
                    });

                    break;
                }
                case 'volatile':
                {
                    object.changes.push({
                        key: 'volat',
                        old: !data.volat,
                        new: data.volat
                    });

                    object.volat = data.volat;
                    object.remove = !data.volat;
                    break;
                }
            }

            if (message || object.changes.length > 0)
                self.message(object, action);

            if (object.remove)
                delete self.tracking[object.videoid];
        },
        enable: () => {
            $.each(self.patch, (index, value) => {
                self.playlist.patch(value, self.proto, value !== 'remove');
            });

            $.each(self.socket, (key, val) => {
                self.playlist.listen(key, val);
            });

            self.enabled = true;
        },
        disable: () => {
            self.enabled = false;

            $.each(self.patch, (index, value) => {
                self.playlist.unpatch(value, self.proto);
            });

            $.each(self.socket, (key, val) => {
                self.playlist.unlisten(key, val);
            });
        },
        proto: (node, newNode) => {
            let action = 'modify';
            
            if (!newNode)
                action = 'remove';

            self.action(newNode || node, action);
        },
        init: () => {
            self.playlist = SmidqeTweaks.get('playlist');
            self.settings = SmidqeTweaks.get('settings');
            self.chat = SmidqeTweaks.get('chat');

            self.socket = {
                addVideo: (data) => {
                    self.action(data.video, 'add');
                },
                randomizeList: (data) => {
                    console.log('randomize');
                    self.shuffle = true;
                },
                setVidVolatile: (data) => {
                    self.action(data, 'volatile');
                },
                recvNewPlaylist: (data) => {
                    console.log(data);
                    self.shuffle = false;
                    
                    self.chat.add('Playlist', 'Playlist was shuffled', 'act', true);
                },
                sortPlaylist: () => {
                    console.log('sortPlaylist');
                },
                refreshMyPlaylist: () => {
                    console.log('refreshMyPlaylist');
                }
            };
        },
    };
    return self;
}

SmidqeTweaks.add(load());
