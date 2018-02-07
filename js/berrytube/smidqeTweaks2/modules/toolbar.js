/*
    Data structure for a toolbar element
        - id
        - text
        - tooltip
        - callback(s)
*/

function load() {
    const self = {
        meta: {
            group: 'module',
            name: 'toolbar'
        },
        bar: null,
        add: (data) => {
            let element = $('<div>', {class: 'st-toolbar-element', id: 'st-toolbar-element-' + data.id});
            
            if (data.tooltip)
                element.attr('title', data.tooltip);

            if (data.text)
                element.text(data.text);

            //add possibility to different types? dropdowns and such?

            self.bar.append(element);

            if (!data.callbacks)
                return;

            $.each(data.callbacks, (key, value) => {
                element.on(key, value);
            })            
        },
        remove: key => {
            self.bar.find('#st-toolbar-element-' + key).remove();
        },
        hide: key => {
            self.bar.find('#st-toolbar-element-' + key).css('display', 'none');
        },
        show: key => {
            self.bar.find('#st-toolbar-element-' + key).css('display', 'block');
        },
        update: (key, value) => {
            self.bar.find('#st-toolbar-element-' + key).text(value);
        },
        init: () => {
            self.bar = $("<div>", { id: "st-toolbar-wrap" });
            self.bar.insertBefore("#chatControls > .settings");
        }
    }

    return self;
}

SmidqeTweaks.add(load());
