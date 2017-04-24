var column;
var windows = [];
var buttons = ["about", "timers", "emotes", "settings", "header", "footer", "polls", "messages", "login", "playlist"];
var hide = ["floatinner", "wrapper"];
var move = ["dyn_header", "mailDiv", "leftpane", "pollbox", "footwrap"];
//(i) == id, (c) == class
var elements = {
    "about": {
        "moved": false,
        "url": "",
        "childsToHide": [""],
        "path": "body.(i)headwrap.(c)floatinner.(i)extras"
    },
    "timers": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.(i)headwrap.(c)floatinner.(c)wrapper.(i)dyn_header"
    },
    "emotes": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.main."
    },
    "settings": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.headwrap"
    },
    "header": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.headwrap"
    },
    "footer": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.headwrap"
    },
    "polls": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.headwrap"
    },
    "messages": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.headwrap"
    },
    "login": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.headwrap"
    },
    "playlist": {
        "moved": false,
        "url": "",
        "childsToHide": [],
        "path": "body.headwrap"
    }
};

function getChildElementBy(parent, method, name, index) {

}

function getElementByPath(path) {
    var paths = path.split(".");
    var element = document;
    var t = null;
    var name;

    for (var i = 0; i < paths.length; i++) {
        t = paths[i];
        name = paths[i].substr(2, paths[i].length);

        element = getChildElementBy(element, )

        element = element.get
    }
}

function getTimers() {
    return 0;
}

function allElementsMoved() {
    for (var element in elements)
        if (element["moved"] === false)
            return false;

    return true;
}

function getWindowByName() {

}

function moveElement(method, name, destination, hide) {

    if (method === "class") {
        var elements = document.body.getElementsByClassName(name);

        if (elements.length > 1) {
            elements.forEach(function(element) {

            }, this);
        }
    }
}

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (allElementsMoved()) {
            observer.disconnect();
            return;
        }

        if (!mutation.addedNodes)
            return;


        for (var i = 0; i < mutation.addedNodes.length; i++) {
            var node = mutation.addedNodes[i];

            //have a probably switch..case here to append them to the buttons


        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: false,
    attributes: false,
    characterData: false
});

function createModalContainer(id) {

    var container = document.createElement("div");

    container.id = "modal-" + id;
    container.className = "ui-modal";
    container.style.display = "none"; //hide the container
    container.style.backgroundColor = "red";
    container.style.position = "fixed";
    container.style.width = "100%";
    container.style.height = "100%";

    windows.push(container);

    return container;
}

function createButton(id, name) {
    var button = document.createElement("div");

    button.style.backgroundColor = "red";
    button.style.width = "70px";
    button.style.height = window.innerHeight / buttons.length + "px";
    button.id = id;
    button.className = "ui-button";

    button.appendChild(createModalContainer(name));

    //set the node to hidden.

    //create a new image and append it to the 
    //button.appendChild(new Image(70, 70, elements[name]["url"]));

    //will eventually be a some sort of glow effect on border (nothing much)
    button.onmouseover = function hover() {
        this.style.backgroundColor = "blue";
    }

    //reset to normal
    button.onmouseout = function reset() {
        this.style.backgroundColor = "red";
    }

    button.onclick = function open() {
        this.firstChild.style.display = "block";
    }



    return button;
}



function createAllButtons(node) {
    for (var i = 0; i < buttons.length; i++)
        node.appendChild(createButton("ui-button-" + buttons[i], buttons[i]));
}

function createButtonColumn() {
    var pane = document.createElement('div');

    pane.id = 'buttonsColumn';
    pane.className = 'ui-buttcolumn';

    document.body.insertBefore(pane, document.body.firstChild);

    pane.style.display = 'block';
    pane.style.width = '70px';
    pane.style.height = window.innerHeight + 'px';
    pane.style.position = "fixed";
    pane.style.zIndex = '1';
    pane.style.backgroundColor = 'burlywood';

    return pane;
};

window.onclick = function(event) {
    for (var wind in windows)
        if (wind.style.display !== "none")
            wind.style.display = "none";


};

column = createButtonColumn();
createAllButtons(column);
console.log("Amount of class by name: wrapper:" + document.body.getElementsByClassName("wrapper").length);