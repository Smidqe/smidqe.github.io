function load() {
    const self = {
        duration: (str) => {
            const values = str.split(":").reverse();
            var ms = 0;

            //really shouldn't need days
            if (values.length > 3)
                return;

            $.each(values, (index) => {
                ms += Math.pow(60, index) * 1000 * parseInt(values[index])
            })

            if (isNaN(ms))
                return -1;

            return ms;
        },
        pos: (title) => {
            const elements = $("#plul > li > .title");
            var position = -1;

            $.each(elements, index => {
                if (position != -1)
                    return;

                if ($(elements[index]).text() === title)
                    position = index;
            })

            return position;
        },
        exists: (title) => {
            return playlist.pos(title) != -1;
        },
        amount: () => {
            return window.PLAYLIST.length;
        },
        getObject: (title) => {
            const first = window.PLAYLIST.first;
            var obj = first;

            for (var i = 0; i < self.amount(); i++) {
                const elemTitle = obj.videotitle.split('%20').join(' ');

                if (elemTitle === title)
                    return obj;

                obj = obj.next;
            }
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
    }

    return self;
}

SmidqeTweaks.addModule('playlist', load(), 'main');
