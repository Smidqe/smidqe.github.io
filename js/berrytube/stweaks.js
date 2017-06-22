/*
    Userscript for BerryTube
    Made by: Smidqe

    
*/

/*
    TODO:
        - Turn this into a OOP
        - Add the change animations to the buttons
            - Using mutation observers attached to the right elements
            - can be created in one function (general)
            - 
        - Small details
            - responsive

        - combine drink count and user amounts to a new div
            - will be next to the buttons

        -                     

*/

$(document).ready(function() {

    const btnsv2 = {
        "about": {},
        "settings": {},
        "rules": {
            paths: ["#motdwrap", "#st-wrap-motd"],
        },
        "header": {
            paths: ["#headwrap", "#st-wrap-header"],
        },
        "footer": {
            paths: ["#main #footwrap", "#st-wrap-footer"],
        },
        "polls": {
            paths: ["#pollpane", "#pollpane"],
            classes: ["st-window-overlap"]
        },
        "messages": {
            paths: ["#mailboxDiv", "#mailboxDiv"],
            classes: ["st-window-overlap"]
        },
        "login": {
            paths: [".wrapper #headbar", ".wrapper #headbar"],
        },
        "playlist": {
            paths: ["#main #leftpane", "#main #leftpane"],
            classes: ["st-window-overlap"]
        },
        "users": {
            paths: ["#chatlist", "#chatlist"],
            classes: ["st-window-users"]
        },

        "toast": {}
    };

    var observer = null;
    var observers = {};
    var settingsGUI = null;
    var settings = {};
    var settings2 = { gui: {}, storage: {}, observers: {} };
    var btnContainer = null;
    var timers = {};
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

    function createChangeListener(callback) {
        return new MutationObserver(callback)
    }

    function createInfoBox() {
        settings2.gui.info = $("<div>", { id: "st-container-info" })
            .append($("<div>", { id: "st-info-time", text: "Time: " }).append($("<span>")))
            .append($("<div>", { id: "st-info-users", text: "Users: " }).append($("<span>")))
            .append($("<div>", { id: "st-info-drinks", text: "Drinks: " }).append($("<span>")))

        return settings2.gui.info;
    }

    function view(btn) {
        const obj = btnsv2[btn];
        const elem = $(obj.paths[settings.maltweaks ? 0 : 1]);
        const open = $(".st-window-open")[0] !== undefined;

        //close all the open windows (should be no more than 1 at a time)
        if (open || settings.prevWindow === btn)
            $(".st-window-open").removeClass("st-window-open");

        if (settings.prevWindow !== btn || !open) {
            elem.addClass("st-window-open");

            //if there are windows
            if (obj.classes !== undefined)
                for (var i = 0; i < obj.classes.length; i++)
                    elem.addClass(obj.classes[i]);
        }

        settings.prevWindow = btn;
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
                        realignPosHelper();
                    }
                })
            );
        })

        //move to css eventually
        return btnContainer;
    }

    function createControls() {
        $('body').append($("<div>", { class: 'st-controls-wrap' })
            .append(createButtons())
            .append(createInfoBox())
        );
    }

    function saveSettings() {
        localStorage['SmidqeTweaks'] = JSON.stringify(settings);
    }
    //eventually settings will be broken into two areas
    //functionalities and storage

    settings2.modify = function(key, value, save) {
        this.storage[key] = value;

        if (save)
            this.save();
    }

    settings2.save = function() {
        localStorage["SmidqeTweaks"] = JSON.stringify(this.storage);
    }

    settings2.load = function() {
        this.storage = JSON.parse(localStorage["SmidqeTweaks"] || '{}');
    }

    settings2.gui.berrytweaks = function(state) {
        if (state === "show") {
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
        } else {
            if ($("#st-wrap-videotitle")[0])
                $("#berrytweaks-video_title").unwrap().unwrap().unwrap();
        }

        settings2.storage['videowrap'] = !settings2.storage['videowrap'];
    }

    settings2.gui.toggleWraps = function(state) {
        if (settings2.storage.maltweaks)
            return;

        if (state === "show") {
            $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
            $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
            $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
        } else {
            $("#st-wrap-header").contents().unwrap();
            $("#st-wrap-footer").contents().unwrap();
            $("#st-wrap-motd").contents().unwrap();
        }
    }

    settings2.gui.toggle = function(force, state) {
        if (!settings2.storage['maltweaks'])
            this.gui.wrap(settings2.storage['active']);


        //remove the remaining text

        $("#chatControls").contents().filter(function() { return this.nodeType == 3; }).remove();

        if (settings2.stylesheet !== null)
            settings2.stylesheet.remove();
    }

    settings2.show = function() {
        if (!settings2.gui.container)
            settings2.gui.container = $('<fieldset>');

        settings2.gui.container.empty();

        settings2.gui.container.append($('<legend>', { text: 'SmidqeTweaks' }));

        const keys = Object.keys(categories);
        for (var i = 0; i < keys.length; i++) {
            const section = $('<div>', { for: 'st-settings-category' }).append($("<label>", { text: keys[i] }))
            const titles = categories[keys[i]].titles;

            for (var j = 0; j < titles.length; j++) {
                section.append($('<div>', {
                        for: 'st-settings-setting'
                    }))
                    .append($('<label>', {
                        text: titles[j]
                    }));

                const category = categories[keys[i]];
                switch (category.types[j]) {
                    case 'tick':
                        {
                            section.append($('<input>', {
                                    type: 'checkbox',
                                    checked: settings[category.keys[j]],

                                    'data-key': category.keys[j]
                                })
                                .change(function() {
                                    this.modify($(this).attr('data-key'), !!$(this).prop('checked'), true);
                                }));

                        }
                }

            }

            settings2.gui.container.append(section);
        }

        $("#settingsGui > ul").append($('<li>').append(settings2.gui.container))
    }

    function createListener(callback) {
        return new MutationObserver(function(mutations) {
            if (mutations.length === 0)
                return;

            mutations.forEach(callback);
        })
    };

    settings2.observers.load = () => {

        settings2.observers.init = createListener(mutation => {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var mut = mutation.addedNodes[i];

                //we have maltweaks
                if (mut.id === "tweakhack") {
                    clearTimeout(timers.init);
                    settings.maltweaks = true;
                    toggleTweaks(false, settings.active, "show");
                }

                //we may not have maltweaks
                if (mut.id === "chainsawDiv")
                    settings.maltweaks = false;
            }
        })

        settings2.observers.settings = createListener(mutation => {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var mut = mutation.addedNodes[i];

                if (mut.className === "dialogWindow ui-draggable")
                    settings2.show();
            }
        })

        settings2.observers.drinks = createListener(() => {
            $("#st-info-drinks-amount > span:last").text($("#drinkCounter").text());
            $("#st-info-drinks-dpm > span").text($(".dpmCounter").text().substring())
        })

        settings2.observers.users = createListener(() => {
            $("#st-info-users-amount > span").text($("#connectedCount").text())
        })

        settings2.observers.time = createListener(() => {
            $("#st-info-time > span").text($(".me > .berrytweaks-localtime"));
        })

        settings2.observers.settings.observe(document.body, { childList: true });
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
                var elemnt = null;
                var category = categories[keys[i]];
                switch (category.types[j]) {
                    case 'tick':
                        elemnt = $('<input>', {
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

    //this is horrible \\ppcute

    function toggleTweaks(save, force, state) {
        if (!settings.active || (force && state === "show")) {
            (settings.maltweaks ? $('body') : $('head')).append(settings.stylesheet = $('<link rel="stylesheet" type="text/css" href="http://smidqe.github.io/css/stweaks.css"/>'));

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

            Object.keys(btnsv2).forEach(function(element) {
                if (btnsv2[element].paths === undefined)
                    return;

                $(btnsv2[element].paths[settings.maltweaks ? 0 : 1]).addClass("st-window-default")
            });
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

            if (settings.stylesheet !== null)
                settings.stylesheet.remove();
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
        timers.init = setTimeout(toggleTweaks(false, settings.active, "show"), 6000)

        observers.body = createChangeListener(function(mutations) {
            if (mutations.length === 0)
                return;

            mutations.forEach(function(mutation) {

                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var mut = mutation.addedNodes[i];

                    //we have maltweaks
                    if (mut.id === "tweakhack") {
                        clearTimeout(timers.init);
                        settings.maltweaks = true;
                        toggleTweaks(false, settings.active, "show");
                    }

                    //we may not have maltweaks
                    if (mut.id === "chainsawDiv")
                        settings.maltweaks = false;

                    if (mut.className === "dialogWindow ui-draggable") {
                        /*
                        if (!settingsGUI)
                            settingsGUI = $('<fieldset>');

                        //append the settings container to the bt's own setting window
                        $("#settingsGui > ul").append(
                            $('<li>').append(settingsGUI)
                        )

                        showSettings();
                        */
                    }
                }
            })
        });

        //createButtons();
        //observers.forEach(e => e.func.observe(e.path, e.config));
        observers.body.observe(document.body, { childList: true, attributes: true, characterData: true });
    };

    function start2() {
        settings2.load();
        settings2.observers.load();
        console.log(settings2.storage);
        console.log(settings2.observers);
        createControls();
    }

    start();
    start2();
});