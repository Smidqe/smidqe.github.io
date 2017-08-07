window.$ = function(){
"use strict";

const list = document.getElementById('feature-list');
list.removeChild(list.firstChild);

BerryTweaks.categories.forEach(function(cat){
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
        li.textContent = BerryTweaks.configTitles[conf];
        ul.appendChild(li);
    });
});

};
