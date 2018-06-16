/*
    Will be a 2 column grid with x amount of rows

    Every group will have
        titlebar
            modularise
            collapse
        pairs


*/

function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'stats',
            requires: ['windows', 'menu'],
        },
        started: false,
        container: null,
        modulars: {},
        add: (type, data) => {
            //don't add a duplicate value
            if (self.find(type, data.id))
                return;

            if (type === 'block')
            {
                let block = $('<div>', {class: 'st-stats-block', id: 'st-stats-block-' + data.id})
                let titlebar = $('<div>', {class: 'st-titlebar', id: 'st-stats-titlebar-' + data.id});

                titlebar.append(
                    $('<div>', {
                        class: 'st-stats-titlebar-button',
                        'data-key': data.id
                    }).on('click', self.modularize)
                ).append(
                    $('<div>', {
                        class: 'st-stats-titlebar-button',
                        'data-key': data.id
                    }).on('click', self.collapse)
                )

                block.append(titlebar);
                self.container.find('.st-stats-container').append(block);

                $.each(data.pairs || [], (key, pair) => {
                    self.add('pair', pair);
                });
            }

            if (type === 'pair')
            {
                if (!data.block)
                    return;

                let wrap = $('<div>', {class: 'st-stats-pair', id: 'st-stats-pair-' + data.id})
                    .append($('<span>', {class: 'st-stats-title'}).text(data.title))
                    .append($('<span>', {class: 'st-stats-value'}).text(data.value ? data.value : 'Not set'))

                let block = self.find('block', data.block);
                
                if (block)
                    block.append(wrap);
            }
        },
        find: (type, id) => {
            let select = null;

            if (type === 'block')
                select = $(self.container).find('#st-stats-block-' + id);    

            if (type === 'pair')
                select = $(self.container).find('#st-stats-pair-' + id);
        
            return select[0] ? select : undefined;
        },
        remove: (name) => {
            if (!self.find('pair', name))
                return;

            self.container.find('#st-stats-pair-' + name).remove();
        },
        update: (dest, value) => {
            let pair = self.find('pair', dest);

            if (pair)
                $(pair).find('span:last-child').text(value);
        },
        modularize: function() {
            let key = $(this).data('key');

            if (self.modulars[key])
                return;

            self.modulars[key] = self.windows.create({
                id: key,
                wrap: false,
                classes: ['st-stats-modular'],
            })

            self.windows.get(key).append($(this).parents().eq(1).find('[id*=st-stats-pair]').clone())
            self.windows.show({name: key, show: true, modular: true});
            
            self.windows.get(key).find('.st-titlebar-exit').on('click', () => {
                self.unmodularize(key)
            });
            //self.collapse(key);
        },
        unmodularize: (key) => {            
            self.windows.remove(key, true);
            delete self.modulars[key];
        },
        collapse: function() {

        },
        uncollapse: function() {

        },
        show: () => {
            self.windows.show({name:'stats', show: true});
        },
        init: () => {
            //create the stats window
            self.menu = SmidqeTweaks.get('menu');
            self.windows = SmidqeTweaks.get('windows');

            self.container = self.windows.create({
                id: 'stats',
                title: 'Statistics',
                classes: ['st-window-container-stats', 'st-window-overlap'],
            });

            self.menu.add({
                id: 'stats',
                group: 'berrytube',
                title: 'Stats',
                callbacks: {
                    click: self.show
                }
            })

            self.container.append($('<div>', {class: 'st-stats-container'}));
            self.started = true;
        }
    }

    return self;
}

SmidqeTweaks.add(load());
