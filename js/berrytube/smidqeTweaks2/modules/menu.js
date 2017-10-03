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
                'SmidqeTweaks': ['General', 'Test'], //enable/disable layout, hide video, stats
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
            text: 'Test',
            id: 'test',
            category: 'BerryTweaks',
            group: 'General',
            type: 'button',
            callbacks: {},
        }],
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

            switch (data.type) {
                case 'button':
                    {
                        element = $('<div>', { id: data.id, class: 'st-menu-button' })
                        .append($('<div>', { text: data.text[0].toUpperCase() + data.text.slice(1) }))
                        break;
                    }
                case 'input':
                    {
                        element = $('<input>', { id: data.id, class: 'st-menu-button', type: data.specific });
                        break;
                    }
            }

            element.addClass('st-menu-element');

            $.each(data.callbacks, (key, callback) => {
                element.on(key, callback);
            })

            $('#st-menu-group-' + data.group.toLowerCase() + '> .st-menu-group-elements').append(element);
        },
        getGroup: (category, group) => {
            return $('#st-menu-category-' + category + ' > #st-menu-group-' + group);
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

            $.each(self.names.categories, (index, value) => {
                self.addCategory({ id: value.toLowerCase(), title: value });
            })

            $.each(self.names.groups, (category, value) => {
                $.each(value, (index, name) => {
                    self.addGroup({ category: category.toLowerCase(), id: name.toLowerCase(), text: name })
                })
            })

            self.addElement({
                text: 'Test',
                id: 'test',
                category: 'SmidqeTweaks',
                group: 'Test',
                type: 'button',
                callbacks: {},
            })

            SmidqeTweaks.modules.toolbar.add(self.button);
            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('menu', load());
