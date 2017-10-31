'use strict';
window.BerryTweaks = {
    raven: {
        wrap(fn) {
            return fn;
        },
        context(fn) {
            const btweaks = fn();

            const list = document.getElementById('feature-list');
            list.removeChild(list.firstChild);

            btweaks.categories.forEach(function(cat){
                if ( cat.minType !== undefined && cat.minType > 0 )
                    return;

                const title = document.createElement('h4');
                title.textContent = cat.title;

                let li = document.createElement('li');
                list.appendChild(li);

                const ul = document.createElement('ul');
                li.appendChild(title);
                li.appendChild(ul);

                cat.configs.forEach(function(conf){
                    li = document.createElement('li');
                    li.textContent = btweaks.configTitles[conf];
                    ul.appendChild(li);
                });
            });

            BerryTweaks.raven.context = function(){ /* first invocation is object creation, second is init; we don't want init */ };
        }
    }
};
