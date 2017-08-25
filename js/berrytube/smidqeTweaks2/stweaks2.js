//this will be a fully rewritten smidqetweaks, trying to go without using mutationobserver
//
const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //
    layout: {},
    interval: -1,
    names: {
        modules: ['settings', 'chat', 'layout', 'playlist', 'listeners'],
        scripts: ['playlistNotify', 'pollAverage', 'rcvSquee', 'showUsergroups'],
    },

    refresh: () => {},
    patch: (container, func, callback) => {
        const original = container[func];

        //don't patch an non existant function
        if (!original)
            return;

        container[func] = function() {
            const before = original.apply(this, arguments);
            callback.apply(this, arguments);
            return before;
        }
    },
    load: () => {
        $.each(self.names.modules, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/modules/${name}.js`, () => {
                //check if the module needs starting
                //layout is currently the only one that does need that
                if (self.modules[name].init)
                    self.modules[name].init();
            })
        })

        /*
        $.each(self.names.scripts, (index, name) => {
            $.getScript(`https://smidqe.github.io/js/berrytube/smidqeTweaks2/scripts/${name}.js`)
        })
        */
    },

    init: () => {
        self.load();

        $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

        self.patch(window, 'showConfigMenu', () => {
            self.settings.show();
        })
    },
}

window.SmidqeTweaks = self;
self.init();
