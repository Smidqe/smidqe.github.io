function load() {
    const self = {

        settings: [{
            title: 'Show test drink message button',
            type: 'checkbox',
            key: 'debugDrink',
        }]


    }

    return self;
}

SmidqeTweaks.addModule('debug', load(), 'main');
