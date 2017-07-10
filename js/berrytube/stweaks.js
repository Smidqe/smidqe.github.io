var startTimer = null;

const categories = {
    Scripts: {
        titles: ["Maltweaks", "Berrytweaks"],
        types: ["checkbox", "checkbox"],
        keys: ["maltweaks", "berrytweaks"]
    },

    General: {
        titles: ["Ircify changes", "Enable hovered windows"],
        types: ["checkbox", "checkbox"],
        keys: ["ircChanges", "allowHover"]
    },

    Berrytweaks: {
        titles: ["Wrap current video's name"],
        types: ["checkbox"],
        keys: ["videoname"],
    },

    Debug: {
        titles: ["Enable debug logging", "Ircify debug"],
        types: ["checkbox", "checkbox"],
        keys: ["debug", "ircDebug"]
    }
};

var settings = {
    storage: {},
    container: null,

    save: function() {
        localStorage.SmidqeTweaks = JSON.stringify(this.storage);
    },

    load: function() {
        this.storage = JSON.parse(localStorage.SmidqeTweaks || '{}')
    },

    get: function(key) {
        return this.storage[key];
    },

    set: function(key, value, save) {
        this.storage[key] = value

        if (save)
            this.save();
    },

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
                const section = $("<div>", { class: 'st-settings-wrap' });
                const category = categories[keys[i]];
                section.append($('<div>', {
                        class: 'st-settings-setting'
                    }))
                    .append($('<label>', {
                        text: titles[j]
                    }))
                    .append($('<input>', {
                            type: category.types[j],
                            checked: settings.get(category.keys[j]),

                            'data-key': category.keys[j]
                        })
                        .change(function() {
                            settings.set($(this).attr('data-key'), !!$(this).prop('checked'), true);
                        }));

                title.append(section);
            }
        }

        $("#settingsGui > ul").append($('<li>').append(this.container));
    }
};

var utilities = {
    chat: {
        add: function(nick, text, type) {
            addChatMsg({
                msg: {
                    nick,
                    msg: text,
                    metadata: {
                        graymute: false,
                        nameflaunt: false,
                        flair: null,
                        channel: 'main'
                    },
                    emote: type,
                },

                ghost: false,
            }, "#chatbuffer");
        },


    }
}

var tweaksv2 = {
    polls: {
        average: {
            deps: ['active', 'calcAvg'],
            apply: function() {
                if ($("pollpane .active")[0])
                    return;

                const buttons = $(".poll:first-child .btn:not('.close')"); // we can use index numbers to calculate the final values \\teehee

                if (buttons.length != 10) //not a episode poll (should make into a constant)
                    return;

                var number = true;
                var value = 0;
                var count = 0;

                $.each(btns, i => {
                    if (isNaN($(btns[i]).text()))
                        number = false;

                    if (!number)
                        return;

                    value += $(btns[i]).text() * i;
                    count += Number($(btns[i]).text());
                })

                if (!number)
                    return; //prevent wrong messages

                //create a ircified message
                utilities.chat.add(this.setting.msg, value / count, this.setting.type)
            },

            setting: {
                msg: "Poll average: ",
                type: "act",
            },
        },

        closure: {
            deps: ['active', 'pollClose'],

            run: () => {
                if (!settings.get("pollClose"))
                    return;

                if ($("pollpane .active")[0]) //we have open poll
                    return;

                //$("pollpane .poll:first-child").
                //notification to the chat (ircify)
            },
        },
    },

    playlist: {
        notify: {

        }
    },

    video: {
        run: function() {
            if ($("#st-button-control-video").hasClass("active"))
                MT.disablePlayer();
            else
                MT.restoreLocalPlayer();
        }
    },

    layout: {
        tweaks: {
            state: false,
            enable: function() {
                const maltweaks = settings.get("maltweaks");
                const stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>')
                const location = maltweaks ? $('body') : $('head');

                location.append(stylesheet);

                if (!maltweaks) {
                    $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                    $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                    $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
                }

                $("#chatpane").addClass("st-chat");
                $("#videowrap").addClass("st-video");
                $("#playlist").addClass("st-window-playlist");

                $("#st-controls-container").removeClass("st-window-default");

                windows.init();
                settings.set("active", true, true)
            },

            disable: function() {
                if (!settings.get("active"))
                    return;

                const maltweaks = settings.get('maltweaks');

                if (!maltweaks)
                    $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();

                $("#chatpane").removeClass("st-chat");
                $("#videowrap").removeClass("st-video");
                $("#playlist").removeClass("st-window-playlist");

                $("#st-stylesheet").remove();

                if (maltweaks) //patch, fixes wrong sized header
                    $(".wrapper #dyn_header iframe").css({ "height": "140px" });

                settings.set("active", false, true)
            },

            run: function() {
                this.state = !this.state;

                if (this.state)
                    this.enable();

                if (!this.state && $(".st-window-default")[0])
                    this.disable();
            },
        },

        time: {
            run: function() {
                if (!$(".me")[0]) //not logged in
                    return;

                $("#st-info-time > span").text($(".me > .berrytweaks-localtime").text());
            }
        }
    },


    patches: {
        namewrap: {
            deps: [
                ["SmidqeTweaks", "active"],
                ['BerryTweaks', "videoTitle"],
                ['SmidqeTweaks', 'videoname'],
            ],

            enable: () => {
                $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
                $("#st-videotitle-window").addClass("active");
            },

            disable: () => {
                $("#berrytweaks-video_title").unwrap();
            },

            run: function() {
                const setting = settings.get("videoname");

                if (setting && !($("st-videotitle-window")[0])) //prevents stacking
                    this.enable();

                if (!setting && $("st-videotitle-window")[0])
                    this.disable();
            }
        }
    },

    run: function(tweak) {
        if (tweak.deps) {
            var found = 0;

            $.each(tweak.deps, dep => {
                var search = null;
                switch (dep[0]) {
                    case "SmidqeTweaks":
                        search = settings;
                        break;
                    case "BerryTweaks":
                        search = JSON.parse(localStorage.Berrytweaks).enabled;
                        break;
                    case "MalTweaks":
                        search = JSON.parse(localStorage.MT);
                        break;
                }

                found += search[dep[1]] ? 1 : 0;
            })

            console.log("ST: Deps found: " + found + "out of: " + deps.length);

            if (found != deps.length) {
                console.log("ST: Deps not found for: " + tweak.id);
                return;
            }
        }
        console.log("Running tweak");
        tweak.run();
    },

    runGroup: function(group) {
        $.each(group, tweak => tweaksv2.run(tweaksv2[tweak]));
    },

    runAll: function() {
        const parent = this;

        $.each(this, elem => {
            if ($.isFunction(elem))
                return;

            parent.runGroup(elem);
        })
    },

    get: function(group, tweak) {
        return this[group][tweak];
    }
}

