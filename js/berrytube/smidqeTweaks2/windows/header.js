function load() {

    const self = {

        button: {
            //something here
            window: {
                selectors: ['', ''],

            },
        },
        requires: ['menu'],

        show: () => {

        },

        init: () => {
            //add a button to menu
            SmidqeTweaks.modules.menu.add(self.button);
        }
    }

    return self;
}

SmidqeTweaks.addWindow('header', load())
