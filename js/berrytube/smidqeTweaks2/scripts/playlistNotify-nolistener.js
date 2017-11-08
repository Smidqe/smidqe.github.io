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
        group: 'playlist',
        name: 'playlistNotify-nolistener',
        check: null,
        sorting: false,
        script: true,
        tracking: {},
        message: (data, id) => {
            if (id === 'added')
                SmidqeTweaks.modules.chat.add()

            if (id === 'remove') {
                let msg = '';
                msg += data.title;

                if (data.volatile)
                    msg += ' (volatile)';

                msg += ' was removed from playlist';

                SmidqeTweaks.modules.chat.add('Playlist modification', msg, 'act')
            }

            if (id === 'modify' && data.changed.length > 0) {
                for (var sub in data.changed)
                    console.log(data.changes[sub]);

                if (data.changed['volat'])
                    SmidqeTweaks.modules.chat.add('Playlist modification')

                if (data.changed['pos'])
                    SmidqeTweaks.modules.chat.add('Playlist modification: ', data.title + ' was moved ')

                data.changed.clear();
            }
        },
        action: (data, action) => {
            var object;
            var remove = false;
            var message = false;

            console.log('Data: ', data, action);


            switch (action.id) {
                case 'add':
                    {
                        //don't re add the video
                        if (self.tracking[data.video.videoid])
                            break;

                        var title = decodeURIComponent(data.video.videotitle);
                        var pos = SmidqeTweaks.modules.playlist.getObject(data.video.videotitle).pos;

                        var obj = {
                            id: data.video.videoid,
                            title: title,
                            pos: pos,
                            volatile: data.video.volat,
                            length: data.video.videolength,
                            type: data.video.videotype,
                            changed: []
                        }

                        self.tracking[obj.id] = obj;

                        self.message = true;
                        break;
                    }
                case 'remove':
                    {
                        for (var i in self.tracking) {
                            let obj = self.tracking[i];

                            if (obj.pos == data.pos)
                                obj.remove = true;

                            if (obj.remove)
                                object = self.tracking[i];

                            if (obj.remove)
                                break;
                        }

                        self.message = true;
                        break;
                    }
                case 'modify':
                    {
                        object = SmidqeTweaks.modules.playlist.getObject()
                        for (var value in data) {
                            if (object[value] !== data[value]) {
                                console.log("Value exists", value)
                            }
                        }
                        break;
                    }

                case 'volatile':
                    {
                        object = SmidqeTweaks.modules.playlist.getObjectByIndex(data.pos);
                        break;
                    }

                case 'move':
                    {

                        break;
                    }
            }

            if (message && SmidqeTweaks.settings.get(action.setting))
                self.message(object, action.id);

            if (!object)
                return;

            if (object.remove)
                delete self.tracking[object.videoid];
        },
        enable: () => {
            self.enabled = true;
            self.check = setInterval(() => {
                self.sorting = window.getVal('sorting');

                if (self.sorting && !self.messaged) {
                    SmidqeTweaks.modules.chat.add('Playlist', 'Shuffling', 'rcv');
                    self.messaged = true;
                }

                self.messaged = false;

            }, 500)
        },
        disable: () => {
            if (self.check)
                clearInterval(self.check);

            self.enabled = false;
        },
        init: () => {
            socket.on('addVideo', (data) => {
                if (!self.enabled || self.sorting)
                    return;

                self.action(data, { id: 'add', setting: 'playlistAdd' });
            });

            socket.on('setVidVolatile', (data) => {
                if (!self.enabled || self.sorting)
                    return;

                self.action(data, { id: 'modify', setting: 'playlistVolatile' })
            })

            SmidqeTweaks.patch(PLAYLIST, 'remove', (node) => {
                if (!self.enabled || self.sorting)
                    return;

                self.action(data, { id: 'remove', setting: 'playlistRemove' });
            });

            //these have the full node of data, so we can just change the values that have changed

            SmidqeTweaks.patch(PLAYLIST, 'insertAfter', (node, newNode) => {
                if (!self.enabled)
                    return;

                self.action(newNode, { id: 'modify', setting: 'playlistMove' });
            });

            SmidqeTweaks.patch(PLAYLIST, 'append', (node, newNode) => {
                if (!self.enabled)
                    return;

                self.action(newNode, { id: 'modify', setting: 'playlistMove' });
            });

            SmidqeTweaks.patch(PLAYLIST, 'insertBefore', (node, newNode) => {
                if (!self.enabled)
                    return;

                self.action(newNode, { id: 'modify', setting: 'playlistMove' });
            });
        },
    }
    return self;
}

SmidqeTweaks.addScript('playlistNotify-nolistener', load());
