function load() {
    const self = {
        meta: {
            
        },
        enabled: false,

        enable: () => {
            self.enabled = true;
        },
        disable: () => {
            self.enabled = false;
        },

        //create the listeners
        init: () => {
            /*
            $.each(self.getUsers(), (key, value) => {
                stats.addPair('chat', {
                    id: key,
                    title: key[0].toUpperCase() + key.slice(1),
                    value: value,
                    sub: key !== "usercount",
                });
            })

            SmidqeTweaks.patch(window, 'handleNumCount', () => {
                $.each(self.getUsers(), (key, value) => {
                    stats.update(key, value);
                })
            })
            */
        }
    }

    return self;
}
SmidqeTweaks.add(load())
