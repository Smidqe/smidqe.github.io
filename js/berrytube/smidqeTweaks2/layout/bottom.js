function load() {
    const self = {
        element: null,
        buttons: {},
        titles: ["About", ""],
        windows: [],

        create: () => {

        },

        init: () => {
            console.log("loading bottom buttons")
        },
    }

    return self;
}
SmidqeTweaks.modules.layout.modules.bottom = load();
