/*
	This will be the new menu system for berrytweaks,
    replacing the old bottom bar
    
    Category will differentiate the functionalities by script level, so other scripts may use it
    Currently only categories will be Berrytube and SmidqeTweaks (perhaps some from Maltweaks)
    category: {
        title, 
        items,
    }


    data: {
        title,
        category,
        group,
        type,
        specific,
        callbacks,
    }
*/
function load() {
    const self = {
        started: false,
        name: 'menu',
        requires: ['toolbar'],
        names: {
            categories: ['Berrytube', 'SmidqeTweaks'],
            groups: {
                'BerryTweaks': ['Windows', 'Other'],
                'SmidqeTweaks': ['General'], //enable/disable layout, hide video, stats
            },
        },
        categories: {},
        button: {
            id: 'menu',
            text: 'M',
            tooltip: 'Show/Hide the menu',
            isToggle: false,
            callbacks: {},
        },
        buttons: [{
            title: 'Test',
            category: 'BerryTweaks',
            group: 'General',
            type: 'button',
            callbacks: {},
        }, {

        }],
        shown: false,
        addCategory: (data) => {
            const wrap = $('<div>', { id: 'st-menu-category-' + data.id, class: 'st-menu-category' })

        },
        addGroup: (data) => {
            const wrap = $('<div>', { id: 'st-menu-group-' + data.id, class: 'st-menu-group' })

            $('#st-menu-category-')
        },
        addElement: (data) => {
            const wrap = $('<div>', { id: data.id, class: 'st-menu-element' });


            /*
                Currently planned elements
                    button
                    changebox(?)        
            */

            var element = null;
            switch (data.type) {
                case 'button':
                    {
                        element = $('<div>', { id: data.id, class: 'st-menu-button' })
                        .append($('<div>', { text: data.id[0].toUpperCase() + data.id.slice(1) }))
                        break;
                    }
                case 'input':
                    {
                        element = $('<input>', { id: data.id, class: 'st-menu-button', type: data.specific });
                        break;
                    }
            }

            $.each(data.callbacks, (key, callback) => {
                element.on(key, callback)
            })

            self.getGroup(data.category, data.group).append(element);
        },
        getGroup: (category, group) => {
            return $('#st-menu-category-' + category + ' > #st-menu-group-' + group);
        },
        show: () => {
            $('#st-menu').addClass('st-window-open st-window-overlap');
            self.shown = true;
        },

        hide: () => {
            $('#st-menu').removeClass('st-window-open st-window-overlap');
            self.shown = false;
        },
        toggle: () => {
            if (self.shown)
                self.hide();
            else
                self.show();
        },
        init: () => {
            self.container = $('<div>', { id: 'st-menu', class: 'st-window-default' });
            self.button.callbacks.click = self.toggle;

            SmidqeTweaks.modules.toolbar.add(self.button);
            self.started = true;

            $('body').append(self.container);
        },
    }

    return self;
}

SmidqeTweaks.addModule('menu', load(), 'main');