var windows = {
    previous: null,

    values: {
        rules: {
            paths: ["#motdwrap", "#st-wrap-motd"]
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
            classes: ["st-window-playlist", "st-window-overlap"],
        },
        users: {
            paths: ["#chatlist"],
            classes: ["st-window-users"],
        },

        //sorry toast, but you don't get anything :(
        toast: {},
    },

    toggle: function(key) {
        if (key !== this.previous)
            $(".st-window-open").removeClass("st-window-open");

        const window = this.values[key];
        var path = null;

        if (window.paths.length == 2)
            path = window.paths[settings.get("maltweaks") ? 0 : 1];
        else
            path = window.paths[0];

        $(path).toggleClass("st-window-open");

        this.previous = key;
    },

    getPath: function(window) {
        if (!window || !window.paths)
            return;

        if (window.paths.length == 2)
            return window.paths[settings.get("maltweaks") ? 0 : 1];
        else
            return window.paths[0];
    },

    init: function() {
        const values = this.values
        const self = this;

        $.each(values, key => {
            if ($.isEmptyObject(values[key]))
                return;

            const element = $(self.getPath(values[key]))
            const obj = values[key];

            if (obj.classes)
                $.each(obj.classes, i => element.addClass(obj.classes[i]));

            element.addClass("st-window-default");
        });
    }
}

var toolbar = {
    buttons: {
        tweaks: {
            text: "T",
            tooltip: "Toggle tweaks",
            func: () => { tweaksv2.run(tweaksv2.layout.tweaks) },
            id: "active"
        },

        video: {
            text: "V",
            tooltip: "Toggle video",
            func: () => { tweaksv2.run(tweaksv2.video) },
            id: "video"
        },
    },

    create: function() {
        const bar = $("<div>", { id: "st-toolbar-wrap" })
        const buttons = this.buttons;

        $.each(buttons, function(btn) {
            const obj = $("<div>", {
                    class: "st-button-control",
                    id: "st-button-control-" + btn,
                    text: buttons[btn].text,
                    'data-key': btn,
                })
                .click(function() {
                    $(this).toggleClass("active");

                    buttons[btn].func();
                })

            if (!settings.get("active") && btn !== "tweaks")
                obj.addClass("hidden");

            if (settings.get(buttons[btn].id))
                obj.addClass("active");

            bar.append(obj);
        });

        $("#chatControls").append(bar);
    }
}

