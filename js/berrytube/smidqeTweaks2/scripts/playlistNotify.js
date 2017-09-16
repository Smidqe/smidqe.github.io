/*
    Rework this into using the playlist.getObject(),
    since now we can use the PLAYLIST variable in window,
    this allows much more accurate changes to the video we are playing

    
    Solution to shuffles:
        - There are actually multiple >400 changes at the same time,
        - I keep missing it, due to way I initially built the listeners
        - So the solution is to redo listeners and the scripts/modules that use them

    There's also the amount
*/

function load() {
    const self = {
        group: 'playlist',
        name: 'playlistNotify',
        script: true,
        playlist: null,
        listeners: null,
        prevTimestamp: null,
        requires: ['listeners', 'playlist'],
        settings: [{
            title: "Notify of playlist changes",
            type: "checkbox",
            key: "playlistNotify",
        }, {
            title: "Adding video",
            type: "checkbox",
            key: "playlistAdd",
            sub: true,
        }, {
            title: "Removing a video",
            type: "checkbox",
            key: "playlistRemove",
            sub: true,
        }, {
            title: "Moving a video",
            type: "checkbox",
            key: "playlistMove",
            sub: true,
        }, {
            title: "Volatile changes",
            type: "checkbox",
            key: "playlistVol",
            sub: true,
        }],
        changes: {},
        modify: (change, data, sub, message) => {
            if (!change)
                return;

            $.each(data, (key) => {
                if ($.isPlainObject(change[key])) //little bit of recursion
                    self.modify(change[key], data[key], true);
                else
                    change[key] = data[key];
            })

            if (sub)
                return;

            if (change.timestamp)
                change.timestamp = (new Date()).getTime();

            if (message)
                self.message(change);
        },
        remove: (title, message) => {
            const change = self.changes[title];

            if (!change)
                return;

            change.state.action = 'removed';

            //if we have added a non volatile video, don't announce it being removed
            if (message && !change.state.volatile)
                self.message(change);

            delete self.changes[title];
        },
        add: (node, action) => {
            const title = node.find(".title").text()

            //return the already existing value
            if (self.changes[title])
                return self.changes[title];

            const change = {};
            const obj = self.playlist.getObject(title);

            change.title = title;
            change.livestream = self.playlist.duration(node.find('.time').text()) === -1;
            change.timestamp = (new Date()).getTime();
            change.position = obj.pos;

            change.state = {
                action: action,
                active: node.hasClass('active'),
                volatile: obj.value.volat,
                changed: action === 'changed',
            }

            //add the change into changes
            self.changes[change.title] = change;

            return change;
        },
        message: (change) => {
            var msg = change.title;

            if (change.state.action === 'changed' && change.state.active)
                return;

            if (change.state.volatile && !change.state.changed)
                msg += ' (volatile)';

            switch (change.state.action) {
                case 'added':
                    {
                        if (!SmidqeTweaks.settings.get('playlistAdd'))
                            return;

                        msg += ' was added to playlist';
                        break;
                    }
                case 'removed':
                    {
                        if (!SmidqeTweaks.settings.get('playlistRemove'))
                            return;

                        msg += ' was removed from playlist';
                        break;
                    }
                case 'moved':
                    {
                        if (!SmidqeTweaks.settings.get('playlistMoved'))
                            return;

                        msg += ' was moved';
                        break;
                    }
                case 'changed':
                    {
                        if (!SmidqeTweaks.settings.get('playlistVol'))
                            return;

                        msg += ' was changed to ' + (change.state.volatile ? 'volatile' : 'permanent');
                        break;
                    }
            }

            if (change.state.action !== 'changed' && change.state.changed)
                msg += ' and was changed to ' + (change.state.volatile ? 'volatile' : 'permanent');

            SmidqeTweaks.modules.chat.add("Playlist modification", msg, 'act');
        },
        isItem: (node) => {
            const title = node.find(".title").text();
            const tag = node.prop('tagName')

            if (!tag || !title)
                return false;

            if (!tag.toLowerCase() === "li")
                return false;

            if (title.length === 0)
                return false;

            return true;
        },
        run: (mutations) => {
            console.log(mutations.length);

            if (mutations.length > 50) {
                SmidqeTweaks.modules.chat.add('Playlist', 'was shuffled', 'act');
                return;
            }

            $.each(mutations, (key, mutation) => {
                //added
                $.each(mutation.addedNodes, (index, value) => {
                    const node = $(value);

                    if (!self.isItem(node))
                        return;

                    const change = self.add(node, 'added');
                    const position = self.playlist.getObject(change.title).pos;

                    if (change.state.action === 'removed') {
                        clearTimeout(change.timeout);

                        if (position != change.position)
                            self.modify(change, { position: position, state: { action: 'moved' } }, false, true)
                    }

                    if (change.state.action === 'added')
                        self.message(change);
                })

                $.each(mutation.removedNodes, (index, value) => {
                    const node = $(value);

                    if (!self.isItem(node))
                        return;

                    const change = self.add(node, 'removed');

                    if (change.state.action !== 'removed')
                        self.modify(change, { state: { action: 'removed' } }, false, false)

                    if (change.state.active)
                        self.remove(change.title, true);
                    else
                        change.timeout = setTimeout(() => { self.remove(change.title, true) }, 1000); //for possible move
                })

                const node = $(mutation.target);

                if (!self.isItem(node))
                    return;

                const change = self.changes[node.find('.title').text()];

                if (!change)
                    return;

                if (self.playlist.getObject(change.title).value.volat != change.state.volatile)
                    self.modify(change, { state: { action: 'changed', changed: true, volatile: !change.state.volatile } }, false, true);
            })
        },

        enable: () => {
            self.observer = {
                config: { childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true },
                path: "#plul",
                callback: self.run,
            }

            self.listeners.start(self.observer);
        },
        disable: () => {
            self.listeners.stop(self.observer);
            self.changes = {};
        },

        init: () => {
            self.playlist = SmidqeTweaks.getModule('playlist', 'main');
            self.listeners = SmidqeTweaks.getModule('listeners', 'main');
        },
    }
    return self;
}

SmidqeTweaks.addScript('playlistNotify', load());
