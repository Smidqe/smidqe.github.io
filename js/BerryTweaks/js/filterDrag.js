BerryTweaks.modules['filterDrag'] = (function(){
'use strict';

function arrayMove(array, fromIndex, toIndex) {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
}

const self = {
    css: false,
    getControlWindow() {
        const main = $(document.body).data('windows').filter(win => win.data('uid') === 'adminfilter')[0];
        const con = main.find('.controlWindow');
        return con[0] ? con : null;
    },
    whenLoaded(win, callback) {
        let interval = BerryTweaks.setInterval(() => {
            if ( win.find('.loading').length === 0 ){
                clearInterval(interval);
                interval = null;
                callback();
            }
        }, 100);

        BerryTweaks.setTimeout(() => {
            if ( interval ){
                clearInterval(interval);
                interval = null;
            }
        }, 1000 * 10);
    },
    enhanceWindow() {
        const win = self.getControlWindow();
        if ( !win ) {
            console.log("Can't find filter list");
            return;
        }

        self.whenLoaded(win, () => {
            let startIndex = null;
            win.find('.ruleZone').sortable({
                start: (event, ui) => {
                    startIndex = ui.item.index();
                },
                update: (event, ui) => {
                    const endIndex = ui.item.index();
                    const rules = win.data('rules');
                    arrayMove(rules, startIndex, endIndex);
                }
            });
        });
    },
    bind: {
        patchAfter: {
            showAdminFilterWindow() {
                if (window.TYPE >= 2) {
                    self.enhanceWindow();
                }
            }
        }
    }
};

return self;

})();
