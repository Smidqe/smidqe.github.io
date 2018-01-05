/*
    TODO:
        - rewrite some parts 
        
*/

function load() {
    const self = {

        settings: {
            text: 'Playlist tracking',
            titles: ['Track changes', 'Additions', 'Removals', 'Moves', 'Show position numbers', 'Show current position', 'Volatiles'],
            type: ['checkbox', 'checkbox', 'checkbox', 'checkbox', 'checkbox', 'checkbox', 'checkbox'],
            keys: ['trackPlaylist', 'trackAdd', 'trackRemove', 'trackMove', 'showPositionChange', 'showCurrentPosition', 'trackVolatile'],
            callbacks: [null, null, null, null, null, null, null],
            subs: [false, false, false, false, true, true, false],
        },
        //this might be the future
        meta: {
            category: 'script',
            group: { //group is for settings
                id: 'trackplaylist',
                title: 'Playlist tracking',
            },
            name: 'trackPlaylist',
        },
        shuffle: false,
        tracking: {},
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
                remove: false,
            }

            self.tracking[object.videoid] = object;
            return object;
        },
        message: (data, id) => {
            var msg = data.title;

            if (data.volat)
                msg += ' (volatile)';

            if (id === 'remove')
                msg += ' was removed from playlist';

            if (id === 'add')
                msg += ' was added to playlist';

            //try to rewrite this
            if (data.changed) {
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
                                    msg += ' Current: ' + SmidqeTweaks.modules.playlist.getObject(decodeURIComponent(window.ACTIVE.videotitle)).pos;

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
            if (!self.enabled || self.shuffle || !data)
                return;

            var object;

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

                        if (!object)
                            object = self.track(data);

                        //a move happened
                        if (object.timeout)
                            clearTimeout(object.timeout);

                        //add position to the data
                        data.pos = SmidqeTweaks.modules.playlist.getObject(object.title).pos;

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

                        object.changed = object.changes.length > 0;

                        break;
                    }

                case 'volatile':
                    {
                        var video = SmidqeTweaks.modules.playlist.getObjectByPos(data.pos);

                        object = self.tracking[video.videoid];

                        if (!object)
                            object = self.track(video);

                        object.changes.push({
                            key: 'volat',
                            old: !data.volat,
                            new: data.volat
                        })

                        if (data.volat)
                            object.remove = true;

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
            self.settings.callbacks[0] = function() {
                self.toggle();
            }

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
