/*
    TODO:
        - Modify the add() to be more uniform with the rest of the modules
        - Expand functionality

    Data structure for a toolbar element
        - id
        - text
        - tooltip
        - callback(s)
*/

function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'toolbar'
        },
        bar: null,
        add: (data) => {
            //don't add duplicate with same name
            if (self.get(data.id)[0])
                return;

            let element = $('<' + ((data.element) ? data.element : 'div') + '>', {class: 'st-toolbar-element', id: 'st-toolbar-element-' + data.id});
            
            if (data.tooltip)
                element.attr('title', data.tooltip);

            if (data.text)
                element.text(data.text);

            $.each(data.classes || [], (c) => {
                element.addClass(c);
            })

            //add possibility to different types? dropdowns and such?

            self.bar.append(element);

            $.each(data.callbacks || [], (key, value) => {
                element.on(key, value);
            })            
        },
        get: (name) => {
            return self.bar.find('#st-toolbar-element-' + name);
        },
        remove: key => {
            let element = self.get(key);
            
            if (!element[0])
                return undefined;

            element.remove();
        },
        hide: key => {
            self.get(key).css('display', 'none');
        },
        show: (key) => {
            self.get(key).css('display', 'block');
        },
        update: (key, value) => {
            self.bar.find('#st-toolbar-element-' + key).text(value);
        },
        init: () => {
            console.log("Module[toolbar]: ", "Initialising");

            self.bar = $("<div>", { id: "st-toolbar-wrap" });
            self.bar.prependTo("#chatControls");

            self.started = true;
        }
    }

    return self;
}

SmidqeTweaks.add(load());
