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

            $.each(data.values, (key, value) => {
                self.addPair(block, value);
            })

            self.container.append(block);
        },

        addPair: (block, value) => {
            const pair = $('<div>', { id: value.id, class: 'st-infobox-pair' }).append($('<span>').text(value.title));
            pair.append($('<span>').text(value.value))

            block.append(pair);
        },

        update: (key, value) => {
            $("#st-infobox-pair-" + key).find('.value').text(value);
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

SmidqeTweaks.addModule('infobox', load(), 'main');
