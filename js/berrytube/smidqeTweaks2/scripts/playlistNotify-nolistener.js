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
        messaged: false,
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
                case 'remove':
                    {
                        for (var i in self.tracking) {
                            object = self.tracking[i];

                            if (object.pos == data.pos)
                                object.remove = true;

                            if (object.remove)
                                break;
                        }

                        if (!object)
                            return;

                        if (object.remove)
                            self.message = true;

                        break;
                    }
                case 'modify':
                    {
                        var video = data;

                        if (data.video)
                            video = data.video

                        //don't re add the video
                        if (self.tracking[video.videoid]) {

                            console.log(video, data.video);

                            //check values
                            $.each(data.video, (key, value) => {

                                if (video[key] !== value) {
                                    video.changed.push({
                                        key: key,
                                        old: video[key],
                                        new: value
                                    })

                                    video[key] = value;
                                }
                            })

                            break;
                        }


                        //add the thing

                        var title = decodeURIComponent(video.videotitle);
                        var pos = SmidqeTweaks.modules.playlist.getObject(video.videotitle).pos;

                        object = {
                            videoid: video.videoid,
                            title: title,
                            pos: pos,
                            volat: video.volat,
                            videolength: video.videolength,
                            videotype: video.videotype,
                            changed: []
                        }

                        self.tracking[object.id] = object;
                        self.message = true;
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
                    return;
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

            socket.on('setVidVolatile', (data) => {
                if (!self.enabled || self.sorting)
                    return;

                self.action(data, { id: 'modify', setting: 'playlistVolatile' })
            })

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'remove', (node) => {
                if (!self.enabled || self.sorting)
                    return;

                self.action(node, { id: 'remove', setting: 'playlistRemove' });
            });

            //these have the full node of data, so we can just change the values that have changed

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertAfter', (node, newNode) => {
                if (!self.enabled)
                    return;

                self.action(newNode, { id: 'modify', setting: 'playlistMove' });
            });

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'append', (node, newNode) => {
                if (!self.enabled)
                    return;

                self.action(newNode, { id: 'modify', setting: 'playlistMove' });
            });

            SmidqeTweaks.patch(PLAYLIST.__proto__, 'insertBefore', (node, newNode) => {
                if (!self.enabled)
                    return;

                self.action(newNode, { id: 'modify', setting: 'playlistMove' });
            });
        },
    }
    return self;
}

SmidqeTweaks.addScript('playlistNotify-nolistener', load());
