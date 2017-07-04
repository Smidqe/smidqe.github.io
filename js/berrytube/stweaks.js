var settings = {};
var utils = {
    settings: {
        save: function() {

        },

        load: function() {

        },

        modify: function() {

        }
    },
};

var gui = {
    window: null,

    video: {
        toggle: () => {
            if ($("#st-button-control-video").hasClass("st-button-control-active"))
                MT.disablePlayer();
            else
                MT.restoreLocalPlayer();
        },
    },

    settings: {
        container: null,

        show: function() {
            if (!this.container)
                this.container = $('<fieldset>');

            this.container.empty();
            this.container.append($('<legend>', { text: 'SmidqeTweaks' }));

            const keys = Object.keys(categories);
            for (var i = 0; i < keys.length; i++) {
                const title = $('<div>', { class: 'st-settings-category' }).append($("<label>", { text: keys[i] }))
                const titles = categories[keys[i]].titles;

                this.container.append(title);

                for (var j = 0; j < titles.length; j++) {
                    var section = $("<div>", { class: 'st-settings-wrap' });
                    const category = categories[keys[i]];
                    section.append($('<div>', {
                            class: 'st-settings-setting'
                        }))
                        .append($('<label>', {
                            text: titles[j]
                        }))
                        .append($('<input>', {
                                type: category.types[j],
                                checked: settings[category.keys[j]],

                                'data-key': category.keys[j]
                            })
                            .change(function() {
                                utils.modifySetting($(this).attr('data-key'), !!$(this).prop('checked'), true);
                            }));

                    title.append(section);
                }
            }

            $("#settingsGui > ul").append($('<li>').append(this.container));
        },
    },

    layout: {
        namewrap: {
            enable: function() {
                if (!settings.berrytweaks)
                    return;

                if (settings.videoname)
                    $("#berrytweaks-video_title").wrap("<div id='st-videotitle-window'></div>");
            },

            disable: function() {
                $("#berrytweaks-video_title").unwrap().unwrap().unwrap();
                $("#chatControls").contents().filter(function() { return this.nodeType == 3; }).remove();
            }
        },

        wraps: {
            enable: function() {
                $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            },

            disable: function() {
                $("#st-wrap-header").contents().unwrap();
                $("#st-wrap-footer").contents().unwrap();
                $("#st-wrap-motd").contents().unwrap();
            },
        },

        enable: function() {
            (settings.maltweaks ? $('body') : $('head')).append($('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>'));

            if (settings.videoname)
                this.namewrap.enable();

            if (!settings.maltweaks)
                this.wraps.enable();

            $.each(gui.buttons, function(element) {
                const paths = gui.buttons[element].paths;
                if (paths === undefined)
                    return;

                if (paths.length === 1)
                    elem = $(paths[0]);
                else
                    elem = $(paths[settings.maltweaks ? 0 : 1]);

                elem.addClass("st-window-default");
            });

            utils.modifySetting("active", true, true)
        },

        disable: function() {
            $("#st-stylesheet").remove();

            if (settings.videoname)
                this.namewrap.disable();

            if (settings.maltweaks) //patch, fixes wrong sized header
                $(".wrapper #dyn_header iframe").css({ "height": "140px" });

            utils.modifySetting("active", false, true)
        },

        refresh: () => {
            //will have all the settings things so 
        },
    },

    buttons: {
        container: null,

        about: {
            funcs: [window.open],
            params: [
                ["http://berrytube.tv/about.php", "_blank"]
            ],
        },
        settings: {
            funcs: [showConfigMenu],
        },
        rules: {
            paths: ["#motdwrap", "#st-wrap-motd"],
        },
        header: {
            paths: ["#headwrap", "#st-wrap-header"],
        },
        footer: {
            paths: ["#main #footwrap", "#st-wrap-footer"],
        },
        polls: {
            paths: ["#pollpane"],
            classes: ["st-window-overlap"],
        },
        messages: {
            paths: ["#mailboxDiv"],
            classes: ["st-window-overlap"],
        },
        login: {
            paths: [".wrapper #headbar"],
        },
        playlist: {
            paths: ["#main #leftpane"],
            classes: ["st-window-overlap"],
            funcs: [smartRefreshScrollbar, scrollToPlEntry, realignPosHelper],
            params: [null, , null]
        },
        users: {
            paths: ["#chatlist"],
            classes: ["st-window-users"],
        },

        //sorry toast, but you don't get anything :(
        toast: {},

        create: function() {
            const obj = this;
            const btns = $('<div>', { class: "st-buttons-container" });

            this.container = $("<div>", { class: "st-controls-wrap" });
            this.container.append(btns);

            $.each(this, function(element) {
                if ($.isFunction(obj[element]) || element === "container") //skip funcs
                    return;

                btns.append($('<button>', {
                        class: 'st-button',
                        id: "st-button-" + element,
                        'data-key': element,
                        text: element
                    })
                    .click(function() {
                        obj.toggle($(this));
                    }));
            })

            this.container.append($("<div>", { id: "st-container-info", class: "st-grid" })
                .append($("<div>", { id: "st-info-time", class: "st-grid-block", text: "Time: " }).append($("<span>")))
                .append($("<div>", { id: "st-info-users", class: "st-grid-block", text: "Users: " }).append($("<span>")))
                .append($("<div>", { id: "st-info-drinks-group" })
                    .append($("<div>", { id: "st-info-drinks", class: "st-grid-block", text: "Drinks: " }).append($("<span>")))
                    .append($("$<div>", { id: "st-info-dpm", class: "st-grid-block", text: "DPM: " }).append($("<span>")))));

            $("body").append(this.container);
        },

        toggle: function(btn) {
            const key = btn.attr('data-key');
            const funcs = this[key].funcs;
            const params = this[key].params;

            if (key === "toast")
                return toggle();

            if (key === "settings" && (settings.berrytweaks))
                return showConfigMenu(true);

            $(this).removeClass("st-button-changed");

            if (key !== "about")
                gui.windows.view(this[key]);

            if (!funcs)
                return;

            for (var i = 0; i < funcs.length; i++) {
                if (key === "playlist" && funcs[i] === scrollToPlEntry) //special thing for playlist
                    params[i] = Math.max($(".overview > ul > .active").index() - 2, 0); //- 2 for giving it some headroom

                if (Array.isArray(params[i]))
                    funcs[i].call(undefined, ...params[i]);
                else
                    funcs[i].call(undefined, params[i]);
            }
        },
    },

    windows: {
        last: null,
        view: function(btn) {
            const open = $(".st-window-open")[0] !== undefined;

            var elem = null;
            if (btn.paths.length === 1)
                elem = $(btn.paths[0]);
            else
                elem = $(btn.paths[settings.maltweaks ? 0 : 1]);

            if (open || this.last === btn)
                $(".st-window-open").removeClass("st-window-open");

            if (this.last !== btn || !open) {
                elem.addClass("st-window-open");

                if (btn.classes !== undefined)
                    btn.classes.forEach(c => { elem.addClass(c) });
            }

            this.last = btn;
        },
    },

    toolbar: {
        buttons: {
            tweaks: {
                text: "T",
                tooltip: "Toggle smidqeTweaks",
                shown: true,
                default: false,
                func: () => {
                    const layout = gui.layout;

                    if (settings.active)
                        layout.disable();
                    else
                        layout.enable();
                }
            },

            video: {
                text: "V",
                tooltip: "Toggle video",
                shown: false,
                default: true,
                func: () => {
                    gui.video.toggle();
                }
            },

            videoname: {
                text: "W",
                tooltip: "Show videoname",
                shown: false,
                default: false,
                func: () => {

                },
            },
        },

        create: () => {
            const bar = $("<div>", { id: "st-toolbar-wrap" })
            const buttons = gui.toolbar.buttons;

            $.each(buttons, function(btn) {
                bar.append($("<div>", {
                        class: "st-button-control",
                        id: "st-button-control-" + btn,
                        text: buttons[btn].text,
                        'data-key': btn,
                    })
                    .click(function() {
                        gui.toolbar.toggle($(this), buttons[$(this).attr('data-key')], true);
                    })
                )
            });

            $("#chatControls").append(bar);
        },

        toggle: function(handle, btn, save) {
            handle.toggleClass('st-button-control-active');

            if (btn.func !== undefined)
                btn.func();
        },

        enable: (btn) => {
            $(".st-button-control").each(() => {
                if ($(this).attr("key") !== btn)
                    return;

                $(this).addClass("st-button-control-active");
            })
        },

        disable: (btn) => {
            $(".st-button-control").each(() => {
                if ($(this).attr("key") !== btn)
                    return;

                $(this).removeClass("st-button-control-active");
            })
        }
    },
};

