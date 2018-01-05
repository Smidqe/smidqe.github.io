/*
    TODO:
        - Rewrite
        - Set to always on hover
    Layout:
        group
            title
            elements
                buttons, etc.. 


    data structs to add:

    {
        type: string,
        id: string,
        title: string,
        group: string // only needed in elements
        element: string //only needed in elements
        callback: func // only needed in elements
    }


*/
function load() {
    const self = {
        started: false,
        name: 'menu',
        requires: ['toolbar'],
        button: {
            id: 'menu',
            text: 'M',
            tooltip: 'Show/Hide the menu',
            toggle: false,
            callbacks: {},
        },
        shown: false,
        container: null,
        
        find: (type, dest) => {
            var select = null;

            if (type === 'group')
                select = $('#st-menu-group-' + dest);

            if (type === 'element' || type === 'callback')
                select = $('#st-menu-element-' + dest);

            return select[0] ? select[0] : undefined;
        },
        remove: (type, dest) => {
            var element = self.find(type, dest);
           
            if (element)
                element.remove();
        },
        add: (data) => {
            //don't add doubles
            if (self.find(data.type, data.id))
                return;
            
            if (data.type === 'group')
            {
                let group = $('<div>', {id: 'st-menu-group-' + data.id});
                let elements = $('<div>', {id: 'st-menu-elements-'+ data.id, class: 'st-menu-elements'});
                let title = $('<div>', {class: 'st-menu-group-title'}).text(data.title);

                group.append(title, elements);
                self.container.append(group);
            }

            if (data.type === 'element')
            {
                let group = self.find('group', data.group);

                //can't add to group because theres' none
                if (!group)
                    return;

                var element = $('<' + data.element + '>', {id: 'st-menu-element-' + data.id, class: 'st-menu-element'})

                if (data.callback)
                    element.on(data.callback.key, data.callback.func);

                group.append(element);
            }

            if (data.type === 'callback')
            {
                //find the element
                let obj = $(self.find('element', data.id));

                //can have multiple callbacks
                
            }
        },
        show: () => {
            self.container.removeClass('st-window-default');
        },
        hide: () => {
            self.container.addClass('st-window-default');
        },
        init: () => {
            //create the window using the windows module
            self.container = SmidqeTweaks.modules.windows.create({
                wrap: false, 
                id: 'menu',
                titlebar: {
                    title: 'Control center',
                    remove: false,
                },
                classes: [],

            });

            //add the general group (includes toggle for tweaks,)
            self.add({type: 'group', id: 'general', title: 'General functionality'});
        }
        
        /*
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
            var selector = '';

            selector += '#st-menu-category-' + data.category.toLowerCase() + ' > ';
            selector += '#st-menu-group-' + data.group.toLowerCase();

            $(selector).find('#st-button-' + data.key.toLowerCase()).remove();
        },
        show: (value) => {
            let classes = 'st-window-open st-window-overlap st-menu-container';
            let selector = $('#st-menu');

            if (value)
                selector.addClass(classes);
            else
                selector.removeClass(classes);

            self.shown = value;
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
        */
    }

    return self;
}

SmidqeTweaks.add(load());
