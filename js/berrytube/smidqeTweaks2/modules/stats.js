function load() {
    const self = {
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
            active: true,
            callbacks: {},
        },
        blocks: [],
        container: null,
        visible: false,
        addBlock: (data) => {
            var block = null;

            if (self.blocks.indexOf(data.block) != -1)
                block = $('#st-infobox-block-' + data.block);
            else
                block = $('<div>', { id: 'st-infobox-block-' + data.block, class: 'st-infobox-block' })

            block.append($('<div>', { class: 'st-infobox-block-title' }).append($('<span>').text(data.block[0].toUpperCase() + data.block.slice(1))))

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

            return $('#st-infobox-block-' + key);
        },

        addPair: (key, value) => {
            if (self.blocks.indexOf(key) == -1)
                self.addBlock({ block: key, values: [] })

            const block = self.getBlock(key);
            const pair = $('<div>', { id: 'st-infobox-pair-' + value.id, class: 'st-infobox-pair' });

            pair.append($('<span>').text(value.title));
            pair.append($('<span>').text(value.value));

            block.append(pair);
        },

        update: (key, value) => {
            $("#st-infobox-pair-" + key).find('span:last-child').text(value);
        },

        show: () => {
            $('#st-infobox-container').removeClass('st-window-default');
            self.visible = true;
        },
        hide: () => {
            $('#st-infobox-container').addClass('st-window-default');
            self.visible = false;
        },

        toggle: () => {
            if (self.visible)
                self.hide();
            else
                self.show();
        },

        init: () => {
            console.log("Starting stats");

            self.toolbar = SmidqeTweaks.modules.toolbar;
            self.container = $('<div>', { id: 'st-infobox-container', class: 'st-window-default' })

            self.button.callbacks.click = self.toggle;

            //add the button to open the window
            self.toolbar.add(self.button)

            $("body").append(self.container);
        },
    }

    return self;
}

SmidqeTweaks.addModule('stats', load(), 'main');
