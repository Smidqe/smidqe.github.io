/*
    This is a custom made menu for the toast themes, eventually will be integrated into SmidqeTweaks (or not)
    Reason why this will exist is the way vanilla toastThemes gui looks, it's horrible. No offense meant Toastdeib if you ever read this

    buttons
        - random
        - ?!

    container
        - tabs
        - container
            - list
        - buttons (Side or bottom \\rarhmm)
            -     
    
*/
function load() {
    const self = {
        groups: ['official', 'mainpony', 'background', 'nonpony', 'fourthparty'],
        container: null,
        themes: { //never again I copy paste these, next time I'll make a script
            //official group
            'BerryTube': {grp: 'official', path: ''},
            'LunaTube': {grp: 'official', path: 'css/colors-woona.css'},
            'PinkieTube': {grp: 'official', path: 'https://radio.berrytube.tv/themes/pinkietube.css'},
            'CelestiaTube': {grp: 'official', path: 'https://radio.berrytube.tv/themes/celestiatube.css'},
            'FeastTube': {grp: 'official', path: 'css/colors-appleoosans.css'},
            'HolidayTube': {grp: 'official', path: 'css/colors-holiday.css'},

            //main pony group
            'ScootaTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=scoots'},
            'DashieTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=dashie'},
            'ApocalypseTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=apocalypse'},
            'SockTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=sock'},
            'CMCTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=cmc'},
            'RarityTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=rarity'},
            'AppleTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=apple'},
            'SparkleTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=sparkle'},
            'FlutterTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=flutter'},
            'PinkieTube2': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=pinkie'},
            '420BlazeItTube': {grp: 'mainpony', path: 'plugins/toastthemes/cdncss.php?theme=blazeit'},
            
            //bgponygroup
            'WoonaTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=woona'},
            'Octav3Tub3': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=octav3'},
            'TomTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=tom'},
            'DerpyToob': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=derpy'},
            'TwistTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=twist'},
            'ToothpasteTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=toothpaste'},
            'DeskFuckTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=deskfuck'},
            'FancyTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=fancy'},
            'TeiTheTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=tei'},
            'BirthdayTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=birthday'},
            'StPatrickTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=paddy'},
            'SeaprincessyTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=seapony'},
            'OctaviaTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=octavia'},
            'PFBTDOR': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=pfbtdor'},
            'VagrantTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=vagrant'},
            'ShippingTube': {grp: 'background', path: 'plugins/toastthemes/cdncss.php?theme=shipping'},

            //nonpony
            'ToastTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=toast'},
            'AttorneyTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=attorney'},
            'EarTubes': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=ear'},
            'TubeSock': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=tubesock'},
            'SlamTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=slam'},
            'AmericaTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=america'},
            'NeonTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=neon'},
            'BufferTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=buffer'},
            'SynchTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=synch'},
            'BeeTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=bee'},
            'PokeTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=pokemon'},
            'SpoopyTube': {grp: 'nonpony', path: 'plugins/toastthemes/cdncss.php?theme=spoopy'},

            //fourthparty
            'RedTube': {grp: 'fourthparty', path: 'https://s3.amazonaws.com/Berrytube/Soviet+Style/berry-soviet.css'},
            'ToxinTube': {grp: 'fourthparty', path: 'https://radio.berrytube.tv/themes/toxintube/toxintube.css'},
            'SunsetTube': {grp: 'fourthparty', path: 'https://radio.berrytube.tv/themes/sunsettube/sunsettube.css'},
            'CooksTube': {grp: 'fourthparty', path: 'https://radio.berrytube.tv/themes/cookstube.css'},
        },
        show: function () {
            let tab = $(this).data('grp') || 'official';

            self.container.find('[id*=st-toast-button-]')
                .css('display', 'none')
                .filter((index, elem) => $(elem).data('group') === tab)
                .css('display', 'block');
        },
        change: function () {
            let theme = self.themes[$(this).data('key')];

            if (theme)
                setColorTheme(theme.path, false);
        },
        settings: () => {
            $('body').dialogWindow({
                title: 'tt settings by smidqe',
                uid: 'ttst',
                center: true,
            }).append(
                $('#settingsContainer').clone()
            );
        },
        effects: () => {
            $('body').dialogWindow({
                title: 'tt effects by smidqe',
                uid: 'tteff',
                center: true,
            }).append(
                $('#effectsContainer').clone()
            ); 
        },
        open: () => {
            self.container.draggable({
                handle: '#st-toast-titlebar',
                start: () => {
                    $('#videowrap').css('pointer-events', 'none');
                },
                stop: () => {
                    $('#videowrap').css('pointer-events', 'all');
                },
                containment: 'window'
            });

            self.container.removeClass('st-window-hidden');
            self.show();
        },
        close: () => {
            self.container.addClass('st-window-hidden');
        },
        random: () => {
            let keys = Object.keys(self.themes);
            let index = Math.floor(keys.length * Math.random());

            setColorTheme(self.themes[index].path, false);
        },
        unknown: () => {
            
        },
        add: (name, path, group) => {
            
        },
        create: () => {
            self.container = $('<div>', {id: 'st-toast-menu', class: 'st-window-hidden'})
                .append(
                    $('<div>', {id: 'st-toast-titlebar'})
                        .append(
                            $('<div>', {id: 'st-toast-exit'}).on('click', self.close)
                        ),
                    $('<div>', {id: 'st-toast-tabs'})
                        .append(
                            $('<label>', {class: 'st-toast-label', text: 'Groups'}),
                            self.groups.map(
                                (grp) => $('<button>', {id: 'st-toast-tab-' + grp, class: 'st-toast-tab st-toast-button', text: grp[0].toUpperCase() + grp.slice(1), 'data-grp': grp}).on('click', self.show)
                            )
                        ),

                    $('<div>', {id: 'st-toast-container'})
                        .append(
                            $('<label>', {class: 'st-toast-label', text: 'Themes'}),
                            $('<div>', {id: 'st-toast-buttons'})
                                .append(
                                    $.map(self.themes, (data, key) => {
                                        return $('<button>', {text: key, id: 'st-toast-button-' + key.toLowerCase(), class: 'st-toast-button', 'data-group': data.grp, 'data-key': key}).on('click', self.change);
                                    })
                                ),
                            $('<label>', {class: 'st-toast-label', text: 'Controls'}),
                            $('<div>', {id: 'st-toast-controls'})
                                .append(
                                    $('<button>', {id: 'st-toast-settings', text: 'Settings'}).on('click', self.settings),
                                    $('<button>', {id: 'st-toast-effects', text: 'Effects'}).on('click', self.effects),
                                    $('<button>', {id: 'st-toast-something', text: '?!'}).on('click', self.unknown),
                                    $('<button>', {id: 'st-toast-random', text: 'Random'}).on('click', self.random)
                                )
                        )
                );

            $('body').append(self.container);
        },
        init: () => {
            $('head').append(
                $('<link id="st-toast-stylesheet" rel="stylesheet" type="text/css" href="https://localhost/smidqetweaks/css/toastMenu.css"/>'),
                $('<link id="st-toast-fontawesome" rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">')
            );

            window.whenExists('#chatControls', () => {
                $('#chatControls').append(
                    $('<i id="st-toast-control" class="fas fa-lg fa-pencil-alt"></i>').on('click', self.open)
                );
            });

            self.create();
        }
    };

    return self;
}

window.ToastMenu = load();
window.ToastMenu.init();
