/*
    Rewrite this if possible
*/

function load() {
    const self = {
        name: 'listeners',
        listeners: {},
        started: true,
        create: function(obs) {
            return new MutationObserver(function(mutations) {
                obs.callback(mutations);
            });
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

        waitForElement: () => {

        },

        start: function(obs) {
            if (!obs.observer)
                obs.observer = self.create(obs);

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

SmidqeTweaks.addModule('listeners', load());
