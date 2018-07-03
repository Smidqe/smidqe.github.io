/*
    Rework this to 
*/
function load() {
    const self = {
        meta: {
            name: 'usercount',
            group: 'scripts',
            requires: ['chat', 'windows', 'menu', 'stats'],
        },
        config: {
            group: 'chat',
            values: [{
                title: 'Track usercounts in stats window',
                key: 'usercount',
                depends: ['layout']
            }]
        },
        chat: null,
        stats: null,
        enabled: false,
        update: () => {
            self.stats.update('users', self.chat.usercount());

            $.each(self.reduce(), (key, amount) => {
                self.stats.update(key, amount);
            });
        },
        show: () => {
            self.windows.show({modular: true, name: 'usercount', show: true});
        },
        enable: () => {
            self.update();
            self.chat.patch('handleNumCount', self.update);
        },
        disable: () => {
            self.chat.unpatch('handleNumCount', self.update);
        },
        reduce: () => {
            let result = {};

            $.each(self.chat.users(), (index, user) => {
                if (!result[user.group])
                    result[user.group] = 0;

                result[user.group] += 1;
            });

            return result;
        },
        init: () => {
            self.chat = SmidqeTweaks.get('chat');
            self.stats = SmidqeTweaks.get('stats');

            self.stats.add('block', {
                id: 'usercount'
            });

            self.stats.add('pair', {
                id: 'users',
                title: 'Usercount',
                block: 'usercount'
            });

            $.each(self.reduce(), (key, amount) => {
                self.stats.add('pair', {
                    id: key,
                    title: key[0].toUpperCase() + key.slice(1),
                    block: 'usercount'
                });
            });
        }
    };

    return self;
}
SmidqeTweaks.add(load());
