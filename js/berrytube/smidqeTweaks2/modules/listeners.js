function load() {
    const self = {
        listeners: {},
        create: function(obs) {
            return new MutationObserver(function(mutations) {
                mutations.forEach((mutation) => {
                    if (obs.monitor === "added")
                        mutation.addedNodes.forEach(mut => { obs.callback(mut) });

                    if (obs.monitor === "removed")
                        mutation.removedNodes.forEach(mut => { obs.callback(mut) });

                    if (obs.monitor === "all")
                        obs.callback(mutation); //call the callback on every mutation regardless of type
                });
            });
        },

        load: function(obs) {
            obs.observer = self.create(obs);
        },

        wait: function(obs) {
            var id = setInterval(func, 500, obs);

            function func(obs) {
                if (!$(obs.path)[0])
                    return;

                clearInterval(id);
                self.start(obs);
            }
        },

        start: function(obs) {
            if (!obs.observer)
                return;

            const element = $(obs.path)[0];

            if (!element)
                self.wait(obs);
            else
                obs.observer.observe(element, obs.config);
        },

        stop: function(obs) {
            if (!obs.observer)
                return;

            obs.observer.disconnect();
        },
    }

    return self;
}

SmidqeTweaks.addModule('listeners', load(), 'main');
