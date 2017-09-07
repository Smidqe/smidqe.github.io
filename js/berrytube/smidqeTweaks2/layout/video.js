function load() {
    const self = {
        hidden: false,
        toggle: () => {

        },
        enable: () => {
            $("#videowrap").addClass("st-video");
        },
        disable: () => {
            $("#videowrap").removeClass("st-video");
        },
        init: () => {
            SmidqeTweaks.settings.set('video', true);
        },
    }

    return self;
}

SmidqeTweaks.addModule('video', load(), 'layout');
