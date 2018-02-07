/*
    This is a rewrite of windows.js, meant to work purely as a module instead of mix of script/module

*/

function load() {
    const self = {
        meta: {
            group: 'module',
            name: 'windows'
        },
        windows: {}, //container to all windows (all are jquery)
        titlebar: (data, id) => {
            return $('<div>', {
                class: 'st-titlebar'
            }).append(
                $('<div>', {
                    class: 'st-titlebar-exit',
                    'data-remove': data.remove,
                    'data-id': id,
                }).on('click', function() {
                    if ($(this).data('remove') == 'true')
                        self.remove($(this));
                    else
                        self.show($(this).data('id'), false);
                })
            ).append($('<span>').text(data.title));
        },
        show: (name, value) => {
            let window = self.windows[name] || $('#st-window-container-' + name)

            if (!value)
                window.addClass('st-window-hidden');
            else
                window.removeClass('st-window-hidden');
        },
        remove: (name) => {
            let element = self.windows[name] || $('#st-window-container-' + name);

            element.find('.titlebar').remove();
            element.contents().unwrap();

            delete self.windows[name];
        },
        get: (name) => {
            return self.windows[name] || $('#st-window-container-' + name);
        },
        open: (name) => {
            let window = self.windows[name] || $('#st-window-container-' + name);
            let result = !window.hasClass('st-window-hidden');

            return result;
        },
        exists: (name) => {
            return !!self.get(name)[0];
        },
        create: (data) => {
            let container = $('<div>', { id: 'st-window-container-' + data.id });
            let elem = $(data.selector);

            if (data.wrap && data.selector)
                container.append(elem);

            container.addClass('st-window-container st-window-default');

            if (data.titlebar) {
                let bar = self.titlebar(data.titlebar, data.id);

                //prepend the titlebar to ensure that it will always be on top if it's a wrap
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
                $('body').append(container);

            //save the jquery object for further use
            self.windows[data.id] = container;

            return container;
        },
    }

    return self;
}

SmidqeTweaks.add(load());
