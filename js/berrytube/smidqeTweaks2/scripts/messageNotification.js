function load() {
	const self = {
		meta: {
			name: 'messageNotification',
			group: 'scripts',
			requires: ['settings', 'stats']
		},
		config: {

		},
		update: () => {
			$.each(self.values, () => {

			});
		},
		enable: () => {

		},
		disable: () => {

		},
		init: () => {

		}
	};

	return self;
}

SmidqeTweaks.add(load());
