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
var btnsv2 = {
    "about": {
        funcs: [window.open],
        params: [
            ["http://berrytube.tv/about.php", "_blank"]
        ],
    },
    "settings": {
        funcs: [showConfigMenu],
        params: [],
    },
    "rules": {
        paths: ["#motdwrap", "#st-wrap-motd"],
        funcs: [view],
        params: ["rules"]
    },
    "header": {
        paths: ["#headwrap", "#st-wrap-header"],
        funcs: [view],
        params: ["header"]
    },
    "footer": {
        paths: ["#main #footwrap", "#st-wrap-footer"],
        funcs: [view],
        params: ["footer"]
    },
    "polls": {
        paths: ["#pollpane", "#pollpane"],
        classes: ["st-window-overlap"],
        funcs: [view],
        params: ["polls"]
    },
    "messages": {
        paths: ["#mailboxDiv", "#mailboxDiv"],
        classes: ["st-window-overlap"],
        funcs: [view],
        params: ["messages"],
    },
    "login": {
        paths: [".wrapper #headbar", ".wrapper #headbar"],
        funcs: [view],
        params: ["login"]
    },
    "playlist": {
        paths: ["#main #leftpane", "#main #leftpane"],
        classes: ["st-window-overlap"],
        funcs: [view, smartRefreshScrollbar, scrollToPlEntry, realignPosHelper],
        params: ["playlist", null, , null]
    },
    "users": {
        paths: ["#chatlist", "#chatlist"],
        classes: ["st-window-users"],
        funcs: [view],
        params: ["users"],
    },

    "toast": {
        funcs: [],
        params: [],
    }
};

/*
    observers.drinks.observe($("#drinkWrap")[0], { childList: true, attributes: true, characterData: true, subtree: true });
    observers.users.observe($("#connectedCount")[0], { childList: true, attributes: true, characterData: true });
    observers.time.observe($("#chatlist > ul")[0], { childList: true, attributes: true, characterData: true, subtree: true });
    observers.berrytweaks.observe(document.head, { childList: true });
    observers.messages.observe($("#mailMessageDiv")[0], { childList: true });
*/

var listeners = {
    init: {
        node: document.body,
        target: ["tweakhack", "id"],
        type: "node",
    },

    settings: {
        node: document.body,
        target: ["dialogWindow ui-draggable", "class"],
    },

    drinks: {
        node: $("#drinkWrap")[0],
        target: [],
    },

    users: {

    }
};


var settings = { storage: {} };
var gui = {};
var observers = {};
var timers = {};
var listeners = {};

const configs = {

};

const categories = {
    "General": {
        "titles": ["Ircify changes"],
        "types": ["tick"],
        "keys": ["ircChanges"]
    },

    Berrytweaks: {
        titles: ["Fix videoname placement"],
        types: ["tick"],
        keys: ["videonamewrap"]
    },

    "Fixes": {
        "titles": ["Temporary"],
        "types": ["tick"],
        "keys": ["temp"]
    }
};

function createInfoBox() {
    gui.info = $("<div>", { id: "st-container-info", class: "st-grid" })
        .append($("<div>", { id: "st-info-time", class: "st-grid-block", text: "Time: " }).append($("<span>")))
        .append($("<div>", { id: "st-info-users", class: "st-grid-block", text: "Users: " }).append($("<span>")))
        .append($("<div>", { id: "st-info-drinks-group" })
            .append($("<div>", { id: "st-info-drinks", class: "st-grid-block", text: "Drinks: " }).append($("<span>")))
            .append($("$<div>", { id: "st-info-dpm", class: "st-grid-block", text: "DPM: " }).append($("<span>"))))

    return gui.info;
}

