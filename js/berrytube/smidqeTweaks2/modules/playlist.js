function load() {
    const self = {
        started: true,
        name: 'playlist',
        duration: (str) => {
            const values = str.split(":").reverse();
            var ms = 0;

            //really shouldn't need days, because that would be just silly
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
            return playlist.pos(title) != -1;
        },
        amount: () => {
            return window.PLAYLIST.length;
        },
        getObject: (title) => {
            var obj = window.PLAYLIST.first;

            for (var i = 0; i < self.amount(); i++) {
                const elemTitle = decodeURIComponent(obj.videotitle);

                if (elemTitle === title)
                    return { value: obj, pos: i };

                obj = obj.next;
            }

            return {};
        },
        getObjectByPos: (index) => {
            var obj = window.PLAYLIST.first;
            var result = undefined;

            //have to cycle through due to nature of circular linked list
            for (var i = 0; i < self.amount(); i++) {
                if (i == index)
                    result = obj;

                if (result)
                    break;

                obj = obj.next;
            }

            return result;
        },
        refresh: () => {
            smartRefreshScrollbar();
            scrollToPlEntry(Math.max($(".overview > ul > .active").index() - 2), 0);
            realignPosHelper();
        },
        getLink: (title) => {
            const object = self.getObject(title);
            var url = null;
            switch (object.videotype) {
                case 'yt':
                    return 'https://www.youtube.com/watch?v=' + object.videoid;
                case 'vimeo':
                    return ''
            }
        },
        showControls: () => {
            
        },
    }

    return self;
}

SmidqeTweaks.addModule('playlist', load());
