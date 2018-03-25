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
            //element sides
            ELEMENT_EDGE_TOP: 0,
            ELEMENT_EDGE_RIGHT: 1,
            ELEMENT_EDGE_BOTTOM: 2,
            ELEMENT_EDGE_LEFT: 3,
        },

        edge: (elem, mouse) => {
            //get the closest edge of the given element and mouse position
            let bounds = elem.getBoundingClientRect();
            let dists = [
                bounds.top - mouse.pageY,
                bounds.right - mouse.pageX,
                bounds.bottom - mouse.pageY,
                bounds.left - mouse.pageX    
            ]

            let result = {index: -1, value: -1}
            $.each(dists, (index, value) => {
                let absolute = Math.abs(value);

                //handle the initial set and the rest
                if (result.index == -1 || absolute < result.value)
                    result = {index: index, value: absolute}
            })

            return result;
        },
    }

    return self;
}

SmidqeTweaks.add(load());
