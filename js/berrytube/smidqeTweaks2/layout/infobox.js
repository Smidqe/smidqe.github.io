function load() {
    const self = {
        element: null,
        enable: () => {
            //probably just simple class change
        },
        disable: () => {

        },
        create: () => {

        },
        init: () => {
            console.log('loading infobox');
        },
    }

    return self;
}
SmidqeTweaks.modules.layout.modules.infobox = load();
