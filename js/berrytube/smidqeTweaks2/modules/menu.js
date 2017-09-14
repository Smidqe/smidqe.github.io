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
        started: false,
        requires: ['toolbar'],
        button: {
            id: 'menu',
            text: 'M',
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
            $('#st-menu').removeClass('st-window-default');
            self.shown = true;
        },

        hide: () => {
            $('#st-menu').removeClass('st-window-default');
            self.shown = false;
        },

        toggle: () => {
            if (self.shown)
                self.hide();
            else
                self.show();
        },
        init: () => {
            self.container = $('<div>', { id: 'st-menu' });
            self.button.callbacks.click = self.toggle;

            SmidqeTweaks.modules.toolbar.add(self.button);
            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('menu', load(), 'main');
