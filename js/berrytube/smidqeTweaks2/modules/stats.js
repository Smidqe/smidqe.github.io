function load() {
    const self = {
        settings: [{
            title: 'Show on hover',
            type: 'checkbox',
            key: 'ibOnHover',
        }],
        blocks: [],
        container: null,
        addBlock: (data) => {
            var block = null;

            if (self.blocks.indexOf(data.block) != -1)
                block = $('#st-infobox-block-' + data.block);
            else {
                block = $('<div>', { id: 'st-infobox-block-' + data.block, class: 'st-infobox-block' })
                self.blocks.push(data.block);
            }

            block.append($('<div>', { class: 'st-infobox-block-title' }).append($('<span>').text(data.block[0].toUpperCase() + data.block.slice(1))))

            $.each(data.values, (key, value) => {
                self.addPair(block, value);
            })

            self.container.append(block);
        },

        addPair: (block, value) => {
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
        },
        hide: () => {
            $('#st-infobox-container').addClass('st-window-default');
        },

        init: () => {
            self.container = $('<div>', { id: 'st-infobox-container', class: 'st-window-default st-window-overlap' })

            $("body").append(self.container);
        },
    }

    return self;
}

SmidqeTweaks.addModule('stats', load(), 'main');
