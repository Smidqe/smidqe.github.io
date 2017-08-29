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

SmidqeTweaks.addModule('chat', load(), 'layout');
