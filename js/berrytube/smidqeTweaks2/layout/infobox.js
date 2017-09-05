/*
    Will hold more specific information
        - Previous video drink counts
            - Will have a setting for how many episodes to hold
        - More specific user grouping
            - This was hidden as I didn't like the look and feel of it :P
     
    - Layout
        - Gridbox will have a title
        - The data amount is not limited (should I?)
        -  

    - Future functionality
        - Add a possibility to add new boxes
*/
function load() {
    const self = {
        element: null,
        enable: () => {
            //probably just simple class change
        },
        disable: () => {

        },
        create: () => {

        },
        init: () => {

        },
    }

    return self;
}

SmidqeTweaks.addModule('infobox', load(), 'layout');
