/*
    Userscript for BerryTube
    Made by: Smidqe

    
*/


$(document).ready(function() {

    //list of buttons
    const buttons = ["about", "timers", "rules", "header", "footer", "polls", "messages", "login", "playlist"];
    const btnsv2 = {
        "about": { "id": "st-button-about", "path": ".floatinner > .wrapper" },
        "timers": { "id": "st-button-timers", "path": ".floatinner > .dynarea" },
        "rules": { "id": "st-button-rules", "path": "#motdwrap" },
        "header": { "id": "st-button-header", "path": "#headwrap .floatinner" },
        "footer": { "id": "st-button-footer", "path": "#main #footwrap" },
        "polls": { "id": "st-button-polls", "path": "#pollbox" },
        "messages": { "id": "st-button-messages", "path": "#mailboxDiv" },
        "login": { "id": "st-button-login", "path": ".wrapper #headbar" },
        "playlist": { "id": "st-button-playlist", "path": "#main #leftpane" }
    };


    //will hold the settings node/eleemnt
    var observer = null;
    var settingsGUI = null;
    var settings = {};
    var started = false;
    var btnContainer = null;

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



    function toggleView(btn) {

        var view = null;
        switch (btn) {
            case "st-button-timers":
                {
                    view = $(".floatinner > .wrapper");
                    break;
                }
            case "st-button-rules":
                {
                    view = $("#motdwrap");
                    break;
                }

            case "st-button-header":
                {
                    view = $("body > #headwrap");
                    break;
                }
            case "st-button-footer":
                {
                    view = $("#footwrap");
                    break;
                }
            case "st-button-polls":
                {
                    view = $("#pollbox");
                    break;
                }
            case "st-button-messages":
                {
                    view = $("#mailboxDiv");
                    break;
                }
            case "st-button-login":
                {
                    view = $(".wrapper #headbar");
                    break;
                }
            case "st-button-playlist":
                {
                    view = $("#main #leftpane");
                    break;
                }

            default:
                return;
        }

        if ($(".st-window-open")[0]) {
            $(".st-window-open").addClass("st-window-default").removeClass("st-window-open");
            if (btn === "st-button-header")
                $("#headwrap .floatinner").removeClass("st-window-default");

        } else
            view.removeClass("st-window-default").addClass("st-window-open");

    }

    //temporary for the javascript, will be moved into css file when finished
    function modifyView() {
        mvRight = { "left": "75px", "position": "fixed" };

        $("#headwrap").css(mvRight);
        $("body > #headwrap").css({ "display": "none" });
        $("body > .wrapper").css(mvRight);
        $("#videobg").css(mvRight);
        $("#videobg").css({ "top": "0", "width": "100%" })


        //needs maltweaks compatible method
        if (!$('body').hasClass("tweaked")) {
            //handles all maltweaks controlled areas

            $("body > #main > #leftpane").css({ "display": "none" })
        }

    }

    //creates the button area and the buttons with their functionalities
    function createButtons() {
        //create the buttonarea first
        btnContainer = $('<div>', { for: 'st-buttons-container' });

        var button = $('<div>');
        buttons.forEach(function(element) {
            //create the button and the 
            btnContainer.append($('<button>', { for: 'st-button', text: element, id: "st-button-" + element })
                .css({ "width": "75px", "height": window.innerHeight / buttons.length + "px" })
                .click(function() {
                    if (element === "about")
                        window.open("http://berrytube.tv/about.php", "_blank");
                    else
                        toggleView($(this).attr('id'))
                })
            );
        })

        //move to css eventually
        btnContainer.css({ "display": "block", "position": "fixed", "top": "0", "left": "0", "width": "75px" });
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
                        //patchMaltweaks();    
                    }

                    //when the headwrap-div appears the site has finished loading, after that inject classes
                    if (mutation.addedNodes[i].id === "headwrap") {
                        $('head').append('<link rel="stylesheet" type="text/css" href="http://smidqe.github.io/css/stweaks.css"/>');

                        Object.keys(btnsv2).forEach(element => $(btnsv2[element].path).addClass("st-window-default"));

                        //more things to come






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