function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'playlist'
        },
        events: ['setVidVolatile', 'setVidColorTag', 'addVideo', 'addPlaylist', ],
        duration: (str) => {
            let values = str.split(":").reverse();
            let ms = 0;

            if (values.length > 3)
                return -1;

            $.each(values, (index) => {
                ms += Math.pow(60, index) * 1000 * parseInt(values[index])
            })

            if (isNaN(ms))
                ms = -1;

            return ms;
        },
        exists: (method, value) => {
            return self.get('title', title).pos !== -1;
        },
        amount: () => {
            return window.PLAYLIST.length;
        },
        diff: (prev, comp) => {
            let current = null;
            let search = self.get('title', prev);

            if (search.pos === -1)
                return 0;

            //if we haven't set the next video, compare to current active video
            current = self.get('title', comp || window.ACTIVE.videotitle);

            return search.pos - current.pos;
        },
        position: (method, value) => {
            return self.get(method, value).pos;
        },
        get: (method, value) => {
            let obj = window.PLAYLIST.first;
            
            for (var i = 0; i < self.amount(); i++) {
                let result = false;

                switch (method) {
                    case 'title': result = decodeURIComponent(obj.videotitle) === value;
                    case 'index': result = value === i;
                }

                if (result)
                    return {value: obj, pos: i};
                else
                    obj = obj.next;
            }

            //correct thing wasn't found
            return {value: null, pos: -1};
        },
        refresh: () => {
            smartRefreshScrollbar();
            scrollToPlEntry(Math.max($(".overview > ul > .active").index() - 2), 0);
            realignPosHelper();
        },
        listen: (key, callback) => {
            if (self.events.indexOf(key) === -1)
                return;

            socket.on(key, callback);
        },
        unlisten: (key, callback) => {
            socket.removeListener(key, callback);
        },
        patch: (key, callback, after=true) => {
            if (Object.keys(window.PLAYLIST.__proto__).indexOf(key) === -1)
                return;

            let data = {
                container: {obj: window.PLAYLIST.__proto__, name: 'playlist'},
                name: key,
                after: after,
                callback: callback
            }

            SmidqeTweaks.patch(data);
        },
        unpatch: (key, callback) => {
            if (Object.keys(window.PLAYLIST.__proto__).indexOf(key) === -1)
                return;

            SmidqeTweaks.unpatch({
                container: 'playlist',
                name: key,
                callback: callback
            });
        },
    }

    return self;
}

SmidqeTweaks.add(load());
