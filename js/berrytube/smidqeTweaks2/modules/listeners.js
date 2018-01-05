/*
    Rewrite this if possible to include multiple methods
    such as callbacks after an element exists 

    TODO:
        - Add creation method for observer that can handle both custom callbacks and just limited triggers
        - New trigger system
            - {type: 'added', data: {id, class, etc...}}
            - prolly will have all: boolean thingy aswell
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

        /*
        create: (data) => {
            var listener = {}

            listener.observer = new MutationObserver(function(mutations) => {
                if (data.custom)
                {
                    data.callback(mutations);
                    return;
                }

                $.each(mutations, (key, mut) => {
                    $.each(mut.addedNodes, (key, node) => {
                        var matches = 0;

                        $.each(data.triggers, (index, trigger) => {
                            if (trigger.type !== 'added')
                                continue;

                            if (self.utils.check(trigger.id, $(node).addr('id').contains(trigger.id)))

                            if (trigger.id && $(node).attr('id').contains(trigger.id))
                                matches++;

                            if (trigger.class && $(node).attr('class').contains(trigger.class))
                                matches++;
                        })

                        if (matches == data.triggers.length)
                            data.callback();
                    })


                    $.each(mut.removedNodes, (key, node) => {
                        $.each(data.triggers, (index, trigger) => {
                            if (trigger.type !== 'removed')
                                continue;

                            if (trigger.id === $(node).attr('id'))
                                data.callback();
                        })
                    })
                })
            })

            self.listeners[data.id] = listener;

            return listener;
        }

        remove: (id) => {

        }

        stop: (id) => {

        }

        start: (id) => {
            var listener = self.listeners[id];

            if (!listener)
                return;

            if (!listener.observer)
                return;

            listener.observer.observe(listener.path, listener.config);
        },

        waitForElement: (type, specific, path, callback) => {
            var trigger = {custom: false, type: type, triggers: specific}
            


        },
        */
    }

    return self;
}

SmidqeTweaks.addModule('listeners', load());
