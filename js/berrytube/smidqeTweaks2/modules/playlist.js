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

        getLink: (title) => {

        },
    }

    return self;
}

SmidqeTweaks.addModule('playlist', load(), 'main');
