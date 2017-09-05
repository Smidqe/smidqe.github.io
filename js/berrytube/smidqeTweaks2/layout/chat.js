/*
    TODO:
        - Add a functionality to hide chat
            - Probably a small button on bottombar
            - 
*/

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
