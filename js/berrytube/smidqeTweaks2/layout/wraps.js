function load() {
    const self = {
        settings: null,
        enable: () => {
            if (self.settings.get('maltweaks'))
                return;

            $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
            $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
            $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
        },
        disable: () => {
            if (self.settings.get('maltweaks'))
                return;

            $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();
        },
        init: () => {
            self.settings = SmidqeTweaks.settings;
        },
    }

    return self;
}

SmidqeTweaks.modules.layout.modules.wraps = load();
