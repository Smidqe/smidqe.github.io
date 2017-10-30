/*
    TODO
        - Allow groups
        - Ensure the order for groups, prolly will have only 
        
*/

function load() {
    const self = {
        started: false,
        name: 'stats',
        settings: [{
            title: 'Show on hover',
            type: 'checkbox',
            key: 'statsOnHover',
        }],
        requires: ['windows'],
        blocks: [],
        container: null,
        visible: false,
        addBlock: (data) => {
            var block = null;
            let pos = self.blocks.indexOf(data.block);

            if (pos != -1)
                block = $('#st-stats-block-' + data.block);
            else
                block = $('<div>', { id: 'st-stats-block-' + data.block, class: 'st-stats-block' })

            block.append($('<div>', { class: 'st-stats-block-title' }).append($('<span>').text(data.block[0].toUpperCase() + data.block.slice(1))))

            $.each(data.values, (key, value) => {
                self.addPair(block, value);
            })

            if (pos == -1) {
                self.blocks.push(data.block);
                self.container.append(block);
            }
        },
        getBlock: (key) => {
            if (self.blocks.indexOf(key) == -1)
                return null;

            return $('#st-stats-block-' + key);
        },
        addPair: (key, value) => {
            if (self.blocks.indexOf(key) == -1)
                self.addBlock({ block: key, values: [] })

            const block = self.getBlock(key);
            const pair = $('<div>', { id: 'st-stats-pair-' + value.id, class: 'st-stats-pair' });

            var title = $('<span>').text(value.title).addClass('st-stats-pair-title');
            var val = $('<span>').text(value.value).addClass('st-stats-pair-value');

            pair.append(title, val);

            if (value.sub)
                pair.addClass('st-stats-pair-sub');

            block.append(pair);
        },
        pairExists: (key) => {
            return ($("#st-stats-pair-" + key)[0] !== undefined);
        },
        getPair: (key) => {
            return $("#st-stats-pair-" + key);
        },
        getPairByTitle: (data) => {
            var pair = self.getPair(data.key);

            if (data.title === pair.title)
                return pair;
        },
        update: (key, value) => {
            //self.getPair(key).value.text(value);
            $("#st-stats-pair-" + key).find('span:last-child').text(value);
        },
        show: () => {
            $('#st-stats-container').addClass('st-window-overlap st-window-open st-menu-container');
        },
        init: () => {
            self.container = $('<div>', { id: 'st-stats-container', class: 'st-window-default' })

            //append it
            $("body").append(self.container);

            let windows = SmidqeTweaks.modules.windows;

            windows.add('stats', {
                selectors: ['#st-stats-container'],
                classes: ['st-window-overlap st-window-open st-menu-container'],
            }, true);

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('stats', load());