function view(btn) {
    console.log(btn);

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
    const btnContainer = $('<div>', { class: 'st-buttons-container' });

    Object.keys(btnsv2).forEach(function(element) {
        btnContainer.append($('<button>', { class: 'st-button', id: "st-button-" + element, 'data-key': element, text: element })
            .click(function() {
                const key = $(this).attr('data-key');
                const funcs = btnsv2[key].funcs;
                const params = btnsv2[key].params;

                $(this).removeClass("st-button-change");

                if (key === "toast")
                    return toggle();

                //hacky thing for berrytweaks, if .call() is used it doesn't trigger the berrytweaks
                if (key === "settings")
                    return showConfigMenu(true);

                for (var i = 0; i < funcs.length; i++) {
                    if (key === "playlist" && funcs[i] === scrollToPlEntry) //special thing for playlist
                        params[i] = Math.max($(".overview > ul > .active").index() - 2, 0); //- 2 for giving it some headroom

                    if (Array.isArray(params[i]))
                        funcs[i].call(undefined, ...params[i]);
                    else
                        funcs[i].call(undefined, params[i]);
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

settings.get = function(key, defValue) {
    const value = settings.storage[key];
    return value === undefined ? defValue : value;
}

settings.save = function() {
    localStorage.SmidqeTweaks = JSON.stringify(settings.storage);
}

settings.load = function() {
    settings.storage = JSON.parse(localStorage.SmidqeTweaks || '{}');
}

gui.berrytweaks = function(state) {
    if (!settings.berrytweaks)
        return;

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

gui.toggleWraps = function(state) {
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

gui.toggle = function(force, state, save) {
    const storage = settings.storage;

    if (storage.active === state && !force)
        return;

    gui.toggleWraps(state);
    gui.berrytweaks(state);

    if (state || (storage.active && force)) {
        (settings.maltweaks ? $('body') : $('head')).append(settings.stylesheet);

        Object.keys(btnsv2).forEach(function(element) {
            if (btnsv2[element].paths === undefined)
                return;

            $(btnsv2[element].paths[settings.maltweaks ? 0 : 1]).addClass("st-window-default")
        });
    } else {
        $("#st-stylesheet").remove();

        if (storage.active && storage.videowrap) //remove the text 
            $("#chatControls").contents().filter(function() { return this.nodeType == 3; }).remove();

        if (settings.maltweaks) //patch, fixes wrong sized header
            $(".wrapper #dyn_header iframe").css({ "height": "140px" });
    }

    if (save)
        settings.modify('active', !storage.active, true);
}

settings.show = function() {
    if (!gui.container)
        gui.container = $('<fieldset>');

    const element = gui.container;

    element.empty();
    element.append($('<legend>', { text: 'SmidqeTweaks' }));

    const keys = Object.keys(categories);
    for (var i = 0; i < keys.length; i++) {
        const title = $('<div>', { for: 'st-settings-category' }).append($("<label>", { text: keys[i] }))
        const titles = categories[keys[i]].titles;


        element.append(title);

        for (var j = 0; j < titles.length; j++) {
            var section = $("<div>", { class: 'st-settings-wrap' });

            section.append($('<div>', {
                    class: 'st-settings-setting'
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

            title.append(section);
        }
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

observers.load = () => {
    timers.init = setTimeout(function() {
        gui.toggle(true, settings.storage.active, false);
        observers.init.disconnect();
    }, 5000)

    observers.init = createListener(mutation => {
        mutation.addedNodes.forEach(mut => {
            if (mut.id !== "tweakhack")
                return;

            clearTimeout(timers.init);
            settings.maltweaks = true;

            gui.toggle(true, settings.storage.active, false);
            observers.init.disconnect();
        })
    })

    observers.berrytweaks = createListener(mutation => {
        mutation.addedNodes.forEach(mut => {
            if (mut.src.indexOf("atte.fi") === -1)
                return;

            settings.berrytweaks = true;
            observers.berrytweaks.disconnect();
        })
    })

    observers.settings = createListener(mutation => {
        mutation.addedNodes.forEach(mut => {
            if (mut.className !== "dialogWindow ui-draggable")
                return;

            settings.show();
        })
    })

    observers.drinks = createListener(() => {
        $("#st-info-drinks > span").text($("#drinkCounter").text());
        $("#st-info-dpm > span").text($(".dpmCounter").text().substring(5))
    })

    observers.users = createListener(() => {
        $("#st-info-users > span").text($("#connectedCount").text())
    })

    observers.time = createListener(mutation => {
        mutation.addedNodes.forEach(mut => {
            if (settings.time)
                return;

            settings.time = $(mut).hasClass("me");
        })

        if (settings.time && $(mutation.target).hasClass("berrytweaks-localtime"))
            $("#st-info-time > span").text($(".me > .berrytweaks-localtime").text());
    })

    observers.messages = createListener(mutation => {
        const button = $("st-button-messages")

        if (button.hasClass("st-button-changed"))
            return;

        button.addClass("st-button-changed");
    })

    observers.init.observe(document.body, { childList: true });
    observers.settings.observe(document.body, { childList: true });
    observers.drinks.observe($("#drinkWrap")[0], { childList: true, attributes: true, characterData: true, subtree: true });
    observers.users.observe($("#connectedCount")[0], { childList: true, attributes: true, characterData: true });
    observers.time.observe($("#chatlist > ul")[0], { childList: true, attributes: true, characterData: true, subtree: true });
    observers.berrytweaks.observe(document.head, { childList: true });
    observers.messages.observe($("#mailMessageDiv")[0], { childList: true });

    //force the texts initially
    $("#st-info-users > span").text($("#connectedCount").text())
    $("#st-info-time > span").text(":(");
};

function init() {
    settings.load();

    if (!settings.stylesheet)
        settings.stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>');

    //create the controls
    $('body').append($("<div>", { class: 'st-controls-wrap' })
        .append(createButtons())
        .append(createInfoBox())
    );

    observers.load();
    //listeners.load();

    $("#chatpane").addClass("st-chat");
    $("#videowrap").addClass("st-video");
    $("#playlist").addClass("st-window-playlist");

    //create the toggle button;
    $("#chatControls").append($('<button>', { class: 'st-button-control', id: "st-button-control-toggle", 'data-key': "toggle" })
        .click(function() {
            gui.toggle(false, !settings.storage.active, true);
        })
    )
}

init();