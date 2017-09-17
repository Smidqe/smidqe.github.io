/*
    Allow grouping
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
        requires: ['toolbar'],
        button: {
            id: 'stats',
            text: 'S',
            tooltip: 'Show stats window',
            active: false,
            isToggle: false,
            callbacks: {},
            category: 'SmidqeTweaks',
            group: 'General',
            type: 'button'
        },
        blocks: [],
        container: null,
        visible: false,
        addBlock: (data) => {
            var block = null;

            if (self.blocks.indexOf(data.block) != -1)
                block = $('#st-stats-block-' + data.block);
            else
                block = $('<div>', { id: 'st-stats-block-' + data.block, class: 'st-stats-block' })

            block.append($('<div>', { class: 'st-stats-block-title' }).append($('<span>').text(data.block[0].toUpperCase() + data.block.slice(1))))

            $.each(data.values, (key, value) => {
                self.addPair(block, value);
            })

            if (self.blocks.indexOf(data.block) == -1) {
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

            pair.append($('<span>').text(value.title));
            pair.append($('<span>').text(value.value));

            block.append(pair);
        },

        update: (key, value) => {
            $("#st-stats-pair-" + key).find('span:last-child').text(value);
        },

        show: () => {
            $('#st-stats-container').addClass('st-window-overlap st-window-open');
            self.visible = true;
        },
        hide: () => {
            $('#st-stats-container').removeClass('st-window-overlap st-window-open');
            self.visible = false;
        },

        toggle: () => {
            if (self.visible)
                self.hide();
            else
                self.show();
        },

        init: () => {
            self.toolbar = SmidqeTweaks.modules.toolbar;
            //self.menu = SmidqeTweaks.modules.menu;

            self.container = $('<div>', { id: 'st-stats-container', class: 'st-window-default' })
            let btn = $('<div>', { id: 'st-stats-exit' })

            btn.append($('<span>', { text: 'x' }));
            btn.on('click', () => {
                self.hide();
            })

            self.container.append(btn);
            self.button.callbacks.click = self.toggle;

            //add the button to open the window
            self.toolbar.add(self.button);
            //self.menu.addElement(self.button);


            $("body").append(self.container);
            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('stats', load(), 'main');
