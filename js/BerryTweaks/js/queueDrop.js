BerryTweaks.modules['queueDrop'] = (function(){
'use strict';

const self = {
    css: true,
    posCache: [],
    queueVideo(id) {
        const input = $('.import > div:nth-child(2) input');
        const button = $('.import > div:nth-child(2) > div#addVolatButton');
        input.val(id);
        button.click();
    },
    onDragOver(event) {
        event = event.originalEvent;

        const types = Array.prototype.slice.call(event.dataTransfer.types);
        if ( types.indexOf('text/uri-list') === -1 && types.indexOf('text/plain') === -1 )
            return;

        event.preventDefault();
        event.dataTransfer.dropEffect = 'link';

        const after = self.posCache.find(el => el.y > event.pageY);
        if ( !after )
            return;

        $('.berrytweaks-queuedrop-after').not(after).removeClass('berrytweaks-queuedrop-after');
        $(after).addClass('berrytweaks-queuedrop-after');
    },
    onDragEnter(event) {
        event.preventDefault();
        self.posCache = $('#plul > li').map(function(){
            const y = this.getBoundingClientRect().top;
            return y < 0 ? null : {
                y: y,
                el: this
            };
        }).get();
    },
    onDrop(event) {
        event = event.originalEvent;
        event.preventDefault();

        let url = event.dataTransfer.getData('URL');
        if ( !url )
            url = event.dataTransfer.getData('text');
        if ( !url )
            return;

        console.log('drop', url);
    },
    enable() {
        BerryTweaks.whenExists('#plul', plul => {
            plul.on('dragover.berrytweaks-queueDrop', BerryTweaks.raven.wrap(self.onDragOver));
            plul.on('dragenter.berrytweaks-queueDrop', BerryTweaks.raven.wrap(self.onDragEnter));
            plul.on('drop.berrytweaks-queueDrop', BerryTweaks.raven.wrap(self.onDrop));
        });
    },
    disable() {
        $('#plul').off('.berrytweaks-queueDrop');
    }
};

return self;

})();
