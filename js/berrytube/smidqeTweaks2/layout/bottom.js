function load() {
    const self = {
        element: null,
        buttons: {},
        titles: ["About", ""],
        windows: [],

        create: () => {
            $.each(titles, index => {


                $('').on('click', () => {
                    SmidqeTweaks.layout.windows.toggle(keys[index]);
                })
            })
        },

        init: () => {

        },
    }

    return self;
}
SmidqeTweaks.layout.modules.bottom = load();
