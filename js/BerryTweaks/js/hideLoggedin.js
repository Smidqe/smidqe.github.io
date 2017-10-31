BerryTweaks.modules['hideLoggedin'] = (function(){
'use strict';

const self = {
    removedNode: null,
    enable() {
        BerryTweaks.whenExists('.loginAs', el => {
            const node = el.contents()[0];
            if ( node.nodeType === Element.TEXT_NODE ){
                self.removedNode = node;
                node.remove();
            }
        });
    },
    disable() {
        if ( !self.removedNode )
            return;

        BerryTweaks.whenExists('.loginAs', el => {
            el.prepend(self.removedNode);
            self.removedNode = null;
        });
    }
};

return self;

})();
