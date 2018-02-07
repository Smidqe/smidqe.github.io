/*
    TODO
        - Allow groups (blocks)
        
*/

function load() {
    const self = {
        meta: {
            group: 'module',
            name: 'stats'
        },
        started: false,
        name: 'stats',
        requires: ['windows'],
        container: null,
        add: (type, data) => {
            //don't add a duplicate value
            if (self.find(type, data.id))
                return;

            if (type === 'block')
            {
                self.container.append($('<div>', {class: 'st-stats-block', id: 'st-stats-block-' + data.id}));

                //if the pairs are included on the block add them or exit if those don't exist
                if (!data.pairs)
                    return;
                
                $.each(data.pairs, (key, pair) => {
                    self.add('pair', pair);
                });
            }

            if (type === 'pair')
            {
                let wrap = $('<div>', {class: 'st-stats-pair'});

                let title = $('<span>', {}).text(data.title);
                let value = $('<span>', {}).text(data.value ? data.value : 'Not set');

                wrap.append(title, value);

                if (!data.block)
                    return;

                let block = self.find('block', data.block);
                
                if (block)
                    block.append(wrap);
            }
        },
        find: (type, id) => {
            var select = null;

            if (type === 'block')
                select = self.container.find('#st-stats-block-' + id);    

            if (type === 'pair')
                select = self.container.find('#st-stats-pair-' + id);
        
            return select[0] ? select[0] : undefined;
        },
        remove: (name) => {
            if (!self.find('pair', name))
                return;

            self.container.find('#st-stats-pair-' + name).remove();
        },
        update: (dest, value) => {
            let pair = self.find('pair', dest);

            if (!pair)
                return;

            $(pair).find('span:last-child').text(value);
        },
        init: () => {
            //create the stats window
            self.container = SmidqeTweaks.modules.windows.create({
                wrap: false, 
                id: 'stats',
                titlebar: {
                    title: 'Control center',
                    remove: false,
                },
                classes: ['st-stats'],
            });

            
        }
    }

    return self;
}

SmidqeTweaks.add(load());
