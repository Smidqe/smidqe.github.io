/*
    Future ideas:
        - squee on certain emotes
            - additionally only from certain persons
            - move this into another userscript?

        - Break the user count to groups
            -  on hover

        - copy the emote text by middle clicking the emote
            - with effects
            - to chat input (default is clipboard) 
        
        - 
        
*/
var settings = {
    categories: {
        Tweaks: {
            rcvsquee: {
                title: "Squee on RCV messages",
                type: "checkbox",
                key: "squeeRCV",
                subs: [{
                    title: "Apply highlight",
                    type: 'checkbox',
                    key: 'paintRCV'
                }]
            },
            emotecopy: {
                title: "Copy the emote by middle clicking it",
                type: 'checkbox',
                key: 'emotecopy',
            },
        },
        Layout: {
            settings: {
                title: "Hide original settings button",
                type: "checkbox",
                key: "showSettings",
                tweak: ["general", "settings"]
            },

            usergroups: {
                title: "Show usergroups",
                type: "checkbox",
                key: "showUsergroups"
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
                        title: "Volatile changes",
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
                tweak: ["debug", "showButtons"],
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

//chat related thingies
const chat = {
    //adds a message to chat
    add: (nick, text, type) => {
        var time = null;

        //get the server time from berrytweaks if it is enabled
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

        //prevent tabcomplete on non existant/wrong users
        delete CHATLIST[nick];
    },

    //gets all messages posted by one person, that are still existing in the buffer
    getFromNick: (nick) => {
        const msgs = $("." + nick);
    },

    getNicks: () => {
        //gets users from the userlist (not chatlist)
        const nodes = $(".chatlistname");
        const result = {};

        $.each(nodes, index => {
            result[$(nodes[index]).text()] = '';
        })

        return result;
    },

    getEmote: () => {
        //use an mouseevent \\hmmm
        /*
        struct: 
            {
                ids: array
            }
        */
    },
}

const debug = {
    log: (msg) => {
        if (settings.get('ircdebug'))
            chat.add('DEBUG', msg, 'act');
        else
            console.log(msg);
    }
}

const playlist = {
    duration: (str) => {
        const values = str.split(":").reverse();
        var ms = 0;

        //really shouldn't need days
        if (values.length > 3)
            return;

        $.each(values, (index) => {
            ms += Math.pow(60, index) * 1000 * parseInt(values[index])
        })

        if (isNaN(ms))
            return -1;

        return ms;
    },

    pos: (title) => {
        const elements = $("#plul > li > .title");
        var position = -1;

        $.each(elements, index => {
            if (position != -1)
                return;

            if ($(elements[index]).text() === title)
                position = index;
        })

        return position;
    },

    exists: (title) => {
        return playlist.pos(title) != -1;
    },
}

var utilities = {
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

    containsMultiple: (string, words, all, minFound) => {
        if (!string || !words)
            return false;

        var found = 0;

        for (var word in words)
            found += (string.indexOf(words[word]) !== -1) ? 1 : 0;

        if (all && found === words.length)
            return true;

        if (found >= minFound)
            return true;

        return false;
    },

    contains: (string, word) => {
        return utilities.containsMultiple(string, [word], true);
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
        },

    },

    users: {
        amount: {
            state: false,
            run: () => {
                $("#st-info-users > span").text($("#connectedCount").text())
            },
        },

        groups: {
            state: false,
            deps: [
                ['SmidqeTweaks', 'showUsergroups'],
            ],

            run: () => {
                const values = $("#connectedCountWrapper").attr('title').split("<br />");
                const element = $('<div>', { id: 'st-info-users-groups' });

                element.empty();

                $.each(values, index => {
                    if (values[index].length == 0)
                        return;

                    element.append($('<div>', { class: 'st-info-users-group' }).text(values[index]));
                })
            },
        }
    },

    debug: {
        buttons: {
            deps: [
                ['SmidqeTweaks', 'active'],
                ['SmidqeTweaks', 'showButtons']
            ],
            state: false,
            run: function() {
                this.state = !this.state;
            },
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

                if (mutation.attributeName !== "class" || $(mutation.target).hasClass("active"))
                    return;

                const timestamp = (new Date()).getTime();

                if (timestamp - this.prevTimestamp < 1000)
                    return;

                this.prevTimestamp = timestamp;

                const buttons = $(mutation.target).find(".btn:not('.close')");

                //there would be 11 buttons, 0..10
                if (buttons.length != 11)
                    return;

                var number = true;
                var value = 0;
                console.log("Amount of buttons in the poll: " + buttons.length);

                var count = 0;

                $.each(buttons, i => {
                    number = !isNaN($(buttons[i]).text());

                    if (!number)
                        return;

                    value += $(buttons[i]).text() * i;
                    count += Number($(buttons[i]).text());
                })

                if (!number)
                    return;

                const average = value / count;
                const msg = "average is " + average;

                debug.log("Poll average is: " + average);
                chat.add("Episode average", msg, 'rcv');
            },
        },

        closure: {
            id: "closure",
            prevTimestamp: 0,
            state: false,
            deps: [
                ['SmidqeTweaks', 'pollClose']
            ],
            //rewrite this one 
            run: function(mutation) {
                if (!mutation)
                    return;

                if (!mutation.oldValue)
                    return;

                if (mutation.attributeName !== "class" || $(mutation.target).hasClass("active") || $(mutation.target).hasClass('btn'))
                    return;

                if (mutation.oldValue.indexOf("active") === -1)
                    return;

                console.log(mutation);

                const timestamp = (new Date()).getTime();

                //throttle the messages
                if (timestamp - this.prevTimestamp < 1000)
                    return;

                this.prevTimestamp = timestamp;

                const msg = $(mutation.target).find(".title").text() + 'was closed';

                chat.add('Poll', msg, 'act');
            },
        },
    },

    playlist: {
        notify: {
            state: false,
            prevTimestamp: null,
            defaultTimeout: 1000,
            changes: {},
            deps: [
                ["SmidqeTweaks", "playlistNotify"]
            ],
            modify: function(change, data, sub, message) {
                const self = this;

                if (!change)
                    return;

                $.each(data, (key) => {
                    if (key === 'start')
                        return;

                    if ($.isPlainObject(change[key])) //little bit of recursion
                        self.modify(change[key], data[key], true);
                    else
                        change[key] = data[key];
                })

                if (sub)
                    return;

                if (change.timestamp)
                    change.timestamp = (new Date()).getTime();

                if (message)
                    self.message(change);

                console.log(change);
            },
            remove: function(title, message) {
                const change = this.changes[title];

                if (!change)
                    return;

                change.state.action = 'removed';

                //if we have added a non volatile video, don't announce it being removed
                if (message && !change.state.volatile)
                    this.message(change);

                delete this.changes[title];
            },
            add: function(node, action) {
                const change = {};
                const self = this;

                change.title = node.find(".title").text();
                change.livestream = playlist.duration(node.find('.time').text()) === -1;
                change.timestamp = (new Date()).getTime();
                change.position = playlist.pos(change.title);

                change.state = {
                    action: action,
                    active: node.hasClass('active'),
                    volatile: node.hasClass('volatile'),
                    changed: action === 'changed',
                }

                self.changes[change.title] = change;
            },
            message: (change) => {
                var msg = change.title;

                if (change.state.action === 'changed' && change.state.active)
                    return;

                if (change.state.volatile && !change.state.changed)
                    msg += ' (volatile)';

                switch (change.state.action) {
                    case 'added':
                        msg += ' was added to playlist';
                        break;
                    case 'removed':
                        msg += ' was removed from playlist';
                        break;
                    case 'moved':
                        msg += ' was moved';
                        break;
                    case 'changed':
                        msg += ' was changed to ' + (change.state.volatile ? 'volatile' : 'permanent');
                        break;
                }

                if (change.state.action !== 'changed' && change.state.changed)
                    msg += ' and was changed to ' + (change.state.volatile ? 'volatile' : 'permanent');

                chat.add("Playlist modification", msg, 'act');
            },
            isItem: (node) => {
                if (!node)
                    return false;

                const title = node.find(".title").text();

                if (!node.prop('tagName'))
                    return false;

                if (!node.prop("tagName").toLowerCase() === "li")
                    return false;

                if (!title)
                    return false;

                if (title.length === 0)
                    return false;

                return true;
            },
            run: function(mutation) {
                const self = this;

                if (!mutation)
                    return;

                $.each(mutation.addedNodes, (index) => {
                    if (!self.isItem($(mutation.addedNodes[index])))
                        return;

                    const node = $(mutation.addedNodes[index]);
                    const title = node.find(".title").text();

                    if (!self.changes[title])
                        self.add(node, 'added');

                    const change = self.changes[title];

                    if (change.state.action === 'removed') {
                        if (change.timeout)
                            clearTimeout(change.timeout);

                        const position = playlist.pos(change.title)

                        //only modify the things if we actually have a position (-1 means nothing is loaded yet)
                        if (position != -1)
                            self.modify(change, { position: position, state: { action: 'moved' } }, false, true)
                    }

                    if (change.state.action === "added")
                        self.message(change);

                    if (change.livestream) //fixes multiple livestreams
                        self.remove(change.title, true);
                });

                $.each(mutation.removedNodes, (index) => {
                    if (!self.isItem($(mutation.removedNodes[index])))
                        return;

                    const node = $(mutation.removedNodes[index]);
                    const title = node.find(".title").text();

                    if (!self.changes[title])
                        self.add(node, 'removed');

                    const change = self.changes[title];

                    console.log("Title: " + change.title + ", Current position: " + playlist.pos(change.title) + ", position: " + change.position);

                    if (change.state.action !== 'removed')
                        self.modify(change, { state: { action: 'removed' } }, false, false)

                    if (change.state.active || change.livestream)
                        self.remove(change.title, true);
                    else
                        change.timeout = setTimeout(() => { tweaks.playlist.notify.remove(change.title, true) }, 1000); //for possible change
                });

                const node = $(mutation.target);
                const title = node.find('.title').text();
                const change = self.changes[title];

                if (mutation.type !== "attributes" || mutation.attributeName !== "class")
                    return;

                if (!change || !self.isItem(node))
                    return;

                //check if the livestream is active, enabling the removal
                if (change.livestream && node.hasClass('active')) {
                    change.state.active = true;
                    return;
                }

                //modify the current video
                if (node.hasClass('active') && !change.timeout && !change.state.active) //need to start the timeout
                    self.modify(change, { state: { active: true } });

                //checks if we have a nonvolatile added into the playlist
                if (utilities.contains(mutation.oldValue, 'active') && change.state.active && !change.state.volatile)
                    self.remove(change.title, false);

                var changed = false;
                const timestamp = (new Date()).getTime();

                //throttle the changes (is this unnecessary?, test tomorrow)
                if (change.state.changed && (timestamp - change.timestamp < 1000))
                    return;

                //instead of checking if the node has volatile, check the old value
                if (node.hasClass('volatile') && !change.state.volatile)
                    changed = true;

                if (utilities.contains(mutation.oldValue, 'volatile') && change.state.volatile && !node.hasClass('volatile'))
                    changed = true;

                if (changed)
                    self.modify(change, { state: { action: 'changed', changed: true, volatile: node.hasClass('volatile') } }, false, true);
            },
        },
    },

    chat: {
        rcv: {
            state: false,
            deps: [
                ["SmidqeTweaks", "squeeRCV"]
            ],
            run: function(mutation) {
                if (!mutation)
                    return;

                const node = $(mutation);

                if (!node.hasClass('message'))
                    return;

                const rcv = node.hasClass("rcv");

                if (rcv)
                    window.doSqueeNotify();

                if (rcv && settings.get('paintRCV'))
                    node.addClass("highlight");
            }
        }
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
            maltweaks: false,
            state: false,
            wrap: () => {
                $('#extras, #banner, #banner + .wrapper').wrapAll('<div id="st-wrap-header"></div>');
                $('#dyn_footer').wrapAll('<div id="st-wrap-footer"></div>')
                $('#dyn_motd').wrapAll('<div id="st-wrap-motd"></div>').wrapAll('<div class="floatinner"></div>');
            },
            enable: function(data) {
                const stylesheet = $('<link id="st-stylesheet" rel="stylesheet" type="text/css" href="http://smidqe.github.io/js/berrytube/css/stweaksold.css"/>')
                const location = this.maltweaks ? $('body') : $('head');

                settings.set("active", true, true)

                location.append(stylesheet);

                if (!this.maltweaks)
                    this.wrap();

                $("#chatpane").addClass("st-chat");
                $("#videowrap").addClass("st-video");
                $("#playlist").addClass("st-window-playlist");

                $("#st-controls-container").removeClass("st-window-default");
                windows.init();
                toolbar.state("show");
                tweaks.runAllGroupsExcept(["layout", "video"])
            },

            disable: function(data) {
                if (!this.maltweaks)
                    $("#st-wrap-header, #st-wrap-footer, #st-wrap-motd").contents().unwrap();

                settings.set("active", false, true)

                $("#chatpane, #videowrap, #playlist").removeClass("st-chat st-video st-window-playlist");
                $("#st-stylesheet").remove();

                toolbar.state("hide");

                if (this.maltweaks) //patch, fixes wrong sized header when exiting from tweaks
                    $(".wrapper #dyn_header iframe").css({ "height": "140px" });
            },

            run: function(data) {
                this.maltweaks = settings.get('maltweaks');
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
        if (!this[data] || $.isFunction(this[data]))
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
            id: "active",
            toggleable: true,
        },

        video: {
            deps: [
                ["SmidqeTweaks", "active"],
                ["SmidqeTweaks", "maltweaks"],
            ],
            toggleable: true,
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
            toggleable: false,
            tooltip: "Send a ircified test message",
            func: () => {
                chat.add("ST", "This is a small test", "rcv");
            },
            id: "testMessage",
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
                    const button = buttons[btn];

                    if (button.toggleable)
                        $(this).toggleClass("active");

                    button.func();
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

    createGridBlock: (uid, newClass, text) => {
        const element = $("<div>");

        if (uid)
            element.attr('id', uid);

        if (newClass)
            element.attr('class', newClass);

        if (text)
            element.attr('text', text);

        element.append($("<span>"));

        return element;
    },

    showUsergroups: () => {

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

        //modify this to accept

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
            if (settings.get('berrytweaks'))
                return;

            if ($("head > script").attr('href').indexOf("atte.fi") !== -1)
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
            var count = $("#drinkCounter").text();
            const elem = $("#st-info-drinks > span");

            //if NaN then just show many, because the default message is too long and breaks the layout
            if (isNaN(count))
                elem.text("Many")
            else
                $("#st-info-drinks > span").text(count);

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
            tweaks.runGroup(tweaks.users);
        },
    },

    polls: {
        path: "#pollpane",
        config: { childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true },
        monitor: "all",
        callback(mutation) {
            if (mutation.target.id === "pollpane")
                return;

            tweaks.runGroup(tweaks.getGroup("polls"), mutation);
        }
    },

    chat: {
        path: "#chatbuffer",
        config: { childList: true, attributes: true, characterData: true, subtree: true },
        monitor: "added",
        callback(mutation) {
            tweaks.runGroup(tweaks.getGroup("chat"), mutation);
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
            console.log(key);

            if ($.isFunction(listeners[key])) //skip funcs
                return;

            const obs = listeners[key];
            listeners.load(obs);

            if (start)
                listeners.start(obs);
        });
    }
}

function patch(container, func, callback) {
    const original = container[func];

    if (!original)
        return;

    container[func] = function() {
        const before = original.apply(this, arguments);
        callback.apply(this, arguments);
        return before;
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
}

init();
