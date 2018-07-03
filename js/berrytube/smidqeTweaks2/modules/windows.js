/*

    Add another button to make a window completely modular (instead of )

*/

function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'windows',
            requires: ['colors']
        },
        windows: {}, //container to hold all windows (all are jquery selectors)
        titlebar: (id) => {
            return $('<div>', {
                class: 'st-titlebar'
            }).append(
                $('<div>', {
                    class: 'st-titlebar-exit st-titlebar-button',
                    'data-id': id,
                }).on('click', function() {
                    if (self.modular(id))
                        self.modularize(id, false);

                    self.show({name: $(this).data('id'), show: false});
                }),
                $('<div>', {
                    class: 'st-titlebar-modularize st-titlebar-button',
                    'data-id': id,
                }).on('click', function() {
                    self.modularize(id, true);
                })
            );
        },
        show: (data) => {
            let window = self.get(data.name);

            if (data.show)
                window.removeClass('st-window-hidden');
            else
                window.addClass('st-window-hidden');
            
            if (data.modular !== undefined)
                self.modularize(data.name, data.modular);

            if (data.callback)
                data.callback();
        },
        remove: (name, removeContents) => {
            let element = self.get(name);
            
            element.find('.st-titlebar').empty().remove();
            
            if (removeContents)
                element.contents().remove();
            else
                element.contents().unwrap();

            element.remove();
            delete self.windows[name];
        },
        get: (name) => { 
            if (!name)
                return self.windows;
            
            return self.windows[name];
        },
        exists: (name) => {
            return self.get(name).length !== 0;
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

            //remove set inline css styles
            window.css({
                'right': '',
                'left': '',
                'bottom': '',
                'top': '',
                'width': '',
                'height': '',
            });

            window.removeClass('st-window-container-modular');
            window.draggable('destroy');
        },
        modular: (name) => {
            return self.get(name).hasClass('st-window-container-modular');
        },
        create: (data) => {
            if (data instanceof Array)
            {
                let result = [];

                $.each(data, (index) => {
                    result.push(self.create(data[index]));
                });
                
                return result;
            }

            if (self.get(data.id))
                return;

            let container = $('<div>', { id: 'st-window-container-' + data.id });

            if (data.wrap)
                container = $(data.selector).wrap(container).parent();

            self.windows[data.id] = container;


            if (data.wrap)
                container.addClass('st-window-wrap');

            container.addClass('st-window-container st-window-hidden');

            let bar = self.titlebar(data.id);

            if (data.wrap)
                container.prepend(bar);
            else
                container.append(bar);
            
            if (data.classes)
                $.each(data.classes, (key, value) => {
                    container.addClass(value);
                });

            if (!data.wrap) 
                $('body').append(container);

            return container;
        },
    };

    return self;
}

SmidqeTweaks.add(load());
