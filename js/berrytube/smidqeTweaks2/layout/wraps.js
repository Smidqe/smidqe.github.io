function load() {
    const self = {
        enable: () => {
            if (SmidqeTweaks.settings.get('maltweaks'))
                return;

            $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
            $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
            $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
        },
        disable: () => {
            if (SmidqeTweaks.settings.get('maltweaks'))
                return;

            $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();
        },
        init: () => {

        },
    }

    return self;
}

SmidqeTweaks.addModule('wraps', load(), 'layout');
