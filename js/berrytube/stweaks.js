var startTimer = null;
var settings = {
    categories: {
        Tweaks: {
            settings: {
                title: "Hide original settings button",
                type: "checkbox",
                key: "showSettings",
                tweak: ["general", "settings"]
            },
        },
        Polls: {
            average: {
                title: "Calculate poll average",
                type: "checkbox",
                key: "calcAvg",
            },

            closure: {
                title: "Notify when poll closes",
                type: "checkbox",
                key: "pollClose",
            },
        },
        Playlist: {
            changes: {
                title: "Notify of playlist changes",
                type: "checkbox",
                key: "calcAvg",
                subs: [{
                        title: "Adding video",
                        type: "checkbox",
                        key: "notifyAdd",
                    },
                    {
                        title: "Removing a video",
                        type: "checkbox",
                        key: "notifyRemove"
                    },
                    {
                        title: "Moving a video",
                        type: "checkbox",
                        key: "notifyMove"
                    },
                    {
                        title: "Volatile video to non-volatile",
                        type: "checkbox",
                        key: "notifyVol"
                    },
                ],
            },
        },
        BerryTweaks: {
            namewrap: {
                title: "Move videoname to a separate line",
                type: "checkbox",
                key: "namewrap",
                tweak: ["berrytweaks", "wrap"]
            }
        },
        Debug: {
            logging: {
                title: "Enable debugging",
                type: "checkbox",
                key: "debug",
                subs: [{
                    title: "As chat messages",
                    type: "checkbox",
                    key: "ircdebug",
                }],
            },
        },
    },

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

    createSetting: function(data, sub) {
        const wrap = $('<div>', { class: 'st-settings-wrap' }).append($('<label>', { text: data.title }));

        const element = $('<input>', {
                type: data.type,
                checked: settings.get(data.key),
                'data-key': data.key,
            })
            .change(function() {
                settings.set($(this).attr('data-key'), !!$(this).prop('checked'), true);

                if ($(this).attr('tweak'))
                    tweaks.run(tweaks.get({ group: $(this).attr('group'), tweak: $(this).attr('tweak') }));
            })

        if (data.tweak)
            element.attr("group", data.tweak[0]).attr("tweak", data.tweak[1]);

        if (sub)
            wrap.addClass('st-setting-sub');

        return wrap.append(element);
    },

    show: function() {
        var cont = this.container;

        if (!cont)
            cont = $('<fieldset>');

        cont.empty();
        cont.append($('<legend>', { text: 'SmidqeTweaks' }));

        const cats = this.categories;

        for (var key in cats) {
            const cat = cats[key];

            const group = $('<div>', {
                class: 'st-settings-category'
            }).append($("<label>", {
                text: key
            }));

            cont.append(group);

            for (var item in cat) {
                const obj = cat[item];

                group.append(this.createSetting(obj, false));

                if (obj.subs)
                    $.each(obj.subs, val => {
                        group.append(this.createSetting(obj.subs[val], true));
                    })
            }
        }

        $("#settingsGui > ul").append($('<li>').append(cont));
    }
};

var utilities = {
    chat: {
        add: function(nick, text, type) {
            var time = undefined;

            if (settings.get("berrytweaks"))
                time = BerryTweaks.getServerTime();
            else
                time = new Date();

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
                    timestamp: time,
                },

                ghost: false,
            }, "#chatbuffer");
        },
    },

    debug: {
        log: (msg, test) => {
            if (settings.get("debugIRC"))
                utilities.chat.add("Debug", msg, "act");
            else
                console.log("ST_DEBUG: " + msg);
        }
    },

    deps: {
        check: (deps) => {
            var found = 0;

            if (!deps)
                return true;

            $.each(deps, dep => {
                const obj = deps[dep];
                var search = null;

                switch (obj[0]) {
                    case "SmidqeTweaks":
                        search = settings.storage;
                        break;
                    case "BerryTweaks":
                        search = JSON.parse(localStorage.BerryTweaks).enabled;
                        break;
                    case "MalTweaks":
                        search = JSON.parse(localStorage.MT);
                        break;
                }

                if (obj[0] !== "MalTweaks")
                    found += search[obj[1]] ? 1 : 0;
                else
                    found += search[obj[1]][obj[2]] ? 1 : 0;
            })

            return found == deps.length;
        }
    }
}

