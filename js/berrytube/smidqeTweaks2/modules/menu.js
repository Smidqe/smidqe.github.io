/*
    TODO:
        - Rewrite
        - Set to always on hover
    Layout:
        group
            title
            elements


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
        meta: {
            group: 'module',
            name: 'menu'
        },
        //contains all necessary modules used by this module
        modules: {
            windows: null,
            toolbar : null,
        },
        started: false,
        requires: ['toolbar', 'windows'],
        button: {
            id: 'menu',
            text: 'M',
            tooltip: 'Show/Hide the menu',
            toggle: false,
            callback: null,
        },
        window: {
            id: 'menu',
            titlebar: {
                title: 'Main menu',
                remove: false,
                id: 'menu'
            },
            classes: ['st-menu'],
        },
        container: null,
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
        show: () => {
            SmidqeTweaks.modules.windows.show('menu', true);
        },
        hide: () => {
            SmidqeTweaks.modules.windows.hide('menu', false);
        },
        add: (data) => {
            //don't add doubles
            let obj = self.find(data.type, data.id);

            if (obj)
                return;
            
            if (data.type === 'group')
            {
                let group = $('<div>', {id: 'st-menu-group-' + data.id});
                let elements = $('<div>', {id: 'st-menu-elements-'+ data.id, class: 'st-menu-elements'});
                let title = $('<div>', {class: 'st-menu-group-title'}).text(data.title);

                self.container.append(group.append(title, elements));
            }

            if (data.type === 'element')
            {
                //can't add to group because theres' none
                if (!obj)
                    return;

                let element = $('<' + data.element + '>', {id: 'st-menu-element-' + data.id, class: 'st-menu-element'})

                if (data.callback)
                    element.on(data.callback.key, data.callback.func);

                obj.append(element);
            }

            if (data.type === 'callback')
            {
                //can have multiple callbacks
                $.each(data.callbacks, (key, callback) => {
                    obj.on(key, callback);
                })
            }
        },
        update: (data) => {
            /*
                what does data hold?
                    - array
                        - {type: '', value: ''}


                switch
            */
        },
        init: () => {
            //create the window using the windows module
            self.container = SmidqeTweaks.modules.windows.create(self.window);
            self.button.callbacks = {
                hover: self.show,
            }

            //add the general group to container
            self.add({type: 'group', id: 'general', title: 'General functionality'});
            
            //add a button to the toolbar
            SmidqeTweaks.modules.toolbar.add(self.button);

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.add(load());
