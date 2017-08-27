function load() {
    const self = {
        enable: () => {
            $("#playlist").addClass("st-window-playlist");
        },
        disable: () => {
            $("#playlist").removeClass("st-window-playlist");
        },
        init: () => {

        },
    }

    return self;
}

SmidqeTweaks.modules.layout.modules.playlist = load();
