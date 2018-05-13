/*
    Rework this to 
*/
function load() {
    const self = {
        meta: {
            name: 'usercount',
            group: 'scripts',
            requires: ['chat', 'windows', 'menu'],
        },
        config: {
            group: 'chat',
            values: [{
                title: 'Show usercounts in the titlebar in userlist window',
                key: 'usercount',
                depends: ['layout']
            }]
        },
        chat: null,
        windows: null,
        menu: null,
        enabled: false,
        container: null,
        update: () => {
            $.each(self.chat.usercount(), (key, val) => {
                self.container.find('#st-count-' + key + ' .st-count-value').text(val);
            })
        },
        show: () => {
            self.windows.show({modular: true, name: 'usercount', show: true})
        },
        enable: () => {
            self.enabled = true;
            self.update();
            
            SmidqeTweaks.patch({container: {obj: window, name: 'usercount'}, name: 'handleNumCount', callback: self.update})
        },
        disable: () => {
            self.enabled = false;
            SmidqeTweaks.unpatch({container: 'usercount', name: 'handleNumCount', callback: self.update});
        },
        //create the listeners
        init: () => {
            self.chat = SmidqeTweaks.get('modules', 'chat');
            self.windows = SmidqeTweaks.get('modules', 'windows');
            self.container = $('<div>', {id: 'st-users-container'})
            self.menu = SmidqeTweaks.get('modules', 'menu');

            self.windows.create({
                id: 'usercount',
                wrap: false,
                classes: ['st-window-container-usercount'],
            })

            $.each(self.chat.usercount(), (key, val) => {
                let element = $('<div>', {id: 'st-count-' + key});
                let title = $('<div>').append(
                    $('<span>', {class: 'st-count-title', text: key[0].toUpperCase() + key.slice(1) + ': '}),
                    $('<span>', {class: 'st-count-value', text: val})
                )                

                self.container.append(element.append(title));
            })

            self.windows.get('usercount').append(self.container);

            self.menu.add({
                id: 'usercount',
                group: 'usercount',
                title: 'Show usercounts',
                callbacks: {
                    click: self.show
                }
            })
        }
    }

    return self;
}
SmidqeTweaks.add(load())
