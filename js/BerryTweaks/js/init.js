window.BerryTweaks = (function(){
'use strict';

const self = {
    categories: [
        {
            title: 'Chat view',
            configs: ['convertUnits', 'smoothenWut', 'ircifyTitles', 'ircify']
        },
        {
            title: 'User list',
            configs: ['userMaps', 'showLocaltimes', 'globalFlairs', 'flags']
        },
        {
            title: 'Video',
            configs: ['autoshowVideo', 'videoTitle']
        },
        {
            title: 'Other',
            configs: ['requestCheck', 'sortComplete', 'sync', 'linkOpener', 'rawSquees', 'squeeSound'],
        },
        {
            title: 'Nitpicking',
            configs: ['stripes', 'hideLoggedin', 'squeeVolume', 'resetFlair']
        },
        {
            title: 'Mod stuff',
            configs: ['tabHighlight', 'ctrlTab',/* 'queueDrop',*/ 'ircifyModlog', 'queuePlaylist'],
            minType: 2
        },
        {
            title: 'Always enabled',
            configs: ['escClose', 'settingsFix', 'noReferrer', 'onEuro', 'fixDialogs'],
            hidden: true
        }
    ],
    configTitles: {
        convertUnits: "Convert measurements",
        smoothenWut: "Smoothen wutColors",
        ircifyTitles: "Show video changes",
        ircify: "Show joins/parts",

        userMaps: "Show map in user dialog",
        showLocaltimes: "Show users' local times",
        globalFlairs: "Show flairs",
        flags: "Show flags",

        autoshowVideo: "Expand MalTweaks video during volatiles",
        videoTitle: "Show video title in chat toolbar",

        requestCheck: "Check requests for country restrictions",
        sortComplete: "Sort tab completion based on squees",
        sync: "Sync squees and PEP stars",
        linkOpener: "Open links automatically",
        rawSquees: "Unlimited squee editor",
        squeeSound: "Custom squee sound",

        stripes: "Stripe messages (requires theme support)",
        hideLoggedin: 'Hide extra "Logged in as" label',
        squeeVolume: "Customize notification volumes",
        resetFlair: "Reset flair on page load",

        tabHighlight: "Highlight chat tabs with new messages",
        ctrlTab: "Cycle chat tabs with Ctrl + Tab",
        queueDrop: "Drag 'n drop links into queue",
        ircifyModlog: "Show mod log in chat",
        queuePlaylist: "Playlist queuing",

        escClose: "Close dialogs with Esc",
        settingsFix: "Make settings dialog scrollable",
        noReferrer: "Circumvent hotlink protection on links",
        onEuro: "Fix AltGr when using BerryMotes",
        fixDialogs: "Fix various dialog behaviors"
    },
    deprecatedModules: ['escClose', 'settingsFix', 'noReferrer', 'esc'],
    modules: {},
    lib: {},
    libWaiters: {},
    timeDiff: 0,
    getServerTime() {
        return Date.now() + self.timeDiff;
    },
    dialogDOM: null,
    dialog(text) {
        self.dialogDOM.text(text).dialog({
            modal: true,
            buttons: [
                {
                    text: 'Ok',
                    click() {
                        $(this).dialog('close');
                    }
                }
            ]
        });
    },
    confirm(text, callback) {
        self.dialogDOM.text(text).dialog({
            modal: true,
            buttons: [
                {
                    text: 'Ok',
                    click() {
                        $(this).dialog('close');
                        callback(true);
                    }
                },
                {
                    text: 'Cancel',
                    click() {
                        $(this).dialog('close');
                        callback(false);
                    }
                }
            ]
        });
    },
    patch(container, name, callback, before) {
        const original = container[name] || function(){/* noop */};

        if ( before ){
            container[name] = function(){
                if ( callback.apply(this, arguments) !== false )
                    return original.apply(this, arguments);
                return undefined;
            };
        }
        else{
            container[name] = function(){
                const retu = original.apply(this, arguments);
                callback.apply(this, arguments);
                return retu;
            };
        }
    },
    loadCSS(name) {
        $('<link>', {
            'data-berrytweaks_module': name,
            rel: 'stylesheet',
            href: /^https?:/.test(name) ? name : `https://atte.fi/berrytweaks/css/${name}.css`
        }).appendTo(document.head);
    },
    unloadCSS(name) {
        $(`link[data-berrytweaks_module=${name}]`).remove();
    },
    loadSettings() {
        return $.extend(true, {
            enabled: {}
        }, JSON.parse(localStorage['BerryTweaks'] || '{}'));
    },
    saveSettings(settings) {
        localStorage['BerryTweaks'] = JSON.stringify(settings);
        self.applySettings();
        self.updateSettingsGUI();
    },
    getSetting(key, defaultValue) {
        const val = self.loadSettings()[key];
        return val === undefined ? defaultValue : val;
    },
    setSetting(key, val) {
        const settings = self.loadSettings();
        settings[key] = val;
        self.saveSettings(settings);
    },
    applySettings() {
        $.each(self.loadSettings().enabled, (key, val) => {
            if ( val )
                self.enableModule(key);
            else
                self.disableModule(key);
        });
    },
    loadLibs(names, callback) {
        names = names.filter(name => !self.lib[name]);

        let left = names.length;
        if ( left === 0 ){
            callback();
            return;
        }

        const after = function(){
            if ( --left == 0 )
                callback();
        };

        names.forEach(name => {
            if ( !self.libWaiters[name] ){
                self.libWaiters[name] = [after];

                const isAbsolute = name.indexOf('://') !== -1;
                $.getScript(isAbsolute ? name : `https://atte.fi/berrytweaks/js/lib/${name}.js`, () => {
                    if ( isAbsolute )
                        self.lib[name] = true;

                    self.libWaiters[name].forEach(fn => {
                        fn();
                    });
                    delete self.libWaiters[name];
                });
            }
            else
                self.libWaiters[name].push(after);
        });
    },
    enableModule(name) {
        if ( !self.configTitles.hasOwnProperty(name) || self.deprecatedModules.indexOf(name) !== -1 )
            return;

        const mod = self.modules[name];
        if ( mod ){
            if ( mod.enabled )
                return;

            if ( mod.css )
                self.loadCSS(name);

            mod.enabled = true;

            if ( mod.enable )
                mod.enable();

            if ( mod.addSettings )
                self.updateSettingsGUI();

            return;
        }

        $.getScript(`https://atte.fi/berrytweaks/js/${name}.js`, () => {
            const mod = self.modules[name];
            if ( !mod )
                return;

            if ( mod.libs ){
                self.loadLibs(mod.libs, () => {
                    self.enableModule(name);
                });
            }
            else
                self.enableModule(name);
        });
    },
    disableModule(name) {
        if ( !self.configTitles.hasOwnProperty(name) )
            return;

        const mod = self.modules[name];
        if ( mod ){
            if ( !mod.enabled )
                return;

            mod.enabled = false;

            if ( mod.disable )
                mod.disable();

            if ( mod.css )
                self.unloadCSS(name);
        }
    },
    reloadModule(name) {
        self.disableModule(name);
        delete self.modules[name];
        self.enableModule(name);
    },
    fixWindowHeight(win) {
        if ( !win || win.data('berrytweaked') )
            return;

        const height = Math.min(
            win.height() + 20,
            $(window).height() - (win.offset().top - $(window).scrollTop()) - 20
        );

        win.css({
            'overflow-y': 'scroll',
            'max-height': height
        });

        win.data('berrytweaked', true);
    },
    fixWindowPosition(dialogContent) {
        if ( !dialogContent )
            return;

        const dialogWindow = dialogContent.parents('.dialogWindow');
        if ( !dialogWindow || !dialogWindow.length )
            return;

        const diaMargin = 8;
        const offset = dialogWindow.offset();
        const diaSize = {
            height: dialogWindow.height() + diaMargin,
            width: dialogWindow.width() + diaMargin
        };

        const win = $(window);
        const scroll = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        const winSize = {
            height: win.height(),
            width: win.width()
        };

        if ( offset.top + diaSize.height > scroll.top + winSize.height )
            offset.top = scroll.top + winSize.height - diaSize.height;

        if ( offset.left + diaSize.width > scroll.left + winSize.width )
            offset.left = scroll.left + winSize.width - diaSize.width;

        dialogWindow.offset(offset);
    },
    settingsContainer: null,
    updateSettingsGUI() {
        if ( !self.settingsContainer )
            return;

        const win = self.settingsContainer.parents('.dialogContent');
        if ( !win )
            return;

        self.fixWindowHeight(win);

        const settings = self.loadSettings();
        const scroll = win.scrollTop();
        self.settingsContainer.empty();

        // title
        self.settingsContainer.append(
            $('<legend>', {
                text: 'BerryTweaks'
            })
        );

        // basic toggles
        self.settingsContainer.append.apply(self.settingsContainer,
            self.categories.map(cat => {
                if ( cat.hidden )
                    return null;
                if ( cat.minType !== undefined && window.TYPE < cat.minType )
                    return null;
                return [$('<label>', {
                    class: 'berrytweaks-module-category',
                    text: cat.title
                })].concat(cat.configs.map(function(key){
                    const label = self.configTitles[key];
                    if ( !label )
                        return null;

                    return $('<div>', {
                        class: 'berrytweaks-module-toggle-wrapper',
                        'data-key': key
                    }).append(
                        $('<label>', {
                            for: 'berrytweaks-module-toggle-' + key,
                            text: label + ': '
                        })
                    ).append(
                        $('<input>', {
                            id: 'berrytweaks-module-toggle-' + key,
                            type: 'checkbox',
                            checked: !!settings.enabled[key]
                        }).change(function(){
                            const settings = self.loadSettings();
                            settings.enabled[key] = !!$(this).prop('checked');
                            self.saveSettings(settings);
                        })
                    );
                }));
            })
        );

        // mod specific
        $.each(self.modules, (key, mod) => {
            if ( !mod.addSettings )
                return;

            mod.addSettings(
                $('<div>', {
                    class: 'berrytweaks-module-settings',
                    'data-key': key
                }).insertAfter(
                    $(`.berrytweaks-module-toggle-wrapper[data-key=${key}]`, self.settingsContainer)
                )
            );
        });

        win.scrollTop(scroll);
    },
    onEsc(e) {
        if ( e.which !== 27 )
            return;

        // async in case the dialog is doing stuff on keydown
        setTimeout(() => {
            const wins = $(document.body).data('windows');
            if ( !wins || wins.length === 0 ){
                // MalTweaks header/motd/footer
                $('.floatinner:visible').last().next('.mtclose').click();
                return;
            }

            wins[wins.length-1].close();
        }, 0);
    },
    onEuro(e) {
        if ( window.Bem && e.ctrlKey && (e.altKey || e.shiftKey) && (
                e.keyCode === 69 ||
                (Bem.drunkMode && (e.keyCode === 87 || e.keyCode === 82))
            )
        ){
            e.stopImmediatePropagation();
            const bemWin = $('.dialogWindow.berrymotes');
            if ( bemWin[0] ){
                bemWin.remove();
                if ( Bem.lastFocus )
                    Bem.lastFocus.focus();
            }
        }
    },
    noreferrer(_to) {
        $('a[rel!="noopener noreferrer"]', _to).attr("rel", "noopener noreferrer");
    },
    init() {
        self.dialogDOM = $('<div>', {
            title: 'BerryTweaks',
            class: 'berrytweaks-dialog'
        }).hide().appendTo(document.body);

        self.patch(window, 'showConfigMenu', () => {
            self.settingsContainer = $('<fieldset>');
            $('#settingsGui > ul').append(
                $('<li>').append(
                    self.settingsContainer
                )
            );

            self.updateSettingsGUI();
        });

        self.patch(window, 'showPluginWindow', () => {
            self.fixWindowHeight($('.pluginNode').parents('.dialogContent'));
        });

        self.patch(window, 'addChatMsg', (data, _to) => {
            self.noreferrer(_to);
        });

        self.patch(window, 'showEditNote', () => {
            const area = $('.dialogWindow .controlWindow textarea');
            area.attr('rows', 20);
            self.fixWindowHeight(area.parents('.dialogContent'));
        });

        self.patch(window, 'showUserActions', () => {
            setTimeout(() => {
                self.fixWindowPosition($('#userOps').parents('.dialogContent'));
            }, 200 + 100); // dialog fade-in
        });

        self.patch(window, 'handleACL', () => {
            if ( window.MT )
                window.MT.fixPlaylistHeight();
        });

        setTimeout(() => {
            self.patch(window, 'addChatMsg', (data, _to) => {
                if ( data && data.msg && data.msg.timestamp )
                    self.timeDiff = new Date(data.msg.timestamp) - new Date();
            });
            if ( window.MT )
                window.MT.fixPlaylistHeight();
        }, 5000);

        whenExists('#chatbuffer', el => {
            self.noreferrer(el);
        });

        $(document).on('keydown', self.onEsc);
        $(window).on('keydown', self.onEuro);

        self.loadCSS('init');
        self.applySettings();
    }
};

return self;

})();

$(BerryTweaks.init);
