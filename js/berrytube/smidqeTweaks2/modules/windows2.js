/*
    This is a rewrite of windows.js, meant to work purely as a module instead of mix of script/module

*/

function load() {
    const self = {
        meta: {
            category: 'module',
            name: 'windows'
        },
        windows: {},
        titlebar: (data, id) => {
            return $('<div>', {
                class: 'st-titlebar'
            }).append(
                $('<div>', {
                    class: 'st-titlebar-exit',
                    'remove': data.remove,

                }).on('click', () => {
                    if (data.remove)
                        self.remove(id);
                    else
                        self.show(id, false);
                })
            ).append($('<span>').text(data.title));
        },
        show: (name, value) => {
            if (!value)
                $('#st-window-container-' + name).addClass('st-window-default');
            else
                $('#st-window-container-' + name).removeClass('st-window-default');
        },
        remove: (name) => {
            $('#st-window-container-' + name).remove();
        },
        get: (name) => {
            return $('#st-window-' + name.toLowerCase());
        },
        create: (data) => {
            var container = null;

            if (data.wrap && data.selector)
                container = $(data.selector).wrap($('<div>', { id: 'st-window-container-' + data.id })).parent();
            else
                container = $('<div>', { id: 'st-window-container-' + data.id });

            container.addClass('st-window-container');

            if (data.titlebar) {
                var bar = self.titlebar(data.titlebar, data.id);

                if (data.wrap)
                    container.prepend(bar);
                else
                    container.append(bar);
            }

            if (data.classes)
                $.each(data.classes, (key, value) => {
                    container.addClass(value);
                });

            //append only those windows that are not wraps to the body
            if (!data.wrap) 
                $(body).append(container);

            if (data.save) //don't know if I will use this, but meh
                self.windows[data.id] = container;

            return container;
        },
    }
}

SmidqeTweaks.add(load());
