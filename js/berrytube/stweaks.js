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

var settings = { gui: {}, storage: {}, observers: {}, maltweaks: false };
var timers = {};
var listeners = {};

const categories = {
    "General": {
        "titles": ["Ircify changes", "Hover current video"],
        "types": ["tick", "tick"],
        "keys": ["ircChanges", "hoverTitle"]
    },

    "Fixes": {
        "titles": ["Temporary"],
        "types": ["tick"],
        "keys": ["temp"]
    }
};

function createInfoBox() {
    settings.gui.info = $("<div>", { id: "st-container-info", class: "st-grid" })
        .append($("<div>", { id: "st-info-time", class: "st-grid-block", text: "Time: " }).append($("<span>")))
        .append($("<div>", { id: "st-info-users", class: "st-grid-block", text: "Users: " }).append($("<span>")))
        .append($("<div>", { id: "st-info-drinks-group" })
            .append($("<div>", { id: "st-info-drinks", class: "st-grid-block", text: "Drinks: " }).append($("<span>")))
            .append($("$<div>", { id: "st-info-dpm", class: "st-grid-block", text: "DPM: " }).append($("<span>"))))

    return settings.gui.info;
}

function view(btn) {
    const obj = btnsv2[btn];
    const elem = $(obj.paths[settings.maltweaks ? 0 : 1]);
    const open = $(".st-window-open")[0] !== undefined;

    //close all the open windows (should be no more than 1 at a time)
    if (open || settings.storage.prevWindow === btn)
        $(".st-window-open").removeClass("st-window-open");

    if (settings.storage.prevWindow !== btn || !open) {
        elem.addClass("st-window-open");

        //if there are windows
        if (obj.classes !== undefined)
            for (var i = 0; i < obj.classes.length; i++)
                elem.addClass(obj.classes[i]);
    }

    settings.storage.prevWindow = btn;
}

function createButtons() {
    //create the buttonarea first
    const btnContainer = $('<div>', { class: 'st-buttons-container' });

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

settings.modify = function(key, value, save) {
    settings.storage[key] = value;

    if (save)
        settings.save();
}

settings.save = function() {
    localStorage["SmidqeTweaks"] = JSON.stringify(settings.storage);
}

settings.load = function() {
    settings.storage = JSON.parse(localStorage["SmidqeTweaks"] || '{}');
}

settings.gui.berrytweaks = function(state) {
    //check if we have berrytweaks enabled

    if (state) {
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

    settings.modify('videowrap', state, true);
}

settings.gui.toggleWraps = function(state) {
    if (settings.maltweaks)
        return;

    if (state) {
        $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
        $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
        $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
    } else {
        $("#st-wrap-header").contents().unwrap();
        $("#st-wrap-footer").contents().unwrap();
        $("#st-wrap-motd").contents().unwrap();
    }
}

settings.gui.toggle = function(force, state, save) {
    const gui = settings.gui;
    const storage = settings.storage;

    if (storage.active === state && !force)
        return;

    settings.gui.toggleWraps(state);
    settings.gui.berrytweaks(state);

    if (state || (storage.active && force)) {
        (settings.maltweaks ? $('body') : $('head')).append(settings.stylesheet);

        Object.keys(btnsv2).forEach(function(element) {
            if (btnsv2[element].paths === undefined)
                return;

            $(btnsv2[element].paths[settings.maltweaks ? 0 : 1]).addClass("st-window-default")
        });
    } else {
        //remove the stylesheet
        $("#st-stylesheet").remove();

        if (storage.active)
            $("#chatControls").contents().filter(function() { return this.nodeType == 3; }).remove();

        if (settings.maltweaks)
            $(".wrapper #dyn_header iframe").css({ "height": "140px" });
    }

    if (save)
        settings.modify('active', !storage['active'], true);
}

settings.show = function() {
    if (!this.gui.container)
        this.gui.container = $('<fieldset>');

    const element = this.gui.container;

    element.empty();
    element.append($('<legend>', { text: 'SmidqeTweaks' }));

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
                                checked: settings.storage[category.keys[j]],

                                'data-key': category.keys[j]
                            })
                            .change(function() {
                                this.modify($(this).attr('data-key'), !!$(this).prop('checked'), true);
                            }));

                    }
            }

        }

        element.append(section);
    }

    $("#settingsGui > ul").append($('<li>').append(element))
}

function createListener(callback) {
    return new MutationObserver(function(mutations) {
        if (mutations.length === 0)
            return;

        mutations.forEach(callback);
    })
};

settings.observers.load = () => {
    timers.init = setTimeout(function() {
        settings.gui.toggle(true, settings.storage.active, false);
        settings.observers.init.disconnect();
    }, 5000)

    settings.observers.init = createListener(mutation => {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
            var mut = mutation.addedNodes[i];

            //we have maltweaks
            if (mut.id === "tweakhack") {
                clearTimeout(timers.init);
                settings.maltweaks = true;

                settings.gui.toggle(true, settings.storage.active, false);
                settings.observers.init.disconnect();
            }
        }
    })

    settings.observers.settings = createListener(mutation => {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
            var mut = mutation.addedNodes[i];

            if (mut.className === "dialogWindow ui-draggable")
                settings.show();
        }
    })

    settings.observers.drinks = createListener(() => {
        $("#st-info-drinks > span").text($("#drinkCounter").text());
        $("#st-info-dpm > span").text($(".dpmCounter").text().substring(5))
    })

    settings.observers.users = createListener(() => {
        $("#st-info-users > span").text($("#connectedCount").text())
    })

    settings.observers.time = createListener(mutation => {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
            var mut = mutation.addedNodes[i];

            if ($(mut).hasClass("me")) {
                //initial time

                settings.observers.sub = createListener(mutation => {
                    if ((mutation.type === "childList") && $(mutation.target).hasClass("berrytweaks-localtime"))
                        if ($(".me").length > 0)
                            $("#st-info-time > span").text($(".me > .berrytweaks-localtime").text());
                })

                settings.observers.sub.observe(mut, { childList: true, subtree: true });
            }
        }
    })

    const obj = settings.observers;

    obj.init.observe(document.body, { childList: true });
    obj.settings.observe(document.body, { childList: true });
    obj.drinks.observe($("#drinkWrap")[0], { childList: true, attributes: true, characterData: true, subtree: true })
    obj.users.observe($("#connectedCount")[0], { childList: true, attributes: true, characterData: true });
    obj.time.observe($("#chatlist > ul")[0], { childList: true, attributes: true, characterData: true });

    //force the texts initially
    $("#st-info-users > span").text($("#connectedCount").text())
    $("#st-info-time > span").text(":(");
}

function createChangeListeners() {

}

function init() {
    settings.load();

    if (!settings.stylesheet)
        settings.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/css/stweaks.css"/>');

    //create the controls
    $('body').append($("<div>", { class: 'st-controls-wrap' })
        .append(createButtons())
        .append(createInfoBox())
    );

    settings.observers.load();

    $("#chatpane").addClass("st-chat");
    $("#videowrap").addClass("st-video");
    $("#playlist").addClass("st-window-playlist");

    //create the toggle button;
    $("#chatControls").append($('<button>', { class: 'st-button-control', id: "st-button-control-toggle", 'data-key': "toggle" })
        .click(function() {
            settings.gui.toggle(false, !settings.storage.active, true);
        })
    )
}

init();