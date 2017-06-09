/*
    Userscript for BerryTube
    Made by: Smidqe

    
*/


$(document).ready(function() {

    //list of buttons
    const btnsv2 = {
        "about": { "id": "st-button-about", "path-maltweaks": "", "classes": [] },
        "settings": { "id": "st-button-settings", "path": "", "classes": [] },
        "rules": { "id": "st-button-rules", "path-maltweaks": "#motdwrap", "path-original": "", "classes": ["st-window-open", "st-window-rules"] },
        "header": { "id": "st-button-header", "path-maltweaks": "#headwrap", "classes": ["st-window-open", "st-window-header"] },
        "footer": { "id": "st-button-footer", "path-maltweaks": "#main #footwrap", "classes": ["st-window-open", "st-window-footer"] },
        "polls": { "id": "st-button-polls", "path-maltweaks": "#pollbox", "classes": ["st-window-open", "st-window-polls"] },
        "messages": { "id": "st-button-messages", "path-maltweaks": "#mailboxDiv", "classes": ["st-window-open", "st-window-messages"] },
        "login": { "id": "st-button-login", "path-maltweaks": ".wrapper #headbar", "classes": ["st-window-open", "st-window-login"] },
        "playlist": { "id": "st-button-playlist", "path-maltweaks": "#main #leftpane", "classes": ["st-window-open", "st-window-playlist"] }
    };


    //will hold the settings node/eleemnt
    var observer = null;
    var maltweaks = false;
    var settingsGUI = null;
    var settings = {};
    var started = false;
    var btnContainer = null;
    var prevWindow = null;

    const categories = {
        "General": {
            "titles": ["Enable", "Hide 'Connected Users' label"],
            "types": ["tick", "tick"],
            "keys": ['enable', 'users']
        },

        "Compatibility": {
            "titles": ["Using MalTweaks"],
            "types": ["tick"],
            "keys": ['maltweaks']
        },

        "Fixes": {
            "titles": ["Fix timestamps"],
            "types": ["tick"],
            "keys": ["timestamps"]
        }
    };

    function view(btn) {

        var elem = $(btnsv2[btn][maltweaks ? "path-maltweaks" : "path-original"]);
        var open = $(".st-window-open")[0] !== undefined;

        //close all the open windows (should be no more than 1 at a time)
        if (open || prevWindow === btn)
            $(".st-window-open").removeClass("st-window-open");

        if (prevWindow !== btn || !open)
            btnsv2[btn]["classes"].forEach(c => elem.addClass(c));

        prevWindow = btn;
    }

    function createButtons() {
        //create the buttonarea first
        btnContainer = $('<div>', { class: 'st-buttons-container' });

        Object.keys(btnsv2).forEach(function(element) {
            //create the button and the 
            btnContainer.append($('<button>', { class: 'st-button', id: "st-button-" + element, 'data-key': element })
                .css({ "width": "75px", "height": Math.floor(window.innerHeight / Object.keys(btnsv2).length) + "px" })
                .click(function() {
                    if ($(this).attr('data-key') === "about")
                        window.open("http://berrytube.tv/about.php", "_blank");
                    else if ($(this).attr('data-key') === "settings")
                        showConfigMenu(true);
                    else
                        view($(this).attr('data-key'))
                })
            );
        })

        //move to css eventually
        $('body').append(btnContainer);
    }

    function saveSettings() {
        localStorage['SmidqeTweaks'] = JSON.stringify(settings);
    }

    function loadSettings() {
        return settings = JSON.parse(localStorage["SmidqeTweaks"] || '{}');
    }

    function showSettings() {
        //c
        const sttwin = $('#dialogContent');

        //if it doesn't exist
        if (!sttwin)
            return;

        settingsGUI.empty();

        //append the title
        settingsGUI.append($('<legend>', { text: 'SmidqeTweaks' }));

        //load the settings from local storage
        settings = loadSettings();

        //attach a listener to every setting, so that they will be saved everytime a change happens
        var keys = Object.keys(categories);
        var container = null;

        for (var i = 0; i < keys.length; i++) {
            settingsGUI.append(container = $('<div>', { for: 'st-settings-category' }).append($("<label>", { text: keys[i] })));
            var titles = categories[keys[i]].titles;

            //append the titles and their methods
            for (var j = 0; j < titles.length; j++) {
                container.append($('<div>', {
                    for: 'st-settings-setting'
                }));

                //append the label
                container.append($('<label>', {
                    text: titles[j]
                }));

                //append the method, currently only checkbox is possible
                var elemnt = null
                var category = categories[keys[i]];
                switch (category.types[j]) {
                    case 'tick':
                        elemnt = $('<input>', {
                            id: 'st-settings-setting-' + category.keys[j],
                            type: 'checkbox',
                            checked: settings[category.keys[j]],

                            /* This allows us to keep the name of setting in the object */
                            'data-key': category.keys[j]
                        });
                }

                $(elemnt).change(function() {
                    settings[$(this).attr('data-key')] = !!$(this).prop('checked');

                    saveSettings();
                    showSettings();
                });

                container.append(elemnt);
            }
        }
    }

    function start() {
        //append the css files
        $('head').append('<link rel="stylesheet" type="text/css" href="http://smidqe.github.io/css/stweaks.css"/>');

        //modifyView();

        //create the settings observation settings window
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length === 0)
                    return;

                //find the settings window
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    console.log(mutation.addedNodes[i]);

                    if (mutation.addedNodes[i].type === "text/css" && mutation.addedNodes[i].id === "tweakhack") {
                        console.log("maltweaks is being used");
                        maltweaks = true;
                        //probably show an alert or something the first time this script is run
                    }

                    //when the headwrap-div appears the site has finished loading, after that inject classes
                    //this only happens in maltweaks
                    if (mutation.addedNodes[i].id === "headwrap") {
                        Object.keys(btnsv2).forEach(element => $(btnsv2[element]["path-maltweaks"]).addClass("st-window-default"));

                        $("#chatpane").addClass("st-chat");
                        $("#videowrap").addClass("st-video");
                        //more things to come
                    }

                    //handle the new messages, since the original div is hidden, works similarly but with animation
                    if (mutation.addedNodes[i].id === "mailButtonDiv" && mutation.addedNodes[i].className === "new") {
                        console.log("got a new message");
                        //add a new class to the messages button
                        //$(btnsv2["messages"]["path"]).addClass("st-button-change");
                    }

                    //handle the settings window
                    if (mutation.addedNodes[i].className === "dialogWindow ui-draggable") {
                        //check if the settings exist and create them if necessary, else empty the settings
                        if (!settingsGUI)
                            settingsGUI = $('<fieldset>');

                        //append the settings container to the bt's own setting window
                        $("#settingsGui > ul").append(
                            $('<li>').append(settingsGUI)
                        )

                        showSettings();
                    }
                }
            })
        });



        createButtons();

        observer.observe(document.body, { childList: true, attributes: true, characterData: true });
    };

    start();

});