var tweaks = {
    general: {
        settings: {
            state: false,
            deps: [
                ["SmidqeTweaks", 'showSettings']
            ],
            run: function() {
                this.state = settings.get('showSettings');

                const element = $(".settings");

                if (this.state)
                    element.addClass("hidden");
                else
                    element.removeClass("hidden");
            }
        }
    },

    polls: {
        average: {
            node: null,
            state: false,
            deps: [
                ['SmidqeTweaks', 'calcAvg']
            ],
            run: function() {
                //if the poll has ten buttons
                if ($(".poll:first-child .btn:not('.close')").length == 10 && this.node == null)
                    this.node = $(".poll:first-child");

                if (this.node == null)
                    return;

                if (this.node.hasClass("active")) //check if we have a active poll
                    return;

                const buttons = this.node.find(".btn:not('.close')");

                var number = true;
                var value = 0;
                var count = 0;

                $.each(btns, i => {
                    number = !isNaN($(btns[i]).text());

                    if (!number)
                        return;

                    value += $(btns[i]).text() * i;
                    count += Number($(btns[i]).text());
                })

                if (!number)
                    return;

                this.node = null;
                utilities.chat.add("ST", this.setting.msg + ": " + value / count, this.setting.type)
            },

            setting: {
                msg: "Poll average",
                type: "act",
            },
        },

        closure: {
            id: "closure",
            state: false,
            deps: [
                ['SmidqeTweaks', 'pollClose']
            ],

            run: (mutation) => {
                if (mutation.attributeName === "class" && !$(mutation.target).hasClass("active"))
                    utilities.chat.add("ST", "Poll closed", "act");
            },

            setting: {
                msg: "",
                type: "act",
            }
        },
    },

    playlist: {
        //this could be split into multiple tweaks,
        //but would require multiple listeners :(
        notify: {
            state: false,
            deps: [
                ["SmidqeTweaks", "playlistNotify"]
            ],
            run: (mutation) => {
                if (!settings.get("playlistNotify"))
                    return;

                /*
                title
                time
                */

                //volatile videos have 'volatile' class

                if (settings.get("playlistAdd")) {
                    $.each(mutation.addedNodes, (elem) => {
                        //grab the title from the 
                        const element = mutation.addedNodes[elem];

                        if (!element)
                            return;

                        const title = $(element).find(".title").text();

                        utilities.chat.add("ST", title + " was added to the playlist")
                    })
                }

                if (settings.get("playlistDelete")) {
                    $.each(mutation.removedNodes, (val) => {
                        const element = mutation.removedNodes[val];

                        if (!element)
                            return;

                        const title = $(element).find(".title").text();

                        if ($(element).hasClass("volatile"))
                            return;

                        utilities.chat.add("ST", title + " was removed from the playlist")
                    })
                }

                if (settings.get("playlistVolatile")) {

                }
                /*
                    Will notify of changes happening to playlist, these are:
                        - Removal of a video
                        - Adding a video (non vol or other)
                        - Moving a video
                        - Making a video to non-vol

                        (Now playing is berrytweaks thing)
                 */

            },
        }
    },

    video: {
        state: false,
        deps: [
            ["MalTweaks", "state", "video"]
        ],

        run: function() {
            if (this.state)
                MT.restoreLocalPlayer();
            else
                MT.disablePlayer();

            this.state = !this.state;
        }
    },

    layout: {
        tweaks: {
            id: "tweaks",
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
                toolbar.show();
                tweaks.runAllGroupsExcept(["layout", "video"])

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

                toolbar.hide();

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
            id: "time",
            state: false,
            run: function() {
                if (!$(".me")[0]) //not logged in
                    return;

                $("#st-info-time > span").text($(".me > .berrytweaks-localtime").text());
            }
        }
    },


    berrytweaks: {
        wrap: {
            id: "namewrap",
            state: false,
            deps: [
                ["SmidqeTweaks", "active"],
                ['BerryTweaks', "videoTitle"],
                ['SmidqeTweaks', 'namewrap'],
            ],

            enable: () => {
                if ($("#st-videotitle-window")[0])
                    return;

                $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
                $("#st-videotitle-window").addClass("active");

                $(".st-window-users").addClass("wrap");

            },

            disable: () => {
                if (!$("#st-videotitle-window")[0]) //do not run if it doesn't exist in the first place
                    return;

                $("#berrytweaks-video_title").unwrap();
                $(".st-window-users").removeClass("wrap");
            },

            run: function() {
                if (!settings.get("berrytweaks"))
                    return;
                this.state = settings.get("namewrap");



                if (this.state)
                    this.enable();
                else
                    this.disable();
            }
        }
    },

    run: function(tweak) {
        if (!tweak)
            return;

        //only check deps upon starting it
        if (!tweak.state && !utilities.deps.check(tweak.deps))
            return;

        tweak.run();
    },

    runGroup: function(group) {
        const parent = this;

        $.each(group, tweak => {
            parent.run(group[tweak]);
        });
    },

    runAllGroupsExcept: function(exclude) {
        const parent = this;
        $.each(this, elem => {
            if (exclude.includes(elem))
                return;

            if ($.isFunction(parent[elem]))
                return;

            parent.runGroup(parent[elem]);
        })
    },

    getGroup: function(data) {
        if (!this[data] || $.isFunction[this[data]])
            return undefined;

        return this[data];
    },

    get: function(data) {
        const group = this.getGroup(data.group)

        if (!data.tweak)
            return group;

        return group[data.tweak];
    },
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
    //TODO: do deps
    buttons: {
        tweaks: {
            text: "T",
            tooltip: "Toggle tweaks",
            func: () => {
                tweaks.run(tweaks.layout.tweaks);
            },
            id: "active"
        },

        video: {
            deps: [
                ["SmidqeTweaks", "active"],
                ["SmidqeTweaks", "maltweaks"],
            ],
            text: "V",
            tooltip: "Toggle video",
            func: () => { tweaks.run(tweaks.video) },
            id: "video"
        },

        message: {
            text: "M",
            deps: [
                ["SmidqeTweaks", "active"],
                ["SmidqeTweaks", "debug"],
            ],
            tooltip: "Send a ircified test message",
            func: () => {
                utilities.chat.add("ST", "This is a small test", "act");
            },
            id: "testMessage",
        },

        poll: {
            text: "P",
            deps: [
                ["SmidqeTweaks", "active"],
                ["SmidqeTweaks", "debug"],
            ],
            tooltip: "Test out poll average",
            func: () => {
                utilities.chat.add("ST", "Testing poll average", "act");
                tweaks.run(tweaks.get({ group: "polls", tweak: "average" }));
            },
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

            obj.attr('title', buttons[btn].tooltip);

            if (!utilities.deps.check(buttons[btn].deps) && btn !== "tweaks")
                obj.addClass("hidden");

            if (settings.get(buttons[btn].id))
                obj.addClass("active");

            bar.append(obj);
        });

        $("#chatControls").append(bar);
    },

    toggle: (data) => {
        if (data.refresh)
            console.log("");
    },

    hide: function() {
        const buttons = this.buttons;

        $.each(buttons, (btn) => {
            const element = $("#st-button-control-" + btn);

            if (element.attr('data-key') === "tweaks")
                return;

            if (utilities.deps.check(buttons[btn].deps))
                element.addClass("hidden");
        })
    },

    show: function() {
        const buttons = this.buttons;

        $.each(buttons, (btn) => {
            const element = $("#st-button-control-" + btn);

            if (element.attr('data-key') === "tweaks")
                return;

            if (utilities.deps.check(buttons[btn].deps))
                element.removeClass("hidden");
        })
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
            func: () => {
                windows.toggle("messages");
                $("#st-button-messages").removeClass("st-button-changed");
            }
        },

        login: {
            func: () => { windows.toggle("login") }
        },

        playlist: {
            func: () => {
                windows.toggle("playlist")
                smartRefreshScrollbar();

                const index = Math.max($(".overview > ul > .active").index() - 2);

                if (settings.get('debug'))
                    utilities.debug.log("Current active video's index: " + index);

                scrollToPlEntry(index, 0);
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
        monitor: "all",
        callback(mutation) {
            tweaks.run(tweaks.layout.time);
        },
    },

    body: {
        path: "body",
        config: { childList: true },
        monitor: "added",
        callback(mutation) {
            if (mutation.className === "dialogWindow ui-draggable")
                settings.show();

            if (mutation.id === "headwrap" && settings.get("active") && settings.get("maltweaks") && !tweaks.layout.tweaks.state)
                tweaks.run(tweaks.get({ group: "layout", tweak: "tweaks" }));
        },
    },

    berrytweaks: { //if there will be more than one use for this, change the name
        path: "head",
        config: { childList: true },
        monitor: "added",
        callback(mutation) {
            if (($("head > script").attr('src').indexOf("atte.fi") !== -1) && !settings.get("berrytweaks"))
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
        monitor: "all",
        callback(mutation) {
            $("#st-info-drinks > span").text($("#drinkCounter").text());
            $("#st-info-dpm > span").text($(".dpmCounter").text().substring(5))
        },
    },

    messages: {
        path: "#mailMessageDiv",
        config: { childList: true },
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
        monitor: "added",
        callback(mutation) {
            $("#st-info-users > span").text($("#connectedCount").text())
        },
    },

    polls: {
        path: "#pollpane",
        config: { childList: true, attributes: true, characterData: true, subtree: true },
        monitor: "all",
        callback(mutation) {
            if (mutation.target.id === "pollpane")
                return;

            tweaks.runGroup(tweaks.getGroup("polls"));
        }
    },

    playlist: {
        path: "#playlist",
        config: { childList: true, attributes: true, characterData: true, subtree: true },
        monitor: "all",
        callback(mutation) {
            console.log(mutation);
            console.log(mutation.addedNodes);
            console.log(mutation.removedNodes);
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

    wait: function(obs) {
        var id = setInterval(func, 500, obs);

        function func(obs) {
            if (!$(obs.path)[0])
                return;

            clearInterval(id);
            listeners.start(obs);
        }
    },

    start: function(obs) {
        if (!obs.observer)
            return;

        const element = $(obs.path)[0];

        if (!element)
            this.wait(obs);
        else
            obs.observer.observe(element, obs.config);
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

    //only exception, just makes the video button active by default
    settings.set("video", true, true);

    //add minimum css for the chatcontrol buttons and perhaps for something else
    $('head').append($('<link id="st-stylesheet-min" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks-min.css"/>'))

    toolbar.create();
    bottom.create();

    //set the active as false just incase, 
    if (!settings.get("active"))
        settings.set("active", false, true);

    //we have maltweaks :P
    if ($("body > script")[0])
        settings.set("maltweaks", $("body > script").attr('src').indexOf("MalTweaks") !== -1, true)

    $("head > link").each(function() {
        if (settings.get("berrytweaks"))
            return;

        if ($(this).attr("href").indexOf("atte.fi"))
            settings.set("berrytweaks", true, true)
    });

    listeners.loadAll(true);

    $("#st-info-users > span").text($("#connectedCount").text())
    $("#st-info-time > span").text(":(");

    if (!settings.get("maltweaks") && settings.get("active"))
        tweaks.run(tweaks.layout.tweaks);
}

init();