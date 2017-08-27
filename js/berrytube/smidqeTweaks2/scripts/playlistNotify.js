const self = {
    listener: null,
    prevTimestamp: null,
    defaultTimeout: 1000,
    settings: {
        title: "Notify of playlist changes (WIP)",
        type: "checkbox",
        key: "playlistNotify",
        subs: [{
                title: "Adding video",
                type: "checkbox",
                key: "playlistAdd",
            },
            {
                title: "Removing a video",
                type: "checkbox",
                key: "playlistRemove"
            },
            {
                title: "Moving a video",
                type: "checkbox",
                key: "playlistMove"
            },
            {
                title: "Volatile changes",
                type: "checkbox",
                key: "playlistVol"
            },
        ],
    },
    changes: {},
    modify: function(change, data, sub, message) {
        const self = this;

        if (!change)
            return;

        $.each(data, (key) => {
            if (key === 'start')
                return;

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
    remove: function(title, message) {
        const change = this.changes[title];

        if (!change)
            return;

        change.state.action = 'removed';

        //if we have added a non volatile video, don't announce it being removed
        if (message && !change.state.volatile)
            this.message(change);

        delete this.changes[title];
    },
    add: function(node, action) {
        const change = {};
        const self = this;

        change.title = node.find(".title").text();
        change.livestream = playlist.duration(node.find('.time').text()) === -1;
        change.timestamp = (new Date()).getTime();
        change.position = playlist.pos(change.title);

        change.state = {
            action: action,
            active: node.hasClass('active'),
            volatile: node.hasClass('volatile'),
            changed: action === 'changed',
        }

        self.changes[change.title] = change;
    },
    message: (change) => {
        var msg = change.title;

        if (change.state.action === 'changed' && change.state.active)
            return;

        if (change.state.volatile && !change.state.changed)
            msg += ' (volatile)';

        switch (change.state.action) {
            case 'added':
                msg += ' was added to playlist';
                break;
            case 'removed':
                msg += ' was removed from playlist';
                break;
            case 'moved':
                msg += ' was moved';
                break;
            case 'changed':
                msg += ' was changed to ' + (change.state.volatile ? 'volatile' : 'permanent');
                break;
        }

        if (change.state.action !== 'changed' && change.state.changed)
            msg += ' and was changed to ' + (change.state.volatile ? 'volatile' : 'permanent');

        SmidqeTweaks.modules.chat.add("Playlist modification", msg, 'act');
    },
    isItem: (node) => {
        if (!node)
            return false;

        const title = node.find(".title").text();

        if (!node.prop('tagName'))
            return false;

        if (!node.prop("tagName").toLowerCase() === "li")
            return false;

        if (!title)
            return false;

        if (title.length === 0)
            return false;

        return true;
    },
    run: (mutation) => {
        if (!mutation)
            return;

        $.each(mutation.addedNodes, (index) => {
            if (!self.isItem($(mutation.addedNodes[index])))
                return;

            const node = $(mutation.addedNodes[index]);
            const title = node.find(".title").text();

            if (!self.changes[title])
                self.add(node, 'added');

            const change = self.changes[title];

            if (change.state.action === 'removed') {
                if (change.timeout)
                    clearTimeout(change.timeout);

                const position = playlist.pos(change.title)

                //only modify the things if we actually have a position (-1 means nothing is loaded yet)
                if (position != -1)
                    self.modify(change, { position: position, state: { action: 'moved' } }, false, true)
            }

            if (change.state.action === "added")
                self.message(change);

            if (change.livestream) //fixes multiple livestreams
                self.remove(change.title, true);
        });

        $.each(mutation.removedNodes, (index) => {
            if (!self.isItem($(mutation.removedNodes[index])))
                return;

            const node = $(mutation.removedNodes[index]);
            const title = node.find(".title").text();

            if (!self.changes[title])
                self.add(node, 'removed');

            const change = self.changes[title];

            if (change.state.action !== 'removed')
                self.modify(change, { state: { action: 'removed' } }, false, false)

            if (change.state.active || change.livestream)
                self.remove(change.title, true);
            else
                change.timeout = setTimeout(() => { tweaks.playlist.notify.remove(change.title, true) }, 1000); //for possible change
        });

        const node = $(mutation.target);
        const title = node.find('.title').text();
        const change = self.changes[title];

        /*
            REWRITE THIS PART
        */


        if (mutation.type !== "attributes" || mutation.attributeName !== "class")
            return;

        if (!change || !self.isItem(node))
            return;

        //check if the livestream is active, enabling the removal
        if (change.livestream && node.hasClass('active')) {
            change.state.active = true;
            return;
        }

        //modify the current video
        if (node.hasClass('active') && !change.timeout && !change.state.active) //need to start the timeout
            self.modify(change, { state: { active: true } });

        //checks if we have a nonvolatile added into the playlist
        if (utilities.contains(mutation.oldValue, 'active') && change.state.active && !change.state.volatile)
            self.remove(change.title, false);

        var changed = false;
        const timestamp = (new Date()).getTime();

        //throttle the changes (is this unnecessary?, test tomorrow)
        if (change.state.changed && (timestamp - change.timestamp < 1000))
            return;

        //instead of checking if the node has volatile, check the old value
        if (node.hasClass('volatile') && !change.state.volatile)
            changed = true;

        if (utilities.contains(mutation.oldValue, 'volatile') && change.state.volatile && !node.hasClass('volatile'))
            changed = true;

        if (changed)
            self.modify(change, { state: { action: 'changed', changed: true, volatile: node.hasClass('volatile') } }, false, true);
    },

    enable: () => {
        self.listener = new MutationObserver(function(mutations) {
            mutations.forEach((mutation) => {
                self.run(mutation);
            });
        });
    },
    disable: () => {
        self.listener.disconnect();
        self.changes = {};
    }
}

SmidqeTweaks.scripts['playlistNotify'] = self;
