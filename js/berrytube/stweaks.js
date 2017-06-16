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
    var active = false;
    var scriptLocation = null;

    const categories = {
        "General": {
            "titles": ["Enable", "Hide 'Connected Users' label"],
            "types": ["tick", "tick"],
            "keys": ['enable', 'users']
        },

        "Fixes": {
            "titles": ["Fix timestamps"],
            "types": ["tick"],
            "keys": ["timestamps"]
        }
    };

    function view(btn) {
        const obj = btnsv2[btn];
        const elem = $(obj[settings.maltweaks ? "path-maltweaks" : "path-original"]);
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
        $("#chatControls").append($('<button>', { class: 'st-button-control', id: "st-button-control-toggle", 'data-key': "toggle" })
            .click(function() {
                toggleTweaks(true, false, "");
            })
        )
    }

    function toggleTweaks(save, force, state) {
        if (!settings.active || (force && state === "show")) {
            (settings.maltweaks ? $('body') : $('head')).append(stylesheet = $('<link rel="stylesheet" type="text/css" href="http://smidqe.github.io/css/stweaks.css"/>'));

            if (!settings.maltweaks) {
                $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            }

            //the videotitle thingy
            if (!$("#st-wrap-videotitle")[0])
                $("#berrytweaks-video_title").wrap("<div id='st-wrap-videotitle'><span>Current video (hover)</span></div>").wrap("<div id='st-videotitle-window'></div>");

            $("#st-videotitle-window").hide();

            $("#st-wrap-videotitle").hover(
                function() {
                    $("#st-videotitle-window").slideDown("fast");
                },
                function() {
                    $("#st-videotitle-window").hide("fast");
                }
            )

            $("#chatpane").addClass("st-chat");
            $("#videowrap").addClass("st-video");
            $("#playlist").addClass("st-window-playlist");
            $(".st-buttons-container").removeClass("st-element-hidden");

            Object.keys(btnsv2).forEach(element => $(btnsv2[element][settings.maltweaks ? "path-maltweaks" : "path-original"]).addClass("st-window-default"));
        } else if (settings.active || (force && state === "hide")) {

            if (!settings.maltweaks) {

                $("#st-wrap-header").contents().unwrap();
                $("#st-wrap-footer").contents().unwrap();
                $("#st-wrap-motd").contents().unwrap();
            }
            //unwrapception
            $("#berrytweaks-video_title").unwrap().unwrap().unwrap();
            //remove the remaining text
            $("#chatControls").contents().filter(function() { return this.nodeType == 3; }).remove();

            if (stylesheet !== null)
                stylesheet.remove();
        }

        if (save) {
            settings.active = !settings.active;
            saveSettings();
        }
    }

    function start() {
        createToggleButton();
        //
        settings = loadSettings();

        //a hacky thing to wait out until maltweaks have loaded (also in vanilla)
        if (settings.active)
            setTimeout(function() {
                toggleTweaks(false, settings.active, "show");
            }, 4000);

        //create the settings observation settings window
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length === 0)
                    return;

                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    console.log(mutation.addedNodes[i]);

                    //when the headwrap-div appears the site has finished loading, after that inject classes
                    //this only happens in maltweaks
                    if (mutation.addedNodes[i].id === "headwrap")
                        settings.maltweaks = true;

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