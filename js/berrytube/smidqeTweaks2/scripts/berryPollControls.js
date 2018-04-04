function load() {
	const self = {
		meta: {
			name: 'berryPollControls',
			group: 'scripts',
			requires: ['windows']
		},
		settings: {
			group: 'poll',
			values: [{
				title: 'Open poll controls to separate window when given berry',
				key: 'berryPollControls',
				depends: ['layout']
			}]
		},
		modularize: () => {
			self.windows.modularize('pollControls', window.LEADER);
			self.windows.show('pollControls', window.LEADER);
		},
		enable: () => {
			self.enabled = true;

			self.windows.create({
				id: 'pollControls',
				wrap: true,
				selector: '#pollControl',
				title: 'Poll Controls',
				classes: [],
			})

			socket.on('handleACL', self.modularize);
		},
		disable: () => {
			self.enabled = false;
			socket.removeListener('handleACL', self.modularize);
		},
		init: () => {
			self.windows = SmidqeTweaks.get('windows', 'modules');
		}
	}

	return self;
}

SmidqeTweaks.add(load());
