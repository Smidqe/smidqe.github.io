function load() {
    const self = {
        started: false,
        meta: {
            group: 'module',
            name: 'time'
        },
        get: () => {
            const time = new Date();

            let hours = time.getHours();
            let minutes = time.getMinutes();
            let seconds = time.getSeconds();

            let obj = {h: hours, m: minutes, s: seconds, format: '24h', suffix: null};

            $.each(obj, (key, val) => {
                if (key === 'format' || key === 'suffix') //don't do anything to format
                    return;

                obj[key] = val < 10 ? "0" + val : val;
            })

            obj.suffix = obj.h > 12 ? 'PM' : 'AM';

            return obj;
        },
        diff: (old, current) => {
            //calculate diff (dunno if used)
        },
        //rewrite this to something better???
        convert: (format, value) => {
            if (value.format === format)
                return value;

            if (format === 'normal' && value.format === 'ms')
                return self.parse(value);

            if (['12h', '24h'].indexOf(format) !== -1)
            {
                value.h += (format === '12h') ? -12 : 12;
                value.format = format;
            }

            if (value.ms && (format === '24h' || format === '12h'))
            {
                let values = ['s', 'm', 'h'];

                $.each(values, (index, key) => {
                    value[key] = (value.ms / (1000 * (index + 1))) % 60;
                })

                value.suffix = value.h > 12 ? 'PM' : 'AM';
                value.format = format;

                if (value.h > 12 && format === '12h')
                    value.h -= 12;
            }

            return value;
        }
    }

    return self;
}

SmidqeTweaks.add(load());
