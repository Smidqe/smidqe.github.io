const self = {
    modules: {},
    names: ['bottom', 'infobox', 'toolbar', 'windows'],

    loadModules: () => {
        $.each(names, index => {
            const name = names[index];

            $.getScript(`https://smidqe.github.io/js/berrytube/SmidqeTweaks2/layout/${name}.js`, () => {

            })
        })
    },
    init: () => {
        //wait 

        $.each(self.modules, name => {
            self.modules[name].init();
        })
    },
}

SmidqeTweaks.layout = self;
