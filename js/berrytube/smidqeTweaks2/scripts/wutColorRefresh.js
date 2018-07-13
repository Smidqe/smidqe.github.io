function load() {
	const self = {
		meta: {
			name: 'wutColorRefresh',
			group: 'scripts',
			requires: ['utilities', 'windows']
		},
		config: {
			group: 'patches',
			values: [{
				key: 'wutColorRefresh',
				title: 'Move wutColors refresh button to titlebar',
				depends: ['layout', 'wutcolors']
			}],
		},
		original: null,
		element: null,
		windows: null,
		move: () => {
			self.utilities.waitFor('#wutColorRefresh', () => {
				SmidqeTweaks.get('windows').get('users').find('.st-titlebar').append($('#wutColorRefresh'));
			});
		},
		remove: () => {
			self.original.append($('#wutColorRefresh'));
		},
		enable: () => {
            SmidqeTweaks.patch({
				container: {obj: SmidqeTweaks.scripts.layout, name: 'wcr'},
				name: 'prepare',
				after: true,
                callback: self.move,
			});

            SmidqeTweaks.patch({
				container: {obj: SmidqeTweaks.scripts.layout, name: 'wcr'},
				name: 'unprepare',
				after: true,
				callback: self.remove
            });

			if (SmidqeTweaks.get('settings').get('layout'))
				self.utilities.waitFor('#st-window-container-users > .st-titlebar', self.move);
		},
		disable: () => {
			if ($('#wutColorRefresh').parent().attr('id') !== 'chatlist')
				self.remove();

			SmidqeTweaks.unpatch({
                container: 'wcr',
                name: 'prepare',
                callback: self.move
            });

            SmidqeTweaks.unpatch({
                container: 'wcr',
                name: 'unprepare',
                callback: self.remove
            });
		},
		init: () => {
			self.utilities = SmidqeTweaks.get('utilities');
			self.original = $('#chatlist');
		}
	};

	return self;
}

SmidqeTweaks.add(load());
