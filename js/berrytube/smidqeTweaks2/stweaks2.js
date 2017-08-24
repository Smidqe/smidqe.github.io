//this will be a fully rewritten smidqetweaks, trying to go without using mutationobserver
//
const self = {
    modules: {}, //has multifunctional modules, meant for use for scripts
    scripts: {}, //
    names: {
        modules: ['chat', 'layout', 'playlist', 'settings'],
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

    },
    init: () => {
        $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

        self.patch(window, 'showConfigMenu', () => {
            self.settings.show();
        })
    },
}

window.SmidqeTweaks = self;
self.init();
