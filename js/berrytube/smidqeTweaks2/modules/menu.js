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
        categories: ['Berrytube', 'SmidqeTweaks'],
        groups: {
            'Berrytube': ['General', 'Other'],
            'SmidqeTweaks': ['General', 'Windows', 'Other'],
        },
        button: {
            id: 'menu',
            text: 'M',
            tooltip: 'Show/Hide the menu',
            isToggle: false,
            callbacks: {},
        },
        shown: false,
        addCategory: (data) => {
            self.container.append($('<div>', { id: 'st-menu-category-' + data.id, class: 'st-menu-category' })
                .append($('<div>', { class: 'st-menu-title-category' })
                    .append($('<span>', { text: data.title })))

            );
        },
        addGroup: (data) => {
            if (!$('#st-menu-category-' + data.category.toLowerCase())[0])
                return;

            let wrap = $('<div>', { id: 'st-menu-group-' + data.id, class: 'st-menu-group' })
            let title = $('<div>', { class: 'st-menu-title-group' }).append($('<span>').text(data.title))
            let elements = $('<div>', { class: 'st-menu-group-elements' });

            wrap.append(title, elements);

            $('#st-menu-category-' + data.category.toLowerCase()).append(wrap);
        },
        addElement: (data) => {
            var element = null;

            console.log("menu: Adding a new button: ", data);

            switch (data.type) {
                case 'button':
                    {
                        element = $('<button>', {
                            id: 'st-button-' + data.id,
                            class: 'st-menu-button',
                            'data-key': data['data-key'],
                        }).text(data.text[0].toUpperCase() + data.text.slice(1));
                        break;
                    }
                case 'input':
                    {
                        element = $('<input>', { id: 'st-input-' + data.id, class: 'st-menu-button', type: data.specific });
                        break;
                    }
            }

            element.addClass('st-menu-element');

            $.each(data.callbacks, (key, callback) => {
                element.on(key, callback);
            })

            $('#st-menu-category-' + data.category.toLowerCase() + ' #st-menu-group-' + data.group.toLowerCase() + ' > .st-menu-group-elements').append(element);
        },
        getGroup: (category, group) => {
            return $('#st-menu-category-' + category.toLowerCase() + ' > #st-menu-group-' + group.toLowerCase());
        },
        hideGroup: (category, group, exceptions) => {
            let sel = $('#st-menu-category-' + category.toLowerCase() + ' > #st-menu-group-' + group.toLowerCase());
        },
        removeElement: (data) => {
            console.log(data);

            var selector = '';

            selector += '#st-menu-category-' + data.category.toLowerCase() + ' > ';
            selector += '#st-menu-group-' + data.group.toLowerCase();

            console.log(selector);

            $(selector).find('#st-button-' + data.key.toLowerCase()).remove();
        },
        show: () => {
            $('#st-menu').addClass('st-window-open st-window-overlap st-menu-container');
            self.shown = true;
        },
        hide: () => {
            $('#st-menu').removeClass('st-window-open st-window-overlap st-menu-container');
            self.shown = false;
        },
        toggle: () => {
            if (self.shown)
                self.hide();
            else
                self.show();
        },
        test: () => {
            self.addCategory({ id: 'berrytweaks' });
            self.addGroup({ category: 'berrytweaks', id: 'general' })
        },
        init: () => {
            self.container = $('<div>', { id: 'st-menu', class: 'st-window-default' });
            self.button.callbacks.click = self.toggle;

            $('body').append(self.container);

            let btn = $('<div>', { id: 'st-menu-exit', class: 'st-button-exit' })

            btn.append($('<span>', { text: 'x' }));
            btn.on('click', () => {
                self.hide();
            })

            self.container.append(btn);

            //add categories
            $.each(self.categories, (index, value) => {
                self.addCategory({ id: value.toLowerCase(), title: value });
            })

            //add groups
            $.each(self.groups, (key, value) => {
                $.each(self.groups[key], (index, subval) => {
                    self.addGroup({ category: key, id: subval.toLowerCase(), title: subval });
                })
            })

            SmidqeTweaks.modules.toolbar.add(self.button);
            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('menu', load());
