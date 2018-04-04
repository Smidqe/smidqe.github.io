/*
    TODO:
        - rewrite some parts 
        
*/

function load() {
    const self = {
        settings: {
            group: 'playlist',
            values: [{
                title: 'Track changes',
                key: 'trackPlaylist',
            }, {
                title: 'Show video additions',
                key: 'trackAdd',
                depends: ['trackPlaylist'],
                sub: true,
            }, {
                title: 'Show video removals',
                key: 'trackRemove',
                depends: ['trackPlaylist'],
                sub: true,
            }, {
                title: 'Show video moves',
                key: 'trackMove',
                depends: ['trackPlaylist'],
                sub: true,
            }, {
                title: 'Show video index',
                key: 'trackPosition',
                sub: true,
                depends: ['trackPlaylist'],
            }, {
                title: 'Show current index',
                key: 'trackCurrent',
                sub: true,
                depends: ['trackPlaylist', 'trackPosition'],
            }, {
                title: 'Show volatile changes',
                key: 'trackVolatile',
                depends: ['trackPlaylist'],
                sub: true,
            },]
        },
        //this might be the future
        meta: {
            group: 'scripts',
            name: 'trackPlaylist',
            requires: ['playlist', 'chat'],
        },
        shuffle: false,
        tracking: {},
        playlist: null,
        track: (video) => {
            var title = decodeURIComponent(video.videotitle);
            var pos = self.playlist.get('title', title).pos;

            var object = {
                videoid: video.videoid,
                title: title,
                pos: pos,
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

            //try to rewrite this
            if (data.changed) {
                //???
                if (Object.keys(data.changes).indexOf('volat'))
                    msg += ' was set to ' + data.volat === true ? ' volatile ' : ' permanent';

                $.each(data.changes, (key, value) => {

                    switch (value.key) {
                        case 'volat':
                            {
                                //possibly separate these to vol -> non vol && non vol -> vol

                                msg += ' was set to ' + value.new === true ? ' volatile ' : ' permanent';

                                break;
                            };
                        case 'pos':
                            {
                                msg += ' was moved';

                                if (SmidqeTweaks.settings.get('showPositionChange'))
                                    msg += ' (' + value.old + ' -> ' + value.new + ')';

                                if (SmidqeTweaks.settings.get('showCurrentPosition'))
                                    msg += ' Current: ' + self.playlist.get('title', decodeURIComponent(window.ACTIVE.videotitle)).pos;

                                break;
                            };
                    }
                })
            }

            SmidqeTweaks.modules.chat.add('Playlist', msg, 'act', true);

            data.changes = [];
        },
        action: (data, action) => {
            if (!self.enabled || self.shuffle || !data)
                return;

            let volatile = action.id === 'volatile';
            let object = self.tracking[data.videoid];
            let video = volatile ? self.playlist.get('index', data.pos) : null;
            let message = true;

            if (volatile)
                object = self.tracking[video.videoid];

            if (!object && !volatile)
                object = self.track(data);

            if (!object && volatile)
                object = self.track(video);

            switch (action.id) {
                case 'remove':
                    {
                        object.timeout = setTimeout(() => {
                            //this covers the move (removed and readded)
                            if (SmidqeTweaks.settings.get('trackRemove'))
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

                            if (object[key] !== value) {
                                object.changes.push({
                                    key: key,
                                    old: video[key],
                                    new: value
                                })

                                object[key] = value; //store new value
                            }
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

                        object.remove = data.volat;

                        break;
                    }
            }

            if ((message || object.changes.length > 0) && SmidqeTweaks.settings.get(action.setting))
                self.message(object, action.id);

            if (object.remove)
                delete self.tracking[object.videoid];
        },
        enable: () => {
            self.enabled = true;
        },
        disable: () => {
            self.enabled = false;
        },
        toggle: () => {
            self.enabled = SmidqeTweaks.settings.get('trackPlaylist')
        },
        init: () => {
            self.playlist = SmidqeTweaks.get('playlist', 'modules');

            socket.on('addVideo', (data) => {
                self.action(data.video, { id: 'add', setting: 'trackAdd' })
            })

            socket.on('randomizeList', () => {
                SmidqeTweaks.modules.chat.add('Playlist', 'Playlist has been shuffled', 'rcv', true);
                self.shuffle = true;
            })

            //this needs testing eventually (need to have a method to figure out if playlist has been shuffled)
            socket.on('recvNewPlaylist', () => {
                self.shuffle = false;
            })

            socket.on('setVidVolatile', (data) => {
                self.action(data, { id: 'volatile', setting: 'trackVolatile' })
            })

            //this is the only one that I want to prepend the callback, due to position, if the callback is appended that data is lost and cause undefined value (not a huge issue but meh)
            SmidqeTweaks.patch(PLAYLIST.__proto__, 'remove', (node) => {
                self.action(node, { id: 'remove', setting: 'trackRemove' });
            }, true);

            //these have the full node of data, so we can just change the values that have changed
            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertAfter', (node, newNode) => {
                self.action(newNode, { id: 'modify', setting: 'trackMove' })
            }, false);

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'append', (node, newNode) => {
                self.action(newNode, { id: 'modify', setting: 'trackMove' })
            }, false);

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertBefore', (node, newNode) => {
                self.action(newNode, { id: 'modify', setting: 'trackMove' })
            }, false);
        },
    }
    return self;
}

SmidqeTweaks.add(load());
