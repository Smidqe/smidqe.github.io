function load() {
    const self = {

        enable: () => {
            $("#videowrap").addClass("st-video");
        },
        disable: () => {
            $("#videowrap").removeClass("st-video");
        },
        init: () => {

        },
    }

    return self;
}

SmidqeTweaks.addModule('video', load(), 'layout');
