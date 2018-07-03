/*
    Don't really know what to include here, as the script advances there might be something
    
    
*/

function load() {
    const self = {
        meta: {
            group: 'modules',
            name: 'utilities'
        },
        enums: {
            ELEMENT_EDGE_TOP: 0,
            ELEMENT_EDGE_RIGHT: 1,
            ELEMENT_EDGE_BOTTOM: 2,
            ELEMENT_EDGE_LEFT: 3,
        },
        edge: (elem, mouse) => {
            let bounds = elem.getBoundingClientRect();
            let dists = [
                bounds.top - mouse.pageY,
                bounds.right - mouse.pageX,
                bounds.bottom - mouse.pageY,
                bounds.left - mouse.pageX    
            ];

            let result = {index: -1, value: -1};
            $.each(dists, (index, value) => {
                let absolute = Math.abs(value);

                if (result.index == -1 || absolute < result.value)
                    result = {index: index, value: absolute};
            });

            return result;
        },
        linearCheck: (...args) => {
            let result = true;

            $.each(args, index => {
                if (!result)
                    return;

                result = !!args[index];
            });

            return result;
        },
        waitFor: (selector, callback, time=500) => {
            if (!(selector instanceof Array))
                selector = [selector];

            const interval = setInterval(() => {
                let clear = true;

                $.each(selector, (index, text) => {
                    let elements = $(text);

                    if (elements.length === 0)
                        clear = false;    
                });

                if (clear && callback)
                    callback();
                
                if (clear)
                    clearInterval(interval);
            }, time);
        },
        maltweaksLoaded: () => {
            self.linearCheck(window.MT, window.MT.loaded);
        },
        emotesLoaded: () => {
            self.linearCheck(window.Bem, window.Bem.emotes, window.Bem.emotes.length > 0);
        }
    };

    return self;
}

SmidqeTweaks.add(load());
