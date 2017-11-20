/*
    TODO:
        - Have a global timeout for tracked videos, if there is a change within 60 seconds refresh timeout, otherwise remove it from the 
        
*/

function load() {
    const self = {
        settings: [{
            title: 'Track playlist changes',
            type: 'checkbox',
            key: 'trackPlaylist',
            callback: null,
        }, {
            title: 'Track playlist additions',
            type: 'checkbox',
            key: 'trackAdd',
        }, {
            title: 'Track playlist removals',
            type: 'checkbox',
            key: 'trackRemove',
        }, {
            title: 'Track playlist moves',
            type: 'checkbox',
            key: 'trackMove',
        }, {
            title: 'Show position numbers',
            type: 'checkbox',
            key: 'showPositionChange',
            sub: true,
        }, {
            title: 'Track volatile changes',
            type: 'checkbox',
            key: 'trackVolatile',
        }],
        group: 'playlist',
        name: 'trackPlaylist',
        check: null,
        shuffle: false,
        script: true,
        tracking: {},
        messaged: false,
        track: (video) => {
            var title = decodeURIComponent(video.videotitle);
            var pos = SmidqeTweaks.modules.playlist.getObject(title).pos;

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
            }

            self.tracking[object.videoid] = object;
            return object;
        },
        message: (data, id) => {
            var msg = data.title;

            if (data.volat)
                msg += ' (volatile)';

            if (id === 'remove' || id === 'add') {
                if (id === 'remove')
                    msg += ' was removed from playlist';
                else
                    msg += ' was added to playlist'
            }

            if (id === 'modify' && data.changed) {
                $.each(data.changes, (key, value) => {
                    //only mention 
                    switch (value.key) {
                        case 'volat':
                            {
                                //possibly separate these to vol -> non vol && non vol -> vol

                                msg += ' was set to ' + value.new === true ? ' volatile ' : ' permanent';

                                break;
                            };
                        case 'pos':
                            {
                                msg += ' was moved'

                                if (SmidqeTweaks.settings.get('showPositionChange'))
                                    msg += ' (' + value.old + ' -> ' + value.new + ')';

                                break;
                            };
                    }
                })
            }

            SmidqeTweaks.modules.chat.add('Playlist', msg, 'act', true);

            while (data.changes.length > 0)
                data.changes.pop();

            data.changed = false;
        },
        action: (data, action) => {
            var object;
            var message = false;

            //Not sure why this happens, but meh
            if (!data)
                return;

            switch (action.id) {
                case 'add':
                    {
                        object = self.tracking[data.videoid];

                        if (!object)
                            object = self.track(data);

                        message = true;
                        break;
                    }
                case 'remove':
                    {
                        object = self.tracking[data.videoid];

                        if (!object)
                            object = self.track(data);

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
                        object = self.tracking[data.videoid];

                        if (!object) {
                            object = self.track(data);
                            message = true;
                        }

                        //a move happened
                        if (object.timeout)
                            clearTimeout(object.timeout);

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

                        var pos = SmidqeTweaks.modules.playlist.getObject(object.title).pos;

                        if (object.pos !== pos) {
                            object.changes.push({
                                key: 'pos',
                                old: object.pos,
                                new: pos,
                            })

                            object.pos = pos;
                        }

                        if (object.changes.length > 0) {
                            object.changed = true;
                            message = true;
                        }

                        break;
                    }

                case 'volatile':
                    {
                        var video = SmidqeTweaks.modules.playlist.getObjectByPos(data.pos);
                        var remove = false;

                        object = self.tracking[video.videoid];

                        if (!object) {
                            object = self.track(video);
                            remove = true; //there is no reason to hold it longer than it should
                        }

                        object.changes.push({
                            key: 'volat',
                            old: !data.volat,
                            new: data.volat
                        })

                        if (remove) {
                            if (SmidqeTweaks.settings.get('trackVolatile'))
                                self.message(object, action.id);

                            delete self.tracking[object.videoid];
                        } else
                            message = true;

                        break;
                    }
            }

            if (message && SmidqeTweaks.settings.get(action.setting))
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
            self.settings[0].callback = function() {
                self.toggle();
            }

            socket.on('addVideo', (data) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(data.video, { id: 'add', setting: 'trackAdd' })
            })

            socket.on('randomizeList', () => {
                SmidqeTweaks.modules.chat.add('Playlist', 'Playlist has been shuffled', 'rcv', true);
                self.shuffle = true;
            })

            socket.on('recvNewPlaylist', () => {
                self.shuffle = false;
            })

            socket.on('setVidVolatile', (data) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(data, { id: 'modify', setting: 'trackVolatile' })
            })

            //this is the only one that I want to prepend the callback, due to position, if the callback is appended that data is lost and cause undefined value (not a huge issue but meh)
            SmidqeTweaks.patch(PLAYLIST.__proto__, 'remove', (node) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(node, { id: 'remove', setting: 'trackRemove' });
            }, true);

            //these have the full node of data, so we can just change the values that have changed
            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertAfter', (node, newNode) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(newNode, { id: 'modify', setting: 'trackMove' })
            }, false);

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'append', (node, newNode) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(newNode, { id: 'modify', setting: 'trackMove' })
            }, false);

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertBefore', (node, newNode) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(newNode, { id: 'modify', setting: 'trackMove' })
            }, false);
        },
    }
    return self;
}

SmidqeTweaks.addScript('trackPlaylist', load());
