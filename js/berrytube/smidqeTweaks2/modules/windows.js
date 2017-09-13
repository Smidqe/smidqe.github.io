function load() {
    const self = {
        show: (data) => {
            var selector = data.selectors[0];

            if (SmidqeTweaks.settings.get('maltweaks'))
                selector = data.selectors[1];

            const wrap = $('<div>', {
                class: 'st-window-wrap'
            }).append(
                $('<div>', { class: 'st-window-exit' }));

            $(selector).wrap(wrap);
        },

        hide: (data) => {
            $('.st-window-wrap').contents().unwrap();
            $('.st-window-exit').remove();
        },

        init: () => {

        },
    }

    return self;
}

SmidqeTweaks.addModule('windows', load(), 'main');