function load() {
    const self = {
        config: {
            group: 'playlist',
            values: [{
                title: 'Show playlist changes',
                key: 'trackPlaylist',
            }, {
                title: 'Additions',
                key: 'trackAdd',
                depends: ['trackPlaylist'],
                sub: true,
            }, {
                title: 'Removals',
                key: 'trackRemove',
                depends: ['trackPlaylist'],
                sub: true,
            }, {
                title: 'Moves',
                key: 'trackMove',
                depends: ['trackPlaylist'],
                sub: true,
            }, {
                title: 'Position',
                key: 'trackPosition',
                sub: true,
                depends: ['trackPlaylist'],
            }, {
                title: 'Current position',
                key: 'trackCurrent',
                sub: true,
                depends: ['trackPlaylist', 'trackPosition'],
            }, {
                title: 'Volatiles',
                key: 'trackVolatile',
                depends: ['trackPlaylist'],
                sub: true,
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
            }

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

                    if (self.settings.get('trackPosition'))
                        msg += ' (' + value.old + ' -> ' + value.new + ')';

                    if (self.settings.get('trackCurrent'))
                        msg += ' Current: ' + self.playlist.get('title', decodeURIComponent(window.ACTIVE.videotitle)).pos;
                }
            })


            SmidqeTweaks.modules.chat.add('Playlist', msg, 'act', true);
            data.changes = [];
        },
        action: (data, action) => {
            if (!self.enabled || !data)
                return;

            let volatile = action.id === 'volatile';
            let object = self.tracking[data.videoid];
            let video = volatile ? self.playlist.get('index', data.pos).value : null;
            let message = false;

            if (!object && !volatile)
                object = self.track(data);

            if (!object && volatile)
                object = self.tracking[video.videoid] || self.track(video);

            switch (action.id) {
                case 'add': message = true; break;
                case 'remove':
                {
                    object.timeout = setTimeout(() => {
                        if (self.settings.get('trackRemove') && self.playlist.get('title', object.title).pos === -1)
                            self.message(object, 'remove');

                        delete self.tracking[object.videoid];
                    }, 1000);

                    break;
                }
                case 'modify':
                {
                    //a move happened
                    if (object.timeout)
                    {
                        clearTimeout(object.timeout);
                        object.timeout = null;
                    }
                    //add position to the data
                    data.pos = self.playlist.get('title', object.title).pos;
                    
                    //check values
                    $.each(data, (key, value) => {
                        //don't check values that are non existant in the our end
                        if (!object[key])
                            return;

                        if (object[key] === value)
                            return;

                        object.changes.push({
                            key: key,
                            old: object[key],
                            new: value
                        })

                        object[key] = value; //store new value
                    })

                    break;
                }

                case 'volatile':
                {
                    object.changes.push({
                        key: 'volat',
                        old: !data.volat,
                        new: data.volat
                    })

                    //remove from tracking if set to permanent, on nonvol -> vol it'll be removed after it has played triggering 'remove'
                    object.remove = !data.volat;

                    break;
                }
            }

            if ((message || object.changes.length > 0) && self.settings.get(action.setting))
                self.message(object, action.id);

            if (object.remove)
                delete self.tracking[object.videoid];
        },
        enable: () => {
            $.each(self.patch, (index, value) => {
                SmidqeTweaks.patch({container: {obj: window.PLAYLIST.__proto__, name: 'playlist'}, name: value, callback: self.proto, after: value === 'remove' ? false : true})
            })

            $.each(self.socket, (key, val) => {
                socket.on(key, val);
            })

            self.enabled = true;
        },
        disable: () => {
            self.enabled = false;

            $.each(self.patch, (index, value) => {
                SmidqeTweaks.unpatch({container: 'playlist', name: value, callback: self.proto});
            })

            $.each(self.socket, (key, val) => {
                socket.removeListener(key, val);
            })
        },
        toggle: () => {
            self.enabled = SmidqeTweaks.settings.get('trackPlaylist')
        },
        proto: (node, newNode) => {
            let conf = {id: 'modify', setting: 'trackMove'}
            
            if (!newNode)
                conf = {id: 'remove', setting: 'trackRemove'}

            self.action(newNode || node, conf);
        },
        init: () => {
            self.playlist = SmidqeTweaks.get('modules', 'playlist');
            self.settings = SmidqeTweaks.get('modules', 'settings');

            self.socket = {
                addVideo: (data) => {
                    console.log('add');
                    self.action(data.video, {id: 'add', setting: 'trackAdd'})
                },
                randomizeList: (data) => {
                    console.log(data);
                    self.shuffle = true;
                },
                setVidVolatile: (data) => {
                    self.action(data, { id: 'volatile', setting: 'trackVolatile' })
                },
                recvNewPlaylist: (data) => {
                    console.log(data);
                    self.shuffle = false;
                    SmidqeTweaks.modules.chat.add('Playlist', 'Playlist was shuffled', 'act', true);
                },
                sortPlaylist: () => {
                    console.log('sortPlaylist');
                },
                refreshMyPlaylist: () => {
                    console.log('refreshMyPlaylist');
                }
            }
        },
    }
    return self;
}

SmidqeTweaks.add(load());
