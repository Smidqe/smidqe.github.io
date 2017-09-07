/*
    TODO:
    - Remove the grid part and move the necessary data into infobox
        - All the data will be there
        - 
    - Remove the drink handling from here and move those into scripts
        - showDrinks.js
    
    - Rename this into bottombar, and move it to the /modules/
        -
*/

function load() {
    const self = {
        bar: {},
        requires: ['time'],
        grids: {
            time: {
                group: false,
                ids: ['time'],
                titles: ['Time: '],
            },
            users: {
                group: false,
                ids: ['users'],
                titles: ['Users: '],
            },
            drinks: {
                group: true,
                ids: ['drinks', 'dpm'],
                titles: ['Drinks: ', 'DPM: '],
            },
        },
        buttons: {
            about: {
                window: false,
                callbacks: {
                    click: () => { window.open("http://berrytube.tv/about.php", "_blank") }
                },
            },
            settings: {
                window: false,
                callbacks: {
                    click: () => { showConfigMenu(true); }
                },
            },
            header: {
                window: true,
                callbacks: {}
            },
            footer: {
                window: true,
                callbacks: {}
            },
            rules: {
                window: true,
                callbacks: {}
            },
            polls: {
                window: true,
                callbacks: {}
            },
            messages: {
                window: true,
                callbacks: {
                    click: () => {
                        $("#st-button-messages").removeClass("st-button-changed");
                    }
                },
            },
            login: {
                window: true,
                callbacks: {}
            },
            playlist: {
                window: true,
                callbacks: {
                    click: () => {
                        smartRefreshScrollbar();
                        scrollToPlEntry(Math.max($(".overview > ul > .active").index() - 2), 0);
                        realignPosHelper();
                    }
                }
            },
            users: {
                window: true,
                callbacks: {}
            },
            toast: {
                window: false,
                callbacks: {
                    click: () => {
                        toggle();
                    }
                },
            },
        },
        createButton: (key, data) => {
            const button = $('<button>', {
                class: 'st-button st-window-default',
                id: 'st-button-' + key,
                key: key,
                window: data.window,
                text: (key[0].toUpperCase() + key.slice(1)),
            })

            //these are always there
            if (data.window)
                button.on('click', function() {
                    SmidqeTweaks.getModule('windows', 'layout').toggle($(this).attr('key'));
                })

            $.each(data.callbacks, (key, value) => {
                button.on(key, value);
            })

            self.bar.buttons.append(button)
        },
        createGridBlock: (key, data) => {
            const group = $('<div>', { id: 'st-info-group-' + key });

            $.each(data.ids, (index, value) => {
                const element = $('<div>', { id: 'st-info-' + value, class: 'st-grid-block', text: data.titles[index] }).append($("<span>"));

                if (data.group)
                    group.append(element);
                else
                    self.bar.grid.append(element);
            })

            if (data.group)
                self.bar.grid.append(group);
        },
        enable: () => {
            $(self.bar.container).removeClass('st-window-default');
        },
        disable: () => {
            $(self.bar.container).addClass('st-window-default');
        },
        updateDrinks: (data) => {
            const elem = $("#st-info-drinks > span");

            //if NaN then just show many, because the default message is too long and breaks the layout
            if (isNaN(data))
                elem.text("Many")
            else
                elem.text(data);
        },
        init: () => {
            self.bar.buttons = $('<div>', { class: "st-buttons-container" });
            self.bar.container = $("<div>", { id: "st-controls-container", class: "st-controls-wrap st-window-default" });
            self.bar.grid = $("<div>", { id: "st-container-info", class: "st-grid" });

            self.bar.container.append(self.bar.buttons);
            self.bar.container.append(self.bar.grid);

            $.each(self.buttons, (key, value) => {
                self.createButton(key, value);
            })

            $.each(self.grids, (key, value) => {
                self.createGridBlock(key, value);
            })

            $('body').append(self.bar.container);

            //initialize some of the blocks with the data
            $("#st-info-time > span").text(SmidqeTweaks.modules.time.get());
            $("#st-info-users > span").text($("#connectedCount").text());

            SmidqeTweaks.patch(window, 'handleNumCount', (data) => {
                $("#st-info-users > span").text(data.num);
            })

            //handle the drink calls
            socket.on('drinkCount', (data) => {
                self.updateDrinks(data.drinks);
            });

            setInterval(() => {
                $("#st-info-dpm > span").text($(".dpmCounter").text().substring(5));
            }, 1000);

            setInterval(() => {
                $("#st-info-time > span").text(SmidqeTweaks.modules.time.get());
            }, 60 * 1000)
        },
    }

    return self;
}

SmidqeTweaks.addModule('bottom', load(), 'layout');
