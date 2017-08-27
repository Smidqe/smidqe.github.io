function load() {
    const self = {

        disable: () => {
            $("#chatpane").removeClass("st-chat");
        },
        enable: () => {
            $("#chatpane").addClass("st-chat");
        },
        init: () => {
            //what to add here \\fsnotmad
        },
    }

    return self;
}

SmidqeTweaks.modules.layout.modules.chat = load();
