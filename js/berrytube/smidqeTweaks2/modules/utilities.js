/*
    Don't really know what to include here, as the script advances there might be something
    
*/

function load() {
    const self = {
        waitForElement: (selector, callback) => {
            var interval = setInterval(() => {
                if (!$(selector)[0])
                    return;

                callback();
                clearInterval(interval);
            })
        },

        check: (first, second) => {
            if (!first)
                return false;

            return second;
        },

        createCustomWindow: (data) => {
            var wrap = $('<div>');





            $(body).append(wrap);
        },
        showError: (msg) => {
            createCustomWindow({
                id: 'st-window-alert',
                class: 'st-alert',
                message: msg,
                buttons: ['ok'],
            });
        },

    }

    return self;
}

SmidqeTweaks.addModule('utilities', load());