var bottom = {
    buttons: {
        about: {
            func: () => {
                window.open("http://berrytube.tv/about.php", "_blank");
            }
        },

        settings: {
            func: () => {
                showConfigMenu(true);
            }
        },

        header: {
            func: () => { windows.toggle("header") }
        },

        footer: {
            func: () => { windows.toggle("footer") }
        },

        rules: {
            func: () => { windows.toggle("rules") }
        },

        polls: {
            func: () => { windows.toggle("polls") }
        },

        messages: {
            func: () => { windows.toggle("messages") }
        },

        login: {
            func: () => { windows.toggle("login") }
        },

        playlist: {
            func: () => {
                windows.toggle("playlist")
                smartRefreshScrollbar();
                scrollToPlEntry(Math.max($(".overview > ul > .active").index() - 2, 0));
                realignPosHelper();
            },
        },

        users: { func: () => { windows.toggle("users") } },

        toast: {
            func: () => {
                toggle(); //lel
            }
        },
    },

    create: function() {
        const buttons = this.buttons;
        const btns = $('<div>', { class: "st-buttons-container" });

        this.container = $("<div>", { id: "st-controls-container", class: "st-controls-wrap st-window-default" });
        this.container.append(btns);

        $.each(buttons, (key) => {
            if ($.isFunction(buttons[key])) //skip funcs
                return;

            btns.append($('<button>', {
                    class: 'st-button st-window-default',
                    id: "st-button-" + key,
                    'data-key': key,
                    text: key
                })
                .click(() => {
                    buttons[key].func();
                }))
        })

        this.container.append($("<div>", { id: "st-container-info", class: "st-grid" })
            .append($("<div>", { id: "st-info-time", class: "st-grid-block", text: "Time: " }).append($("<span>")))
            .append($("<div>", { id: "st-info-users", class: "st-grid-block", text: "Users: " }).append($("<span>")))
            .append($("<div>", { id: "st-info-drinks-group" })
                .append($("<div>", { id: "st-info-drinks", class: "st-grid-block", text: "Drinks: " }).append($("<span>")))
                .append($("$<div>", { id: "st-info-dpm", class: "st-grid-block", text: "DPM: " }).append($("<span>")))));

        $("body").append(this.container);
    },
}

const listeners = {
    time: {
        path: "#chatlist > ul",
        config: { childList: true, attributes: true, characterData: true, subtree: true }, //config for the observer
        observer: null,
        disconnect: false,
        monitor: "all",
        callback(mutation) {
            $("#st-info-time > span").text($(".me > .berrytweaks-localtime").text());
        },
    },

    body: {
        path: "body",
        config: { childList: true },
        observer: null,
        monitor: "added",
        callback(mutation) {
            if (mutation.className === "dialogWindow ui-draggable")
                settings.show();

            if (mutation.id === "headwrap") {
                clearTimeout(startTimer);
                settings.set("maltweaks", true, true);
            }

            if (settings.get("active") && settings.get("maltweaks") && !tweaksv2.layout.tweaks.state)
                tweaksv2.run(tweaksv2.get("layout", "tweaks"));
        },
    },

    berrytweaks: {
        path: "head",
        config: { childList: true },
        observer: null,
        monitor: "added",
        callback(mutation) {
            if ($("head > script").attr('src').indexOf("atte.fi") !== -1)
                settings.set("berrytweaks", true, true);
        },
    },

    drinks: {
        path: "#drinkWrap",
        config: {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        },
        observer: null,
        monitor: "all",
        callback(mutation) {
            $("#st-info-drinks > span").text($("#drinkCounter").text());
            $("#st-info-dpm > span").text($(".dpmCounter").text().substring(5))
        },
    },

    messages: {
        path: "#mailMessageDiv",
        config: { childList: true },
        observer: null,
        monitor: "added",
        callback(mutation) {
            $("#st-button-messages").addClass("st-button-changed");
        },
    },

    users: {
        path: "#connectedCount",
        config: {
            childList: true
        },
        observer: null,
        monitor: "added",
        callback(mutation) {
            $("#st-info-users > span").text($("#connectedCount").text())
        },
    },

    polls: {
        path: "#pollpane",
        config: { childList: true, attributes: true, characterData: true, subtree: true },
        observer: null,
        monitor: "all",
        callback(mutation) {
            tweaksv2.runGroup("polls");
        }
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

        const node = $(obs.path)[0];

        obs.observer.observe(node, obs.config);
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

function init() {
    settings.load();

    //this is for the loading if nothing is showing up don't load unnecessary tweaks or wrong tweaks
    settings.set("maltweaks", false, false);
    settings.set("berrytweaks", false, false);

    //add minimum css for the chatcontrol buttons
    $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

    toolbar.create();
    bottom.create();

    //start timer for enabling the layout incase we don't have maltweaks
    startTimer = setTimeout(() => {
        if (settings.get("active"))
            tweaksv2.run(tweaksv2.get("layout", "tweaks"));
    }, 5000)

    listeners.loadAll(true);

    $("#st-info-users > span").text($("#connectedCount").text())
    $("#st-info-time > span").text(":(");

    //doesn't hurt to have checks here already
    if ($("#headwrap")[0])
        settings.set("maltweaks", true, true);

    if ($("head > link").attr('href').indexOf("atte.fi") !== -1)
        settings.set("berrytweaks", true, true);
}

init();