const listeners = {
    time: {
        path: "#chatlist > ul",
        node: null, //if static then we don't need to refresh
        config: { childList: true, attributes: true, characterData: true, subtree: true }, //config for the observer
        observer: null,
        disconnect: false,
        monitor: "all",
        callback(mutation) {
            $("#st-info-time > span").text($(".me > .berrytweaks-localtime").text());
        },
    },

    settings: {
        path: null,
        node: document.body,
        config: { childList: true },
        observer: null,
        disconnect: false,
        monitor: "added",
        callback(mutation) {
            if (mutation.className !== "dialogWindow ui-draggable")
                return;

            gui.settings.show();
        },
    },

    maltweaks: {
        path: null,
        node: document.body,
        config: { childList: true },
        observer: null,
        disconnect: false,
        monitor: "added",
        callback(mutation) {
            if (mutation.id !== "headwrap")
                return;

            utils.modifySetting("maltweaks", true, true);

            if (settings.active)
                gui.layout.enable();
        },
    },

    berrytweaks: {
        path: null,
        node: document.head,
        config: { childList: true },
        observer: null,
        disconnect: false,
        monitor: "added",
        callback(mutation) {
            if (mutation.src.indexOf("atte.fi") !== -1)
                settings.berrytweaks = true;

            if (settings.berrytweaks)
                listeners.stop(listeners.berrytweaks);
        },
    },

    drinks: {
        path: "#drinkWrap",
        node: null,
        config: {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        },
        observer: null,
        disconnect: false,
        monitor: "all",
        callback(mutation) {
            $("#st-info-drinks > span").text($("#drinkCounter").text());
            $("#st-info-dpm > span").text($(".dpmCounter").text().substring(5))
        },
    },

    messages: {
        path: "#mailMessageDiv",
        node: null,
        config: { childList: true },
        observer: null,
        disconnect: false,
        monitor: "added",
        callback(mutation) {
            const button = $("#st-button-messages")

            if (button.hasClass("st-button-changed"))
                return;

            button.addClass("st-button-changed");
        },
    },

    users: {
        path: "#connectedCount",
        node: null,
        static: false,
        config: {
            childList: true
        },
        observer: null,
        disconnect: false,
        monitor: "added",
        callback(mutation) {
            $("#st-info-users > span").text($("#connectedCount").text())
        },
    },

    create: function(obs) {
        return new MutationObserver(function(mutations) {
            mutations.forEach((mutation) => {
                if (obs.monitor === "added")
                    mutation.addedNodes.forEach(mut => obs.callback(mut));

                if (obs.monitor === "removed")
                    mutation.removedNodes.forEach(mut => obs.callback(mut));

                if (obs.monitor === "all")
                    obs.callback(mutation); //call the callback on every mutation regardless of type
            });
        });
    },

    load: function(obs) {
        obs.observer = this.create(obs);
    },

    start: function(obs) {
        if (!obs.observer)
            return;

        if (!obs.node)
            obs.node = $(obs.path)[0];

        console.log("ST: Starting observer");
        obs.observer.observe(obs.node, obs.config);
    },

    stop: function(obs) {
        if (!obs.observer)
            return;

        obs.observer.disconnect();
    },

    loadAll: function(start) {
        $.each(this, function(key) {
            if ($.isFunction(listeners[key])) //skip funcs
                return;

            const obs = listeners[key];
            listeners.load(obs);

            if (start)
                listeners.start(obs);
        });
    }
}


