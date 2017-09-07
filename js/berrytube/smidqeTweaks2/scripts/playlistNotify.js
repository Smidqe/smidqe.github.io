/*
TODO:
    - Handle multiple livestreams
        - Problem: They all have the same title
        - Possible solution:
            - If it was added add an playlist object (window.PLAYLIST) into it
            - It should have an addedon
                - (What if not?)
            - 

    - Rework the object structure
        - Object:
        {
            title,
            livestream,
            duration,
            timestamp,
            state: {
                action,
                active,
                volatile,
            }
        }

*/

function load() {
    const self = {
        group: 'playlist',
        playlist: null,
        listeners: null,
        prevTimestamp: null,
        requires: ['listeners', 'playlist'],
        defaultTimeout: 1000,
        settings: [{
                title: "Notify of playlist changes",
                type: "checkbox",
                key: "playlistNotify",
            },
            {
                title: "Adding video",
                type: "checkbox",
                key: "playlistAdd",
                sub: true,
            },
            {
                title: "Removing a video",
                type: "checkbox",
                key: "playlistRemove",
                sub: true,
            },
            {
                title: "Moving a video",
                type: "checkbox",
                key: "playlistMove",
                sub: true,
            },
            {
                title: "Volatile changes",
                type: "checkbox",
                key: "playlistVol",
                sub: true,
            },
        ],
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

            change.title = title;
            change.livestream = playlist.duration(change.title) === -1;
            change.timestamp = (new Date()).getTime();
            change.position = playlist.pos(change.title);

            change.state = {
                action: action,
                active: node.hasClass('active'),
                volatile: node.hasClass('volatile'),
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
        hasString: (string, sub) => {
            if (!string)
                return false;

            return string.indexOf(sub) != -1;
        },
        isItem: (node) => {
            const title = node.find(".title").text();
            const tag = node.prop('tagName')

            if (!tag)
                return false;

            if (!tag.toLowerCase() === "li")
                return false;

            if (!title)
                return false;

            if (title.length === 0)
                return false;

            return true;
        },
        run: (mutation) => {
            $.each(mutation.addedNodes, (index, value) => {
                const node = $(value);

                if (!self.isItem(node))
                    return;

                const change = self.add(node, 'added');
                const position = playlist.pos(change.title);

                if (change.state.action === 'removed') {
                    clearTimeout(change.timeout);

                    if (position != -1)
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

            var changed = false;
            const node = $(mutation.target);

            if (!self.isItem(node))
                return;

            const change = self.changes[node.find('.title').text()];

            if (!change)
                return;

            if (node.hasClass('volatile') && !change.state.volatile)
                changed = true;

            if (self.hasString(mutation.oldValue, 'volatile') != -1 && change.state.volatile && !node.hasClass('volatile'))
                changed = true;

            if (changed)
                self.modify(change, { state: { action: 'changed', changed: true, volatile: node.hasClass('volatile') } }, false, true);
        },

        enable: () => {
            self.observer = {
                monitor: 'all',
                config: { childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true },
                path: "#plul",
                callback: self.run,
            }

            self.listeners.load(self.observer);
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

SmidqeTweaks.scripts['playlistNotify'] = load();
