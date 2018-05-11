function load() {
    const self = {
        meta: {
            group: 'modules',
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
        diff: (old, current, format = '24h') => {
            //convert to ms
            let oldms = self.convert('ms', old);
            let newms = self.convert('ms', current);
        
            //substract diff and abs it and convert back to 24h format (or 12h)
            let diff = self.convert(format, {ms: abs(newms - oldms)});

            return diff;
        },
        //rewrite this to something better???
        convert: (format, value) => {
            if (value.format === format)
                return value;

            if (['12h', '24h'].indexOf(format) !== -1)
            {
                if (value.format === '24h' && value.h > 12)
                    value.h -= 12; 
                
                if (value.format === '12h')
                    value.h += 12;
            }

            if (value.ms && (format === '24h' || format === '12h'))
            {
                let values = ['s', 'm', 'h'];

                $.each(values, (index, key) => {
                    value[key] = (value.ms / (1000 * (index + 1))) % 60;
                })

                value.suffix = value.h > 12 ? 'PM' : 'AM';

                if (value.h > 12 && format === '12h')
                    value.h -= 12;
            }

            value.format = format;

            return value;
        }
    }

    return self;
}

SmidqeTweaks.add(load());
