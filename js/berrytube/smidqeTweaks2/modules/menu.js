/*

    data structs to add:

    {
        type: string,
        id: string,
        title: string,
        group: string // only needed in elements
        element: string //only needed in elements
        callback: func // only needed in elements, also can be () or function()
    }


*/
function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'menu',
            requires: ['toolbar', 'windows', 'utilities', 'colors'], 
        },
        started: false,
        button: {
            id: 'menu',
            text: 'Menu',
            tooltip: 'Show/Hide the menu',
            toggle: false,
        },
        utilities: null,
        enums: null,
        container: null,
        windows: null,
        toolbar: null,
        find: (type, dest) => {
            let select = null;

            if (type === 'group')
                select = self.container.find('#st-menu-group-' + dest);

            if (type === 'element' || type === 'callback')
                select = self.container.find('#st-menu-element-' + dest);

            return select[0] ? select[0] : undefined;
        },
        remove: (type, dest) => {
            let element = self.find(type, dest);
           
            if (element)
                element.remove();
        },
        show: (type, value) => {
            self.resize();

            if (type === 'main')
                self.windows.show({name: 'menu', show: value});
        },
        add: (data) => {
            if (data instanceof Array)
                return $.each(data, (index) => self.add(data[index]));

            if (!data.type)
                data.type = 'element';

            if (!data.element)
                data.element = 'div';

            let obj = self.find(data.type, data.id);

            if (obj && data.type !== 'callback')
                return;
            
            if (data.type === 'group')
            {
                let group = $('<div>', {id: 'st-menu-group-' + data.id, class: 'st-menu-group'});
                let elements = $('<div>', {id: 'st-menu-elements-'+ data.id, class: 'st-menu-elements st-window-hidden'});
                let title = $('<div>', {class: 'st-menu-group-title'}).text(data.title);

                self.container.append(group.append(title, elements));
                
                title.hover(() => {
                    elements.removeClass('st-window-hidden');
                }, (mouse) => {
                    if (self.utilities.edge(mouse.target, mouse).index == self.enums.ELEMENT_EDGE_BOTTOM)
                        return;
                    
                    elements.addClass('st-window-hidden');
                });

                elements.on('mouseleave', () => {
                    elements.addClass('st-window-hidden');
                });

                self.updateColors();

                if (!data.elements)
                    return group;

                $.each(data.elements, (index, element) => {
                    self.add(element);
                });

                return group;
            }

            if (data.type === 'element')
            {
                let group = $(self.find('group', data.group)).find('#st-menu-elements-' + data.group);

                if (group.length === 0 && data.group)
                    group = self.add({type: 'group', id: data.group, title: data.group[0].toUpperCase() + data.group.slice(1)}).find('#st-menu-elements-' + data.group);

                let element = $('<' + data.element + '>', {id: 'st-menu-element-' + data.id, class: 'st-menu-element'});

                if (data.title)
                    element.text(data.title);

                group.append(element);
                
                self.updateColors();

                if (!data.callbacks)
                    return;

                $.each(data.callbacks, (key, func) => {
                    element.on(key, func);
                });

                return element;
            }

            if (data.type === 'callback')
            {
                if (!data.callbacks)
                    return;

                $.each(data.callbacks, (key, callback) => {
                    obj.on(key, callback);
                });
            }
        },
        resize: () => {
            let group = $('.st-menu-group, .st-menu-group-title');
            let elements = $('.st-menu-elements');

            let width = ($('.st-chat').width() / 5);
            let height = width;

            group.width(width).height(height);
            elements.width(width);
        },
        updateColors: () => {
            self.colors.update(['menubackground', 'menutext']);
        },
        init: () => {
            console.log('Starting menu');
            
            self.utilities = SmidqeTweaks.get('utilities');
            self.windows = SmidqeTweaks.get('windows');
            self.toolbar = SmidqeTweaks.get('toolbar');
            self.colors = SmidqeTweaks.get('colors');
            self.enums = self.utilities.enums;
            //create the window using the windows module

            self.container = self.windows.create({
                id: 'menu',
                classes: ['st-menu', 'st-window-overlap'],
            });

            self.container.on('mouseleave', () => {
                self.show('main', false);
            });

            $(window).on('resize', () => {
                self.resize();
            });

            self.button.callbacks = {
                'mouseenter': () => {
                    self.show('main', true);
                },
                'mouseleave': (mouse) => {
                    if (self.utilities.edge(mouse.target, mouse).index == self.enums.ELEMENT_EDGE_BOTTOM)
                        return;

                    self.show('main', false);
                }
            };

            self.container.find('.st-titlebar').css('display', 'none');

            //add a button to the toolbar
            self.toolbar.add(self.button);
            self.toolbar.hide(self.button.id);

            
            self.colors.attach('menubackground', '#chatpane', '.st-menu-group, .st-menu-element, .st-menu-group-title', ['background-color']);
            self.colors.attach('menutext', '#chatbuffer', '.st-menu-group, .st-menu-element, .st-menu-group-title', ['color']);

            self.started = true;
        },
    };

    return self;
}

SmidqeTweaks.add(load());
