/*
    This is a rewrite of windows.js, meant to work purely as a module instead of mix of script/module

    if ()
*/

function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'windows'
        },
        windows: {}, //container to hold all windows (all are jquery selectors)
        titlebar: (title, id) => {
            return $('<div>', {
                class: 'st-titlebar'
            }).append(
                $('<div>', {
                    class: 'st-titlebar-exit',
                    'data-id': id,
                }).on('click', function() {
                    self.show($(this).data('id'), false);
                })
            ).append($('<span>').text(title));
        },
        show: (name, value, callback) => {
            let window = self.get(name);

            if (value)
                window.removeClass('st-window-hidden');
            else
                window.addClass('st-window-hidden')

            if (callback)
                callback();
        },
        remove: (name) => {
            let element = self.get(name);
            
            element.find('.st-titlebar').empty().remove();
            element.contents().unwrap();

            delete self.windows[name];
        },
        get: (name) => { 
            if (!name)
                return self.windows;
            
            return self.windows[name] || $('#st-window-container-' + name);
        },
        exists: (name) => {
            return self.get(name).length == 0;
        },
        width: (name) => {
            return self.get(name).width();
        },
        height: (name) => {
            return self.get(name).height();
        },
        modularize: (name, value) => {
            if (!value)
                return self.unmodularize(name);

            let window = self.get(name);

            window.addClass('st-window-container-modular');
            window.draggable({
                handle: '.st-titlebar',
                start: () => {
                    $('#videowrap').css('pointer-events', 'none');
                },
                stop: () => {
                    $('#videowrap').css('pointer-events', 'all');
                },
                containment: 'window'
            });
        },
        unmodularize: (name) => {
            let window = self.get(name);

            window.removeClass('st-window-container-modular');
            window.draggable('destroy');
        },
        add: (name, what, value) => {
            
        },
        create: (data) => {
            if (data instanceof Array)
            {
                let result = [];

                $.each(data, (index) => {
                    result.push(self.create(data[index]))
                })
                
                return result;
            }
            
            let container = $('<div>', { id: 'st-window-container-' + data.id });
            let elem = $(data.selector);

            if (data.wrap && elem[0])
                container = elem.wrap(container).parent();

            if (data.wrap)
                container.addClass('st-window-wrap');

            container.addClass('st-window-container st-window-hidden');

            if (data.title) {
                let bar = self.titlebar(data.title, data.id);

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