const categories = {
    Scripts: {
        titles: ["Maltweaks", "Berrytweaks"],
        types: ["checkbox", "checkbox"],
        keys: ["maltweaks", "berrytweaks"]
    },

    General: {
        titles: ["Ircify changes"],
        types: ["checkbox"],
        keys: ["ircChanges"]
    },

    Berrytweaks: {
        titles: ["Wrap current video's name"],
        types: ["checkbox"],
        keys: ["videoname"],
    },

    Fixes: {
        titles: ["Temporary"],
        types: ["checkbox"],
        keys: ["temp"]
    }
};

utils.modifySetting = (key, value, save) => {
    settings[key] = value;

    if (save)
        utils.saveSettings();
}

utils.saveSettings = () => {
    localStorage.SmidqeTweaks = JSON.stringify(settings);
}

utils.loadSettings = () => {
    settings = JSON.parse(localStorage.SmidqeTweaks || '{}');
}

/*
gui.toggleWraps = function(state) {
    if (settings.maltweaks)
        return;

    if (state) {

    } else {

    }
}

*/
function init() {
    utils.loadSettings();

    $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

    console.log($("#tweakhack")[0]);

    //this will fix greasemonkey which starts the scripts after the page has loaded iirc
    //it's possible to miss the berrytweaks (seems to be the same for )
    gui.toolbar.create();
    gui.buttons.create();

    listeners.loadAll(true);
    $("#chatpane").addClass("st-chat");
    $("#videowrap").addClass("st-video");
    $("#playlist").addClass("st-window-playlist");

    $("#st-info-users > span").text($("#connectedCount").text())
    $("#st-info-time > span").text(":(");

    if ($("head > link").attr('href').indexOf("atte.fi") !== -1)
        utils.modifySetting("berrytweaks", true, true);

    if (settings.active && !settings.maltweaks)
        gui.layout.enable();
}

init();