/*
	PLACEHOLDER FOR NOW

	Eventually will handle the drinks data that will be shown in the infobox
*/
function load() {
    const self = {


        settings: [{
            title: 'Show drink count in chat',
            type: 'checkbox',
            key: 'chatDrink'
        }],

        enabled: false,
        update: () => {

        },
        disable: () => {
            self.enabled = true;
        },
        enable: () => {
            self.enabled = true;
        },
        init: () => {

        },
    }

    return self;
}

SmidqeTweaks.scripts['showDrinks'] = load();
