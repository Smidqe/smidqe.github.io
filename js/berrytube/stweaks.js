/*
    Future ideas:
        - Squee on RCV messages
        - 

    TODO:
        - Fix the playlist and polls
        - Separate the changes thingy from playlist
        
*/
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
                title: "Notify of playlist changes (WIP)",
                type: "checkbox",
                key: "playlistNotify",
                subs: [{
                        title: "Adding video",
                        type: "checkbox",
                        key: "playlistAdd",
                    },
                    {
                        title: "Removing a video",
                        type: "checkbox",
                        key: "playlistRemove"
                    },
                    {
                        title: "Moving a video",
                        type: "checkbox",
                        key: "playlistMove"
                    },
                    {
                        title: "Volatile video to non-volatile",
                        type: "checkbox",
                        key: "playlistVol"
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
                    },
                    {
                        title: "Hide custom nick",
                        type: "checkbox",
                        key: "debugHideNick"
                    }
                ],
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
                if ($(this).attr('type') === "checkbox")
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
            var time = null;

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

            delete CHATLIST[nick];
        },
    },

    getUsers: () => {
        //gets users from the userlist (not chatlist)
        const nodes = $(".chatlistname");
        const result = {};

        $.each(nodes, index => {
            result[$(nodes[index]).text()] = {};
        })

        return result;
    },

    fixChatlist: () => {
        //clears all not present names from the chatlist
        const users = utilities.getUsers();

        $.each(window.CHATLIST, (nick) => {
            if (!users[nick])
                delete window.CHATLIST[nick];
        })
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
    },
}

