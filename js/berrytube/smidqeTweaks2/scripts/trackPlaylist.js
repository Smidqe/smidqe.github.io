/*
    TODO:
        This is a non listener version of the playlist notify, which is actually doable with little research
        

{
    queue: true,
    sanityid:"0MIK7bb69xk"
    video:domobj:[li.volatile]
    meta:{
        addedon: 1478307350051, 
        colorTagVolat: true
    }

    videoid:"EPr-JrW-a8o"
    videolength:321
    videotitle:"A%20Cheeky%20Tea%20Break%20-%201999%20Ep07"
    videotype:"yt"
    volat:true
*/

function load() {
    const self = {
        settings: [{
            title: 'Track playlist changes',
            type: 'checkbox',
            key: 'trackPlaylist',
            callback: null,
        }, {
            title: 'Playlist additions',
            type: 'checkbox',
            key: 'trackAdd',
            sub: true,
        }, {
            title: 'Playlist removals',
            type: 'checkbox',
            key: 'trackRemove',
            sub: true,
        }, {
            title: 'Playlist moves',
            type: 'checkbox',
            key: 'trackMove',
            sub: true,
        }, {
            title: 'Volatile -> non-volatile',
            type: 'checkbox',
            key: 'trackVolatile',
            sub: true,
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
        checkSettings: () => {

        },
        message: (data, id) => {
            console.log(data, id);

            if (id === 'remove' || id === 'add') {
                let msg = '';
                msg += data.title;

                if (data.volatile)
                    msg += ' (volatile)';

                if (id === 'remove')
                    msg += ' was removed from playlist';
                else
                    msg += ' was added to playlist'

                SmidqeTweaks.modules.chat.add('Playlist modification', msg, 'act')
            }

            if (id === 'modify' && data.changed) {
                $.each(data.changes, (key, value) => {
                    console.log('Change happened: ', key, value);

                    switch (value.key) {
                        case 'add':
                            {

                                break;
                            }

                        case 'volat':
                            {
                                break;
                            };
                        case 'pos':
                            {
                                console.log(data.title + ' was moved');
                                break;
                            };
                    }
                })
            }

            //this is not a time critical thing
            while (data.changes.length > 0)
                data.changes.pop();
        },
        action: (data, action) => {
            var object;
            var message = false;

            //Not sure why this happens, but meh
            if (!data)
                return;

            console.log('Data: ', data, action);

            switch (action.id) {
                case 'add':
                    {
                        console.log('add');

                        object = self.tracking[data.videoid];

                        if (!object)
                            object = self.track(data);

                        //this is due to proto function callbacks are called first > addVideo callbacks
                        //probably will need to prepend callbacks \\fsnotmad

                        message = true;
                        break;
                    }
                case 'remove':
                    {
                        console.log('Remove');
                        object = self.tracking[data.videoid];

                        if (!object)
                            object = self.track(data);

                        object.timeout = setTimeout(() => {
                            //this covers the move (removed and readded)
                            if (SmidqeTweaks.settings.get('playlistRemove'))
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
                        console.log(object.pos);
                        console.log(object);
                        console.log(data);

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

                                object[key] = value;
                            }
                        })

                        var pos = SmidqeTweaks.modules.playlist.getObject(object.title).pos;

                        console.log(object.pos, pos);

                        if (object['pos'] !== pos)
                            object.changes.push({
                                key: 'pos',
                                old: object.pos,
                                new: pos,
                            })

                        if (object.changes.length > 0)
                            message = true;

                        if (object.changes.length > 0)
                            object.changed = true;

                        break;
                    }

                case 'volatile':
                    {
                        console.log('Volatile change happened');

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

            if (message)
                self.message(object, action.id);
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

                self.action(data.video, { id: 'add', settings: ['trackAdd'] })
            })

            socket.on('randomizeList', () => {
                SmidqeTweaks.modules.chat.add('Playlist', 'Shuffled', 'rcv');
                self.shuffle = true;
            })

            socket.on('recvNewPlaylist', () => {
                self.shuffle = false;
            })

            socket.on('setVidVolatile', (data) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(data, { id: 'modify', settings: ['playlistVolatile'] })
            })

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'remove', (node) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(node, { id: 'remove', settings: ['playlistRemove'] });
            });

            //these have the full node of data, so we can just change the values that have changed
            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertAfter', (node, newNode) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(newNode, { id: 'modify', settings: ['playlistAdd', 'playlistMove'] })
            });

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'append', (node, newNode) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(newNode, { id: 'modify', settings: ['playlistAdd', 'playlistMove'] })
            });

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertBefore', (node, newNode) => {
                if (!self.enabled || self.shuffle)
                    return;

                self.action(newNode, { id: 'modify', settings: ['playlistAdd', 'playlistMove'] })
            });
        },
    }
    return self;
}

SmidqeTweaks.addScript('trackPlaylist', load());
