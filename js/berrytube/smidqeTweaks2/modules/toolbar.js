function load() {
    const self = {

        add: (data) => {

        },

        remove: (key) => {
            delete self.bar[key];
        },

        addCallback: (key, data) => {
            $("st-toolbar-button-" + key).on(data.key, data.callback);
        },

        show: () => {

        },

        init: () => {
            self.bar = $("<div>", { id: "st-toolbar-wrap" });
        },
    }

    return self;
}

SmidqeTweaks.addModule('toolbar', load(), 'main');