var tweaks = {
    general: {
        settings: {
            state: false,
            deps: [
                ["SmidqeTweaks", 'showSettings']
            ],
            run: function(data) {
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

            state: false,
            prevTimestamp: 0,
            deps: [
                ['SmidqeTweaks', 'calcAvg']
            ],
            run: function(mutation) {
                if (!mutation)
                    return;

                if (mutation.attributeName !== "class" && $(mutation.target).hasClass("active"))
                    return;

                const timestamp = (new Date()).getTime();

                if (timestamp - this.prevTimestamp < 1000)
                    return;

                this.prevTimestamp = timestamp;

                const buttons = $(mutation.target).find(".btn:not('.close')");

                //there would be 11 buttons
                if (buttons.length != 11)
                    return

                var number = true;
                var value = 0;
                var count = 0;

                $.each(buttons, i => {
                    number = !isNaN($(buttons[i]).text());

                    if (!number)
                        return;

                    value += $(buttons[i]).text() * i;
                    count += Number($(buttons[i]).text());
                })

                if (number) //if the poll really was ep poll
                    utilities.chat.add("Poll average is ", value / count, 'act')
            },
        },

        closure: {
            id: "closure",
            prevTimestamp: 0,
            state: false,
            deps: [
                ['SmidqeTweaks', 'pollClose']
            ],

            run: function(mutation) {
                if (!mutation)
                    return;

                if (mutation.attributeName === "class" && mutation.attributeOldValue.indexOf("active") != -1) {
                    const timestamp = ((new Date()).getTime());

                    if (timestamp - this.prevTimestamp < 2000)
                        return;

                    this.prevTimestamp = timestamp;
                    utilities.chat.add("ST", "Poll: " + $(mutation.target).find(".title").text() + ", closed", "act");
                }
            },
        },
    },


    /*
    change : {
        position: -1,
        timestamp: -1,
        title: null,
        node: null,
        moved: false,
        action: null,
        volatile: false,
        changed: false,
    },
    */
    playlist: {
        notify: {
            state: false,
            prevTimestamp: null,
            defaultTimeout: 1000,
            messages: [],
            changes: [], //will hold the nodes
            deps: [
                ["SmidqeTweaks", "playlistNotify"]
            ],
            get: function(title) {
                for (var i = 0; i < this.changes.length; i++)
                    if (this.changes[i].title === title)
                        return this.changes[i];

                return undefined;
            },
            exists: function(title) {
                return this.get(title) != undefined;
            },

            modify: function(title, data) {
                const change = this.get(title);

                if (!change)
                    return;

                $.each(data, (key) => {
                    change[key] = data[key];
                })

                change.timestamp = (new Date()).getTime();
            },
            add: function(mutation, action) {
                const element = {};
                const timestamp = (new Date()).getTime();
                const node = $(mutation);

                element.title = node.find(".title").text();
                element.timestamp = timestamp;
                element.position = $("#plul > li").index(node);
                element.action = action;
                element.moved = false;
                element.node = mutation;
                element.volatile = node.hasClass("volatile");
                element.changed = false;

                this.changes.push(element);
            },
            helper: (node, messages, setting, message) => {
                if (!settings.get(setting))
                    return;

                const title = node.find(".title").text();

                if (title !== "")
                    messages.push({ title: title, text: message });
            },
            message: (change) => {
                console.log(change);
                var msg = "";

                msg += change.title;
                switch (change.action) {
                    case "add":
                        {
                            msg += " was added to playlist";

                            if (change.changed)
                                msg += " and was made into permanent";

                            break;
                        }
                    case "remove":
                        {
                            if (change.volatile)
                                msg += " (volatile)"

                            msg += " was removed from playlist";
                            break;
                        }
                    case "moved":
                        msg += " was moved";

                        break;
                }

                utilities.chat.add("PLAYLIST", msg, 'act');

            },
            init: function() {
                this.clear = setInterval(() => {
                    const self = tweaks.playlist.notify;

                    var remove = [];
                    const timestamp = (new Date()).getTime();

                    $.each(self.changes, (index) => {
                        if (timestamp - self.changes[index].timestamp < self.defaultTimeout)
                            return;

                        remove.push(index);
                    })

                    for (var i = 0; i < remove.length; i++)
                        self.message(self.changes.splice(remove[i], 1)[0]);

                }, 1500);
            },
            run: function(mutation) {
                const self = this;

                if (!self.clear)
                    self.init();

                if (!mutation)
                    return;

                if (mutation.addedNodes.length > 10 || mutation.removedNodes.length > 10)
                    return;

                $.each(mutation.addedNodes, (index) => {
                    const node = $(mutation.addedNodes[index]);

                    if (!node.prop("tagName") === "li")
                        return;

                    const title = node.find(".title").text();

                    if (title.length === 0)
                        return;

                    if (!self.exists(title))
                        self.add(mutation.addedNodes[index], "add");
                    else
                        self.modify(title, {}); //update timestamp

                    if (self.exists(title)) {
                        const change = self.get(title);

                        if (change.action === "remove")
                            self.modify(title, { action: "moved", position: $("#plul > li").index(node) })
                    }
                })

                $.each(mutation.removedNodes, (index) => {
                    const node = $(mutation.removedNodes[index]);

                    if (!node.prop("tagName") === "li")
                        return;

                    const title = node.find(".title").text();

                    if (title.length === 0)
                        return;

                    if (!self.exists(title))
                        self.add(mutation.removedNodes[index], "remove");

                    if (self.exists(title))
                        self.modify(title, {}); //update the timestamp;
                })

                //check if the element was changed into volatile
                //
                /*
                const node = $(mutation.target);
                const prevValue = mutation.attributeOldValue;
                const title = node.find(".title").text();

                if (node.prop("tagName") === "li" && !node.hasClass("volatile") && prevValue) {
                    if (prevValue.indexOf("volatile") !== -1)
                        self.modify(title, { volatile: false })
                }
                */
            },
        },
    },

    video: {
        state: false,
        deps: [
            ["MalTweaks", "state", "video"]
        ],
        run: function(data) {
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
            enable: function(data) {
                const maltweaks = settings.get("maltweaks");
                const stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaks.css"/>')
                const location = maltweaks ? $('body') : $('head');

                settings.set("active", true, true)

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
                toolbar.state("show");
                tweaks.runAllGroupsExcept(["layout", "video"])
            },

            disable: function(data) {
                const maltweaks = settings.get('maltweaks');

                if (!maltweaks)
                    $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();

                settings.set("active", false, true)

                $("#chatpane").removeClass("st-chat");
                $("#videowrap").removeClass("st-video");
                $("#playlist").removeClass("st-window-playlist");

                $("#st-stylesheet").remove();
                toolbar.state("hide");
                if (maltweaks) //patch, fixes wrong sized header
                    $(".wrapper #dyn_header iframe").css({ "height": "140px" });
            },

            run: function(data) {
                this.state = !this.state;

                if (this.state)
                    this.enable(data);

                if (!this.state && $(".st-window-default")[0])
                    this.disable(data);
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
                $("#berrytweaks-video_title").wrap($("<div>", { id: "st-videotitle-window" }));
                $("#st-videotitle-window").addClass("active");

                $(".st-window-users").addClass("wrap");
            },

            disable: () => {
                $("#berrytweaks-video_title").unwrap();
                $(".st-window-users").removeClass("wrap");
            },

            run: function(data) {
                this.state = settings.get("namewrap");

                if (this.state)
                    this.enable();
                else
                    this.disable();
            }
        }
    },

    run: function(tweak, data) {
        if (!tweak)
            return;

        //only check deps upon starting it
        if (!tweak.state && !utilities.deps.check(tweak.deps))
            return;

        tweak.run(data);
    },

    runGroup: function(group, data) {
        const parent = this;

        $.each(group, tweak => {
            parent.run(group[tweak], data);
        });
    },

    runAllGroupsExcept: function(exclude, data) {
        const parent = this;
        $.each(this, elem => {
            if (exclude.includes(elem))
                return;

            if ($.isFunction(parent[elem]))
                return;

            parent.runGroup(parent[elem], data);
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

            if (btn !== "tweaks")
                obj.addClass("hidden");

            if (settings.get(buttons[btn].id))
                obj.addClass("active");

            bar.append(obj);
        });

        $("#chatControls").append(bar);
    },

    state: function(state) {
        const buttons = this.buttons;

        $.each(buttons, btn => {
            const element = $("#st-button-control-" + btn);

            if (element.attr('data-key') === "tweaks")
                return;

            if (state === "show" && utilities.deps.check(buttons[btn].deps))
                element.removeClass("hidden");

            if (state === "hide")
                element.addClass("hidden");
        })
    },
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
                tweaks.run(tweaks.get({ group: "layout", tweak: "tweaks" }), mutation);
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

    usercount: {
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

            tweaks.runGroup(tweaks.getGroup("polls"), mutation);
        }
    },

    playlist: {
        path: "#plul",
        config: { childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true },
        monitor: "all",
        callback(mutation) {
            tweaks.run(tweaks.playlist.notify, mutation);
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

    //create the toolbar and bottom buttons
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

    //removes nonexistant users from chatlist (prevents false squees)
    setInterval(() => {
        utilities.fixChatlist();
    }, 1000);
}

init();