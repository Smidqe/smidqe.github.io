/*
	This will be the new menu system for berrytweaks,
    replacing the old bottom bar
    
    category: {
        title, 
        items,
    }

    button: {
        title,
        group,
        type
        callbacks,
    }
*/
function load() {
    const self = {
        requires: ['toolbar'],
        button: {
            id: 'menu',
            text: 'V',
            tooltip: 'Show/Hide the menu',
            active: true,
            callbacks: {},
        },
        shown: false,
        addCategory: (data) => {
            const wrap = $('<div>', { id: data.id, class: 'st-menu-category' })

        },
        addElement: (data) => {
            const wrap = $('<div>', { id: data.id, class: 'st-menu-element' });

            //create the element
        },

        show: () => {
            self.shown = true;
        },

        hide: () => {
            self.shown = false;
        },

        init: () => {
            self.toolbar = SmidqeTweaks.modules.toolbar;

            self.container = $('<div>', { id: 'st-menu' });
            self.button.callbacks.click = () => {
                if (self.shown)
                    self.hide();
                else
                    self.show();
            }

            self.toolbar.add(self.button);
        },
    }

    return self;
}

SmidqeTweaks.addModule('menu', load(), 'main');