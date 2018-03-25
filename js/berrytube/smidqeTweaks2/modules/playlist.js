function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'playlist'
        },
        started: true,
        requires: ['time'],
        duration: (str) => {
            let values = str.split(":").reverse();
            let ms = 0;

            //really shouldn't need days, because that would be just silly, also may cause overflow?
            if (values.length > 3)
                return -1;

            $.each(values, (index) => {
                ms += Math.pow(60, index) * 1000 * parseInt(values[index])
            })

            if (isNaN(ms))
                return -1;

            return ms;
        },
        exists: (title) => {
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
            if (!comp)
                current = self.get('title', window.ACTIVE.videotitle);
            else
                current = self.get('title', comp);

            return search.pos - current.pos;
        },
        get: (method, value) => {
            let obj = window.PLAYLIST.first;
            
            for (var i = 0; i < self.amount(); i++) {
                let result = false;

                if (method === 'title')
                    result = (decodeURIComponent(obj.videotitle) === value);

                if (method === 'index')
                    result = (value === i);

                if (result)
                    return {value: obj, pos: i};

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
        showControls: () => {
            
        },
        loaded: () => {
            //check if the playlist has loaded
        },
        
    }

    return self;
}

SmidqeTweaks.add(load());
