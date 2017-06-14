/*
    Userscript for BerryTube
    Made by: Smidqe

    
*/


$(document).ready(function() {

    //list of buttons
    const btnsv2 = {
        "about": { "id": "st-button-about", "path-maltweaks": "", "classes": [] },
        "settings": { "id": "st-button-settings", "path": "", "classes": [] },
        "rules": { "id": "st-button-rules", "path-maltweaks": "#motdwrap", "path-original": "#st-wrap-motd", "classes": ["st-window-open", "st-window-rules"] },
        "header": { "id": "st-button-header", "path-maltweaks": "#headwrap", "path-original": "#st-wrap-header", "classes": ["st-window-open", "st-window-header"] },
        "footer": { "id": "st-button-footer", "path-maltweaks": "#main #footwrap", "path-original": "#st-wrap-footer", "classes": ["st-window-open", "st-window-footer"] },
        "polls": { "id": "st-button-polls", "path-maltweaks": "#pollbox", "path-original": "#pollpane", "classes": ["st-window-open", "st-window-overlap"] },
        "messages": { "id": "st-button-messages", "path-maltweaks": "#mailboxDiv", "path-original": "#mailboxDiv", "classes": ["st-window-open", "st-window-overlap"] },
        "login": { "id": "st-button-login", "path-maltweaks": ".wrapper #headbar", "path-original": ".wrapper #headbar", "classes": ["st-window-open", "st-window-login"] },
        "playlist": { "id": "st-button-playlist", "path-maltweaks": "#main #leftpane", "path-original": "#main #leftpane", "classes": ["st-window-open", "st-window-overlap"] },
        "users": { "id": "st-button-users", "path-maltweaks": "#chatlist", "path-original": "#chatlist", "classes": ["st-window-open", "st-window-users"] },
        "toast": { "id": "st-button-toast", "path-maltweaks": "", "classes": [] }
    };

    var observer = null;
    var maltweaks = false;
    var settingsGUI = null;
    var settings = {};
    var btnContainer = null;
    var prevWindow = null;
    var stylesheet = null;

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
        const obj = btnsv2[btn];
        const elem = $(obj[maltweaks ? "path-maltweaks" : "path-original"]);
        const open = $(".st-window-open")[0] !== undefined;

        //close all the open windows (should be no more than 1 at a time)
        if (open || prevWindow === btn)
            $(".st-window-open").removeClass("st-window-open");

        if (prevWindow !== btn || !open)
            obj["classes"].forEach(c => elem.addClass(c));

        prevWindow = btn;
    }

    function createButtons() {
        //create the buttonarea first
        btnContainer = $('<div>', { class: 'st-buttons-container' });

        Object.keys(btnsv2).forEach(function(element) {
            //create the button and the 
            btnContainer.append($('<button>', { class: 'st-button', id: "st-button-" + element, 'data-key': element, text: element })
                .click(function() {
                    const key = $(this).attr('data-key');

                    if (key === "about")
                        window.open("http://berrytube.tv/about.php", "_blank");
                    else if (key === "settings")
                        showConfigMenu(true);
                    else if (key === "toast")
                        toggle(); //thanks toast for this descriptive function name :P
                    else
                        view(key);

                    //force the refresh without actually touching it
                    if (key === "playlist") {
                        smartRefreshScrollbar();
                        scrollToPlEntry(Math.max($(".overview > ul > .active").index() - 2, 0));
                    }
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
        const keys = Object.keys(categories);
        var container = null;

        for (var i = 0; i < keys.length; i++) {
            settingsGUI.append(container = $('<div>', { for: 'st-settings-category' }).append($("<label>", { text: keys[i] })));
            const titles = categories[keys[i]].titles;

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

    function createToggleButton() {


    }

    function toggleTweaks() {

    }

    function vanillaSetup() {
        stylesheet = $('head').append('<link rel="stylesheet" type="text/css" href="http://smidqe.github.io/css/stweaks.css"/>');

        //credit to mal for these trhee lines
        $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
        $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
        $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');

        //add permanent classes
        $("#chatpane").addClass("st-chat");
        $("#videowrap").addClass("st-video");
        $("#playlist").addClass("st-window-playlist");

        Object.keys(btnsv2).forEach(element => $(btnsv2[element]["path-original"]).addClass("st-window-default"));

        $("#berrytweaks-video_title").wrap("<div id='st-wrap-current-video'><span>Current video (hover)</span></div>")
            .hover(function() {

            })
    }



    function start() {
        //append the css files
        $(".berryemote").hover(function() {
            console.log("hovering over berrymote");
        }, function() { console.log("exiting") });

        vanillaSetup();

        //
        var atteObsv = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (!$("#st-wrap-videotitle")[0])
                    $("#berrytweaks-video_title").wrap("<div id='st-wrap-videotitle'><span>Current video (hover)</span></div>").wrap("<div id='st-videotitle-window'></div>");

                $("#st-wrap-videotitle").hover(
                    function() {
                        $("#st-videotitle-window").slideDown("fast");
                    },
                    function() {
                        $("#st-videotitle-window").hide();
                    }
                )

                atteObsv.disconnect();
            });
        })

        atteObsv.observe($("#chatControls")[0], { childList: true, attributes: true, characterData: true })

        //create the settings observation settings window
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length === 0)
                    return;

                //find the settings window
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    console.log(mutation.addedNodes[i]);

                    if (mutation.addedNodes[i].id === "tweakhack") { //thanks mal
                        $("#st-wrap-header").contents().unwrap();
                        $("#st-wrap-footer").contents().unwrap();
                        //add my own maltweaks compatible stylesheet after the maltweaks
                        //this is due to maltweaks wont' work if it's in the head for some odd reason
                        //remove the original(vanilla) css
                        stylesheet.remove();
                        stylesheet = $('body').append('<link rel="stylesheet" type="text/css" href="http://smidqe.github.io/css/stweaks-maltweaks.css"/>');
                    }

                    //when the headwrap-div appears the site has finished loading, after that inject classes
                    //this only happens in maltweaks
                    if (mutation.addedNodes[i].id === "headwrap") {
                        maltweaks = true;
                        $(".st-window-default").forEach($(this).removeClass("st-window-default"));

                        Object.keys(btnsv2).forEach(element => $(btnsv2[element]["path-maltweaks"]).addClass("st-window-default"));
                        //disables the maltweaks and hides the tweaked mode button
                        $("body").removeClass("tweaked");

                        $("#leftpane").css("height", "100% !important");


                        $("#chatpane").addClass("st-chat");
                        $("#videowrap").addClass("st-video");
                        $("#playlist").addClass("st-window-playlist");


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

        createToggleButton();
        createButtons();

        observer.observe(document.body, { childList: true, attributes: true, characterData: true });
    };

    start();
});